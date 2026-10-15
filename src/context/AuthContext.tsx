import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { FlowProfile } from '../types/database';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: FlowProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (fullName: string, email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to translate raw technical errors into friendly Portuguese messages
function formatAuthErrorMessage(error: AuthError | Error | null | unknown): string {
  if (!error) return 'Ocorreu um erro inesperado. Tente novamente.';
  const msg = (error as { message?: string }).message || String(error);

  if (msg.includes('Invalid login credentials') || msg.includes('invalid_credentials')) {
    return 'E-mail ou senha incorretos.';
  }
  if (msg.includes('User already registered') || msg.includes('already_registered') || msg.includes('user_already_exists')) {
    return 'Já existe uma conta com este e-mail.';
  }
  if (msg.includes('Password should be at least') || msg.includes('password_too_short')) {
    return 'A senha precisa ter pelo menos 6 caracteres.';
  }
  if (msg.includes('Email not confirmed')) {
    return 'Este e-mail ainda não foi confirmado. Verifique sua caixa de entrada.';
  }
  if (msg.includes('Rate limit') || msg.includes('over_email_send_rate_limit')) {
    return 'Muitas tentativas em pouco tempo. Aguarde alguns instantes.';
  }
  if (msg.includes('Network') || msg.includes('Failed to fetch')) {
    return 'Falha de conexão com os servidores. Verifique sua internet.';
  }
  return 'Não foi possível concluir a autenticação. Verifique os dados informados.';
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<FlowProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch user profile from public.flow_profiles
  const fetchProfile = useCallback(async (userId: string) => {
    if (!isSupabaseConfigured) return;
    try {
      const { data, error } = await supabase
        .from('flow_profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (!error && data) {
        setProfile(data as FlowProfile);
      } else {
        // Fallback profile if row is not created yet
        setProfile({
          id: userId,
          full_name: user?.user_metadata?.full_name || null,
          email: user?.email || null,
        });
      }
    } catch {
      // Graceful fallback
    }
  }, [user]);

  // Initial session restoration and listener
  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    // Get current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (isMounted) {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchProfile(session.user.id);
        }
        setLoading(false);
      }
    }).catch(() => {
      if (isMounted) setLoading(false);
    });

    // Listen to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      if (newSession?.user) {
        await fetchProfile(newSession.user.id);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const signIn = async (email: string, password: string): Promise<{ error?: string }> => {
    if (!isSupabaseConfigured) {
      return { error: 'Supabase não configurado. Verifique as variáveis de ambiente.' };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        return { error: formatAuthErrorMessage(error) };
      }

      setUser(data.user);
      setSession(data.session);
      if (data.user) {
        await fetchProfile(data.user.id);
      }
      return {};
    } catch (err) {
      return { error: formatAuthErrorMessage(err) };
    }
  };

  const signUp = async (
    fullName: string,
    email: string,
    password: string
  ): Promise<{ error?: string }> => {
    if (!isSupabaseConfigured) {
      return { error: 'Supabase não configurado. Verifique as variáveis de ambiente.' };
    }

    if (password.length < 6) {
      return { error: 'A senha precisa ter pelo menos 6 caracteres.' };
    }

    try {
      // Pass full_name in options.data so DB trigger can create flow_profiles
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
          },
        },
      });

      if (error) {
        return { error: formatAuthErrorMessage(error) };
      }

      setUser(data.user);
      setSession(data.session);
      if (data.user) {
        await fetchProfile(data.user.id);
      }
      return {};
    } catch (err) {
      return { error: formatAuthErrorMessage(err) };
    }
  };

  const signOut = async (): Promise<void> => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  const refreshProfile = async (): Promise<void> => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        signIn,
        signUp,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
