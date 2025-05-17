import React, { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import AnimatedRobot from "@/components/AnimatedRobot";
import MessageBubble from "@/components/MessageBubble";
import AccessResult from "@/components/AccessResult";
import {
  getChatHistory,
  sendChatMessage,
  getEvaluationResult,
  Message,
} from "@/services/apiService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader } from "lucide-react";

const Index: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [isRobotTalking, setIsRobotTalking] = useState<boolean>(false);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [evaluationResult, setEvaluationResult] = useState<{
    access: boolean;
    reason: string;
  } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Initialize chat by getting history
  useEffect(() => {
    const initializeChat = async () => {
      try {
        setIsLoading(true);
        const history = await getChatHistory();

        // Ensure history is an array before setting it
        if (Array.isArray(history)) {
          setMessages(history);
        } else {
          console.error("History response is not an array:", history);
          // Set empty array if response is not valid
          setMessages([]);

          // Show a toast to inform the user
          toast({
            title: "Ошибка формата данных",
            description: "Получен недопустимый формат данных с сервера.",
            variant: "destructive",
          });
        }

        setIsLoading(false);
      } catch (error) {
        console.error("Failed to initialize chat:", error);
        setIsLoading(false);
        toast({
          title: "Ошибка соединения",
          description: "Не удалось подключиться к сетевому шлюзу.",
          variant: "destructive",
        });
      }
    };

    initializeChat();
  }, [toast]);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Robot talking animation when assistant is sending a message
  useEffect(() => {
    // Find the last assistant message
    const lastAssistantMessage = [...messages]
      .reverse()
      .find((m) => m.role === "assistant");

    if (lastAssistantMessage && !isEvaluating) {
      // Simulate talking based on message length
      setIsRobotTalking(true);
      const talkDuration = Math.min(
        lastAssistantMessage.content.length * 50,
        3000
      );

      const timer = setTimeout(() => {
        setIsRobotTalking(false);
      }, talkDuration);

      return () => clearTimeout(timer);
    }
  }, [messages, isEvaluating]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputMessage.trim() || isSending) return;

    // Add user message to chat
    const userMessage = { role: "user" as const, content: inputMessage };
    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");

    try {
      setIsSending(true);

      // Send message to API
      const response = await sendChatMessage(inputMessage);

      // Add assistant response to chat
      setMessages((prev) => [
        ...prev,
        { role: "assistant" as const, content: response.response },
      ]);

      // Check if this is the last message
      if (response.last) {
        setIsEvaluating(true);

        // Wait a moment before evaluating for UX
        setTimeout(async () => {
          try {
            const result = await getEvaluationResult();
            setEvaluationResult(result.decision);
          } catch (error) {
            console.error("Evaluation failed:", error);
            toast({
              title: "Ошибка оценки",
              description:
                "Не удалось определить доступ к сети. Пожалуйста, попробуйте снова.",
              variant: "destructive",
            });
            setIsEvaluating(false);
          }
        }, 3000);
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      toast({
        title: "Ошибка сообщения",
        description:
          "Не удалось отправить сообщение. Пожалуйста, попробуйте снова.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-background/80 text-foreground p-4 overflow-hidden">
      <main className="flex-1 flex flex-col items-center justify-between max-w-3xl mx-auto w-full">
        {evaluationResult ? (
          <div className="w-full max-w-md mx-auto mt-12 flex flex-col items-center">
            <AnimatedRobot
              isTalking={false}
              isThinking={false}
              isCelebrating={evaluationResult.access}
              isDenied={!evaluationResult.access}
            />
            <div className="mt-8 w-full">
              <AccessResult
                isGranted={evaluationResult.access}
                reason={evaluationResult.reason}
              />
            </div>
          </div>
        ) : (
          <>
            <div className="flex justify-center mb-4 mt-12">
              <AnimatedRobot
                isTalking={isRobotTalking}
                isThinking={isEvaluating || isLoading}
              />
            </div>

            <div
              ref={chatContainerRef}
              className="flex-1 w-full bg-card rounded-xl p-4 mb-4 overflow-y-auto scrollbar-hide shadow-lg"
            >
              {isLoading ? (
                <div className="flex flex-col justify-center items-center h-full space-y-4">
                  <Loader className="h-8 w-8 text-primary animate-spin" />
                  <p className="text-muted-foreground animate-pulse">
                    Устанавливаем соединение...
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex flex-col space-y-2">
                    {messages.map((message, index) => (
                      <MessageBubble
                        key={index}
                        content={message.content}
                        isUser={message.role === "user"}
                        isLast={
                          index === messages.length - 1 &&
                          message.role === "assistant"
                        }
                      />
                    ))}
                    {isSending && (
                      <div className="flex justify-start mb-4">
                        <div className="flex items-center space-x-2 bg-secondary text-secondary-foreground rounded-2xl rounded-tl-none px-4 py-2 animate-pulse">
                          <div
                            className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                            style={{ animationDelay: "0s" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                            style={{ animationDelay: "0.4s" }}
                          ></div>
                        </div>
                      </div>
                    )}
                    {isEvaluating && (
                      <div className="flex justify-center mt-4">
                        <div className="flex flex-col items-center space-y-3 bg-secondary/50 text-secondary-foreground rounded-xl p-4 animate-pulse">
                          <Loader className="h-6 w-6 text-primary animate-spin" />
                          <p className="text-sm">Оценка запроса доступа...</p>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </>
              )}
            </div>

            <form
              onSubmit={handleSendMessage}
              className="w-full flex space-x-2"
            >
              <Input
                type="text"
                placeholder="Введите ваше сообщение..."
                className="text-lg py-6 ghost-input bg-card/50 border-primary/20"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                disabled={isLoading || isEvaluating}
              />
              <Button
                type="submit"
                className="bg-primary hover:bg-primary/80 text-lg px-6 py-6"
                disabled={
                  !inputMessage.trim() || isLoading || isSending || isEvaluating
                }
              >
                {isSending ? (
                  <Loader className="h-5 w-5 animate-spin" />
                ) : (
                  "Отправить"
                )}
              </Button>
            </form>
          </>
        )}
      </main>
    </div>
  );
};

export default Index;
