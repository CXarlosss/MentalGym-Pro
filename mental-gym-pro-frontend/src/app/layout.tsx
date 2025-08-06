import "../styles/globals.css";
import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Mental Gym Pro",
  description: "Entrena tu cuerpo y tu mente",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <Header />
        <main className="min-h-screen px-4 py-8">{children}</main>
        <Footer />
      </body>
    </html>
  );
}