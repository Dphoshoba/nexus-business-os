
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Deal, Contact, Company, Invoice, Product, Appointment, Service, Funnel, Document, Project, Task, TeamMember, UserProfile, AutomationNode, Conversation, Message, FileItem, Goal, SocialPost, Candidate, CanvasItem, Campaign, AccentColor, EmailConfig, SubscriptionPlan, AppModule, Integration, Expense } from '../types';
import { INITIAL_DEALS, MOCK_CONTACTS, MOCK_COMPANIES, MOCK_INVOICES, UPCOMING_APPOINTMENTS, MOCK_EXPENSES } from '../constants';

// RGB values for Tailwind Colors
const PALETTES: Record<AccentColor, Record<number, string>> = {
    violet: { 
        50: '245 243 255', 100: '237 233 254', 200: '221 214 254', 300: '196 181 253', 
        400: '167 139 250', 500: '139 92 246', 600: '124 58 237', 700: '109 40 217', 
        800: '91 33 182', 900: '76 29 149' 
    },
    blue: {
        50: '239 246 255', 100: '219 234 254', 200: '191 219 254', 300: '147 197 253',
        400: '96 165 250', 500: '59 130 246', 600: '37 99 235', 700: '29 78 216',
        800: '30 64 175', 900: '30 58 138'
    },
    emerald: {
        50: '236 253 245', 100: '209 250 229', 200: '167 243 208', 300: '110 231 183',
        400: '52 211 153', 500: '16 185 129', 600: '5 150 105', 700: '4 120 87',
        800: '6 95 70', 900: '6 78 59'
    },
    rose: {
        50: '255 241 242', 100: '255 228 230', 200: '254 205 211', 300: '253 164 175',
        400: '251 113 133', 500: '244 63 94', 600: '225 29 72', 700: '190 18 60',
        800: '159 18 57', 900: '136 19 55'
    },
    amber: {
        50: '255 251 235', 100: '254 243 199', 200: '253 230 138', 300: '252 211 77',
        400: '251 191 36', 500: '245 158 11', 600: '217 119 6', 700: '180 83 9',
        800: '146 64 14', 900: '120 53 15'
    },
    cyan: {
        50: '236 254 255', 100: '207 250 254', 200: '165 243 252', 300: '103 232 249',
        400: '34 211 238', 500: '6 182 212', 600: '8 145 178', 700: '14 116 144',
        800: '21 94 117', 900: '22 78 99'
    }
};

interface DataContextType {
  // Global
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  accentColor: AccentColor;
  setAccentColor: (color: AccentColor) => void;
  subscriptionPlan: SubscriptionPlan;
  setSubscriptionPlan: (plan: SubscriptionPlan) => void;
  enabledModules: AppModule[];
  toggleModule: (module: AppModule) => void;
  stripeConnected: boolean;
  setStripeConnected: (connected: boolean) => void;
  paypalConnected: boolean;
  setPaypalConnected: (connected: boolean) => void;
  emailConfig: EmailConfig;
  updateEmailConfig: (config: EmailConfig) => void;
  sendEmail: (to: string, subject: string, body: string) => Promise<boolean>;
  consumeAiCredit: () => boolean; // Returns true if successful, false if out of credits

  // Integrations
  integrations: Integration[];
  connectIntegration: (integration: Omit<Integration, 'status' | 'lastSync'>) => void;
  disconnectIntegration: (id: string) => void;
  isIntegrationConnected: (id: string) => boolean;
  triggerIntegrationAction: (integrationId: string, action: string, data: any) => Promise<boolean>;

  // CRM
  deals: Deal[];
  addDeal: (deal: Deal) => void;
  updateDeal: (deal: Deal) => void;
  contacts: Contact[];
  addContact: (contact: Contact) => void;
  companies: Company[];
  addCompany: (company: Company) => void;
  
  // Payments
  invoices: Invoice[];
  addInvoice: (invoice: Invoice) => void;
  updateInvoice: (invoice: Invoice) => void;
  expenses: Expense[];
  addExpense: (expense: Expense) => void;
  products: Product[];
  addProduct: (product: Product) => void;
  
  // Bookings
  appointments: Appointment[];
  addAppointment: (appointment: Appointment) => void;
  services: Service[];
  addService: (service: Service) => void;

  // Funnels
  funnels: Funnel[];
  addFunnel: (funnel: Funnel) => void;
  updateFunnel: (funnel: Funnel) => void;

  // Documents
  documents: Document[];
  addDocument: (doc: Document) => void;
  updateDocument: (doc: Document) => void;
  deleteDocument: (id: string) => void;

  // Projects
  projects: Project[];
  addProject: (project: Project) => void;
  tasks: Task[];
  addTask: (task: Task) => void;
  updateTask: (task: Task) => void;

  // Inbox
  conversations: Conversation[];
  messages: Message[];
  addMessage: (msg: Message) => void;
  markConversationRead: (id: string) => void;

  // Storage
  files: FileItem[];
  addFile: (file: FileItem) => void;
  deleteFile: (id: string) => void;
  toggleStarFile: (id: string) => void;

  // Strategy (Goals)
  goals: Goal[];
  addGoal: (goal: Goal) => void;
  updateGoal: (goal: Goal) => void;

  // Social
  socialPosts: SocialPost[];
  addSocialPost: (post: SocialPost) => void;
  updateSocialPost: (post: SocialPost) => void;
  deleteSocialPost: (id: string) => void;

  // Team & Recruiting
  candidates: Candidate[];
  addCandidate: (candidate: Candidate) => void;
  updateCandidate: (candidate: Candidate) => void;

  // Canvas
  canvasItems: CanvasItem[];
  setCanvasItems: (items: CanvasItem[]) => void;
  addCanvasItem: (item: CanvasItem) => void;

  // Campaigns
  campaigns: Campaign[];
  addCampaign: (campaign: Campaign) => void;
  updateCampaign: (campaign: Campaign) => void;

  // Automations
  automationNodes: AutomationNode[];
  setAutomationNodes: (nodes: AutomationNode[]) => void;
  addAutomationNode: (node: AutomationNode) => void;
  removeAutomationNode: (id: string) => void;

  // Settings / Team
  userProfile: UserProfile;
  updateUserProfile: (profile: Partial<UserProfile>) => void;
  teamMembers: TeamMember[];
  addTeamMember: (member: TeamMember) => void;
  removeTeamMember: (id: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const getInitialData = <T,>(key: string, defaultData: T): T => {
    try {
      const stored = localStorage.getItem(`echoes_${key}`);
      return stored ? JSON.parse(stored) : defaultData;
    } catch (e) {
      return defaultData;
    }
  };

  // Global
  const [theme, setTheme] = useState<'light' | 'dark'>(() => getInitialData('theme', 'light'));
  const [accentColor, setAccentColor] = useState<AccentColor>(() => getInitialData('accentColor', 'violet'));
  const [subscriptionPlan, setSubscriptionPlan] = useState<SubscriptionPlan>(() => getInitialData('subscriptionPlan', 'Starter'));
  const [enabledModules, setEnabledModules] = useState<AppModule[]>(() => getInitialData('enabledModules', [
    'crm', 'bookings', 'automations', 'payments', 'funnels', 'documents', 
    'projects', 'analytics', 'inbox', 'storage', 'marketplace', 'strategy', 
    'social', 'team', 'canvas', 'campaigns', 'scan', 'assistant'
  ]));
  const [stripeConnected, setStripeConnected] = useState<boolean>(() => getInitialData('stripeConnected', false));
  const [paypalConnected, setPaypalConnected] = useState<boolean>(() => getInitialData('paypalConnected', false));
  const [emailConfig, setEmailConfig] = useState<EmailConfig>(() => getInitialData('emailConfig', {
    provider: 'smtp',
    fromName: 'Echoes Team',
    fromEmail: 'noreply@echoes.com',
    smtpHost: 'smtp.mailtrap.io',
    smtpPort: 2525
  }));

  // Integrations
  const [integrations, setIntegrations] = useState<Integration[]>(() => getInitialData('integrations', [
    { id: 'slack', name: 'Slack', status: 'connected', lastSync: '2h ago' },
    { id: 'stripe', name: 'Stripe', status: 'disconnected' }
  ]));

  // CRM
  const [deals, setDeals] = useState<Deal[]>(() => getInitialData('deals', INITIAL_DEALS));
  const [contacts, setContacts] = useState<Contact[]>(() => getInitialData('contacts', MOCK_CONTACTS));
  const [companies, setCompanies] = useState<Company[]>(() => getInitialData('companies', MOCK_COMPANIES));
  
  // Payments
  const [invoices, setInvoices] = useState<Invoice[]>(() => getInitialData('invoices', MOCK_INVOICES));
  const [expenses, setExpenses] = useState<Expense[]>(() => getInitialData('expenses', MOCK_EXPENSES));
  const [products, setProducts] = useState<Product[]>(() => getInitialData('products', []));
  
  // Bookings
  const [appointments, setAppointments] = useState<Appointment[]>(() => getInitialData('appointments', UPCOMING_APPOINTMENTS));
  const [services, setServices] = useState<Service[]>(() => getInitialData('services', [
    { id: '1', name: 'Discovery Call', duration: 15, price: 0, currency: 'USD', active: true },
    { id: '2', name: 'Strategy Session', duration: 60, price: 250, currency: 'USD', active: true },
  ]));

  // Funnels
  const [funnels, setFunnels] = useState<Funnel[]>(() => getInitialData('funnels', [
    { 
      id: '1', 
      name: 'Webinar Registration', 
      steps: 4, 
      visitors: 5400, 
      conversions: 180, 
      rate: '3.3%', 
      status: 'Active',
      stepsDetail: [
        { id: 's1', name: 'Facebook Ad', type: 'traffic', visitors: 5400, conversionRate: 100 },
        { id: 's2', name: 'Registration Page', type: 'page', visitors: 1240, conversionRate: 23 },
        { id: 's3', name: 'Checkout', type: 'page', visitors: 210, conversionRate: 17 },
        { id: 's4', name: 'Thank You', type: 'conversion', visitors: 180, conversionRate: 85 },
      ]
    },
    { 
      id: '2', 
      name: 'E-book Magnet', 
      steps: 3, 
      visitors: 2100, 
      conversions: 850, 
      rate: '40.4%', 
      status: 'Active',
      stepsDetail: [
        { id: 's1', name: 'Blog Post', type: 'traffic', visitors: 2100, conversionRate: 100 },
        { id: 's2', name: 'Opt-in Form', type: 'action', visitors: 900, conversionRate: 42 },
        { id: 's3', name: 'Download Page', type: 'conversion', visitors: 850, conversionRate: 94 },
      ]
    }
  ]));

  // Documents
  const [documents, setDocuments] = useState<Document[]>(() => getInitialData('documents', [
      { id: '1', title: 'Q4 Marketing Proposal', client: 'Acme Corp', type: 'Proposal', status: 'Sent', value: 12000, lastModified: '2h ago' },
      { id: '2', title: 'SaaS Service Agreement', client: 'Globex', type: 'Contract', status: 'Draft', value: 5000, lastModified: '1d ago' },
      { id: '3', title: 'NDA - Project Alpha', client: 'Soylent Corp', type: 'Contract', status: 'Signed', value: 0, lastModified: '1w ago' },
  ]));

  // Projects & Tasks
  const today = new Date();
  const dateStr = (offset: number) => {
      const d = new Date(today);
      d.setDate(d.getDate() + offset);
      return d.toISOString().split('T')[0];
  };

  const [projects, setProjects] = useState<Project[]>(() => getInitialData('projects', [
      { id: '1', name: 'Website Redesign', client: 'Acme Corp', status: 'Active', deadline: dateStr(30), description: 'Complete overhaul of corporate website.' },
      { id: '2', name: 'Mobile App Launch', client: 'Globex', status: 'On Hold', deadline: dateStr(60), description: 'MVP launch for iOS and Android.' },
  ]));
  
  const [tasks, setTasks] = useState<Task[]>(() => getInitialData('tasks', [
      { id: 't1', projectId: '1', title: 'Design Homepage Mockups', status: 'Done', priority: 'High', assignee: 'JD', startDate: dateStr(-5), dueDate: dateStr(-1) },
      { id: 't2', projectId: '1', title: 'Implement React Components', status: 'In Progress', priority: 'High', assignee: 'JD', startDate: dateStr(0), dueDate: dateStr(5) },
      { id: 't3', projectId: '1', title: 'Content Migration', status: 'To Do', priority: 'Medium', assignee: '', startDate: dateStr(4), dueDate: dateStr(10) },
      { id: 't4', projectId: '1', title: 'QA Testing', status: 'To Do', priority: 'Medium', assignee: 'JD', startDate: dateStr(8), dueDate: dateStr(14) },
      { id: 't5', projectId: '2', title: 'Setup CI/CD Pipeline', status: 'To Do', priority: 'High', assignee: 'JD', startDate: dateStr(2), dueDate: dateStr(6) },
  ]));

  // Inbox
  const [conversations, setConversations] = useState<Conversation[]>(() => getInitialData('conversations', [
      { id: 'c1', contactId: '1', subject: 'Re: Website Redesign', lastMessage: 'When can we schedule the kickoff meeting?', timestamp: '10:30 AM', unread: true, tags: ['Lead', 'Urgent'] },
      { id: 'c2', contactId: '2', subject: 'Q3 Strategy', lastMessage: 'The budget has been approved for the new quarter.', timestamp: 'Yesterday', unread: false, tags: ['Client'] },
      { id: 'c3', contactId: '3', subject: 'Introduction', lastMessage: 'Hi, interested in your enterprise services.', timestamp: '2 days ago', unread: false, tags: ['Lead'] },
  ]));
  
  const [messages, setMessages] = useState<Message[]>(() => getInitialData('messages', [
      { id: 'm1', conversationId: 'c1', sender: 'them', text: 'Hi, I reviewed the proposal. It looks great.', timestamp: '10:00 AM' },
      { id: 'm2', conversationId: 'c1', sender: 'me', text: 'Glad to hear that Sarah! What are the next steps?', timestamp: '10:15 AM' },
      { id: 'm3', conversationId: 'c1', sender: 'them', text: 'When can we schedule the kickoff meeting?', timestamp: '10:30 AM' },
      { id: 'm4', conversationId: 'c2', sender: 'them', text: 'The budget has been approved for the new quarter.', timestamp: 'Yesterday' },
      { id: 'm5', conversationId: 'c3', sender: 'them', text: 'Hi, interested in your enterprise services.', timestamp: '2 days ago' },
  ]));

  // Storage
  const [files, setFiles] = useState<FileItem[]>(() => getInitialData('files', [
      { id: 'f1', name: 'Design Assets', type: 'folder', modified: '2 days ago', parentId: null },
      { id: 'f2', name: 'Contracts', type: 'folder', modified: '1 week ago', parentId: null },
      { id: 'f3', name: 'Q4_Marketing_Plan.pdf', type: 'pdf', size: '2.4 MB', modified: 'Yesterday', parentId: null, starred: true },
      { id: 'f4', name: 'Logo_White.png', type: 'image', size: '1.2 MB', modified: '3 days ago', parentId: 'f1' },
      { id: 'f5', name: 'Budget_2024.xlsx', type: 'spreadsheet', size: '145 KB', modified: '4 hours ago', parentId: null },
  ]));

  // Strategy (Goals)
  const [goals, setGoals] = useState<Goal[]>(() => getInitialData('goals', [
      { 
          id: '1', 
          title: 'Scale Annual Revenue', 
          description: 'Achieve significant YoY growth through new enterprise deals.',
          status: 'On Track', 
          progress: 65, 
          dueDate: 'Dec 31, 2024',
          owner: 'Jane Doe',
          keyResults: [
              { id: 'kr1', title: 'Reach $1M ARR', current: 650000, target: 1000000, unit: '$' },
              { id: 'kr2', title: 'Close 10 Enterprise Deals', current: 7, target: 10, unit: 'deals' }
          ]
      },
      { 
          id: '2', 
          title: 'Launch Mobile App', 
          description: 'Release the MVP for iOS and Android markets.',
          status: 'At Risk', 
          progress: 40, 
          dueDate: 'Nov 15, 2024',
          owner: 'Jane Doe',
          keyResults: [
              { id: 'kr1', title: 'Complete Beta Testing', current: 20, target: 100, unit: '%' },
              { id: 'kr2', title: 'App Store Approval', current: 0, target: 1, unit: 'status' }
          ]
      },
  ]));

  // Social Posts
  const [socialPosts, setSocialPosts] = useState<SocialPost[]>(() => getInitialData('socialPosts', [
      { id: 'p1', content: 'Excited to announce our new Q4 roadmap! 🚀 #SaaS #Growth', platform: 'twitter', status: 'Published', scheduledDate: '2023-10-24', scheduledTime: '09:00', likes: 24, comments: 5 },
      { id: 'p2', content: 'Join us for a webinar on the future of AI in enterprise.', platform: 'linkedin', status: 'Scheduled', scheduledDate: '2023-10-27', scheduledTime: '14:00' },
  ]));

  // Team & Recruiting
  const [candidates, setCandidates] = useState<Candidate[]>(() => getInitialData('candidates', [
      { id: 'c1', name: 'Alice Smith', role: 'Frontend Engineer', stage: 'Applied', email: 'alice@example.com', appliedDate: '2 days ago', matchScore: 85 },
      { id: 'c2', name: 'Bob Jones', role: 'Sales Rep', stage: 'Interview', email: 'bob@example.com', appliedDate: '1 week ago', matchScore: 92 },
      { id: 'c3', name: 'Charlie Day', role: 'Product Designer', stage: 'Screening', email: 'charlie@example.com', appliedDate: '3 days ago', matchScore: 78 },
  ]));

  // Canvas
  const [canvasItems, setCanvasItems] = useState<CanvasItem[]>(() => getInitialData('canvasItems', [
      { id: '1', type: 'note', x: 400, y: 300, content: 'Brainstorm: Q4 Strategy', color: 'yellow' },
      { id: '2', type: 'text', x: 400, y: 250, content: 'Echoes Canvas', color: 'transparent' },
  ]));

  // Campaigns
  const [campaigns, setCampaigns] = useState<Campaign[]>(() => getInitialData('campaigns', [
      { 
          id: '1', 
          name: 'October Newsletter', 
          subject: 'Big Product Updates Inside!', 
          status: 'Sent', 
          sentDate: 'Oct 15, 2023',
          audience: 'All Users',
          stats: { sent: 2400, openRate: 42, clickRate: 15 },
          content: '<p>Hello world</p>'
      },
      { 
          id: '2', 
          name: 'Black Friday Teaser', 
          subject: 'Something big is coming...', 
          status: 'Draft', 
          audience: 'Leads',
          stats: { sent: 0, openRate: 0, clickRate: 0 },
          content: ''
      },
  ]));

  // Automations
  const [automationNodes, setAutomationNodes] = useState<AutomationNode[]>(() => getInitialData('automationNodes', [
     { id: '1', type: 'trigger', title: 'Form Submitted', description: 'When a lead submits the Contact Us form', x: 100, y: 100, config: {} },
     { id: '2', type: 'action', title: 'Send Email', description: 'Send welcome brochure', x: 400, y: 100, config: {} },
     { id: '3', type: 'delay', title: 'Wait 2 Days', description: 'Delay execution', x: 400, y: 300, config: {} },
  ]));

  // Settings
  const [userProfile, setUserProfile] = useState<UserProfile>(() => getInitialData('userProfile', {
    firstName: 'Jane',
    lastName: 'Doe',
    email: 'jane@echoes.com',
    avatar: 'JD',
    aiCredits: 50 // Default for Starter
  }));
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(() => getInitialData('teamMembers', [
    { id: '1', name: 'Jane Doe', email: 'jane@echoes.com', role: 'Admin', status: 'Active', department: 'Management' },
    { id: '2', name: 'John Smith', email: 'john@echoes.com', role: 'Editor', status: 'Active', department: 'Sales' },
    { id: '3', name: 'Sarah Lee', email: 'sarah@echoes.com', role: 'Viewer', status: 'Active', department: 'Engineering' },
  ]));

  // --- Persistence Effects ---
  useEffect(() => localStorage.setItem('echoes_theme', JSON.stringify(theme)), [theme]);
  useEffect(() => localStorage.setItem('echoes_accentColor', JSON.stringify(accentColor)), [accentColor]);
  useEffect(() => localStorage.setItem('echoes_subscriptionPlan', JSON.stringify(subscriptionPlan)), [subscriptionPlan]);
  useEffect(() => localStorage.setItem('echoes_enabledModules', JSON.stringify(enabledModules)), [enabledModules]);
  useEffect(() => localStorage.setItem('echoes_stripeConnected', JSON.stringify(stripeConnected)), [stripeConnected]);
  useEffect(() => localStorage.setItem('echoes_paypalConnected', JSON.stringify(paypalConnected)), [paypalConnected]);
  useEffect(() => localStorage.setItem('echoes_emailConfig', JSON.stringify(emailConfig)), [emailConfig]);
  useEffect(() => localStorage.setItem('echoes_integrations', JSON.stringify(integrations)), [integrations]);
  useEffect(() => localStorage.setItem('echoes_deals', JSON.stringify(deals)), [deals]);
  useEffect(() => localStorage.setItem('echoes_contacts', JSON.stringify(contacts)), [contacts]);
  useEffect(() => localStorage.setItem('echoes_companies', JSON.stringify(companies)), [companies]);
  useEffect(() => localStorage.setItem('echoes_invoices', JSON.stringify(invoices)), [invoices]);
  useEffect(() => localStorage.setItem('echoes_expenses', JSON.stringify(expenses)), [expenses]);
  useEffect(() => localStorage.setItem('echoes_products', JSON.stringify(products)), [products]);
  useEffect(() => localStorage.setItem('echoes_appointments', JSON.stringify(appointments)), [appointments]);
  useEffect(() => localStorage.setItem('echoes_services', JSON.stringify(services)), [services]);
  useEffect(() => localStorage.setItem('echoes_funnels', JSON.stringify(funnels)), [funnels]);
  useEffect(() => localStorage.setItem('echoes_documents', JSON.stringify(documents)), [documents]);
  useEffect(() => localStorage.setItem('echoes_projects', JSON.stringify(projects)), [projects]);
  useEffect(() => localStorage.setItem('echoes_tasks', JSON.stringify(tasks)), [tasks]);
  useEffect(() => localStorage.setItem('echoes_conversations', JSON.stringify(conversations)), [conversations]);
  useEffect(() => localStorage.setItem('echoes_messages', JSON.stringify(messages)), [messages]);
  useEffect(() => localStorage.setItem('echoes_files', JSON.stringify(files)), [files]);
  useEffect(() => localStorage.setItem('echoes_goals', JSON.stringify(goals)), [goals]);
  useEffect(() => localStorage.setItem('echoes_socialPosts', JSON.stringify(socialPosts)), [socialPosts]);
  useEffect(() => localStorage.setItem('echoes_candidates', JSON.stringify(candidates)), [candidates]);
  useEffect(() => localStorage.setItem('echoes_canvasItems', JSON.stringify(canvasItems)), [canvasItems]);
  useEffect(() => localStorage.setItem('echoes_campaigns', JSON.stringify(campaigns)), [campaigns]);
  useEffect(() => localStorage.setItem('echoes_automationNodes', JSON.stringify(automationNodes)), [automationNodes]);
  useEffect(() => localStorage.setItem('echoes_userProfile', JSON.stringify(userProfile)), [userProfile]);
  useEffect(() => localStorage.setItem('echoes_teamMembers', JSON.stringify(teamMembers)), [teamMembers]);

  // Apply Theme
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Apply Accent Color
  useEffect(() => {
      const palette = PALETTES[accentColor];
      if (palette) {
          const root = document.documentElement;
          Object.keys(palette).forEach((key) => {
              root.style.setProperty(`--primary-${key}`, palette[Number(key)]);
          });
      }
  }, [accentColor]);

  // Actions
  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');
  
  const toggleModule = (module: AppModule) => {
      setEnabledModules(prev => 
          prev.includes(module) 
          ? prev.filter(m => m !== module) 
          : [...prev, module]
      );
  };

  const updateEmailConfig = (config: EmailConfig) => setEmailConfig(config);

  const consumeAiCredit = (): boolean => {
      if (subscriptionPlan !== 'Starter') {
          return true; // Pro and Business have unlimited
      }
      
      if (userProfile.aiCredits > 0) {
          setUserProfile(prev => ({
              ...prev,
              aiCredits: prev.aiCredits - 1
          }));
          return true;
      }
      
      return false;
  };

  // Integration Methods
  const connectIntegration = (int: Omit<Integration, 'status' | 'lastSync'>) => {
    setIntegrations(prev => {
        const existing = prev.find(i => i.id === int.id);
        if (existing) {
            return prev.map(i => i.id === int.id ? { ...i, ...int, status: 'connected', lastSync: 'Just now' } as Integration : i);
        }
        return [...prev, { ...int, status: 'connected', lastSync: 'Just now' } as Integration];
    });
  };

  const disconnectIntegration = (id: string) => {
    setIntegrations(prev => prev.map(i => i.id === id ? { ...i, status: 'disconnected' } : i));
  };

  const isIntegrationConnected = (id: string) => {
      return integrations.some(i => i.id === id && i.status === 'connected');
  };

  const triggerIntegrationAction = async (integrationId: string, action: string, data: any): Promise<boolean> => {
      return new Promise((resolve) => {
          setTimeout(() => {
              console.group(`🔗 Integration Trigger: ${integrationId}`);
              console.log(`Action: ${action}`);
              console.log(`Payload:`, data);
              console.groupEnd();
              
              if (!isIntegrationConnected(integrationId)) {
                  console.error(`Integration ${integrationId} not connected.`);
                  resolve(false);
                  return;
              }
              resolve(true);
          }, 800);
      });
  };

  const sendEmail = async (to: string, subject: string, body: string): Promise<boolean> => {
    return new Promise((resolve) => {
        // Simulate network delay
        setTimeout(() => {
            console.group('📧 Email System Simulator');
            console.log(`Provider: ${emailConfig.provider}`);
            console.log(`From: ${emailConfig.fromName} <${emailConfig.fromEmail}>`);
            console.log(`To: ${to}`);
            console.log(`Subject: ${subject}`);
            console.log(`Content: ${body}`);
            console.groupEnd();
            
            // Mock validation
            if (emailConfig.provider === 'sendgrid' && !emailConfig.sendgridApiKey) {
                console.error("SendGrid API Key missing");
                resolve(false);
                return;
            }
             if (emailConfig.provider === 'smtp' && !emailConfig.smtpHost) {
                console.error("SMTP Host missing");
                resolve(false);
                return;
            }

            resolve(true);
        }, 1000 + Math.random() * 1000);
    });
  };

  const addDeal = (deal: Deal) => setDeals(prev => [deal, ...prev]);
  const updateDeal = (updatedDeal: Deal) => setDeals(prev => prev.map(d => d.id === updatedDeal.id ? updatedDeal : d));
  const addContact = (contact: Contact) => setContacts(prev => [contact, ...prev]);
  const addCompany = (company: Company) => setCompanies(prev => [company, ...prev]);
  const addInvoice = (invoice: Invoice) => setInvoices(prev => [invoice, ...prev]);
  const updateInvoice = (updatedInvoice: Invoice) => setInvoices(prev => prev.map(i => i.id === updatedInvoice.id ? updatedInvoice : i));
  const addExpense = (expense: Expense) => setExpenses(prev => [expense, ...prev]);
  const addProduct = (product: Product) => setProducts(prev => [product, ...prev]);
  const addAppointment = (appointment: Appointment) => setAppointments(prev => [appointment, ...prev]);
  const addService = (service: Service) => setServices(prev => [service, ...prev]);
  const addFunnel = (funnel: Funnel) => setFunnels(prev => [funnel, ...prev]);
  const updateFunnel = (updatedFunnel: Funnel) => setFunnels(prev => prev.map(f => f.id === updatedFunnel.id ? updatedFunnel : f));
  
  const addDocument = (doc: Document) => setDocuments(prev => [doc, ...prev]);
  const updateDocument = (updatedDoc: Document) => setDocuments(prev => prev.map(d => d.id === updatedDoc.id ? updatedDoc : d));
  const deleteDocument = (id: string) => setDocuments(prev => prev.filter(d => d.id !== id));

  const addProject = (project: Project) => setProjects(prev => [project, ...prev]);
  const addTask = (task: Task) => setTasks(prev => [task, ...prev]);
  const updateTask = (updatedTask: Task) => setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));

  const addMessage = (msg: Message) => {
      setMessages(prev => [...prev, msg]);
      setConversations(prev => prev.map(c => 
          c.id === msg.conversationId 
          ? { ...c, lastMessage: msg.text, timestamp: 'Just now', unread: msg.sender === 'them' }
          : c
      ));
  };

  const markConversationRead = (id: string) => {
      setConversations(prev => prev.map(c => c.id === id ? { ...c, unread: false } : c));
  };

  const addFile = (file: FileItem) => setFiles(prev => [...prev, file]);
  const deleteFile = (id: string) => setFiles(prev => prev.filter(f => f.id !== id));
  const toggleStarFile = (id: string) => setFiles(prev => prev.map(f => f.id === id ? { ...f, starred: !f.starred } : f));

  const addGoal = (goal: Goal) => setGoals(prev => [goal, ...prev]);
  const updateGoal = (updatedGoal: Goal) => setGoals(prev => prev.map(g => g.id === updatedGoal.id ? updatedGoal : g));

  const addSocialPost = (post: SocialPost) => setSocialPosts(prev => [...prev, post]);
  const updateSocialPost = (updatedPost: SocialPost) => setSocialPosts(prev => prev.map(p => p.id === updatedPost.id ? updatedPost : p));
  const deleteSocialPost = (id: string) => setSocialPosts(prev => prev.filter(p => p.id !== id));

  const addCandidate = (candidate: Candidate) => setCandidates(prev => [...prev, candidate]);
  const updateCandidate = (updatedCandidate: Candidate) => setCandidates(prev => prev.map(c => c.id === updatedCandidate.id ? updatedCandidate : c));

  const addCanvasItem = (item: CanvasItem) => setCanvasItems(prev => [...prev, item]);

  const addCampaign = (campaign: Campaign) => setCampaigns(prev => [campaign, ...prev]);
  const updateCampaign = (updatedCampaign: Campaign) => setCampaigns(prev => prev.map(c => c.id === updatedCampaign.id ? updatedCampaign : c));

  const addAutomationNode = (node: AutomationNode) => setAutomationNodes(prev => [...prev, node]);
  const removeAutomationNode = (id: string) => setAutomationNodes(prev => prev.filter(n => n.id !== id));

  const updateUserProfile = (profile: Partial<UserProfile>) => setUserProfile(prev => ({ ...prev, ...profile }));
  const addTeamMember = (member: TeamMember) => setTeamMembers(prev => [...prev, member]);
  const removeTeamMember = (id: string) => setTeamMembers(prev => prev.filter(m => m.id !== id));

  return (
    <DataContext.Provider value={{
      theme, toggleTheme,
      accentColor, setAccentColor,
      subscriptionPlan, setSubscriptionPlan,
      enabledModules, toggleModule,
      stripeConnected, setStripeConnected,
      paypalConnected, setPaypalConnected,
      emailConfig, updateEmailConfig, sendEmail,
      consumeAiCredit,
      integrations, connectIntegration, disconnectIntegration, isIntegrationConnected, triggerIntegrationAction,
      deals, addDeal, updateDeal,
      contacts, addContact,
      companies, addCompany,
      invoices, addInvoice, updateInvoice,
      expenses, addExpense,
      products, addProduct,
      appointments, addAppointment,
      services, addService,
      funnels, addFunnel, updateFunnel,
      documents, addDocument, updateDocument, deleteDocument,
      projects, addProject,
      tasks, addTask, updateTask,
      conversations, messages, addMessage, markConversationRead,
      files, addFile, deleteFile, toggleStarFile,
      goals, addGoal, updateGoal,
      socialPosts, addSocialPost, updateSocialPost, deleteSocialPost,
      candidates, addCandidate, updateCandidate,
      canvasItems, setCanvasItems, addCanvasItem,
      campaigns, addCampaign, updateCampaign,
      automationNodes, setAutomationNodes, addAutomationNode, removeAutomationNode,
      userProfile, updateUserProfile,
      teamMembers, addTeamMember, removeTeamMember
    }}>
      {children}
    </DataContext.Provider>
  );
};
