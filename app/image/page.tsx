/* eslint-disable @next/next/no-img-element */
"use client";
import { Textarea } from "@/components/ui/textarea";
import {
  ChangeEvent,
  KeyboardEvent,
  useContext,
  useEffect,
  useState,
} from "react";
import AppContext from "@/hooks/appContext";

export default function Image() {
  const [userContent, setUserContent] = useState("");
  const { state, dispatch } = useContext(AppContext);
  const { allImages, activeImageId = "", apiKey, apiStatus } = state || {};
  const currentImage = allImages?.[activeImageId];
  const { prompt, base64, revisedPrompt } = currentImage || {};

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey && dispatch) {
      event.preventDefault();

      let newAllImages;

      const imageId = crypto.randomUUID();

      newAllImages = {
        ...allImages,
        [imageId]: {
          prompt: userContent,
        },
      };
      dispatch({
        type: "SET_ALL_IMAGES",
        payload: { allImages: newAllImages },
      });
      dispatch({
        type: "SET_ACTIVE_IMAGE_ID",
        payload: { activeImageId: imageId },
      });

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
      if (apiKey && prompt && dispatch) {
        dispatch({ type: "SET_API_PENDING" });

        const response = await fetch(
          "https://api.openai.com/v1/images/generations ",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "dall-e-3",
              prompt: prompt,
              n: 1,
              size: "1024x1024",
              response_format: "b64_json",
            }),
          },
        );
        const json = await response.json();
        const { data } = json;
        const [generatedImage] = data;
        const { revised_prompt: revisedPrompt, b64_json: base64 } =
          generatedImage;

        if (base64) {
          dispatch({
            type: "SET_ACTIVE_IMAGE",
            payload: { prompt: prompt, base64, revisedPrompt },
          });
          dispatch({ type: "SET_API_RESOLVED" });
        }
      }
    };

    if (activeImageId && allImages && dispatch && prompt && !base64) {
      console.log("Calling OpenAI");
      fetchChat();
    }

    // eslint-disable-next-line
  }, [prompt]);

  return (
    <div className="flex-grow w-full h-screen">
      <div className="h-16 w-full grid items-center relative">
        <h1 className="text-center">Image</h1>
      </div>
      <div className="w-3/5 mx-auto flex flex-col p-10 h-[calc(100%-4rem)]">
        {!base64 ? (
          <Textarea
            placeholder="Prompt"
            className="w-full h-12 resize-none"
            value={userContent}
            onKeyDown={handleKeyDown}
            onChange={handleOnChange}
            disabled={apiStatus === "PENDING"}
          />
        ) : (
          <div className="">
            <img src={`data:image/png;base64,${base64}`} alt="" />
            <p className="my-4">Prompt: {prompt}</p>
            <p>Revised Prompt: {revisedPrompt}</p>
          </div>
        )}
        {apiStatus === "PENDING" && <div className="spinner"></div>}
      </div>
    </div>
  );
}
