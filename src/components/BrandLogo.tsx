import Image from "next/image";
import { getFuelBrand } from "@/lib/brand";
import { withBasePath } from "@/lib/site";

interface BrandLogoProps {
  brand: string;
  compact?: boolean;
}

export function BrandLogo({ brand, compact = false }: BrandLogoProps) {
  const fuelBrand = getFuelBrand(brand);

  return (
    <span
      className={`brand-logo brand-logo--${fuelBrand.key} ${compact ? "brand-logo--compact" : ""}`}
      aria-label={fuelBrand.label}
      title={brand}
    >
      {fuelBrand.image ? (
        <Image className="brand-logo__image" src={withBasePath(fuelBrand.image)} alt="" width={52} height={30} aria-hidden="true" />
      ) : (
        fuelBrand.initials
      )}
    </span>
  );
}
