"use server";

import { generateCodeVerifier, generateState } from "arctic";

import { Argon2id } from "oslo/password";
import { SignInSchema } from "@/components/user/sign-in-form";
import { SignUpSchema } from "@/components/user/sign-up-form";
import { cookies } from "next/headers";
import { googleOAuthClient } from "@/lib/googleOauth";
import { lucia } from "@/lib/lucia";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { z } from "zod";

export const signUp = async (values: z.infer<typeof SignUpSchema>) => {
  try {
    // if user already exists, throw error
    const existingUser = await prisma.user.findUnique({
      where: {
        email: values.email,
      },
    });

    if (existingUser) {
      return { error: "User already exists.", success: false };
    }

    const hashedPassword = await new Argon2id().hash(values.password);

    const user = await prisma.user.create({
      data: {
        name: values.name,
        email: values.email,
        hashedPassword,
      },
    });

    const session = await lucia.createSession(user.id, {});
    const sessionCookie = await lucia.createSessionCookie(session.id);

    cookies().set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes
    );
    return { success: true };
  } catch (error) {
    return { error: "Something went wrong.", success: false };
  }
};

export const signIn = async (values: z.infer<typeof SignInSchema>) => {
  const user = await prisma.user.findUnique({
    where: {
      email: values.email,
    },
  });

  if (!user || !user.hashedPassword) {
    return { error: "Invalid email or password.", success: false };
  }

  const passwordMatch = await new Argon2id().verify(
    user.hashedPassword,
    values.password
  );

  if (!passwordMatch) {
    return { error: "Invalid email or password.", success: false };
  }

  const session = await lucia.createSession(user.id, {});
  const sessionCookie = await lucia.createSessionCookie(session.id);

  cookies().set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes
  );

  return { success: true };
};

export const SignOut = async () => {
  const sessionCookie = await lucia.createBlankSessionCookie();

  cookies().set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes
  );

  return redirect("/sign-in");
};

export const getGoogleOauthConsentUrl = async () => {
  try {
    const state = generateState();
    const codeVerifier = generateCodeVerifier();

    cookies().set("codeVerifier", codeVerifier, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });

    cookies().set("state", state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });

    const authUrl = await googleOAuthClient.createAuthorizationURL(
      state,
      codeVerifier,
      {
        scopes: ["email", "profile"],
      }
    );

    return { success: true, url: authUrl.toString() };
  } catch (error) {
    return { success: false, error: "Something went wrong." };
  }
};
