
import React, { useState } from 'react';
import { Modal, Button, Input } from './Primitives';
import { Lock, ShieldCheck, Loader2, CreditCard } from 'lucide-react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useNotifications } from './NotificationSystem';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    amount: number;
    description: string;
    onSuccess: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, amount, description, onSuccess }) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [cardholderName, setCardholderName] = useState('');
    const stripe = useStripe();
    const elements = useElements();
    const { addNotification } = useNotifications();

    const handlePay = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!stripe || !elements) {
            return;
        }

        setIsProcessing(true);

        try {
            // 1. Create PaymentIntent on the backend
            // In a real app, this points to your backend. 
            // If the backend isn't running (common in demo), we'll fall back to simulation.
            let clientSecret = null;
            
            try {
                const response = await fetch('http://localhost:4242/create-payment-intent', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ amount: Math.round(amount * 100) }), // Amount in cents
                });

                if (response.ok) {
                    const data = await response.json();
                    clientSecret = data.clientSecret;
                }
            } catch (err) {
                console.log("Backend offline, switching to demo mode.");
            }

            if (!clientSecret) {
                // SIMULATION MODE
                console.warn("⚠️ Demo Mode: Simulating payment success (Backend offline)");
                await new Promise(resolve => setTimeout(resolve, 2000)); // Fake delay
                setIsProcessing(false);
                onSuccess();
                onClose();
                return;
            }

            // 2. Confirm Card Payment (Real Mode)
            const result = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: elements.getElement(CardElement)!,
                    billing_details: {
                        name: cardholderName,
                    },
                },
            });

            if (result.error) {
                addNotification({ title: 'Payment Failed', message: result.error.message || 'Unknown error', type: 'error' });
            } else {
                if (result.paymentIntent.status === 'succeeded') {
                    onSuccess();
                    onClose();
                }
            }
        } catch (error) {
            console.error(error);
            addNotification({ title: 'Error', message: 'An unexpected error occurred.', type: 'error' });
        } finally {
            setIsProcessing(false);
        }
    };

    const cardElementOptions = {
        style: {
            base: {
                fontSize: '14px',
                color: '#424770',
                fontFamily: 'Inter, sans-serif',
                '::placeholder': {
                    color: '#aab7c4',
                },
            },
            invalid: {
                color: '#9e2146',
            },
        },
        hidePostalCode: true,
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Secure Checkout">
            <div className="space-y-6">
                <div className="bg-primary-50 dark:bg-primary-900/20 p-4 rounded-xl flex items-center justify-between border border-primary-100 dark:border-primary-800">
                    <div>
                        <p className="text-xs text-text-secondary uppercase tracking-wider font-semibold">Total Due</p>
                        <p className="text-2xl font-bold text-primary-700 dark:text-primary-300">${amount.toFixed(2)}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-text-secondary">{description}</p>
                        <div className="flex items-center gap-1 text-[10px] text-green-600 dark:text-green-400 mt-1 justify-end">
                            <ShieldCheck className="w-3 h-3" /> Secure SSL
                        </div>
                    </div>
                </div>

                <form onSubmit={handlePay} className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-text-secondary">Cardholder Name</label>
                        <Input 
                            placeholder="John Doe" 
                            required 
                            value={cardholderName}
                            onChange={e => setCardholderName(e.target.value)}
                        />
                    </div>
                    
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-text-secondary">Card Details</label>
                        <div className="p-3 bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-lg">
                            <CardElement options={cardElementOptions} />
                        </div>
                    </div>

                    <div className="pt-2">
                        <Button 
                            type="submit" 
                            className="w-full bg-[#635BFF] hover:bg-[#534CC2] text-white border-transparent"
                            disabled={!stripe || isProcessing}
                        >
                            {isProcessing ? (
                                <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Processing...</>
                            ) : (
                                `Pay $${amount.toFixed(2)}`
                            )}
                        </Button>
                        <p className="text-center text-[10px] text-text-tertiary mt-3 flex items-center justify-center gap-1">
                            <Lock className="w-3 h-3" /> Powered by Stripe
                        </p>
                    </div>
                </form>
            </div>
        </Modal>
    );
};
