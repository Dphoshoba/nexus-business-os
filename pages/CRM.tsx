
import React, { useState, useMemo } from 'react';
import { Deal, DealStage, Contact, Company, Invoice, Appointment } from '../types';
import { 
    Plus, MoreHorizontal, Filter, Search, Building2, User, GripVertical, 
    Sparkles, Loader2, Mail, Phone, Calendar, DollarSign, Clock, 
    ArrowUpRight, FileText, CheckCircle2, Tag, ExternalLink, StickyNote,
    BrainCircuit
} from 'lucide-react';
import { Button, Card, Badge, SectionHeader, Tabs, Modal, Input, Drawer } from '../components/ui/Primitives';
import { useNotifications } from '../components/ui/NotificationSystem';
import { useData } from '../context/DataContext';
import { sendMessageToGemini } from '../services/gemini';

export const CRM: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Deals');
  const { deals, contacts, companies, invoices, appointments, addDeal, updateDeal, addContact, addCompany } = useData();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { addNotification } = useNotifications();
  
  // AI Modal
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [selectedDealForAi, setSelectedDealForAi] = useState<Deal | null>(null);
  const [aiOutput, setAiOutput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Customer 360 Drawer
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  // Drag and Drop State
  const [draggedDealId, setDraggedDealId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<DealStage | null>(null);

  // Form State
  const [formData, setFormData] = useState<any>({});

  const getDealsByStage = (stage: DealStage) => deals.filter((d) => d.stage === stage);

  const handleOpenModal = () => {
      setFormData({}); // Reset form
      setIsModalOpen(true);
  };

  const handleContactClick = (contact: Contact) => {
      setSelectedContact(contact);
  };

  // --- Derived Data for Customer 360 ---
  const customerStats = useMemo(() => {
    if (!selectedContact) return null;

    const relatedDeals = deals.filter(d => d.company === selectedContact.company);
    const relatedInvoices = invoices.filter(i => i.client === selectedContact.company || i.client === selectedContact.name);
    const relatedAppointments = appointments.filter(a => a.clientName === selectedContact.name);

    const totalSpent = relatedInvoices
        .filter(i => i.status === 'Paid')
        .reduce((acc, i) => acc + i.amount, 0);
    
    const activePipeline = relatedDeals
        .filter(d => d.stage !== DealStage.CLOSED)
        .reduce((acc, d) => acc + d.value, 0);

    return { relatedDeals, relatedInvoices, relatedAppointments, totalSpent, activePipeline };
  }, [selectedContact, deals, invoices, appointments]);

  const getDealProgress = (stage: DealStage) => {
      switch (stage) {
          case DealStage.LEAD: return 20;
          case DealStage.CONTACTED: return 40;
          case DealStage.PROPOSAL: return 60;
          case DealStage.NEGOTIATION: return 80;
          case DealStage.CLOSED: return 100;
          default: return 0;
      }
  };

  // --- AI Actions ---
  const openAiModal = (deal: Deal) => {
      setSelectedDealForAi(deal);
      setAiOutput('');
      setIsAiModalOpen(true);
  };

  const handleGenerateSummary = async () => {
      if (!selectedDealForAi) return;
      setIsAiLoading(true);
      const prompt = `Summarize the deal "${selectedDealForAi.title}" with ${selectedDealForAi.company}. Value: $${selectedDealForAi.value}. Stage: ${selectedDealForAi.stage}. Last activity: ${selectedDealForAi.lastActivity}. Provide 3 key insights and recommended next steps.`;
      const result = await sendMessageToGemini(prompt);
      setAiOutput(result);
      setIsAiLoading(false);
  };

  const handleDraftEmail = async () => {
      if (!selectedDealForAi) return;
      setIsAiLoading(true);
      const prompt = `Draft a professional follow-up email for the deal "${selectedDealForAi.title}" with ${selectedDealForAi.company}. The current stage is ${selectedDealForAi.stage}. Keep it concise, persuasive, and action-oriented.`;
      const result = await sendMessageToGemini(prompt);
      setAiOutput(result);
      setIsAiLoading(false);
  };

  // --- Drag and Drop Handlers ---
  const handleDragStart = (e: React.DragEvent, dealId: string) => {
      setDraggedDealId(dealId);
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', dealId);
  };

  const handleDragOver = (e: React.DragEvent, stage: DealStage) => {
      e.preventDefault(); 
      if (dragOverStage !== stage) {
          setDragOverStage(stage);
      }
  };

  const handleDragLeave = (e: React.DragEvent) => {
      e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, stage: DealStage) => {
      e.preventDefault();
      setDragOverStage(null);
      
      const dealId = e.dataTransfer.getData('text/plain');
      if (!dealId) return;

      const deal = deals.find(d => d.id === dealId);
      if (deal && deal.stage !== stage) {
          updateDeal({ ...deal, stage: stage, lastActivity: 'Just now' });
          addNotification({ title: 'Pipeline Updated', message: `Moved "${deal.title}" to ${stage}`, type: 'success' });
      }
      setDraggedDealId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      if (activeTab === 'Deals') {
          const newDeal: Deal = {
              id: Date.now().toString(),
              title: formData.title || 'New Deal',
              company: formData.company || 'Unknown',
              value: Number(formData.value) || 0,
              stage: DealStage.LEAD,
              tags: ['New'],
              lastActivity: 'Just now'
          };
          addDeal(newDeal);
          addNotification({ title: 'Deal Added', message: `${newDeal.title} has been created.`, type: 'success' });
      } else if (activeTab === 'Contacts') {
          const newContact: Contact = {
              id: Date.now().toString(),
              name: formData.name || 'New Contact',
              email: formData.email || '',
              role: formData.role || 'Unknown',
              company: formData.company || 'Unknown',
              lastContacted: 'Never',
              status: 'Active'
          };
          addContact(newContact);
          addNotification({ title: 'Contact Added', message: `${newContact.name} has been added.`, type: 'success' });
      } else if (activeTab === 'Companies') {
          const newCompany: Company = {
              id: Date.now().toString(),
              name: formData.name || 'New Company',
              industry: formData.industry || 'Tech',
              arr: Number(formData.arr) || 0,
              employees: Number(formData.employees) || 0,
              logo: (formData.name || 'N').charAt(0).toUpperCase()
          };
          addCompany(newCompany);
          addNotification({ title: 'Company Added', message: `${newCompany.name} has been added.`, type: 'success' });
      }

      setIsModalOpen(false);
  };

  const handleChange = (field: string, value: string) => {
      setFormData({ ...formData, [field]: value });
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      <SectionHeader 
        title="CRM" 
        subtitle="Manage leads, customers, and pipelines."
        action={
          <div className="flex gap-3">
            <Button variant="secondary" icon={Filter} size="sm">Filter</Button>
            <Button icon={Plus} size="sm" onClick={handleOpenModal}>
              {activeTab === 'Deals' ? 'Add Deal' : activeTab === 'Contacts' ? 'Add Contact' : 'Add Company'}
            </Button>
          </div>
        }
      />

      <Tabs 
        tabs={['Deals', 'Contacts', 'Companies']} 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
      />

      {/* DEALS TAB */}
      {activeTab === 'Deals' && (
        <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4 -mx-6 px-6">
          <div className="h-full flex gap-5 min-w-max">
            {Object.values(DealStage).map((stage) => {
              const stageDeals = getDealsByStage(stage);
              const isOver = dragOverStage === stage;
              
              return (
                <div 
                    key={stage} 
                    className={`
                        w-80 flex flex-col group rounded-xl transition-all duration-200
                        ${isOver ? 'bg-primary-50 dark:bg-primary-900/20 ring-2 ring-primary-500 dark:ring-primary-400 ring-inset shadow-lg scale-[1.01]' : 'bg-transparent'}
                    `}
                    onDragOver={(e) => handleDragOver(e, stage)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, stage)}
                >
                  <div className="flex items-center justify-between mb-3 px-1 pt-2 cursor-default">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-text-secondary dark:text-text-secondary-dark uppercase tracking-wider">{stage}</span>
                      <span className="text-[10px] font-medium text-text-tertiary bg-surface-muted dark:bg-surface-muted-dark px-2 py-0.5 rounded-full border border-border dark:border-border-dark">
                        {stageDeals.length}
                      </span>
                    </div>
                    <button 
                        onClick={handleOpenModal}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-text-tertiary hover:text-text-secondary"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <div className={`flex-1 bg-surface-subtle/50 dark:bg-surface-subtle-dark/50 rounded-xl border border-border/50 dark:border-border-dark/50 p-2 overflow-y-auto custom-scrollbar transition-colors ${isOver ? 'border-primary-200 dark:border-primary-800' : ''}`}>
                    <div className="space-y-3 min-h-[100px]">
                      {stageDeals.map((deal) => (
                        <div 
                          key={deal.id} 
                          draggable
                          onDragStart={(e) => handleDragStart(e, deal.id)}
                          onClick={() => openAiModal(deal)}
                          className={`
                            bg-white dark:bg-surface-dark p-4 rounded-lg border shadow-sm hover:shadow-md transition-all cursor-pointer active:cursor-grabbing group/card relative
                            ${draggedDealId === deal.id ? 'opacity-40 rotate-2 scale-95 border-primary-400 border-dashed' : 'border-border dark:border-border-dark hover:border-primary-200 dark:hover:border-primary-700'}
                          `}
                        >
                          <div className="flex justify-between items-start mb-2">
                              <Badge variant="brand" className="max-w-[140px] truncate">{deal.company}</Badge>
                              <div className="flex gap-1">
                                <button 
                                    onClick={(e) => { e.stopPropagation(); openAiModal(deal); }}
                                    className="p-1 hover:bg-primary-50 dark:hover:bg-primary-900/40 rounded text-primary-400 opacity-0 group-hover/card:opacity-100 transition-opacity"
                                    title="AI Actions"
                                >
                                    <Sparkles className="w-3.5 h-3.5" />
                                </button>
                                <GripVertical className="w-4 h-4 text-text-tertiary opacity-0 group-hover/card:opacity-50" />
                              </div>
                          </div>
                          <h4 className="text-sm font-semibold text-text-primary dark:text-text-primary-dark mb-1">{deal.title}</h4>
                          <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/50 dark:border-border-dark/50">
                              <span className="text-sm font-mono font-medium text-text-secondary dark:text-text-secondary-dark">
                                ${deal.value.toLocaleString()}
                              </span>
                              <span className="text-[10px] text-text-tertiary">{deal.lastActivity}</span>
                          </div>
                          
                          {deal.tags.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {deal.tags.map(tag => (
                                <span key={tag} className="text-[9px] font-medium text-text-secondary dark:text-text-secondary-dark bg-surface-muted dark:bg-surface-muted-dark px-1.5 py-0.5 rounded border border-border dark:border-border-dark">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                      {stageDeals.length === 0 && (
                          <div className="h-full flex items-center justify-center text-text-tertiary text-xs italic py-10 opacity-50">
                              Drop here
                          </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* CONTACTS TAB */}
      {activeTab === 'Contacts' && (
        <Card className="flex-1 overflow-hidden flex flex-col" padding="p-0">
          <div className="flex-1 overflow-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface-subtle dark:bg-surface-subtle-dark sticky top-0 z-10 border-b border-border dark:border-border-dark">
                <tr>
                  <th className="px-6 py-3 text-xs font-semibold text-text-tertiary uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-xs font-semibold text-text-tertiary uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-xs font-semibold text-text-tertiary uppercase tracking-wider">Company</th>
                  <th className="px-6 py-3 text-xs font-semibold text-text-tertiary uppercase tracking-wider">Last Contacted</th>
                  <th className="px-6 py-3 text-xs font-semibold text-text-tertiary uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-xs font-semibold text-text-tertiary uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border dark:divide-border-dark">
                {contacts.map((contact) => (
                  <tr 
                    key={contact.id} 
                    onClick={() => handleContactClick(contact)}
                    className="hover:bg-surface-subtle/50 dark:hover:bg-surface-subtle-dark/50 transition-colors group cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center text-xs font-medium border border-primary-100 dark:border-primary-800">
                          {contact.name.charAt(0)}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-text-primary dark:text-text-primary-dark">{contact.name}</div>
                          <div className="text-xs text-text-tertiary">{contact.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-text-secondary dark:text-text-secondary-dark">{contact.role}</td>
                    <td className="px-6 py-4 text-sm text-text-secondary dark:text-text-secondary-dark">{contact.company}</td>
                    <td className="px-6 py-4 text-sm text-text-secondary dark:text-text-secondary-dark">{contact.lastContacted}</td>
                    <td className="px-6 py-4">
                      <Badge variant={contact.status === 'Active' ? 'success' : 'neutral'}>{contact.status}</Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <button className="text-text-tertiary hover:text-text-primary dark:hover:text-text-primary-dark opacity-0 group-hover:opacity-100 transition-opacity">
                         <MoreHorizontal className="w-4 h-4" />
                       </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* COMPANIES TAB */}
      {activeTab === 'Companies' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto pb-4">
          {companies.map((company) => (
            <Card key={company.id} className="hover:border-primary-200 dark:hover:border-primary-700 cursor-pointer group">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-surface-muted dark:bg-surface-muted-dark border border-border dark:border-border-dark flex items-center justify-center text-lg font-bold text-text-secondary dark:text-text-secondary-dark">
                  {company.logo}
                </div>
                <button className="text-text-tertiary hover:text-text-primary dark:hover:text-text-primary-dark opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
              <h3 className="text-base font-semibold text-text-primary dark:text-text-primary-dark mb-1">{company.name}</h3>
              <p className="text-xs text-text-secondary dark:text-text-secondary-dark mb-4">{company.industry}</p>
              
              <div className="grid grid-cols-2 gap-2 pt-4 border-t border-border/50 dark:border-border-dark/50">
                 <div>
                    <p className="text-[10px] text-text-tertiary uppercase tracking-wider">ARR</p>
                    <p className="text-sm font-medium text-text-primary dark:text-text-primary-dark">${(company.arr / 1000).toFixed(0)}k</p>
                 </div>
                 <div>
                    <p className="text-[10px] text-text-tertiary uppercase tracking-wider">Employees</p>
                    <p className="text-sm font-medium text-text-primary dark:text-text-primary-dark">{company.employees}</p>
                 </div>
              </div>
            </Card>
          ))}
          <button 
             onClick={handleOpenModal}
             className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-border dark:border-border-dark rounded-xl hover:border-primary-300 hover:bg-primary-50/30 dark:hover:bg-primary-900/20 transition-all gap-2 text-text-secondary dark:text-text-secondary-dark hover:text-primary-600 dark:hover:text-primary-400"
          >
             <div className="w-10 h-10 rounded-full bg-surface-muted dark:bg-surface-muted-dark flex items-center justify-center">
               <Plus className="w-5 h-5" />
             </div>
             <span className="text-sm font-medium">Add Company</span>
          </button>
        </div>
      )}

      {/* DYNAMIC MODAL */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={
            activeTab === 'Deals' ? 'Create New Deal' : 
            activeTab === 'Contacts' ? 'Add New Contact' : 
            'Register Company'
        }
      >
          <form onSubmit={handleSubmit} className="space-y-4">
              {activeTab === 'Deals' && (
                  <>
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-text-secondary">Deal Title</label>
                        <Input placeholder="e.g. Q4 Marketing Contract" onChange={e => handleChange('title', e.target.value)} required />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-text-secondary">Value ($)</label>
                        <Input type="number" placeholder="10000" onChange={e => handleChange('value', e.target.value)} required />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-text-secondary">Company Name</label>
                        <Input placeholder="e.g. Acme Inc" onChange={e => handleChange('company', e.target.value)} required />
                    </div>
                  </>
              )}
               {activeTab === 'Contacts' && (
                  <>
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-text-secondary">Full Name</label>
                        <Input placeholder="John Doe" onChange={e => handleChange('name', e.target.value)} required />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-text-secondary">Email</label>
                        <Input type="email" placeholder="john@example.com" onChange={e => handleChange('email', e.target.value)} required />
                    </div>
                  </>
              )}
               {activeTab === 'Companies' && (
                  <>
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-text-secondary">Company Name</label>
                        <Input placeholder="Acme Inc" onChange={e => handleChange('name', e.target.value)} required />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-text-secondary">Industry</label>
                        <Input placeholder="Software" onChange={e => handleChange('industry', e.target.value)} required />
                    </div>
                  </>
              )}

              <div className="pt-4 flex justify-end gap-3">
                 <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                 <Button type="submit">Create</Button>
             </div>
          </form>
      </Modal>

      {/* AI Assistant Modal (Deal Details + Actions) */}
      <Modal 
        isOpen={isAiModalOpen} 
        onClose={() => setIsAiModalOpen(false)} 
        title={selectedDealForAi ? selectedDealForAi.title : "Deal Insights"}
      >
          {selectedDealForAi && (
              <div className="space-y-6">
                   {/* Deal Details Grid */}
                   <div className="grid grid-cols-2 gap-4 text-sm p-1">
                        <div>
                            <span className="text-xs font-semibold text-text-tertiary uppercase tracking-wider block mb-1">Company</span>
                            <div className="flex items-center gap-2">
                                <Building2 className="w-3.5 h-3.5 text-text-secondary" />
                                <span className="font-medium text-text-primary dark:text-text-primary-dark">{selectedDealForAi.company}</span>
                            </div>
                        </div>
                        <div>
                            <span className="text-xs font-semibold text-text-tertiary uppercase tracking-wider block mb-1">Value</span>
                            <div className="flex items-center gap-2">
                                <DollarSign className="w-3.5 h-3.5 text-text-secondary" />
                                <span className="font-medium text-text-primary dark:text-text-primary-dark">${selectedDealForAi.value.toLocaleString()}</span>
                            </div>
                        </div>
                        <div>
                            <span className="text-xs font-semibold text-text-tertiary uppercase tracking-wider block mb-1">Stage</span>
                            <Badge variant="brand">{selectedDealForAi.stage}</Badge>
                        </div>
                        <div>
                            <span className="text-xs font-semibold text-text-tertiary uppercase tracking-wider block mb-1">Last Activity</span>
                            <div className="flex items-center gap-2">
                                <Clock className="w-3.5 h-3.5 text-text-secondary" />
                                <span className="font-medium text-text-primary dark:text-text-primary-dark">{selectedDealForAi.lastActivity}</span>
                            </div>
                        </div>
                   </div>

                   <div className="border-t border-border dark:border-border-dark"></div>

                   {/* AI Actions */}
                   <div>
                        <h4 className="text-sm font-semibold text-text-primary dark:text-text-primary-dark mb-3 flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-primary-500" /> AI Assistant
                        </h4>
                        <div className="grid grid-cols-2 gap-3">
                            <Button 
                                variant="secondary" 
                                onClick={handleGenerateSummary} 
                                disabled={isAiLoading} 
                                icon={FileText} 
                                className="justify-center h-auto py-3 bg-surface hover:bg-surface-muted border-primary-200 dark:border-primary-800"
                            >
                                Summarize Deal
                            </Button>
                            <Button 
                                variant="secondary" 
                                onClick={handleDraftEmail} 
                                disabled={isAiLoading} 
                                icon={Mail} 
                                className="justify-center h-auto py-3 bg-surface hover:bg-surface-muted border-primary-200 dark:border-primary-800"
                            >
                                Draft Follow-up Email
                            </Button>
                        </div>
                   </div>

                   {/* AI Output Area */}
                   {isAiLoading && (
                       <div className="flex items-center justify-center py-8 bg-surface-subtle dark:bg-surface-subtle-dark rounded-xl">
                           <div className="flex flex-col items-center gap-2">
                               <Loader2 className="w-6 h-6 text-primary-500 animate-spin" />
                               <span className="text-xs text-text-secondary">Analyzing deal data...</span>
                           </div>
                       </div>
                   )}

                   {!isAiLoading && aiOutput && (
                       <div className="bg-surface-subtle dark:bg-surface-subtle-dark border border-border dark:border-border-dark rounded-xl p-4 animate-in fade-in slide-in-from-bottom-2">
                           <div className="flex justify-between items-center mb-2">
                               <h5 className="text-xs font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1">
                                   <BrainCircuit className="w-3 h-3" /> Analysis Result
                               </h5>
                               <Button size="sm" variant="ghost" className="h-6 text-xs" onClick={() => {navigator.clipboard.writeText(aiOutput); addNotification({title:'Copied', message:'Text copied to clipboard', type:'success'})}}>Copy</Button>
                           </div>
                           <div className="text-sm leading-relaxed whitespace-pre-wrap text-text-primary dark:text-text-primary-dark">
                               {aiOutput}
                           </div>
                       </div>
                   )}
              </div>
          )}
      </Modal>

      {/* Customer 360 Drawer */}
      <Drawer
        isOpen={!!selectedContact}
        onClose={() => setSelectedContact(null)}
        title="Customer 360"
      >
        {selectedContact && customerStats && (
            <div className="space-y-8 pb-8">
                {/* Profile Header */}
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center text-white text-xl font-bold shadow-md">
                        {selectedContact.name.charAt(0)}
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-text-primary dark:text-text-primary-dark">{selectedContact.name}</h2>
                        <div className="flex items-center gap-2 text-sm text-text-secondary dark:text-text-secondary-dark mt-1">
                            <span>{selectedContact.role}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5" /> {selectedContact.company}</span>
                        </div>
                        <div className="flex gap-2 mt-3">
                            <Button size="sm" variant="secondary" icon={Mail}>Email</Button>
                            <Button size="sm" variant="secondary" icon={Phone}>Call</Button>
                            <Button size="sm" variant="ghost" icon={StickyNote} />
                        </div>
                        {/* Tags */}
                        <div className="flex gap-2 mt-3 flex-wrap">
                            <Badge variant={selectedContact.status === 'Active' ? 'success' : 'neutral'}>{selectedContact.status}</Badge>
                            <Badge variant="brand">VIP</Badge>
                            <Badge variant="neutral">Lead</Badge>
                        </div>
                    </div>
                </div>

                {/* Key Stats Grid */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 rounded-xl bg-surface-subtle dark:bg-surface-subtle-dark border border-border dark:border-border-dark">
                        <div className="flex items-center gap-2 text-xs font-medium text-text-secondary dark:text-text-secondary-dark uppercase tracking-wider mb-1">
                            <DollarSign className="w-3.5 h-3.5" /> Lifetime Value
                        </div>
                        <p className="text-2xl font-bold text-text-primary dark:text-text-primary-dark">${customerStats.totalSpent.toLocaleString()}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-surface-subtle dark:bg-surface-subtle-dark border border-border dark:border-border-dark">
                        <div className="flex items-center gap-2 text-xs font-medium text-text-secondary dark:text-text-secondary-dark uppercase tracking-wider mb-1">
                            <ArrowUpRight className="w-3.5 h-3.5" /> Active Pipeline
                        </div>
                        <p className="text-2xl font-bold text-text-primary dark:text-text-primary-dark">${customerStats.activePipeline.toLocaleString()}</p>
                    </div>
                </div>

                {/* Timeline / Interactions */}
                <div>
                    <h4 className="text-sm font-bold text-text-primary dark:text-text-primary-dark mb-4 flex items-center gap-2">
                        <Clock className="w-4 h-4" /> Recent Interactions
                    </h4>
                    <div className="relative border-l border-border dark:border-border-dark ml-2 space-y-6">
                        {customerStats.relatedAppointments.length > 0 ? customerStats.relatedAppointments.map((apt, idx) => (
                             <div key={apt.id} className="relative pl-6">
                                <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-white dark:bg-surface-dark border-2 border-primary-500"></div>
                                <div className="p-3 bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-lg shadow-sm hover:border-primary-200 transition-colors">
                                    <div className="flex justify-between items-start">
                                        <span className="text-sm font-semibold text-text-primary dark:text-text-primary-dark">{apt.type}</span>
                                        <span className="text-xs text-text-tertiary">{apt.date}</span>
                                    </div>
                                    <p className="text-xs text-text-secondary dark:text-text-secondary-dark mt-1">Scheduled meeting with {apt.clientName}</p>
                                </div>
                            </div>
                        )) : (
                            <div className="pl-6 text-sm text-text-tertiary">No recent appointments scheduled.</div>
                        )}
                        {/* Static past entry for flavor */}
                        <div className="relative pl-6 opacity-60">
                            <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-gray-300 dark:bg-gray-600"></div>
                            <p className="text-sm text-text-secondary dark:text-text-secondary-dark">Contact created manually</p>
                            <p className="text-xs text-text-tertiary">1 month ago</p>
                        </div>
                    </div>
                </div>

                <div className="border-t border-border dark:border-border-dark pt-6">
                    <h4 className="text-sm font-bold text-text-primary dark:text-text-primary-dark mb-4 flex items-center gap-2">
                        <FileText className="w-4 h-4" /> Invoices
                    </h4>
                    {customerStats.relatedInvoices.length > 0 ? (
                        <div className="space-y-2">
                            {customerStats.relatedInvoices.map(inv => (
                                <div key={inv.id} className="flex items-center justify-between p-3 rounded-lg bg-surface dark:bg-surface-dark border border-border dark:border-border-dark hover:bg-surface-subtle transition-colors group">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${inv.status === 'Paid' ? 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                                            <FileText className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-text-primary dark:text-text-primary-dark">{inv.id}</p>
                                            <p className="text-xs text-text-secondary dark:text-text-secondary-dark">{inv.date}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-text-primary dark:text-text-primary-dark">${inv.amount.toLocaleString()}</p>
                                        <Badge variant={inv.status === 'Paid' ? 'success' : inv.status === 'Overdue' ? 'danger' : 'warning'} className="mt-1">{inv.status}</Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                         <div className="p-4 text-center border border-dashed border-border dark:border-border-dark rounded-lg text-sm text-text-tertiary">
                             No invoices found for this contact.
                         </div>
                    )}
                </div>

                <div className="border-t border-border dark:border-border-dark pt-6">
                    <h4 className="text-sm font-bold text-text-primary dark:text-text-primary-dark mb-4 flex items-center gap-2">
                        <ArrowUpRight className="w-4 h-4" /> Active Deals
                    </h4>
                     {customerStats.relatedDeals.length > 0 ? (
                        <div className="space-y-3">
                            {customerStats.relatedDeals.map(deal => (
                                <div key={deal.id} className="p-4 rounded-xl border border-border dark:border-border-dark bg-surface dark:bg-surface-dark hover:border-primary-300 dark:hover:border-primary-700 transition-all cursor-pointer group shadow-sm">
                                     <div className="flex justify-between items-start mb-2">
                                         <div>
                                             <h5 className="text-sm font-bold text-text-primary dark:text-text-primary-dark">{deal.title}</h5>
                                             <p className="text-xs text-text-secondary mt-0.5">Created {deal.lastActivity}</p>
                                         </div>
                                         <Badge variant={deal.stage === DealStage.CLOSED ? 'success' : 'brand'}>{deal.stage}</Badge>
                                     </div>
                                     <div className="flex items-center justify-between mt-3">
                                         <span className="text-lg font-bold text-text-primary dark:text-text-primary-dark">${deal.value.toLocaleString()}</span>
                                         <span className="text-[10px] text-text-tertiary uppercase tracking-wider font-semibold">Probability: {getDealProgress(deal.stage)}%</span>
                                     </div>
                                     <div className="w-full h-1.5 bg-surface-muted dark:bg-surface-muted-dark rounded-full mt-2 overflow-hidden">
                                         <div 
                                            className={`h-full rounded-full ${deal.stage === DealStage.CLOSED ? 'bg-green-500' : 'bg-primary-500'}`} 
                                            style={{ width: `${getDealProgress(deal.stage)}%` }}
                                         ></div>
                                     </div>
                                </div>
                            ))}
                        </div>
                     ) : (
                        <div className="p-4 text-center border border-dashed border-border dark:border-border-dark rounded-lg text-sm text-text-tertiary">
                             No active deals found.
                         </div>
                     )}
                </div>

            </div>
        )}
      </Drawer>
    </div>
  );
};
