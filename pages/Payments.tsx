
import React, { useState, useMemo } from 'react';
import { Invoice, Product, Expense } from '../types';
import { 
    Plus, Download, Filter, MoreHorizontal, Package, Loader2, 
    CreditCard, Tag, ExternalLink, Check, Settings, ShieldCheck, 
    RefreshCw, PieChart, TrendingUp, ArrowUpRight, ArrowDownRight,
    DollarSign, Briefcase, FileText, Sparkles, Wallet, Calculator
} from 'lucide-react';
import { Button, Card, Badge, SectionHeader, Tabs, Modal, Input } from '../components/ui/Primitives';
import { useNotifications } from '../components/ui/NotificationSystem';
import { useData } from '../context/DataContext';
import { PaymentModal } from '../components/ui/PaymentModal';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, PieChart as RePieChart, Pie, Cell } from 'recharts';
import { sendMessageToGemini } from '../services/gemini';

export const Payments: React.FC = () => {
  // Fix: Set default tab to 'Reports' for better discoverability of the automated reporting features
  const [activeTab, setActiveTab] = useState('Reports');
  const { addNotification } = useNotifications();
  const { 
    invoices, products, expenses, addInvoice, updateInvoice, addProduct, 
    stripeConnected, setStripeConnected, paypalConnected, setPaypalConnected,
    consumeAiCredit
  } = useData();
  
  // State
  const [isStripeConnecting, setIsStripeConnecting] = useState(false);
  const [isPaypalConnecting, setIsPaypalConnecting] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [aiReport, setAiReport] = useState<string | null>(null);
  
  // Modals
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [invoiceToPay, setInvoiceToPay] = useState<Invoice | null>(null);

  // Form State
  const [newInvoice, setNewInvoice] = useState({ client: '', amount: '', date: '' });
  const [newProduct, setNewProduct] = useState({ name: '', price: '', type: 'One-time' });

  // --- Financial Calculations ---
  const financialMetrics = useMemo(() => {
    const totalRevenue = invoices
        .filter(i => i.status === 'Paid')
        .reduce((acc, i) => acc + i.amount, 0);
    
    const totalExpenses = expenses
        .filter(e => e.status === 'Paid')
        .reduce((acc, e) => acc + e.amount, 0);
    
    const outstandingRevenue = invoices
        .filter(i => i.status === 'Pending' || i.status === 'Overdue')
        .reduce((acc, i) => acc + i.amount, 0);

    const netProfit = totalRevenue - totalExpenses;
    const margin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
    
    return { totalRevenue, totalExpenses, netProfit, margin, outstandingRevenue };
  }, [invoices, expenses]);

  const expenseBreakdown = useMemo(() => {
    const categories: Record<string, number> = {};
    expenses.forEach(e => {
        categories[e.category] = (categories[e.category] || 0) + e.amount;
    });
    return Object.entries(categories).map(([name, value]) => ({ name, value }));
  }, [expenses]);

  const chartData = useMemo(() => {
    // Basic day tracking for the chart
    return [
      { name: 'W1', revenue: 4200, spend: 2100 },
      { name: 'W2', revenue: 3800, spend: 2800 },
      { name: 'W3', revenue: 5600, spend: 1900 },
      { name: 'W4', revenue: financialMetrics.totalRevenue / 10, spend: financialMetrics.totalExpenses / 10 },
    ];
  }, [financialMetrics]);

  // --- Handlers ---
  const handleGenerateAiReport = async () => {
    // Force switch to Reports tab if triggered from elsewhere
    setActiveTab('Reports');
    
    if (!consumeAiCredit()) {
        addNotification({ title: 'Limit Reached', message: 'Upgrade to Pro for AI Financial Briefings.', type: 'warning' });
        return;
    }

    setIsGeneratingReport(true);
    const prompt = `As a Virtual CFO, analyze these business financials:
    - Gross Revenue: $${financialMetrics.totalRevenue}
    - Operating Expenses: $${financialMetrics.totalExpenses}
    - Net Profit: $${financialMetrics.netProfit}
    - Outstanding: $${financialMetrics.outstandingRevenue}
    
    Provide a concise 3-sentence executive summary highlighting health and 2 strategic recommendations for next month.`;

    try {
        const result = await sendMessageToGemini(prompt);
        setAiReport(result);
        addNotification({ title: 'Report Ready', message: 'AI Financial Briefing generated.', type: 'success' });
    } catch (e) {
        addNotification({ title: 'AI Error', message: 'Failed to generate financial analysis.', type: 'error' });
    } finally {
        setIsGeneratingReport(false);
    }
  };

  const handleConnectStripe = () => {
      setIsStripeConnecting(true);
      setTimeout(() => {
          setStripeConnected(true);
          setIsStripeConnecting(false);
          addNotification({ title: 'Stripe Connected', message: 'Your account is now ready to accept card payments.', type: 'success' });
      }, 2000);
  };

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const invoice: Invoice = {
        id: `INV-00${invoices.length + 1}`,
        client: newInvoice.client,
        amount: parseFloat(newInvoice.amount),
        date: newInvoice.date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        status: 'Pending'
    };
    addInvoice(invoice);
    setNewInvoice({ client: '', amount: '', date: '' });
    setIsInvoiceModalOpen(false);
    addNotification({ title: 'Invoice Created', message: `Invoice #${invoice.id} created for ${invoice.client}`, type: 'success' });
  };

  const COLORS = ['#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#3B82F6'];

  const ReportingTab = () => (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* AI Briefing Panel */}
          <div className="bg-gradient-to-br from-gray-900 to-indigo-950 rounded-2xl p-6 text-white shadow-2xl relative overflow-hidden border border-white/5">
              <div className="relative z-10 flex flex-col md:flex-row gap-8">
                  <div className="flex-1">
                      <div className="flex items-center gap-3 mb-6">
                           <div className="p-2 bg-white/10 rounded-lg backdrop-blur-md border border-white/10">
                               <Sparkles className="w-5 h-5 text-indigo-300" />
                           </div>
                           <h3 className="text-lg font-bold">Echoes Financial Intelligence</h3>
                           <Badge className="bg-indigo-500/30 text-indigo-200 border-none">AI Powered</Badge>
                      </div>

                      {!aiReport ? (
                          <div className="space-y-4">
                              <p className="text-indigo-100/70 text-sm leading-relaxed max-w-2xl">
                                  Generate an automated CFO briefing. Echoes will analyze your profit margins, expense categories, and outstanding debt to provide strategic growth recommendations.
                              </p>
                              <Button 
                                className="bg-white text-indigo-900 hover:bg-indigo-50 border-none shadow-lg shadow-indigo-500/20 relative group overflow-hidden"
                                onClick={handleGenerateAiReport}
                                disabled={isGeneratingReport}
                              >
                                {isGeneratingReport ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                                    <>
                                        <span className="relative z-10 flex items-center gap-2">Run Financial Analysis <TrendingUp className="w-4 h-4" /></span>
                                        <div className="absolute inset-0 bg-indigo-500/10 group-hover:bg-indigo-500/20 transition-all animate-pulse"></div>
                                    </>
                                )}
                              </Button>
                          </div>
                      ) : (
                          <div className="animate-in fade-in zoom-in-95">
                              <p className="text-indigo-50 italic leading-relaxed text-lg font-serif">"{aiReport}"</p>
                              <div className="flex gap-4 mt-8 pt-6 border-t border-white/10">
                                   <div className="flex items-center gap-2 text-xs text-indigo-300">
                                       <TrendingUp className="w-4 h-4" /> Healthy Profit Margin
                                   </div>
                                   <div className="flex items-center gap-2 text-xs text-indigo-300">
                                       <Wallet className="w-4 h-4" /> Strategic Spend Optimized
                                   </div>
                              </div>
                              <button onClick={() => setAiReport(null)} className="text-[10px] uppercase font-bold tracking-widest text-indigo-400 mt-6 hover:text-indigo-300 transition-colors">Dismiss Report</button>
                          </div>
                      )}
                  </div>

                  <div className="w-full md:w-64 space-y-4">
                      <div className="p-4 bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm">
                           <p className="text-[10px] text-indigo-300 uppercase font-bold tracking-widest mb-1">Operating Margin</p>
                           <p className="text-3xl font-bold">{financialMetrics.margin.toFixed(1)}%</p>
                           <div className="w-full h-1.5 bg-white/10 rounded-full mt-3 overflow-hidden">
                               <div className="h-full bg-indigo-400 rounded-full" style={{ width: `${financialMetrics.margin}%` }}></div>
                           </div>
                      </div>
                      <div className="p-4 bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm">
                           <p className="text-[10px] text-indigo-300 uppercase font-bold tracking-widest mb-1">Profitability Rank</p>
                           <p className="text-lg font-bold">Top 15% in sector</p>
                           <p className="text-[10px] text-indigo-400/70 mt-1">Based on SaaS benchmarks</p>
                      </div>
                  </div>
              </div>
              <Sparkles className="absolute -bottom-10 -right-10 w-64 h-64 text-white/5 rotate-12" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Profit/Loss Chart */}
              <Card className="lg:col-span-2">
                  <div className="flex items-center justify-between mb-8">
                      <div>
                          <h3 className="text-lg font-bold">Financial Flux</h3>
                          <p className="text-xs text-text-tertiary">Visualizing revenue against spend cycles.</p>
                      </div>
                      <div className="flex gap-4">
                           <div className="flex items-center gap-2 text-xs font-medium text-emerald-600"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Revenue</div>
                           <div className="flex items-center gap-2 text-xs font-medium text-rose-600"><span className="w-2 h-2 rounded-full bg-rose-500"></span> Spend</div>
                      </div>
                  </div>
                  <div className="h-[350px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={chartData}>
                              <defs>
                                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.1}/>
                                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                                  </linearGradient>
                                  <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#EF4444" stopOpacity={0.1}/>
                                      <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                                  </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.05} />
                              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill:'#9CA3AF'}} dy={10} />
                              <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill:'#9CA3AF'}} tickFormatter={(v) => `$${v}`} />
                              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', background: '#1F2937', color: '#fff' }} />
                              <Area type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
                              <Area type="monotone" dataKey="spend" stroke="#EF4444" strokeWidth={2} fillOpacity={1} fill="url(#colorSpend)" />
                          </AreaChart>
                      </ResponsiveContainer>
                  </div>
              </Card>

              {/* Sidebar Cards */}
              <div className="space-y-6">
                  <Card className="flex flex-col items-center text-center">
                       <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/20 rounded-full flex items-center justify-center text-amber-600 mb-4">
                           <Calculator className="w-6 h-6" />
                       </div>
                       <h4 className="font-bold text-sm uppercase tracking-widest text-text-tertiary">Tax Estimate (Q4)</h4>
                       <p className="text-3xl font-bold mt-2 text-text-primary dark:text-text-primary-dark">
                           ${(financialMetrics.netProfit * 0.25).toLocaleString()}
                       </p>
                       <p className="text-xs text-text-tertiary mt-2">Based on 25% corporate tax projection.</p>
                       <Button variant="ghost" size="sm" className="mt-6 w-full border border-border">Open Tax Center</Button>
                  </Card>

                  <Card>
                       <h4 className="font-bold text-sm mb-4 flex items-center gap-2"><PieChart className="w-4 h-4 text-primary-500" /> Spend Categories</h4>
                       <div className="h-[180px] w-full">
                           <ResponsiveContainer width="100%" height="100%">
                               <RePieChart>
                                   <Pie 
                                        data={expenseBreakdown} 
                                        innerRadius={60} 
                                        outerRadius={80} 
                                        paddingAngle={5} 
                                        dataKey="value"
                                    >
                                       {expenseBreakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                   </Pie>
                                   <Tooltip />
                               </RePieChart>
                           </ResponsiveContainer>
                       </div>
                       <div className="mt-4 space-y-2">
                           {expenseBreakdown.map((cat, i) => (
                               <div key={cat.name} className="flex items-center justify-between text-xs">
                                   <div className="flex items-center gap-2">
                                       <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                                       <span className="text-text-secondary">{cat.name}</span>
                                   </div>
                                   <span className="font-bold text-text-primary dark:text-text-primary-dark">${cat.value.toLocaleString()}</span>
                               </div>
                           ))}
                       </div>
                  </Card>
              </div>
          </div>
      </div>
  );

  return (
    <div className="h-full flex flex-col">
      <SectionHeader 
        title="Finance Operating System" 
        subtitle="End-to-end payment processing and automated reporting."
        action={
          <div className="flex gap-3">
             <Button variant="secondary" icon={Download} size="sm">Export CSV</Button>
             <Button variant="secondary" icon={Package} size="sm" onClick={() => setIsProductModalOpen(true)}>New Product</Button>
             <Button icon={Plus} size="sm" onClick={() => setIsInvoiceModalOpen(true)}>New Invoice</Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className={`relative overflow-hidden transition-all duration-300 ${stripeConnected ? 'border-[#635BFF]/30 bg-[#635BFF]/5' : 'hover:border-[#635BFF]/30'}`}>
              <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-white text-2xl font-bold shadow-md ${stripeConnected ? 'bg-[#635BFF]' : 'bg-surface-muted dark:bg-surface-muted-dark text-text-tertiary'}`}>
                          {stripeConnected ? 'S' : <CreditCard className="w-6 h-6" />}
                      </div>
                      <div>
                          <h3 className="text-lg font-bold text-text-primary dark:text-text-primary-dark flex items-center gap-2">
                              Stripe
                              {stripeConnected && <Badge variant="success" className="px-1.5 py-0.5"><Check className="w-3 h-3 mr-1" /> Active</Badge>}
                          </h3>
                          <p className="text-sm text-text-secondary mt-1">Accept credit cards and Apple Pay.</p>
                      </div>
                  </div>
                  <div>
                      {stripeConnected ? (
                           <Button variant="ghost" size="sm" className="text-red-500" onClick={() => setStripeConnected(false)}>Disconnect</Button>
                      ) : (
                          <Button onClick={handleConnectStripe} disabled={isStripeConnecting} className="bg-[#635BFF] hover:bg-[#534CC2] text-white border-transparent" size="sm">
                              {isStripeConnecting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Connect'}
                          </Button>
                      )}
                  </div>
              </div>
          </Card>
          <Card className={`relative overflow-hidden transition-all duration-300 ${paypalConnected ? 'border-[#0070BA]/30 bg-[#0070BA]/5' : 'hover:border-[#0070BA]/30'}`}>
              <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-white text-2xl font-bold shadow-md ${paypalConnected ? 'bg-[#0070BA]' : 'bg-surface-muted dark:bg-surface-muted-dark text-text-tertiary'}`}>
                          {paypalConnected ? 'P' : <RefreshCw className="w-6 h-6" />}
                      </div>
                      <div>
                          <h3 className="text-lg font-bold text-text-primary dark:text-text-primary-dark flex items-center gap-2">
                              PayPal
                              {paypalConnected && <Badge variant="success" className="px-1.5 py-0.5"><Check className="w-3 h-3 mr-1" /> Active</Badge>}
                          </h3>
                          <p className="text-sm text-text-secondary mt-1">Accept payments via PayPal wallet.</p>
                      </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setPaypalConnected(!paypalConnected)}>{paypalConnected ? 'Disconnect' : 'Connect'}</Button>
              </div>
          </Card>
      </div>

      <Tabs 
        tabs={['Reports', 'Invoices', 'Expenses', 'Products']} 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
         <Card padding="p-4" className="border-l-4 border-l-emerald-500 relative group">
            <p className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest">Gross Revenue</p>
            <div className="flex items-end justify-between mt-2">
               <h3 className="text-2xl font-bold">${financialMetrics.totalRevenue.toLocaleString()}</h3>
               <ArrowUpRight className="text-emerald-500 w-5 h-5" />
            </div>
            {/* Shortcut to AI Analysis */}
            <button 
                onClick={handleGenerateAiReport}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-primary-50 text-primary-600 rounded-md"
                title="Quick AI Analysis"
            >
                <Sparkles className="w-3 h-3" />
            </button>
         </Card>
         <Card padding="p-4" className="border-l-4 border-l-rose-500">
            <p className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest">Total Spend</p>
            <div className="flex items-end justify-between mt-2">
               <h3 className="text-2xl font-bold">${financialMetrics.totalExpenses.toLocaleString()}</h3>
               <ArrowDownRight className="text-rose-500 w-5 h-5" />
            </div>
         </Card>
         <Card padding="p-4" className="border-l-4 border-l-primary-500">
            <p className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest">Net Profit</p>
            <div className="flex items-end justify-between mt-2">
               <h3 className="text-2xl font-bold">${financialMetrics.netProfit.toLocaleString()}</h3>
               <Badge variant="brand" className="text-[9px] px-1">Safe</Badge>
            </div>
         </Card>
         <Card padding="p-4" className="border-l-4 border-l-amber-500">
            <p className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest">Outstanding</p>
            <div className="flex items-end justify-between mt-2">
               <h3 className="text-2xl font-bold">${financialMetrics.outstandingRevenue.toLocaleString()}</h3>
               <span className="text-[10px] text-text-tertiary">{invoices.filter(i => i.status !== 'Paid').length} Unpaid</span>
            </div>
         </Card>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto">
          {activeTab === 'Reports' && <ReportingTab />}

          {activeTab === 'Invoices' && (
            <Card className="overflow-hidden flex flex-col" padding="p-0">
              <table className="w-full text-left">
                <thead className="bg-surface-subtle dark:bg-surface-muted-dark text-xs font-bold text-text-tertiary uppercase">
                  <tr>
                    <th className="px-6 py-4">Invoice ID</th>
                    <th className="px-6 py-4">Client</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border dark:divide-border-dark">
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-surface-subtle/50 group transition-colors">
                      <td className="px-6 py-4 text-sm font-bold">{inv.id}</td>
                      <td className="px-6 py-4 text-sm text-text-secondary">{inv.client}</td>
                      <td className="px-6 py-4 text-sm font-bold">${inv.amount.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <Badge variant={inv.status === 'Paid' ? 'success' : inv.status === 'Overdue' ? 'danger' : 'warning'}>{inv.status}</Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                         <Button size="sm" variant="ghost" icon={MoreHorizontal} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}

          {activeTab === 'Expenses' && (
            <Card className="overflow-hidden flex flex-col" padding="p-0">
              <table className="w-full text-left">
                <thead className="bg-surface-subtle dark:bg-surface-muted-dark text-xs font-bold text-text-tertiary uppercase">
                  <tr>
                    <th className="px-6 py-4">Vendor</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border dark:divide-border-dark">
                  {expenses.map((exp) => (
                    <tr key={exp.id} className="hover:bg-surface-subtle/50 group transition-colors">
                      <td className="px-6 py-4 text-sm font-bold">{exp.vendor}</td>
                      <td className="px-6 py-4 text-sm"><Badge variant="neutral">{exp.category}</Badge></td>
                      <td className="px-6 py-4 text-sm font-bold text-rose-600">-${exp.amount.toLocaleString()}</td>
                      <td className="px-6 py-4"><Badge variant={exp.status === 'Paid' ? 'success' : 'warning'}>{exp.status}</Badge></td>
                      <td className="px-6 py-4 text-right text-xs text-text-tertiary">{exp.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}
      </div>

      {/* Existing Modals */}
      <Modal isOpen={isInvoiceModalOpen} onClose={() => setIsInvoiceModalOpen(false)} title="Create New Invoice">
         <form onSubmit={handleCreateInvoice} className="space-y-4">
             <Input placeholder="Client Name" value={newInvoice.client} onChange={e => setNewInvoice({...newInvoice, client: e.target.value})} required />
             <Input type="number" placeholder="Amount ($)" value={newInvoice.amount} onChange={e => setNewInvoice({...newInvoice, amount: e.target.value})} required />
             <Input type="date" value={newInvoice.date} onChange={e => setNewInvoice({...newInvoice, date: e.target.value})} />
             <div className="pt-4 flex justify-end gap-3">
                 <Button type="button" variant="ghost" onClick={() => setIsInvoiceModalOpen(false)}>Cancel</Button>
                 <Button type="submit">Create Invoice</Button>
             </div>
         </form>
      </Modal>

    </div>
  );
};
