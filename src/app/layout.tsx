import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { AuthProvider } from "@/lib/controllers/authcontroller"; // 1. Importar o AuthProvider

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
    <html lang="pt-br">
      <body>
        {/* 2. Envolver a aplicação com o AuthProvider */}
        <AuthProvider>
          <Header />
            {children}
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}

