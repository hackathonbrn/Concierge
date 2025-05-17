import React from "react";
import { cn } from "@/lib/utils";

interface AccessResultProps {
  isGranted: boolean;
  reason: string;
}

const AccessResult: React.FC<AccessResultProps> = ({ isGranted, reason }) => {
  return (
    <div className="w-full max-w-lg mx-auto bg-card rounded-xl shadow-lg p-6 text-center">
      <div
        className={cn(
          "text-3xl font-bold mb-4",
          isGranted ? "text-green-500" : "text-red-500"
        )}
      >
        Доступ {isGranted ? "Разрешен" : "Запрещен"}
      </div>

      <div
        className={cn(
          "w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6",
          isGranted ? "bg-green-100" : "bg-red-100"
        )}
      >
        {isGranted ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 text-green-500"
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
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        )}
      </div>

      <div className="text-xl mb-4 text-card-foreground">{reason}</div>

      <div className="text-sm text-muted-foreground">
        {isGranted
          ? "Ваш IP-адрес был добавлен в белый список сети."
          : "Пожалуйста, попробуйте снова с другим профилем."}
      </div>
    </div>
  );
};

export default AccessResult;
