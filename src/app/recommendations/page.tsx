"use client";
import RecommendationForm from '@/components/movies/recommendation-form';

export default function RecommendationsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-headline text-primary">Discover Your Next Favorite Movie</h1>
        <p className="text-lg text-muted-foreground font-body mt-2">
          Let our AI guide you to films tailored to your taste.
        </p>
      </header>
      <RecommendationForm />
    </div>
  );
}
