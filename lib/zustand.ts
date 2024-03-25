import { AllChats, AllImages } from "@/types";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import { create } from "zustand";
import { combine, devtools } from "zustand/middleware";

const initialState = {
  allChats: {} as AllChats,
  allImages: {} as AllImages,
  models: ["gpt-3.5-turbo-1106", "gpt-4-0125-preview"],
  activeChatId: "",
  activeImageId: "",
  localSyncStatus: "STALE",
  selectedModel: "gpt-4-0125-preview",
  apiKey: "",
  apiStatus: "IDLE",
  error: null,
};

export const useNewProjectStore = create(
  devtools(
    combine(initialState, (set) => ({
      setActiveChat: (messages: ChatCompletionMessageParam[]) =>
        set((state) => ({
          allChats: {
            ...state.allChats,
            [state.activeChatId]: {
              ...state.allChats[state.activeChatId],
              messages,
            },
          },
        })),
      setAllChats: (allChats: AllChats) => set({ allChats }),
      setActiveChatId: (activeChatId: string) =>
        set((state) => ({
          activeChatId,
          selectedModel: state.allChats[activeChatId].model,
        })),
      setNewChat: () =>
        set({
          activeChatId: initialState.activeChatId,
          selectedModel: initialState.selectedModel,
        }),
      removeChat: (chatId: string) =>
        set((state) => {
          const isDeletingCurrentChat = state.activeChatId === chatId;
          const { [chatId]: chatToDelete, ...restAllChats } = state.allChats;

          return {
            allChats: restAllChats,
            activeChatId: isDeletingCurrentChat
              ? initialState.activeChatId
              : state.activeChatId,
          };
        }),
      setSelectedModel: (selectedModel: string) => set({ selectedModel }),
      setOpenAiKey: (key: string) => set({ apiKey: key }),
      setLocalSyncStatus: (localSyncStatus: string) => set({ localSyncStatus }),
      setApiStatus: (apiStatus: string) => set({ apiStatus }),
      setAllImages: (allImages: AllImages) => set({ allImages }),
      setActiveImage: (prompt: string, revisedPrompt: string, base64: string) =>
        set((state) => ({
          allImages: {
            ...state.allImages,
            [state.activeImageId]: {
              prompt,
              revisedPrompt,
              base64,
            },
          },
        })),
      setActiveImageId: (activeImageId: string) =>
        set({
          activeImageId,
        }),
      setNewImage: () =>
        set({
          activeImageId: initialState.activeImageId,
        }),
      removeImage: (imageId: string) =>
        set((state) => {
          const isDeletingCurrentImage = state.activeImageId === imageId;
          const { [imageId]: imageToDelete, ...restAllImages } =
            state.allImages;

          return {
            allImages: restAllImages,
            activeImageId: isDeletingCurrentImage
              ? initialState.activeImageId
              : state.activeImageId,
          };
        }),
      reset: () => set(initialState),
    })),
  ),
);
