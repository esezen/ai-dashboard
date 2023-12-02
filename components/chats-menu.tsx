"use client";

import { Button } from "@/components/ui/button";
import AppContext from "@/hooks/appContext";
import { useContext } from "react";

export function ChatsMenu() {
  const { state, dispatch } = useContext(AppContext);
  const { activeChatId, allChats = {} } = state || {};
  const handleChatClick = (key: string) => {
    if (dispatch) {
      dispatch({ type: "SET_ACTIVE_CHAT_ID", payload: { activeChatId: key } });
    }
  };

  return (
    <div className="space-y-4 py-4">
      <div className="px-3 py-2">
        <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
          Chats
        </h2>
        <div className="space-y-1">
          {Object.keys(allChats).map((key) => (
            <Button
              key={key}
              onClick={() => handleChatClick(key)}
              variant={`${activeChatId === key ? "secondary" : "ghost"}`}
              className="w-full justify-start"
            >
              {key}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
