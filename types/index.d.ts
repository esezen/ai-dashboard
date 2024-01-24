import OpenAI from "openai";

export interface AllChats {
  [name: string]: {
    messages: ChatCompletionMessageParam[];
    model: string;
  };
}

export interface AllImages {
  [name: string]: {
    prompt: string;
    base64?: string;
    revisedPrompt?: string;
  };
}

export interface Action {
  type: string;
  payload?: { [key: string]: any };
}

export interface GlobalState {
  allChats: AllChats;
  allImages: AllImages;
  models: string[];
  activeChatId: string;
  activeImageId: string;
  localSyncStatus: string;
  selectedModel: string;
  apiKey: string;
  apiStatus: "IDLE" | "PENDING" | "RESOLVED" | "REJECTED";
  error: string | null;
}

export type AuthFormType = z.infer<typeof authFormSchema>;
