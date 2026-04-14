import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ChatBot from "@/comps/chatbot";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "C Programming — Visual Learning Engine",
  description: "Interactive visual guide to mastering C programming. Built for engineering students covering all Sem 1 fundamentals with 3D visualizations, voice explanations, and an AI tutor.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <ChatBot/>
      </body>
    </html>
  );
}
