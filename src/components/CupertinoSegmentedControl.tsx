import React from 'react';
import { motion } from 'motion/react';

interface SegmentOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface CupertinoSegmentedControlProps {
  label: string;
  options: SegmentOption[];
  selectedValue: string;
  onChange: (value: string) => void;
  id?: string;
}

export const CupertinoSegmentedControl: React.FC<CupertinoSegmentedControlProps> = ({
  label,
  options,
  selectedValue,
  onChange,
  id
}) => {
  return (
    <div className="flex flex-col space-y-1.5 w-full">
      <span className="text-[13px] font-bold text-[#3A3A3C] tracking-wide ml-1">
        {label}
      </span>
      <div 
        id={id}
        className="relative flex bg-[#F2F2F7] border border-[#E5E5EA] p-1 rounded-xl h-14 items-center overflow-hidden"
      >
        {options.map((option) => {
          const isSelected = selectedValue === option.value;
          return (
            <button
              key={option.value}
              type="button"
              id={`${id}-opt-${option.value}`}
              onClick={() => onChange(option.value)}
              className="relative flex-1 flex items-center justify-center h-full text-base font-bold z-10 focus:outline-none transition-colors duration-200"
              style={{ color: isSelected ? '#000000' : '#8E8E93' }}
            >
              {isSelected && (
                <motion.div
                  layoutId={`${id}-active-bg`}
                  className="absolute inset-0 bg-white rounded-lg shadow-sm z-[-1]"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <div className="flex items-center space-x-2">
                {option.icon}
                <span>{option.label}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
