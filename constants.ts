import { Deal, DealStage, Appointment, Contact, Company, Invoice } from './types';

export const INITIAL_DEALS: Deal[] = [
  { id: '1', title: 'Website Redesign', company: 'Acme Corp', value: 12000, stage: DealStage.PROPOSAL, tags: ['High Priority'], lastActivity: '2h ago' },
  { id: '2', title: 'Marketing Retainer', company: 'Globex', value: 5000, stage: DealStage.LEAD, tags: ['Referral'], lastActivity: '1d ago' },
  { id: '3', title: 'Q3 Strategy', company: 'Soylent Corp', value: 8500, stage: DealStage.NEGOTIATION, tags: ['Enterprise'], lastActivity: '4h ago' },
  { id: '4', title: 'App Development', company: 'Initech', value: 25000, stage: DealStage.CONTACTED, tags: ['Tech'], lastActivity: '3d ago' },
  { id: '5', title: 'SEO Audit', company: 'Massive Dynamic', value: 2000, stage: DealStage.CLOSED, tags: ['Quick Win'], lastActivity: '1w ago' },
];

export const MOCK_CONTACTS: Contact[] = [
  { id: '1', name: 'Sarah Connor', email: 'sarah@skynet.com', role: 'CTO', company: 'Skynet', lastContacted: '2 days ago', status: 'Active' },
  { id: '2', name: 'Bruce Wayne', email: 'bruce@wayne.com', role: 'CEO', company: 'Wayne Ent', lastContacted: '1 week ago', status: 'Active' },
  { id: '3', name: 'Diana Prince', email: 'diana@themyscira.gov', role: 'Director', company: 'Justice League', lastContacted: '3 days ago', status: 'Inactive' },
];

export const MOCK_COMPANIES: Company[] = [
  { id: '1', name: 'Acme Corp', industry: 'Manufacturing', arr: 1200000, employees: 500, logo: 'A' },
  { id: '2', name: 'Globex', industry: 'Logistics', arr: 850000, employees: 120, logo: 'G' },
  { id: '3', name: 'Soylent Corp', industry: 'Food Tech', arr: 2500000, employees: 1000, logo: 'S' },
  { id: '4', name: 'Initech', industry: 'Software', arr: 450000, employees: 45, logo: 'I' },
];

export const MOCK_INVOICES: Invoice[] = [
  { id: 'INV-001', client: 'Acme Corp', amount: 12000, status: 'Paid', date: 'Oct 24, 2023' },
  { id: 'INV-002', client: 'Globex', amount: 5000, status: 'Pending', date: 'Oct 26, 2023' },
  { id: 'INV-003', client: 'Initech', amount: 2500, status: 'Overdue', date: 'Oct 15, 2023' },
  { id: 'INV-004', client: 'Wayne Ent', amount: 15000, status: 'Paid', date: 'Oct 10, 2023' },
];

export const UPCOMING_APPOINTMENTS: Appointment[] = [
  { id: '1', clientName: 'Sarah Connor', type: 'Consultation', date: 'Today', time: '10:00 AM', status: 'Confirmed' },
  { id: '2', clientName: 'Bruce Wayne', type: 'Review', date: 'Today', time: '2:00 PM', status: 'Confirmed' },
  { id: '3', clientName: 'Diana Prince', type: 'Onboarding', date: 'Tomorrow', time: '11:30 AM', status: 'Pending' },
];

export const MOCK_REVENUE_DATA = [
  { name: 'Mon', value: 4000 },
  { name: 'Tue', value: 3000 },
  { name: 'Wed', value: 2000 },
  { name: 'Thu', value: 2780 },
  { name: 'Fri', value: 1890 },
  { name: 'Sat', value: 2390 },
  { name: 'Sun', value: 3490 },
];
