import { useState } from "react";
import { Button } from "../ui/button";
import { Pencil, MapPin, Loader2, Check } from "lucide-react";
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
}

export function UnifiedContactForm({
    onSuccess,
    onSubmitted,
    defaultIntent = 'other',
    defaultProperties = [],
    hideIntentSelector = false,
    variant = 'dialog',
}: UnifiedContactFormProps) {
    const [intent, setIntent] = useState<ContactIntent>(defaultIntent);
    const [selectedProperties, setSelectedProperties] = useState<Property[]>(defaultProperties);
    const [showPropertySelector, setShowPropertySelector] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

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
        setIsSubmitting(true);

        const formData = new FormData(e.currentTarget);
        const name = formData.get('name') as string;
        const email = formData.get('email') as string;
        const phone = formData.get('phone') as string;
        const message = formData.get('message') as string;

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

        try {
            await submitContactForm({
                name,
                email,
                phone,
                message: fullMessage,
                property_id: selectedProperties.length > 0 ? String(selectedProperties[0].id) : undefined,
                inquiry_type: inquiryType
            });

            // Track analytics
            if (intent === 'sell') {
                trackValuationRequest();
            } else if (selectedProperties.length > 0) {
                const p = selectedProperties[0];
                const priceVal = typeof p.price === 'number' ? p.price : (parseFloat(String(p.price).replace(/[^0-9.]/g, '')) || 0);
                trackPropertyEnquiry(String(p.id), p.title, priceVal);
            } else {
                trackContactFormSubmit(inquiryType);
            }

            // Show internal success state instead of toast
            setIsSubmitted(true);
            onSubmitted?.();

            // Reset form
            (e.target as HTMLFormElement).reset();
            if (!hideIntentSelector) {
                setIntent('other');
            }
            setSelectedProperties(defaultProperties);

        } catch (error) {
            console.error(error);
            toast.error("Failed to send message.", {
                description: "Please try again or call us directly."
            });
        } finally {
            setIsSubmitting(false);
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
                        className="min-w-[200px]"
                        premium
                    >
                        Send Another Message
                    </Button>
                )}
            </div>
        );
    }

    return (
        <div className="relative">
            {/* Property Selector Overlay */}
            <PropertyMultiSelector
                selectedProperties={selectedProperties}
                onSelectionChange={setSelectedProperties}
                showSelector={showPropertySelector}
                onClose={() => setShowPropertySelector(false)}
            />

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
                            onClick={() => setShowPropertySelector(true)}
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
                        <label style={inputLabelStyle}>Phone</label>
                        <input
                            name="phone"
                            type="tel"
                            className={inputClasses}
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
                    disabled={isSubmitting}
                    className="w-full shadow-lg shadow-[#1A2551]/20"
                    premium
                >
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Send Enquiry"}
                </Button>
            </form>
        </div>
    );
}
