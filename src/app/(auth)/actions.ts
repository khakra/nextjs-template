"use server";

import { z } from "zod";
import { authClient } from "@/lib/auth-client";

const authFormSchema = z.object({
  email: z.email(),
});

export interface LoginActionState {
  status: "idle" | "in_progress" | "success" | "failed" | "invalid_data";
}

export const login = async (
  _: LoginActionState,
  formData: FormData
): Promise<LoginActionState> => {
  try {
    const validatedData = authFormSchema.parse({
      email: formData.get("email"),
    });

    const { data, error } = await authClient.emailOtp.sendVerificationOtp({
      email: validatedData.email,
      type: "sign-in",
    });

    if (error) {
      return { status: "failed" };
    }

    return { status: "success" };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { status: "invalid_data" };
    }

    return { status: "failed" };
  }
};
