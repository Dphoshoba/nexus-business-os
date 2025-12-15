import React, { useState } from 'react';
import { Button, Input, Card } from '../components/ui/Primitives';
import { Mail, Lock, ArrowRight, Github, Check, ChevronRight, LayoutDashboard, Users, CreditCard, Bot, Globe, Shield, Zap, Menu, X, TrendingUp, Briefcase, Server, CheckCircle2, Search, Bell, MoreHorizontal, Sun } from 'lucide-react';

export const Auth: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
    const [view, setView] = useState<'landing' | 'login' | 'signup'>('landing');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Mock authentication
        onLogin();
    };

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
        setMobileMenuOpen(false);
    };

    const LandingPage = () => (
        <div className="min-h-screen bg-surface dark:bg-[#0B1120] text-text-primary dark:text-white selection:bg-primary-500 selection:text-white overflow-x-hidden font-sans">
            {/* Navigation */}
            <nav className="fixed top-0 w-full z-50 bg-surface/80 dark:bg-[#0B1120]/80 backdrop-blur-md border-b border-border/50 dark:border-white/10">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); setView('landing'); }}>
                        <div className="w-9 h-9 bg-gradient-to-br from-amber-400 to-orange-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
                            <Sun className="w-5 h-5 fill-white text-white" />
                        </div>
                        <span className="font-serif font-bold text-xl tracking-wide text-text-primary dark:text-white">Eternal Echoes & Visions</span>
                    </div>

                    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-text-secondary dark:text-gray-400">
                        <button onClick={() => scrollToSection('features')} className="hover:text-primary-600 dark:hover:text-white transition-colors">Features</button>
                        <button onClick={() => scrollToSection('solutions')} className="hover:text-primary-600 dark:hover:text-white transition-colors">Solutions</button>
                        <button onClick={() => scrollToSection('pricing')} className="hover:text-primary-600 dark:hover:text-white transition-colors">Pricing</button>
                    </div>

                    <div className="hidden md:flex items-center gap-4">
                        <button onClick={() => setView('login')} className="text-sm font-medium hover:text-primary-600 dark:hover:text-white transition-colors">Sign In</button>
                        <button onClick={() => setView('signup')} className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-full text-sm font-medium transition-all shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40">Get Started</button>
                    </div>

                    <button className="md:hidden text-text-secondary dark:text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                        {mobileMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>
                
                {mobileMenuOpen && (
                    <div className="md:hidden absolute top-20 left-0 w-full bg-surface dark:bg-[#0B1120] border-b border-border dark:border-white/10 p-6 flex flex-col gap-4 shadow-2xl animate-in slide-in-from-top-5">
                        <button onClick={() => scrollToSection('features')} className="text-lg font-medium text-left">Features</button>
                        <button onClick={() => scrollToSection('solutions')} className="text-lg font-medium text-left">Solutions</button>
                        <button onClick={() => scrollToSection('pricing')} className="text-lg font-medium text-left">Pricing</button>
                        <hr className="border-border dark:border-white/10" />
                        <button onClick={() => setView('login')} className="text-lg font-medium text-left">Sign In</button>
                        <button onClick={() => setView('signup')} className="bg-primary-600 text-white py-3 rounded-xl font-bold">Get Started</button>
                    </div>
                )}
            </nav>

            {/* Hero Section */}
            <header className="pt-32 pb-20 px-6 relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-primary-500/10 to-transparent blur-3xl -z-10 pointer-events-none"></div>
                
                <div className="max-w-5xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 dark:bg-white/10 text-primary-700 dark:text-primary-300 text-xs font-semibold mb-6 border border-primary-100 dark:border-white/10">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
                        </span>
                        New: Gemini Live Voice Assistant
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-tight">
                        The Operating System <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-indigo-600 dark:from-primary-400 dark:to-indigo-400">for Modern Business</span>
                    </h1>
                    <p className="text-xl text-text-secondary dark:text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                        Nexus unifies your CRM, Project Management, Finance, and AI Automation into one seamless platform. Stop switching apps. Start growing.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button onClick={() => setView('signup')} className="w-full sm:w-auto h-12 px-8 bg-primary-600 hover:bg-primary-700 text-white rounded-full font-semibold transition-all shadow-xl shadow-primary-600/20 hover:scale-105 flex items-center justify-center gap-2">
                            Start Free Trial <ArrowRight className="w-4 h-4" />
                        </button>
                        <button onClick={() => scrollToSection('features')} className="w-full sm:w-auto h-12 px-8 bg-white dark:bg-white/10 hover:bg-gray-50 dark:hover:bg-white/20 text-text-primary dark:text-white border border-border dark:border-white/10 rounded-full font-semibold transition-all flex items-center justify-center gap-2">
                            <Bot className="w-4 h-4" /> View Features
                        </button>
                    </div>
                </div>

                {/* Hero Image / Mockup */}
                <div className="mt-20 max-w-6xl mx-auto relative group perspective-1000">
                    <div className="absolute inset-0 bg-gradient-to-t from-surface dark:from-[#0B1120] to-transparent z-10 h-32 bottom-0"></div>
                    <div className="relative rounded-2xl border border-slate-300 dark:border-white/20 shadow-2xl overflow-hidden bg-white dark:bg-[#111827] transform transition-transform duration-700 hover:rotate-x-2 group-hover:scale-[1.01]">
                        {/* Window Header */}
                        <div className="h-10 bg-slate-100 dark:bg-[#1F2937] border-b border-slate-200 dark:border-white/10 flex items-center px-4 gap-2">
                            <div className="flex gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-red-400 border border-red-500/20"></div>
                                <div className="w-3 h-3 rounded-full bg-amber-400 border border-amber-500/20"></div>
                                <div className="w-3 h-3 rounded-full bg-green-400 border border-green-500/20"></div>
                            </div>
                            <div className="ml-4 px-3 py-1 bg-white dark:bg-[#111827] rounded text-[10px] text-text-tertiary flex-1 max-w-sm border border-slate-200 dark:border-white/10 flex items-center justify-center shadow-sm">
                                <span className="opacity-50 font-medium">nexus.os/dashboard</span>
                            </div>
                        </div>
                        
                        {/* Dashboard Preview Mockup */}
                        <div className="flex h-[600px] bg-slate-50 dark:bg-[#0B1120]">
                            {/* Sidebar Mockup */}
                            <div className="w-64 bg-white dark:bg-[#111827] border-r border-slate-200 dark:border-white/10 p-4 hidden md:flex flex-col gap-4">
                                {/* Brand */}
                                <div className="flex items-center gap-3 px-2 mb-2">
                                    <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-600 rounded-lg shadow-md flex items-center justify-center">
                                        <Sun className="w-5 h-5 text-white fill-white" />
                                    </div>
                                    <div className="h-4 w-32 bg-slate-400 dark:bg-white/20 rounded-md"></div>
                                </div>
                                {/* Nav Items */}
                                <div className="space-y-1">
                                    {[1, 2, 3, 4, 5, 6].map(i => (
                                        <div key={i} className={`h-10 w-full rounded-lg flex items-center px-3 gap-3 ${i === 1 ? 'bg-primary-50 border border-primary-200 dark:bg-primary-900/20 dark:border-primary-800' : 'bg-white border border-transparent dark:bg-white/5'}`}>
                                            <div className={`w-5 h-5 rounded ${i === 1 ? 'bg-primary-600 dark:bg-primary-500' : 'bg-slate-300 dark:bg-white/20'}`}></div>
                                            <div className={`h-2.5 rounded flex-1 ${i === 1 ? 'bg-primary-400 dark:bg-primary-700 w-20' : 'bg-slate-200 dark:bg-white/10 w-16'}`}></div>
                                        </div>
                                    ))}
                                </div>
                                {/* User Profile */}
                                <div className="mt-auto border-t border-slate-200 dark:border-white/10 pt-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-slate-300 dark:bg-white/20"></div>
                                        <div className="space-y-2">
                                            <div className="h-2.5 w-24 bg-slate-400 dark:bg-white/20 rounded"></div>
                                            <div className="h-2 w-16 bg-slate-300 dark:bg-white/10 rounded"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Main Content Mockup */}
                            <div className="flex-1 p-8 overflow-hidden flex flex-col gap-8 bg-slate-50 dark:bg-[#0B1120]">
                                {/* Top Bar */}
                                <div className="flex justify-between items-end">
                                    <div className="space-y-3">
                                        <div className="h-8 w-48 bg-slate-300 dark:bg-white/20 rounded-lg"></div>
                                        <div className="h-4 w-64 bg-slate-200 dark:bg-white/10 rounded-md"></div>
                                    </div>
                                    <div className="flex gap-3">
                                        <div className="h-10 w-10 bg-white dark:bg-[#1F2937] rounded-lg border border-slate-200 dark:border-white/10 shadow-sm"></div>
                                        <div className="h-10 w-32 bg-primary-600 rounded-lg shadow-lg shadow-primary-600/20"></div>
                                    </div>
                                </div>

                                {/* Stats Grid */}
                                <div className="grid grid-cols-4 gap-6">
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={i} className="bg-white dark:bg-[#1F2937] p-5 rounded-xl border border-slate-200 dark:border-white/10 shadow-sm flex flex-col gap-3">
                                            <div className="flex justify-between items-start">
                                                <div className={`w-10 h-10 rounded-lg ${i===1?'bg-blue-100':i===2?'bg-purple-100':i===3?'bg-emerald-100':'bg-amber-100'}`}></div>
                                                <div className="h-4 w-12 bg-slate-100 dark:bg-white/5 rounded-full border border-slate-100"></div>
                                            </div>
                                            <div className="h-6 w-20 bg-slate-700/80 dark:bg-white/40 rounded-md mt-1"></div>
                                            <div className="h-3 w-16 bg-slate-300 dark:bg-white/20 rounded-md"></div>
                                        </div>
                                    ))}
                                </div>

                                {/* Charts Area */}
                                <div className="flex gap-6 h-full min-h-[300px]">
                                    {/* Main Chart */}
                                    <div className="flex-[2] bg-white dark:bg-[#1F2937] rounded-xl border border-slate-200 dark:border-white/10 shadow-sm p-6 flex flex-col">
                                        <div className="flex justify-between mb-8">
                                            <div className="h-5 w-32 bg-slate-300 dark:bg-white/20 rounded-md"></div>
                                            <div className="h-5 w-24 bg-slate-200 dark:bg-white/10 rounded-md"></div>
                                        </div>
                                        <div className="flex-1 flex items-end justify-between gap-4 px-2 pb-2">
                                            {[40, 65, 45, 80, 55, 90, 70, 85, 60, 75, 50, 95].map((h, idx) => (
                                                <div key={idx} className="w-full bg-primary-100 dark:bg-primary-900/10 rounded-t-sm relative group overflow-hidden h-full">
                                                    <div className="absolute bottom-0 left-0 right-0 bg-primary-500 rounded-t-sm transition-all duration-1000" style={{ height: `${h}%` }}></div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    
                                    {/* Side List */}
                                    <div className="flex-1 bg-white dark:bg-[#1F2937] rounded-xl border border-slate-200 dark:border-white/10 shadow-sm p-6 flex flex-col gap-5">
                                        <div className="h-5 w-32 bg-slate-300 dark:bg-white/20 rounded-md mb-2"></div>
                                        {[1, 2, 3, 4].map(i => (
                                            <div key={i} className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10"></div>
                                                <div className="flex-1 space-y-2">
                                                    <div className="h-2.5 w-full bg-slate-300 dark:bg-white/10 rounded-full"></div>
                                                    <div className="h-2 w-2/3 bg-slate-200 dark:bg-white/5 rounded-full"></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Overlay CTA */}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/5 dark:bg-black/40 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                            <button onClick={() => setView('signup')} className="px-8 py-3 bg-primary-600 text-white rounded-full font-bold shadow-2xl transform scale-110 hover:scale-115 transition-transform hover:shadow-primary-600/30">Enter Dashboard</button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Features Grid */}
            <section id="features" className="py-24 bg-surface-subtle dark:bg-[#0F1629]">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4">Everything you need to scale</h2>
                        <p className="text-text-secondary dark:text-gray-400">Modular by design. Powerful by default.</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { icon: Users, title: "CRM", desc: "Track leads and manage customer relationships with visual pipelines." },
                            { icon: CreditCard, title: "Payments", desc: "Invoicing, subscriptions, and financial reporting built-in." },
                            { icon: Bot, title: "AI Assistant", desc: "Gemini-powered insights, drafting, and voice control." },
                            { icon: LayoutDashboard, title: "Projects", desc: "Kanban, Gantt, and task management for teams." },
                            { icon: Shield, title: "Secure", desc: "Enterprise-grade security with role-based access control." },
                            { icon: Globe, title: "Global", desc: "Multi-currency and multi-language support." },
                        ].map((f, i) => (
                            <div key={i} className="p-8 bg-surface dark:bg-[#111827] rounded-2xl border border-border dark:border-white/5 hover:border-primary-500/50 transition-colors group">
                                <div className="w-12 h-12 bg-primary-50 dark:bg-primary-900/20 rounded-xl flex items-center justify-center text-primary-600 dark:text-primary-400 mb-6 group-hover:scale-110 transition-transform">
                                    <f.icon className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold mb-3 dark:text-white">{f.title}</h3>
                                <p className="text-text-secondary dark:text-gray-400 leading-relaxed">
                                    {f.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Solutions Section */}
            <section id="solutions" className="py-24 bg-surface dark:bg-[#0B1120]">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <div className="inline-block px-3 py-1 mb-4 text-xs font-semibold tracking-wider text-primary-600 dark:text-primary-400 uppercase bg-primary-50 dark:bg-primary-900/20 rounded-full">
                                Solutions
                            </div>
                            <h2 className="text-4xl font-bold mb-6 leading-tight dark:text-white">
                                Tailored for your specific workflow
                            </h2>
                            <p className="text-lg text-text-secondary dark:text-gray-400 mb-8 leading-relaxed">
                                Whether you're a lean startup or a scaling enterprise, Nexus adapts to your team structure and goals.
                            </p>
                            
                            <div className="space-y-6">
                                {[
                                    { title: "For Sales Teams", desc: "Automate follow-ups and close deals faster with AI-driven insights.", icon: TrendingUp },
                                    { title: "For Agencies", desc: "Manage multiple clients, projects, and billing in a single view.", icon: Briefcase },
                                    { title: "For Developers", desc: "Integrate via API and extend functionality with custom modules.", icon: Server }
                                ].map((item, i) => (
                                    <div key={i} className="flex gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-surface-muted dark:bg-white/5 flex items-center justify-center shrink-0">
                                            <item.icon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-text-primary dark:text-white">{item.title}</h4>
                                            <p className="text-sm text-text-secondary dark:text-gray-400 mt-1">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="relative">
                            <div className="absolute -inset-4 bg-gradient-to-r from-primary-500 to-indigo-500 rounded-2xl blur-2xl opacity-20"></div>
                            <div className="relative bg-slate-100 dark:bg-[#111827] border border-slate-300 dark:border-white/10 rounded-2xl p-8 shadow-2xl">
                                {/* Mock UI Elements for "Solution" Visualization */}
                                <div className="flex items-center justify-between mb-6 border-b border-slate-200 dark:border-white/5 pb-4">
                                    <div className="flex gap-2">
                                        <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                        <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                                        <div className="w-3 h-3 rounded-full bg-green-400"></div>
                                    </div>
                                    <div className="h-2 w-20 bg-slate-300 dark:bg-white/10 rounded-full"></div>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex gap-4">
                                        <div className="w-1/3 h-32 bg-white dark:bg-[#1F2937] rounded-xl border border-slate-200 dark:border-white/5 p-3 flex flex-col justify-end shadow-sm">
                                            <div className="h-2 w-12 bg-slate-300 dark:bg-white/10 rounded mb-2"></div>
                                            <div className="flex gap-1 h-12 items-end">
                                                <div className="w-1/3 bg-primary-400 h-[60%] rounded-sm"></div>
                                                <div className="w-1/3 bg-primary-500 h-[100%] rounded-sm"></div>
                                                <div className="w-1/3 bg-primary-300 h-[40%] rounded-sm"></div>
                                            </div>
                                        </div>
                                        <div className="w-2/3 space-y-3">
                                            <div className="h-10 bg-white dark:bg-[#1F2937] rounded-lg w-full border border-slate-200 dark:border-white/5 flex items-center px-3 gap-2 shadow-sm">
                                                <div className="w-4 h-4 rounded-full bg-slate-100 dark:bg-white/10"></div>
                                                <div className="h-2 w-24 bg-slate-200 dark:bg-white/5 rounded-full"></div>
                                            </div>
                                            <div className="h-10 bg-white dark:bg-[#1F2937] rounded-lg w-full border border-slate-200 dark:border-white/5 flex items-center px-3 gap-2 shadow-sm">
                                                <div className="w-4 h-4 rounded-full bg-slate-100 dark:bg-white/10"></div>
                                                <div className="h-2 w-24 bg-slate-200 dark:bg-white/5 rounded-full"></div>
                                            </div>
                                            <div className="h-10 bg-white dark:bg-[#1F2937] rounded-lg w-full border border-slate-200 dark:border-white/5 flex items-center px-3 gap-2 shadow-sm">
                                                <div className="w-4 h-4 rounded-full bg-slate-100 dark:bg-white/10"></div>
                                                <div className="h-2 w-24 bg-slate-200 dark:bg-white/5 rounded-full"></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="h-40 bg-white dark:bg-[#1F2937] border border-slate-200 dark:border-white/5 rounded-xl w-full p-4 flex gap-4 shadow-sm">
                                        <div className="flex-1 bg-slate-50 dark:bg-white/5 rounded-lg border border-slate-100 dark:border-white/5"></div>
                                        <div className="flex-1 bg-slate-50 dark:bg-white/5 rounded-lg border border-slate-100 dark:border-white/5"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="py-24 bg-surface-subtle dark:bg-[#0F1629]">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4 dark:text-white">Simple, transparent pricing</h2>
                        <p className="text-text-secondary dark:text-gray-400">Start for free, upgrade as you grow.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        {[
                            { name: "Starter", price: "0", desc: "For individuals and freelancers.", features: ["1 User", "Basic CRM", "50 AI Credits/mo", "Community Support"] },
                            { name: "Pro", price: "29", desc: "For growing teams and startups.", features: ["5 Users", "Advanced Automations", "Unlimited AI Credits", "Priority Support", "Custom Domain"], popular: true },
                            { name: "Business", price: "99", desc: "For scaling organizations.", features: ["Unlimited Users", "SSO & Advanced Security", "Dedicated Success Manager", "API Access", "Audit Logs"] }
                        ].map((plan, i) => (
                            <div key={i} className={`relative p-8 rounded-2xl flex flex-col ${plan.popular ? 'bg-surface dark:bg-[#111827] border-2 border-primary-500 shadow-xl scale-105 z-10' : 'bg-surface dark:bg-[#111827] border border-border dark:border-white/10'}`}>
                                {plan.popular && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                        Most Popular
                                    </div>
                                )}
                                <h3 className="text-xl font-bold dark:text-white">{plan.name}</h3>
                                <p className="text-sm text-text-secondary dark:text-gray-400 mt-2">{plan.desc}</p>
                                <div className="my-6">
                                    <span className="text-4xl font-bold dark:text-white">${plan.price}</span>
                                    <span className="text-text-secondary dark:text-gray-500">/mo</span>
                                </div>
                                <ul className="space-y-3 mb-8 flex-1">
                                    {plan.features.map((f, idx) => (
                                        <li key={idx} className="flex items-center gap-3 text-sm dark:text-gray-300">
                                            <CheckCircle2 className="w-4 h-4 text-primary-600 dark:text-primary-400 shrink-0" />
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                                <button onClick={() => setView('signup')} className={`w-full py-3 rounded-xl font-bold transition-all ${plan.popular ? 'bg-primary-600 text-white hover:bg-primary-700 shadow-lg' : 'bg-surface-muted dark:bg-white/5 text-text-primary dark:text-white hover:bg-surface-subtle dark:hover:bg-white/10'}`}>
                                    {plan.price === "0" ? "Start Free" : "Get Started"}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-24 relative overflow-hidden">
                <div className="absolute inset-0 bg-primary-900 dark:bg-primary-950">
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                    <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary-500 rounded-full blur-3xl opacity-50"></div>
                    <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-500 rounded-full blur-3xl opacity-50"></div>
                </div>
                <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Ready to streamline your business?</h2>
                    <p className="text-xl text-primary-100 mb-10">Join thousands of companies running on Nexus OS.</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button onClick={() => setView('signup')} className="px-8 py-4 bg-white text-primary-900 rounded-full font-bold text-lg hover:bg-gray-100 transition-colors shadow-xl">
                            Get Started for Free
                        </button>
                        <a 
                            href="mailto:sales@eternalechoes.com"
                            className="px-8 py-4 bg-transparent border border-white/20 text-white rounded-full font-bold text-lg hover:bg-white/10 transition-colors inline-flex items-center justify-center"
                        >
                            Contact Sales
                        </a>
                    </div>
                    <p className="mt-6 text-sm text-primary-200/60">No credit card required. Cancel anytime.</p>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-surface dark:bg-[#0B1120] border-t border-border dark:border-white/10 py-12 px-6">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-gradient-to-br from-amber-400 to-orange-600 rounded flex items-center justify-center text-white">
                            <Sun className="w-3.5 h-3.5 fill-current" />
                        </div>
                        <span className="font-serif font-bold text-lg dark:text-white">Eternal Echoes & Visions</span>
                    </div>
                    <div className="text-sm text-text-secondary dark:text-gray-500">
                        &copy; 2024 Eternal Echoes & Visions Inc. All rights reserved.
                    </div>
                    <div className="flex gap-6">
                        <Github className="w-5 h-5 text-text-tertiary hover:text-text-primary dark:hover:text-white cursor-pointer" />
                        <Globe className="w-5 h-5 text-text-tertiary hover:text-text-primary dark:hover:text-white cursor-pointer" />
                    </div>
                </div>
            </footer>
        </div>
    );

    if (view === 'login') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-surface dark:bg-[#0B1120] text-text-primary dark:text-white p-4 font-sans">
                <Card className="w-full max-w-md p-8 border border-border dark:border-white/10 shadow-xl">
                    <div className="text-center mb-8">
                        <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-600 rounded-xl flex items-center justify-center text-white shadow-lg mx-auto mb-4">
                            <Sun className="w-6 h-6 fill-white text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-text-primary dark:text-white">Welcome back</h2>
                        <p className="text-text-secondary dark:text-gray-400 mt-2">Enter your credentials to access your workspace.</p>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-text-secondary dark:text-gray-400 mb-1.5 block">Email</label>
                            <Input type="email" placeholder="name@company.com" required icon={Mail} />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-text-secondary dark:text-gray-400 mb-1.5 block">Password</label>
                            <Input type="password" placeholder="••••••••" required icon={Lock} />
                        </div>
                        <Button className="w-full bg-primary-600 hover:bg-primary-700 text-white" size="lg" type="submit">Sign In</Button>
                    </form>
                    <div className="mt-6 text-center text-sm text-text-secondary dark:text-gray-400">
                        Don't have an account? <button onClick={() => setView('signup')} className="text-primary-600 hover:underline font-medium">Sign up</button>
                    </div>
                    <div className="mt-4 text-center">
                        <button onClick={() => setView('landing')} className="text-xs text-text-tertiary hover:text-text-primary dark:hover:text-white transition-colors">Back to Home</button>
                    </div>
                </Card>
            </div>
        );
    }

    if (view === 'signup') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-surface dark:bg-[#0B1120] text-text-primary dark:text-white p-4 font-sans">
                <Card className="w-full max-w-md p-8 border border-border dark:border-white/10 shadow-xl">
                    <div className="text-center mb-8">
                        <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-600 rounded-xl flex items-center justify-center text-white shadow-lg mx-auto mb-4">
                            <Sun className="w-6 h-6 fill-white text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-text-primary dark:text-white">Create your account</h2>
                        <p className="text-text-secondary dark:text-gray-400 mt-2">Start your 14-day free trial.</p>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-text-secondary dark:text-gray-400 mb-1.5 block">Full Name</label>
                            <Input placeholder="John Doe" required />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-text-secondary dark:text-gray-400 mb-1.5 block">Email</label>
                            <Input type="email" placeholder="name@company.com" required icon={Mail} />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-text-secondary dark:text-gray-400 mb-1.5 block">Password</label>
                            <Input type="password" placeholder="••••••••" required icon={Lock} />
                        </div>
                        <Button className="w-full bg-primary-600 hover:bg-primary-700 text-white" size="lg" type="submit">Get Started</Button>
                    </form>
                    <div className="mt-6 text-center text-sm text-text-secondary dark:text-gray-400">
                        Already have an account? <button onClick={() => setView('login')} className="text-primary-600 hover:underline font-medium">Sign in</button>
                    </div>
                    <div className="mt-4 text-center">
                        <button onClick={() => setView('landing')} className="text-xs text-text-tertiary hover:text-text-primary dark:hover:text-white transition-colors">Back to Home</button>
                    </div>
                </Card>
            </div>
        );
    }

    return <LandingPage />;
};
