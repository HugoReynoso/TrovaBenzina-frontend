const brandRules = [
  { match: ["agip", "eni"], key: "eni", label: "Eni", initials: "ENI" },
  { match: ["q8"], key: "q8", label: "Q8", initials: "Q8" },
  { match: ["api", "ip"], key: "ip", label: "IP", initials: "IP" },
  { match: ["esso"], key: "esso", label: "Esso", initials: "Esso" },
  { match: ["tamoil"], key: "tamoil", label: "Tamoil", initials: "T" },
  { match: ["keropetrol"], key: "keropetrol", label: "Kero", initials: "K" },
  { match: ["vega"], key: "vega", label: "Vega", initials: "V" },
  { match: ["pompe bianche", "white"], key: "white", label: "Pompe Bianche", initials: "PB" }
] as const;

export interface FuelBrand {
  key: string;
  label: string;
  initials: string;
  image?: string;
}

export function getFuelBrand(brand: string): FuelBrand {
  const normalized = brand.trim().toLowerCase();
  const rule = brandRules.find((item) => item.match.some((match) => normalized.includes(match)));

  if (rule) {
    return {
      key: rule.key,
      label: rule.label,
      initials: rule.initials,
      image: rule.key === "ip" ? "/brand/ip-logo.svg" : rule.key === "white" ? "/brand/generic-pump.svg" : undefined
    };
  }

  const words = brand
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  const initials = words
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

  return {
    key: "generic",
    label: brand || "Brand",
    initials: initials || "B"
  };
}

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    switch (character) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      case "'":
        return "&#039;";
      default:
        return character;
    }
  });
}
