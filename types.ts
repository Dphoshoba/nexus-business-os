
import React from 'react';

export interface FAQItem {
  question: string;
  answer: string;
}

export interface DeliverableItem {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
}

export interface StepItem {
  number: string;
  title: string;
  description: string;
}

export interface CaseStudy {
    id: string;
    title: string;
    client: string;
    category: 'AI' | 'Automation' | 'Strategy' | 'Design';
    impact: string;
    description: string;
    challenge: string;
    solution: string;
    result: string;
    image: string;
    tags: string[];
}

export interface BlogPost {
    id: string;
    title: string;
    slug: string;
    summary: string;
    content: string;
    category: 'Intelligence' | 'Operations' | 'Growth' | 'Culture';
    author: {
        name: string;
        role: string;
        avatar: string;
    };
    date: string;
    image: string;
    readingTime: string;
    isFeatured?: boolean;
    tags: string[];
}

export interface ForecastPoint {
    name: string;
    actual?: number;
    predicted?: number;
    confidenceHigh?: number;
    confidenceLow?: number;
}

export enum DealStage {
  LEAD = 'Lead',
  CONTACTED = 'Contacted',
  PROPOSAL = 'Proposal',
  NEGOTIATION = 'Negotiation',
  CLOSED = 'Closed',
}

export type IntegrationStatus = 'connected' | 'disconnected' | 'error';

export interface Integration {
  id: string;
  name: string;
  status: IntegrationStatus;
  apiKey?: string;
  webhookUrl?: string;
  lastSync?: string;
  settings?: Record<string, any>;
}

export type AccentColor = 'violet' | 'blue' | 'emerald' | 'rose' | 'amber' | 'cyan';
export type Language = 'en' | 'es' | 'fr' | 'de' | 'zh' | 'ja' | 'ar' | 'pt' | 'hi' | 'ru' | 'it' | 'ko' | 'tr' | 'nl' | 'pl' | 'id' | 'vi' | 'th' | 'sv' | 'el';
export type SubscriptionPlan = 'Starter' | 'Pro' | 'Business';

export type AppModule = 'crm' | 'bookings' | 'automations' | 'payments' | 'funnels' | 'documents' | 'projects' | 'analytics' | 'inbox' | 'storage' | 'marketplace' | 'strategy' | 'social' | 'team' | 'canvas' | 'campaigns' | 'scan' | 'assistant' | 'blog_admin' | 'market_intel';

export type EmailProvider = 'smtp' | 'sendgrid';

export interface EmailConfig {
    provider: EmailProvider;
    fromName: string;
    fromEmail: string;
    smtpHost?: string;
    smtpPort?: number;
    smtpUser?: string;
    smtpPass?: string;
    sendgridApiKey?: string;
}

export interface Deal {
  id: string;
  title: string;
  company: string;
  value: number;
  stage: DealStage;
  tags: string[];
  lastActivity: string;
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  role: string;
  company: string;
  lastContacted: string;
  status: 'Active' | 'Inactive';
}

export interface Company {
  id: string;
  name: string;
  industry: string;
  arr: number;
  employees: number;
  logo: string;
}

export interface Invoice {
  id: string;
  client: string;
  amount: number;
  status: 'Paid' | 'Pending' | 'Overdue';
  date: string;
}

export interface Expense {
  id: string;
  vendor: string;
  category: 'Marketing' | 'Payroll' | 'SaaS' | 'Office' | 'Travel' | 'Other';
  amount: number;
  date: string;
  status: 'Paid' | 'Pending';
}

export interface Product {
  id: string;
  name: string;
  type: 'One-time' | 'Subscription';
  price: number;
  currency: string;
  interval?: 'month' | 'year';
  sales: number;
}

export interface Appointment {
  id: string;
  clientName: string;
  type: 'Consultation' | 'Onboarding' | 'Review';
  date: string;
  time: string;
  status: 'Confirmed' | 'Pending' | 'Completed';
}

export interface Service {
  id: string;
  name: string;
  duration: number; // in minutes
  price: number;
  currency: string;
  active: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: Date;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  read: boolean;
}

export interface ViewState {
  currentView: string;
}

export interface FunnelStep {
  id: string;
  name: string;
  type: 'traffic' | 'page' | 'action' | 'conversion';
  visitors: number;
  conversionRate: number; // percentage (0-100) leading to this step from previous
}

export interface Funnel {
  id: string;
  name: string;
  steps: number;
  visits: number;
  conversions: number;
  rate: string;
  status: 'Active' | 'Draft' | 'Archived';
  stepsDetail?: FunnelStep[];
}

export interface Document {
  id: string;
  title: string;
  client: string;
  type: 'Proposal' | 'Contract' | 'Invoice' | 'Brief';
  status: 'Draft' | 'Sent' | 'Viewed' | 'Signed';
  value: number;
  lastModified: string;
  content?: string; // HTML or Markdown content
}

export interface Project {
  id: string;
  name: string;
  client: string;
  status: 'Active' | 'Completed' | 'On Hold';
  deadline: string;
  description: string;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  status: 'To Do' | 'In Progress' | 'Review' | 'Done';
  priority: 'Low' | 'Medium' | 'High';
  assignee?: string;
  startDate?: string;
  dueDate?: string;
}

export interface Message {
    id: string;
    conversationId: string;
    sender: 'me' | 'them';
    text: string;
    timestamp: string;
}

export interface Conversation {
    id: string;
    contactId: string;
    subject: string;
    lastMessage: string;
    timestamp: string;
    unread: boolean;
    tags: string[];
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Editor' | 'Viewer';
  status: 'Active' | 'Invited' | 'Inactive';
  department?: string;
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  avatar: string; // initials or url
  aiCredits: number;
}

export interface ClientProfile {
  id: string;
  name: string;
  company: string;
  email: string;
  avatar: string;
}

export interface AutomationNode {
  id: string;
  type: 'trigger' | 'action' | 'condition' | 'delay' | 'ai' | 'email' | 'webhook';
  title: string;
  description: string;
  x: number;
  y: number;
  icon?: any;
  color?: string;
  config?: {
      assignee?: string;
      template?: string;
      prompt?: string;
      url?: string;
      duration?: number;
      actionType?: 'create_task' | 'update_deal' | 'send_slack' | 'create_notion_page' | 'sync_calendar';
      dealId?: string;
      newStage?: DealStage;
      message?: string;
  };
}

export interface FileItem {
    id: string;
    name: string;
    type: 'folder' | 'image' | 'pdf' | 'doc' | 'spreadsheet';
    size?: string;
    modified: string;
    starred?: boolean;
    parentId?: string | null; // null for root
}

export interface KeyResult {
    id: string;
    title: string;
    current: number;
    target: number;
    unit: string;
}

export interface Goal {
    id: string;
    title: string;
    description: string;
    status: 'On Track' | 'At Risk' | 'Behind' | 'Completed';
    progress: number; // 0-100
    dueDate: string;
    owner: string;
    keyResults: KeyResult[];
}

export type SocialPlatform = 'twitter' | 'linkedin' | 'instagram';

export interface SocialPost {
    id: string;
    content: string;
    platform: SocialPlatform;
    status: 'Draft' | 'Scheduled' | 'Published';
    scheduledDate: string; // ISO Date string
    scheduledTime: string;
    image?: string;
    likes?: number;
    comments?: number;
}

export interface Candidate {
    id: string;
    name: string;
    role: string;
    stage: 'Applied' | 'Screening' | 'Interview' | 'Offer' | 'Hired';
    email: string;
    appliedDate: string;
    matchScore?: number; // AI Match Score 0-100
}

export interface CanvasItem {
    id: string;
    type: 'note' | 'text' | 'shape';
    x: number;
    y: number;
    content: string;
    color?: string;
    width?: number;
    height?: number;
}

export interface Campaign {
    id: string;
    name: string;
    subject: string;
    status: 'Draft' | 'Scheduled' | 'Sent';
    sentDate?: string;
    audience: string;
    stats: {
        sent: number;
        openRate: number;
        clickRate: number;
    };
    content?: string; // HTML content
}

export type View = 'dashboard' | 'crm' | 'bookings' | 'automations' | 'payments' | 'funnels' | 'documents' | 'projects' | 'analytics' | 'inbox' | 'storage' | 'marketplace' | 'strategy' | 'social' | 'team' | 'canvas' | 'campaigns' | 'scan' | 'settings' | 'help' | 'assistant' | 'client_portal' | 'blog_admin' | 'audit_landing' | 'market_intel';
