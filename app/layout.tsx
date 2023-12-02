"use client";

import "./globals.css";
import { Inter } from "next/font/google";
import { useEffect, useLayoutEffect, useReducer } from "react";
import { Sidebar } from "@/components/sidebar";
import AppContext from "@/hooks/appContext";
import { Action, GlobalState } from "@/types";

const inter = Inter({ subsets: ["latin"] });
const initialState = {
  allChats: {},
  models: ["gpt-3.5-turbo-1106", "gpt-4-1106-preview"],
  activeChatId: "",
  localSyncStatus: "STALE",
  selectedModel: "gpt-3.5-turbo-1106",
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
      }
      return state;
    },
    initialState,
  );

  useLayoutEffect(() => {
    const allChatsString = localStorage?.getItem("allChats");

    if (dispatch) {
      if (allChatsString) {
        dispatch({
          type: "SET_ALL_CHATS",
          payload: { allChats: JSON.parse(allChatsString) },
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
            <main className="flex-grow">{children}</main>
          </div>
        </AppContext.Provider>
      </body>
    </html>
  );
}
