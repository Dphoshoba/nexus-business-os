
import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, User, Bot, Loader2, Lightbulb, TrendingUp, Calendar as CalIcon, DollarSign, Mic, MicOff, X, Volume2 } from 'lucide-react';
import { ChatMessage } from '../types';
import { sendMessageToGemini } from '../services/gemini';
import { Card, Button, Input, Badge } from '../components/ui/Primitives';
import { useData } from '../context/DataContext';
import { useNotifications } from '../components/ui/NotificationSystem';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';

// --- Audio Utils for Gemini Live ---
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

function createBlob(data: Float32Array): any {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}

export const Assistant: React.FC = () => {
  const { deals, contacts, invoices, appointments, userProfile, consumeAiCredit } = useData();
  const { addNotification } = useNotifications();
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'model', content: `Hello ${userProfile.firstName}! I have access to your CRM, Calendar, and Financial data. How can I help you optimize your business today?`, timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // --- Voice Mode State ---
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState<'connecting' | 'listening' | 'speaking' | 'error'>('connecting');
  const [audioVolume, setAudioVolume] = useState(0); // For visualizer
  
  // Refs for Voice Mode
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const liveSessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const inputSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopVoiceMode();
    };
  }, []);

  // Helper to serialize current app state for the AI
  const getContextData = () => {
      const summary = {
          userName: userProfile.firstName,
          activeDeals: deals.map(d => `${d.title} (${d.company}): $${d.value} [${d.stage}]`),
          overdueInvoices: invoices.filter(i => i.status === 'Overdue').map(i => `${i.client}: $${i.amount}`),
          todaysSchedule: appointments.filter(a => a.date === 'Today').map(a => `${a.time}: ${a.type} with ${a.clientName}`),
          financialSummary: {
              totalRevenue: invoices.filter(i => i.status === 'Paid').reduce((acc, i) => acc + i.amount, 0),
              pendingRevenue: invoices.filter(i => i.status === 'Pending').reduce((acc, i) => acc + i.amount, 0),
          }
      };
      return JSON.stringify(summary, null, 2);
  };

  // --- Text Chat Handler ---
  const handleSend = async (textOverride?: string) => {
    const textToSend = textOverride || input;
    if (!textToSend.trim() || isLoading) return;

    // Credit Check
    if (!consumeAiCredit()) {
        addNotification({ title: 'Limit Reached', message: 'You have run out of AI credits. Please upgrade to Pro for unlimited access.', type: 'warning' });
        return;
    }

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const history = messages.map(m => ({ role: m.role, content: m.content }));
    const context = getContextData();
    
    try {
        const responseText = await sendMessageToGemini(textToSend, history, context);

        const aiMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'model',
          content: responseText,
          timestamp: new Date()
        };

        setMessages(prev => [...prev, aiMsg]);
    } catch (e) {
        addNotification({ title: 'AI Error', message: 'Failed to process request.', type: 'error' });
    } finally {
        setIsLoading(false);
    }
  };

  // --- Voice Mode Handlers ---
  const startVoiceMode = async () => {
    // Credit Check for Voice Mode
    if (!consumeAiCredit()) {
        addNotification({ title: 'Limit Reached', message: 'Voice Mode requires AI credits. Please upgrade to Pro.', type: 'warning' });
        return;
    }

    setIsVoiceActive(true);
    setVoiceStatus('connecting');
    const context = getContextData();
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextRef.current = outputAudioContext;

      // Input Processing
      const source = inputAudioContext.createMediaStreamSource(stream);
      inputSourceRef.current = source;
      const processor = inputAudioContext.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      // Visualizer logic (Input volume)
      const analyser = inputAudioContext.createAnalyser();
      source.connect(analyser);
      analyser.fftSize = 256;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      const updateVolume = () => {
        if (!isVoiceActive) return;
        analyser.getByteFrequencyData(dataArray);
        const avg = dataArray.reduce((a, b) => a + b) / bufferLength;
        setAudioVolume(avg);
        requestAnimationFrame(updateVolume);
      };
      updateVolume();

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
          },
          systemInstruction: `You are Nexus Live, an advanced business AI. You have access to the following business data: ${context}. Keep your responses concise, conversational, and helpful. Do not read out JSON raw data, interpret it naturally.`,
        },
        callbacks: {
          onopen: () => {
            console.log('Gemini Live Connected');
            setVoiceStatus('listening');
            
            processor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              sessionPromise.then(session => session.sendRealtimeInput({ media: pcmBlob }));
            };
            source.connect(processor);
            processor.connect(inputAudioContext.destination);
          },
          onmessage: async (msg: LiveServerMessage) => {
            if (msg.serverContent?.modelTurn?.parts[0]?.inlineData) {
              setVoiceStatus('speaking');
              const audioData = msg.serverContent.modelTurn.parts[0].inlineData.data;
              
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputAudioContext.currentTime);
              
              const audioBuffer = await decodeAudioData(
                decode(audioData),
                outputAudioContext,
                24000,
                1
              );
              
              const sourceNode = outputAudioContext.createBufferSource();
              sourceNode.buffer = audioBuffer;
              sourceNode.connect(outputAudioContext.destination);
              sourceNode.onended = () => {
                 sourcesRef.current.delete(sourceNode);
                 if (sourcesRef.current.size === 0) setVoiceStatus('listening');
              };
              
              sourceNode.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(sourceNode);
            }
            
            if (msg.serverContent?.interrupted) {
               sourcesRef.current.forEach(s => s.stop());
               sourcesRef.current.clear();
               nextStartTimeRef.current = 0;
               setVoiceStatus('listening');
            }
          },
          onclose: () => {
            console.log('Gemini Live Closed');
            stopVoiceMode();
          },
          onerror: (err) => {
            console.error('Gemini Live Error', err);
            setVoiceStatus('error');
          }
        }
      });
      
      liveSessionRef.current = sessionPromise;

    } catch (e) {
      console.error('Failed to start voice mode', e);
      setVoiceStatus('error');
    }
  };

  const stopVoiceMode = () => {
    setIsVoiceActive(false);
    setVoiceStatus('connecting'); // Reset for next time
    
    // Cleanup audio nodes
    if (processorRef.current) {
        processorRef.current.disconnect();
        processorRef.current.onaudioprocess = null;
    }
    if (inputSourceRef.current) {
        inputSourceRef.current.disconnect();
    }
    if (audioContextRef.current) {
        audioContextRef.current.close();
    }
    
    // Stop all playing sources
    sourcesRef.current.forEach(s => s.stop());
    sourcesRef.current.clear();
    nextStartTimeRef.current = 0;

    // Close session
    if (liveSessionRef.current) {
        liveSessionRef.current.then((s: any) => s.close());
    }
  };

  const QUICK_PROMPTS = [
      { icon: TrendingUp, label: "Analyze my pipeline", prompt: "Analyze my current deal pipeline. What are my highest value opportunities and what should I focus on?" },
      { icon: CalIcon, label: "Brief me on today", prompt: "Brief me on my schedule for today and any preparation I need for my meetings." },
      { icon: DollarSign, label: "Financial health", prompt: "What is my current financial status? Summarize paid vs pending invoices." },
  ];

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col max-w-5xl mx-auto relative">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-text-primary dark:text-text-primary-dark flex items-center justify-center gap-2">
          <Sparkles className="w-5 h-5 text-primary-500" />
          Nexus AI Assistant
        </h1>
        <p className="text-sm text-text-secondary dark:text-text-secondary-dark mt-1 max-w-md mx-auto">
          Context-aware intelligence connected to your business data.
        </p>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden shadow-soft border-border" padding="p-0">
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-surface dark:bg-surface-dark">
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`
                w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm border border-transparent
                ${msg.role === 'user' ? 'bg-text-primary dark:bg-text-primary-dark text-white dark:text-surface-dark' : 'bg-white dark:bg-surface-muted-dark border-border dark:border-border-dark text-primary-600'}
              `}>
                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div className={`
                max-w-[85%] rounded-2xl px-5 py-3.5 text-sm leading-relaxed shadow-sm whitespace-pre-wrap
                ${msg.role === 'user' 
                  ? 'bg-primary-600 text-white rounded-tr-none' 
                  : 'bg-surface-subtle dark:bg-surface-subtle-dark border border-border dark:border-border-dark text-text-primary dark:text-text-primary-dark rounded-tl-none'
                }
              `}>
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-4">
               <div className="w-8 h-8 rounded-lg bg-white dark:bg-surface-muted-dark border border-border dark:border-border-dark text-primary-600 flex items-center justify-center shrink-0 shadow-sm">
                 <Bot className="w-4 h-4" />
               </div>
               <div className="bg-surface-subtle dark:bg-surface-subtle-dark border border-border dark:border-border-dark rounded-2xl rounded-tl-none px-5 py-3.5 flex items-center">
                 <Loader2 className="w-4 h-4 text-primary-500 animate-spin" />
               </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t border-border dark:border-border-dark bg-surface dark:bg-surface-dark">
           {/* Quick Prompts */}
           {!isVoiceActive && messages.length < 3 && (
               <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
                   {QUICK_PROMPTS.map((qp, idx) => (
                       <button 
                           key={idx}
                           onClick={() => handleSend(qp.prompt)}
                           className="flex items-center gap-2 px-3 py-2 bg-surface-subtle dark:bg-surface-subtle-dark hover:bg-primary-50 dark:hover:bg-primary-900/20 border border-border dark:border-border-dark hover:border-primary-200 dark:hover:border-primary-800 rounded-lg text-xs font-medium text-text-secondary dark:text-text-secondary-dark hover:text-primary-700 dark:hover:text-primary-400 transition-colors whitespace-nowrap"
                       >
                           <qp.icon className="w-3.5 h-3.5" />
                           {qp.label}
                       </button>
                   ))}
               </div>
           )}

          <div className="relative flex items-center gap-3">
            <Button 
                onClick={startVoiceMode}
                variant="secondary"
                className="rounded-xl px-3 bg-red-50 hover:bg-red-100 text-red-600 border-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 dark:border-red-900/30 dark:text-red-400"
                title="Start Voice Session"
            >
                <Mic className="w-5 h-5" />
            </Button>
            
            <div className="flex-1 relative">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Ask about your leads, schedule, or revenue..."
                    className="w-full pl-4 pr-4 py-3 bg-surface-subtle dark:bg-surface-subtle-dark border border-border dark:border-border-dark rounded-xl text-sm focus:bg-white dark:focus:bg-surface-dark focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all text-text-primary dark:text-text-primary-dark placeholder:text-text-tertiary"
                    disabled={isLoading}
                    autoFocus
                />
            </div>
            <Button 
                onClick={() => handleSend()}
                disabled={!input.trim() || isLoading}
                size="md"
                className="rounded-xl px-4 aspect-square"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <div className="text-center mt-3 flex items-center justify-center gap-1.5 text-[10px] text-text-tertiary">
            <Lightbulb className="w-3 h-3" />
            <span>Pro tip: Use the mic for hands-free analysis.</span>
          </div>
        </div>
      </Card>

      {/* Voice Mode Overlay */}
      {isVoiceActive && (
          <div className="absolute inset-0 z-50 bg-surface/95 dark:bg-surface-dark/95 backdrop-blur-xl flex flex-col items-center justify-center animate-in fade-in duration-300 rounded-xl">
              <div className="absolute top-6 right-6">
                  <button onClick={stopVoiceMode} className="p-2 rounded-full bg-surface-muted hover:bg-red-100 text-text-secondary hover:text-red-600 transition-colors">
                      <X className="w-6 h-6" />
                  </button>
              </div>
              
              <div className="relative mb-12">
                  {/* Pulsating Orb */}
                  <div className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 ${
                      voiceStatus === 'speaking' 
                        ? 'bg-gradient-to-tr from-primary-500 to-indigo-500 shadow-[0_0_50px_rgba(99,102,241,0.5)] scale-110' 
                        : voiceStatus === 'listening' 
                            ? 'bg-gradient-to-tr from-red-500 to-orange-500 shadow-[0_0_30px_rgba(239,68,68,0.3)]'
                            : 'bg-gray-400'
                  }`}>
                      {voiceStatus === 'connecting' ? (
                          <Loader2 className="w-12 h-12 text-white animate-spin" />
                      ) : (
                          <div className="flex items-center gap-1">
                              {[1,2,3,4,5].map(i => (
                                  <div 
                                    key={i} 
                                    className="w-1.5 bg-white rounded-full transition-all duration-75"
                                    style={{ 
                                        height: voiceStatus === 'speaking' 
                                            ? `${Math.random() * 40 + 10}px` 
                                            : voiceStatus === 'listening' 
                                                ? `${Math.max(10, audioVolume * 0.5 + Math.random() * 10)}px` 
                                                : '4px'
                                    }} 
                                  />
                              ))}
                          </div>
                      )}
                  </div>
                  
                  {/* Rings animation */}
                  {voiceStatus === 'listening' && (
                      <>
                        <div className="absolute inset-0 rounded-full border-2 border-red-500/20 animate-ping" style={{ animationDuration: '2s' }}></div>
                        <div className="absolute inset-0 rounded-full border-2 border-red-500/20 animate-ping" style={{ animationDuration: '2s', animationDelay: '0.5s' }}></div>
                      </>
                  )}
              </div>

              <h2 className="text-2xl font-bold text-text-primary dark:text-text-primary-dark mb-2">
                  {voiceStatus === 'connecting' ? 'Connecting to Nexus...' : 
                   voiceStatus === 'listening' ? 'Listening...' : 
                   voiceStatus === 'speaking' ? 'Nexus is speaking' : 'Connection Error'}
              </h2>
              <p className="text-text-secondary dark:text-text-secondary-dark max-w-sm text-center">
                  {voiceStatus === 'connecting' ? 'Establishing secure voice channel.' : 
                   voiceStatus === 'listening' ? 'Go ahead, I\'m listening to your request.' : 
                   'Processing real-time business data.'}
              </p>

              <div className="mt-12 flex gap-4">
                  <div className="px-4 py-2 rounded-full bg-surface-muted dark:bg-surface-muted-dark border border-border dark:border-border-dark flex items-center gap-2 text-sm font-medium">
                      <div className={`w-2 h-2 rounded-full ${voiceStatus === 'error' ? 'bg-red-500' : 'bg-green-500 animate-pulse'}`}></div>
                      Live Connection
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
