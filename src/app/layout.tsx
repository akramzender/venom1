import type { Metadata } from "next";
import { Geist, Geist_Mono, Manrope } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/index";
import ReactQueryProvider from "@/react-query";
const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
});
export const metadata: Metadata = {
  title: "Venom",
  description: "AI videos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
      <body className={`${manrope.className}bg-[rgb(2,170,120)] `}>
        <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem
        disableTransitionOnChange
        >
          <ReactQueryProvider>
            {children}
          </ReactQueryProvider>
        </ThemeProvider>
        
        
      </body>
    </html>
    </ClerkProvider>
    
  );
}
