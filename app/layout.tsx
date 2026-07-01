import type { Metadata, Viewport } from "next";
import "./globals.css";
import NavBar from "./nav-bar";

export const metadata: Metadata = {
  title: "Personal Gym",
  description: "Registro de treinos, exercícios e progresso",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-neutral-950 text-neutral-100">
        <main className="flex-1 pb-20 max-w-2xl mx-auto w-full px-4 pt-6">
          {children}
        </main>
        <NavBar />
      </body>
    </html>
  );
}
