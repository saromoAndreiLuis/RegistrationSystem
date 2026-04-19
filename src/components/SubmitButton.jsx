import React from 'react';
import { Loader2 } from 'lucide-react';

const SubmitButton = ({ 
  children, 
  isLoading, 
  onClick, 
  type = 'submit', 
  disabled = false,
  className = ''
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`
        relative w-full py-3.5 px-6 rounded-xl font-headline font-semibold text-white
        bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)]
        active:scale-[0.98] transition-all duration-200 ease-in-out
        disabled:opacity-70 disabled:cursor-not-allowed disabled:active:scale-100
        shadow-[0_4px_14px_0_rgba(67,142,130,0.39)] hover:shadow-[0_6px_20px_rgba(67,142,130,0.23)]
        overflow-hidden group
        ${className}
      `}
    >
      <div className="absolute inset-0 w-full h-full bg-white/20 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300 ease-out"></div>
      
      <div className="relative flex items-center justify-center gap-2">
        {isLoading ? (
          <>
            <Loader2 className="animate-spin" size={20} />
            <span>Processing...</span>
          </>
        ) : (
          children
        )}
      </div>
    </button>
  );
};

export default SubmitButton;
