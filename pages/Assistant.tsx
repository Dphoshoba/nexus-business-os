
import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, User, Bot, Loader2, Lightbulb, TrendingUp, Calendar as CalIcon, DollarSign, Mic, MicOff, X, Volume2, Eye, EyeOff, Camera } from 'lucide-react';
import { ChatMessage } from '../types';
import { sendMessageToGemini } from '../services/gemini';
import { Card, Button, Input, Badge } from '../components/ui/Primitives';
import { useData } from '../context/DataContext';
import { useNotifications } from '../components/ui/NotificationSystem';
import { GoogleGenAI, LiveServerMessage, Modality, Blob } from '@google/genai';

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

function createBlob(data: Float32Array): Blob {
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

async function blobToBase64(blob: globalThis.Blob): Promise<string> {
    return new Promise((resolve, _) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const result = reader.result as string;
            resolve(result.split(',')[1]);
        };
        reader.readAsDataURL(blob);
    });
}

const FRAME_RATE = 2; // 2 frames per second for visual grounding
const JPEG_QUALITY = 0.4;

export const Assistant: React.FC = () => {
  const { deals, contacts, invoices, appointments, userProfile, consumeAiCredit } = useData();
  const { addNotification } = useNotifications();
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'model', content: `Hello ${userProfile.firstName}! I have access to your CRM, Calendar, and Financial data. How can I help you optimize your business today?`, timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // --- Voice & Vision Mode State ---
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [isVisionActive, setIsVisionActive] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState<'connecting' | 'listening' | 'speaking' | 'error'>('connecting');
  const [audioVolume, setAudioVolume] = useState(0);
  
  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const liveSessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const inputSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const frameIntervalRef = useRef<number | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    return () => {
      stopVoiceMode();
    };
  }, []);

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

  const handleSend = async (textOverride?: string) => {
    const textToSend = textOverride || input;
    if (!textToSend.trim() || isLoading) return;

    if (!consumeAiCredit()) {
        addNotification({ title: 'Limit Reached', message: 'Upgrade to Pro for unlimited AI access.', type: 'warning' });
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

    try {
        const responseText = await sendMessageToGemini(textToSend, messages.map(m => ({ role: m.role, content: m.content })), getContextData());
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          role: 'model',
          content: responseText,
          timestamp: new Date()
        }]);
    } catch (e) {
        addNotification({ title: 'AI Error', message: 'Failed to process request.', type: 'error' });
    } finally {
        setIsLoading(false);
    }
  };

  const startVoiceMode = async (useVision: boolean = false) => {
    if (!consumeAiCredit()) {
        addNotification({ title: 'Limit Reached', message: 'Live Mode requires AI credits.', type: 'warning' });
        return;
    }

    setIsVoiceActive(true);
    setIsVisionActive(useVision);
    setVoiceStatus('connecting');
    const context = getContextData();
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const stream = await navigator.mediaDevices.getUserMedia({ 
          audio: true,
          video: useVision ? { width: 640, height: 480 } : false 
      });
      mediaStreamRef.current = stream;

      if (useVision && videoRef.current) {
          videoRef.current.srcObject = stream;
      }
      
      const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextRef.current = outputAudioContext;

      const source = inputAudioContext.createMediaStreamSource(stream);
      inputSourceRef.current = source;
      const processor = inputAudioContext.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      const analyser = inputAudioContext.createAnalyser();
      source.connect(analyser);
      analyser.fftSize = 256;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      const updateVolume = () => {
        if (!isVoiceActive) return;
        analyser.getByteFrequencyData(dataArray);
        setAudioVolume(dataArray.reduce((a, b) => a + b) / bufferLength);
        requestAnimationFrame(updateVolume);
      };
      updateVolume();

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
          },
          systemInstruction: `You are Echoes Vision, a physical-world-aware business AI. 
          You have access to: ${context}. 
          If Vision is enabled, I will send you video frames. You can describe whiteboards, documents, or objects I show you.`,
        },
        callbacks: {
          onopen: () => {
            setVoiceStatus('listening');
            
            processor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              sessionPromise.then(session => session.sendRealtimeInput({ media: createBlob(inputData) }));
            };
            source.connect(processor);
            processor.connect(inputAudioContext.destination);

            // Vision Loop
            if (useVision) {
                const canvas = canvasRef.current;
                const video = videoRef.current;
                if (canvas && video) {
                    const ctx = canvas.getContext('2d');
                    frameIntervalRef.current = window.setInterval(() => {
                        canvas.width = video.videoWidth;
                        canvas.height = video.videoHeight;
                        ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
                        canvas.toBlob(async (blob) => {
                            if (blob) {
                                const base64Data = await blobToBase64(blob);
                                sessionPromise.then(session => session.sendRealtimeInput({
                                    media: { data: base64Data, mimeType: 'image/jpeg' }
                                }));
                            }
                        }, 'image/jpeg', JPEG_QUALITY);
                    }, 1000 / FRAME_RATE);
                }
            }
          },
          onmessage: async (msg: LiveServerMessage) => {
            if (msg.serverContent?.modelTurn?.parts[0]?.inlineData) {
              setVoiceStatus('speaking');
              const audioData = msg.serverContent.modelTurn.parts[0].inlineData.data;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputAudioContext.currentTime);
              const audioBuffer = await decodeAudioData(decode(audioData), outputAudioContext, 24000, 1);
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
          onclose: () => stopVoiceMode(),
          onerror: () => setVoiceStatus('error')
        }
      });
      liveSessionRef.current = sessionPromise;
    } catch (e) {
      setVoiceStatus('error');
    }
  };

  const stopVoiceMode = () => {
    setIsVoiceActive(false);
    setIsVisionActive(false);
    setVoiceStatus('connecting');
    if (frameIntervalRef.current) clearInterval(frameIntervalRef.current);
    if (mediaStreamRef.current) mediaStreamRef.current.getTracks().forEach(t => t.stop());
    if (processorRef.current) { processorRef.current.disconnect(); processorRef.current.onaudioprocess = null; }
    if (inputSourceRef.current) inputSourceRef.current.disconnect();
    if (audioContextRef.current) audioContextRef.current.close();
    sourcesRef.current.forEach(s => s.stop());
    sourcesRef.current.clear();
    nextStartTimeRef.current = 0;
    if (liveSessionRef.current) liveSessionRef.current.then((s: any) => s.close());
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col max-w-5xl mx-auto relative">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-text-primary dark:text-text-primary-dark flex items-center justify-center gap-2">
          <Sparkles className="w-5 h-5 text-primary-500" />
          Neural Nerve Center
        </h1>
        <p className="text-sm text-text-secondary dark:text-text-secondary-dark mt-1 max-w-md mx-auto">
          Intelligent context connected to your business architecture.
        </p>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden shadow-2xl border-border/50 dark:border-white/5 backdrop-blur-md bg-surface/80 dark:bg-surface-dark/80" padding="p-0">
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''} animate-in fade-in slide-in-from-bottom-2`}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm border ${msg.role === 'user' ? 'bg-primary-600 text-white border-primary-500' : 'bg-white dark:bg-surface-muted-dark border-border dark:border-border-dark text-primary-600'}`}>
                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div className={`max-w-[85%] rounded-2xl px-5 py-3.5 text-sm leading-relaxed shadow-sm whitespace-pre-wrap ${msg.role === 'user' ? 'bg-primary-600 text-white rounded-tr-none' : 'bg-surface-subtle dark:bg-surface-subtle-dark border border-border dark:border-border-dark text-text-primary dark:text-text-primary-dark rounded-tl-none'}`}>
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-4 animate-pulse">
               <div className="w-8 h-8 rounded-lg bg-surface-muted dark:bg-surface-muted-dark border border-border text-primary-600 flex items-center justify-center shrink-0"><Bot className="w-4 h-4" /></div>
               <div className="bg-surface-subtle dark:bg-surface-subtle-dark border border-border rounded-2xl rounded-tl-none px-5 py-3.5"><Loader2 className="w-4 h-4 text-primary-500 animate-spin" /></div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t border-border dark:border-white/5 bg-surface dark:bg-surface-dark/50">
          <div className="relative flex items-center gap-3">
            <div className="flex gap-1">
                <Button onClick={() => startVoiceMode(false)} variant="secondary" className="rounded-xl px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border-indigo-100 dark:bg-indigo-950/30 dark:hover:bg-indigo-900/40 dark:border-indigo-900/30 dark:text-indigo-400" title="Live Voice Session">
                    <Mic className="w-5 h-5" />
                </Button>
                <Button onClick={() => startVoiceMode(true)} variant="secondary" className="rounded-xl px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border-emerald-100 dark:bg-emerald-950/30 dark:hover:bg-emerald-900/40 dark:border-emerald-900/30 dark:text-emerald-400" title="AI Vision Mode">
                    <Camera className="w-5 h-5" />
                </Button>
            </div>
            
            <div className="flex-1 relative">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Describe a vision or ask about your data..."
                    className="w-full pl-4 pr-4 py-3 bg-surface-subtle dark:bg-surface-subtle-dark border border-border dark:border-border-dark rounded-xl text-sm focus:bg-white dark:focus:bg-surface-dark focus:ring-1 focus:ring-primary-500 outline-none transition-all text-text-primary dark:text-text-primary-dark"
                    disabled={isLoading}
                    autoFocus
                />
            </div>
            <Button onClick={() => handleSend()} disabled={!input.trim() || isLoading} className="rounded-xl px-4 aspect-square"><Send className="w-4 h-4" /></Button>
          </div>
        </div>
      </Card>

      {/* Voice/Vision Mode Overlay */}
      {isVoiceActive && (
          <div className="absolute inset-0 z-[100] bg-surface/95 dark:bg-surface-dark/95 backdrop-blur-3xl flex flex-col items-center justify-center animate-in fade-in duration-500 rounded-xl border border-white/10">
              <div className="absolute top-6 right-6">
                  <button onClick={stopVoiceMode} className="p-3 rounded-full bg-white/5 hover:bg-red-500/20 text-text-tertiary hover:text-red-500 transition-all">
                      <X className="w-6 h-6" />
                  </button>
              </div>
              
              <div className="relative flex flex-col items-center w-full max-w-2xl px-6">
                  {isVisionActive ? (
                      <div className="w-full aspect-video rounded-2xl overflow-hidden border-4 border-white/10 shadow-2xl relative mb-12 group bg-black">
                          <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                          <canvas ref={canvasRef} className="hidden" />
                          <div className="absolute top-4 left-4">
                              <Badge className="bg-red-500 text-white border-none animate-pulse">LIVE VISION</Badge>
                          </div>
                          <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <p className="text-white/60 text-xs font-medium">Streaming frames to Gemini for visual analysis</p>
                          </div>
                      </div>
                  ) : (
                      <div className="relative mb-12">
                          <div className={`w-40 h-40 rounded-full flex items-center justify-center transition-all duration-500 ${voiceStatus === 'speaking' ? 'bg-gradient-to-tr from-primary-500 to-indigo-600 shadow-[0_0_80px_rgba(99,102,241,0.6)] scale-110' : voiceStatus === 'listening' ? 'bg-gradient-to-tr from-emerald-500 to-cyan-500 shadow-[0_0_40px_rgba(16,185,129,0.3)]' : 'bg-gray-800'}`}>
                              {voiceStatus === 'connecting' ? <Loader2 className="w-16 h-16 text-white animate-spin" /> : (
                                  <div className="flex items-center gap-1.5">
                                      {[1,2,3,4,5,6].map(i => (
                                          <div key={i} className="w-2 bg-white rounded-full transition-all duration-75" style={{ height: voiceStatus === 'speaking' ? `${Math.random() * 50 + 10}px` : voiceStatus === 'listening' ? `${Math.max(10, audioVolume * 0.8 + Math.random() * 15)}px` : '6px' }} />
                                      ))}
                                  </div>
                              )}
                          </div>
                          {voiceStatus === 'listening' && (
                              <div className="absolute inset-0 rounded-full border-2 border-emerald-500/20 animate-ping" style={{ animationDuration: '3s' }} />
                          )}
                      </div>
                  )}

                  <h2 className="text-3xl font-serif font-bold text-text-primary dark:text-text-primary-dark mb-3 text-center">
                      {voiceStatus === 'connecting' ? 'Establishing Neural Link...' : 
                       voiceStatus === 'listening' ? "I'm listening..." : 
                       voiceStatus === 'speaking' ? 'Echoes is speaking' : 'Transmission Error'}
                  </h2>
                  <p className="text-text-secondary dark:text-text-secondary-dark max-w-sm text-center leading-relaxed font-medium">
                      {voiceStatus === 'connecting' ? 'Syncing localized business intelligence modules.' : 
                       voiceStatus === 'listening' ? (isVisionActive ? 'Show me a document, whiteboard, or product.' : 'Go ahead, ask me anything about your operation.') : 
                       'Processing strategic recommendations.'}
                  </p>
              </div>

              <div className="mt-16 flex gap-3">
                  <div className="px-5 py-2.5 rounded-full bg-white/5 border border-white/10 flex items-center gap-2.5 text-sm font-bold tracking-wide uppercase">
                      <div className={`w-2.5 h-2.5 rounded-full ${voiceStatus === 'error' ? 'bg-red-500' : 'bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]'}`}></div>
                      Encrypted Connection
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
