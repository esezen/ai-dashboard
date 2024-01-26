"use client";

import "@/app/globals.css";
import { useState, useEffect, useLayoutEffect, useReducer } from "react";
import { Sidebar } from "@/components/sidebar";
import AppContext from "@/components/app-context";
import { Action, GlobalState } from "@/types";
import { createBrowserClient } from "@supabase/ssr";
import { redirect } from "next/navigation";
import { Session } from "@supabase/supabase-js";

const initialState: GlobalState = {
  allChats: {},
  allImages: {},
  models: ["gpt-3.5-turbo-1106", "gpt-4-0125-preview"],
  activeChatId: "",
  activeImageId: "",
  localSyncStatus: "STALE",
  selectedModel: "gpt-4-0125-preview",
  apiKey: "",
  apiStatus: "IDLE",
  error: null,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [session, setSession] = useState<Session | null>(null);
  const [sessionFetched, setSessionFetched] = useState(false);
  const [state, dispatch] = useReducer(
    (state: GlobalState, action: Action): GlobalState => {
      switch (action.type) {
        case "SET_ACTIVE_CHAT":
          const { allChats: allChatsOld, activeChatId: activeChatOld } = state;

          return {
            ...state,
            allChats: {
              ...allChatsOld,
              [activeChatOld]: {
                ...allChatsOld[activeChatOld],
                messages: action.payload?.messages,
              },
            },
          };
        case "SET_ALL_CHATS":
          return {
            ...state,
            allChats: action.payload?.allChats,
          };
        case "SET_ACTIVE_CHAT_ID":
          return {
            ...state,
            activeChatId: action.payload?.activeChatId,
            selectedModel: state.allChats[action.payload?.activeChatId].model,
          };
        case "SET_ACTIVE_IMAGE":
          const { allImages: allImagesOld, activeImageId: activeImageIdOld } =
            state;

          return {
            ...state,
            allImages: {
              ...allImagesOld,
              [activeImageIdOld]: {
                prompt: action.payload?.prompt,
                revisedPrompt: action.payload?.revisedPrompt,
                base64: action.payload?.base64,
              },
            },
          };
        case "SET_ALL_IMAGES":
          return {
            ...state,
            allImages: action.payload?.allImages,
          };
        case "SET_ACTIVE_IMAGE_ID":
          return {
            ...state,
            activeImageId: action.payload?.activeImageId,
          };
        case "SET_LOCAL_SYNC_STATUS":
          return {
            ...state,
            localSyncStatus: action.payload?.localSyncStatus,
          };
        case "SET_SELECTED_MODEL":
          return {
            ...state,
            selectedModel: action.payload?.selectedModel,
          };
        case "SET_OPENAI_KEY":
          return {
            ...state,
            apiKey: action.payload?.apiKey,
          };
        case "SET_NEW_CHAT":
          return {
            ...state,
            activeChatId: initialState.activeChatId,
            selectedModel: initialState.selectedModel,
          };
        case "REMOVE_CHAT":
          const chatId = action.payload?.chatId;
          const isDeletingCurrentChat = state.activeChatId === chatId;
          const { [chatId]: chatToDelete, ...restAllChats } = state.allChats;
          const newStateWithRemovedChat = {
            ...state,
            allChats: { ...restAllChats },
          };

          if (isDeletingCurrentChat) {
            newStateWithRemovedChat.activeChatId = initialState.activeChatId;
          }

          return newStateWithRemovedChat;
        case "SET_NEW_IMAGE":
          return {
            ...state,
            activeImageId: initialState.activeImageId,
          };
        case "REMOVE_IMAGE":
          const imageId = action.payload?.imageId;
          const isDeletingCurrentImage = state.activeImageId === imageId;
          const { [imageId]: imageToDelete, ...restAllImages } =
            state.allImages;
          const newStateWithRemovedImage = {
            ...state,
            allImages: { ...restAllImages },
          };

          if (isDeletingCurrentImage) {
            newStateWithRemovedImage.activeImageId = initialState.activeImageId;
          }

          return newStateWithRemovedImage;
        case "SET_API_PENDING":
          return {
            ...state,
            apiStatus: "PENDING",
          };
        case "SET_API_RESOLVED":
          return {
            ...state,
            apiStatus: "RESOLVED",
          };
        case "SET_API_REJECTED":
          return {
            ...state,
            apiStatus: "REJECTED",
            error: action.payload?.error,
          };
      }
      return state;
    },
    initialState,
  );

  useLayoutEffect(() => {
    const allChatsString = localStorage?.getItem("allChats");
    const allImagesString = localStorage?.getItem("allImages");
    const apiKey = localStorage?.getItem("OPEN_AI_KEY");

    if (dispatch) {
      if (allChatsString) {
        dispatch({
          type: "SET_ALL_CHATS",
          payload: { allChats: JSON.parse(allChatsString) },
        });
      }

      if (allImagesString) {
        dispatch({
          type: "SET_ALL_IMAGES",
          payload: { allImages: JSON.parse(allImagesString) },
        });
      }

      if (apiKey) {
        dispatch({
          type: "SET_OPENAI_KEY",
          payload: { apiKey },
        });
      }

      dispatch({
        type: "SET_LOCAL_SYNC_STATUS",
        payload: { localSyncStatus: "UPDATED" },
      });
    }
  }, []);

  useEffect(() => {
    if (state && state.localSyncStatus === "UPDATED") {
      localStorage?.setItem("allChats", JSON.stringify(state.allChats));
    }
  }, [state, state.allChats, state.localSyncStatus]);

  useEffect(() => {
    if (state && state.localSyncStatus === "UPDATED") {
      localStorage?.setItem("allImages", JSON.stringify(state.allImages));
    }
  }, [state, state.localSyncStatus, state.allImages]);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setSessionFetched(true);
      console.log(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, session) => {
      setSession(session);
      setSessionFetched(true);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  if (sessionFetched && !session?.user) {
    redirect("/login");
  }

  return (
    <div className="flex">
      <AppContext.Provider value={{ state, dispatch }}>
        <Sidebar />
        <main className="flex-grow bg-slate-900">{children}</main>
      </AppContext.Provider>
    </div>
  );
}
