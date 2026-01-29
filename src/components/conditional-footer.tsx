"use client";

import { useAuth } from "@/lib/controllers/authcontroller";
import { Footer } from "./footer";

export function ConditionalFooter() {
  const { account, currentUser } = useAuth();
  const userIsLoggedIn = !!currentUser && !!account;

  // Não mostra o Footer quando o usuário está logado
  if (userIsLoggedIn) {
    return null;
  }

  return <Footer />;
}
