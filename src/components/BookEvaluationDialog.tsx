import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "./ui/sheet";
import { X } from "lucide-react";
import { UnifiedContactForm } from "./forms";

interface BookEvaluationDialogProps {
  trigger: React.ReactNode;
}

export function BookEvaluationDialog({ trigger }: BookEvaluationDialogProps) {
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1000);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleSuccess = () => {
    setOpen(false);
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
      <Sheet open={open} onOpenChange={setOpen}>
        <div onClick={() => setOpen(true)}>
          {trigger}
        </div>

        <SheetContent
          side="right"
          className="w-full sm:max-w-[500px] p-0 flex flex-col bg-white/95 backdrop-blur-xl border-l-2 border-[#1A2551] overflow-y-auto [&>button]:flex [&>button]:items-center [&>button]:justify-center [&>button]:bg-white [&>button]:border [&>button]:border-[#1A2551]/10 [&>button]:shadow-sm [&>button]:hover:bg-[#1A2551] [&>button]:text-[#1A2551] [&>button]:hover:text-white [&>button]:rounded-md [&>button]:w-10 [&>button]:h-10 [&>button]:top-6 [&>button]:right-6 [&>button]:transition-all [&>button]:z-50 [&>button>svg]:w-5 [&>button>svg]:h-5"
        >
          {liquidBackground}

          <SheetTitle className="sr-only">Book Your Property Valuation</SheetTitle>
          <SheetDescription className="sr-only">Complete the form to schedule your property valuation appointment</SheetDescription>

          <div className="px-6 py-6 border-b border-[#1A2551]/10 bg-white/80 backdrop-blur-md sticky top-0 z-20">
            <h2
              className="text-[#1A2551] text-xl md:text-2xl"
              style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400 }}
            >
              How can we help?
            </h2>
          </div>

          <div className="flex-1 px-6 pb-12 overflow-y-auto">
            <UnifiedContactForm
              defaultIntent="sell"
              onSuccess={handleSuccess}
            />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop version
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0 gap-0 overflow-hidden border-none bg-transparent shadow-none sm:rounded-3xl [&>button]:flex [&>button]:items-center [&>button]:justify-center [&>button]:bg-white [&>button]:border [&>button]:border-[#1A2551]/10 [&>button]:shadow-sm [&>button]:hover:bg-[#1A2551] [&>button]:text-[#1A2551] [&>button]:hover:text-white [&>button]:rounded-md [&>button]:w-10 [&>button]:h-10 [&>button]:top-6 [&>button]:right-6 [&>button]:transition-all [&>button]:z-50 [&>button>svg]:w-5 [&>button>svg]:h-5">
        <DialogTitle className="sr-only">Book Your Property Valuation</DialogTitle>
        <DialogDescription className="sr-only">Complete the form to schedule your property valuation appointment</DialogDescription>

        <div className="bg-white/95 backdrop-blur-xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] w-full mx-auto border-2 border-[#1A2551] relative">
          {liquidBackground}

          <div className="px-6 md:px-10 py-6 border-b border-[#1A2551]/10 bg-white/80 backdrop-blur-md sticky top-0 z-20">
            <h2
              className="text-[#1A2551] text-xl md:text-2xl"
              style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400 }}
            >
              How can we help?
            </h2>
          </div>

          <div className="overflow-y-auto flex-1 px-10 pb-10 custom-scrollbar">
            <UnifiedContactForm
              defaultIntent="sell"
              onSuccess={handleSuccess}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}