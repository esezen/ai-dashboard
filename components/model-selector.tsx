"use client";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNewProjectStore } from "@/lib/zustand";

export function ModelSelector({ className }: { className: string }) {
  const { models, selectedModel, setSelectedModel } = useNewProjectStore();

  const handleOnChange = (value: string) => {
    setSelectedModel(value);
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
