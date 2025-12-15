
import React, { useState } from 'react';
import { 
    Search, FileText, PlayCircle, MessageSquare, ChevronRight, 
    BookOpen, Layers, Users, Zap, Calendar, CreditCard, 
    Filter, Briefcase, BarChart2, Inbox, HardDrive, 
    Share2, Target, PenTool, Mic, ScanLine, Settings,
    Lightbulb, Info, Grid, Bot, Check, Sparkles, Keyboard
} from 'lucide-react';
import { SectionHeader, Card, Input, Button, Badge } from '../components/ui/Primitives';

type TopicId = 'start' | 'whats_new' | 'shortcuts' | 'dashboard' | 'crm' | 'bookings' | 'automations' | 'payments' | 'funnels' | 'documents' | 'projects' | 'analytics' | 'inbox' | 'storage' | 'strategy' | 'social' | 'team' | 'canvas' | 'campaigns' | 'scan' | 'marketplace' | 'assistant' | 'settings';

interface HelpTopic {
    id: TopicId;
    title: string;
    icon: React.ElementType;
    description: string;
    content: React.ReactNode;
}

export const Help: React.FC = () => {
    const [activeTopic, setActiveTopic] = useState<TopicId>('start');
    const [searchQuery, setSearchQuery] = useState('');

    const TOPICS: HelpTopic[] = [
        {
            id: 'start',
            title: 'Getting Started',
            icon: BookOpen,
            description: 'Welcome to Nexus Business OS. Start here.',
            content: (
                <div className="space-y-8">
                    <section>
                        <h3 className="text-2xl font-bold text-text-primary dark:text-text-primary-dark mb-4">Welcome to Nexus</h3>
                        <p className="text-text-secondary dark:text-text-secondary-dark leading-relaxed text-lg">
                            Nexus is your all-in-one Business Operating System. It consolidates CRM, Project Management, Invoicing, and AI Automation into a single, cohesive platform.
                        </p>
                    </section>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-xl border border-primary-100 dark:border-primary-800">
                            <h4 className="font-bold text-primary-800 dark:text-primary-200 mb-2 flex items-center gap-2">
                                <Zap className="w-4 h-4" /> Quick Actions
                            </h4>
                            <p className="text-sm text-primary-700 dark:text-primary-300">
                                Use <code className="bg-white dark:bg-black/20 px-1.5 py-0.5 rounded font-mono">Cmd+K</code> (or Ctrl+K) anywhere to open the Command Menu. It allows you to navigate or create items instantly.
                            </p>
                        </div>
                        <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-800">
                            <h4 className="font-bold text-emerald-800 dark:text-emerald-200 mb-2 flex items-center gap-2">
                                <Bot className="w-4 h-4" /> AI Powered
                            </h4>
                            <p className="text-sm text-emerald-700 dark:text-emerald-300">
                                Look for the <strong>Sparkles</strong> icon throughout the app. Nexus AI can draft emails, summarize documents, and analyze your data.
                            </p>
                        </div>
                    </div>

                    <section>
                        <h4 className="font-bold text-lg text-text-primary dark:text-text-primary-dark mb-4">Navigation Basics</h4>
                        <ul className="space-y-3">
                            <li className="flex gap-3 items-start">
                                <div className="mt-1 min-w-6 h-6 rounded-full bg-surface-muted dark:bg-surface-muted-dark flex items-center justify-center text-xs font-bold text-text-secondary">1</div>
                                <div>
                                    <span className="font-semibold text-text-primary dark:text-text-primary-dark block">Sidebar Modules</span>
                                    <span className="text-text-secondary dark:text-text-secondary-dark text-sm">Access different apps like CRM, Inbox, and Projects from the left menu.</span>
                                </div>
                            </li>
                            <li className="flex gap-3 items-start">
                                <div className="mt-1 min-w-6 h-6 rounded-full bg-surface-muted dark:bg-surface-muted-dark flex items-center justify-center text-xs font-bold text-text-secondary">2</div>
                                <div>
                                    <span className="font-semibold text-text-primary dark:text-text-primary-dark block">Global Search</span>
                                    <span className="text-text-secondary dark:text-text-secondary-dark text-sm">Use the top search bar to find contacts, deals, invoices, or files across the entire OS.</span>
                                </div>
                            </li>
                        </ul>
                    </section>
                </div>
            )
        },
        {
            id: 'whats_new',
            title: 'What\'s New',
            icon: Sparkles,
            description: 'Latest features and updates in Nexus.',
            content: (
                <div className="space-y-8">
                    <section>
                        <h3 className="text-2xl font-bold text-text-primary dark:text-text-primary-dark mb-6">Release Notes v2.4</h3>
                        
                        <div className="space-y-6">
                            <div className="flex gap-4">
                                <div className="shrink-0 w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                    <Mic className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg text-text-primary dark:text-text-primary-dark">Gemini Live Voice Mode</h4>
                                    <p className="text-text-secondary dark:text-text-secondary-dark mt-1">
                                        Have natural, real-time conversations with your business data. Ask Nexus to brief you on your schedule, summarize financial reports, or analyze deal pipelines while you're on the go.
                                    </p>
                                    <Badge variant="brand" className="mt-2">AI Assistant</Badge>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="shrink-0 w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                                    <ScanLine className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg text-text-primary dark:text-text-primary-dark">Smart Scan</h4>
                                    <p className="text-text-secondary dark:text-text-secondary-dark mt-1">
                                        Instantly digitize physical receipts and business cards. Nexus extracts key information like vendor names, amounts, and contact details to auto-populate your CRM and Finance records.
                                    </p>
                                    <Badge variant="success" className="mt-2">Productivity</Badge>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="shrink-0 w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center text-amber-600 dark:text-amber-400">
                                    <Settings className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg text-text-primary dark:text-text-primary-dark">Advanced Automations</h4>
                                    <p className="text-text-secondary dark:text-text-secondary-dark mt-1">
                                        Visual workflow builder now supports conditional logic paths and multi-step actions. Connect triggers like "New Lead" to actions like "Send Email" and "Create Task".
                                    </p>
                                    <Badge variant="warning" className="mt-2">Workflow</Badge>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            )
        },
        {
            id: 'shortcuts',
            title: 'Keyboard Shortcuts',
            icon: Keyboard,
            description: 'Navigate Nexus faster.',
            content: (
                <div className="space-y-6">
                    <p className="text-text-secondary dark:text-text-secondary-dark">
                        Become a power user with these essential keyboard shortcuts.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card className="flex items-center justify-between p-4">
                            <span className="font-medium">Open Command Menu</span>
                            <div className="flex gap-1">
                                <kbd className="px-2 py-1 bg-surface-subtle dark:bg-surface-subtle-dark border border-border dark:border-border-dark rounded text-xs font-mono">Cmd</kbd>
                                <kbd className="px-2 py-1 bg-surface-subtle dark:bg-surface-subtle-dark border border-border dark:border-border-dark rounded text-xs font-mono">K</kbd>
                            </div>
                        </Card>
                        <Card className="flex items-center justify-between p-4">
                            <span className="font-medium">Global Search</span>
                            <div className="flex gap-1">
                                <kbd className="px-2 py-1 bg-surface-subtle dark:bg-surface-subtle-dark border border-border dark:border-border-dark rounded text-xs font-mono">/</kbd>
                            </div>
                        </Card>
                        <Card className="flex items-center justify-between p-4">
                            <span className="font-medium">Close Modal / Drawer</span>
                            <div className="flex gap-1">
                                <kbd className="px-2 py-1 bg-surface-subtle dark:bg-surface-subtle-dark border border-border dark:border-border-dark rounded text-xs font-mono">Esc</kbd>
                            </div>
                        </Card>
                        <Card className="flex items-center justify-between p-4">
                            <span className="font-medium">Save Changes</span>
                            <div className="flex gap-1">
                                <kbd className="px-2 py-1 bg-surface-subtle dark:bg-surface-subtle-dark border border-border dark:border-border-dark rounded text-xs font-mono">Cmd</kbd>
                                <kbd className="px-2 py-1 bg-surface-subtle dark:bg-surface-subtle-dark border border-border dark:border-border-dark rounded text-xs font-mono">S</kbd>
                            </div>
                        </Card>
                        <Card className="flex items-center justify-between p-4">
                            <span className="font-medium">Toggle Dark Mode</span>
                            <div className="flex gap-1">
                                <kbd className="px-2 py-1 bg-surface-subtle dark:bg-surface-subtle-dark border border-border dark:border-border-dark rounded- text-xs font-mono">Cmd</kbd>
                                <kbd className="px-2 py-1 bg-surface-subtle dark:bg-surface-subtle-dark border border-border dark:border-border-dark rounded text-xs font-mono">\</kbd>
                            </div>
                        </Card>
                        <Card className="flex items-center justify-between p-4">
                            <span className="font-medium">Navigate Tabs</span>
                            <div className="flex gap-1">
                                <kbd className="px-2 py-1 bg-surface-subtle dark:bg-surface-subtle-dark border border-border dark:border-border-dark rounded text-xs font-mono">Tab</kbd>
                            </div>
                        </Card>
                    </div>
                </div>
            )
        },
        {
            id: 'dashboard',
            title: 'Dashboard',
            icon: Layers,
            description: 'Your daily command center.',
            content: (
                <div className="space-y-6">
                    <p className="text-text-secondary dark:text-text-secondary-dark">
                        The Dashboard gives you a real-time pulse of your business.
                    </p>
                    <ul className="list-disc pl-5 space-y-2 text-text-secondary dark:text-text-secondary-dark">
                        <li><strong>AI Brief:</strong> A daily summary generated by AI analyzing your recent sales, schedule, and tasks.</li>
                        <li><strong>Key Metrics:</strong> Real-time charts for Revenue, Active Leads, and Conversion Rates.</li>
                        <li><strong>Nexus Pulse:</strong> A live feed of important events (e.g., "Invoice Paid", "New Lead").</li>
                        <li><strong>Upcoming:</strong> Your next 3 scheduled appointments or meetings.</li>
                    </ul>
                </div>
            )
        },
        {
            id: 'assistant',
            title: 'AI Assistant',
            icon: Bot,
            description: 'Voice and chat assistant.',
            content: (
                <div className="space-y-6">
                    <p className="text-text-secondary dark:text-text-secondary-dark">
                        Nexus Assistant is aware of your entire business context. It can answer questions about your data.
                    </p>
                    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 rounded-xl text-white">
                        <h4 className="font-bold flex items-center gap-2 mb-2"><Mic className="w-5 h-5" /> Voice Mode</h4>
                        <p className="text-sm opacity-90 mb-4">
                            Tap the microphone icon to have a real-time voice conversation. You can ask things like:
                        </p>
                        <ul className="list-disc pl-5 text-sm space-y-1 opacity-90">
                            <li>"Brief me on my schedule for today."</li>
                            <li>"Who are my top paying clients?"</li>
                            <li>"What is my total revenue this month?"</li>
                        </ul>
                    </div>
                    <p className="text-text-secondary dark:text-text-secondary-dark">
                        The assistant has read-access to your CRM, Calendar, and Invoices, so it provides accurate, data-backed answers.
                    </p>
                </div>
            )
        },
        {
            id: 'crm',
            title: 'CRM',
            icon: Users,
            description: 'Customer Relationship Management.',
            content: (
                <div className="space-y-6">
                    <p className="text-text-secondary dark:text-text-secondary-dark">
                        Manage your sales pipeline and customer database.
                    </p>
                    <div className="space-y-4">
                        <div className="border-l-4 border-primary-500 pl-4 bg-surface-subtle dark:bg-surface-subtle-dark p-3 rounded-r-lg">
                            <h4 className="font-bold text-text-primary dark:text-text-primary-dark">Deals (Kanban)</h4>
                            <p className="text-sm text-text-secondary dark:text-text-secondary-dark mt-1">
                                Visualize your sales process. Drag cards between <strong>Lead</strong>, <strong>Proposal</strong>, and <strong>Closed</strong>. 
                                Click a deal to see AI options like "Draft Email" or "Summarize".
                            </p>
                        </div>
                        <div className="border-l-4 border-emerald-500 pl-4 bg-surface-subtle dark:bg-surface-subtle-dark p-3 rounded-r-lg">
                            <h4 className="font-bold text-text-primary dark:text-text-primary-dark">Customer 360</h4>
                            <p className="text-sm text-text-secondary dark:text-text-secondary-dark mt-1">
                                In the <strong>Contacts</strong> tab, click any person to open their profile. This shows a unified view of their emails, invoices, and projects.
                            </p>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 'bookings',
            title: 'Bookings',
            icon: Calendar,
            description: 'Schedule and service management.',
            content: (
                <div className="space-y-6">
                    <p className="text-text-secondary dark:text-text-secondary-dark">
                        A complete scheduling system for service-based businesses.
                    </p>
                    <ul className="list-disc pl-5 space-y-2 text-text-secondary dark:text-text-secondary-dark">
                        <li><strong>Calendar View:</strong> See all upcoming appointments.</li>
                        <li><strong>Services:</strong> Define what you offer (e.g., "Consultation - $100"). These services appear in your booking link.</li>
                        <li><strong>New Session:</strong> Click "New Session" to manually book a client.</li>
                    </ul>
                </div>
            )
        },
        {
            id: 'automations',
            title: 'Automations',
            icon: Zap,
            description: 'Visual workflow builder.',
            content: (
                <div className="space-y-6">
                    <p className="text-text-secondary dark:text-text-secondary-dark">
                        Automate repetitive tasks using the visual node editor.
                    </p>
                    <section className="bg-surface-subtle dark:bg-surface-subtle-dark p-4 rounded-xl border border-border dark:border-border-dark">
                        <h4 className="font-bold text-text-primary dark:text-text-primary-dark mb-2">Building a Workflow</h4>
                        <ol className="list-decimal pl-5 space-y-2 text-sm text-text-secondary dark:text-text-secondary-dark">
                            <li><strong>Trigger:</strong> Start with a green node (e.g., "New Lead").</li>
                            <li><strong>Logic:</strong> Add yellow nodes for conditions (e.g., "If Value > $1k").</li>
                            <li><strong>Action:</strong> Add blue/red nodes to perform tasks (e.g., "Send Email", "Create Task").</li>
                            <li><strong>Connect:</strong> Drag lines between nodes to define the path.</li>
                        </ol>
                    </section>
                </div>
            )
        },
        {
            id: 'payments',
            title: 'Payments',
            icon: CreditCard,
            description: 'Invoicing and Stripe integration.',
            content: (
                <div className="space-y-6">
                    <p className="text-text-secondary dark:text-text-secondary-dark">
                        Track revenue, create invoices, and manage products.
                    </p>
                    <ul className="list-disc pl-5 space-y-2 text-text-secondary dark:text-text-secondary-dark">
                        <li><strong>Stripe Integration:</strong> Click "Connect Stripe" to enable credit card processing. Once connected, you can charge cards directly.</li>
                        <li><strong>Invoices:</strong> Create professional invoices. Statuses update automatically when paid.</li>
                        <li><strong>Products:</strong> Manage your catalog of items or subscriptions.</li>
                    </ul>
                </div>
            )
        },
        {
            id: 'funnels',
            title: 'Funnels',
            icon: Filter,
            description: 'Landing pages and conversion tracking.',
            content: (
                <div className="space-y-6">
                    <p className="text-text-secondary dark:text-text-secondary-dark">
                        Design multi-step marketing funnels.
                    </p>
                    <div className="space-y-2 text-text-secondary dark:text-text-secondary-dark">
                        <p><strong>Builder:</strong> Click on a funnel to edit steps. You can see the conversion drop-off between steps (e.g., Traffic -> Page -> Sale).</p>
                        <p><strong>Simulator:</strong> Adjust visitor counts and conversion rates to forecast revenue.</p>
                    </div>
                </div>
            )
        },
        {
            id: 'documents',
            title: 'Documents',
            icon: FileText,
            description: 'Proposals and contracts.',
            content: (
                <div className="space-y-6">
                    <p className="text-text-secondary dark:text-text-secondary-dark">
                        Create beautiful, branded documents.
                    </p>
                    <ul className="list-disc pl-5 space-y-2 text-text-secondary dark:text-text-secondary-dark">
                        <li><strong>Templates:</strong> Use pre-made templates like "Marketing Proposal" or "NDA".</li>
                        <li><strong>AI Writer:</strong> Use the "AI Magic Writer" to auto-generate executive summaries based on client data.</li>
                        <li><strong>Variables:</strong> Use <code>{`{{Client.Name}}`}</code> to auto-fill details.</li>
                    </ul>
                </div>
            )
        },
        {
            id: 'projects',
            title: 'Projects',
            icon: Briefcase,
            description: 'Task management and roadmaps.',
            content: (
                <div className="space-y-6">
                    <p className="text-text-secondary dark:text-text-secondary-dark">
                        Manage complex work with your team.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card padding="p-4">
                            <h5 className="font-bold mb-1">Kanban View</h5>
                            <p className="text-xs text-text-secondary">Drag tasks between To Do, In Progress, and Done.</p>
                        </Card>
                        <Card padding="p-4">
                            <h5 className="font-bold mb-1">Gantt View</h5>
                            <p className="text-xs text-text-secondary">Visualize timelines and dependencies. Perfect for planning.</p>
                        </Card>
                    </div>
                    <p className="text-sm text-text-secondary dark:text-text-secondary-dark mt-2">
                        <strong>AI Planning:</strong> When creating a project, select "Auto-generate tasks" to have AI break down the project into steps.
                    </p>
                </div>
            )
        },
        {
            id: 'analytics',
            title: 'Analytics',
            icon: BarChart2,
            description: 'Business intelligence.',
            content: (
                <div className="space-y-6">
                    <p className="text-text-secondary dark:text-text-secondary-dark">
                        Understand your data without spreadsheets.
                    </p>
                    <ul className="list-disc pl-5 space-y-2 text-text-secondary dark:text-text-secondary-dark">
                        <li><strong>Ask Data:</strong> Use the natural language search bar (e.g., "Show me revenue by region"). AI generates the chart.</li>
                        <li><strong>Retention:</strong> View cohort analysis heatmaps to see user loyalty over time.</li>
                    </ul>
                </div>
            )
        },
        {
            id: 'inbox',
            title: 'Inbox',
            icon: Inbox,
            description: 'Unified communication.',
            content: (
                <div className="space-y-6">
                    <p className="text-text-secondary dark:text-text-secondary-dark">
                        A single place for all client communications.
                    </p>
                    <ul className="list-disc pl-5 space-y-2 text-text-secondary dark:text-text-secondary-dark">
                        <li><strong>Context Sidebar:</strong> See the sender's CRM details, active deals, and invoices while you chat.</li>
                        <li><strong>AI Draft:</strong> Click "AI Draft" to have Nexus write a reply based on the conversation history.</li>
                    </ul>
                </div>
            )
        },
        {
            id: 'storage',
            title: 'Drive',
            icon: HardDrive,
            description: 'File management.',
            content: (
                <div className="space-y-6">
                    <p className="text-text-secondary dark:text-text-secondary-dark">
                        Secure cloud storage for your assets.
                    </p>
                    <p className="text-text-secondary dark:text-text-secondary-dark">
                        Use the <strong>"Summarize Content"</strong> button to have AI read a PDF or Document and provide a 3-bullet summary.
                    </p>
                </div>
            )
        },
        {
            id: 'marketplace',
            title: 'App Store',
            icon: Grid,
            description: 'Integrations.',
            content: (
                <div className="space-y-6">
                    <p className="text-text-secondary dark:text-text-secondary-dark">
                        Connect Nexus to your favorite tools.
                    </p>
                    <ul className="list-disc pl-5 space-y-2 text-text-secondary dark:text-text-secondary-dark">
                        <li><strong>Slack:</strong> Receive notifications for new leads and payments.</li>
                        <li><strong>Gmail:</strong> Sync emails to the Inbox.</li>
                        <li><strong>Zoom:</strong> Auto-transcribe meetings.</li>
                    </ul>
                </div>
            )
        },
        {
            id: 'strategy',
            title: 'Strategy',
            icon: Target,
            description: 'OKRs and goals.',
            content: (
                <div className="space-y-6">
                    <p className="text-text-secondary dark:text-text-secondary-dark">
                        Align your team with Objectives and Key Results (OKRs).
                    </p>
                    <ul className="list-disc pl-5 space-y-2 text-text-secondary dark:text-text-secondary-dark">
                        <li><strong>Map View:</strong> A visual tree showing how goals break down into results.</li>
                        <li><strong>Check-ins:</strong> Update progress weekly to keep everyone aligned.</li>
                    </ul>
                </div>
            )
        },
        {
            id: 'social',
            title: 'Social',
            icon: Share2,
            description: 'Social media management.',
            content: (
                <div className="space-y-6">
                    <p className="text-text-secondary dark:text-text-secondary-dark">
                        Plan and publish content to Twitter, LinkedIn, and Instagram.
                    </p>
                    <p className="text-text-secondary dark:text-text-secondary-dark">
                        Use the <strong>AI Assist</strong> button to generate viral-ready posts with emojis and hashtags.
                    </p>
                </div>
            )
        },
        {
            id: 'team',
            title: 'Team',
            icon: Users,
            description: 'Directory and recruiting.',
            content: (
                <div className="space-y-6">
                    <p className="text-text-secondary dark:text-text-secondary-dark">
                        Manage your internal directory and hiring pipeline.
                    </p>
                    <ul className="list-disc pl-5 space-y-2 text-text-secondary dark:text-text-secondary-dark">
                        <li><strong>Recruiting:</strong> A Kanban board for tracking job candidates.</li>
                        <li><strong>Interview Prep:</strong> Select a candidate and click "Interview Prep" to generate questions.</li>
                    </ul>
                </div>
            )
        },
        {
            id: 'canvas',
            title: 'Canvas',
            icon: PenTool,
            description: 'Whiteboard and brainstorming.',
            content: (
                <div className="space-y-6">
                    <p className="text-text-secondary dark:text-text-secondary-dark">
                        An infinite whiteboard for ideas.
                    </p>
                    <ul className="list-disc pl-5 space-y-2 text-text-secondary dark:text-text-secondary-dark">
                        <li><strong>AI Brainstorm:</strong> Enter a topic (e.g., "Marketing Ideas"), and the AI will generate a mind map of sticky notes.</li>
                    </ul>
                </div>
            )
        },
        {
            id: 'campaigns',
            title: 'Campaigns',
            icon: Inbox,
            description: 'Email broadcasts.',
            content: (
                <div className="space-y-6">
                    <p className="text-text-secondary dark:text-text-secondary-dark">
                        Send newsletters and product updates.
                    </p>
                    <p className="text-text-secondary dark:text-text-secondary-dark">
                        The editor includes an <strong>AI Magic Writer</strong> that writes the email body based on your subject line.
                    </p>
                </div>
            )
        },
        {
            id: 'scan',
            title: 'Smart Scan',
            icon: ScanLine,
            description: 'AI document scanner.',
            content: (
                <div className="space-y-6">
                    <p className="text-text-secondary dark:text-text-secondary-dark">
                        Digitize physical documents instantly.
                    </p>
                    <ul className="list-disc pl-5 space-y-2 text-text-secondary dark:text-text-secondary-dark">
                        <li><strong>Receipts:</strong> Extracts vendor, date, and amount for Expenses.</li>
                        <li><strong>Business Cards:</strong> Extracts contact info for the CRM.</li>
                    </ul>
                </div>
            )
        },
        {
            id: 'settings',
            title: 'Settings',
            icon: Settings,
            description: 'Preferences and configuration.',
            content: (
                <div className="space-y-6">
                    <p className="text-text-secondary dark:text-text-secondary-dark">
                        Customize your Nexus experience.
                    </p>
                    <ul className="list-disc pl-5 space-y-2 text-text-secondary dark:text-text-secondary-dark">
                        <li><strong>Language:</strong> Change the platform language (20+ supported).</li>
                        <li><strong>Theme:</strong> Toggle Dark/Light mode and accent colors.</li>
                        <li><strong>Team:</strong> Invite new members via email.</li>
                    </ul>
                </div>
            )
        }
    ];

    const filteredTopics = TOPICS.filter(t => 
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        t.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const activeContent = TOPICS.find(t => t.id === activeTopic);

    return (
        <div className="h-full flex flex-col pb-6">
            <SectionHeader
                title="Help & Documentation"
                subtitle="Master the Nexus Business OS with detailed guides."
            />

            <div className="flex-1 flex flex-col lg:flex-row gap-8 min-h-0 overflow-hidden">
                {/* Sidebar Navigation */}
                <div className="w-full lg:w-80 flex flex-col gap-4 bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-xl overflow-hidden shadow-sm shrink-0">
                    <div className="p-4 border-b border-border dark:border-border-dark">
                        <Input 
                            icon={Search} 
                            placeholder="Search topics..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-surface-subtle dark:bg-surface-subtle-dark border-transparent focus:bg-surface"
                        />
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                        {filteredTopics.map(topic => (
                            <button
                                key={topic.id}
                                onClick={() => setActiveTopic(topic.id)}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all group ${
                                    activeTopic === topic.id 
                                    ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400 font-medium' 
                                    : 'text-text-secondary dark:text-text-secondary-dark hover:bg-surface-muted dark:hover:bg-surface-muted-dark hover:text-text-primary'
                                }`}
                            >
                                <topic.icon className={`w-4 h-4 ${activeTopic === topic.id ? 'text-primary-600 dark:text-primary-400' : 'text-text-tertiary group-hover:text-text-secondary'}`} />
                                <span className="flex-1 text-left rtl:text-right">{topic.title}</span>
                                {activeTopic === topic.id && <ChevronRight className="w-3 h-3 text-primary-500 rtl:rotate-180" />}
                            </button>
                        ))}
                        {filteredTopics.length === 0 && (
                            <div className="p-4 text-center text-text-tertiary text-sm">
                                No topics found.
                            </div>
                        )}
                    </div>
                    <div className="p-4 border-t border-border dark:border-border-dark bg-surface-subtle/50 dark:bg-surface-subtle-dark/50">
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-amber-50 dark:bg-amber-900/20 rounded-md">
                                    <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                                </div>
                                <span className="font-serif text-xs font-bold text-text-primary dark:text-text-primary-dark tracking-wide">
                                    ETERNAL ECHOES & VISIONS
                                </span>
                            </div>
                            
                            <div className="flex items-center gap-3 pl-1">
                                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                                    <MessageSquare className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-text-primary dark:text-text-primary-dark">Need Human Help?</p>
                                    <a href="mailto:support@eternalechoes.com" className="text-xs text-primary-600 hover:underline">Contact Support</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-xl overflow-hidden shadow-sm flex flex-col">
                    {activeContent ? (
                        <>
                            <div className="h-48 bg-gradient-to-r from-primary-600 to-indigo-700 p-8 text-white relative overflow-hidden shrink-0">
                                <div className="relative z-10">
                                    <div className="flex items-center gap-3 mb-2 opacity-80">
                                        <activeContent.icon className="w-5 h-5" />
                                        <span className="text-sm font-medium uppercase tracking-wider">Manual</span>
                                    </div>
                                    <h1 className="text-3xl font-bold mb-2">{activeContent.title}</h1>
                                    <p className="text-indigo-100 max-w-xl text-lg">{activeContent.description}</p>
                                </div>
                                {/* Decorative Background Icon */}
                                <activeContent.icon className="absolute -bottom-6 -right-6 w-64 h-64 text-white opacity-10 rotate-12" />
                            </div>

                            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                                <div className="max-w-3xl mx-auto prose prose-slate dark:prose-invert">
                                    {activeContent.content}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-text-tertiary">
                            <BookOpen className="w-16 h-16 mb-4 opacity-20" />
                            <p>Select a topic to view documentation.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
