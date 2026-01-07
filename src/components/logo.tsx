"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
}

const sizes = {
  sm: { icon: "h-5 w-5", text: "text-lg" },
  md: { icon: "h-6 w-6", text: "text-xl" },
  lg: { icon: "h-8 w-8", text: "text-2xl" },
};

export function Logo({ className, showText = true, size = "md" }: LogoProps) {
  const { icon, text } = sizes[size];

  return (
    <Link href="/" className={`flex items-center gap-2 ${className}`}>
      <Sparkles className={`${icon} text-primary`} />
      {showText && <span className={`${text} font-bold`}>CV AI</span>}
    </Link>
  );
}
