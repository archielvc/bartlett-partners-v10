import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

interface PropertyFilterMultiSelectProps {
  label: string;
  options: readonly string[];
  selected: string[];
  onChange: (selected: string[]) => void;
}

export function PropertyFilterMultiSelect({
  label,
  options,
  selected,
  onChange,
}: PropertyFilterMultiSelectProps) {
  const [open, setOpen] = useState(false);

  const toggleOption = (option: string) => {
    onChange(
      selected.includes(option)
        ? selected.filter((s) => s !== option)
        : [...selected, option]
    );
  };

  const displayValue =
    selected.length === 0
      ? label
      : selected.length === 1
        ? selected[0]
        : `${selected.length} selected`;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={`h-11 px-4 flex items-center gap-2 bg-white border rounded-full transition-all min-w-[140px] ${
            selected.length > 0
              ? "border-[#1A2551]"
              : "border-gray-200 hover:border-[#1A2551]"
          }`}
          style={{
            fontFamily: "'Figtree', sans-serif",
            fontSize: "0.75rem",
            textTransform: "uppercase",
            letterSpacing: "0.15em",
            fontWeight: 600,
            color: "#1A2551",
          }}
        >
          <span className="flex-1 text-left truncate">{displayValue}</span>
          <ChevronDown className="w-4 h-4 opacity-50 shrink-0" />
          {selected.length > 0 && (
            <span className="w-5 h-5 bg-[#8E8567] text-white text-[10px] rounded-full flex items-center justify-center shrink-0">
              {selected.length}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-56 p-2 bg-white border border-gray-200 rounded-xl shadow-lg"
        align="start"
      >
        {options.map((option) => (
          <label
            key={option}
            className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-gray-50 rounded-lg group"
          >
            <div className="relative flex items-center justify-center">
              <input
                type="checkbox"
                checked={selected.includes(option)}
                onChange={() => toggleOption(option)}
                className="w-5 h-5 border border-gray-300 rounded-sm appearance-none checked:bg-[#1A2551] checked:border-[#1A2551] cursor-pointer transition-colors"
              />
              {selected.includes(option) && (
                <svg
                  className="absolute w-3 h-3 text-white pointer-events-none"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </div>
            <span
              className="text-[#3A3A3A] group-hover:text-[#1A2551] transition-colors"
              style={{ fontFamily: "'Figtree', sans-serif", fontSize: "0.875rem" }}
            >
              {option}
            </span>
          </label>
        ))}
      </PopoverContent>
    </Popover>
  );
}
