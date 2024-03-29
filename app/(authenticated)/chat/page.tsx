"use client";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ModelSelector } from "@/components/model-selector";
import {
  ChangeEvent,
  KeyboardEvent,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import Markdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { processStream } from "@/lib/utils";
import { useNewProjectStore } from "@/lib/zustand";

export default function Chat() {
  const {
    allChats,
    activeChatId,
    selectedModel,
    apiKey,
    apiStatus,
    setAllChats,
    setActiveChatId,
    setActiveChat,
    setApiStatus,
  } = useNewProjectStore();
  const [userContent, setUserContent] = useState("");
  const messages = allChats?.[activeChatId]?.messages;

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();

      const newMessage: ChatCompletionMessageParam = {
        role: "user",
        content: userContent,
      };
      let newAllChats;

      if (messages && allChats) {
        setActiveChat([...messages, newMessage]);
      } else {
        const chatId = crypto.randomUUID();

        newAllChats = {
          ...allChats,
          [chatId]: {
            messages: [newMessage],
            model: selectedModel,
          },
        };

        setAllChats(newAllChats);
        setActiveChatId(chatId);
      }

      setUserContent("");
    }
  };

  const handleOnChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    if (event.target) {
      setUserContent(event.target?.value);
    }
  };

  useEffect(() => {
    const fetchChat = async () => {
      if (apiKey && selectedModel && messages?.length) {
        setApiStatus("PENDING");

        const response = await fetch(
          "https://api.openai.com/v1/chat/completions",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: selectedModel,
              messages: [
                {
                  role: "system",
                  content:
                    "You are a helpful assistant. Be clear and concise with your anwers. If you need clarification about a question, ask before giving a full answer. Do not give long explanations unless explicity asked.",
                },
                ...messages,
              ],
              stream: true,
            }),
          },
        );

        if (response.ok && response.body) {
          const reader = response.body.getReader();
          let completeResponse = "";

          processStream(
            reader,
            (partialMessage: string) => {
              completeResponse += partialMessage;
              setActiveChat([
                ...messages,
                {
                  role: "assistant",
                  content: completeResponse,
                },
              ]);
            },
            () => {
              setApiStatus("RESOLVED");
            },
          );
        }
      }
    };

    if (
      activeChatId &&
      allChats &&
      messages?.length &&
      messages.at(-1)?.role !== "assistant"
    ) {
      console.log("Calling OpenAI");
      fetchChat();
    }

    // eslint-disable-next-line
  }, [messages]);

  const scrollRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (scrollRef?.current) {
      const innerScrollElement = scrollRef.current.querySelector(
        "[data-radix-scroll-area-viewport]",
      );
      if (innerScrollElement) {
        innerScrollElement.scrollTop = innerScrollElement.scrollHeight;
      }
    }
  });

  return (
    <div className="flex-grow w-full h-screen">
      <div className="h-16 w-full grid items-center relative">
        <ModelSelector className="absolute top-3 left-3" />
        <h1 className="text-center">Chat</h1>
      </div>
      <div className="w-full flex flex-col-reverse p-10 h-[calc(100%-4rem)]">
        <div className="mx-auto w-2/4">
          {apiStatus === "PENDING" && <div className="spinner"></div>}
          <Textarea
            placeholder="Your question"
            className="w-full h-12 resize-none"
            value={userContent}
            onKeyDown={handleKeyDown}
            onChange={handleOnChange}
            disabled={apiStatus === "PENDING"}
          />
        </div>
        <ScrollArea className="w-full mx-auto h-full mb-16" ref={scrollRef}>
          {allChats?.[activeChatId]?.messages.map((message, index) => (
            <div
              key={index}
              className={`${
                message.role === "user" ? "text-right" : ""
              } mb-8 p-4 w-4/6 mx-auto`}
            >
              <h3 className="mb-2 font-bold">
                {message.role === "user" ? "You" : "ChatGPT"}
              </h3>
              <Markdown
                components={{
                  code(props) {
                    const { ref, children, className, node, ...rest } = props;
                    const match = /language-(\w+)/.exec(className || "");
                    return match ? (
                      <SyntaxHighlighter
                        // eslint-disable-next-line react/no-children-prop
                        children={String(children).replace(/\n$/, "")}
                        {...rest}
                        PreTag="div"
                        language={match[1]}
                        style={oneDark}
                      />
                    ) : (
                      <code {...{ ...rest, ref }} className={className}>
                        {children}
                      </code>
                    );
                  },
                }}
              >
                {message.content.replace("\n", "\n\n")}
              </Markdown>
            </div>
          ))}
        </ScrollArea>
      </div>
    </div>
  );
}
