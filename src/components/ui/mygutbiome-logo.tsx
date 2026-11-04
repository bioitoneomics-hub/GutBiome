import Image from "next/image";
import { cn } from "@/lib/utils";

export interface MyGutBiomeLogoProps {
  variant?: "light" | "dark";
  height?: number;
  width?: number;
  className?: string;
  priority?: boolean;
  alt?: string;
}

export function MyGutBiomeLogo({
  variant = "light",
  height = 28,
  width,
  className,
  priority = false,
  alt = "myGUTBIOME",
}: MyGutBiomeLogoProps) {
  const calculatedWidth = width ?? Math.round(height * 5.23);
  const src =
    variant === "dark"
      ? "/mygutbiome-logo-white.png"
      : "/mygutbiome-logo.png";

  return (
    <Image
      src={src}
      alt={alt}
      width={calculatedWidth}
      height={height}
      priority={priority}
      className={cn("h-auto object-contain inline-block select-none", className)}
    />
  );
}

