import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface PropertyFilterSelectProps {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
}

export function PropertyFilterSelect({
  label,
  value,
  options,
  onChange,
}: PropertyFilterSelectProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger
        className="!h-11 px-4 bg-white border border-gray-200 rounded-full hover:border-[#1A2551] transition-all min-w-[140px] focus:ring-0 focus:border-[#1A2551]"
        style={{
          fontFamily: "'Figtree', sans-serif",
          fontSize: "0.75rem",
          textTransform: "uppercase",
          letterSpacing: "0.15em",
          fontWeight: 600,
          color: "#1A2551",
          height: "2.75rem",
        }}
      >
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent
        className="bg-white border border-gray-200 rounded-xl shadow-lg"
        style={{ fontFamily: "'Figtree', sans-serif" }}
      >
        {options.map((option) => (
          <SelectItem
            key={option}
            value={option}
            className="text-[#1A2551] hover:bg-gray-50 cursor-pointer py-2.5 px-4 focus:bg-gray-50 focus:text-[#1A2551]"
            style={{
              fontSize: "0.875rem",
              letterSpacing: "0.05em",
            }}
          >
            {option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
