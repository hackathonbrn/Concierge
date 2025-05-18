export type Message = {
  role: "assistant" | "user";
  content: string;
};

export type ChatResponse = {
  response: string;
  last?: boolean;
};

export type EvaluationResult = {
  decision: {
    access: boolean;
    reason: string;
  };
};

export type PromptSettings = {
  criteria: string;
  topic: string;
  personality: string;
  plan: string;
};

const API_URL = "http://192.168.31.43:3000";

// Get chat history
export async function getChatHistory(): Promise<Message[]> {
  try {
    const response = await fetch(`${API_URL}/history`);
    if (!response.ok) {
      throw new Error("Failed to fetch chat history");
    }

    const data = await response.json();

    // Check if the response has a history property that contains the array
    if (data && typeof data === "object" && Array.isArray(data.history)) {
      // Validate each message has the expected structure
      const validatedData = data.history.filter(
        (message): message is Message => {
          const isValid =
            message &&
            typeof message === "object" &&
            (message.role === "assistant" || message.role === "user") &&
            typeof message.content === "string";

          if (!isValid) {
            console.error("Invalid message format:", message);
          }

          return isValid;
        }
      );

      return validatedData;
    } else {
      console.error(
        "History API did not return an object with history array:",
        data
      );
      return []; // Return empty array as fallback
    }
  } catch (error) {
    console.error("Error fetching chat history:", error);
    return [];
  }
}

// Send a message to chat
export async function sendChatMessage(message: string): Promise<ChatResponse> {
  try {
    const response = await fetch(`${API_URL}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      throw new Error("Failed to send message");
    }

    return await response.json();
  } catch (error) {
    console.error("Error sending message:", error);
    return {
      response:
        "Sorry, I'm having trouble connecting to the network. Please try again.",
    };
  }
}

// Get evaluation result
export async function getEvaluationResult(): Promise<EvaluationResult> {
  try {
    const response = await fetch(`${API_URL}/evaluate`);
    if (!response.ok) {
      throw new Error("Failed to get evaluation result");
    }
    return await response.json();
  } catch (error) {
    console.error("Error getting evaluation:", error);
    return {
      decision: {
        access: false,
        reason: "Error evaluating access. Please try again later.",
      },
    };
  }
}

// Get current prompt settings
export async function getPromptSettings(
  token: string
): Promise<PromptSettings | null> {
  try {
    const response = await fetch(`${API_URL}/admin/prompt`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to get prompt settings");
    }

    return await response.json();
  } catch (error) {
    console.error("Error getting prompt settings:", error);
    return null;
  }
}

// Update prompt settings
export async function updatePromptSettings(
  token: string,
  settings: { criteria: string; topic: string; personality: string }
): Promise<PromptSettings | null> {
  try {
    const response = await fetch(`${API_URL}/admin/prompt`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(settings),
    });

    if (!response.ok) {
      throw new Error("Failed to update prompt settings");
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating prompt settings:", error);
    return null;
  }
}
