import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { AuthProvider } from "@/lib/controllers/authcontroller";

export const metadata: Metadata = {
  title: "AIRScan",
  description: "Monitoramento inteligente de ar comprimido",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br" className="scroll-smooth">
      <body className="bg-gray-50">
        <AuthProvider>
          <Header>{children}</Header>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
