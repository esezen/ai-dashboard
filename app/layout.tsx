"use client";

import "./globals.css";
import { Inter } from "next/font/google";
import { useEffect, useLayoutEffect, useReducer } from "react";
import { Sidebar } from "@/components/sidebar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import AppContext from "@/hooks/appContext";
import { Action, GlobalState } from "@/types";
import { AlertCircle } from "lucide-react";

const inter = Inter({ subsets: ["latin"] });

const initialState: GlobalState = {
  allChats: {},
  models: ["gpt-3.5-turbo-1106", "gpt-4-1106-preview"],
  activeChatId: "",
  localSyncStatus: "STALE",
  selectedModel: "gpt-3.5-turbo-1106",
  apiKey: "",
  apiStatus: "IDLE",
  error: null,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
          const isDeletingCurrent = state.activeChatId === chatId;
          const { [chatId]: chatToDelete, ...rest } = state.allChats;
          const newState = {
            ...state,
            allChats: { ...rest },
          };

          if (isDeletingCurrent) {
            newState.activeChatId = initialState.activeChatId;
          }

          return newState;
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
    const apiKey = localStorage?.getItem("OPEN_AI_KEY");

    if (dispatch) {
      if (allChatsString) {
        dispatch({
          type: "SET_ALL_CHATS",
          payload: { allChats: JSON.parse(allChatsString) },
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

  return (
    <html lang="en">
      <body className={`${inter.className} dark min-h-screen`}>
        <AppContext.Provider value={{ state, dispatch }}>
          <div className="flex min-h-screen w-full">
            <Sidebar />
            <main className="flex-grow bg-slate-900">
              {state?.apiKey ? (
                children
              ) : (
                <div className="grid place-items-center h-full w-full ">
                  <Alert className="max-w-xl">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                      Please put your Open AI key to localStorage under
                      &quot;OPEN_AI_KEY&quot;
                    </AlertDescription>
                  </Alert>
                </div>
              )}
            </main>
          </div>
        </AppContext.Provider>
      </body>
    </html>
  );
}
