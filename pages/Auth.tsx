
import React, { useState } from 'react';
import { Button, Input, Card, Badge } from '../components/ui/Primitives';
import { 
  Mail, Lock, ArrowRight, Check, ChevronRight, Bot, Globe, 
  Shield, Zap, Menu, X, TrendingUp, Briefcase, Sun, 
  HelpCircle, Rocket, Layers, MessageSquare, Phone, MapPin,
  ExternalLink, BarChart3, Filter, Target, Sparkles, User, Users,
  BookOpen, Clock, Share2, Facebook, Twitter, Linkedin, Bookmark,
  Calendar, ChevronLeft
} from 'lucide-react';
import { FAQItem, DeliverableItem, StepItem, CaseStudy, BlogPost, View } from '../types';
import { AuditLanding } from './AuditLanding';

type PublicView = 'landing' | 'login' | 'signup' | 'deliverables' | 'process' | 'faq' | 'contact' | 'portfolio' | 'blog' | 'blog-post' | 'audit_landing';

export const Auth: React.FC<{ onLogin: (role: 'team' | 'client') => void }> = ({ onLogin }) => {
    const [view, setView] = useState<PublicView>('landing');
    const [loginRole, setLoginRole] = useState<'team' | 'client'>('team');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [selectedCase, setSelectedCase] = useState<CaseStudy | null>(null);
    const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
    const [portfolioFilter, setPortfolioFilter] = useState<string>('All');
    const [newsletterEmail, setNewsletterEmail] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onLogin(loginRole);
    };

    const navigate = (newView: PublicView, post?: BlogPost) => {
        if (post) setSelectedPost(post);
        setView(newView);
        setMobileMenuOpen(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // --- Mock Blog Data ---
    const blogPosts: BlogPost[] = [
        {
            id: '1',
            title: 'The Silent Revolution: AI in Business Operations',
            slug: 'ai-business-operations',
            summary: 'How delegated intelligence is reshaping the way small teams outperform large corporations.',
            content: `
                <p>The landscape of business operations is undergoing a profound transformation. While the media focuses on generative AI for art and chat, a silent revolution is happening within the structural logic of companies.</p>
                <h3>Efficiency Beyond Automation</h3>
                <p>Automation used to mean simple 'if-this-then-that' rules. Today, AI allows for nuanced decision-making. Imagine a system that doesn't just send a reminder for an unpaid invoice, but analyzes the client's payment history and drafts a personalized follow-up that maximizes the chance of immediate payment while maintaining the relationship.</p>
                <blockquote>"The goal of AI in business isn't to replace the human, but to provide them with a digital exoskeleton."</blockquote>
                <h3>The Echoes OS Approach</h3>
                <p>At Echoes & Visions, we build architectures where AI acts as a connective tissue between disparate modules. Your CRM shouldn't just store data; it should predict the needs of your next lead before you even open the dashboard.</p>
            `,
            category: 'Intelligence',
            author: { name: 'Elias Thorne', role: 'Chief Strategist', avatar: 'ET' },
            date: 'Nov 12, 2024',
            image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=2070&auto=format&fit=crop',
            readingTime: '6 min',
            isFeatured: true,
            tags: ['AI', 'Future of Work', 'Efficiency']
        }
    ];

    const caseStudies: CaseStudy[] = [
        {
            id: '1',
            title: 'AI Revenue Engine',
            client: 'TechFlow Systems',
            category: 'AI',
            impact: '240% Growth',
            description: 'Automating sales outreach and lead scoring using Echoes Intelligence.',
            challenge: 'TechFlow was struggling with manual lead qualification, resulting in a 45% drop-off in their sales funnel.',
            solution: 'We deployed a custom Echoes AI agent that integrated with their existing CRM to score leads in real-time and draft personalized initial responses.',
            result: 'Leads processed increased by 400%, while sales cycle time decreased from 14 days to 4 days.',
            image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop',
            tags: ['Machine Learning', 'Salesforce', 'Automation']
        }
    ];

    const NewsletterSignup = () => (
        <section className="py-20 bg-primary-900 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-12 opacity-10">
                <Mail className="w-64 h-64 text-white" />
            </div>
            <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 font-serif">Stay ahead of the curve.</h2>
                <p className="text-xl text-primary-100 mb-10">Join 15,000+ founders receiving our weekly insights on AI, design, and strategic operations.</p>
                <form className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto" onSubmit={(e) => { e.preventDefault(); alert("Subscribed!"); setNewsletterEmail(''); }}>
                    <input 
                        type="email" 
                        required
                        placeholder="your@email.com" 
                        className="flex-1 px-6 py-4 rounded-full bg-white/10 border border-white/20 text-white placeholder:text-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-500 backdrop-blur-md"
                        value={newsletterEmail}
                        onChange={(e) => setNewsletterEmail(e.target.value)}
                    />
                    <button type="submit" className="px-8 py-4 bg-white text-primary-900 font-bold rounded-full hover:bg-primary-50 transition-colors shadow-xl">Subscribe</button>
                </form>
                <p className="text-primary-400 text-xs mt-4">Zero spam. Only signal. Unsubscribe anytime.</p>
            </div>
        </section>
    );

    const BlogPage = () => (
        <div className="min-h-screen pt-32 pb-20 bg-surface dark:bg-[#0B1120]">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6">
                    <div className="max-w-2xl">
                        <Badge variant="brand" className="mb-4">The Echoes Journal</Badge>
                        <h1 className="text-4xl md:text-6xl font-bold font-serif dark:text-white leading-tight">Insight into the future of business.</h1>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {blogPosts.map(post => (
                        <article 
                            key={post.id} 
                            className="group cursor-pointer flex flex-col"
                            onClick={() => navigate('blog-post', post)}
                        >
                            <div className="aspect-[16/10] rounded-2xl overflow-hidden mb-6 relative">
                                <img src={post.image} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt={post.title} />
                                <div className="absolute top-4 left-4">
                                    <Badge className="bg-white/90 dark:bg-black/60 backdrop-blur-md border-none text-primary-700 dark:text-primary-400">{post.category}</Badge>
                                </div>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-2xl font-bold dark:text-white mb-4 group-hover:text-primary-600 transition-colors leading-snug">{post.title}</h3>
                                <p className="text-text-secondary dark:text-gray-400 line-clamp-3 leading-relaxed mb-6">{post.summary}</p>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </div>
    );

    const BlogPostPage = () => {
        if (!selectedPost) return <BlogPage />;
        return (
            <div className="min-h-screen pt-32 pb-20 bg-surface dark:bg-[#0B1120]">
                <div className="max-w-4xl mx-auto px-6">
                    <button type="button" onClick={() => setView('blog')} className="flex items-center gap-2 text-sm font-bold text-text-tertiary hover:text-primary-600 transition-colors mb-12 uppercase tracking-widest">
                        <ChevronLeft className="w-4 h-4" /> Back to Journal
                    </button>
                    <h1 className="text-4xl md:text-6xl font-bold font-serif dark:text-white leading-tight mb-8">{selectedPost.title}</h1>
                    <div className="aspect-[21/9] rounded-3xl overflow-hidden mb-12 shadow-2xl">
                        <img src={selectedPost.image} className="w-full h-full object-cover" alt="Hero" />
                    </div>
                    <div className="prose prose-lg dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: selectedPost.content }} />
                </div>
            </div>
        );
    };

    const PublicNav = () => (
        <nav className="fixed top-0 w-full z-50 bg-surface/80 dark:bg-[#0B1120]/80 backdrop-blur-md border-b border-border/50 dark:border-white/10">
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('landing')}>
                    <div className="w-9 h-9 bg-gray-900 dark:bg-white rounded-lg flex items-center justify-center text-white dark:text-black shadow-lg">
                        <Sun className="w-5 h-5 fill-current" />
                    </div>
                    <span className="font-serif font-bold text-xl tracking-wide text-text-primary dark:text-white uppercase">Echoes & Visions</span>
                </div>

                <div className="hidden md:flex items-center gap-8 text-[10px] font-bold uppercase tracking-widest text-text-secondary dark:text-gray-400">
                    <button type="button" onClick={() => navigate('blog')} className={`transition-colors ${view === 'blog' ? 'text-primary-600' : 'hover:text-primary-600'}`}>Journal</button>
                    <button type="button" onClick={() => navigate('portfolio')} className={`transition-colors ${view === 'portfolio' ? 'text-primary-600' : 'hover:text-primary-600'}`}>Portfolio</button>
                    <button type="button" onClick={() => navigate('audit_landing')} className={`transition-colors ${view === 'audit_landing' ? 'text-primary-600 font-bold' : 'hover:text-primary-600'}`}>Audit</button>
                    <button type="button" onClick={() => onLogin('team')} className="text-primary-600 font-bold border-b-2 border-primary-100 hover:border-primary-500 transition-all">Portal</button>
                </div>

                <div className="hidden md:flex items-center gap-4">
                    <button type="button" onClick={() => { setLoginRole('team'); setView('login'); }} className="text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-primary-600 transition-colors">Sign In</button>
                    <button type="button" onClick={() => navigate('audit_landing')} className="bg-[#111827] dark:bg-white text-white dark:text-black px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all shadow-lg hover:scale-105">Get Audit</button>
                </div>

                <button type="button" className="md:hidden text-text-secondary dark:text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                    {mobileMenuOpen ? <X /> : <Menu />}
                </button>
            </div>
        </nav>
    );

    const PublicFooter = () => (
        <footer className="bg-surface dark:bg-[#0B1120] border-t border-border dark:border-white/10 py-12 px-6">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gray-900 dark:bg-white rounded flex items-center justify-center text-white dark:text-black">
                        <Sun className="w-3.5 h-3.5 fill-current" />
                    </div>
                    <span className="font-serif font-bold text-lg dark:text-white uppercase">Echoes & Visions</span>
                </div>
                <div className="flex gap-8 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    <button type="button" onClick={() => navigate('audit_landing')} className="hover:text-primary-600">Audit</button>
                    <button type="button" onClick={() => navigate('blog')} className="hover:text-primary-600">Journal</button>
                    <button type="button" onClick={() => navigate('faq')} className="hover:text-primary-600">FAQ</button>
                </div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">&copy; 2024 Echoes & Visions Inc.</p>
            </div>
        </footer>
    );

    const renderPublicView = () => {
        switch(view) {
            case 'landing': return <><LandingPage /><NewsletterSignup /></>;
            case 'audit_landing': return <AuditLanding onBack={() => setView('landing')} />;
            case 'blog': return <BlogPage />;
            case 'blog-post': return <BlogPostPage />;
            case 'login': return (
                <div className="min-h-screen flex items-center justify-center bg-surface dark:bg-[#0B1120] p-4">
                  <Card className="w-full max-w-md p-8 shadow-xl">
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="text-center mb-8">
                        <Sun className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold font-serif">{loginRole === 'team' ? 'Team Login' : 'Client Portal Login'}</h2>
                      </div>
                      <div className="flex bg-surface-muted dark:bg-white/5 p-1 rounded-lg mb-4">
                        <button type="button" onClick={() => setLoginRole('team')} className={`flex-1 py-2 rounded-md text-xs font-bold transition-all ${loginRole === 'team' ? 'bg-white dark:bg-surface-dark shadow-sm text-primary-600' : 'text-text-tertiary'}`}>Team</button>
                        <button type="button" onClick={() => setLoginRole('client')} className={`flex-1 py-2 rounded-md text-xs font-bold transition-all ${loginRole === 'client' ? 'bg-white dark:bg-surface-dark shadow-sm text-primary-600' : 'text-text-tertiary'}`}>Client</button>
                      </div>
                      <Input icon={Mail} type="email" placeholder="Email" required />
                      <Input icon={Lock} type="password" placeholder="Password" required />
                      <Button className="w-full" type="submit">Sign In</Button>
                    </form>
                  </Card>
                </div>
            );
            case 'signup': return (
                <div className="min-h-screen flex items-center justify-center bg-surface dark:bg-[#0B1120] p-4"><Card className="w-full max-w-md p-8 shadow-xl"><form onSubmit={handleSubmit} className="space-y-4"><div className="text-center mb-8"><Sun className="w-12 h-12 text-orange-500 mx-auto mb-4" /><h2 className="text-2xl font-bold font-serif">Create account</h2></div><Input placeholder="Full Name" required /><Input icon={Mail} type="email" placeholder="Email" required /><Input icon={Lock} type="password" placeholder="Password" required /><Button className="w-full" type="submit">Get Started</Button></form></Card></div>
            );
            default: return <LandingPage />;
        }
    };

    const LandingPage = () => (
        <div className="min-h-screen bg-surface dark:bg-[#0B1120] text-text-primary dark:text-white selection:bg-primary-500 selection:text-white overflow-x-hidden font-sans">
            <header className="pt-48 pb-32 px-6 relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-primary-500/10 to-transparent blur-3xl -z-10 pointer-events-none"></div>
                <div className="max-w-5xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-white/5 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-widest mb-8 border border-emerald-100 dark:border-emerald-900/30">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        Limited: 3 Audit Slots Remaining for Q4
                    </div>
                    <h1 className="text-5xl md:text-8xl font-bold tracking-tighter mb-8 leading-[0.9] font-serif">
                        Clarity is the <br />
                        <span className="italic text-[#10B981]">Ultimate Advantage</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-text-secondary dark:text-gray-400 max-w-3xl mx-auto mb-12 leading-relaxed">
                        Stop drowning in data. Echoes & Visions unifies your strategy, operations, and AI automation into a single, high-performance ecosystem.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                        <button type="button" onClick={() => navigate('audit_landing')} className="w-full sm:w-auto h-16 px-12 bg-[#111827] dark:bg-white text-white dark:text-black rounded-full font-bold transition-all shadow-2xl hover:scale-105 flex items-center justify-center gap-3">
                            Apply for a Strategic Audit <ArrowRight className="w-5 h-5" />
                        </button>
                        <button type="button" onClick={() => navigate('blog')} className="w-full sm:w-auto h-16 px-12 bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10 text-text-primary dark:text-white border border-border dark:border-white/10 rounded-full font-bold transition-all flex items-center justify-center gap-2">
                            Explore the Journal
                        </button>
                    </div>
                </div>
            </header>

            {/* Featured Blog Preview */}
            <section className="py-24 bg-surface dark:bg-[#0B1120] border-t border-border dark:border-white/5">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex items-center justify-between mb-16">
                        <h2 className="text-3xl font-bold font-serif dark:text-white uppercase tracking-tighter">Latest Dispatch</h2>
                        <button type="button" onClick={() => navigate('blog')} className="text-primary-600 font-bold text-xs uppercase tracking-widest flex items-center gap-2 hover:gap-3 transition-all">View all <ArrowRight className="w-4 h-4" /></button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {blogPosts.map(post => (
                            <div key={post.id} className="group cursor-pointer" onClick={() => navigate('blog-post', post)}>
                                <div className="aspect-[4/3] rounded-2xl overflow-hidden mb-6"><img src={post.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={post.title} /></div>
                                <Badge variant="brand" className="mb-4">{post.category}</Badge>
                                <h3 className="text-2xl font-bold dark:text-white mb-3 line-clamp-2 leading-snug font-serif">{post.title}</h3>
                                <p className="text-sm text-text-secondary line-clamp-2 leading-relaxed">{post.summary}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );

    const PortfolioPage = () => (
        <div className="min-h-screen pt-32 pb-20 bg-surface dark:bg-[#0B1120]">
            <div className="max-w-7xl mx-auto px-6 text-center">
                <Badge variant="brand" className="mb-4">Portfolio</Badge>
                <h1 className="text-4xl md:text-6xl font-bold font-serif dark:text-white mb-12">Architecture for Growth</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {caseStudies.map(cs => (
                        <Card key={cs.id} className="p-0 overflow-hidden cursor-pointer hover:shadow-2xl transition-all rounded-[2rem]" onClick={() => setSelectedCase(cs)}>
                            <div className="aspect-video overflow-hidden"><img src={cs.image} className="w-full h-full object-cover" alt={cs.title} /></div>
                            <div className="p-10 text-left">
                                <Badge variant="success" className="mb-4">{cs.impact}</Badge>
                                <h3 className="text-3xl font-bold dark:text-white font-serif mb-4">{cs.title}</h3>
                                <p className="text-text-secondary dark:text-gray-400 leading-relaxed">{cs.description}</p>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );

    const FAQPage = () => (
        <div className="min-h-screen pt-32 pb-20 bg-surface dark:bg-[#0B1120]"><div className="max-w-3xl mx-auto px-6"><h1 className="text-4xl md:text-6xl font-bold font-serif dark:text-white mb-12 text-center">Strategic FAQ</h1></div></div>
    );

    return (
        <div className="min-h-screen bg-surface dark:bg-[#0B1120] text-text-primary dark:text-white font-sans">
            {view !== 'audit_landing' && <PublicNav />}
            {renderPublicView()}
            {view !== 'audit_landing' && <PublicFooter />}
        </div>
    );
};
