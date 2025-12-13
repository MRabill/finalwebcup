import type { Metadata } from "next";
import { Geist, Geist_Mono, Orbitron, Audiowide, Sarpanch, Russo_One, Major_Mono_Display } from "next/font/google";
import "../styles/globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
});

const audiowide = Audiowide({
  variable: "--font-audiowide",
  subsets: ["latin"],
  weight: "400",
});

const sarpanch = Sarpanch({
  variable: "--font-sarpanch",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const russoOne = Russo_One({
  variable: "--font-russo-one",
  subsets: ["latin"],
  weight: "400",
});

const majorMonoDisplay = Major_Mono_Display({
  variable: "--font-major-mono-display",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Welcome to Our Platform | Your Company",
  description: "Empowering developers to build amazing applications with modern tools and technologies",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang= "en" >
    <body className={ `${geistSans.variable} ${geistMono.variable} ${orbitron.variable} ${audiowide.variable} ${sarpanch.variable} ${russoOne.variable} ${majorMonoDisplay.variable}` }>
      { children }
      </body>
      </html>
  );
}
