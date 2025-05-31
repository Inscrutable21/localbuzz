import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import NavbarWrapper from "@/components/NavbarWrapper";
// import SocialButtons from "@/components/SocialButtons";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "CREAM - Creative Agency",
  description: "Creative solutions for modern businesses",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NavbarWrapper />
        <main className="pt-16">
          {children}
        </main>
        
        {/* Remove the banner from here */}
      </body>
    </html>
  );
}



