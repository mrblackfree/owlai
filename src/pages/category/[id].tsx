import { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { ProductCard } from "@/components/ProductCard";
import { useTools } from "@/lib/api/tools";
import { useToolActions } from "@/hooks/useToolActions";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

export default function CategoryPage() {
  const { id } = useParams();
  const location = useLocation();
  const { data, isLoading, error } = useTools({ limit: 1000 });
  const tools = data?.data || [];
  const { toggleUpvote, isUpvoted, toggleSave, isSaved } = useToolActions();
  const [pageSize, setPageSize] = useState(9);

  // Get category name from state or from ID
  const categoryFromState = location.state?.category;
  const [categoryName, setCategoryName] = useState<string>("");
  
  useEffect(() => {
    // Set category name based on ID if not available from state
    if (categoryFromState) {
      setCategoryName(categoryFromState);
    } else {
      // Map ID to category name
      switch (id) {
        case "chatbots":
          setCategoryName("AI Chatbots and Assistants");
          break;
        case "image":
          setCategoryName("AI for Image Generation");
          break;
        case "code":
          setCategoryName("AI for Coding and Development");
          break;
        case "video":
          setCategoryName("AI for Video Generation");
          break;
        case "audio":
          setCategoryName("AI for Audio Enhancement");
          break;
        case "research":
          setCategoryName("AI Search Engines and Research Tools");
          break;
        case "productivity":
          setCategoryName("AI for Productivity");
          break;
        case "automation":
          setCategoryName("AI for Automation");
          break;
        default:
          setCategoryName("");
      }
    }
  }, [id, categoryFromState]);

  // Filter tools by category
  const filteredTools = tools.filter(tool => {
    if (!categoryName) return true;
    
    if (id === "code") {
      return (
        tool.category === "AI for Coding and Development" ||
        tool.category === "AI for Development"
      );
    } else if (id === "video") {
      return (
        tool.category === "AI for Video Generation" ||
        tool.category === "AI for Video Editing"
      );
    } else if (id === "audio") {
      return (
        tool.category === "AI for Audio Enhancement" ||
        tool.category === "AI for Music Generation" ||
        tool.category === "AI for Voice Generation"
      );
    } else {
      return tool.category === categoryName;
    }
  });

  const visibleTools = filteredTools.slice(0, pageSize);

  const handleVote = (e: React.MouseEvent | undefined, toolId: string, currentVotes: number = 0) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    toggleUpvote(toolId, currentVotes);
  };

  const handleFavorite = (toolId: string) => {
    toggleSave(toolId);
  };

  const loadMore = () => {
    setPageSize(prev => prev + 9);
  };

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

  // Get friendly category name for display
  const getFriendlyCategoryName = () => {
    switch (id) {
      case "chatbots": return "Chatbots & Assistants";
      case "image": return "Image Generation";
      case "code": return "Code & Development";
      case "video": return "Video & Animation";
      case "audio": return "Audio & Music";
      case "research": return "Research & Analysis";
      case "productivity": return "Productivity";
      case "automation": return "Automation";
      default: return categoryName;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 mt-20">
      <div className="mb-8">
        <Button 
          variant="ghost" 
          className="mb-4"
          onClick={() => window.history.back()}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <h1 className="text-4xl font-bold mb-4">
          {getFriendlyCategoryName()} Tools
        </h1>
        <p className="text-gray-600">
          Explore the best AI tools for {getFriendlyCategoryName().toLowerCase()}.
        </p>
      </div>

      {filteredTools.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">No tools found in this category</h2>
          <p className="text-gray-600 mb-6">We couldn't find any tools in this category at the moment.</p>
          <Button onClick={() => window.history.back()}>
            Go Back
          </Button>
        </div>
      ) : (
        <>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
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
                onFavorite={(e) => {
                  e.preventDefault();
                  handleFavorite(tool.id);
                }}
                pricing={convertPricingType(tool.pricing.type)}
                isNew={tool.isNew}
              />
            ))}
          </motion.div>

          {/* Load More */}
          {visibleTools.length < filteredTools.length && (
            <div className="flex justify-center mt-12">
              <Button 
                variant="outline"
                className="rounded-xl hover:bg-purple-50 border-purple-200"
                onClick={loadMore}
              >
                Load More
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
} 