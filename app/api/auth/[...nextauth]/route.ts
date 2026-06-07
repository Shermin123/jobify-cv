import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { supabase } from "@/lib/supabase";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "credentials",

      credentials: {
        email: {
          label: "Email",
          type: "text",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const cleanEmail = credentials.email.toLowerCase().trim();

        const { data: user, error } = await supabase
          .from("users")
          .select("id, name, email, password_hash")
          .eq("email", cleanEmail)
          .maybeSingle();

        if (error || !user?.password_hash) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password_hash
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          name: user.name || "Jobify User",
          email: user.email,
        };
      },
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" && user?.email) {
        const cleanEmail = user.email.toLowerCase().trim();

        const { data: existingUser } = await supabase
          .from("users")
          .select("id")
          .eq("email", cleanEmail)
          .maybeSingle();

        if (!existingUser) {
          await supabase.from("users").insert({
            email: cleanEmail,
            name: user.name || "Google User",
            provider: "google",
          });
        }
      }

      return true;
    },
  },

  session: {
    strategy: "jwt",
  },

  pages: {
    signIn: "/login",
  },

  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };