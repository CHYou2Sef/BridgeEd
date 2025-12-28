
import { User, AuthSession, SubscriptionTier } from '../types';

/**
 * AuthService: Simulates Supabase Auth logic
 * Uses localStorage for persistence across reloads.
 */
class AuthService {
  private static instance: AuthService;
  private storageKey = 'bridge_ed_session';

  public static getInstance(): AuthService {
    if (!AuthService.instance) AuthService.instance = new AuthService();
    return AuthService.instance;
  }

  public getSession(): AuthSession {
    const saved = localStorage.getItem(this.storageKey);
    if (!saved) return { user: null, token: null };
    try {
      return JSON.parse(saved);
    } catch {
      return { user: null, token: null };
    }
  }

  public async signIn(email: string, password: string): Promise<AuthSession> {
    // Simulate API delay
    await new Promise(r => setTimeout(r, 800));

    // Simple demo logic: any valid email works
    const user: User = {
      id: Math.random().toString(36).substring(7),
      email,
      name: email.split('@')[0],
      tier: 'free',
      enrolled: [],
      stats: {
        coursesCompleted: 0,
        avgScore: 0,
        totalXp: 0,
        streak: 0
      }
    };

    const session = { user, token: 'fake-jwt-token' };
    localStorage.setItem(this.storageKey, JSON.stringify(session));
    return session;
  }

  public async signUp(email: string, name: string, tier: SubscriptionTier): Promise<AuthSession> {
    await new Promise(r => setTimeout(r, 1000));

    const user: User = {
      id: Math.random().toString(36).substring(7),
      email,
      name,
      tier,
      enrolled: [],
      stats: {
        coursesCompleted: 0,
        avgScore: 0,
        totalXp: 0,
        streak: 0
      }
    };

    const session = { user, token: 'fake-jwt-token' };
    localStorage.setItem(this.storageKey, JSON.stringify(session));
    return session;
  }

  public signOut(): void {
    localStorage.removeItem(this.storageKey);
  }
}

export const auth = AuthService.getInstance();
