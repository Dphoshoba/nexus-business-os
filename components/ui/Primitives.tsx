
import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

// --- Card ---
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  className?: string;
  padding?: string;
  glass?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className = '', padding = 'p-6', glass = false, ...props }) => (
  <div 
    className={`
      bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-2xl shadow-card hover:shadow-soft transition-all duration-300
      ${glass ? 'backdrop-blur-xl bg-surface/80 dark:bg-surface-dark/80 border-white/10 shadow-2xl' : ''}
      ${padding} ${className}
    `} 
    {...props}
  >
    {children}
  </div>
);

// --- Button ---
export interface ButtonProps extends React.ComponentProps<'button'> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'brand';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ElementType;
}

export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', size = 'md', icon: Icon, className = '', ...props }) => {
  const baseStyles = "inline-flex items-center justify-center gap-2.5 font-bold rounded-xl transition-all duration-300 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer select-none active:scale-[0.96] tracking-tight";
  
  const variants = {
    primary: "bg-primary-600 text-white hover:bg-primary-700 shadow-[0_4px_14px_rgba(139,92,246,0.39)] hover:shadow-[0_6px_20px_rgba(139,92,246,0.23)]",
    brand: "bg-gradient-to-r from-primary-600 to-indigo-600 text-white hover:opacity-90 shadow-lg shadow-primary-500/20 border-transparent",
    secondary: "bg-white dark:bg-white/5 text-text-primary dark:text-white border border-border dark:border-white/10 hover:bg-surface-muted dark:hover:bg-white/10 shadow-sm",
    ghost: "text-text-secondary dark:text-text-tertiary hover:text-text-primary dark:hover:text-white hover:bg-surface-muted dark:hover:bg-white/5",
    danger: "bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 border border-red-100 dark:border-red-900/30",
  };

  const sizes = {
    sm: "px-4 py-2 text-xs",
    md: "px-5 py-2.5 text-sm",
    lg: "px-7 py-3.5 text-base",
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (props.onClick) {
      props.onClick(e);
    }
  };

  return (
    <button 
        type={props.type || "button"}
        className={`${baseStyles} ${variants[variant as keyof typeof variants] || variants.primary} ${sizes[size]} ${className}`} 
        {...props}
        onClick={handleClick}
    >
      {Icon && <Icon className={size === 'sm' ? "w-3.5 h-3.5" : "w-4 h-4"} />}
      {children}
    </button>
  );
};

// --- Badge ---
export interface BadgeProps {
    children?: React.ReactNode;
    variant?: 'neutral' | 'success' | 'warning' | 'danger' | 'brand';
    className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'neutral', className = '' }) => {
  const variants = {
    neutral: "bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300",
    success: "bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/30",
    warning: "bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-500/30",
    danger: "bg-red-50 dark:bg-red-500/20 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-500/30",
    brand: "bg-primary-50 dark:bg-primary-500/20 text-primary-700 dark:text-primary-400 border border-primary-100 dark:border-primary-500/30",
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

// --- Input ---
export interface InputProps extends React.ComponentProps<'input'> {
    icon?: React.ElementType;
}

export const Input: React.FC<InputProps> = ({ icon: Icon, className = '', ...props }) => (
  <div className="relative group w-full">
    {Icon && <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary group-focus-within:text-primary-500 transition-colors" />}
    <input 
      className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-2.5 bg-surface dark:bg-surface-dark border border-border dark:border-white/10 rounded-xl text-sm text-text-primary dark:text-white placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all ${className}`}
      {...props}
    />
  </div>
);

// --- Typography ---
export const SectionHeader = ({ title, subtitle, action }: { title: string, subtitle?: string, action?: React.ReactNode }) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
    <div>
      <h2 className="text-2xl font-serif font-bold text-text-primary dark:text-white tracking-tight">{title}</h2>
      {subtitle && <p className="text-sm text-text-secondary dark:text-text-tertiary mt-1 font-medium">{subtitle}</p>}
    </div>
    {action && <div className="flex items-center gap-3">{action}</div>}
  </div>
);

// --- Tabs ---
export const Tabs = ({ tabs, activeTab, onTabChange }: { tabs: string[], activeTab: string, onTabChange: (tab: string) => void }) => (
  <div className="flex border-b border-border dark:border-white/5 mb-8">
    {tabs.map(tab => (
      <button
        key={tab}
        type="button"
        onClick={() => onTabChange(tab)}
        className={`px-5 py-3 text-xs font-bold uppercase tracking-widest transition-all relative top-[1px] cursor-pointer ${
          activeTab === tab 
            ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400' 
            : 'text-text-tertiary hover:text-text-primary dark:hover:text-white'
        }`}
      >
        {tab}
      </button>
    ))}
  </div>
);

// --- ProgressBar ---
export const ProgressBar = ({ progress, color = 'bg-primary-500' }: { progress: number, color?: string }) => (
    <div className="w-full h-2 bg-surface-muted dark:bg-white/5 rounded-full overflow-hidden">
        <div 
            className={`h-full ${color} transition-all duration-700 ease-out shadow-[0_0_8px_rgba(var(--primary-500),0.5)]`} 
            style={{ width: `${progress}%` }}
        />
    </div>
);

// --- Modal ---
interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
    const [mounted, setMounted] = useState(false);
    useEffect(() => { setMounted(true); return () => setMounted(false); }, []);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        if (isOpen) { document.addEventListener('keydown', handleEscape); document.body.style.overflow = 'hidden'; }
        return () => { document.removeEventListener('keydown', handleEscape); document.body.style.overflow = 'unset'; };
    }, [isOpen, onClose]);

    if (!isOpen || !mounted) return null;

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity animate-in fade-in duration-300" onClick={onClose} />
            <div className="relative bg-surface dark:bg-surface-dark rounded-[2rem] shadow-2xl w-full max-w-xl overflow-hidden border border-border dark:border-white/10 animate-in fade-in zoom-in-95 duration-300">
                <div className="flex items-center justify-between px-8 py-5 border-b border-border dark:border-white/5 bg-surface-subtle/50 dark:bg-white/5">
                    <h3 className="text-lg font-serif font-bold text-text-primary dark:text-white">{title}</h3>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-surface-muted dark:hover:bg-white/10 text-text-tertiary hover:text-text-primary dark:hover:text-white transition-all cursor-pointer"><X className="w-5 h-5" /></button>
                </div>
                <div className="p-8 text-text-primary dark:text-gray-200">{children}</div>
            </div>
        </div>, document.body
    );
};

// --- Drawer ---
interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export const Drawer: React.FC<DrawerProps> = ({ isOpen, onClose, title, children }) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); return () => setMounted(false); }, []);

  useEffect(() => {
      const handleEscape = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
      if (isOpen) { document.addEventListener('keydown', handleEscape); document.body.style.overflow = 'hidden'; }
      return () => { document.removeEventListener('keydown', handleEscape); document.body.style.overflow = 'unset'; };
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  return createPortal(
      <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity animate-in fade-in duration-500" onClick={onClose} />
          <div className="relative w-full max-w-xl h-full bg-surface dark:bg-surface-dark shadow-2xl border-l border-border dark:border-white/10 animate-in slide-in-from-right duration-500 flex flex-col">
              <div className="flex items-center justify-between px-8 py-5 border-b border-border dark:border-white/5 bg-surface-subtle/50 dark:bg-white/5 shrink-0">
                  <h3 className="text-lg font-serif font-bold text-text-primary dark:text-white">{title || 'Focus View'}</h3>
                  <button onClick={onClose} className="p-2 rounded-full hover:bg-surface-muted dark:hover:bg-white/10 text-text-tertiary hover:text-text-primary dark:hover:text-white transition-all cursor-pointer"><X className="w-5 h-5" /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-8">{children}</div>
          </div>
      </div>, document.body
  );
};
