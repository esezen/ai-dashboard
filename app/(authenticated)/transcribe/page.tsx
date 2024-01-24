"use client";
import { useDropzone } from "react-dropzone";
import { useContext, useEffect, useState } from "react";
import AppContext from "@/components/app-context";
import { Button } from "@/components/ui/button";

export default function Transcribe() {
  const [transcription, setTranscription] = useState("");
  const [acceptedFileName, setAcceptedFileName] = useState("");
  const { state, dispatch } = useContext(AppContext);
  const { apiKey, apiStatus } = state || {};

  const { acceptedFiles, getRootProps, getInputProps } = useDropzone({
    maxFiles: 1,
    accept: {
      "audio/mpeg": [".mp3", ".mp4", ".m4a"],
    },
    maxSize: 25000000,
    multiple: false,
  });
  const firstFile = acceptedFiles?.[0];

  useEffect(() => {
    const fetchChat = async () => {
      if (apiKey && firstFile && dispatch) {
        dispatch({ type: "SET_API_PENDING" });

        const formData = new FormData();
        formData.append("file", firstFile);
        formData.append("model", "whisper-1");

        const response = await fetch(
          "https://api.openai.com/v1/audio/transcriptions",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${apiKey}`,
            },
            body: formData,
          },
        );

        const json = await response.json();
        setTranscription(json?.text);
        setAcceptedFileName(firstFile.name.split(".").slice(0, -1).join("."));
        dispatch({ type: "SET_API_RESOLVED" });
      }
    };

    if (firstFile) {
      console.log("Calling OpenAI");
      fetchChat();
    }

    // eslint-disable-next-line
  }, [firstFile]);

  const handleDownload = () => {
    const link = document.createElement("a");
    const file = new Blob([transcription], { type: "text/plain" });

    link.href = URL.createObjectURL(file);
    link.download = `${acceptedFileName}.txt`;

    link.click();
    URL.revokeObjectURL(link.href);
  };
  return (
    <div className="flex-grow w-full h-screen">
      <div className="h-16 w-full grid items-center relative">
        <h1 className="text-center">Transcribe</h1>
      </div>
      <div className="w-2/5 mx-auto flex flex-col p-10 h-[calc(100%-4rem)]">
        {apiStatus === "PENDING" && <div className="spinner"></div>}
        <div className="aspect-square w-full mx-auto rounded-lg drop-container flex items-center justify-center">
          <div {...getRootProps({ className: "dropzone" })}>
            <input {...getInputProps()} />
            <p>Drag files here or click to open file picker</p>
          </div>
        </div>
        {transcription && (
          <div>
            <p className="mt-4 mb-2">Transcription</p>
            <p>{transcription}</p>
            <Button onClick={handleDownload} className="mt-2">
              Click to download the transcription
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
