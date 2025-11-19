import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

interface Profile {
  id: string;
  name: string;
  last_period_date: string | null;
  avg_cycle_length: number | null;
  is_irregular: boolean;
  language: string;
  avg_period_duration: number;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();
  const { i18n } = useTranslation();

  // Fetch profile data
  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      return data as Profile;
    },
    enabled: !!user,
  });

  // Change language when profile language changes
  useEffect(() => {
    if (profile?.language) {
      const currentLang = i18n.language;
      if (profile.language !== currentLang) {
        console.log('Changing language from', currentLang, 'to', profile.language);
        i18n.changeLanguage(profile.language);
      }
    } else if (profile && !profile.language) {
      // Set default language if profile exists but no language is set
      console.log('Setting default language to es');
      i18n.changeLanguage('es');
    }
  }, [profile?.language, profile, i18n]);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, name: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          name: name, // Store name in user metadata
        }
      }
    });

    if (signUpError) return { error: signUpError };

    // Immediately update profile with name
    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ name, language: 'es' }) // Set default language
        .eq('id', data.user.id);
      
      if (profileError) {
        console.error('Error updating profile:', profileError);
      }
      
      // Invalidate queries to refresh profile data
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    }

    return { error: null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    queryClient.clear();
  };

  const updateProfileMutation = useMutation({
    mutationFn: async (data: Partial<Profile>) => {
      if (!user) throw new Error('No user');
      
      const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', user.id);
      
      if (error) throw error;
    },
    onSuccess: async (_, variables) => {
      // Invalidate and wait for refetch
      await queryClient.invalidateQueries({ queryKey: ['profile'] });
      
      // If language was updated, change it immediately after profile is refetched
      if (variables.language) {
        console.log('Language updated in profile, changing to:', variables.language);
        await i18n.changeLanguage(variables.language);
      }
    },
  });

  const updateProfile = async (data: Partial<Profile>) => {
    await updateProfileMutation.mutateAsync(data);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile: profile || null,
        loading,
        signUp,
        signIn,
        signOut,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}