export const getPropertyStatusStyles = (status: string): { className: string; style: React.CSSProperties } => {
    const s = status.toLowerCase();
    switch (s) {
        case "available":
            // Darker gold (#5C572E) with white text meets WCAG AA (4.5:1 contrast)
            return { className: "text-white", style: { backgroundColor: "#5C572E" } };
        case "sale agreed":
        case "under_offer":
            return { className: "text-white", style: { backgroundColor: "#1A2551" } };
        case "sold":
            return { className: "text-white", style: { backgroundColor: "#1A2551" } };
        default:
            return { className: "text-white", style: { backgroundColor: "#1A2551" } };
    }
};
