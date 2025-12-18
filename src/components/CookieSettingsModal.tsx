import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { useCookie } from '../contexts/CookieContext';
import { trackEvent } from '../utils/analytics';

export function CookieSettingsModal() {
  const { isSettingsOpen, closeSettings, consent, savePreferences } = useCookie();
  const [preferences, setPreferences] = useState(consent);

  // Update local state when modal opens or consent changes
  useEffect(() => {
    if (isSettingsOpen) {
      setPreferences(consent);
    }
  }, [isSettingsOpen, consent]);

  const handleSave = () => {
    savePreferences(preferences);
    trackEvent('click', 'Cookie Consent', 'Save Preferences');
  };

  return (
    <Dialog open={isSettingsOpen} onOpenChange={(open) => !open && closeSettings()}>
      <DialogContent className="sm:max-w-[500px] bg-white border-[#1A2551]/20 shadow-xl">
        <DialogHeader>
          <DialogTitle 
            className="text-[#1A2551] text-2xl font-medium"
            style={{ fontFamily: "'Figtree', sans-serif" }}
          >
            Cookie Preferences
          </DialogTitle>
          <DialogDescription 
            className="text-gray-500 font-light"
            style={{ fontFamily: "'Figtree', sans-serif" }}
          >
            Manage your cookie settings. You can enable or disable different types of cookies below.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-6 py-6">
            {/* Necessary */}
            <div className="flex items-start justify-between space-x-4">
                <div className="flex flex-col space-y-1">
                    <Label 
                      htmlFor="necessary" 
                      className="text-[#1A2551] font-bold text-sm uppercase tracking-wider"
                      style={{ fontFamily: "'Figtree', sans-serif" }}
                    >
                      Strictly Necessary
                    </Label>
                    <span 
                      className="text-xs text-gray-500 font-light leading-relaxed"
                      style={{ fontFamily: "'Figtree', sans-serif" }}
                    >
                      These cookies are essential for the website to function and cannot be switched off in our systems.
                    </span>
                </div>
                <Switch id="necessary" checked={true} disabled className="data-[state=checked]:bg-[#1A2551] opacity-50" />
            </div>

            {/* Analytics */}
             <div className="flex items-start justify-between space-x-4">
                <div className="flex flex-col space-y-1">
                    <Label 
                      htmlFor="analytics" 
                      className="text-[#1A2551] font-bold text-sm uppercase tracking-wider"
                      style={{ fontFamily: "'Figtree', sans-serif" }}
                    >
                      Analytics
                    </Label>
                    <span 
                      className="text-xs text-gray-500 font-light leading-relaxed"
                      style={{ fontFamily: "'Figtree', sans-serif" }}
                    >
                      Help us improve our website by collecting and reporting information on how you use it.
                    </span>
                </div>
                <Switch 
                    id="analytics" 
                    checked={preferences.analytics} 
                    onCheckedChange={(checked) => setPreferences({...preferences, analytics: checked})}
                    className="data-[state=checked]:bg-[#1A2551]"
                />
            </div>

             {/* Marketing */}
             <div className="flex items-start justify-between space-x-4">
                <div className="flex flex-col space-y-1">
                    <Label 
                      htmlFor="marketing" 
                      className="text-[#1A2551] font-bold text-sm uppercase tracking-wider"
                      style={{ fontFamily: "'Figtree', sans-serif" }}
                    >
                      Marketing
                    </Label>
                    <span 
                      className="text-xs text-gray-500 font-light leading-relaxed"
                      style={{ fontFamily: "'Figtree', sans-serif" }}
                    >
                      Used to track visitors across websites to display relevant ads and marketing campaigns.
                    </span>
                </div>
                <Switch 
                    id="marketing" 
                    checked={preferences.marketing} 
                    onCheckedChange={(checked) => setPreferences({...preferences, marketing: checked})}
                    className="data-[state=checked]:bg-[#1A2551]"
                />
            </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
             <Button 
                variant="outline" 
                onClick={closeSettings} 
                className="w-full sm:w-auto border-[#1A2551] text-[#1A2551] hover:bg-[#1A2551]/5 uppercase text-xs font-bold tracking-wider"
              >
                Cancel
              </Button>
             <Button 
                onClick={handleSave} 
                className="w-full sm:w-auto bg-[#1A2551] text-white hover:bg-[#1A2551]/90 uppercase text-xs font-bold tracking-wider"
              >
                Save Preferences
              </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
