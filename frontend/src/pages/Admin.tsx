import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  getPromptSettings,
  updatePromptSettings,
  PromptSettings,
} from "@/services/apiService";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import PromptForm from "@/components/PromptForm";
import AdminLoader from "@/components/AdminLoader";
import MarkdownRenderer from "@/components/MarkdownRenderer";

const Admin: React.FC = () => {
  const [tokenInput, setTokenInput] = useState<string>(
    () => localStorage.getItem("admin_token") || ""
  );
  const [token, setToken] = useState<string>(
    () => localStorage.getItem("admin_token") || ""
  );
  const [settings, setSettings] = useState<PromptSettings | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const { toast } = useToast();

  // Load settings if we have a token
  useEffect(() => {
    if (!token) return;

    const fetchSettings = async () => {
      setIsAuthenticating(true);
      const data = await getPromptSettings(token);

      if (data) {
        setSettings(data);
        setIsAuthenticated(true);
        localStorage.setItem("admin_token", token);
      } else {
        toast({
          title: "Ошибка авторизации",
          description: "Неверный токен или проблемы с сервером",
          variant: "destructive",
        });
        localStorage.removeItem("admin_token");
      }

      setIsAuthenticating(false);
    };

    fetchSettings();
  }, [token, toast]);

  const handleTokenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tokenInput.trim()) {
      // Set the actual token value only when the form is submitted
      setToken(tokenInput);
    }
  };

  const handleUpdateSettings = async (updatedSettings: {
    criteria: string;
    topic: string;
    personality: string;
  }) => {
    if (!token) return;

    setIsLoading(true);

    toast({
      title: "Обновление настроек",
      description: "Пожалуйста, подождите...",
    });

    const result = await updatePromptSettings(token, updatedSettings);

    if (result) {
      setSettings(result);
      toast({
        title: "Настройки обновлены",
        description: "Новый план сгенерирован",
      });
    } else {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить настройки",
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };

  if (isAuthenticating) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background to-background/80 text-foreground p-4">
        <AdminLoader />
        <p className="mt-4 text-muted-foreground">Аутентификация...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background to-background/80 text-foreground p-4">
        <Card className="w-full max-w-md animate-scale-in">
          <CardHeader>
            <CardTitle className="text-center">
              Административная панель
            </CardTitle>
            <CardDescription className="text-center">
              Введите ваш токен доступа
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleTokenSubmit} className="space-y-4">
              <Input
                type="password"
                placeholder="Введите токен доступа"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                className="text-center"
              />
              <Button type="submit" className="w-full">
                Войти
              </Button>
              <div className="text-center">
                <Link to="/" className="text-primary hover:underline text-sm">
                  Вернуться на главную
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-background/80 text-foreground p-4">
      <header className="container mx-auto py-4 flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Панель администратора</h1>
        <div className="flex gap-2">
          <Link to="/">
            <Button variant="outline">На главную</Button>
          </Link>
          <Button
            variant="ghost"
            onClick={() => {
              localStorage.removeItem("admin_token");
              setIsAuthenticated(false);
              setToken("");
              setSettings(null);
            }}
          >
            Выйти
          </Button>
        </div>
      </header>

      <main className="container mx-auto flex flex-col md:flex-row gap-8">
        {settings && !isLoading ? (
          <>
            <div className="w-full md:w-1/2">
              <PromptForm
                settings={settings}
                onUpdate={handleUpdateSettings}
                isLoading={isLoading}
              />
            </div>

            <div className="w-full md:w-1/2">
              <Card className="w-full h-full animate-fade-in">
                <CardHeader>
                  <CardTitle>План беседы</CardTitle>
                  <CardDescription>
                    Автоматически сгенерированный план беседы на основе ваших
                    настроек
                  </CardDescription>
                </CardHeader>
                <CardContent className="overflow-auto max-h-[600px]">
                  <MarkdownRenderer
                    content={settings.plan}
                    className="text-sm"
                  />
                </CardContent>
              </Card>
            </div>
          </>
        ) : (
          <div className="w-full flex justify-center">
            <AdminLoader className="my-12" />
          </div>
        )}
      </main>
    </div>
  );
};

export default Admin;
