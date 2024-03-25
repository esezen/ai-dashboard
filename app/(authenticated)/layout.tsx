"use client";

import "@/app/globals.css";
import { useState, useEffect, useLayoutEffect } from "react";
import { Sidebar } from "@/components/sidebar";
import { createBrowserClient } from "@supabase/ssr";
import { redirect } from "next/navigation";
import { Session } from "@supabase/supabase-js";
import { useNewProjectStore } from "@/lib/zustand";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const {
    allChats,
    localSyncStatus,
    allImages,
    setAllChats,
    setAllImages,
    setOpenAiKey,
    setLocalSyncStatus,
  } = useNewProjectStore();
  const [session, setSession] = useState<Session | null>(null);
  const [sessionFetched, setSessionFetched] = useState(false);

  useLayoutEffect(() => {
    const allChatsString = localStorage?.getItem("allChats");
    const allImagesString = localStorage?.getItem("allImages");
    const apiKey = localStorage?.getItem("OPEN_AI_KEY");

    if (allChatsString) {
      setAllChats(JSON.parse(allChatsString));
    }

    if (allImagesString) {
      setAllImages(JSON.parse(allImagesString));
    }

    if (apiKey) {
      setOpenAiKey(apiKey);
    }

    setLocalSyncStatus("UPDATED");
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (localSyncStatus === "UPDATED") {
      localStorage?.setItem("allChats", JSON.stringify(allChats));
    }
  }, [allChats, localSyncStatus]);

  useEffect(() => {
    if (localSyncStatus === "UPDATED") {
      localStorage?.setItem("allImages", JSON.stringify(allImages));
    }
  }, [allImages, localSyncStatus]);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setSessionFetched(true);
      console.log(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, session) => {
      setSession(session);
      setSessionFetched(true);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  if (sessionFetched && !session?.user) {
    redirect("/login");
  }

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-grow bg-slate-900">{children}</main>
    </div>
  );
}
