"use server";

import { signIn } from "@/lib/auth";
import { AuthError } from "next-auth";

export async function loginAction(
  _prevState: { erro?: string } | undefined,
  formData: FormData
): Promise<{ erro?: string } | undefined> {
  const email = formData.get("email");
  const senha = formData.get("senha");
  const callbackUrl = (formData.get("callbackUrl") as string) || "/";

  try {
    await signIn("credentials", {
      email,
      senha,
      redirectTo: callbackUrl,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { erro: "E-mail ou senha inválidos." };
    }
    throw error;
  }
}
