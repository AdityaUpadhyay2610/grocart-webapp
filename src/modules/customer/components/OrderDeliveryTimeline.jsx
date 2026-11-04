import React from "react";
import { Check, Package, Truck, Home, ShoppingBag, Phone } from "lucide-react";

export function OrderDeliveryTimeline({ currentStage, isDelivered, formattedTimer, onCallDriver }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="bg-surface-container-low dark:bg-[#171717] rounded-3xl p-6 sm:p-8 border border-surface-variant/40 dark:border-[#262626] shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-headline-md text-base font-bold text-on-surface dark:text-white">Delivery Status</h3>
          <span className="text-xs font-bold text-primary font-mono">
            {isDelivered ? "Completed" : `${formattedTimer} left`}
          </span>
        </div>
        
        <div className="relative flex items-center justify-between">
          <div className="absolute top-4 left-6 right-6 h-1 bg-surface-container dark:bg-[#201f1f] -translate-y-1/2 z-0" />
          <div 
            className="absolute top-4 left-6 h-1 bg-primary -translate-y-1/2 z-0 transition-all duration-700" 
            style={{ width: `${currentStage.progressPct}%` }}
          />

          <div className="flex flex-col items-center gap-2 z-10">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-colors ${
              currentStage.step >= 1 ? 'bg-primary text-white dark:text-black' : 'bg-surface-container dark:bg-[#201f1f] border border-surface-variant/40 dark:border-[#262626] text-on-surface-variant'
            }`}>
              <Check size={16} className="stroke-[3]" />
            </div>
            <span className={`font-label-md text-xs font-bold ${currentStage.step >= 1 ? 'text-on-surface dark:text-white' : 'text-on-surface-variant'}`}>
              Order Placed
            </span>
            <span className="text-[10px] text-on-surface-variant font-medium">Confirmed</span>
          </div>

          <div className="flex flex-col items-center gap-2 z-10">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-colors ${
              currentStage.step >= 2 ? 'bg-primary text-white dark:text-black' : 'bg-surface-container dark:bg-[#201f1f] border border-surface-variant/40 dark:border-[#262626] text-on-surface-variant'
            }`}>
              {currentStage.step >= 2 ? <Check size={16} className="stroke-[3]" /> : <Package size={14} />}
            </div>
            <span className={`font-label-md text-xs font-bold ${currentStage.step >= 2 ? 'text-on-surface dark:text-white' : 'text-on-surface-variant'}`}>
              Order Packed
            </span>
            <span className="text-[10px] text-on-surface-variant font-medium">Ready</span>
          </div>

          <div className="flex flex-col items-center gap-2 z-10">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center shadow-lg transition-all ${
              currentStage.step === 3 
                ? 'bg-primary-container text-white shadow-emerald-500/30 animate-bounce' 
                : currentStage.step > 3 
                  ? 'bg-primary text-white dark:text-black' 
                  : 'bg-surface-container dark:bg-[#201f1f] border border-surface-variant/40 dark:border-[#262626] text-on-surface-variant'
            }`}>
              {currentStage.step > 3 ? (
                <Check size={16} className="stroke-[3]" />
              ) : (
                <Truck size={18} />
              )}
            </div>
            <span className={`font-label-md text-xs font-bold ${currentStage.step >= 3 ? 'text-primary font-black' : 'text-on-surface-variant'}`}>
              Out for Delivery
            </span>
            <span className="text-[10px] text-on-surface-variant font-medium">On the road</span>
          </div>

          <div className="flex flex-col items-center gap-2 z-10">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
              currentStage.step >= 4 
                ? 'bg-primary text-white dark:text-black shadow-md' 
                : 'bg-surface-container dark:bg-[#201f1f] border-2 border-surface-variant/60 dark:border-[#262626] text-on-surface-variant'
            }`}>
              {currentStage.step >= 4 ? (
                <Check size={16} className="stroke-[3]" />
              ) : (
                <Home size={16} />
              )}
            </div>
            <span className={`font-label-md text-xs ${currentStage.step >= 4 ? 'text-primary font-black' : 'text-on-surface-variant font-medium'}`}>
              Delivered
            </span>
            <span className="text-[10px] text-on-surface-variant font-medium">At Doorstep</span>
          </div>
        </div>
      </div>

      <div className="bg-surface-container-low dark:bg-[#171717] rounded-3xl p-5 sm:p-6 border border-surface-variant/40 dark:border-[#262626] shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-primary/15 dark:bg-primary/20 flex items-center justify-center text-primary font-black text-base">
            <ShoppingBag size={22} />
          </div>
          <div>
            <h4 className="font-headline-md text-sm font-bold text-on-surface dark:text-white">
              {currentStage.driverText}
            </h4>
            <p className="font-body-md text-xs text-on-surface-variant mt-0.5">
              {currentStage.driverSubtext}
            </p>
          </div>
        </div>

        {!isDelivered && (
          <button 
            onClick={onCallDriver}
            className="px-4 py-2.5 bg-surface-container dark:bg-[#201f1f] hover:bg-surface-container-high text-on-surface dark:text-white border border-surface-variant/40 dark:border-[#262626] rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Phone size={14} />
            <span>Call Driver</span>
          </button>
        )}
      </div>
    </div>
  );
}
