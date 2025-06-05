"use client";
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Clapperboard, UserCircle, LogOut, LayoutDashboard, Ticket, Film, Sparkles } from 'lucide-react';

export default function AppHeader() {
  const { user, logout } = useAuth();

  return (
    <header className="bg-card shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href={user ? (user.role === 'admin' ? '/admin' : '/movies') : '/'} className="flex items-center gap-2 text-primary">
          <Clapperboard size={32} className="text-accent" />
          <h1 className="text-2xl font-headline text-foreground">ReelTime Tickets</h1>
        </Link>
        <nav className="flex items-center gap-4">
          {user ? (
            <>
              {user.role === 'user' && (
                <>
                  <Link href="/movies" className="text-sm hover:text-accent transition-colors flex items-center gap-1">
                    <Film size={18} /> Movies
                  </Link>
                  <Link href="/bookings" className="text-sm hover:text-accent transition-colors flex items-center gap-1">
                    <Ticket size={18} /> My Bookings
                  </Link>
                  <Link href="/recommendations" className="text-sm hover:text-accent transition-colors flex items-center gap-1">
                    <Sparkles size={18} /> Recommendations
                  </Link>
                </>
              )}
              {user.role === 'admin' && (
                <>
                  <Link href="/admin" className="text-sm hover:text-accent transition-colors flex items-center gap-1">
                    <LayoutDashboard size={18} /> Dashboard
                  </Link>
                  <Link href="/admin/movies" className="text-sm hover:text-accent transition-colors flex items-center gap-1">
                    <Film size={18} /> Manage Movies
                  </Link>
                   <Link href="/admin/bookings" className="text-sm hover:text-accent transition-colors flex items-center gap-1">
                    <Ticket size={18} /> All Bookings
                  </Link>
                </>
              )}
              <div className="flex items-center gap-2">
                <UserCircle size={20} />
                <span className="text-sm">{user.username} ({user.role})</span>
              </div>
              <Button variant="ghost" size="sm" onClick={logout} className="flex items-center gap-1">
                <LogOut size={18} /> Logout
              </Button>
            </>
          ) : (
            <Link href="/login">
              <Button variant="outline">Login</Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
