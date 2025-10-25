import { ProductCard } from "@/components/ProductCard";
import { ToolCardSkeleton } from "@/components/ToolCardSkeleton";
import { useTools } from "@/lib/api/tools";
import { useState } from "react";
import { useToolActions } from "@/hooks/useToolActions";

function LoadingSection({ title }: { title: string }) {
  return (
    <section>
      <h2 className="text-2xl font-bold mb-6">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <ToolCardSkeleton key={i} />
        ))}
      </div>
    </section>
  );
}

function EmptySection({ title }: { title: string }) {
  return (
    <section>
      <h2 className="text-2xl font-bold mb-6">{title}</h2>
      <div className="bg-gray-50 rounded-2xl p-8 text-center">
        <p className="text-gray-600">No tools available in this section yet.</p>
      </div>
    </section>
  );
}

export default function Home() {
  // Use more efficient loading with pagination
  const { data, isLoading, error } = useTools({ limit: 100 });
  const tools = data?.data || [];
  const { toggleUpvote, isUpvoted, toggleSave, isSaved } = useToolActions();
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // Filter tools for different sections
  const trendingTools = tools.filter(tool => tool.isTrending).slice(0, 6);
  const newTools = tools.filter(tool => tool.isNew).slice(0, 6);
  const topRatedTools = [...tools]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 6);

  const handleVote = (e: React.MouseEvent | undefined, toolId: string, currentVotes: number = 0) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    toggleUpvote(toolId, currentVotes);
  };

  const handleFavorite = (id: string) => {
    toggleSave(id);
  };

  const convertPricingType = (type: string) => {
    const normalized = type.toLowerCase();
    switch (normalized) {
      case 'free': return 'Free';
      case 'freemium': return 'Freemium';
      case 'paid':
      case 'enterprise': return 'Paid';
      default: return 'Paid';
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Tools</h2>
          <p className="text-gray-600">Please try again later</p>
        </div>
      </div>
    );
  }

  return (
    <main>
      <div className="space-y-12 py-8">
        {/* Trending Tools */}
        {isLoading ? (
          <LoadingSection title="Trending Tools" />
        ) : trendingTools.length > 0 ? (
          <section>
            <h2 className="text-2xl font-bold mb-6">Trending Tools</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trendingTools.map((tool) => (
                <ProductCard 
                  key={tool.id}
                  id={tool.id}
                  slug={tool.slug}
                  name={tool.name}
                  description={tool.description}
                  category={tool.category}
                  votes={tool.votes}
                  imageUrl={tool.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(tool.name)}`}
                  onVote={(e) => handleVote(e, tool.id, tool.votes)}
                  isFavorite={isSaved(tool.id)}
                  onFavorite={(e) => {
                    e.preventDefault();
                    handleFavorite(tool.id);
                  }}
                  pricing={convertPricingType(tool.pricing.type)}
                  isNew={tool.isNew}
                />
              ))}
            </div>
          </section>
        ) : (
          <EmptySection title="Trending Tools" />
        )}

        {/* New Tools */}
        {isLoading ? (
          <LoadingSection title="New Tools" />
        ) : newTools.length > 0 ? (
          <section>
            <h2 className="text-2xl font-bold mb-6">New Tools</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {newTools.map((tool) => (
                <ProductCard 
                  key={tool.id}
                  id={tool.id}
                  slug={tool.slug}
                  name={tool.name}
                  description={tool.description}
                  category={tool.category}
                  votes={tool.votes}
                  imageUrl={tool.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(tool.name)}`}
                  onVote={(e) => handleVote(e, tool.id, tool.votes)}
                  isFavorite={isSaved(tool.id)}
                  onFavorite={(e) => {
                    e.preventDefault();
                    handleFavorite(tool.id);
                  }}
                  pricing={convertPricingType(tool.pricing.type)}
                  isNew={tool.isNew}
                />
              ))}
            </div>
          </section>
        ) : (
          <EmptySection title="New Tools" />
        )}

        {/* Top Rated Tools */}
        {isLoading ? (
          <LoadingSection title="Top Rated Tools" />
        ) : topRatedTools.length > 0 ? (
          <section>
            <h2 className="text-2xl font-bold mb-6">Top Rated Tools</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {topRatedTools.map((tool) => (
                <ProductCard 
                  key={tool.id}
                  id={tool.id}
                  slug={tool.slug}
                  name={tool.name}
                  description={tool.description}
                  category={tool.category}
                  votes={tool.votes}
                  imageUrl={tool.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(tool.name)}`}
                  onVote={(e) => handleVote(e, tool.id, tool.votes)}
                  isFavorite={isSaved(tool.id)}
                  onFavorite={(e) => {
                    e.preventDefault();
                    handleFavorite(tool.id);
                  }}
                  pricing={convertPricingType(tool.pricing.type)}
                  isNew={tool.isNew}
                />
              ))}
            </div>
          </section>
        ) : (
          <EmptySection title="Top Rated Tools" />
        )}
      </div>
    </main>
  );
} 