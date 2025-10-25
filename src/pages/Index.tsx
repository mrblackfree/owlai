import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDebounce } from "use-debounce";
import InfiniteScroll from "react-infinite-scroll-component";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useTools } from "@/lib/api/tools";
import { Tool } from "@/types/tool";
import { HeroSection } from "@/components/HeroSection";
import { FilterBar } from "@/components/FilterBar";
import { getToolLogo } from "@/utils/toolHelpers";
import { SponsoredListings } from "@/components/SponsoredListings";
import { useSponsoredListings } from "@/contexts/SponsoredListingsContext";
import { useSiteConfig } from "@/contexts/SiteConfigContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sparkles,
  Search,
  ArrowUp,
  Star,
  Clock,
  Tag,
  TrendingUp,
  ThumbsUp,
  Eye,
  Filter,
  Zap,
  X,
  ChevronDown,
  ArrowDown,
  CornerDownLeft as Enter,
  Users,
  Heart,
  ExternalLink,
  MessageSquare,
} from "lucide-react";
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useToolActions } from "@/hooks/useToolActions";

// Logo cache utilities
const LOGO_CACHE_KEY = 'ai_tools_logo_cache';
const CACHE_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days

interface LogoCacheEntry {
  url: string;
  timestamp: number;
}

interface LogoCache {
  [key: string]: LogoCacheEntry;
}

const getLogoFromCache = (toolId: string): string | null => {
  try {
    const cache = JSON.parse(localStorage.getItem(LOGO_CACHE_KEY) || '{}') as LogoCache;
    const entry = cache[toolId];
    if (entry && Date.now() - entry.timestamp < CACHE_EXPIRY) {
      return entry.url;
    }
    return null;
  } catch {
    return null;
  }
};

const saveLogoToCache = (toolId: string, url: string) => {
  try {
    const cache = JSON.parse(localStorage.getItem(LOGO_CACHE_KEY) || '{}') as LogoCache;
    cache[toolId] = {
      url,
      timestamp: Date.now()
    };
    localStorage.setItem(LOGO_CACHE_KEY, JSON.stringify(cache));
  } catch {
    // Silently fail if localStorage is not available
  }
};

// Add these mock activities near your other constants
const FOMO_ACTIVITIES = [
  { type: 'view' as const, message: 'Someone from New York is viewing' },
  { type: 'upvote' as const, message: 'John D. just upvoted' },
  { type: 'visit' as const, message: 'A developer from India visited' },
  { type: 'share' as const, message: 'People shared' },
  { type: 'comment' as const, message: 'New review added by Sarah' },
];

type FomoActivityType = typeof FOMO_ACTIVITIES[number];

const AnimatedCounter = ({ value, className }: { value: string | number; className?: string }) => {
  const numericValue = typeof value === 'string' 
    ? parseInt(value.replace(/[^0-9]/g, ''), 10)
    : value;
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 1000; // 1 second
    const steps = 20;
    const stepValue = numericValue / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += stepValue;
      if (current >= numericValue) {
        setCount(numericValue);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [numericValue]);

  return (
    <span className={className}>
      {typeof value === 'string' && value.includes('K') 
        ? `${(count / 1000).toFixed(1)}K` 
        : count}
    </span>
  );
};

export default function Index() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("trending");
  const [selectedPricing, setSelectedPricing] = useState<'Free' | 'Freemium' | 'Paid' | 'All'>('All');
  const [selectedRating, setSelectedRating] = useState<1 | 2 | 3 | 4 | 5 | null>(null);
  const [selectedSpecialFilter, setSelectedSpecialFilter] = useState<'new' | 'trending' | 'bookmarked' | null>(null);
  const [visibleTools, setVisibleTools] = useState<Tool[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const ITEMS_PER_PAGE = 152;
  const LOAD_DELAY = 200;
  const [searchFocused, setSearchFocused] = useState(false);
  const [debouncedSearch] = useDebounce(searchQuery, 300);
  const [initialLoad, setInitialLoad] = useState(true);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { toggleUpvote, isUpvoted, isLoading: isActionLoading } = useToolActions();
  const [hasMore, setHasMore] = useState(true);
  const navigate = useNavigate();
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('recentSearches') || '[]');
    } catch {
      return [];
    }
  });
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [currentFomo, setCurrentFomo] = useState<{ tool: Tool, activity: FomoActivityType } | null>(null);
  const [showFomo, setShowFomo] = useState(false);
  const { config } = useSiteConfig();

  // Fetch tools from API with pagination
  const { data, isLoading: isToolsLoading } = useTools({ limit: 1000 }); // Large limit for main index page
  const tools = data?.data || [];
  const { listings, isLoading: isListingsLoading } = useSponsoredListings();

  // Generate categories dynamically from actual tools data
  const categories = useMemo(() => {
    const categoryMap = new Map<string, number>();
    
    // Count tools by category
    tools.forEach(tool => {
      if (tool.category) {
        const category = tool.category.trim();
        categoryMap.set(category, (categoryMap.get(category) || 0) + 1);
      }
    });
    
    // Convert to array and sort by count (descending)
    const dynamicCategories = Array.from(categoryMap.entries())
      .map(([category, count]) => ({
        value: category,
        label: `${category} (${count})`
      }))
      .sort((a, b) => {
        // Extract count from label for sorting
        const aCount = parseInt(a.label.match(/\((\d+)\)$/)?.[1] || '0');
        const bCount = parseInt(b.label.match(/\((\d+)\)$/)?.[1] || '0');
        return bCount - aCount;
      });
    
    // Add "All Tools" at the beginning
    return [
      { value: "all", label: `All Tools (${tools.length})` },
      ...dynamicCategories
    ];
  }, [tools]);

  // Optimize the filtered tools calculation with useMemo
  const filteredTools = useMemo(() => {
    let filtered = [...tools];
    
    if (selectedCategory !== "all") {
      filtered = filtered.filter(tool => tool.category.toLowerCase() === selectedCategory.toLowerCase());
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(tool => 
        tool.name.toLowerCase().includes(query) || 
        tool.description.toLowerCase().includes(query)
      );
    }

    // Apply pricing filter
    if (selectedPricing !== "All") {
      filtered = filtered.filter(tool => {
        const toolPricing = tool.pricing?.type?.toLowerCase() || 'free';
        switch (selectedPricing) {
          case "Free":
            return toolPricing === 'free';
          case "Freemium":
            return toolPricing === 'freemium';
          case "Paid":
            return toolPricing === 'paid' || toolPricing === 'premium' || toolPricing === 'enterprise';
          default:
            return true;
        }
      });
    }

    // Apply rating filter
    if (selectedRating) {
      filtered = filtered.filter(tool => tool.rating >= selectedRating);
    }

    // Apply special filters
    if (selectedSpecialFilter) {
      switch (selectedSpecialFilter) {
        case "new":
          filtered = filtered.filter(tool => tool.isNew);
          break;
        case "trending":
          filtered = filtered.filter(tool => tool.isTrending);
          break;
        case "bookmarked":
          // This would require user authentication context to check saved tools
          // For now, we'll leave it as is
          break;
      }
    }
    
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "trending":
          return (b.isTrending ? 1 : 0) - (a.isTrending ? 1 : 0);
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "popular":
          return b.views - a.views;
        case "rating":
          return b.rating - a.rating;
        default:
          return 0;
      }
    });
    
    return filtered;
  }, [selectedCategory, searchQuery, sortBy, selectedPricing, selectedRating, selectedSpecialFilter, tools]);

  // Load initial tools with optimized loading
  useEffect(() => {
    setVisibleTools(filteredTools.slice(0, ITEMS_PER_PAGE));
    setPage(1);
    setHasMore(filteredTools.length > ITEMS_PER_PAGE);
    // Reduced initial load time to 500ms
    setTimeout(() => setInitialLoad(false), 500);
  }, [filteredTools]);

  // Optimized fetchMoreData function
  const fetchMoreData = useCallback(() => {
    if (loading) return; // Prevent multiple simultaneous loads
    
    setLoading(true);
    const nextPage = page + 1;
    
    // Use requestAnimationFrame for smoother loading
    requestAnimationFrame(() => {
      setTimeout(() => {
        const newTools = filteredTools.slice(0, nextPage * ITEMS_PER_PAGE);
        setVisibleTools(newTools);
        setPage(nextPage);
        setHasMore(filteredTools.length > nextPage * ITEMS_PER_PAGE);
        setLoading(false);
      }, LOAD_DELAY);
    });
  }, [page, loading, filteredTools]);

  // Popular searches
  const popularSearches = ["AI Chatbots", "Image Generation", "Video Editing", "Code Assistant"];

  // Featured categories with icons
  const featuredCategories = [
    { icon: <Sparkles className="w-4 h-4" />, label: "New & Trending", value: "trending" },
    { icon: <Star className="w-4 h-4" />, label: "Top Rated", value: "rating" },
    { icon: <TrendingUp className="w-4 h-4" />, label: "Most Popular", value: "popular" },
  ];

  // Reset filters function
  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSortBy('trending');
    setSelectedPricing('All');
    setSelectedRating(null);
    setSelectedSpecialFilter(null);
    const filtered = filteredTools;
    setVisibleTools(filtered.slice(0, ITEMS_PER_PAGE));
  };

  // Add keyboard shortcut handler
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsSearchOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Update the getFilteredTools references in the search handlers
  const handleSearch = (value: string) => {
    setSearchQuery(value);
    const filtered = filteredTools;
    setVisibleTools(filtered.slice(0, ITEMS_PER_PAGE));
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    const filtered = filteredTools;
    setVisibleTools(filtered.slice(0, ITEMS_PER_PAGE));
  };

  // Add this function to handle adding recent searches
  const addToRecentSearches = (query: string) => {
    if (!query.trim()) return;
    const newRecent = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
    setRecentSearches(newRecent);
    localStorage.setItem('recentSearches', JSON.stringify(newRecent));
  };

  // Add this function to handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => 
        prev < (searchQuery ? filteredTools.slice(0, 5).length : recentSearches.length) - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => prev > -1 ? prev - 1 : -1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex === -1) {
        addToRecentSearches(searchQuery);
        setIsSearchOpen(false);
      } else {
        const selectedTool = filteredTools[selectedIndex];
        if (selectedTool) {
          addToRecentSearches(selectedTool.name);
          setIsSearchOpen(false);
          // Navigate to tool detail page
          navigate(`/ai-tools/${selectedTool.slug}`);
        }
      }
    }
  };

  // Add this effect for FOMO notifications
  useEffect(() => {
    const interval = setInterval(() => {
      const randomTool = tools[Math.floor(Math.random() * tools.length)];
      const randomActivity = FOMO_ACTIVITIES[Math.floor(Math.random() * FOMO_ACTIVITIES.length)];
      
      setCurrentFomo({ tool: randomTool, activity: randomActivity });
      setShowFomo(true);
      
      // Hide after 5 seconds
      setTimeout(() => setShowFomo(false), 5000);
    }, 8000); // Show new notification every 8 seconds

    return () => clearInterval(interval);
  }, [tools]);

  return (
    <div className="min-h-screen">
      <HeroSection 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery} 
        setIsSearchOpen={setIsSearchOpen} 
        siteDescription={config?.siteDescription}
      />
      
      {!isListingsLoading && listings.length > 0 && (
        <div className="container mx-auto px-4 -mt-12 sm:-mt-4">
          <SponsoredListings listings={listings} />
        </div>
      )}
      
      <div className="container mx-auto px-4 py-8">
        {/* Filter Bar */}
        <div className="mb-8">
          <FilterBar
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
            sortBy={sortBy}
            onSortChange={setSortBy}
            searchQuery={searchQuery}
            onSearch={handleSearch}
            resetFilters={resetFilters}
            totalResults={filteredTools.length}
            onSearchOpen={() => setIsSearchOpen(true)}
            selectedPricing={selectedPricing}
            onPricingChange={setSelectedPricing}
            selectedRating={selectedRating}
            onRatingChange={setSelectedRating}
            selectedSpecialFilter={selectedSpecialFilter}
            onSpecialFilterChange={setSelectedSpecialFilter}
          />
        </div>

        {/* Search Dialog */}
        <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
          <DialogContent className="sm:max-w-2xl p-0 border-none bg-white/80 backdrop-blur-sm overflow-hidden [&>button]:hidden">
            <div className="flex flex-col">
              <div className="flex items-center px-6 py-4 border-b border-gray-100">
                <Search className="w-6 h-6 text-gray-400" />
                <div className="flex-1">
                  <input 
                    type="text"
                    placeholder="Search AI tools..." 
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setSelectedIndex(-1);
                    }}
                    onKeyDown={handleKeyDown}
                    className="w-full h-16 text-xl bg-transparent border-0 focus:outline-none focus:ring-0 placeholder:text-gray-400 pl-4"
                    autoFocus
                  />
                </div>
                <div className="flex items-center gap-2">
                  <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-lg bg-gray-100">
                    <span className="text-xs font-medium text-gray-500">ESC</span>
                  </div>
                  <button
                    onClick={() => setIsSearchOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-md text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="max-h-[60vh] overflow-y-auto">
                {!searchQuery && recentSearches.length > 0 && (
                  <div className="px-2 py-4">
                    <div className="text-xs font-medium text-gray-500 px-4 pb-2">Recent Searches</div>
                    <div className="space-y-1">
                      {recentSearches.map((search, index) => (
                        <button
                          key={search}
                          onClick={() => {
                            setSearchQuery(search);
                            setSelectedIndex(-1);
                          }}
                          className={`w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 rounded-lg transition-colors ${
                            index === selectedIndex ? 'bg-purple-50 text-purple-700' : 'text-gray-700'
                          }`}
                        >
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span>{search}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {searchQuery && (
                  <div className="px-2 py-4">
                    <div className="text-xs font-medium text-gray-500 px-4 pb-2">
                      {filteredTools.length > 0 ? 'Suggestions' : 'No results found'}
                    </div>
                    <div className="space-y-1">
                      {filteredTools.slice(0, 5).map((tool, index) => (
                        <Link
                          key={tool.id}
                          to={`/ai-tools/${tool.slug}`}
                          onClick={() => {
                            addToRecentSearches(tool.name);
                            setIsSearchOpen(false);
                          }}
                          className={`w-full flex items-start gap-3 px-4 py-4 text-sm hover:bg-gray-50 rounded-lg transition-colors ${
                            index === selectedIndex ? 'bg-purple-50 text-purple-700' : 'text-gray-700'
                          }`}
                        >
                          <div className="w-8 h-8 rounded-lg overflow-hidden bg-gradient-to-br from-purple-100 to-blue-50">
                            <img
                              src={getToolLogo(tool)}
                              alt={tool.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.onerror = null;
                                target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(tool.name)}&background=6366f1&color=fff&bold=true&format=svg&size=128`;
                              }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{tool.name}</div>
                            <div className="text-xs text-gray-500 line-clamp-3 leading-relaxed">{tool.description}</div>
                          </div>
                          {index === selectedIndex && (
                            <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-purple-100">
                              <Enter className="w-3 h-3 text-purple-600" />
                            </div>
                          )}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {searchQuery && filteredTools.length > 5 && (
                  <div className="px-6 py-3 text-xs text-center text-gray-500 border-t border-gray-100">
                    Press Enter to see all {filteredTools.length} results
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Tools Grid with Animation */}
        <AnimatePresence mode="popLayout">
          {initialLoad ? (
            // Loading skeletons
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-8">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-6">
                  <div className="flex gap-4 mb-4">
                    <Skeleton className="w-16 h-16 rounded-xl" />
                    <div className="flex-1">
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              ))}
            </div>
          ) : (
            <motion.div
              layout
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-8"
            >
              <AnimatePresence mode="popLayout">
                {visibleTools.map((tool, index) => (
                  <motion.div
                    key={tool.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    className="h-[320px]"
                  >
                    <Link to={`/ai-tools/${tool.slug}`} className="group block h-full">
                      <article className="relative h-full transform-gpu transition-all duration-500 group overflow-hidden">
                        {/* Base layer with refined background */}
                        <div className="absolute inset-0 bg-white/90 backdrop-blur-md rounded-2xl shadow-[0_2px_8px_-2px_rgba(22,23,24,0.05)] group-hover:shadow-lg group-hover:shadow-purple-500/10 transition-all duration-500" />
                        
                        {/* Gradient overlay with subtle color */}
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 via-white/50 to-blue-50/50 rounded-2xl opacity-40 group-hover:opacity-60 transition-all duration-500" />
                        
                        {/* Enhanced border effect */}
                        <div className="absolute inset-0 ring-1 ring-inset ring-gray-200 group-hover:ring-purple-200 rounded-2xl transition-all duration-500" />
                        <div className="absolute inset-[1px] ring-1 ring-inset ring-black/[0.025] group-hover:ring-purple-900/[0.05] rounded-[15px] transition-all duration-500" />
                        
                        {/* Hover glow effect */}
                        <div className="absolute -inset-0.5 bg-gradient-to-br from-purple-500/[0.07] via-transparent to-blue-500/[0.07] rounded-[1rem] opacity-0 group-hover:opacity-100 blur transition-all duration-500" />
                        
                        {/* Content container */}
                        <div className="relative p-6 flex flex-col h-full group-hover:translate-y-[-2px] transition-all duration-500">
                          {/* Header with Image and Title */}
                          <div className="flex items-start gap-4 mb-3">
                            <div className="relative shrink-0 group-hover:scale-[1.02] transition-transform duration-500">
                              <div className="w-16 h-16 rounded-xl overflow-hidden bg-gradient-to-br from-purple-100/80 to-blue-50/80 shadow-sm ring-1 ring-black/[0.08] group-hover:shadow-md group-hover:shadow-purple-500/10 transition-all duration-500">
                                <img
                                  src={getToolLogo(tool)}
                                  alt={tool.name}
                                  className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-[1.05]"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.onerror = null;
                                    target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(tool.name)}&background=6366f1&color=fff&bold=true&format=svg&size=128`;
                                  }}
                                />
                              </div>
                              {(tool.isTrending || tool.isNew) && (
                                <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-md transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                                  {tool.isTrending ? (
                                    <div className="bg-gradient-to-r from-orange-500 to-pink-500 rounded-full p-1">
                                      <TrendingUp className="w-3 h-3 text-white" />
                                    </div>
                                  ) : (
                                    <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-full p-1">
                                      <Sparkles className="w-3 h-3 text-white" />
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <h3 className="text-lg font-semibold text-gray-900 truncate group-hover:text-purple-600 transition-all duration-500">
                                {tool.name}
                              </h3>
                              <div className="flex items-center gap-2 mt-1.5">
                                <div className="flex items-center bg-yellow-50 px-2 py-0.5 rounded-full group-hover:bg-yellow-100 group-hover:scale-[1.02] transition-all duration-500">
                                  <Star className="w-3.5 h-3.5 text-yellow-500" />
                                  <span className="ml-1 text-sm font-medium text-yellow-700">{tool.rating}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Description with improved readability */}
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2 group-hover:text-gray-700 transition-all duration-500">
                            {tool.description}
                          </p>

                          {/* Tags Row with enhanced interactivity */}
                          <div className="flex flex-wrap gap-2 mb-4">
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium bg-gray-100/80 text-gray-600 group-hover:bg-gray-200 group-hover:text-gray-700 group-hover:scale-[1.02] transition-all duration-500">
                              <Tag className="w-3 h-3 text-gray-400 group-hover:text-gray-500 transition-colors duration-500" />
                              {tool.category}
                            </span>
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium bg-purple-100/80 text-purple-600 group-hover:bg-purple-200 group-hover:text-purple-700 group-hover:scale-[1.02] transition-all duration-500">
                              <Zap className="w-3 h-3" />
                              {tool.pricing.type}
                            </span>
                          </div>

                          {/* Bottom Stats with subtle animations */}
                          <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto group-hover:border-gray-200 transition-all duration-500">
                            <div className="flex items-center gap-1.5 text-gray-500 group-hover:text-gray-600 transition-all duration-500">
                              <Eye className="w-4 h-4 group-hover:scale-110 transition-transform duration-500" />
                              <AnimatedCounter value={tool.views} className="text-sm" />
                            </div>
                            <div className="flex items-center gap-1.5 text-gray-500 group-hover:text-gray-600 transition-all duration-500">
                              <ArrowUp className="w-4 h-4 group-hover:scale-110 transition-transform duration-500" />
                              <AnimatedCounter value={tool.votes} className="text-sm" />
                            </div>
                          </div>
                        </div>
                      </article>
                    </Link>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Load More Button */}
        {(hasMore || loading) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-12 text-center relative z-10"
          >
            <Button
              onClick={fetchMoreData}
              variant="ghost"
              className="w-full bg-purple-50 hover:bg-purple-100 text-purple-500 hover:text-purple-600 flex items-center justify-center gap-2 py-6 rounded-xl"
            >
              Load More Tools <ChevronDown className="h-5 w-5" />
            </Button>
          </motion.div>
        )}
      </div>

      {/* FOMO Notification */}
      <AnimatePresence>
        {showFomo && currentFomo && (
          <motion.div
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="fixed bottom-6 left-6 z-50"
          >
            <Link
              to={`/ai-tools/${currentFomo.tool.slug}`}
              className="flex items-center gap-3 bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-purple-100 hover:shadow-purple-100/50 transition-all duration-300 group hover:translate-x-1"
            >
              <div className="relative">
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-gradient-to-br from-purple-100 to-blue-50">
                  <img
                    src={getToolLogo(currentFomo.tool)}
                    alt={currentFomo.tool.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentFomo.tool.name)}&background=6366f1&color=fff&bold=true&format=svg&size=128`;
                    }}
                  />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1 shadow-md">
                  {currentFomo.activity.type === 'view' && (
                    <div className="bg-blue-500 rounded-full p-1">
                      <Users className="w-3 h-3 text-white" />
                    </div>
                  )}
                  {currentFomo.activity.type === 'upvote' && (
                    <div className="bg-red-500 rounded-full p-1">
                      <Heart className="w-3 h-3 text-white" />
                    </div>
                  )}
                  {currentFomo.activity.type === 'visit' && (
                    <div className="bg-green-500 rounded-full p-1">
                      <ExternalLink className="w-3 h-3 text-white" />
                    </div>
                  )}
                  {currentFomo.activity.type === 'comment' && (
                    <div className="bg-yellow-500 rounded-full p-1">
                      <MessageSquare className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
              </div>
              <div className="pr-4">
                <p className="text-sm text-gray-600">{currentFomo.activity.message}</p>
                <p className="text-sm font-medium text-gray-900">{currentFomo.tool.name}</p>
              </div>
              <div className="flex items-center self-stretch pl-4 border-l border-gray-100">
                <div className="text-xs font-medium text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  View →
                </div>
              </div>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}