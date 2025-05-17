
import { cn } from "@/lib/utils";

interface MessageBubbleProps {
  content: string;
  isUser: boolean;
  isLast?: boolean;
}

const MessageBubble = ({ content, isUser, isLast = false }: MessageBubbleProps) => {
  return (
    <div 
      className={cn(
        "flex w-full mb-4",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div 
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-2 text-lg shadow-md",
          isUser 
            ? "bg-primary text-primary-foreground rounded-tr-none" 
            : "bg-secondary text-secondary-foreground rounded-tl-none"
          // Removed the isLast animation class that was causing blinking
        )}
      >
        {content}
      </div>
    </div>
  );
};

export default MessageBubble;
