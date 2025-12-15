
import React, { useState } from 'react';
import { User, Shield, Bell, CreditCard, Mail, Building, Plus, Check, Loader2, Link2, ExternalLink, Palette, Monitor, Globe, Server, Key, Send, Zap, Star, Crown, Battery, Grid, Users, Calendar, Workflow, Filter, FileText, Briefcase, PieChart, Inbox, HardDrive, Target, Megaphone, Smile, PenTool, ScanLine, Bot } from 'lucide-react';
import { Button, Card, SectionHeader, Tabs, Input, Badge } from '../components/ui/Primitives';
import { useNotifications } from '../components/ui/NotificationSystem';
import { useData } from '../context/DataContext';
import { useLanguage } from '../context/LanguageContext';
import { TeamMember, AccentColor, SubscriptionPlan, AppModule } from '../types';
import { PaymentModal } from '../components/ui/PaymentModal';

export const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Profile');
  const { addNotification } = useNotifications();
  const { userProfile, updateUserProfile, teamMembers, addTeamMember, removeTeamMember, stripeConnected, setStripeConnected, accentColor, setAccentColor, theme, toggleTheme, emailConfig, updateEmailConfig, sendEmail, subscriptionPlan, setSubscriptionPlan, enabledModules, toggleModule } = useData();
  const { t, language, setLanguage } = useLanguage();

  // Team Invite State
  const [inviteEmail, setInviteEmail] = useState('');
  const [isInviting, setIsInviting] = useState(false);

  // Billing/Stripe Logic
  const [isConnecting, setIsConnecting] = useState(false);
  
  // Payment Modal
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [pendingPlan, setPendingPlan] = useState<SubscriptionPlan | null>(null);
  
  // Email Testing State
  const [isTestingEmail, setIsTestingEmail] = useState(false);

  // Profile Form State
  const [formData, setFormData] = useState({
      firstName: userProfile.firstName,
      lastName: userProfile.lastName,
      email: userProfile.email
  });

  const handleProfileSave = () => {
      updateUserProfile(formData);
      addNotification({title: 'Saved', message: 'Profile updated successfully', type: 'success'});
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!inviteEmail) return;

    setIsInviting(true);
    
    // Use the email service
    const success = await sendEmail(
        inviteEmail, 
        "You've been invited to Nexus", 
        `Hello,\n\nYou have been invited to join the Nexus workspace by ${userProfile.firstName}.\n\nClick here to join: https://nexus.com/join`
    );

    if (success) {
        const newMember: TeamMember = {
            id: Date.now().toString(),
            name: '',
            email: inviteEmail,
            role: 'Viewer',
            status: 'Invited'
        };
        addTeamMember(newMember);
        setInviteEmail('');
        addNotification({
            title: 'Invitation Sent',
            message: `Invitation successfully sent to ${inviteEmail}`,
            type: 'success'
        });
    } else {
        addNotification({
            title: 'Delivery Failed',
            message: 'Could not send email. Check your email settings.',
            type: 'error'
        });
    }
    setIsInviting(false);
  };

  const handleRemoveMember = (id: string) => {
      removeTeamMember(id);
      addNotification({title: 'Removed', message: 'Team member removed.', type: 'info'});
  };

  const handleConnectStripe = () => {
    setIsConnecting(true);
    // Simulate OAuth flow
    setTimeout(() => {
        setStripeConnected(true);
        setIsConnecting(false);
        addNotification({
            title: 'Stripe Connected',
            message: 'Payments enabled. You can now accept credit cards.',
            type: 'success'
        });
    }, 2000);
  };

  const handleTestEmail = async () => {
    setIsTestingEmail(true);
    const success = await sendEmail(
        userProfile.email,
        "Test Email from Nexus",
        "This is a test email to verify your configuration settings. If you received this, your email system is working correctly."
    );
    setIsTestingEmail(false);
    if (success) {
        addNotification({ title: 'Test Sent', message: `Check your inbox at ${userProfile.email}`, type: 'success' });
    } else {
        addNotification({ title: 'Test Failed', message: 'Check console for details and verify settings.', type: 'error' });
    }
  }

  const handlePlanClick = (plan: SubscriptionPlan) => {
      if (plan === 'Starter') {
          setSubscriptionPlan('Starter');
          addNotification({ title: 'Plan Updated', message: 'You have downgraded to Starter.', type: 'info' });
      } else {
          setPendingPlan(plan);
          setIsPaymentOpen(true);
      }
  };

  const handlePaymentSuccess = () => {
      if (pendingPlan) {
          setSubscriptionPlan(pendingPlan);
          addNotification({ title: 'Plan Updated', message: `You are now on the ${pendingPlan} plan.`, type: 'success' });
          setPendingPlan(null);
      }
  };

  const getPrice = (plan: SubscriptionPlan) => {
      if (plan === 'Pro') return 29;
      if (plan === 'Business') return 99;
      return 0;
  };

  const ColorSwatch = ({ color, value }: { color: AccentColor, value: string }) => (
      <button 
        onClick={() => setAccentColor(color)}
        className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all ${accentColor === color ? 'border-text-primary scale-110 shadow-md' : 'border-transparent hover:scale-105'}`}
        style={{ backgroundColor: `rgb(${value})` }}
      >
          {accentColor === color && <Check className="w-5 h-5 text-white drop-shadow-md" />}
      </button>
  );

  const AVAILABLE_MODULES: { id: AppModule; label: string; icon: any; description: string }[] = [
      { id: 'inbox', label: 'Inbox', icon: Inbox, description: 'Unified messaging and client communication hub.' },
      { id: 'bookings', label: 'Bookings', icon: Calendar, description: 'Appointment scheduling and calendar management.' },
      { id: 'storage', label: 'Drive', icon: HardDrive, description: 'Secure file storage and document management.' },
      { id: 'crm', label: 'CRM', icon: Users, description: 'Customer Relationship Management and deal tracking.' },
      { id: 'funnels', label: 'Funnels', icon: Filter, description: 'Landing page builder and conversion tracking.' },
      { id: 'campaigns', label: 'Campaigns', icon: Send, description: 'Email marketing automation and broadcasts.' },
      { id: 'social', label: 'Social', icon: Megaphone, description: 'Social media planning and scheduling.' },
      { id: 'analytics', label: 'Analytics', icon: PieChart, description: 'Business intelligence and reporting dashboard.' },
      { id: 'projects', label: 'Projects', icon: Briefcase, description: 'Task management, roadmaps, and collaboration.' },
      { id: 'team', label: 'Team', icon: Smile, description: 'Employee directory and recruiting pipeline.' },
      { id: 'payments', label: 'Payments', icon: CreditCard, description: 'Invoicing, subscriptions, and product catalog.' },
      { id: 'documents', label: 'Documents', icon: FileText, description: 'Proposals, contracts, and e-signatures.' },
      { id: 'scan', label: 'Nexus Lens', icon: ScanLine, description: 'AI-powered document scanning and extraction.' },
      { id: 'automations', label: 'Automations', icon: Workflow, description: 'Visual workflow builder for business logic.' },
      { id: 'canvas', label: 'Canvas', icon: PenTool, description: 'Infinite whiteboard for brainstorming.' },
      { id: 'strategy', label: 'Strategy', icon: Target, description: 'OKR tracking and goal management.' },
      { id: 'assistant', label: 'AI Assistant', icon: Bot, description: 'Context-aware AI chat and voice assistant.' },
      { id: 'marketplace', label: 'App Store', icon: Grid, description: 'Integrations and third-party apps.' },
  ];

  return (
    <div className="max-w-4xl mx-auto pb-10">
      <SectionHeader 
        title={t('settings.title')} 
        subtitle={t('settings.subtitle')}
      />

      <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-8">
         {/* Settings Sidebar */}
         <div className="flex flex-col gap-1">
            {[t('settings.tab_profile'), 'Modules', t('settings.tab_appearance'), t('settings.tab_team'), t('settings.tab_billing')].map(tab => (
                <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`text-left rtl:text-right px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        activeTab === tab 
                        ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400' 
                        : 'text-text-secondary hover:bg-surface-muted dark:hover:bg-surface-muted-dark hover:text-text-primary dark:hover:text-text-primary-dark'
                    }`}
                >
                    {tab}
                </button>
            ))}
         </div>

         {/* Content Area */}
         <div className="space-y-6">
            {activeTab === t('settings.tab_profile') && (
                <>
                    <Card>
                        <h3 className="text-lg font-semibold text-text-primary dark:text-text-primary-dark mb-6">Personal Information</h3>
                        <div className="flex items-center gap-6 mb-8">
                            <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-700 border-2 border-white dark:border-gray-600 shadow-sm flex items-center justify-center text-xl font-bold text-gray-500 dark:text-gray-300">
                                {userProfile.avatar}
                            </div>
                            <div>
                                <Button variant="secondary" size="sm" className="mb-2">Change Avatar</Button>
                                <p className="text-xs text-text-tertiary">JPG, GIF or PNG. Max size of 800K</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-text-secondary">First Name</label>
                                <Input 
                                    value={formData.firstName} 
                                    onChange={e => setFormData({...formData, firstName: e.target.value})} 
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-text-secondary">Last Name</label>
                                <Input 
                                    value={formData.lastName} 
                                    onChange={e => setFormData({...formData, lastName: e.target.value})} 
                                />
                            </div>
                            <div className="space-y-1.5 md:col-span-2">
                                <label className="text-xs font-medium text-text-secondary">Email Address</label>
                                <Input 
                                    icon={Mail} 
                                    value={formData.email} 
                                    onChange={e => setFormData({...formData, email: e.target.value})} 
                                />
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end">
                            <Button onClick={handleProfileSave}>Save Changes</Button>
                        </div>
                    </Card>
                </>
            )}

            {activeTab === 'Modules' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {AVAILABLE_MODULES.map(module => (
                        <div key={module.id} className="p-4 bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-xl flex items-start gap-4 transition-all hover:border-primary-200 dark:hover:border-primary-800">
                            <div className={`p-2 rounded-lg shrink-0 ${enabledModules.includes(module.id) ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400' : 'bg-surface-muted text-text-tertiary dark:bg-surface-muted-dark'}`}>
                                <module.icon className="w-6 h-6" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                    <h4 className="font-semibold text-sm text-text-primary dark:text-text-primary-dark">{module.label}</h4>
                                    <button 
                                        onClick={() => toggleModule(module.id)}
                                        className={`w-10 h-6 rounded-full p-1 transition-colors ${enabledModules.includes(module.id) ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-700'}`}
                                    >
                                        <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform ${enabledModules.includes(module.id) ? 'translate-x-4' : 'translate-x-0'}`}></div>
                                    </button>
                                </div>
                                <p className="text-xs text-text-secondary dark:text-text-secondary-dark leading-relaxed">{module.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {activeTab === t('settings.tab_billing') && (
                 <div className="space-y-8">
                    {/* Credit Usage Panel */}
                    <Card>
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-lg font-semibold text-text-primary dark:text-text-primary-dark flex items-center gap-2">
                                    <Battery className="w-5 h-5 text-primary-500" />
                                    AI Credits
                                </h3>
                                <p className="text-sm text-text-secondary">Usage for AI writing, scanning, and assistant.</p>
                            </div>
                            <Badge variant={subscriptionPlan === 'Starter' ? 'warning' : 'success'}>
                                {subscriptionPlan === 'Starter' ? 'Limited Plan' : 'Unlimited Plan'}
                            </Badge>
                        </div>
                        
                        {subscriptionPlan === 'Starter' ? (
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="font-medium text-text-primary dark:text-text-primary-dark">{userProfile.aiCredits} / 50 Credits Remaining</span>
                                    <span className="text-text-tertiary">Resets in 28 days</span>
                                </div>
                                <div className="w-full h-3 bg-surface-muted dark:bg-surface-muted-dark rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full rounded-full transition-all duration-500 ${userProfile.aiCredits < 10 ? 'bg-red-500' : 'bg-primary-500'}`} 
                                        style={{ width: `${(userProfile.aiCredits / 50) * 100}%` }}
                                    ></div>
                                </div>
                                {userProfile.aiCredits < 10 && (
                                    <p className="text-xs text-red-500 mt-1">You are running low on credits. Upgrade to remove limits.</p>
                                )}
                            </div>
                        ) : (
                            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/30 rounded-lg flex items-center gap-3">
                                <div className="p-2 bg-green-100 dark:bg-green-900/40 rounded-full text-green-600 dark:text-green-400">
                                    <Check className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-green-800 dark:text-green-300">Unlimited Access Active</p>
                                    <p className="text-xs text-green-700 dark:text-green-400">You have unlimited AI credits with your {subscriptionPlan} plan.</p>
                                </div>
                            </div>
                        )}
                    </Card>

                    {/* Subscription Plans */}
                    <div>
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-text-primary dark:text-text-primary-dark">Subscription Plan</h3>
                            <p className="text-sm text-text-secondary">Choose the plan that fits your business needs.</p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Starter Plan */}
                            <div className={`relative border-2 rounded-xl p-6 flex flex-col transition-colors ${subscriptionPlan === 'Starter' ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10' : 'border-border dark:border-border-dark bg-surface dark:bg-surface-dark hover:border-primary-200'}`}>
                                <div className="mb-4">
                                    <h4 className="text-lg font-bold text-text-primary dark:text-text-primary-dark flex items-center gap-2">
                                        <Zap className="w-5 h-5 text-text-tertiary" /> Starter
                                    </h4>
                                    <p className="text-3xl font-bold mt-2">$0<span className="text-sm font-medium text-text-tertiary">/mo</span></p>
                                </div>
                                <ul className="space-y-3 mb-8 flex-1">
                                    <li className="flex items-center gap-2 text-sm text-text-secondary"><Check className="w-4 h-4 text-green-500" /> 1 Team Member</li>
                                    <li className="flex items-center gap-2 text-sm text-text-secondary"><Check className="w-4 h-4 text-green-500" /> Basic CRM</li>
                                    <li className="flex items-center gap-2 text-sm text-text-secondary"><Check className="w-4 h-4 text-green-500" /> 50 AI Credits/mo</li>
                                </ul>
                                <Button 
                                    variant={subscriptionPlan === 'Starter' ? 'secondary' : 'primary'}
                                    disabled={subscriptionPlan === 'Starter'}
                                    onClick={() => handlePlanClick('Starter')}
                                    className="w-full"
                                >
                                    {subscriptionPlan === 'Starter' ? 'Current Plan' : 'Downgrade'}
                                </Button>
                            </div>

                            {/* Pro Plan */}
                            <div className={`relative border-2 rounded-xl p-6 flex flex-col shadow-lg transform md:-translate-y-2 ${subscriptionPlan === 'Pro' ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10' : 'border-primary-500 bg-surface dark:bg-surface-dark'}`}>
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary-600 text-white text-xs px-3 py-1 rounded-full font-medium tracking-wide shadow-sm">
                                    MOST POPULAR
                                </div>
                                <div className="mb-4">
                                    <h4 className="text-lg font-bold text-primary-600 dark:text-primary-400 flex items-center gap-2">
                                        <Star className="w-5 h-5 fill-current" /> Professional
                                    </h4>
                                    <p className="text-3xl font-bold mt-2 text-text-primary dark:text-text-primary-dark">$29<span className="text-sm font-medium text-text-tertiary">/mo</span></p>
                                </div>
                                <ul className="space-y-3 mb-8 flex-1">
                                    <li className="flex items-center gap-2 text-sm text-text-primary dark:text-text-primary-dark font-medium"><Check className="w-4 h-4 text-primary-500" /> Up to 5 Team Members</li>
                                    <li className="flex items-center gap-2 text-sm text-text-primary dark:text-text-primary-dark font-medium"><Check className="w-4 h-4 text-primary-500" /> Advanced Automations</li>
                                    <li className="flex items-center gap-2 text-sm text-text-primary dark:text-text-primary-dark font-medium"><Check className="w-4 h-4 text-primary-500" /> Unlimited AI Credits</li>
                                    <li className="flex items-center gap-2 text-sm text-text-primary dark:text-text-primary-dark font-medium"><Check className="w-4 h-4 text-primary-500" /> Custom Domain</li>
                                </ul>
                                <Button 
                                    variant={subscriptionPlan === 'Pro' ? 'secondary' : 'primary'}
                                    disabled={subscriptionPlan === 'Pro'}
                                    onClick={() => handlePlanClick('Pro')}
                                    className="w-full shadow-md shadow-primary-500/20"
                                >
                                    {subscriptionPlan === 'Pro' ? 'Current Plan' : 'Upgrade to Pro'}
                                </Button>
                            </div>

                            {/* Business Plan */}
                            <div className={`relative border-2 rounded-xl p-6 flex flex-col transition-colors ${subscriptionPlan === 'Business' ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10' : 'border-border dark:border-border-dark bg-surface dark:bg-surface-dark hover:border-primary-200'}`}>
                                <div className="mb-4">
                                    <h4 className="text-lg font-bold text-text-primary dark:text-text-primary-dark flex items-center gap-2">
                                        <Crown className="w-5 h-5 text-amber-500" /> Business
                                    </h4>
                                    <p className="text-3xl font-bold mt-2">$99<span className="text-sm font-medium text-text-tertiary">/mo</span></p>
                                </div>
                                <ul className="space-y-3 mb-8 flex-1">
                                    <li className="flex items-center gap-2 text-sm text-text-secondary"><Check className="w-4 h-4 text-green-500" /> Unlimited Team Members</li>
                                    <li className="flex items-center gap-2 text-sm text-text-secondary"><Check className="w-4 h-4 text-green-500" /> Priority Support</li>
                                    <li className="flex items-center gap-2 text-sm text-text-secondary"><Check className="w-4 h-4 text-green-500" /> API Access</li>
                                    <li className="flex items-center gap-2 text-sm text-text-secondary"><Check className="w-4 h-4 text-green-500" /> SSO & Audit Logs</li>
                                </ul>
                                <Button 
                                    variant={subscriptionPlan === 'Business' ? 'secondary' : 'primary'}
                                    disabled={subscriptionPlan === 'Business'}
                                    onClick={() => handlePlanClick('Business')}
                                    className="w-full"
                                >
                                    {subscriptionPlan === 'Business' ? 'Current Plan' : 'Contact Sales'}
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-border dark:border-border-dark"></div>

                    {/* Payment Integrations */}
                    <Card>
                        <h3 className="text-lg font-semibold text-text-primary dark:text-text-primary-dark mb-2">Payment Integrations</h3>
                        <p className="text-sm text-text-secondary mb-6">Connect payment providers to accept payments from your clients.</p>
                        
                        <div className={`border rounded-xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-all duration-500 ${stripeConnected ? 'border-green-200 bg-green-50/20 shadow-sm' : 'border-border dark:border-border-dark hover:shadow-sm'}`}>
                             <div className="flex items-center gap-4">
                                 <div className="w-14 h-14 bg-[#635BFF] rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-md">S</div>
                                 <div>
                                     <div className="flex items-center gap-2">
                                         <h4 className="text-lg font-bold text-text-primary dark:text-text-primary-dark">Stripe</h4>
                                         {stripeConnected && (
                                            <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                                                <Check className="w-3 h-3" /> Connected
                                            </span>
                                         )}
                                     </div>
                                     <p className="text-sm text-text-secondary mt-1">Accept credit cards, Apple Pay, and Google Pay securely.</p>
                                 </div>
                             </div>
                             
                             {stripeConnected ? (
                                 <div className="flex items-center gap-3">
                                     <Button variant="ghost" size="sm" icon={ExternalLink}>Dashboard</Button>
                                     <Button variant="secondary" size="sm">Settings</Button>
                                 </div>
                             ) : (
                                 <Button 
                                    onClick={handleConnectStripe} 
                                    disabled={isConnecting}
                                    className="bg-[#635BFF] hover:bg-[#544DC9] text-white border-transparent shadow-lg shadow-indigo-500/30"
                                    size="lg"
                                 >
                                    {isConnecting ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                            Connecting...
                                        </>
                                    ) : (
                                        <>
                                            Connect Stripe <Link2 className="w-5 h-5 ml-2" />
                                        </>
                                    )}
                                 </Button>
                             )}
                        </div>
                    </Card>
                 </div>
            )}
         </div>
         
         <PaymentModal 
            isOpen={isPaymentOpen}
            onClose={() => setIsPaymentOpen(false)}
            amount={pendingPlan ? getPrice(pendingPlan) : 0}
            description={`Nexus ${pendingPlan} Subscription`}
            onSuccess={handlePaymentSuccess}
         />
      </div>
    </div>
  );
};
