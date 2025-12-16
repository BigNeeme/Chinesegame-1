import { useEffect, useState } from "react";
import logoLight from "@assets/White_Bgrd_1765914956812.png";
import logoDark from "@assets/Black_Bgrd_1765914956811.png";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

export function Logo({ className = "", size = "md" }: LogoProps) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };
    
    checkTheme();
    
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { 
      attributes: true, 
      attributeFilter: ["class"] 
    });
    
    return () => observer.disconnect();
  }, []);

  const sizeClasses = {
    sm: "h-8",
    md: "h-12",
    lg: "h-16",
    xl: "h-24",
  };

  return (
    <img 
      src={isDark ? logoDark : logoLight}
      alt="Chinese Card Game"
      className={`${sizeClasses[size]} w-auto object-contain ${className}`}
      data-testid="logo"
    />
  );
}
