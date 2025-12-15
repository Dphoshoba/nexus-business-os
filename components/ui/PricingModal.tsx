
import React, { useState } from 'react';
import { Check, Star, Zap, Crown, X } from 'lucide-react';
import { Modal, Button } from './Primitives';
import { useData } from '../../context/DataContext';
import { SubscriptionPlan } from '../../types';
import { PaymentModal } from './PaymentModal';
import { useNotifications } from './NotificationSystem';

interface PricingModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const PricingModal: React.FC<PricingModalProps> = ({ isOpen, onClose }) => {
    const { subscriptionPlan, setSubscriptionPlan } = useData();
    const { addNotification } = useNotifications();
    
    // Payment State
    const [pendingPlan, setPendingPlan] = useState<SubscriptionPlan | null>(null);
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);

    const handleUpgradeClick = (plan: SubscriptionPlan) => {
        if (plan === 'Starter') {
            // Downgrade immediately
            setSubscriptionPlan('Starter');
            onClose();
            addNotification({ title: 'Plan Updated', message: 'You have downgraded to Starter.', type: 'info' });
        } else {
            // Open Payment for Paid plans
            setPendingPlan(plan);
            setIsPaymentOpen(true);
        }
    };

    const handlePaymentSuccess = () => {
        if (pendingPlan) {
            setSubscriptionPlan(pendingPlan);
            addNotification({ title: 'Upgrade Successful', message: `Welcome to the ${pendingPlan} plan!`, type: 'success' });
            setPendingPlan(null);
            onClose();
        }
    };

    const getPrice = (plan: SubscriptionPlan) => {
        if (plan === 'Pro') return 29;
        if (plan === 'Business') return 99;
        return 0;
    };

    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose} title="Choose your plan">
                <div className="space-y-6">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold mb-2 text-text-primary dark:text-text-primary-dark">Unlock the full power of Nexus</h2>
                        <p className="text-text-secondary dark:text-text-secondary-dark">Scale your business with AI-driven insights and automation.</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Starter */}
                        <div className={`p-4 rounded-xl border-2 flex flex-col transition-all ${subscriptionPlan === 'Starter' ? 'border-primary-500 bg-primary-50/10 dark:bg-primary-900/10' : 'border-border dark:border-border-dark bg-surface dark:bg-surface-dark'}`}>
                            <div className="mb-4">
                                <h3 className="font-bold flex items-center gap-2 text-text-primary dark:text-text-primary-dark"><Zap className="w-4 h-4 text-text-tertiary" /> Starter</h3>
                                <div className="text-2xl font-bold mt-2 text-text-primary dark:text-text-primary-dark">$0<span className="text-sm font-normal text-text-secondary">/mo</span></div>
                            </div>
                            <ul className="text-sm space-y-2 mb-6 flex-1 text-text-secondary dark:text-text-secondary-dark">
                                <li className="flex gap-2 items-center"><Check className="w-4 h-4 text-green-500" /> Basic CRM</li>
                                <li className="flex gap-2 items-center"><Check className="w-4 h-4 text-green-500" /> 1 User</li>
                                <li className="flex gap-2 items-center"><Check className="w-4 h-4 text-green-500" /> 50 AI Credits</li>
                            </ul>
                            <Button 
                                variant={subscriptionPlan === 'Starter' ? 'secondary' : 'primary'} 
                                disabled={subscriptionPlan === 'Starter'}
                                onClick={() => handleUpgradeClick('Starter')}
                                className="w-full"
                            >
                                {subscriptionPlan === 'Starter' ? 'Current Plan' : 'Downgrade'}
                            </Button>
                        </div>

                        {/* Pro */}
                        <div className="p-4 rounded-xl border-2 border-primary-500 relative shadow-xl bg-surface dark:bg-surface-dark flex flex-col transform md:-translate-y-2 z-10">
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary-600 to-indigo-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-md">Most Popular</div>
                            <div className="mb-4 mt-2">
                                <h3 className="font-bold flex items-center gap-2 text-primary-600 dark:text-primary-400"><Star className="w-4 h-4 fill-current" /> Pro</h3>
                                <div className="text-2xl font-bold mt-2 text-text-primary dark:text-text-primary-dark">$29<span className="text-sm font-normal text-text-secondary">/mo</span></div>
                            </div>
                            <ul className="text-sm space-y-2 mb-6 flex-1 text-text-primary dark:text-text-primary-dark font-medium">
                                <li className="flex gap-2 items-center"><Check className="w-4 h-4 text-primary-500" /> AI Assistant (Unlimited)</li>
                                <li className="flex gap-2 items-center"><Check className="w-4 h-4 text-primary-500" /> Advanced Automations</li>
                                <li className="flex gap-2 items-center"><Check className="w-4 h-4 text-primary-500" /> Up to 5 Users</li>
                                <li className="flex gap-2 items-center"><Check className="w-4 h-4 text-primary-500" /> Remove Nexus Branding</li>
                            </ul>
                            <Button 
                                variant="primary" 
                                disabled={subscriptionPlan === 'Pro'}
                                onClick={() => handleUpgradeClick('Pro')}
                                className="shadow-lg shadow-primary-500/20 w-full"
                            >
                                {subscriptionPlan === 'Pro' ? 'Current Plan' : 'Upgrade to Pro'}
                            </Button>
                        </div>

                        {/* Business */}
                        <div className={`p-4 rounded-xl border-2 flex flex-col transition-all ${subscriptionPlan === 'Business' ? 'border-primary-500 bg-primary-50/10 dark:bg-primary-900/10' : 'border-border dark:border-border-dark bg-surface dark:bg-surface-dark'}`}>
                            <div className="mb-4">
                                <h3 className="font-bold flex items-center gap-2 text-text-primary dark:text-text-primary-dark"><Crown className="w-4 h-4 text-amber-500" /> Business</h3>
                                <div className="text-2xl font-bold mt-2 text-text-primary dark:text-text-primary-dark">$99<span className="text-sm font-normal text-text-secondary">/mo</span></div>
                            </div>
                            <ul className="text-sm space-y-2 mb-6 flex-1 text-text-secondary dark:text-text-secondary-dark">
                                <li className="flex gap-2 items-center"><Check className="w-4 h-4 text-green-500" /> Unlimited Users</li>
                                <li className="flex gap-2 items-center"><Check className="w-4 h-4 text-green-500" /> Custom Analytics</li>
                                <li className="flex gap-2 items-center"><Check className="w-4 h-4 text-green-500" /> Priority Support</li>
                                <li className="flex gap-2 items-center"><Check className="w-4 h-4 text-green-500" /> API Access</li>
                            </ul>
                            <Button 
                                variant={subscriptionPlan === 'Business' ? 'secondary' : 'primary'}
                                disabled={subscriptionPlan === 'Business'}
                                onClick={() => handleUpgradeClick('Business')}
                                className="w-full"
                            >
                                {subscriptionPlan === 'Business' ? 'Current Plan' : 'Upgrade to Business'}
                            </Button>
                        </div>
                    </div>
                </div>
            </Modal>

            {/* Payment Modal */}
            <PaymentModal 
                isOpen={isPaymentOpen}
                onClose={() => setIsPaymentOpen(false)}
                amount={pendingPlan ? getPrice(pendingPlan) : 0}
                description={`Nexus ${pendingPlan} Subscription (Monthly)`}
                onSuccess={handlePaymentSuccess}
            />
        </>
    );
};
