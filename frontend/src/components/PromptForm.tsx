import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { PromptSettings } from "@/services/apiService";

interface PromptFormProps {
  settings: PromptSettings;
  onUpdate: (settings: {
    criteria: string;
    topic: string;
    personality: string;
  }) => void;
  isLoading: boolean;
}

const PromptForm: React.FC<PromptFormProps> = ({
  settings,
  onUpdate,
  isLoading,
}) => {
  const [criteria, setCriteria] = React.useState(settings.criteria);
  const [topic, setTopic] = React.useState(settings.topic);
  const [personality, setPersonality] = React.useState(settings.personality);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!criteria.trim() || !topic.trim() || !personality.trim()) {
      toast({
        title: "Ошибка валидации",
        description: "Все поля должны быть заполнены",
        variant: "destructive",
      });
      return;
    }

    onUpdate({ criteria, topic, personality });
  };

  return (
    <Card className="w-full animate-fade-in">
      <CardHeader>
        <CardTitle>Настройки бота</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="criteria" className="text-sm font-medium">
              Критерии
            </label>
            <Textarea
              id="criteria"
              value={criteria}
              onChange={(e) => setCriteria(e.target.value)}
              placeholder="Введите критерии доступа..."
              className="min-h-[100px]"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="topic" className="text-sm font-medium">
              Тема
            </label>
            <Input
              id="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Введите тему разговора..."
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="personality" className="text-sm font-medium">
              Личность
            </label>
            <Textarea
              id="personality"
              value={personality}
              onChange={(e) => setPersonality(e.target.value)}
              placeholder="Опишите личность бота..."
              className="min-h-[100px]"
              disabled={isLoading}
            />
          </div>
        </CardContent>

        <CardFooter>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Обновление..." : "Обновить настройки"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default PromptForm;
