import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, Check, Edit2, RotateCcw, AlertCircle } from 'lucide-react';

interface RegulationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAgree: (signatureBase64: string) => void;
  savedSignature: string | null;
}

export const RegulationsModal: React.FC<RegulationsModalProps> = ({
  isOpen,
  onClose,
  onAgree,
  savedSignature
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [isCanvasBlank, setIsCanvasBlank] = useState(true);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [showScrollWarning, setShowScrollWarning] = useState(false);

  // When modal is opened, reset scroll states unless already agreed
  useEffect(() => {
    if (isOpen) {
      setHasScrolledToBottom(!!savedSignature);
      setIsCanvasBlank(!savedSignature);
      setShowScrollWarning(false);
      
      // Delay canvas setup to ensure canvas is rendered
      setTimeout(() => {
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // If there's a saved signature, draw it
            if (savedSignature) {
              const img = new Image();
              img.onload = () => {
                ctx.drawImage(img, 0, 0);
              };
              img.src = savedSignature;
            } else {
              // Draw subtle dotted guidelines on canvas
              ctx.strokeStyle = '#E5E5EA';
              ctx.lineWidth = 1;
              ctx.setLineDash([4, 4]);
              ctx.beginPath();
              ctx.moveTo(10, canvas.height / 2 + 20);
              ctx.lineTo(canvas.width - 10, canvas.height / 2 + 20);
              ctx.stroke();
              ctx.setLineDash([]); // Reset line dash
            }
          }
        }
      }, 300);
    }
  }, [isOpen, savedSignature]);

  if (!isOpen) return null;

  // Handle checking if scrolled to bottom
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const threshold = 25; // pixels from the bottom
    const isAtBottom = target.scrollHeight - target.scrollTop <= target.clientHeight + threshold;
    if (isAtBottom && !hasScrolledToBottom) {
      setHasScrolledToBottom(true);
      setShowScrollWarning(false);
    }
  };

  const getCoordinates = (e: any) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    
    // Scale coordinates to handle responsive canvas client sizing vs coordinate width/height
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if (e.touches && e.touches[0]) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY
      };
    }
    
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!hasScrolledToBottom) {
      setShowScrollWarning(true);
      // Scroll to show warning/scroll area
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTo({
          top: scrollContainerRef.current.scrollHeight,
          behavior: 'smooth'
        });
      }
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const coords = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#000000'; // Pure black for official signature
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const coords = getCoordinates(e);
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
    setIsCanvasBlank(false);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Redraw subtle guideline
    ctx.strokeStyle = '#E5E5EA';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(10, canvas.height / 2 + 20);
    ctx.lineTo(canvas.width - 10, canvas.height / 2 + 20);
    ctx.stroke();
    ctx.setLineDash([]); // Reset line dash

    setIsCanvasBlank(true);
  };

  const handleSaveAndAgree = () => {
    if (!hasScrolledToBottom) {
      setShowScrollWarning(true);
      return;
    }

    if (isCanvasBlank) {
      alert('Electronic signature is required!');
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL();
    onAgree(dataUrl);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 md:p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-[24px] border border-[#E5E5EA] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* HEADER */}
        <div className="bg-[#F2F2F7] px-5 py-4 border-b border-[#E5E5EA] flex justify-between items-center">
          <div className="text-left">
            <span className="text-[10px] font-extrabold text-[#007AFF] uppercase tracking-wider">PULSE POWERHUB REGULATION</span>
            <h3 className="text-base font-extrabold text-black tracking-tight mt-0.5">Gym Regulations & Waiver</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[#8E8E93] hover:text-black rounded-full hover:bg-slate-200 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SCROLLABLE TERMS CONTAINER */}
        <div 
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="p-5 overflow-y-auto space-y-4 text-xs text-slate-700 leading-relaxed max-h-[300px] border-b border-[#E5E5EA]"
        >
          <div className="space-y-3 pr-1 text-left" id="waiver-content">
            <p className="font-extrabold text-slate-950 text-sm">PT PULSE POWERHUB INDONESIA - LIABILITY WAIVER</p>
            <p className="text-[#8E8E93] font-medium">Please review the following legal waiver of liability and click-wrap terms carefully before signing.</p>
            
            <div className="border-l-2 border-[#007AFF] pl-2.5 my-2.5" id="waiver-section-2">
              <span className="font-extrabold text-black block">2. ACKNOWLEDGMENT OF RISK</span>
              <span>I hereby acknowledge and fully understand that the use of gym facilities, fitness equipment, participation in sports classes, personal training, and any activities organized by or located within the premises of PT Pulse PowerHub Indonesia involves inherent risks. These risks include, but are not limited to: muscle strains, sprains, fractures, heart attacks, strokes, concussions, accidents arising from equipment use, transmission of illnesses, or even death.</span>
            </div>

            <div className="border-l-2 border-[#007AFF] pl-2.5 my-2.5" id="waiver-section-3">
              <span className="font-extrabold text-black block">3. PHYSICAL & MENTAL READINESS</span>
              <span>I declare that I am in good physical and mental health and am fully capable of participating in fitness activities at Pulse PowerHub. I confirm that I have no undisclosed medical conditions or pre-existing health issues for which a doctor has advised against strenuous exercise. I assume full responsibility for consulting my personal physician before commencing any exercise program. Should there be any changes to my health condition in the future, I am obligated to inform the staff or personal trainers of Pulse PowerHub before starting my workout.</span>
            </div>

            <div className="border-l-2 border-[#007AFF] pl-2.5 my-2.5" id="waiver-section-4">
              <span className="font-extrabold text-black block">4. ASSUMPTION OF RISK & PERSONAL RESPONSIBILITY</span>
              <span>By signing this document, I voluntarily choose to participate and accept all risks of injury or loss that may arise from my activities within the gym premises. I am fully responsible for my own safety, including exercising due care and caution when using any fitness equipment in accordance with the safety guidelines provided by Pulse PowerHub.</span>
            </div>

            <div className="border-l-2 border-[#007AFF] pl-2.5 my-2.5" id="waiver-section-5">
              <span className="font-extrabold text-black block">5. RELEASE OF LIABILITY & HOLD HARMLESS</span>
              <span>I agree to waive, release from all legal liability, hold harmless, and covenant not to sue PT Pulse PowerHub Indonesia, including its directors, commissioners, employees, instructors, partners, agents, or any third parties providing services under the name of Pulse PowerHub, from any and all claims, lawsuits, legal demands, or damages (including attorneys' fees) arising out of:</span>
              <ul className="list-disc pl-4 mt-1.5 space-y-1">
                <li>Physical injury, health complications, or death sustained by me within the facilities or during participation in any Pulse PowerHub activities.</li>
                <li>Loss, damage, or theft of my personal belongings inside the gym area, lockers, or Pulse PowerHub parking areas.</li>
              </ul>
              <span className="block mt-1.5">This release of liability applies absolutely to the fullest extent permitted by the laws of the Republic of Indonesia, except in cases where the loss or injury is legally proven to be caused by gross negligence or intentional misconduct directly committed by the management of Pulse PowerHub.</span>
            </div>

            <div className="border-l-2 border-[#007AFF] pl-2.5 my-2.5" id="waiver-section-6">
              <span className="font-extrabold text-black block">6. EMERGENCY MEDICAL CONSENT</span>
              <span>In the event of a medical emergency occurring while I am participating in activities at Pulse PowerHub, and I am unconscious or otherwise incapable of making decisions, I hereby grant permission to the management or staff of Pulse PowerHub to seek immediate first aid, call an ambulance, or transfer me to the nearest hospital. Any and all costs arising from such emergency medical treatments shall be my sole responsibility.</span>
            </div>

            <div className="border-l-2 border-[#007AFF] pl-2.5 my-2.5" id="waiver-section-7">
              <span className="font-extrabold text-black block">7. COMPLIANCE WITH GYM RULES</span>
              <span>I agree to comply with all written rules, codes of conduct, equipment usage regulations, and verbal instructions provided by Pulse PowerHub staff for collective safety. Pulse PowerHub reserves the right to terminate my membership without any refund if I am found to violate regulations or engage in behavior that endangers other members.</span>
            </div>

            <p className="font-bold text-slate-900 mt-4 border-t pt-3" id="waiver-confirmation-text">
              I confirm by my signature that I have read, fully understood, and voluntarily agreed to all the terms of this Liability Waiver. I am aware that by signing this document, I am waiving certain legal rights.
            </p>
          </div>
        </div>

        {/* BOTTOM AREA: WARNING & SIGNATURE BLOCK */}
        <div className="p-5 bg-slate-50 flex-grow flex flex-col justify-end space-y-4">
          
          {/* Scroll Down Warning */}
          {!hasScrolledToBottom ? (
            <div className="flex items-center space-x-2 text-amber-600 bg-amber-50 p-3 rounded-xl border border-amber-200 text-xs font-semibold animate-pulse">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>Please scroll down to the bottom of the text to sign this document.</span>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-800 flex items-center space-x-1">
                  <Edit2 className="w-3.5 h-3.5 text-[#007AFF]" />
                  <span>Your Electronic Signature * (Required)</span>
                </span>
                
                {!isCanvasBlank && (
                  <button
                    type="button"
                    onClick={clearCanvas}
                    className="text-[11px] font-bold text-[#E25C5C] hover:text-red-700 transition flex items-center space-x-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Clear & Retry</span>
                  </button>
                )}
              </div>

              {/* Responsive interactive Canvas Signature */}
              <div className="bg-white border border-slate-300 rounded-2xl overflow-hidden shadow-inner relative flex justify-center items-center">
                <canvas
                  ref={canvasRef}
                  width={460}
                  height={130}
                  className="w-full h-[130px] bg-slate-50 cursor-crosshair touch-none"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                />
                
                {isCanvasBlank && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-400 font-medium text-xs select-none">
                    Draw your signature here
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex space-x-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-12 bg-white border border-[#E5E5EA] hover:border-[#C6C6C8] text-slate-700 font-bold rounded-xl text-xs transition active:scale-95 cursor-pointer"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleSaveAndAgree}
              disabled={!hasScrolledToBottom || isCanvasBlank}
              className={`flex-1 h-12 rounded-xl text-xs font-extrabold flex items-center justify-center space-x-1.5 transition ${
                hasScrolledToBottom && !isCanvasBlank
                  ? 'bg-[#007AFF] hover:bg-[#0062CC] text-white active:scale-95 shadow-md shadow-[#007AFF]/15 cursor-pointer'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Check className="w-4 h-4 stroke-[2.5px]" />
              <span>Agree & Save</span>
            </button>
          </div>

        </div>
      </motion.div>
    </div>
  );
};
