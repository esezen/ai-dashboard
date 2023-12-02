"use client";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AppContext from "@/hooks/appContext";
import { useContext } from "react";

export function ModelSelector({ className }: { className: string }) {
  const { state, dispatch } = useContext(AppContext);
  const { models, selectedModel } = state || {};

  const handleOnChange = (value: string) => {
    if (dispatch) {
      dispatch({
        type: "SET_SELECTED_MODEL",
        payload: { selectedModel: value },
      });
    }
  };

  return (
    <div className={className}>
      <Select value={selectedModel} onValueChange={handleOnChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Model" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {models?.map((model) => (
              <SelectItem key={model} value={model}>
                {model}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
