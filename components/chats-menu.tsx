"use client";

import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useNewProjectStore } from "@/lib/zustand";

export function ChatsMenu() {
  const { allChats, activeChatId, setActiveChatId, setNewChat, removeChat } =
    useNewProjectStore();
  const handleChatClick = (key: string) => {
    if (key !== "new chat") {
      setActiveChatId(key);
    } else {
      setNewChat();
    }
  };

  const handleRemoveClick = (key: string) => {
    removeChat(key);
  };

  return (
    <div className="space-y-4 py-4">
      <div className="px-3 py-2">
        <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
          Chats
        </h2>
        <div className="space-y-1">
          {Object.entries(allChats).map(([key, value]) => (
            <div className="flex" key={key}>
              <Button
                onClick={() => handleChatClick(key)}
                variant={`${activeChatId === key ? "secondary" : "ghost"}`}
                className="w-full justify-start truncate mr-3"
              >
                {value.messages[0].content}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveClick(key)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
        <Button
          onClick={() => handleChatClick("new chat")}
          className="w-full justify-start mt-4"
        >
          {"New chat"}
        </Button>
      </div>
    </div>
  );
}
