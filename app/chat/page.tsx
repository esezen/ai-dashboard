"use client";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ModelSelector } from "@/components/model-selector";
import {
  ChangeEvent,
  KeyboardEvent,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import AppContext from "@/hooks/appContext";
import Markdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

const convertQuestionToChatName = (question: string) =>
  question.split(" ").slice(0, 3).join(" ");

export default function Chat() {
  const [userContent, setUserContent] = useState("");
  const { state, dispatch } = useContext(AppContext);
  const {
    allChats,
    activeChatId = "",
    selectedModel,
    openAIClient,
  } = state || {};
  const messages = allChats?.[activeChatId]?.messages;

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && dispatch) {
      const newMessage: ChatCompletionMessageParam = {
        role: "user",
        content: userContent,
      };
      let newAllChats;

      if (messages && allChats) {
        dispatch({
          type: "SET_ACTIVE_CHAT",
          payload: { messages: [...messages, newMessage] },
        });
      } else {
        const chatId = convertQuestionToChatName(userContent);

        newAllChats = {
          ...allChats,
          [chatId]: {
            messages: [newMessage],
            model: selectedModel,
          },
        };
        dispatch({
          type: "SET_ALL_CHATS",
          payload: { allChats: newAllChats },
        });
        dispatch({
          type: "SET_ACTIVE_CHAT_ID",
          payload: { activeChatId: chatId },
        });
      }

      setUserContent("");
    }
  };

  const handleOnChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target) {
      setUserContent(event.target?.value);
    }
  };

  useEffect(() => {
    const fetchChat = async () => {
      if (openAIClient && selectedModel && messages?.length) {
        const openAIResponse = await openAIClient.chat.completions.create({
          messages,
          model: selectedModel,
        });
        const newMessage: ChatCompletionMessageParam =
          openAIResponse.choices[0].message;
        if (dispatch && messages?.length) {
          dispatch({
            type: "SET_ACTIVE_CHAT",
            payload: { messages: [...messages, newMessage] },
          });
        }
      }
    };

    if (
      activeChatId &&
      allChats &&
      dispatch &&
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
          <Input
            placeholder="Your question"
            className="w-full h-12"
            value={userContent}
            onKeyDown={handleKeyDown}
            onChange={handleOnChange}
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
                {message.content}
              </Markdown>
            </div>
          ))}
        </ScrollArea>
      </div>
    </div>
  );
}
