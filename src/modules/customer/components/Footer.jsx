import React from "react";
import { Globe, MessageSquare, Mail, Leaf, Zap } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full bg-surface-container-lowest dark:bg-[#0e0e0e] border-t border-surface-variant/30 dark:border-[#262626] py-16 mt-16 text-left">
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-10 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <img 
              src="/log.jpg" 
              alt="GroCart Logo" 
              className="w-8 h-8 rounded-lg object-cover shadow-sm shadow-emerald-500/20" 
            />
            <span className="font-headline-md text-primary text-xl font-black">GroCart</span>
          </div>
          <p className="text-on-surface-variant text-xs leading-relaxed max-w-xs">
            Bringing the organic freshness of the market to your digital doorstep in minutes.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <h4 className="font-label-md text-on-surface dark:text-white uppercase tracking-wider text-xs font-bold">Company</h4>
          <a href="#" className="text-on-surface-variant hover:text-primary transition-colors text-xs">About Us</a>
          <a href="#" className="text-on-surface-variant hover:text-primary transition-colors text-xs">Careers</a>
          <a href="#" className="text-on-surface-variant hover:text-primary transition-colors text-xs">Press</a>
        </div>

        <div className="flex flex-col gap-3">
          <h4 className="font-label-md text-on-surface dark:text-white uppercase tracking-wider text-xs font-bold">Support</h4>
          <a href="#" className="text-on-surface-variant hover:text-primary transition-colors text-xs">Contact Support</a>
          <a href="#" className="text-on-surface-variant hover:text-primary transition-colors text-xs">Terms of Service</a>
          <a href="#" className="text-on-surface-variant hover:text-primary transition-colors text-xs">Privacy Policy</a>
        </div>

        <div className="flex flex-col gap-3">
          <h4 className="font-label-md text-on-surface dark:text-white uppercase tracking-wider text-xs font-bold">Connect</h4>
          <div className="flex gap-3">
            <a href="#" className="w-9 h-9 rounded-full bg-surface-container-low dark:bg-[#171717] border border-surface-variant/40 dark:border-[#262626] flex items-center justify-center hover:bg-primary hover:text-white transition-all text-on-surface-variant">
              <Globe size={18} />
            </a>
            <a href="#" className="w-9 h-9 rounded-full bg-surface-container-low dark:bg-[#171717] border border-surface-variant/40 dark:border-[#262626] flex items-center justify-center hover:bg-primary hover:text-white transition-all text-on-surface-variant">
              <MessageSquare size={18} />
            </a>
            <a href="#" className="w-9 h-9 rounded-full bg-surface-container-low dark:bg-[#171717] border border-surface-variant/40 dark:border-[#262626] flex items-center justify-center hover:bg-primary hover:text-white transition-all text-on-surface-variant">
              <Mail size={18} />
            </a>
          </div>
        </div>
      </div>

      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-10 mt-12 pt-6 border-t border-surface-variant/20 dark:border-[#262626] flex flex-col sm:flex-row justify-between items-center gap-4 text-on-surface-variant text-xs">
        <p>© 2024 GroCart Technologies Inc. All rights reserved.</p>
        <div className="flex gap-6 font-semibold">
          <span className="flex items-center gap-1"><Leaf size={15} className="text-primary" /> Sustainably Packed</span>
          <span className="flex items-center gap-1"><Zap size={15} className="text-primary" /> Quick-Commerce Ready</span>
        </div>
      </div>
    </footer>
  );
}
