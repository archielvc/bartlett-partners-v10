import { useState } from "react";
import { isValidPhoneNumber } from "react-phone-number-input";
import { Button } from "../ui/button";
import { PhoneInput } from "../ui/phone-input";
import { Pencil, Check } from "lucide-react";
import { Property } from "../../types/property";
import { PropertyMultiSelector } from "./PropertyMultiSelector";
import { submitContactForm } from "../../utils/database";
import { toast } from "sonner";
import { trackContactFormSubmit, trackValuationRequest, trackPropertyEnquiry } from "../../utils/analytics";

export type ContactIntent = 'buy' | 'sell' | 'both' | 'other';

interface UnifiedContactFormProps {
    // For controlled usage in dialogs
    onSuccess?: () => void;
    // Callback for when internal success state is triggered (before close)
    onSubmitted?: () => void;

    // Pre-select intent
    defaultIntent?: ContactIntent;

    // Pre-select properties (for property page inquiry)
    defaultProperties?: Property[];

    // Hide intent selector if context already determines it
    hideIntentSelector?: boolean;

    // Variant for different contexts
    variant?: 'dialog' | 'inline';

    // Controlled property selector (for dialog usage)
    selectedProperties?: Property[];
    onPropertySelectionChange?: (properties: Property[]) => void;
    onPropertySelectorOpen?: () => void;
    showPropertySelector?: boolean;
}

export function UnifiedContactForm({
    onSuccess,
    onSubmitted,
    defaultIntent = 'other',
    defaultProperties = [],
    hideIntentSelector = false,
    variant = 'dialog',
    selectedProperties: controlledSelectedProperties,
    onPropertySelectionChange,
    onPropertySelectorOpen,
    showPropertySelector: controlledShowPropertySelector,
}: UnifiedContactFormProps) {
    const [intent, setIntent] = useState<ContactIntent>(defaultIntent);
    const [internalSelectedProperties, setInternalSelectedProperties] = useState<Property[]>(defaultProperties);
    const [internalShowPropertySelector, setInternalShowPropertySelector] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [phone, setPhone] = useState<string | undefined>("");

    // Use controlled or internal state
    const selectedProperties = controlledSelectedProperties ?? internalSelectedProperties;
    const setSelectedProperties = onPropertySelectionChange ?? setInternalSelectedProperties;
    const showPropertySelector = controlledShowPropertySelector ?? internalShowPropertySelector;
    const handleOpenPropertySelector = onPropertySelectorOpen ?? (() => setInternalShowPropertySelector(true));
    const handleClosePropertySelector = () => setInternalShowPropertySelector(false);

    const showPropertySelection = intent === 'buy' || intent === 'both';

    const intentLabels: Record<ContactIntent, string> = {
        buy: 'Buying',
        sell: 'Selling',
        both: 'Both',
        other: 'Other'
    };

    // Styles
    const inputLabelStyle = {
        fontFamily: "'Figtree', sans-serif",
        fontSize: "0.75rem",
        fontWeight: 600,
        textTransform: "uppercase" as const,
        letterSpacing: "0.1em",
        color: "#1A2551",
        marginBottom: "0.5rem",
        display: "block"
    };

    const inputClasses = "w-full h-11 px-5 bg-white border border-gray-200 rounded-md focus:outline-none focus:border-[#1A2551] focus:ring-1 focus:ring-[#1A2551]/20 transition-all shadow-sm placeholder:text-gray-400 text-[#1A2551] text-sm flex items-center";
    const textareaClasses = "w-full p-5 bg-white border border-gray-200 rounded-md focus:outline-none focus:border-[#1A2551] focus:ring-1 focus:ring-[#1A2551]/20 transition-all shadow-sm placeholder:text-gray-400 text-[#1A2551] text-sm";

    const formatPrice = (price: number | string) => {
        if (typeof price === 'string') {
            if (price.includes('£')) return price;
            const num = parseFloat(price);
            if (isNaN(num)) return price;
            return new Intl.NumberFormat('en-GB', {
                style: 'currency',
                currency: 'GBP',
                maximumFractionDigits: 0,
            }).format(num);
        }
        return new Intl.NumberFormat('en-GB', {
            style: 'currency',
            currency: 'GBP',
            maximumFractionDigits: 0,
        }).format(price);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Basic validation for phone
        if (!phone) {
            toast.error("Please enter a phone number");
            return;
        }

        if (!isValidPhoneNumber(phone)) {
            toast.error("Please enter a valid phone number");
            return;
        }

        const formElement = e.currentTarget;
        const formData = new FormData(formElement);
        const name = formData.get('name') as string;
        const email = formData.get('email') as string;
        const message = formData.get('message') as string;

        // Capture form state for potential rollback
        const formSnapshot = {
            name,
            email,
            phone,
            message,
            intent,
            selectedProperties: [...selectedProperties],
        };

        // Determine inquiry type for database
        let inquiryType: 'general' | 'property' | 'valuation' = 'general';
        if (intent === 'sell') inquiryType = 'valuation';
        if ((intent === 'buy' || intent === 'both') && selectedProperties.length > 0) inquiryType = 'property';

        // Build message with context
        const contextParts: string[] = [];
        contextParts.push(`Interest: ${intent.charAt(0).toUpperCase() + intent.slice(1)}`);
        if (selectedProperties.length > 0) {
            contextParts.push(`Properties: ${selectedProperties.map(p => p.title).join(', ')}`);
        }
        const fullMessage = `${contextParts.join('\n')}\n\n${message || ''}`.trim();

        // OPTIMISTIC UI: Show success immediately
        setIsSubmitted(true);
        onSubmitted?.();

        // Reset form state
        formElement.reset();
        if (!hideIntentSelector) {
            setIntent('other');
        }
        setSelectedProperties(defaultProperties);
        setPhone("");

        // Submit in background
        try {
            await submitContactForm({
                name,
                email,
                phone: phone || "",
                message: fullMessage,
                property_id: selectedProperties.length > 0 ? String(selectedProperties[0].id) : undefined,
                inquiry_type: inquiryType
            });

            // Track analytics (non-blocking)
            if (intent === 'sell') {
                trackValuationRequest();
            } else if (formSnapshot.selectedProperties.length > 0) {
                const p = formSnapshot.selectedProperties[0];
                const priceVal = typeof p.price === 'number' ? p.price : (parseFloat(String(p.price).replace(/[^0-9.]/g, '')) || 0);
                trackPropertyEnquiry(String(p.id), p.title, priceVal);
            } else {
                trackContactFormSubmit(inquiryType);
            }

        } catch (error) {
            console.error(error);

            // ROLLBACK: Restore form state on error
            setIsSubmitted(false);
            setIntent(formSnapshot.intent);
            setSelectedProperties(formSnapshot.selectedProperties);
            setPhone(formSnapshot.phone);

            // Show error toast
            toast.error("Failed to send message.", {
                description: "Please try again or call us directly."
            });

            // Restore form field values
            setTimeout(() => {
                const nameInput = formElement.querySelector('[name="name"]') as HTMLInputElement;
                const emailInput = formElement.querySelector('[name="email"]') as HTMLInputElement;
                const messageInput = formElement.querySelector('[name="message"]') as HTMLTextAreaElement;

                if (nameInput) nameInput.value = formSnapshot.name;
                if (emailInput) emailInput.value = formSnapshot.email;
                if (messageInput) messageInput.value = formSnapshot.message;
            }, 100);
        }
    };

    if (isSubmitted) {
        return (
            <div className="flex flex-col items-center justify-center text-center h-full py-10 animate-in fade-in zoom-in-95 duration-500">
                <div className="w-20 h-20 bg-[#1A2551]/5 rounded-full flex items-center justify-center mb-6">
                    <div className="w-16 h-16 bg-[#1A2551] rounded-full flex items-center justify-center shadow-lg shadow-[#1A2551]/20">
                        <Check className="w-8 h-8 text-white" />
                    </div>
                </div>

                <h3
                    className="text-2xl md:text-3xl text-[#1A2551] mb-4"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                >
                    Thank You
                </h3>

                <p
                    className="text-[#1A2551]/70 max-w-sm mb-10 leading-relaxed font-light"
                    style={{ fontFamily: "'Figtree', sans-serif" }}
                >
                    We have received your details and a member of our team will be in touch shortly.
                </p>

                {variant === 'dialog' ? (
                    <Button
                        onClick={() => onSuccess?.()}
                        className="min-w-[200px] shadow-lg shadow-[#1A2551]/10 bg-white text-[#1A2551] hover:bg-[#F9FAFB] border border-[#1A2551]/10"
                        variant="outline"
                    >
                        Close
                    </Button>
                ) : (
                    <Button
                        onClick={() => setIsSubmitted(false)}
                        className="min-w-[200px] px-8"
                        premium
                    >
                        Send Another Message
                    </Button>
                )}
            </div>
        );
    }

    // Only render PropertyMultiSelector here if in standalone mode (not controlled by parent dialog)
    const isStandaloneMode = controlledSelectedProperties === undefined;

    return (
        <div className={isStandaloneMode ? "relative" : ""}>
            {/* Property Selector - only in standalone mode */}
            {isStandaloneMode && (
                <PropertyMultiSelector
                    selectedProperties={selectedProperties}
                    onSelectionChange={setSelectedProperties}
                    showSelector={showPropertySelector}
                    onClose={handleClosePropertySelector}
                    isStandalone={true}
                />
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Intent Selector */}
                {!hideIntentSelector && (
                    <div className="pt-2">
                        <label style={inputLabelStyle}>I'm Interested In</label>
                        <div className="grid grid-cols-4 gap-3">
                            {(['buy', 'sell', 'both', 'other'] as ContactIntent[]).map((option) => (
                                <Button
                                    key={option}
                                    type="button"
                                    variant={intent === option ? "default" : "outline"}
                                    onClick={() => {
                                        setIntent(option);
                                        // Clear property selection if switching away from buy/both
                                        if (option !== 'buy' && option !== 'both') {
                                            setSelectedProperties([]);
                                        }
                                    }}
                                    className={`w-full uppercase ${intent !== option ? "border-gray-200 text-[#1A2551] hover:border-[#1A2551]" : ""}`}
                                    premium
                                >
                                    {intentLabels[option]}
                                </Button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Property Selection (shown for Buy/Both) */}
                {showPropertySelection && (
                    <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                        <label style={inputLabelStyle}>Properties of Interest</label>
                        <button
                            type="button"
                            onClick={handleOpenPropertySelector}
                            className="w-full bg-white border border-gray-200 rounded-xl p-4 text-left hover:border-[#1A2551] hover:ring-1 hover:ring-[#1A2551]/20 transition-all group flex items-center justify-between shadow-sm"
                        >
                            <div className="flex-1 min-w-0">
                                <span className={`text-[#1A2551] font-medium block ${selectedProperties.length > 0 ? "text-xs uppercase tracking-wider mb-2" : "text-xs"}`}>
                                    {selectedProperties.length > 0
                                        ? "Selected Properties:"
                                        : "Select Properties (Optional)"}
                                </span>
                                {selectedProperties.length > 0 && (
                                    <div className="flex flex-col gap-2">
                                        {selectedProperties.map(p => (
                                            <div key={p.id} className="flex flex-col text-left">
                                                <span className="text-sm font-medium text-[#1A2551]">{p.title}</span>
                                                <span className="text-xs text-gray-500 font-serif italic">
                                                    {formatPrice(p.price)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center gap-2 text-gray-400 group-hover:text-[#1A2551]">
                                {selectedProperties.length > 0 && (
                                    <span className="text-xs">{selectedProperties.length}</span>
                                )}
                                <Pencil className="w-4 h-4" />
                            </div>
                        </button>
                    </div>
                )}

                {/* Core Fields */}
                <div>
                    <label style={inputLabelStyle}>Name*</label>
                    <input
                        required
                        name="name"
                        type="text"
                        className={inputClasses}
                        placeholder="Your full name"
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                        <label style={inputLabelStyle}>Email*</label>
                        <input
                            required
                            name="email"
                            type="email"
                            className={inputClasses}
                            placeholder="Email address"
                        />
                    </div>
                    <div>
                        <label style={inputLabelStyle}>Phone*</label>
                        <PhoneInput
                            name="phone"
                            value={phone}
                            onChange={setPhone}
                            placeholder="Phone number"
                        />
                    </div>
                </div>

                {/* Message */}
                <div>
                    <label style={inputLabelStyle}>Additional Information</label>
                    <textarea
                        rows={variant === 'inline' ? 4 : 3}
                        name="message"
                        className={`${textareaClasses} resize-none`}
                        placeholder="Tell us more about what you're looking for..."
                    />
                </div>

                {/* Submit Button */}
                <Button
                    type="submit"
                    className="w-full shadow-lg shadow-[#1A2551]/20"
                    premium
                >
                    Send Enquiry
                </Button>
            </form>
        </div>
    );
}
