"use client";

import type { User, UserRole } from '@/lib/types';
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { findUserByUsername } from '@/lib/data'; // Mock API for user lookup
import { useRouter, usePathname } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  login: (username: string, password?: string) => Promise<boolean>; // Password ignored for mock
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Try to load user from localStorage on initial load
    const storedUser = localStorage.getItem('reeltime-user');
    if (storedUser) {
      try {
        const parsedUser: User = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error("Failed to parse user from localStorage", error);
        localStorage.removeItem('reeltime-user');
      }
    }
    setLoading(false);
  }, []);

  // Redirect logic after user state is loaded/changed
   useEffect(() => {
    if (loading) return;

    const publicPaths = ['/login'];
    const userPaths = ['/movies', '/bookings', '/recommendations'];
    const adminPaths = ['/admin'];

    const isPublicPath = publicPaths.some(p => pathname.startsWith(p));
    const isUserPath = userPaths.some(p => pathname.startsWith(p));
    const isAdminPath = adminPaths.some(p => pathname.startsWith(p));
    
    if (!user && !isPublicPath && pathname !== '/') {
      router.push('/login');
    } else if (user) {
      if (user.role === 'admin' && (isUserPath || pathname === '/login')) {
        router.push('/admin');
      } else if (user.role === 'user' && (isAdminPath || pathname === '/login')) {
        router.push('/movies');
      } else if (pathname === '/login' || pathname === '/') {
         router.push(user.role === 'admin' ? '/admin' : '/movies');
      }
    } else if (pathname === '/') {
        router.push('/login');
    }
  }, [user, loading, pathname, router]);


  const login = async (username: string, _password?: string): Promise<boolean> => {
    // In a real app, you'd validate password against a backend
    setLoading(true);
    const foundUser = await findUserByUsername(username); // Mock
    if (foundUser && ((username === 'admin' && _password === 'adminpass') || (username === 'testuser' && _password === 'userpass'))) {
      setUser(foundUser);
      localStorage.setItem('reeltime-user', JSON.stringify(foundUser));
      setLoading(false);
      router.push(foundUser.role === 'admin' ? '/admin' : '/movies');
      return true;
    }
    // Hardcoded fallback for simplicity during scaffolding if DB users are not matched.
    if (username === 'admin' && _password === 'adminpass') {
        const adminUser = { id: 'admin0', username: 'admin', role: 'admin' as UserRole };
        setUser(adminUser);
        localStorage.setItem('reeltime-user', JSON.stringify(adminUser));
        setLoading(false);
        router.push('/admin');
        return true;
    }
    if (username === 'testuser' && _password === 'userpass') {
        const regularUser = { id: 'user0', username: 'testuser', role: 'user' as UserRole };
        setUser(regularUser);
        localStorage.setItem('reeltime-user', JSON.stringify(regularUser));
        setLoading(false);
        router.push('/movies');
        return true;
    }
    setLoading(false);
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('reeltime-user');
    router.push('/login');
  };

  if (loading && !user && !['/login'].includes(pathname) && pathname !== '/') {
     // To prevent flash of content on protected routes while loading user state and not on login page
     // Or show a global loading spinner
     return <div className="flex items-center justify-center min-h-screen"><p>Loading...</p></div>;
  }


  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
