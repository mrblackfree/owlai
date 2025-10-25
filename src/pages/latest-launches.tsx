import { Zap } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useTools } from "@/lib/api/tools";
import { useToolActions } from "@/hooks/useToolActions";

// Helper function to convert pricing type
const convertPricingType = (type: string): 'Free' | 'Freemium' | 'Paid' => {
  const normalized = type.toLowerCase();
  switch (normalized) {
    case 'free': return 'Free';
    case 'freemium': return 'Freemium';
    case 'paid':
    case 'enterprise': return 'Paid';
    default: return 'Paid';
  }
};

export const LatestLaunches = () => {
  const [timeFilter, setTimeFilter] = useState<'all' | 'week' | 'month'>('all');
  const { data, isLoading, error } = useTools({ limit: 500 });
  const tools = data?.data || [];
  const [pageSize, setPageSize] = useState(9);
  const { toggleUpvote, isUpvoted, toggleSave, isSaved, isLoading: isActionLoading } = useToolActions();

  const getFilteredTools = () => {
    // Get all tools that are published and sort by creation date (newest first)
    const allTools = tools
      .filter(tool => tool.status === 'published')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    console.log('Debug - Total tools:', tools.length);
    console.log('Debug - Published tools:', allTools.length);
    console.log('Debug - Time filter:', timeFilter);
    
    if (timeFilter === 'all') {
      // For "All Time", prioritize tools marked as new, then show recent tools
      const newTools = allTools.filter(tool => tool.isNew);
      const otherTools = allTools.filter(tool => !tool.isNew);
      console.log('Debug - New tools:', newTools.length, 'Other tools:', otherTools.length);
      return [...newTools, ...otherTools];
    }

    const now = new Date();
    const msPerDay = 24 * 60 * 60 * 1000;
    let daysBack = 30; // default for month
    
    if (timeFilter === 'week') {
      daysBack = 7;
    }
    
    const cutoffTime = now.getTime() - (daysBack * msPerDay);

    const filteredByDate = allTools.filter(tool => {
      const toolDate = new Date(tool.createdAt);
      const isInRange = toolDate.getTime() >= cutoffTime;
      if (timeFilter === 'week') {
        console.log('Debug - Tool:', tool.name, 'Date:', toolDate.toDateString(), 'Days ago:', Math.floor((now.getTime() - toolDate.getTime()) / msPerDay), 'In range:', isInRange);
      }
      return isInRange;
    });
    
    console.log('Debug - Tools after date filter:', filteredByDate.length);
    return filteredByDate;
  };

  const filteredTools = getFilteredTools();
  const visibleTools = filteredTools.slice(0, pageSize);

  const handleTimeFilterChange = (filter: 'all' | 'week' | 'month') => {
    setTimeFilter(filter);
    setPageSize(9); // Reset page size when filter changes
  };

  const handleLoadMore = () => {
    setPageSize(prev => prev + 9);
  };

  const handleVote = (e: React.MouseEvent | undefined, toolId: string, currentVotes: number = 0) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    toggleUpvote(toolId, currentVotes);
  };

  const handleFavorite = (e: React.MouseEvent, toolId: string) => {
    e.preventDefault();
    e.stopPropagation();
    toggleSave(toolId);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

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
    <div className="container mx-auto px-4 py-8 mt-20 relative">
      {/* Header */}
      <div className="flex flex-col items-center text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-purple-100 mb-4">
          <Zap className="w-8 h-8 text-purple-600" />
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
          Latest AI Tool Launches
        </h1>
        <p className="text-gray-600 max-w-2xl">
          Discover the newest AI tools and innovations. Be among the first to explore and try out these cutting-edge solutions.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-8">
        <Button 
          variant={timeFilter === 'all' ? "default" : "outline"} 
          className={`rounded-xl ${timeFilter === 'all' ? '' : 'hover:bg-purple-50'}`}
          onClick={() => handleTimeFilterChange('all')}
        >
          All Time
        </Button>
        <Button 
          variant={timeFilter === 'month' ? "default" : "outline"} 
          className={`rounded-xl ${timeFilter === 'month' ? '' : 'hover:bg-purple-50'}`}
          onClick={() => handleTimeFilterChange('month')}
        >
          This Month
        </Button>
        <Button 
          variant={timeFilter === 'week' ? "default" : "outline"} 
          className={`rounded-xl ${timeFilter === 'week' ? '' : 'hover:bg-purple-50'}`}
          onClick={() => handleTimeFilterChange('week')}
        >
          This Week
        </Button>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {visibleTools.map((tool) => (
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
            onFavorite={(e) => handleFavorite(e, tool.id)}
            pricing={convertPricingType(tool.pricing.type)}
            isNew={tool.isNew}
          />
        ))}
      </div>

      {/* Empty state if no tools match filters */}
      {visibleTools.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
            <Zap className="w-8 h-8 text-purple-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No tools found</h3>
          <p className="text-gray-600 max-w-md mb-6">
            There are no new tools matching your current filter. Try changing the time filter or check back later!
          </p>
          <Button 
            variant="outline"
            className="rounded-xl hover:bg-purple-50"
            onClick={() => handleTimeFilterChange('all')}
          >
            View All Tools
          </Button>
        </div>
      )}

      {/* Load More */}
      {visibleTools.length < filteredTools.length && (
        <div className="flex justify-center mt-12 relative z-50">
          <Button 
            variant="outline"
            className="rounded-xl hover:bg-purple-50 border-purple-200 relative z-50 cursor-pointer"
            onClick={handleLoadMore}
          >
            Load More
          </Button>
        </div>
      )}
    </div>
  );
}; 