
import React, { useState, useRef } from 'react';
import { SectionHeader, Card, Button, Input, Badge } from '../components/ui/Primitives';
import { Upload, Camera, ScanLine, Loader2, FileText, User, Receipt, X, Check, CheckCircle2, ArrowRight } from 'lucide-react';
import { useNotifications } from '../components/ui/NotificationSystem';
import { GoogleGenAI } from "@google/genai";
import { useData } from '../context/DataContext';
import { Contact, Invoice } from '../types';

export const SmartScan: React.FC = () => {
    const { addContact, addInvoice, invoices } = useData();
    const { addNotification } = useNotifications();
    
    // UI State
    const [isScanning, setIsScanning] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [scanResult, setScanResult] = useState<any | null>(null);
    const [scanType, setScanType] = useState<'receipt' | 'business_card' | 'document' | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                setSelectedImage(ev.target?.result as string);
                setScanResult(null);
                setScanType(null);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleScan = async () => {
        if (!selectedImage) return;
        setIsScanning(true);

        try {
            // Fix: Obtain apiKey correctly from process.env.API_KEY
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const base64Data = selectedImage.split(',')[1];
            
            const prompt = `Analyze this image. Identify if it is a "Receipt", "Business Card", or "General Document". 
            
            If it is a RECEIPT, extract: { "type": "receipt", "vendor": "string", "date": "string", "amount": number, "currency": "string" }.
            If it is a BUSINESS CARD, extract: { "type": "business_card", "name": "string", "email": "string", "company": "string", "role": "string" }.
            Otherwise: { "type": "document", "summary": "string" }.
            
            Return strictly valid JSON.`;

            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: {
                    parts: [
                        { inlineData: { mimeType: 'image/jpeg', data: base64Data } },
                        { text: prompt }
                    ]
                }
            });

            const text = response.text || "{}";
            // Clean JSON markdown if present
            const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
            const result = JSON.parse(cleanJson);
            
            setScanResult(result);
            setScanType(result.type);
            
        } catch (e) {
            console.error(e);
            addNotification({ title: 'Scan Failed', message: 'Could not analyze image. Try again.', type: 'error' });
        } finally {
            setIsScanning(false);
        }
    };

    const handleSave = () => {
        if (!scanResult) return;

        if (scanResult.type === 'receipt') {
            const invoice: Invoice = {
                id: `EXP-${Date.now().toString().substr(-6)}`,
                client: scanResult.vendor || 'Unknown Vendor',
                amount: scanResult.amount || 0,
                status: 'Paid', // Assuming receipt implies paid
                date: scanResult.date || new Date().toLocaleDateString()
            };
            addInvoice(invoice);
            addNotification({ title: 'Expense Saved', message: `Receipt from ${invoice.client} saved to finance.`, type: 'success' });
        } else if (scanResult.type === 'business_card') {
            const contact: Contact = {
                id: Date.now().toString(),
                name: scanResult.name || 'Unknown',
                email: scanResult.email || '',
                role: scanResult.role || 'Unknown',
                company: scanResult.company || '',
                lastContacted: 'Just now',
                status: 'Active'
            };
            addContact(contact);
            addNotification({ title: 'Contact Created', message: `${contact.name} added to CRM.`, type: 'success' });
        } else {
            addNotification({ title: 'Document Processed', message: 'Summary saved to notes.', type: 'info' });
        }
        
        // Reset
        setSelectedImage(null);
        setScanResult(null);
        setScanType(null);
    };

    return (
        <div className="h-full flex flex-col">
            <SectionHeader
                title="Echoes Lens"
                subtitle="Multimodal scanner for receipts, cards, and docs."
            />

            <div className="flex-1 flex flex-col lg:flex-row gap-8 min-h-0">
                {/* Left: Uploader / Camera */}
                <div className="flex-1 flex flex-col">
                    {!selectedImage ? (
                        <Card className="flex-1 border-2 border-dashed border-border dark:border-border-dark flex flex-col items-center justify-center bg-surface-subtle/30 cursor-pointer hover:bg-surface-subtle transition-colors group" onClick={() => fileInputRef.current?.click()}>
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                className="hidden" 
                                accept="image/*" 
                                onChange={handleFileSelect} 
                            />
                            <div className="w-20 h-20 rounded-full bg-surface-muted dark:bg-surface-muted-dark flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-sm">
                                <ScanLine className="w-10 h-10 text-primary-500" />
                            </div>
                            <h3 className="text-xl font-bold text-text-primary dark:text-text-primary-dark">Tap to Scan</h3>
                            <p className="text-text-secondary mt-2 mb-8">Receipts, Business Cards, Contracts</p>
                            <div className="flex gap-4">
                                <Button variant="secondary" icon={Upload} onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>Upload File</Button>
                                <Button variant="secondary" icon={Camera}>Open Camera</Button>
                            </div>
                        </Card>
                    ) : (
                        <div className="flex-1 relative rounded-xl overflow-hidden bg-black flex items-center justify-center group border border-border dark:border-border-dark shadow-2xl">
                            <img src={selectedImage} alt="Scan Target" className="max-w-full max-h-full object-contain opacity-80" />
                            
                            {/* Scanning Animation Overlay */}
                            {isScanning && (
                                <div className="absolute inset-0 z-20">
                                    <div className="w-full h-1 bg-primary-500 shadow-[0_0_15px_rgba(99,102,241,0.8)] animate-[scan_2s_ease-in-out_infinite]"></div>
                                    <div className="absolute inset-0 bg-primary-500/10 animate-pulse"></div>
                                </div>
                            )}

                            {!isScanning && !scanResult && (
                                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30">
                                    <Button size="lg" onClick={handleScan} className="shadow-xl px-8" icon={ScanLine}>
                                        Process Image
                                    </Button>
                                </div>
                            )}

                            <button 
                                onClick={() => setSelectedImage(null)} 
                                className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors z-30"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    )}
                </div>

                {/* Right: Results Panel */}
                <div className="w-full lg:w-96 flex flex-col gap-6">
                    <Card className={`flex-1 flex flex-col transition-opacity duration-300 ${scanResult ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                        <div className="border-b border-border dark:border-border-dark pb-4 mb-4">
                            <h3 className="font-bold text-lg text-text-primary dark:text-text-primary-dark flex items-center gap-2">
                                {scanType === 'receipt' && <Receipt className="w-5 h-5 text-green-500" />}
                                {scanType === 'business_card' && <User className="w-5 h-5 text-blue-500" />}
                                {scanType === 'document' && <FileText className="w-5 h-5 text-orange-500" />}
                                {scanType ? scanType.replace('_', ' ').toUpperCase() : 'Waiting for scan...'}
                            </h3>
                        </div>

                        <div className="flex-1 space-y-4">
                            {isScanning ? (
                                <div className="flex flex-col items-center justify-center h-full text-text-secondary">
                                    <Loader2 className="w-8 h-8 animate-spin mb-2 text-primary-500" />
                                    <p>Analyzing pixels...</p>
                                </div>
                            ) : scanResult ? (
                                <>
                                    {scanResult.type === 'receipt' && (
                                        <div className="space-y-4">
                                            <div>
                                                <label className="text-xs text-text-tertiary uppercase font-semibold">Vendor</label>
                                                <p className="text-lg font-medium text-text-primary dark:text-text-primary-dark">{scanResult.vendor}</p>
                                            </div>
                                            <div>
                                                <label className="text-xs text-text-tertiary uppercase font-semibold">Total Amount</label>
                                                <p className="text-2xl font-bold text-text-primary dark:text-text-primary-dark">${scanResult.amount}</p>
                                            </div>
                                            <div>
                                                <label className="text-xs text-text-tertiary uppercase font-semibold">Date</label>
                                                <p className="text-sm text-text-secondary">{scanResult.date}</p>
                                            </div>
                                            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg flex items-start gap-3 mt-4">
                                                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                                                <p className="text-xs text-green-800 dark:text-green-300">
                                                    Ready to be saved as an <strong>Expense</strong> in Payments.
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {scanResult.type === 'business_card' && (
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-xl">
                                                    {scanResult.name?.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-lg font-bold text-text-primary dark:text-text-primary-dark">{scanResult.name}</p>
                                                    <p className="text-sm text-text-secondary">{scanResult.role}</p>
                                                </div>
                                            </div>
                                            <div className="border-t border-border dark:border-border-dark my-2"></div>
                                            <div>
                                                <label className="text-xs text-text-tertiary uppercase font-semibold">Company</label>
                                                <p className="text-sm font-medium">{scanResult.company}</p>
                                            </div>
                                            <div>
                                                <label className="text-xs text-text-tertiary uppercase font-semibold">Email</label>
                                                <p className="text-sm font-medium">{scanResult.email}</p>
                                            </div>
                                            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-start gap-3 mt-4">
                                                <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                                                <p className="text-xs text-blue-800 dark:text-blue-300">
                                                    Ready to be saved as a <strong>Contact</strong> in CRM.
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="text-center text-text-tertiary pt-10">
                                    <p>Select an image and tap Process to see intelligent insights here.</p>
                                </div>
                            )}
                        </div>

                        {scanResult && (
                            <div className="pt-6 mt-4 border-t border-border dark:border-border-dark">
                                <Button className="w-full" onClick={handleSave} icon={Check}>
                                    Confirm & Save
                                </Button>
                            </div>
                        )}
                    </Card>
                </div>
            </div>
            
            <style>{`
                @keyframes scan {
                    0% { top: 0%; }
                    50% { top: 100%; }
                    100% { top: 0%; }
                }
            `}</style>
        </div>
    );
};
