import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger, DialogClose } from "./ui/dialog";
import { Sheet, SheetContent, SheetTitle, SheetDescription, SheetClose } from "./ui/sheet";
import { X } from "lucide-react";
import { UnifiedContactForm } from "./forms";
import { PropertyMultiSelector } from "./forms/PropertyMultiSelector";
import { Property } from "../types/property";

interface BookEvaluationDialogProps {
  trigger: React.ReactNode;
}

export function BookEvaluationDialog({ trigger }: BookEvaluationDialogProps) {
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isSuccessView, setIsSuccessView] = useState(false);
  const [selectedProperties, setSelectedProperties] = useState<Property[]>([]);
  const [showPropertySelector, setShowPropertySelector] = useState(false);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1000);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setTimeout(() => setIsSuccessView(false), 300);
    }
  };

  const handleSuccess = () => {
    setOpen(false);
    setTimeout(() => setIsSuccessView(false), 300);
  };



  const liquidBackground = (
    <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
      <div className="absolute -top-[20%] -right-[10%] w-[70vw] h-[70vw] bg-[#8E8567]/10 rounded-full blur-[100px]" />
      <div className="absolute top-[40%] -left-[10%] w-[60vw] h-[60vw] bg-[#1A2551]/5 rounded-full blur-[80px]" />
    </div>
  );

  // Mobile full-page version
  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={handleOpenChange}>
        <div onClick={() => setOpen(true)}>
          {trigger}
        </div>

        <SheetContent
          side="right"
          className="w-[100vw] sm:max-w-[500px] p-0 flex flex-col bg-white overflow-hidden [&>button]:hidden gap-0"
        >
          <div className="relative flex flex-col h-full overflow-hidden">
            <SheetClose className="absolute top-6 right-6 z-50 flex items-center justify-center w-10 h-10 bg-white border border-[#1A2551]/10 shadow-sm hover:bg-[#1A2551] text-[#1A2551] hover:text-white rounded-full transition-all">
              <X className="w-5 h-5" />
              <span className="sr-only">Close</span>
            </SheetClose>

            <SheetTitle className="sr-only">Book Your Property Valuation</SheetTitle>
            <SheetDescription className="sr-only">Complete the form to schedule your property valuation appointment</SheetDescription>

            <PropertyMultiSelector
              selectedProperties={selectedProperties}
              onSelectionChange={setSelectedProperties}
              showSelector={showPropertySelector}
              onClose={() => setShowPropertySelector(false)}
            />

            {!isSuccessView && (
              <div className="px-6 py-6 border-b border-[#1A2551]/10 bg-white sticky top-0 z-20">
                <h2
                  className="text-[#1A2551] text-xl md:text-2xl"
                  style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400 }}
                >
                  How can we help?
                </h2>
              </div>
            )}

            <div className="flex-1 px-6 pb-12 overflow-y-auto">
              <UnifiedContactForm
                defaultIntent="sell"
                selectedProperties={selectedProperties}
                onPropertySelectionChange={setSelectedProperties}
                onPropertySelectorOpen={() => setShowPropertySelector(true)}
                showPropertySelector={showPropertySelector}
                onSuccess={handleSuccess}
                onSubmitted={() => setIsSuccessView(true)}
              />
            </div>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop version
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0 gap-0 overflow-hidden border-none bg-transparent shadow-none sm:rounded-3xl [&>button]:hidden">
        <DialogTitle className="sr-only">Book Your Property Valuation</DialogTitle>
        <DialogDescription className="sr-only">Complete the form to schedule your property valuation appointment</DialogDescription>

        <div className="bg-white sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] w-full mx-auto border-2 border-[#1A2551] relative">
          <DialogClose className="absolute top-6 right-6 z-50 flex items-center justify-center w-10 h-10 bg-white border border-[#1A2551]/10 shadow-sm hover:bg-[#1A2551] text-[#1A2551] hover:text-white rounded-full transition-all">
            <X className="w-5 h-5" />
            <span className="sr-only">Close</span>
          </DialogClose>
          {liquidBackground}

          <PropertyMultiSelector
            selectedProperties={selectedProperties}
            onSelectionChange={setSelectedProperties}
            showSelector={showPropertySelector}
            onClose={() => setShowPropertySelector(false)}
          />

          {!isSuccessView && (
            <div className="px-8 md:px-10 pt-10 pb-6 z-20">
              <h2
                className="text-[#1A2551] text-3xl md:text-3xl lg:text-4xl"
                style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400 }}
              >
                How can we help?
              </h2>
            </div>
          )}

          <div className="overflow-y-auto flex-1 px-10 pb-10 custom-scrollbar">
            <UnifiedContactForm
              defaultIntent="sell"
              selectedProperties={selectedProperties}
              onPropertySelectionChange={setSelectedProperties}
              onPropertySelectorOpen={() => setShowPropertySelector(true)}
              showPropertySelector={showPropertySelector}
              onSuccess={handleSuccess}
              onSubmitted={() => setIsSuccessView(true)}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}