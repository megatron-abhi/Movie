
"use client";
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { TheatreFormData } from '@/lib/types';
import { addTheatre } from '@/lib/data';
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { ArrowLeft, Building, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/auth-context';

const theatreFormSchema = z.object({
  name: z.string().min(1, "Theatre name is required"),
  location: z.string().optional(),
});

type TheatreFormValues = z.infer<typeof theatreFormSchema>;

export default function AddTheatrePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, loading: authLoading } = useAuth();

  const form = useForm<TheatreFormValues>({
    resolver: zodResolver(theatreFormSchema),
    defaultValues: {
      name: '',
      location: '',
    },
  });

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.replace('/login');
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (data: TheatreFormValues) => {
    setIsSubmitting(true);
    try {
      await addTheatre(data);
      toast({
        title: "Theatre Added",
        description: `${data.name} has been successfully added.`,
      });
      router.push('/admin/theatres');
    } catch (error) {
      console.error("Failed to add theatre:", error);
      toast({
        title: "Error",
        description: "Failed to add theatre. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (authLoading || !user || user.role !== 'admin') {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Link href="/admin/theatres" className="mb-6 inline-flex items-center">
        <Button variant="outline">
          <ArrowLeft size={18} className="mr-2" /> Back to Theatre List
        </Button>
      </Link>
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-3xl text-primary flex items-center">
            <Building size={30} className="mr-3 text-accent"/> Add New Theatre
          </CardTitle>
          <CardDescription>Enter the details for the new theatre.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div>
              <Label htmlFor="name">Theatre Name</Label>
              <Input id="name" {...form.register('name')} className="mt-1" />
              {form.formState.errors.name && <p className="text-sm text-destructive mt-1">{form.formState.errors.name.message}</p>}
            </div>
            <div>
              <Label htmlFor="location">Location (Optional)</Label>
              <Textarea id="location" {...form.register('location')} className="mt-1" placeholder="e.g., 123 Main St, Anytown, USA or Shopping Mall, Floor 3"/>
              {form.formState.errors.location && <p className="text-sm text-destructive mt-1">{form.formState.errors.location.message}</p>}
            </div>
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
              ) : null}
              {isSubmitting ? 'Adding Theatre...' : 'Add Theatre'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
