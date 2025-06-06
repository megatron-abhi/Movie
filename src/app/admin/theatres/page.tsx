
"use client";
import { useEffect, useState } from 'react';
import type { Theatre } from '@/lib/types';
import { getTheatres, deleteTheatre } from '@/lib/data';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlusCircle, Loader2, Building, AlertCircle, Trash2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function AdminTheatresPage() {
  const [theatres, setTheatres] = useState<Theatre[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingTheatre, setDeletingTheatre] = useState<{ id: string; name: string } | null>(null);
  const [isProcessingDelete, setIsProcessingDelete] = useState(false);
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.replace('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && user.role === 'admin') {
      async function fetchTheatres() {
        setIsLoading(true);
        try {
          const data = await getTheatres();
          setTheatres(data);
        } catch (error) {
          console.error("Failed to fetch theatres:", error);
          toast({ title: "Error", description: "Failed to load theatres.", variant: "destructive" });
        } finally {
          setIsLoading(false);
        }
      }
      fetchTheatres();
    }
  }, [toast, user]);

  const handleDeleteClick = (id: string, name: string) => {
    setDeletingTheatre({ id, name });
  };

  const confirmDelete = async () => {
    if (!deletingTheatre) return;
    setIsProcessingDelete(true);
    try {
      const result = await deleteTheatre(deletingTheatre.id);
      if (result.success) {
        setTheatres(prev => prev.filter(theatre => theatre.id !== deletingTheatre.id));
        toast({ title: "Theatre Deleted", description: `${deletingTheatre.name} has been successfully deleted.` });
      } else {
        toast({ title: "Deletion Failed", description: result.message || "Failed to delete theatre.", variant: "destructive" });
      }
    } catch (error) {
      console.error("Failed to delete theatre:", error);
      toast({ title: "Error", description: "Failed to delete theatre.", variant: "destructive" });
    } finally {
      setIsProcessingDelete(false);
      setDeletingTheatre(null);
    }
  };

  if (authLoading || isLoading || !user || user.role !== 'admin') {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col sm:flex-row justify-between items-center pb-6 border-b">
        <div>
          <h1 className="text-4xl font-headline text-primary flex items-center">
            <Building size={36} className="mr-3 text-accent" /> Manage Theatres
          </h1>
          <p className="text-lg text-muted-foreground font-body mt-1">View, add, or delete theatre locations.</p>
        </div>
        <Link href="/admin/theatres/add">
          <Button className="mt-4 sm:mt-0 bg-accent hover:bg-accent/90 text-accent-foreground">
            <PlusCircle size={20} className="mr-2" /> Add New Theatre
          </Button>
        </Link>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Theatre List</CardTitle>
          <CardDescription>All available theatres are listed below.</CardDescription>
        </CardHeader>
        <CardContent>
          {theatres.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {theatres.map((theatre) => (
                  <TableRow key={theatre.id}>
                    <TableCell className="font-medium">{theatre.name}</TableCell>
                    <TableCell>{theatre.location || 'N/A'}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteClick(theatre.id, theatre.name)}
                        disabled={isProcessingDelete && deletingTheatre?.id === theatre.id}
                      >
                        <Trash2 size={16} className="mr-1.5" />
                        {isProcessingDelete && deletingTheatre?.id === theatre.id ? 'Deleting...' : 'Delete'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-10">
              <Building size={48} className="mx-auto text-muted-foreground mb-4" />
              <h2 className="text-2xl font-headline mb-2">No Theatres Found</h2>
              <p className="text-muted-foreground">There are no theatres in the database yet. Add one to get started!</p>
            </div>
          )}
        </CardContent>
      </Card>

      {deletingTheatre && (
        <AlertDialog open={!!deletingTheatre} onOpenChange={() => setDeletingTheatre(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="font-headline">Confirm Deletion</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete the theatre "{deletingTheatre.name}"? This action cannot be undone if the theatre is not in use.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isProcessingDelete}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} disabled={isProcessingDelete} className="bg-destructive hover:bg-destructive/90">
                {isProcessingDelete ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
