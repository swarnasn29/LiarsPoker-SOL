import type { Metadata } from "next";
import { Jersey_10 } from "next/font/google";
import "./globals.css";
import ClientWalletProvider from "./components/ClientWalletProvider";
import { Sidebar } from "./components/Sidebar";
import { SolanaProvider } from "./context/SolanaContext";

const jersey10 = Jersey_10({
  weight: "400",
  variable: "--font-jersey-10",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LiarsPoker",
  description: "A historical bluffing game",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${jersey10.variable} ${jersey10.variable}`}>
        <ClientWalletProvider>
          <SolanaProvider>
            <div className="flex">

            <div className="p-5 px-12">
              <Sidebar />
            </div>
            
              <main className="flex-1">{children}</main>
            </div>
            
          </SolanaProvider>
        </ClientWalletProvider>
      </body>
    </html>
  );
}
