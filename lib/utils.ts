import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function processChunks(value: Uint8Array) {
  return new TextDecoder("utf-8")
    .decode(value)
    .split("\n")
    .map((c) => c.replace(/^data: /, ""))
    .filter((chunk) => chunk && chunk !== "[DONE]")
    .map((chunk) => JSON.parse(chunk).choices[0].delta.content)
    .join("");
}

export async function processStream(
  reader: ReadableStreamDefaultReader,
  chunkCallback: (partialMessage: string) => void,
  streamFinishedCallback: () => void,
) {
  const { done, value } = await reader.read();

  if (done) {
    streamFinishedCallback();

    return;
  }

  const parsedResponse = processChunks(value);
  chunkCallback(parsedResponse);
  processStream(reader, chunkCallback, streamFinishedCallback);
}
