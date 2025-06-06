
"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Film, Ticket, Users, LayoutDashboard, Building } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminDashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  if (loading || !user || user.role !== 'admin') {
    return <div className="flex justify-center items-center min-h-screen"><LayoutDashboard className="h-8 w-8 animate-pulse" /> Loading Admin Dashboard...</div>;
  }
  
  return (
    <div className="space-y-8">
      <header className="pb-6 border-b">
        <h1 className="text-4xl font-headline text-primary flex items-center">
            <LayoutDashboard size={36} className="mr-3 text-accent"/> Admin Dashboard
        </h1>
        <p className="text-lg text-muted-foreground font-body mt-1">Manage movies, theatres, bookings, and site settings.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="font-headline text-2xl flex items-center">
              <Film size={24} className="mr-2 text-primary" /> Manage Movies
            </CardTitle>
            <CardDescription>Add, edit, or delete movie listings and their showtimes.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/movies">
              <Button className="w-full bg-primary hover:bg-primary/90">Go to Movie Management</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="font-headline text-2xl flex items-center">
              <Building size={24} className="mr-2 text-primary" /> Manage Theatres
            </CardTitle>
            <CardDescription>Add, edit, or delete theatre locations.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/theatres">
              <Button className="w-full bg-primary hover:bg-primary/90">Go to Theatre Management</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="font-headline text-2xl flex items-center">
              <Ticket size={24} className="mr-2 text-primary" /> View All Bookings
            </CardTitle>
            <CardDescription>Oversee all ticket bookings made by users.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/bookings">
              <Button className="w-full bg-primary hover:bg-primary/90">View Bookings</Button>
            </Link>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-lg transition-shadow opacity-50 cursor-not-allowed">
          <CardHeader>
            <CardTitle className="font-headline text-2xl flex items-center">
              <Users size={24} className="mr-2 text-muted-foreground" /> Manage Users (Coming Soon)
            </CardTitle>
            <CardDescription>View and manage user accounts.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" disabled>User Management</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
