import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  createElement,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { router } from "expo-router";
import * as Linking from "expo-linking";
import type { Session } from "@supabase/supabase-js";

import { hasSupabaseConfig, supabase } from "../lib/supabase";

type DevSession = {
  isDevSession: true;
  user: {
    id: string;
    email: string;
  };
};

type AuthSession = Session | DevSession;

type AuthContextValue = {
  loading: boolean;
  session: AuthSession | null;
  isDevSession: boolean;
  hasSupabaseConfig: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  devSignIn: () => void;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [loading, setLoading] = useState(hasSupabaseConfig);
  const [session, setSession] = useState<AuthSession | null>(null);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return undefined;
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      setSession(nextSession);
      if (event === "PASSWORD_RECOVERY") {
        router.replace("/reset-password");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!supabase) {
      throw new Error(
        "Supabase is not configured yet. Fill .env or use Skip for dev.",
      );
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      throw error;
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    if (!supabase) {
      throw new Error(
        "Supabase is not configured yet. Fill .env or use Skip for dev.",
      );
    }

    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    });

    if (error) {
      throw error;
    }
  }, []);

  const devSignIn = useCallback(() => {
    setSession({
      isDevSession: true,
      user: {
        id: "dev-user",
        email: "dev@tigerseyelife.local",
      },
    });
    router.replace("/(tabs)/today");
  }, []);

  const requestPasswordReset = useCallback(async (email: string) => {
    if (!supabase) {
      throw new Error(
        "Password reset is unavailable until the app is connected.",
      );
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: Linking.createURL("/reset-password"),
    });
    if (error) throw error;
  }, []);

  const updatePassword = useCallback(async (password: string) => {
    if (!supabase) throw new Error("Password reset is unavailable.");
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
  }, []);

  const signOut = useCallback(async () => {
    if (supabase && !("isDevSession" in (session ?? {}))) {
      await supabase.auth.signOut();
    }

    setSession(null);
    router.replace("/(auth)/sign-in");
  }, [session]);

  const deleteAccount = useCallback(async () => {
    if (!session) return;

    if ("isDevSession" in session || !supabase) {
      const keys = await AsyncStorage.getAllKeys();
      const appKeys = keys.filter((key) => key.startsWith("tel:"));
      if (appKeys.length) await AsyncStorage.multiRemove(appKeys);
    } else {
      const { error } = await supabase.rpc("delete_own_account");
      if (error) throw error;
    }

    setSession(null);
    router.replace("/(auth)/sign-in");
  }, [session]);

  const value = useMemo<AuthContextValue>(
    () => ({
      loading,
      session,
      isDevSession: Boolean(session && "isDevSession" in session),
      hasSupabaseConfig,
      signIn,
      signUp,
      requestPasswordReset,
      updatePassword,
      devSignIn,
      signOut,
      deleteAccount,
    }),
    [
      deleteAccount,
      devSignIn,
      loading,
      requestPasswordReset,
      session,
      signIn,
      signOut,
      signUp,
      updatePassword,
    ],
  );

  return createElement(AuthContext.Provider, { value }, children);
}

export function useAuth() {
  const value = useContext(AuthContext);

  if (!value) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return value;
}
