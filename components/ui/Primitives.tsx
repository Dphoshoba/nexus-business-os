import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

// --- Card ---
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  className?: string;
  padding?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '', padding = 'p-6', ...props }) => (
  <div className={`bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-xl shadow-card hover:shadow-soft transition-shadow duration-200 ${padding} ${className}`} {...props}>
    {children}
  </div>
);

// --- Button ---
export interface ButtonProps extends React.ComponentProps<'button'> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ElementType;
}

export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', size = 'md', icon: Icon, className = '', ...props }) => {
  const baseStyles = "inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-primary-600 text-white hover:bg-primary-700 shadow-sm hover:shadow focus:ring-primary-500",
    secondary: "bg-white dark:bg-surface-dark text-text-primary dark:text-text-primary-dark border border-border dark:border-border-dark hover:bg-surface-muted dark:hover:bg-surface-muted-dark shadow-sm focus:ring-gray-200",
    ghost: "text-text-secondary dark:text-text-secondary-dark hover:text-text-primary dark:hover:text-text-primary-dark hover:bg-surface-muted dark:hover:bg-surface-muted-dark focus:ring-gray-200",
    danger: "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 focus:ring-red-200",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-5 py-2.5 text-base",
  };

  return (
    <button className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
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
    neutral: "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300",
    success: "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-100 dark:border-green-900/30",
    warning: "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30",
    danger: "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-900/30",
    brand: "bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 border border-primary-100 dark:border-primary-900/30",
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

// --- Input ---
export interface InputProps extends React.ComponentProps<'input'> {
    icon?: React.ElementType;
}

export const Input: React.FC<InputProps> = ({ icon: Icon, className = '', ...props }) => (
  <div className="relative">
    {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />}
    <input 
      className={`w-full ${Icon ? 'pl-9' : 'pl-3'} pr-4 py-2 bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-lg text-sm text-text-primary dark:text-text-primary-dark placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-900 focus:border-primary-500 transition-all ${className}`}
      {...props}
    />
  </div>
);

// --- Typography ---
export const SectionHeader = ({ title, subtitle, action }: { title: string, subtitle?: string, action?: React.ReactNode }) => (
  <div className="flex items-center justify-between mb-6">
    <div>
      <h2 className="text-xl font-bold text-text-primary dark:text-text-primary-dark tracking-tight">{title}</h2>
      {subtitle && <p className="text-sm text-text-secondary dark:text-text-secondary-dark mt-1">{subtitle}</p>}
    </div>
    {action && <div>{action}</div>}
  </div>
);

// --- Tabs ---
export const Tabs = ({ tabs, activeTab, onTabChange }: { tabs: string[], activeTab: string, onTabChange: (tab: string) => void }) => (
  <div className="flex border-b border-border dark:border-border-dark mb-6">
    {tabs.map(tab => (
      <button
        key={tab}
        onClick={() => onTabChange(tab)}
        className={`px-4 py-2 text-sm font-medium border-b-2 transition-all relative top-[1px] ${
          activeTab === tab 
            ? 'border-primary-500 text-primary-600 dark:text-primary-400' 
            : 'border-transparent text-text-secondary dark:text-text-secondary-dark hover:text-text-primary dark:hover:text-text-primary-dark hover:border-border'
        }`}
      >
        {tab}
      </button>
    ))}
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
    const overlayRef = useRef<HTMLDivElement>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden'; 
        }
        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen || !mounted) return null;

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div 
                ref={overlayRef}
                className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity animate-in fade-in duration-200" 
                onClick={onClose}
            />
            <div className="relative bg-surface dark:bg-surface-dark rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-border dark:border-border-dark animate-in fade-in zoom-in-95 duration-200 scale-100">
                <div className="flex items-center justify-between px-6 py-4 border-b border-border dark:border-border-dark bg-surface-subtle/50 dark:bg-surface-subtle-dark/50">
                    <h3 className="text-lg font-semibold text-text-primary dark:text-text-primary-dark">{title}</h3>
                    <button onClick={onClose} className="text-text-tertiary hover:text-text-primary dark:hover:text-text-primary-dark transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-6 text-text-primary dark:text-text-primary-dark">
                    {children}
                </div>
            </div>
        </div>,
        document.body
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

  useEffect(() => {
      setMounted(true);
      return () => setMounted(false);
  }, []);

  useEffect(() => {
      const handleEscape = (e: KeyboardEvent) => {
          if (e.key === 'Escape') onClose();
      };
      if (isOpen) {
          document.addEventListener('keydown', handleEscape);
          document.body.style.overflow = 'hidden';
      }
      return () => {
          document.removeEventListener('keydown', handleEscape);
          document.body.style.overflow = 'unset';
      };
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  return createPortal(
      <div className="fixed inset-0 z-[100] flex justify-end">
          <div 
              className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity animate-in fade-in duration-300" 
              onClick={onClose}
          />
          <div className="relative w-full max-w-xl h-full bg-surface dark:bg-surface-dark shadow-2xl border-l border-border dark:border-border-dark animate-in slide-in-from-right duration-300 flex flex-col">
              <div className="flex items-center justify-between px-6 py-4 border-b border-border dark:border-border-dark bg-surface-subtle/50 dark:bg-surface-subtle-dark/50 shrink-0">
                  <h3 className="text-lg font-semibold text-text-primary dark:text-text-primary-dark">{title || 'Details'}</h3>
                  <button onClick={onClose} className="p-1 rounded-md hover:bg-surface-muted dark:hover:bg-surface-muted-dark text-text-tertiary hover:text-text-primary dark:hover:text-text-primary-dark transition-colors">
                      <X className="w-5 h-5" />
                  </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                  {children}
              </div>
          </div>
      </div>,
      document.body
  );
};