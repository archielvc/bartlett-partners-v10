export const getPropertyStatusStyles = (status: string) => {
    const s = status.toLowerCase();
    switch (s) {
        case "available":
            return "bg-[#8E8567] text-white";
        case "sale agreed":
        case "under_offer":
            return "bg-[#1A2551] text-white";
        case "sold":
            return "bg-[#1A2551] text-white";
        default:
            return "bg-[#1A2551] text-white";
    }
};
