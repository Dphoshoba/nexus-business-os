
import React, { useState, useMemo } from 'react';
import { 
    ArrowRight, Check, X, FileText, Globe, 
    Monitor, PlayCircle, ShieldCheck, ChevronDown, 
    Sparkles, HelpCircle, ArrowUpRight, Plus, User, 
    Calendar, Clock, Layout, MessageSquare, Download,
    Video, Sun, Zap, TrendingUp, Target, AlertCircle,
    CheckCircle2, MousePointer2, BarChart3, Users,
    Play, Activity, BrainCircuit, Shield, Rocket,
    Layers, Cpu, Workflow, Info, Lightbulb, Split,
    ChevronLeft, Loader2, DollarSign, Calculator,
    Timer, BarChart
} from 'lucide-react';
import { Badge, Card, Button, Modal, Input } from '../components/ui/Primitives';
import { useNotifications } from '../components/ui/NotificationSystem';

const Highlight = ({ children, className = "" }: { children?: React.ReactNode, className?: string }) => (
    <span className={`bg-[#D1FAE5] dark:bg-[#064E3B]/40 px-2 py-1 rounded-sm ${className}`}>
        {children}
    </span>
);

const Section = ({ children, className = "", id }: { children?: React.ReactNode, className?: string, id?: string }) => (
    <section id={id} className={`py-24 px-6 ${className}`}>
        <div className="max-w-5xl mx-auto">
            {children}
        </div>
    </section>
);

export const AuditLanding: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
    const { addNotification } = useNotifications();
    const [openFaq, setOpenFaq] = useState<number | null>(null);
    const [isAppModalOpen, setIsAppModalOpen] = useState(false);
    const [appStep, setAppStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Efficiency Calculator State
    const [teamSize, setTeamSize] = useState(10);
    const [hourlyRate, setHourlyRate] = useState(75);
    const [noiseHours, setNoiseHours] = useState(5);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        website: '',
        revenue: '100k-500k',
        challenge: '',
        contactEmail: ''
    });

    // ROI Calculations
    const roiMetrics = useMemo(() => {
        const annualLoss = teamSize * hourlyRate * noiseHours * 52;
        const potentialSavings = annualLoss * 0.45; // Assume 45% efficiency gain
        return {
            annualLoss,
            potentialSavings
        };
    }, [teamSize, hourlyRate, noiseHours]);

    const faqs = [
        {
            q: "Do I need to give account access?",
            a: "No. Screenshots, exports, or summaries are sufficient. We do not require admin access to perform this audit."
        },
        {
            q: "What if my data is incomplete?",
            a: "That's exactly what the audit identifies. We'll show you where the gaps are and how to bridge them for reliable direction."
        },
        {
            q: "Is this fully automated or AI-only?",
            a: "It's a human-led strategic engagement. We use AI to accelerate data synthesis, but every conclusion is verified by a senior strategist."
        },
        {
            q: "Can you help implement the plan?",
            a: "Yes. Post-audit, we offer modular implementation support for automations, systems, and dashboards."
        },
        {
            q: "How long does it take?",
            a: "The turnaround is approximately 7 days after your onboarding and initial materials submission is complete."
        }
    ];

    const scrollToId = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const handleApplyClick = (e?: React.MouseEvent) => {
        if(e) {
            e.preventDefault();
            e.stopPropagation();
        }
        setAppStep(1);
        setIsAppModalOpen(true);
    };

    const handleSubmitApp = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setTimeout(() => {
            setIsSubmitting(false);
            setAppStep(4); // Success step
            addNotification({
                title: "Application Received",
                message: "A senior strategist will review your business case.",
                type: "success"
            });
        }, 1500);
    };

    return (
        <div className="bg-white dark:bg-[#0B1120] min-h-screen font-sans selection:bg-[#D1FAE5] selection:text-[#065F46] overflow-x-hidden">
            {/* Header Nav */}
            <nav className="fixed top-0 w-full z-[60] bg-white/80 dark:bg-[#0B1120]/80 backdrop-blur-md border-b border-gray-100 dark:border-white/5 h-20 flex items-center px-6">
                <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        {onBack && (
                            <button type="button" onClick={onBack} className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors mr-2 cursor-pointer">
                                <ChevronLeft className="w-5 h-5 text-text-secondary" />
                            </button>
                        )}
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gray-900 dark:bg-white rounded-lg flex items-center justify-center text-white dark:text-black shadow-sm">
                                 <Sun className="w-5 h-5 fill-current" />
                            </div>
                            <span className="font-serif font-bold text-xl tracking-tight uppercase dark:text-white">Echoes & Visions</span>
                        </div>
                    </div>
                    <div className="hidden md:flex items-center gap-8 text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                        <button type="button" onClick={() => scrollToId('problem')} className="hover:text-primary-600 transition-colors uppercase cursor-pointer">The Problem</button>
                        <button type="button" onClick={() => scrollToId('roi')} className="hover:text-primary-600 transition-colors uppercase cursor-pointer">ROI Calc</button>
                        <button type="button" onClick={() => scrollToId('pricing')} className="hover:text-primary-600 transition-colors uppercase cursor-pointer">Pricing</button>
                        <button type="button" onClick={() => handleApplyClick()} className="bg-[#111827] dark:bg-white text-white dark:text-black px-6 py-2.5 rounded-full hover:opacity-90 transition-all shadow-xl text-[11px] font-bold uppercase tracking-wider cursor-pointer">Apply Now</button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <Section className="pt-48 pb-32 text-center">
                <h1 className="text-5xl md:text-8xl font-serif font-bold text-[#064E3B] dark:text-white leading-[1.05] mb-8">
                    <Highlight>Turn Business Complexity</Highlight> <br />
                    Into Clear, Confident <br />
                    Direction — <Highlight>In 7 Days</Highlight>
                </h1>
                <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 leading-relaxed max-w-4xl mx-auto mb-12">
                    Stop drowning in documents and fragmented dashboards. Our <span className="font-bold text-text-primary dark:text-white underline decoration-emerald-400 decoration-2">Business Intelligence Audit</span> synthesizes your entire operation into one high-leverage growth plan.
                </p>
                
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button 
                        type="button"
                        onClick={() => handleApplyClick()}
                        className="w-full sm:w-auto h-16 px-10 bg-[#111827] dark:bg-white text-white dark:text-black rounded-full font-bold flex items-center justify-center gap-3 hover:scale-105 transition-all shadow-2xl cursor-pointer"
                    >
                        Apply for an Audit <ArrowRight className="w-5 h-5" />
                    </button>
                    <button 
                        type="button"
                        onClick={() => scrollToId('roi')}
                        className="w-full sm:w-auto h-16 px-10 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-full font-bold text-gray-800 dark:text-white hover:bg-gray-50 transition-all cursor-pointer"
                    >
                        Calculate My ROI
                    </button>
                </div>
                
                <p className="mt-10 text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em] flex items-center justify-center gap-4 flex-wrap">
                    <span>Zero Admin Access Needed</span>
                    <span className="opacity-30">•</span>
                    <span>100% Confidential</span>
                    <span className="opacity-30">•</span>
                    <span>Strategic Outcomes</span>
                </p>
            </Section>

            {/* Efficiency Calculator Section */}
            <Section id="roi" className="bg-[#111827] text-white rounded-[4rem] my-12 overflow-hidden relative shadow-2xl">
                <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                    <Calculator className="w-96 h-96" />
                </div>
                
                <div className="relative z-10 p-10 md:p-20">
                    <div className="text-center mb-16">
                        <Badge variant="brand" className="mb-4 bg-emerald-500 text-white border-none">The Efficiency Delta</Badge>
                        <h2 className="text-4xl md:text-7xl font-serif font-bold mb-4 tracking-tight">The High Cost of <span className="text-emerald-400 italic">Complexity</span></h2>
                        <p className="text-xl text-emerald-100/60 max-w-2xl mx-auto">
                            Calculate how much fragmented data and "operational noise" is costing your business annually.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div className="space-y-12">
                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <label className="text-sm font-bold uppercase tracking-widest text-emerald-200">Team Size</label>
                                        <span className="text-xl font-bold font-mono">{teamSize} Employees</span>
                                    </div>
                                    <input 
                                        type="range" min="1" max="100" value={teamSize} 
                                        onChange={(e) => setTeamSize(Number(e.target.value))}
                                        className="w-full h-1.5 bg-white/10 rounded-full appearance-none accent-emerald-400 cursor-pointer"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <label className="text-sm font-bold uppercase tracking-widest text-emerald-200">Avg. Hourly Rate</label>
                                        <span className="text-xl font-bold font-mono">${hourlyRate}/hr</span>
                                    </div>
                                    <input 
                                        type="range" min="20" max="300" value={hourlyRate} 
                                        onChange={(e) => setHourlyRate(Number(e.target.value))}
                                        className="w-full h-1.5 bg-white/10 rounded-full appearance-none accent-emerald-400 cursor-pointer"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <label className="text-sm font-bold uppercase tracking-widest text-emerald-200">Noise (Hours/Week/Person)</label>
                                        <span className="text-xl font-bold font-mono">{noiseHours}h</span>
                                    </div>
                                    <input 
                                        type="range" min="1" max="20" value={noiseHours} 
                                        onChange={(e) => setNoiseHours(Number(e.target.value))}
                                        className="w-full h-1.5 bg-white/10 rounded-full appearance-none accent-emerald-400 cursor-pointer"
                                    />
                                    <p className="text-[10px] text-emerald-100/40 italic">Hours spent searching for info, manual reporting, and reactive meetings.</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                            <Card className="bg-white/5 border-white/10 p-10 flex flex-col items-center text-center backdrop-blur-xl">
                                <p className="text-xs font-bold uppercase tracking-[0.3em] text-red-400 mb-2">Annual Complexity Loss</p>
                                <h3 className="text-6xl font-bold tracking-tighter text-white">${roiMetrics.annualLoss.toLocaleString()}</h3>
                                <p className="text-emerald-100/40 mt-4 text-sm max-w-xs">The hidden financial drain of unstructured intelligence.</p>
                            </Card>

                            <Card className="bg-emerald-400/10 border-emerald-400/20 p-10 flex flex-col items-center text-center backdrop-blur-xl group hover:bg-emerald-400/20 transition-all cursor-default">
                                <p className="text-xs font-bold uppercase tracking-[0.3em] text-emerald-400 mb-2">Audit Optimization Gain</p>
                                <h3 className="text-6xl font-bold tracking-tighter text-emerald-400">
                                    <span className="text-white">+</span>${roiMetrics.potentialSavings.toLocaleString()}
                                </h3>
                                <p className="text-emerald-100/80 mt-4 text-sm font-medium">Estimated 45% reduction in friction after implementation.</p>
                            </Card>
                        </div>
                    </div>

                    <div className="mt-20 pt-10 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="flex items-center gap-6">
                            <div className="flex -space-x-3">
                                {[1,2,3,4].map(i => (
                                    <div key={i} className="w-10 h-10 rounded-full border-2 border-[#111827] bg-gray-700 flex items-center justify-center text-xs font-bold">U{i}</div>
                                ))}
                            </div>
                            <p className="text-sm font-medium text-emerald-100/60">Join 300+ companies optimizing their Echoes.</p>
                        </div>
                        <Button size="lg" onClick={() => handleApplyClick()} className="bg-emerald-500 hover:bg-emerald-600 px-12 shadow-xl shadow-emerald-500/20">
                            Apply to Capture This ROI
                        </Button>
                    </div>
                </div>
            </Section>

            {/* Failure/Clarity Section */}
            <Section id="problem" className="bg-[#F9FAFB] dark:bg-white/[0.01] border-y border-gray-100 dark:border-white/5">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-4xl md:text-6xl font-serif font-bold leading-tight text-gray-900 dark:text-white mb-20">
                        <Highlight>Most businesses don't fail because of a lack of effort.</Highlight> <br />
                        <span className="italic mt-4 block text-[#065F46] dark:text-emerald-400 underline decoration-emerald-300 underline-offset-[12px]">They fail because information never becomes clarity.</span>
                    </h2>

                    <div className="text-left bg-white dark:bg-[#111827] p-10 md:p-16 rounded-[3rem] shadow-sm border border-gray-100 dark:border-white/5 space-y-12">
                        <div>
                            <p className="text-xl font-bold text-gray-800 dark:text-white mb-8 border-b border-gray-100 dark:border-white/10 pb-4">Over time, leaders accumulate:</p>
                            <ul className="space-y-6 text-2xl text-gray-600 dark:text-gray-400 font-medium">
                                <li className="flex items-center gap-4">
                                    <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                                    <Highlight>Documents and reports</Highlight>
                                </li>
                                <li className="flex items-center gap-4">
                                    <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                                    <Highlight>Dashboards and spreadsheets</Highlight>
                                </li>
                                <li className="flex items-center gap-4">
                                    <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                                    <Highlight>Content, systems, and processes</Highlight>
                                </li>
                            </ul>
                        </div>
                        <p className="text-2xl leading-relaxed text-gray-500 italic border-l-4 border-emerald-400 pl-8">
                            But when everything lives in isolation, decision-making slows, priorities blur, and vision gets buried under noise.
                        </p>
                    </div>
                </div>
            </Section>

            {/* Pricing Section */}
            <Section id="pricing" className="text-center pb-40">
                <Card className="bg-[#D1FAE5] dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900 border-4 py-24 md:py-40 px-6 rounded-[6rem] shadow-sm relative overflow-hidden">
                    <Sparkles className="absolute top-10 right-10 w-32 h-32 text-emerald-400 opacity-20" />
                    <h2 className="text-4xl md:text-8xl font-serif font-bold mb-8 text-[#064E3B] dark:text-white uppercase tracking-tighter">Business Intelligence Audit</h2>
                    <div className="text-7xl md:text-[10rem] font-serif font-bold text-[#065F46] dark:text-emerald-400 mb-10 tracking-tighter">
                        $1,500 – $3,500
                    </div>
                    <Badge variant="brand" className="mb-20 bg-emerald-100 text-emerald-800 border-none px-8 py-3 rounded-full text-xl font-bold shadow-sm">
                        Pricing depends on size and complexity.
                    </Badge>

                    <div className="max-w-md mx-auto text-left space-y-10 mb-20">
                        <p className="text-gray-500 font-bold uppercase tracking-[0.4em] text-[12px] border-b border-emerald-100 dark:border-emerald-800 pb-4">Includes:</p>
                        {[
                            "Full audit & analysis",
                            "Opportunity map",
                            "30/60/90-day plan",
                            "Walkthrough video"
                        ].map((item, i) => (
                            <div key={i} className="flex gap-6 items-center text-3xl font-bold text-gray-800 dark:text-gray-200">
                                <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
                                    <Check className="w-6 h-6 text-white" strokeWidth={4} />
                                </div>
                                <span>{item}</span>
                            </div>
                        ))}
                    </div>

                    <button 
                        type="button"
                        onClick={() => handleApplyClick()}
                        className="h-24 px-20 bg-[#111827] dark:bg-white text-white dark:text-black rounded-full font-bold text-3xl hover:scale-105 transition-all shadow-[0_40px_80px_rgba(0,0,0,0.3)] cursor-pointer"
                    >
                        Apply for the Audit
                    </button>
                </Card>
            </Section>

            {/* FAQ Section */}
            <Section id="faq" className="pb-40">
                <div className="flex flex-col lg:flex-row gap-24">
                    <div className="lg:w-1/3">
                        <h2 className="text-8xl md:text-[10rem] font-serif font-bold text-gray-100 dark:text-white/5 select-none leading-none mb-10 transition-colors">FAQ</h2>
                        <div className="mt-12 p-12 bg-white dark:bg-[#111827] border border-gray-100 dark:border-white/5 rounded-[4rem] shadow-2xl">
                            <HelpCircle className="w-16 h-16 text-emerald-400 mb-8" />
                            <h4 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">Still have questions?</h4>
                            <p className="text-xl text-gray-500 leading-relaxed font-medium mb-10">Book a quick 15-minute intro call to see if the audit is right for you.</p>
                            <button 
                                type="button"
                                onClick={() => window.open('https://calendly.com', '_blank')}
                                className="w-full py-6 bg-gray-50 hover:bg-gray-100 dark:bg-white/5 dark:hover:bg-white/10 rounded-[2rem] font-bold text-xl transition-all border border-gray-100 dark:border-white/10 text-gray-900 dark:text-white flex items-center justify-center gap-3 cursor-pointer"
                            >
                                Schedule a Call <ArrowUpRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                    <div className="flex-1 space-y-10 pt-10">
                        {faqs.map((faq, i) => (
                            <div 
                                key={i} 
                                className="border-b border-gray-100 dark:border-white/5 pb-10 cursor-pointer group"
                                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                            >
                                <div className="flex items-center justify-between text-2xl md:text-4xl font-bold text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors py-4">
                                    <span className="pr-12 leading-tight">{faq.q}</span>
                                    <ChevronDown className={`w-10 h-10 transition-transform duration-500 shrink-0 ${openFaq === i ? 'rotate-180 text-primary-50' : 'text-gray-300'}`} />
                                </div>
                                {openFaq === i && (
                                    <p className="mt-10 text-2xl text-gray-500 dark:text-gray-400 leading-relaxed font-medium animate-in slide-in-from-top-6 fade-in duration-500 max-w-2xl">
                                        {faq.a}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </Section>

            {/* Ready to Restore Section - Final CTA */}
            <Section className="pb-40">
                <Card className="bg-[#111827] text-white py-40 px-12 rounded-[6rem] text-center relative overflow-hidden shadow-2xl border border-white/5">
                    <div className="relative z-10 max-w-4xl mx-auto">
                        <h2 className="text-6xl md:text-[9rem] font-serif font-bold mb-12 leading-[0.95] tracking-tighter uppercase">
                            Ready to <br /> <Highlight className="bg-emerald-400 text-black px-6 rounded-none italic">Restore Clarity?</Highlight>
                        </h2>
                        <p className="text-3xl md:text-4xl text-emerald-100/60 mb-20 leading-relaxed font-medium">
                            If you're tired of guessing and want a clear plan you can act on immediately, this engagement was built for you.
                        </p>
                        <button 
                            type="button"
                            onClick={() => handleApplyClick()}
                            className="h-28 px-16 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full font-bold text-3xl hover:scale-105 transition-all shadow-[0_30px_90px_rgba(16,185,129,0.4)] cursor-pointer"
                        >
                            Apply for the Audit
                        </button>
                    </div>
                    <Sparkles className="absolute -bottom-60 -right-60 w-[800px] h-[800px] opacity-5 pointer-events-none" />
                </Card>
            </Section>

            {/* Enhanced Conversational Application Modal */}
            <Modal isOpen={isAppModalOpen} onClose={() => setIsAppModalOpen(false)} title={`Audit Application: Step ${appStep} of 3`}>
                <div className="min-h-[400px] flex flex-col">
                    {appStep === 1 && (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl flex items-center gap-4">
                                <Sparkles className="w-8 h-8 text-emerald-600" />
                                <div>
                                    <h4 className="font-bold text-lg">Let's start with your business.</h4>
                                    <p className="text-xs text-text-secondary">Basic identity helps us research your market presence.</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest">Business Name</label>
                                    <Input placeholder="Nexus Digital Corp" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest">Website URL</label>
                                    <Input placeholder="https://nexus.com" value={formData.website} onChange={e => setFormData({...formData, website: e.target.value})} />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest">Annual Revenue Range</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {['$100k-$500k', '$500k-$2M', '$2M-$10M', '$10M+'].map(r => (
                                            <button 
                                                key={r} type="button"
                                                onClick={() => setFormData({...formData, revenue: r})}
                                                className={`p-3 rounded-lg border text-sm font-medium transition-all ${formData.revenue === r ? 'bg-primary-50 border-primary-500 text-primary-700 dark:bg-primary-900/20' : 'hover:bg-surface-muted border-border'}`}
                                            >
                                                {r}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <Button className="w-full h-14 text-lg" onClick={() => setAppStep(2)} disabled={!formData.name || !formData.website}>
                                Next Step <ArrowRight className="w-5 h-5 ml-2" />
                            </Button>
                        </div>
                    )}

                    {appStep === 2 && (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                             <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl flex items-center gap-4">
                                <Target className="w-8 h-8 text-emerald-600" />
                                <div>
                                    <h4 className="font-bold text-lg">Define the bottleneck.</h4>
                                    <p className="text-xs text-text-secondary">What's the #1 thing holding your team back?</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest">The Biggest Challenge</label>
                                    <textarea 
                                        className="w-full p-4 bg-surface dark:bg-surface-dark border border-border rounded-xl text-sm min-h-[150px] resize-none focus:ring-2 focus:ring-emerald-500/20 outline-none"
                                        placeholder="e.g. Our sales data is disconnected from our delivery team..."
                                        value={formData.challenge}
                                        onChange={e => setFormData({...formData, challenge: e.target.value})}
                                    ></textarea>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <Button variant="secondary" className="flex-1 h-14" onClick={() => setAppStep(1)}>Back</Button>
                                <Button className="flex-[2] h-14 text-lg" onClick={() => setAppStep(3)} disabled={!formData.challenge}>
                                    Almost Done <ArrowRight className="w-5 h-5 ml-2" />
                                </Button>
                            </div>
                        </div>
                    )}

                    {appStep === 3 && (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                             <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl flex items-center gap-4">
                                <ShieldCheck className="w-8 h-8 text-emerald-600" />
                                <div>
                                    <h4 className="font-bold text-lg">Final confirmation.</h4>
                                    <p className="text-xs text-text-secondary">We'll reach out to schedule your Discovery Call.</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest">Work Email</label>
                                    <Input placeholder="founder@nexus.com" value={formData.contactEmail} onChange={e => setFormData({...formData, contactEmail: e.target.value})} />
                                </div>
                                <div className="p-4 rounded-xl border border-dashed border-border bg-surface-subtle text-xs text-text-secondary leading-relaxed">
                                    By submitting, you agree to our confidentiality terms. Your business data remains your own; we only provide the interpretation.
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <Button variant="secondary" className="flex-1 h-14" onClick={() => setAppStep(2)}>Back</Button>
                                <Button className="flex-[2] h-14 text-lg" onClick={handleSubmitApp} disabled={isSubmitting || !formData.contactEmail}>
                                    {isSubmitting ? <Loader2 className="animate-spin" /> : 'Confirm Application'}
                                </Button>
                            </div>
                        </div>
                    )}

                    {appStep === 4 && (
                        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 animate-in zoom-in-95 duration-500">
                            <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-lg">
                                <CheckCircle2 className="w-12 h-12" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold">Application Secured.</h3>
                                <p className="text-text-secondary mt-2 max-w-sm">We are reviewing your profile. You will receive an invitation to the Echoes Portal within 12 hours.</p>
                            </div>
                            <div className="w-full pt-6 border-t border-border mt-8 flex flex-col gap-3">
                                <Button className="w-full h-12" onClick={() => setIsAppModalOpen(false)}>Return to Explorer</Button>
                                <button type="button" className="text-xs font-bold uppercase tracking-widest text-text-tertiary hover:text-primary-600 transition-colors">Download Brochure (PDF)</button>
                            </div>
                        </div>
                    )}
                </div>
            </Modal>
            
            <footer className="py-32 border-t border-gray-100 dark:border-white/5 text-center px-6 bg-[#F9FAFB] dark:bg-[#0B1120]">
                <div className="flex flex-col items-center gap-12">
                    <div className="flex items-center gap-4 opacity-80">
                        <div className="w-12 h-12 bg-gray-900 dark:bg-white rounded-xl flex items-center justify-center text-white dark:text-black shadow-lg">
                            <Sun className="w-8 h-8 fill-current" />
                        </div>
                        <span className="font-serif font-bold text-3xl dark:text-white uppercase tracking-tighter">Echoes & Visions</span>
                    </div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] max-w-xl leading-loose">
                        © 2024 Echoes & Visions Inc. Built for leaders who value structured clarity over scattered data.
                    </p>
                </div>
            </footer>
        </div>
    );
};
