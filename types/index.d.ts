export interface AllChats {
  [name: string]: {
    messages: ChatCompletionMessageParam[];
    model: string;
  };
}

export interface Action {
  type: string;
  payload?: { [key: string]: any };
}

export interface GlobalState {
  allChats: AllChats;
  models: string[];
  activeChatId: string;
  localSyncStatus: string;
  selectedModel: string;
}
