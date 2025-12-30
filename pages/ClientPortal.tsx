
import React, { useState } from 'react';
import { SectionHeader, Card, Button, Badge, Modal, Input } from '../components/ui/Primitives';
import { 
    LayoutDashboard, FileText, Calendar, MessageSquare, 
    CreditCard, CheckCircle2, Clock, ArrowUpRight, 
    Download, Send, LogOut, Sun, MoreHorizontal, Bell,
    PenTool, Video, Briefcase, ChevronRight, User
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useNotifications } from '../components/ui/NotificationSystem';
import { ClientProfile, Invoice, Document, Appointment } from '../types';

export const ClientPortal: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
    const { invoices, documents, appointments, messages, addMessage, userProfile } = useData();
    const { addNotification } = useNotifications();
    const [activeSection, setActiveSection] = useState<'dashboard' | 'projects' | 'finance' | 'docs' | 'messages'>('dashboard');
    
    // Mock Client Identity (usually from auth)
    const client: ClientProfile = {
        id: 'cl-1',
        name: 'Sarah Connor',
        company: 'Skynet',
        email: 'sarah@skynet.com',
        avatar: 'SC'
    };

    // Filter data for this specific client
    const clientInvoices = invoices.filter(i => i.client === client.company || i.client === client.name);
    const clientDocs = documents.filter(d => d.client === client.company || d.client === client.name);
    const clientAppointments = appointments.filter(a => a.clientName === client.name);
    
    const [replyText, setReplyText] = useState('');

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!replyText.trim()) return;
        
        addMessage({
            id: Date.now().toString(),
            conversationId: 'c1', // Static for demo
            sender: 'them',
            text: replyText,
            timestamp: 'Just now'
        });
        setReplyText('');
        addNotification({ title: 'Message Sent', message: 'The Echoes team will reply shortly.', type: 'success' });
    };

    const renderDashboard = () => (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-gradient-to-br from-primary-600 to-indigo-700 text-white border-none shadow-xl">
                    <h3 className="text-sm font-bold uppercase tracking-widest opacity-80 mb-2">Project Progress</h3>
                    <div className="flex items-end justify-between mt-4">
                        <span className="text-4xl font-bold">85%</span>
                        <Badge className="bg-white/20 text-white border-none mb-1">On Track</Badge>
                    </div>
                    <div className="w-full h-1.5 bg-white/20 rounded-full mt-6 overflow-hidden">
                        <div className="h-full bg-white w-[85%] rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]"></div>
                    </div>
                </Card>
                
                <Card className="hover:border-primary-300 transition-all cursor-pointer" onClick={() => setActiveSection('finance')}>
                    <div className="flex items-start justify-between">
                        <div>
                            <h3 className="text-xs font-bold text-text-tertiary uppercase tracking-widest mb-1">Open Invoices</h3>
                            <p className="text-2xl font-bold text-text-primary dark:text-text-primary-dark">
                                ${clientInvoices.filter(i => i.status !== 'Paid').reduce((acc, i) => acc + i.amount, 0).toLocaleString()}
                            </p>
                        </div>
                        <div className="p-2 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-lg">
                            <CreditCard className="w-5 h-5" />
                        </div>
                    </div>
                    <Button variant="ghost" size="sm" className="mt-4 w-full h-8 text-[10px]">View Billing Details</Button>
                </Card>

                <Card className="hover:border-primary-300 transition-all cursor-pointer" onClick={() => setActiveSection('messages')}>
                    <div className="flex items-start justify-between">
                        <div>
                            <h3 className="text-xs font-bold text-text-tertiary uppercase tracking-widest mb-1">Messages</h3>
                            <p className="text-2xl font-bold text-text-primary dark:text-text-primary-dark">2 New</p>
                        </div>
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg relative">
                            <MessageSquare className="w-5 h-5" />
                            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                        </div>
                    </div>
                    <Button variant="ghost" size="sm" className="mt-4 w-full h-8 text-[10px]">Open Chat</Button>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card padding="p-0" className="overflow-hidden">
                    <div className="p-6 border-b border-border dark:border-border-dark flex items-center justify-between bg-surface-subtle/30">
                        <h3 className="font-bold flex items-center gap-2"><Briefcase className="w-4 h-4 text-primary-500" /> Milestone Tracking</h3>
                        <Badge variant="neutral">Phase 2: Execution</Badge>
                    </div>
                    <div className="p-6 space-y-6">
                        {[
                            { title: 'Brand Architecture Design', status: 'Completed', date: 'Oct 12' },
                            { title: 'Marketing Automation Setup', status: 'In Progress', date: 'Oct 28' },
                            { title: 'Launch Campaign Pilot', status: 'Upcoming', date: 'Nov 05' },
                        ].map((m, i) => (
                            <div key={i} className="flex gap-4 items-start">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${
                                    m.status === 'Completed' ? 'bg-green-50 border-green-200 text-green-600' :
                                    m.status === 'In Progress' ? 'bg-primary-50 border-primary-200 text-primary-600' :
                                    'bg-surface-muted border-border text-text-tertiary'
                                }`}>
                                    {m.status === 'Completed' ? <CheckCircle2 className="w-4 h-4" /> : <span className="text-xs font-bold">{i+1}</span>}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between">
                                        <h4 className={`text-sm font-bold ${m.status === 'Upcoming' ? 'text-text-tertiary' : 'text-text-primary dark:text-text-primary-dark'}`}>{m.title}</h4>
                                        <span className="text-xs text-text-tertiary">{m.date}</span>
                                    </div>
                                    <p className="text-xs text-text-secondary mt-0.5">{m.status}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                <Card padding="p-0" className="overflow-hidden">
                    <div className="p-6 border-b border-border dark:border-border-dark flex items-center justify-between bg-surface-subtle/30">
                        <h3 className="font-bold flex items-center gap-2"><Calendar className="w-4 h-4 text-primary-500" /> Upcoming Meetings</h3>
                        <Button size="sm" variant="secondary" icon={Video}>Book Session</Button>
                    </div>
                    <div className="p-6 space-y-4">
                        {clientAppointments.length > 0 ? clientAppointments.map((apt, i) => (
                            <div key={i} className="flex items-center justify-between p-4 bg-surface-subtle dark:bg-surface-muted-dark rounded-xl border border-border dark:border-border-dark">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-white dark:bg-surface-dark flex items-center justify-center text-primary-600 shadow-sm border border-border/50">
                                        <Clock className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold">{apt.type}</h4>
                                        <p className="text-xs text-text-secondary">{apt.date} at {apt.time}</p>
                                    </div>
                                </div>
                                <Button size="sm" icon={ArrowUpRight} className="h-8 w-8 p-0" />
                            </div>
                        )) : (
                            <div className="text-center py-10">
                                <p className="text-sm text-text-tertiary">No upcoming sessions.</p>
                            </div>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );

    const renderFinance = () => (
        <Card padding="p-0" className="animate-in fade-in slide-in-from-right-4">
            <div className="p-6 border-b border-border dark:border-border-dark flex items-center justify-between">
                <h3 className="font-bold text-lg">Billing & Payments</h3>
                <div className="flex items-center gap-2">
                    <div className="text-right mr-4">
                        <p className="text-xs text-text-tertiary uppercase font-bold">Client Credit</p>
                        <p className="text-sm font-bold text-green-600">$0.00</p>
                    </div>
                    <Button size="sm" icon={CreditCard}>Manage Wallet</Button>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-surface-subtle text-xs font-bold text-text-tertiary uppercase">
                        <tr>
                            <th className="px-6 py-4">Invoice #</th>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4">Amount</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {clientInvoices.map(inv => (
                            <tr key={inv.id} className="hover:bg-surface-subtle/50 transition-colors">
                                <td className="px-6 py-4 text-sm font-bold">{inv.id}</td>
                                <td className="px-6 py-4 text-sm text-text-secondary">{inv.date}</td>
                                <td className="px-6 py-4 text-sm font-bold">${inv.amount.toLocaleString()}</td>
                                <td className="px-6 py-4">
                                    <Badge variant={inv.status === 'Paid' ? 'success' : 'warning'}>{inv.status}</Badge>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    {inv.status !== 'Paid' ? (
                                        <Button size="sm" className="h-7 text-xs">Pay Now</Button>
                                    ) : (
                                        <Button size="sm" variant="ghost" icon={Download} className="h-7 w-7 p-0" />
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    );

    const renderDocs = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
            {clientDocs.map(doc => (
                <Card key={doc.id} className="group hover:border-primary-300 transition-all cursor-pointer relative">
                    <div className="absolute top-4 right-4">
                        <MoreHorizontal className="w-4 h-4 text-text-tertiary group-hover:text-text-primary" />
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 flex items-center justify-center mb-4">
                        <FileText className="w-6 h-6" />
                    </div>
                    <h4 className="font-bold text-text-primary dark:text-text-primary-dark">{doc.title}</h4>
                    <p className="text-xs text-text-secondary mt-1">{doc.type} • Modified {doc.lastModified}</p>
                    
                    <div className="mt-6 pt-4 border-t border-border dark:border-border-dark flex items-center justify-between">
                         <Badge variant={doc.status === 'Signed' ? 'success' : 'brand'}>{doc.status}</Badge>
                         <div className="flex gap-2">
                             {doc.status !== 'Signed' && <Button size="sm" variant="secondary" icon={PenTool} className="h-8 text-[10px]">Review & Sign</Button>}
                             <Button size="sm" variant="ghost" icon={Download} className="h-8 w-8 p-0" />
                         </div>
                    </div>
                </Card>
            ))}
            <div className="border-2 border-dashed border-border dark:border-border-dark rounded-xl flex flex-col items-center justify-center p-8 text-text-tertiary hover:text-primary-500 hover:border-primary-300 transition-all cursor-pointer">
                <Send className="w-8 h-8 mb-2 opacity-40" />
                <p className="text-sm font-bold">Upload File</p>
                <p className="text-[10px] mt-1">Directly to the team</p>
            </div>
        </div>
    );

    const renderMessages = () => {
        // Find existing conversation for Skynet/Sarah
        const currentMessages = messages.filter(m => m.conversationId === 'c1');
        
        return (
            <div className="h-[600px] flex flex-col bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-2xl overflow-hidden shadow-xl animate-in slide-in-from-bottom-6">
                <div className="px-6 py-4 border-b border-border dark:border-border-dark bg-surface-subtle/30 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold">EV</div>
                    <div>
                        <h4 className="font-bold text-text-primary dark:text-text-primary-dark">Echoes Strategy Team</h4>
                        <p className="text-xs text-green-500 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> We're online</p>
                    </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-surface-subtle/10">
                    {currentMessages.map(msg => {
                        const isMe = msg.sender === 'them'; // From client's perspective
                        return (
                            <div key={msg.id} className={`flex gap-4 ${isMe ? 'flex-row-reverse' : ''}`}>
                                 <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${isMe ? 'bg-primary-600 text-white' : 'bg-surface-muted text-text-secondary border border-border'}`}>
                                     {isMe ? 'Me' : 'EV'}
                                 </div>
                                 <div className={`max-w-[70%] space-y-1`}>
                                     <div className={`p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap shadow-sm ${
                                         isMe 
                                         ? 'bg-primary-600 text-white rounded-tr-none' 
                                         : 'bg-white dark:bg-surface-muted-dark border border-border dark:border-border-dark text-text-primary dark:text-text-primary-dark rounded-tl-none'
                                     }`}>
                                         {msg.text}
                                     </div>
                                     <p className={`text-[10px] text-text-tertiary ${isMe ? 'text-right' : 'text-left'}`}>{msg.timestamp}</p>
                                 </div>
                            </div>
                        );
                    })}
                </div>

                <form onSubmit={handleSendMessage} className="p-4 border-t border-border dark:border-border-dark bg-surface">
                    <div className="relative">
                        <textarea 
                            className="w-full p-4 pr-12 bg-surface-subtle dark:bg-surface-muted-dark border border-border dark:border-border-dark rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-100 min-h-[100px] resize-none"
                            placeholder="Type a message to the team..."
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                        ></textarea>
                        <div className="flex justify-end mt-3">
                            <Button type="submit" icon={Send}>Send Message</Button>
                        </div>
                    </div>
                </form>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-surface-subtle dark:bg-[#0B1120] text-text-primary dark:text-white font-sans flex flex-col">
            {/* Simple Client Nav */}
            <nav className="fixed top-0 w-full z-50 bg-surface/80 dark:bg-surface-dark/80 backdrop-blur-md border-b border-border/50 dark:border-white/10 h-16 flex items-center px-6">
                <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-600 rounded-lg flex items-center justify-center text-white">
                            <Sun className="w-4 h-4 fill-white" />
                        </div>
                        <span className="font-serif font-bold text-lg hidden sm:block">Echoes Portal</span>
                    </div>
                    
                    <div className="flex items-center gap-6">
                        <div className="relative">
                            <Bell className="w-5 h-5 text-text-tertiary hover:text-primary-500 cursor-pointer transition-colors" />
                            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-surface"></span>
                        </div>
                        <div className="h-6 w-px bg-border dark:bg-white/10"></div>
                        <div className="flex items-center gap-3">
                            <div className="text-right hidden md:block">
                                <p className="text-xs font-bold leading-tight">{client.name}</p>
                                <p className="text-[10px] text-text-tertiary leading-tight">{client.company}</p>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-surface-muted border border-border flex items-center justify-center font-bold text-xs">
                                {client.avatar}
                            </div>
                            <button onClick={onLogout} className="p-2 text-text-tertiary hover:text-red-500 transition-colors">
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="pt-24 pb-20 flex-1 px-6">
                <div className="max-w-7xl mx-auto h-full flex flex-col lg:flex-row gap-10">
                    {/* Client Sidebar */}
                    <div className="w-full lg:w-64 flex flex-col gap-1 shrink-0">
                        {[
                            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
                            { id: 'projects', label: 'Project Progress', icon: Briefcase },
                            { id: 'finance', label: 'Billing', icon: CreditCard },
                            { id: 'docs', label: 'Files & Docs', icon: FileText },
                            { id: 'messages', label: 'Messages', icon: MessageSquare },
                        ].map(nav => (
                            <button
                                key={nav.id}
                                onClick={() => setActiveSection(nav.id as any)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                                    activeSection === nav.id 
                                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20' 
                                    : 'text-text-secondary hover:bg-surface dark:hover:bg-white/5 hover:text-text-primary'
                                }`}
                            >
                                <nav.icon className="w-4 h-4" />
                                {nav.label}
                                {nav.id === 'messages' && <Badge className="ml-auto bg-red-100 text-red-600 border-none px-1.5 py-0">2</Badge>}
                            </button>
                        ))}
                        
                        <div className="mt-10 p-4 rounded-2xl bg-surface dark:bg-white/5 border border-border dark:border-white/10 text-center">
                            <Badge variant="brand" className="mb-2">Support</Badge>
                            <p className="text-xs text-text-secondary leading-relaxed">Need urgent assistance with your account?</p>
                            <Button size="sm" variant="ghost" className="w-full mt-4 border border-border dark:border-white/20">Contact Agent</Button>
                        </div>
                    </div>

                    {/* Portal Content Area */}
                    <div className="flex-1 min-w-0">
                        <SectionHeader 
                            title={activeSection.charAt(0).toUpperCase() + activeSection.slice(1)} 
                            subtitle={`Welcome back to your portal, ${client.name.split(' ')[0]}.`} 
                        />
                        
                        {activeSection === 'dashboard' && renderDashboard()}
                        {activeSection === 'finance' && renderFinance()}
                        {activeSection === 'docs' && renderDocs()}
                        {activeSection === 'messages' && renderMessages()}
                        {activeSection === 'projects' && (
                            <div className="text-center py-20 text-text-tertiary">
                                <Briefcase className="w-16 h-16 mx-auto mb-4 opacity-20" />
                                <p className="text-lg font-bold">Phase 2: Operational Architecture</p>
                                <p className="max-w-md mx-auto mt-2">We are currently configuring your automated deal flow. Real-time task tracking will appear here as we move to Phase 3.</p>
                                <Button variant="secondary" className="mt-8" icon={ChevronRight}>View Full Roadmap</Button>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <footer className="py-8 px-6 border-t border-border dark:border-white/10 text-center">
                <p className="text-xs text-text-tertiary">
                    Secure Client Access Provided by <strong className="text-primary-600">Echoes & Visions Inc.</strong>
                </p>
            </footer>
        </div>
    );
};
