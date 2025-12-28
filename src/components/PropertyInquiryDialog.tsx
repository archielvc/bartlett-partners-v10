import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger, DialogClose } from "./ui/dialog";
import { Sheet, SheetContent, SheetTitle, SheetDescription, SheetClose } from "./ui/sheet";
import { X } from "lucide-react";
import { Property } from "../types/property";
import { UnifiedContactForm } from "./forms";

interface PropertyInquiryDialogProps {
  trigger?: React.ReactNode;
  property?: Property;
  properties?: Property[];
  isMultiProperty?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  inquiryType?: string;
}

export function PropertyInquiryDialog({
  trigger,
  property,
  properties,
  isMultiProperty = false,
  open,
  onOpenChange,
  inquiryType
}: PropertyInquiryDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isSuccessView, setIsSuccessView] = useState(false);

  // Controlled vs Uncontrolled logic
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;
  const setOpen = (newOpen: boolean) => {
    if (!isControlled) setInternalOpen(newOpen);
    if (!newOpen) setTimeout(() => setIsSuccessView(false), 300); // Reset after close animation
    onOpenChange?.(newOpen);
  };

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1000);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Determine default properties based on props
  const defaultProperties = isMultiProperty && properties
    ? properties
    : property
      ? [property]
      : [];

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

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={setOpen}>
        {trigger && (
          <div onClick={() => setOpen(true)}>
            {trigger}
          </div>
        )}

        <SheetContent
          side="right"
          className="w-[100vw] sm:max-w-[500px] p-0 flex flex-col bg-white/95 backdrop-blur-xl overflow-hidden [&>button]:hidden text-left"
        >
          <div className="absolute top-6 right-6 z-50">
            <SheetClose className="flex items-center justify-center w-10 h-10 bg-white border border-[#1A2551]/10 shadow-sm hover:bg-[#1A2551] text-[#1A2551] hover:text-white rounded-full transition-all">
              <X className="w-5 h-5" />
              <span className="sr-only">Close</span>
            </SheetClose>
          </div>
          {liquidBackground}

          <SheetTitle className="sr-only">Property Inquiry</SheetTitle>
          <SheetDescription className="sr-only">Fill out the form below to enquire about the property</SheetDescription>

          <div className="h-full w-full overflow-y-auto">
            {!isSuccessView && (
              <div className="px-6 py-6 border-b border-[#1A2551]/10 bg-white/80 backdrop-blur-md sticky top-0 z-20">
                <h2
                  className="text-[#1A2551] text-xl md:text-2xl"
                  style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400 }}
                >
                  How can we help?
                </h2>
              </div>
            )}

            <div className="px-6 pb-12">
              <UnifiedContactForm
                defaultIntent={(inquiryType || "buy") as any}
                defaultProperties={defaultProperties}
                onSuccess={handleSuccess}
                onSubmitted={() => setIsSuccessView(true)}
              />
            </div>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      {trigger && (
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
      )}
      <DialogContent className="max-w-2xl max-h-[90vh] p-0 gap-0 overflow-hidden border-none bg-transparent shadow-none sm:rounded-3xl [&>button]:hidden">
        <DialogTitle className="sr-only">Property Inquiry</DialogTitle>
        <DialogDescription className="sr-only">Fill out the form below to enquire about the property</DialogDescription>

        <div className="bg-white sm:rounded-3xl shadow-2x overflow-hidden flex flex-col max-h-[85vh] w-full mx-auto border-2 border-[#1A2551] relative">
          <DialogClose className="absolute top-6 right-6 z-50 flex items-center justify-center w-10 h-10 bg-white border border-[#1A2551]/10 shadow-sm hover:bg-[#1A2551] text-[#1A2551] hover:text-white rounded-full transition-all">
            <X className="w-5 h-5" />
            <span className="sr-only">Close</span>
          </DialogClose>
          {liquidBackground}

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

          <div className="flex-1 overflow-y-auto px-10 pb-10 custom-scrollbar">
            <UnifiedContactForm
              defaultIntent={(inquiryType || "buy") as any}
              defaultProperties={defaultProperties}
              onSuccess={handleSuccess}
              onSubmitted={() => setIsSuccessView(true)}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}