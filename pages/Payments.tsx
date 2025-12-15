
import React, { useState } from 'react';
import { Invoice, Product } from '../types';
import { Plus, Download, Filter, MoreHorizontal, Package, Loader2, CreditCard, Tag, ExternalLink, Check, Settings, ShieldCheck, RefreshCw } from 'lucide-react';
import { Button, Card, Badge, SectionHeader, Tabs, Modal, Input } from '../components/ui/Primitives';
import { useNotifications } from '../components/ui/NotificationSystem';
import { useData } from '../context/DataContext';
import { PaymentModal } from '../components/ui/PaymentModal';

export const Payments: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Invoices');
  const { addNotification } = useNotifications();
  const { invoices, products, addInvoice, updateInvoice, addProduct, stripeConnected, setStripeConnected, paypalConnected, setPaypalConnected } = useData();
  
  // State
  const [isStripeConnecting, setIsStripeConnecting] = useState(false);
  const [isPaypalConnecting, setIsPaypalConnecting] = useState(false);
  
  // Modals
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [invoiceToPay, setInvoiceToPay] = useState<Invoice | null>(null);

  // Form State
  const [newInvoice, setNewInvoice] = useState({ client: '', amount: '', date: '' });
  const [newProduct, setNewProduct] = useState({ name: '', price: '', type: 'One-time' });

  const handleConnectStripe = () => {
      setIsStripeConnecting(true);
      setTimeout(() => {
          setStripeConnected(true);
          setIsStripeConnecting(false);
          addNotification({ title: 'Stripe Connected', message: 'Your account is now ready to accept card payments.', type: 'success' });
      }, 2000);
  };

  const handleDisconnectStripe = () => {
      if (window.confirm("Disconnect Stripe account?")) {
          setStripeConnected(false);
          addNotification({ title: 'Stripe Disconnected', message: 'Payment gateway removed.', type: 'info' });
      }
  };

  const handleConnectPaypal = () => {
      setIsPaypalConnecting(true);
      setTimeout(() => {
          setPaypalConnected(true);
          setIsPaypalConnecting(false);
          addNotification({ title: 'PayPal Connected', message: 'You can now accept payments via PayPal.', type: 'success' });
      }, 2000);
  };

  const handleDisconnectPaypal = () => {
      if (window.confirm("Disconnect PayPal account?")) {
          setPaypalConnected(false);
          addNotification({ title: 'PayPal Disconnected', message: 'Payment gateway removed.', type: 'info' });
      }
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

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const product: Product = {
        id: `PROD-${products.length + 1}`,
        name: newProduct.name,
        price: parseFloat(newProduct.price),
        type: newProduct.type as 'One-time' | 'Subscription',
        currency: 'USD',
        sales: 0
    };
    addProduct(product);
    setNewProduct({ name: '', price: '', type: 'One-time' });
    setIsProductModalOpen(false);
    setActiveTab('Products'); // UX Improvement: Switch to products tab
    addNotification({ title: 'Product Created', message: `${product.name} has been added to your catalog.`, type: 'success' });
  };

  const initiatePayment = (invoice: Invoice) => {
      if (!stripeConnected && !paypalConnected) {
          addNotification({ title: 'Payment Gateway Missing', message: 'Please connect Stripe or PayPal to process payments.', type: 'warning' });
          return;
      }
      setInvoiceToPay(invoice);
      setIsPaymentModalOpen(true);
  };

  const handlePaymentSuccess = () => {
      if (invoiceToPay) {
          updateInvoice({ ...invoiceToPay, status: 'Paid' });
          setInvoiceToPay(null);
          addNotification({ title: 'Payment Successful', message: `Payment received for invoice #${invoiceToPay.id}`, type: 'success' });
      }
  };

  return (
    <div className="h-full flex flex-col">
      <SectionHeader 
        title="Payments" 
        subtitle="Manage invoices, subscriptions, and products."
        action={
          <div className="flex gap-3">
             <Button variant="secondary" icon={Download} size="sm">Export</Button>
             <Button variant="secondary" icon={Package} size="sm" onClick={() => setIsProductModalOpen(true)}>Create Product</Button>
             <Button icon={Plus} size="sm" onClick={() => setIsInvoiceModalOpen(true)}>Create Invoice</Button>
          </div>
        }
      />

      {/* Payment Gateways Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Stripe Card */}
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
                           <div className="flex gap-2">
                                <Button variant="ghost" size="sm" icon={ExternalLink} onClick={() => window.open('#', '_blank')} />
                                <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={handleDisconnectStripe}>Disconnect</Button>
                           </div>
                      ) : (
                          <Button 
                            onClick={handleConnectStripe} 
                            disabled={isStripeConnecting}
                            className="bg-[#635BFF] hover:bg-[#534CC2] text-white border-transparent"
                            size="sm"
                          >
                              {isStripeConnecting ? <><Loader2 className="w-3.5 h-3.5 animate-spin mr-2" /> Connecting...</> : 'Connect'}
                          </Button>
                      )}
                  </div>
              </div>
          </Card>

          {/* PayPal Card */}
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
                  <div>
                      {paypalConnected ? (
                           <div className="flex gap-2">
                                <Button variant="ghost" size="sm" icon={ExternalLink} onClick={() => window.open('#', '_blank')} />
                                <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={handleDisconnectPaypal}>Disconnect</Button>
                           </div>
                      ) : (
                          <Button 
                            onClick={handleConnectPaypal} 
                            disabled={isPaypalConnecting}
                            className="bg-[#0070BA] hover:bg-[#005EA6] text-white border-transparent"
                            size="sm"
                          >
                              {isPaypalConnecting ? <><Loader2 className="w-3.5 h-3.5 animate-spin mr-2" /> Connecting...</> : 'Connect'}
                          </Button>
                      )}
                  </div>
              </div>
          </Card>
      </div>

      <Tabs 
        tabs={['Invoices', 'Products', 'Subscriptions']} 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
         <Card padding="p-4">
            <p className="text-xs font-medium text-text-secondary uppercase tracking-wider">Total Revenue</p>
            <div className="flex items-end justify-between mt-2">
               <h3 className="text-2xl font-bold text-text-primary">
                 ${invoices.reduce((acc, inv) => inv.status === 'Paid' ? acc + inv.amount : acc, 0).toLocaleString()}
               </h3>
               <Badge variant="success" className="mb-1">+12%</Badge>
            </div>
         </Card>
         <Card padding="p-4">
            <p className="text-xs font-medium text-text-secondary uppercase tracking-wider">Outstanding</p>
            <div className="flex items-end justify-between mt-2">
               <h3 className="text-2xl font-bold text-text-primary">
                 ${invoices.reduce((acc, inv) => inv.status === 'Pending' ? acc + inv.amount : acc, 0).toLocaleString()}
               </h3>
               <span className="text-xs text-text-tertiary mb-1">{invoices.filter(i => i.status === 'Pending').length} invoices</span>
            </div>
         </Card>
         <Card padding="p-4">
            <p className="text-xs font-medium text-text-secondary uppercase tracking-wider">MRR</p>
            <div className="flex items-end justify-between mt-2">
               <h3 className="text-2xl font-bold text-text-primary">$18,400</h3>
               <Badge variant="brand" className="mb-1">+5%</Badge>
            </div>
         </Card>
      </div>

      {activeTab === 'Invoices' && (
        <Card className="flex-1 overflow-hidden flex flex-col" padding="p-0">
          <div className="flex items-center gap-2 p-3 border-b border-border bg-surface-subtle/30">
             <div className="relative flex-1 max-w-sm">
                <input type="text" placeholder="Filter invoices..." className="w-full pl-3 pr-3 py-1.5 text-sm bg-surface border border-border rounded-md focus:ring-1 focus:ring-primary-500 outline-none" />
             </div>
             <Button variant="ghost" size="sm" icon={Filter}>Filter</Button>
          </div>
          <div className="flex-1 overflow-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface-subtle sticky top-0 z-10 border-b border-border">
                <tr>
                  <th className="px-6 py-3 text-xs font-semibold text-text-tertiary uppercase tracking-wider">Invoice ID</th>
                  <th className="px-6 py-3 text-xs font-semibold text-text-tertiary uppercase tracking-wider">Client</th>
                  <th className="px-6 py-3 text-xs font-semibold text-text-tertiary uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-xs font-semibold text-text-tertiary uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-xs font-semibold text-text-tertiary uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-xs font-semibold text-text-tertiary uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-surface-subtle/50 transition-colors group">
                    <td className="px-6 py-4 text-sm font-medium text-text-primary">{invoice.id}</td>
                    <td className="px-6 py-4 text-sm text-text-secondary">{invoice.client}</td>
                    <td className="px-6 py-4 text-sm text-text-secondary">{invoice.date}</td>
                    <td className="px-6 py-4 text-sm font-medium text-text-primary">${invoice.amount.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <Badge variant={
                          invoice.status === 'Paid' ? 'success' : 
                          invoice.status === 'Overdue' ? 'danger' : 'warning'
                      }>
                          {invoice.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                       {invoice.status === 'Pending' ? (
                           <Button 
                                size="sm" 
                                variant={stripeConnected || paypalConnected ? 'primary' : 'secondary'} 
                                className="h-7 text-xs"
                                onClick={() => initiatePayment(invoice)}
                            >
                                Charge Card
                           </Button>
                       ) : (
                           <button className="text-text-tertiary hover:text-text-primary transition-opacity">
                                <MoreHorizontal className="w-4 h-4" />
                           </button>
                       )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {(activeTab === 'Products' || activeTab === 'Subscriptions') && (
        <div className="h-full">
            {products.length === 0 && activeTab === 'Products' ? (
                <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl bg-surface-subtle/30 h-96">
                    <div className="w-12 h-12 bg-surface-muted rounded-full flex items-center justify-center mb-4">
                        <Package className="w-6 h-6 text-text-tertiary" />
                    </div>
                    <h3 className="text-base font-semibold text-text-primary">No products yet</h3>
                    <p className="text-sm text-text-secondary mt-1 max-w-xs text-center">
                        Start by creating your first product to begin selling.
                    </p>
                    <Button className="mt-6" icon={Plus} variant="secondary" onClick={() => setIsProductModalOpen(true)}>Create Product</Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {products.map(product => (
                        <Card key={product.id} className="hover:border-primary-200 transition-colors">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2 bg-primary-50 text-primary-600 rounded-lg">
                                    <Tag className="w-5 h-5" />
                                </div>
                                <Badge variant="neutral">{product.type}</Badge>
                            </div>
                            <h3 className="font-semibold text-text-primary">{product.name}</h3>
                            <p className="text-2xl font-bold text-text-primary mt-2">${product.price}</p>
                            <div className="mt-4 pt-4 border-t border-border flex justify-between items-center">
                                <span className="text-sm text-text-secondary">{product.sales} sales</span>
                                <Button size="sm" variant="ghost">Edit</Button>
                            </div>
                        </Card>
                    ))}
                    {activeTab === 'Products' && (
                         <button 
                            onClick={() => setIsProductModalOpen(true)}
                            className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-border rounded-xl hover:border-primary-300 hover:bg-primary-50/30 transition-all gap-2 text-text-secondary hover:text-primary-600"
                        >
                            <div className="w-10 h-10 rounded-full bg-surface-muted flex items-center justify-center">
                                <Plus className="w-5 h-5" />
                            </div>
                            <span className="text-sm font-medium">Add New Product</span>
                        </button>
                    )}
                </div>
            )}
            
            {activeTab === 'Subscriptions' && (
                 <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl bg-surface-subtle/30 h-96 mt-4">
                    <ShieldCheck className="w-12 h-12 text-text-tertiary mb-3 opacity-50" />
                    <p className="text-text-secondary font-medium">Subscriptions Dashboard</p>
                    <p className="text-xs text-text-tertiary mt-1">
                        {stripeConnected || paypalConnected ? 'No active subscriptions found.' : 'Connect Stripe or PayPal to manage subscriptions.'}
                    </p>
                 </div>
            )}
        </div>
      )}

      {/* --- Modals --- */}
      
      {/* Invoice Modal */}
      <Modal isOpen={isInvoiceModalOpen} onClose={() => setIsInvoiceModalOpen(false)} title="Create New Invoice">
         <form onSubmit={handleCreateInvoice} className="space-y-4">
             <div className="space-y-1.5">
                 <label className="text-xs font-medium text-text-secondary">Client Name</label>
                 <Input 
                    placeholder="e.g. Acme Corp" 
                    value={newInvoice.client}
                    onChange={e => setNewInvoice({...newInvoice, client: e.target.value})}
                    required
                 />
             </div>
             <div className="space-y-1.5">
                 <label className="text-xs font-medium text-text-secondary">Amount ($)</label>
                 <Input 
                    type="number" 
                    placeholder="0.00" 
                    value={newInvoice.amount}
                    onChange={e => setNewInvoice({...newInvoice, amount: e.target.value})}
                    required
                 />
             </div>
             <div className="space-y-1.5">
                 <label className="text-xs font-medium text-text-secondary">Due Date</label>
                 <Input 
                    type="date" 
                    value={newInvoice.date}
                    onChange={e => setNewInvoice({...newInvoice, date: e.target.value})}
                 />
             </div>
             <div className="pt-4 flex justify-end gap-3">
                 <Button type="button" variant="ghost" onClick={() => setIsInvoiceModalOpen(false)}>Cancel</Button>
                 <Button type="submit">Create Invoice</Button>
             </div>
         </form>
      </Modal>

      {/* Product Modal */}
      <Modal isOpen={isProductModalOpen} onClose={() => setIsProductModalOpen(false)} title="Add Product">
         <form onSubmit={handleCreateProduct} className="space-y-4">
             <div className="space-y-1.5">
                 <label className="text-xs font-medium text-text-secondary">Product Name</label>
                 <Input 
                    placeholder="e.g. Basic Plan" 
                    value={newProduct.name}
                    onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                    required
                 />
             </div>
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <label className="text-xs font-medium text-text-secondary">Price ($)</label>
                    <Input 
                        type="number" 
                        placeholder="0.00" 
                        value={newProduct.price}
                        onChange={e => setNewProduct({...newProduct, price: e.target.value})}
                        required
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="text-xs font-medium text-text-secondary">Type</label>
                    <select 
                        className="w-full h-[38px] px-3 bg-surface border border-border rounded-lg text-sm text-text-primary focus:ring-2 focus:ring-primary-100 outline-none"
                        value={newProduct.type}
                        onChange={e => setNewProduct({...newProduct, type: e.target.value})}
                    >
                        <option value="One-time">One-time</option>
                        <option value="Subscription">Subscription</option>
                    </select>
                </div>
             </div>
             <div className="pt-4 flex justify-end gap-3">
                 <Button type="button" variant="ghost" onClick={() => setIsProductModalOpen(false)}>Cancel</Button>
                 <Button type="submit">Add Product</Button>
             </div>
         </form>
      </Modal>

      {/* Payment Modal */}
      {invoiceToPay && (
          <PaymentModal 
            isOpen={isPaymentModalOpen}
            onClose={() => { setIsPaymentModalOpen(false); setInvoiceToPay(null); }}
            amount={invoiceToPay.amount}
            description={`Invoice #${invoiceToPay.id}`}
            onSuccess={handlePaymentSuccess}
          />
      )}

    </div>
  );
};
