import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User as SupabaseUser } from '@supabase/supabase-js';

export type Plan = 'free' | 'pro' | 'enterprise';

export interface User {
  id: string;
  name: string;
  email: string;
  plan: Plan;
  role: 'admin' | 'employee';
  companyId?: string;
  avatar: string;
  joinedAt: string;
}

interface AuthCtx {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  checkoutStripe: (plan: Plan) => void;
  redeemCoupon: (code: string) => Promise<{ success: boolean; message: string; new_plan?: Plan }>;
  updateProfile: (name: string, avatar: string) => Promise<boolean>;
  updatePassword: (password: string) => Promise<boolean>;
  resetPasswordEmail: (email: string) => Promise<boolean>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthCtx | null>(null);

function mapSupabaseUser(su: SupabaseUser | null): User | null {
  if (!su || !su.email) return null;
  const meta = su.user_metadata || {};
  return {
    id: su.id,
    email: su.email,
    name: meta.name || su.email.split('@')[0],
    plan: su.email === 'admin@workhub.io' ? 'enterprise' : (meta.plan || 'free'),
    role: su.email === 'admin@workhub.io' ? 'admin' : (meta.role || 'employee'),
    companyId: meta.company_id,
    avatar: meta.avatar || (meta.name ? meta.name[0].toUpperCase() : su.email[0].toUpperCase()),
    joinedAt: su.created_at || new Date().toISOString()
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(mapSupabaseUser(session?.user ?? null));
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(mapSupabaseUser(session?.user ?? null));
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function login(email: string, password: string): Promise<boolean> {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        console.error('Login error:', error.message);
        return false;
      }
      return true;
    } catch (err) {
      console.error('Unexpected login error:', err);
      return false;
    }
  }

  async function signup(name: string, email: string, password: string): Promise<boolean> {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            plan: 'free',
            avatar: name[0].toUpperCase()
          }
        }
      });
      if (error) {
        console.error('Signup error:', error.message);
        return false;
      }
      return true;
    } catch (err) {
      console.error('Unexpected signup error:', err);
      return false;
    }
  }

  async function logout() {
    await supabase.auth.signOut();
    setUser(null);
  }

  function checkoutStripe(plan: Plan) {
    if (!user) return;
    // In a real application, you would replace these with your actual Stripe Payment Links
    // Make sure to append the client_reference_id so the webhook knows who paid
    const STRIPE_LINKS = {
      pro: 'https://buy.stripe.com/test_pro_link',
      enterprise: 'https://buy.stripe.com/test_enterprise_link'
    };
    
    const link = STRIPE_LINKS[plan as keyof typeof STRIPE_LINKS];
    if (link) {
      // Redirect user to Stripe Checkout with their ID
      window.location.href = `${link}?client_reference_id=${user.id}`;
    }
  }

  async function redeemCoupon(code: string): Promise<{ success: boolean; message: string; new_plan?: Plan }> {
    if (!user) return { success: false, message: 'Please login first' };
    try {
      const { data, error } = await supabase.rpc('redeem_promo_code', { promo_code: code });
      
      if (error) throw error;
      
      if (data.success) {
        // Refresh the user session to get the new metadata
        const { data: { session } } = await supabase.auth.getSession();
        setUser(mapSupabaseUser(session?.user ?? null));
      }
      
      return data;
    } catch (err: any) {
      console.error('Coupon redemption error:', err);
      return { success: false, message: err.message || 'حدث خطأ أثناء تفعيل الكوبون' };
    }
  }

  async function updateProfile(name: string, avatar: string) {
    if (!user) return false;
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: { name, avatar }
      });
      if (!error && data.user) {
        setUser(mapSupabaseUser(data.user));
        return true;
      }
      return false;
    } catch (err) {
      console.error(err);
      return false;
    }
  }

  async function updatePassword(password: string): Promise<boolean> {
    if (!user) return false;
    try {
      const { error } = await supabase.auth.updateUser({ password });
      return !error;
    } catch (err) {
      console.error(err);
      return false;
    }
  }

  async function resetPasswordEmail(email: string): Promise<boolean> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/reset-password',
      });
      return !error;
    } catch (err) {
      console.error(err);
      return false;
    }
  }

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, checkoutStripe, redeemCoupon, updateProfile, updatePassword, resetPasswordEmail, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
