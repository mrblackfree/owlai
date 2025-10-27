import React, { useState, useEffect, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Sparkles, ChevronRight, MessageCircle, X, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SearchDialog } from "@/components/SearchDialog";
import { Tool } from "@/types/tool";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from 'react-i18next';

// Mock tool data type to match Tool interface
interface MockTool extends Partial<Tool> {
  id: string;
  name: string;
  slug: string;
  logo: string;
  description: string;
  rating: number;
  category: string;
  views: number;
  isTrending: boolean;
  createdAt: string;
}

interface HeroSectionProps {
  searchQuery?: string;
  setSearchQuery?: React.Dispatch<React.SetStateAction<string>>;
  setIsSearchOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  siteDescription?: string;
}

export const HeroSection = ({ 
  searchQuery: externalSearchQuery, 
  setSearchQuery: externalSetSearchQuery,
  setIsSearchOpen: externalSetIsSearchOpen,
  siteDescription
}: HeroSectionProps) => {
  const { t } = useTranslation(['pages', 'common']);
  
  // Use internal state if no external state is provided
  const [internalSearchQuery, setInternalSearchQuery] = useState("");
  const [internalIsSearchOpen, setInternalIsSearchOpen] = useState(false);
  
  // Use the props if provided, otherwise use internal state
  const searchQuery = externalSearchQuery !== undefined ? externalSearchQuery : internalSearchQuery;
  const setSearchQuery = externalSetSearchQuery || setInternalSearchQuery;
  const setIsSearchOpen = externalSetIsSearchOpen || setInternalIsSearchOpen;
  
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatQuery, setChatQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<MockTool[]>([]);
  const [toolsCount, setToolsCount] = useState(12114); // Default fallback
  
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL;

  // Fetch tools count from API
  useEffect(() => {
    const fetchToolsCount = async () => {
      try {
        const response = await fetch(`${API_URL}/api/tools/stats`);
        if (response.ok) {
          const data = await response.json();
          setToolsCount(data.totalTools || 12114);
        }
      } catch (error) {
        console.log('Using fallback tools count'); // Fallback to default if API fails
      }
    };

    fetchToolsCount();
  }, [API_URL]);

  const handleSearchClick = () => {
    setIsSearchOpen(true);
  };

  const handleSelectTool = (tool: Tool) => {
    navigate(`/ai-tools/${tool.slug}`);
  };

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatQuery.trim()) return;
    
    // Simulated API call to get recommendations
    setIsLoading(true);
    
    // This would normally be an API call to get recommendations based on the query
    setTimeout(() => {
      // Larger pool of mock tools to select from
      const allTools: MockTool[] = [
        {
          id: '1',
          name: 'Jasper',
          slug: 'jasper',
          logo: 'https://logo.clearbit.com/jasper.ai',
          description: 'AI writing assistant for marketing and content creation',
          rating: 4.8,
          category: 'Content Creation',
          views: 50000,
          isTrending: true,
          createdAt: new Date().toISOString(),
          _id: '1',
          websiteUrl: 'https://jasper.ai',
          tags: ['writing', 'marketing', 'content'],
          pricing: { type: 'freemium' }
        },
        {
          id: '2',
          name: 'Midjourney',
          slug: 'midjourney',
          logo: 'https://logo.clearbit.com/midjourney.com',
          description: 'Advanced AI art and image generation platform',
          rating: 4.9,
          category: 'Image Generation',
          views: 48000,
          isTrending: true,
          createdAt: new Date().toISOString(),
          _id: '2',
          websiteUrl: 'https://midjourney.com',
          tags: ['image', 'art', 'design'],
          pricing: { type: 'paid', startingPrice: 10 }
        },
        {
          id: '3',
          name: 'Claude',
          slug: 'claude',
          logo: 'https://logo.clearbit.com/claude.ai',
          description: 'Advanced AI research and chatbot assistant',
          rating: 4.8,
          category: 'AI Assistant',
          views: 45000,
          isTrending: true,
          createdAt: new Date().toISOString(),
          _id: '3',
          websiteUrl: 'https://claude.ai',
          tags: ['chatbot', 'assistant', 'research'],
          pricing: { type: 'freemium' }
        },
        {
          id: '4',
          name: 'Runway',
          slug: 'runway',
          logo: 'https://logo.clearbit.com/runwayml.com',
          description: 'AI-powered video editing and generation',
          rating: 4.7,
          category: 'Video Creation',
          views: 42000,
          isTrending: false,
          createdAt: new Date().toISOString(),
          _id: '4',
          websiteUrl: 'https://runwayml.com',
          tags: ['video', 'editing', 'generation'],
          pricing: { type: 'paid', startingPrice: 15 }
        },
        {
          id: '5',
          name: 'Replicate',
          slug: 'replicate',
          logo: 'https://logo.clearbit.com/replicate.com',
          description: 'Platform for running AI models in the cloud',
          rating: 4.8,
          category: 'AI Platform',
          views: 40000,
          isTrending: false,
          createdAt: new Date().toISOString(),
          _id: '5',
          websiteUrl: 'https://replicate.com',
          tags: ['platform', 'cloud', 'models'],
          pricing: { type: 'paid' }
        },
        {
          id: '6',
          name: 'Copy.ai',
          slug: 'copy-ai',
          logo: 'https://logo.clearbit.com/copy.ai',
          description: 'AI copywriting tool for generating marketing content and headlines',
          rating: 4.6,
          category: 'Content Creation',
          views: 38000,
          isTrending: true,
          createdAt: new Date().toISOString(),
          _id: '6',
          websiteUrl: 'https://copy.ai',
          tags: ['writing', 'copywriting', 'marketing'],
          pricing: { type: 'freemium' }
        },
        {
          id: '7',
          name: 'Notion AI',
          slug: 'notion-ai',
          logo: 'https://logo.clearbit.com/notion.so',
          description: 'AI writing assistant integrated with Notion workspace',
          rating: 4.5,
          category: 'Productivity',
          views: 35000,
          isTrending: true,
          createdAt: new Date().toISOString(),
          _id: '7',
          websiteUrl: 'https://notion.so',
          tags: ['writing', 'productivity', 'organization'],
          pricing: { type: 'paid', startingPrice: 8 }
        },
        {
          id: '8',
          name: 'Stable Diffusion',
          slug: 'stable-diffusion',
          logo: 'https://logo.clearbit.com/stability.ai',
          description: 'Open-source image generation model for creating artwork',
          rating: 4.7,
          category: 'Image Generation',
          views: 45000,
          isTrending: true,
          createdAt: new Date().toISOString(),
          _id: '8',
          websiteUrl: 'https://stability.ai',
          tags: ['image', 'art', 'open-source'],
          pricing: { type: 'free' }
        },
        {
          id: '9',
          name: 'GitHub Copilot',
          slug: 'github-copilot',
          logo: 'https://logo.clearbit.com/github.com',
          description: 'AI pair programmer that helps write better code',
          rating: 4.9,
          category: 'Coding',
          views: 60000,
          isTrending: true,
          createdAt: new Date().toISOString(),
          _id: '9',
          websiteUrl: 'https://github.com/features/copilot',
          tags: ['coding', 'programming', 'development'],
          pricing: { type: 'paid', startingPrice: 10 }
        },
        {
          id: '10',
          name: 'Otter.ai',
          slug: 'otter-ai',
          logo: 'https://logo.clearbit.com/otter.ai',
          description: 'AI-powered meeting notes and voice transcription',
          rating: 4.6,
          category: 'Transcription',
          views: 32000,
          isTrending: false,
          createdAt: new Date().toISOString(),
          _id: '10',
          websiteUrl: 'https://otter.ai',
          tags: ['transcription', 'meetings', 'notes'],
          pricing: { type: 'freemium' }
        },
        {
          id: '11',
          name: 'Gamma',
          slug: 'gamma',
          logo: 'https://logo.clearbit.com/gamma.app',
          description: 'AI-powered presentation and document creation',
          rating: 4.7,
          category: 'Presentation',
          views: 28000,
          isTrending: true,
          createdAt: new Date().toISOString(),
          _id: '11',
          websiteUrl: 'https://gamma.app',
          tags: ['presentation', 'slides', 'documents'],
          pricing: { type: 'freemium' }
        },
        {
          id: '12',
          name: 'Descript',
          slug: 'descript',
          logo: 'https://logo.clearbit.com/descript.com',
          description: 'AI-powered audio and video editing platform',
          rating: 4.8,
          category: 'Audio Editing',
          views: 30000,
          isTrending: false,
          createdAt: new Date().toISOString(),
          _id: '12',
          websiteUrl: 'https://descript.com',
          tags: ['audio', 'video', 'editing', 'podcast'],
          pricing: { type: 'freemium' }
        }
      ];

      // Function to find relevance score between query and tool
      const getRelevanceScore = (query: string, tool: MockTool) => {
        const queryLower = query.toLowerCase();
        const queryWords = queryLower.split(/\s+/).filter(word => word.length > 2);
        
        let score = 0;
        
        // Check tags
        tool.tags.forEach(tag => {
          if (queryLower.includes(tag.toLowerCase())) {
            score += 3;
          }
        });
        
        // Check category
        if (queryLower.includes(tool.category.toLowerCase())) {
          score += 5;
        }
        
        // Check description and name
        queryWords.forEach(word => {
          if (tool.description.toLowerCase().includes(word)) {
            score += 2;
          }
          if (tool.name.toLowerCase().includes(word)) {
            score += 2;
          }
        });
        
        // Boost trending items slightly
        if (tool.isTrending) {
          score += 1;
        }
        
        return score;
      };
      
      // Sort tools by relevance to the query
      const sortedTools = [...allTools].sort((a, b) => {
        const scoreA = getRelevanceScore(chatQuery, a);
        const scoreB = getRelevanceScore(chatQuery, b);
        return scoreB - scoreA;
      });
      
      // Select a varying number of tools (3-6) depending on the relevance
      // Make sure we show at least 3 tools
      const relevantTools = sortedTools.filter(tool => getRelevanceScore(chatQuery, tool) > 0);
      const numTools = Math.min(Math.max(3, relevantTools.length), 6);
      
      setRecommendations(sortedTools.slice(0, numTools));
      setIsLoading(false);
    }, 1500);
  };

  const resetChat = () => {
    setChatQuery("");
    setRecommendations([]);
  };

  // Define platform icons with proper domains for Clearbit
  const platformIcons = [
    { name: 'Google', domain: 'google.com', position: { left: '5%', top: '18%' } },
    { name: 'GitHub', domain: 'github.com', position: { left: '8%', top: '38%' } },
    { name: 'Slack', domain: 'slack.com', position: { right: '12%', top: '20%' } },
    { name: 'Notion', domain: 'notion.so', position: { right: '8%', top: '42%' } },
    { name: 'Figma', domain: 'figma.com', position: { left: '12%', bottom: '22%' } },
    { name: 'OpenAI', domain: 'openai.com', position: { right: '15%', bottom: '28%' } },
    { name: 'Microsoft', domain: 'microsoft.com', position: { left: '18%', top: '25%' } },
    { name: 'Discord', domain: 'discord.com', position: { right: '20%', top: '33%' } },
    { name: 'LinkedIn', domain: 'linkedin.com', position: { left: '15%', bottom: '32%' } },
  ];

  // Function to handle image loading errors
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>, name: string) => {
    const target = e.target as HTMLImageElement;
    target.onerror = null;
    target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366f1&color=fff&bold=true&format=svg&size=128`;
  };

  return (
    <div className="relative px-3 sm:px-4 pt-28 pb-16 sm:pb-20 sm:px-6 lg:px-8 lg:pt-40 lg:pb-24 overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-gray-50/50 to-white" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(56,189,128,0.08),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(59,130,246,0.08),transparent_60%)]" />
      
      {/* Platform Icons - Using Clearbit and organized with better spacing */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Desktop icons */}
        {platformIcons.map((icon, index) => (
          <div 
            key={icon.domain}
            className="absolute hidden lg:block"
            style={{
              ...icon.position,
              zIndex: 1
            }}
          >
            <motion.div 
              initial={{ opacity: 0, y: index % 2 === 0 ? -10 : 10 }}
              animate={{ opacity: 0.9, y: 0 }}
              transition={{ 
                duration: 0.6, 
                delay: 0.15 * index, 
                ease: "easeOut" 
              }}
              className="bg-white/90 shadow-md backdrop-blur-sm rounded-xl p-2.5 w-14 h-14 flex items-center justify-center border border-gray-100"
            >
              <img 
                src={`https://logo.clearbit.com/${icon.domain}`}
                alt={icon.name}
                className="w-8 h-8 object-contain"
                onError={(e) => handleImageError(e, icon.name)}
              />
            </motion.div>
          </div>
        ))}

        {/* Mobile icons - only show a few strategic ones */}
        <div className="absolute top-12 right-6 lg:hidden">
          <div className="bg-white/90 shadow-sm backdrop-blur-sm rounded-xl p-2 w-10 h-10 flex items-center justify-center">
            <img 
              src={`https://logo.clearbit.com/github.com`}
              alt="GitHub"
              className="w-6 h-6 object-contain"
              onError={(e) => handleImageError(e, "GitHub")}
            />
          </div>
        </div>
        <div className="absolute bottom-20 left-6 lg:hidden">
          <div className="bg-white/90 shadow-sm backdrop-blur-sm rounded-xl p-2 w-10 h-10 flex items-center justify-center">
            <img 
              src={`https://logo.clearbit.com/openai.com`}
              alt="OpenAI"
              className="w-6 h-6 object-contain"
              onError={(e) => handleImageError(e, "OpenAI")}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative max-w-5xl mx-auto text-center">
        {/* Decorative element */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center justify-center p-1.5 rounded-full bg-gradient-to-r from-emerald-500/10 via-blue-500/10 to-purple-500/10 backdrop-blur-sm mb-6"
        >
          <div className="px-4 py-1.5 rounded-full bg-white border border-gray-100 shadow-sm">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-4 w-4 text-emerald-500" />
              <span className="text-sm font-medium text-gray-800">{toolsCount.toLocaleString()} {t('pages:home.toolsCount')}</span>
            </div>
          </div>
        </motion.div>
        
        {/* Hero headline */}
        <motion.h1 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight text-gray-900 mb-4 sm:mb-6 leading-tight"
        >
          {t('pages:home.hero.title')}
        </motion.h1>

        {/* Subtitle */}
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mx-auto mt-6 sm:mt-8 max-w-2xl text-lg sm:text-xl text-gray-600 leading-relaxed px-2 sm:px-0"
        >
          {siteDescription || t('pages:home.hero.subtitle')}
        </motion.p>

        {/* Search and Chat Options */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-8 sm:mt-12 max-w-xl sm:max-w-2xl mx-auto grid grid-cols-1 gap-3 sm:gap-4 px-1 sm:px-0"
        >
          {/* Search Bar */}
          <div className="relative group" onClick={handleSearchClick}>
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500 rounded-full blur opacity-10 group-hover:opacity-25 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative flex items-center cursor-pointer">
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 sm:pl-4 pointer-events-none">
                  <Search className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
                </div>
                <Input
                  type="text"
                  readOnly
                  placeholder={t('pages:home.hero.searchPlaceholder')}
                  className="pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 h-12 sm:h-14 w-full border-gray-200 rounded-full bg-white shadow-sm hover:shadow-md transition-shadow duration-200 focus:border-emerald-500 focus:ring-0 cursor-pointer text-sm sm:text-base"
                  onClick={handleSearchClick}
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-1 px-2 py-1 rounded-lg bg-gray-100/80 border border-gray-200/60">
                  <span className="text-xs font-medium text-gray-700">⌘</span>
                  <span className="text-xs font-medium text-gray-700">K</span>
                </div>
              </div>
            </div>
          </div>

          {/* AI Assistant Button and Chat Panel */}
          <div className="relative w-full">
            {!isChatOpen ? (
              <Button 
                onClick={() => setIsChatOpen(true)}
                className="w-full h-12 sm:h-14 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-full shadow-sm flex items-center justify-center gap-2 group px-3 sm:px-4"
              >
                <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5 transition-transform group-hover:scale-110 flex-shrink-0" />
                <span className="font-medium text-sm sm:text-base truncate">{t('pages:home.hero.askAiRecommend')}</span>
              </Button>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 p-3 sm:p-4 w-full"
              >
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8 bg-green-100 flex items-center justify-center">
                      <MessageCircle className="h-4 w-4 text-green-600" />
                    </Avatar>
                    <h3 className="font-medium text-gray-900">AI Tool Finder</h3>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0 rounded-full"
                    onClick={() => {
                      setIsChatOpen(false);
                      resetChat();
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {recommendations.length === 0 ? (
                  <form onSubmit={handleChatSubmit} className="mb-2">
                    <div className="relative">
                      <Input
                        value={chatQuery}
                        onChange={(e) => setChatQuery(e.target.value)}
                        placeholder="e.g., I need tools for content writing"
                        className="pr-24 py-2 h-12 border-gray-200 rounded-lg"
                        disabled={isLoading}
                      />
                      <Button 
                        type="submit"
                        className="absolute right-1 top-1 h-10 bg-green-500 hover:bg-green-600 text-white rounded-md"
                        disabled={isLoading || !chatQuery.trim()}
                      >
                        {isLoading ? (
                          <div className="flex items-center gap-2">
                            <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Finding...</span>
                          </div>
                        ) : (
                          <span>Find Tools</span>
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Describe your use case or the problem you're trying to solve
                    </p>
                  </form>
                ) : (
                  <div className="mb-4">
                    <div className="bg-green-50 rounded-lg p-3 mb-4">
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Your query:</span> {chatQuery}
                      </p>
                    </div>
                    <div className="text-sm font-medium text-gray-700 mb-2">Recommended tools for you:</div>
                    <p className="text-xs text-gray-600 mb-3 italic">
                      {recommendations.length > 4 
                        ? `Here are the top ${recommendations.length} AI tools that match your needs.` 
                        : recommendations.length === 1 
                          ? "Here's the best AI tool that matches your query." 
                          : `Here are ${recommendations.length} AI tools that best match your requirements.`}
                      {recommendations[0].category && ` These focus on ${recommendations[0].category.toLowerCase()}`}
                      {recommendations.length > 1 && recommendations[1].category && recommendations[1].category !== recommendations[0].category && ` and ${recommendations[1].category.toLowerCase()}`}.
                    </p>
                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                      {recommendations.map((tool) => (
                        <div 
                          key={tool.id}
                          className="bg-white border border-gray-200 rounded-lg p-3 flex items-start hover:border-green-200 hover:shadow-sm transition-all"
                          onClick={() => navigate(`/ai-tools/${tool.slug}`)}
                        >
                          <div className="w-10 h-10 bg-white rounded-md flex items-center justify-center overflow-hidden mr-3 border border-gray-100">
                            <img 
                              src={tool.logo} 
                              alt={`${tool.name} logo`} 
                              className="w-7 h-7 object-contain"
                              onError={(e) => handleImageError(e, tool.name)}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h3 className="text-base font-semibold text-gray-900 truncate">{tool.name}</h3>
                              <div className="flex items-center">
                                <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                                <span className="text-xs text-gray-700 ml-1">{tool.rating}</span>
                              </div>
                            </div>
                            <p className="text-xs text-gray-600 line-clamp-2">
                              {tool.description}
                            </p>
                            <div className="mt-1">
                              <Badge variant="outline" className="text-xs bg-gray-50 text-gray-600 border-gray-100 rounded-full">
                                {tool.category}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full mt-3 border-gray-200"
                      onClick={resetChat}
                    >
                      Ask another question
                    </Button>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Feature tags */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-wrap justify-center gap-2.5 mt-10"
        >
          <div className="inline-flex items-center px-5 py-2 rounded-full text-sm bg-gradient-to-r from-emerald-500/10 to-emerald-500/20 text-emerald-700 font-medium border border-emerald-100 shadow-sm">
            <span>✦ {t('pages:home.hero.findPerfectTool')}</span>
          </div>
          <Button 
            variant="link" 
            className="text-sm text-emerald-600 hover:text-emerald-700 flex items-center font-medium"
            onClick={() => navigate('/categories')}
          >
            {t('pages:home.hero.browseCategories')} <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </motion.div>
      </div>

      {/* Search Dialog */}
      <SearchDialog 
        open={internalIsSearchOpen} 
        onOpenChange={setInternalIsSearchOpen}
        onSelectTool={handleSelectTool}
      />
    </div>
  );
}; 