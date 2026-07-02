import React from 'react';

interface CupertinoInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ReactNode;
  error?: string;
  helpText?: string;
}

export const CupertinoInput: React.FC<CupertinoInputProps> = ({
  label,
  icon,
  error,
  helpText,
  className = '',
  id,
  ...props
}) => {
  return (
    <div className={`flex flex-col space-y-1.5 w-full ${className}`}>
      {label && (
        <label 
          htmlFor={id} 
          className="text-[13px] font-bold text-[#3A3A3C] tracking-wide ml-1"
        >
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {icon && (
          <div className="absolute left-4 text-slate-400 pointer-events-none">
            {icon}
          </div>
        )}
        <input
          id={id}
          className={`
            w-full h-14 bg-[#F2F2F7] border border-[#E5E5EA] rounded-xl px-4 text-base font-semibold text-black
            placeholder:text-[#8E8E93] focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:bg-white
            transition-all duration-200
            ${icon ? 'pl-11' : 'pl-4'}
            ${error ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' : ''}
          `}
          {...props}
        />
      </div>
      {error && (
        <span className="text-xs font-medium text-red-500 px-1 animate-fade-in">
          {error}
        </span>
      )}
      {!error && helpText && (
        <span className="text-xs text-slate-400 px-1">
          {helpText}
        </span>
      )}
    </div>
  );
};
