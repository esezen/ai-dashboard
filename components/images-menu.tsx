"use client";

import { Button } from "@/components/ui/button";
import AppContext from "@/hooks/appContext";
import { Trash2 } from "lucide-react";
import { useContext } from "react";

export function ImagesMenu() {
  const { state, dispatch } = useContext(AppContext);
  const { activeImageId, allImages = {} } = state || {};

  const handleChatClick = (key: string) => {
    if (dispatch) {
      if (key !== "new image") {
        dispatch({
          type: "SET_ACTIVE_IMAGE_ID",
          payload: { activeImageId: key },
        });
      } else {
        dispatch({ type: "SET_NEW_IMAGE" });
      }
    }
  };

  const handleRemoveClick = (key: string) => {
    if (dispatch) {
      dispatch({
        type: "REMOVE_IMAGE",
        payload: { imageId: key },
      });
    }
  };

  return (
    <div className="space-y-4 py-4">
      <div className="px-3 py-2">
        <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
          Images
        </h2>
        <div className="space-y-1">
          {Object.entries(allImages).map(([key, value]) => (
            <div className="flex" key={key}>
              <Button
                onClick={() => handleChatClick(key)}
                variant={`${activeImageId === key ? "secondary" : "ghost"}`}
                className="w-full justify-start truncate mr-3"
              >
                {value.prompt}
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
