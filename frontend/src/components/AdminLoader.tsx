import React from "react";
import { cn } from "@/lib/utils";

interface AdminLoaderProps {
  className?: string;
}

const AdminLoader: React.FC<AdminLoaderProps> = ({ className }) => {
  return (
    <div
      className={cn("flex flex-col items-center justify-center p-8", className)}
    >
      <div className="relative w-40 h-40">
        {/* Outer ring */}
        <div className="absolute inset-0 border-4 border-dashed border-accent rounded-full animate-spin-slow"></div>

        {/* Middle ring */}
        <div className="absolute inset-4 border-4 border-dashed border-primary rounded-full animate-spin-reverse"></div>

        {/* Inner circle */}
        <div className="absolute inset-10 bg-card border-2 border-muted rounded-full flex items-center justify-center">
          <div className="text-lg text-primary font-mono animate-pulse">ИИ</div>
        </div>

        {/* Floating particles */}
        <div className="absolute top-0 left-1/2 w-3 h-3 bg-accent rounded-full animate-float-particle"></div>
        <div className="absolute bottom-8 right-2 w-2 h-2 bg-primary rounded-full animate-float-particle-delay"></div>
        <div className="absolute top-1/2 left-0 w-2 h-2 bg-accent/70 rounded-full animate-float-particle-reverse"></div>
      </div>

      <p className="mt-6 text-muted-foreground animate-pulse">
        Генерация плана...
      </p>
      <p className="text-sm text-muted-foreground/70">
        Это может занять несколько минут
      </p>
    </div>
  );
};

export default AdminLoader;
