import React from "react";
import { MapPin, Navigation, X } from "lucide-react";

export function LocationModal({
  isOpen,
  onClose,
  onRequestLocation,
  presetLocations = [],
  onSelectLocation
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#171717] rounded-3xl p-6 w-full max-w-md shadow-2xl border border-surface-variant/50 dark:border-[#262626] text-left">
        <div className="flex items-center justify-between pb-4 border-b border-surface-variant/30 dark:border-[#262626]">
          <div className="flex items-center gap-2">
            <MapPin size={20} className="text-primary" />
            <h3 className="text-lg font-black text-on-surface dark:text-white">Select Delivery Location</h3>
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-200 cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <button
          onClick={() => {
            onRequestLocation();
            onClose();
          }}
          className="mt-4 w-full py-3 px-4 bg-primary text-on-primary font-bold text-sm rounded-xl flex items-center justify-center gap-2 hover:bg-primary-container transition-all shadow-sm cursor-pointer"
        >
          <Navigation size={18} />
          <span>Detect My Current Location (GPS)</span>
        </button>

        <div className="mt-5 flex flex-col gap-2">
          <p className="text-xs font-bold text-slate-text uppercase tracking-wider">Popular Metro Areas</p>
          <div className="grid grid-cols-1 gap-2 max-h-56 overflow-y-auto pr-1">
            {presetLocations.map((preset) => (
              <button
                key={preset.city}
                onClick={() => {
                  onSelectLocation(preset);
                  onClose();
                }}
                className="flex flex-col text-left p-3 rounded-xl border border-surface-variant/40 dark:border-[#262626] hover:border-primary hover:bg-primary-50/20 dark:hover:bg-primary/10 transition-all cursor-pointer"
              >
                <span className="text-xs font-bold text-on-surface dark:text-white">{preset.city}</span>
                <span className="text-[11px] text-on-surface-variant truncate">{preset.address}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
