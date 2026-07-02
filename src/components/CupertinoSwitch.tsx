import React from 'react';
import { motion } from 'motion/react';

interface CupertinoSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
  id?: string;
}

export const CupertinoSwitch: React.FC<CupertinoSwitchProps> = ({
  checked,
  onChange,
  label,
  description,
  id
}) => {
  return (
    <div 
      className="flex items-start justify-between p-3 bg-white rounded-2xl border border-[#E5E5EA] shadow-sm active:bg-[#F2F2F7] transition-colors cursor-pointer"
      onClick={() => onChange(!checked)}
      id={id}
    >
      <div className="flex flex-col space-y-0.5 pr-4 select-none">
        <span className="text-sm font-bold text-black">{label}</span>
        {description && <span className="text-xs text-[#8E8E93] font-semibold leading-relaxed">{description}</span>}
      </div>
      <div 
        className={`
          relative w-14 h-8 flex items-center rounded-full p-0.5 cursor-pointer transition-colors duration-300
          ${checked ? 'bg-[#007AFF]' : 'bg-[#E5E5EA]'}
        `}
      >
        <motion.div
          className="bg-white w-7 h-7 rounded-full shadow-md"
          animate={{ x: checked ? '24px' : '0px' }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </div>
    </div>
  );
};
