import "./globals.css";
import { Inter } from "next/font/google";
const inter = Inter({ subsets: ["latin"] });
import { Toaster } from "@/components/ui/toaster";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} dark min-h-screen bg-background font-sans antialiased`}
      >
        <div className="min-h-screen">{children}</div>
        <Toaster />
      </body>
    </html>
  );
}
