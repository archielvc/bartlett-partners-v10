import * as React from "react";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { cn } from "./utils";

// Custom styles to override default react-phone-number-input styles and match the project theme
// We inject this style tag to avoid needing a separate CSS file
const customStyles = `
  .PhoneInput {
    display: flex;
    align-items: center;
  }
  .PhoneInputCountry {
    margin-right: 0.5rem;
  }
  .PhoneInputCountryIcon {
    width: 1.5rem;
    height: 1rem;
    box-shadow: 0 1px 2px rgba(0,0,0,0.1);
  }
  .PhoneInputCountrySelect {
    arrow-behavior: generic;
  }
  .PhoneInputInput {
    flex: 1;
    min-width: 0;
    background: transparent;
    border: none;
    outline: none;
    font-size: inherit;
    color: inherit;
  }
  .PhoneInputInput:focus {
    outline: none;
  }
`;

interface PhoneInputProps extends React.ComponentProps<typeof PhoneInput> {
    className?: string;
}

const PhoneInputComponent = React.forwardRef<any, any>(
    ({ className, ...props }, ref) => {
        return (
            <>
                <style>{customStyles}</style>
                <PhoneInput
                    ref={ref}
                    defaultCountry="GB"
                    className={cn(
                        // Base input styles from the project
                        "flex w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus-within:outline-none focus-within:ring-1 focus-within:ring-[#1A2551]/20 focus-within:border-[#1A2551]",
                        "h-11 px-5", // Match UnifiedContactForm specific height/padding
                        className
                    )}
                    {...props}
                />
            </>
        );
    }
);

PhoneInputComponent.displayName = "PhoneInput";

export { PhoneInputComponent as PhoneInput };
