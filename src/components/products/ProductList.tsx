import { ProductCard } from "@/components/ProductCard";
import { useState } from "react";
import { toast } from "sonner";
import { Link } from "react-router-dom";

interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  votes: number;
  imageUrl: string;
}

interface ProductListProps {
  products: Product[];
  currentPage: number;
  itemsPerPage: number;
}

export const ProductList = ({ products, currentPage, itemsPerPage }: ProductListProps) => {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [localProducts, setLocalProducts] = useState<Product[]>(products);

  const handleVote = (productId: string) => {
    setLocalProducts((prevProducts) =>
      prevProducts.map((product) =>
        product.id === productId
          ? { ...product, votes: product.votes + 1 }
          : product
      )
    );
    toast.success("Vote recorded successfully!");
  };

  const handleFavorite = (productId: string) => {
    setFavorites((prev) => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(productId)) {
        newFavorites.delete(productId);
        toast.success("Removed from favorites");
      } else {
        newFavorites.add(productId);
        toast.success("Added to favorites");
      }
      return newFavorites;
    });
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = localProducts.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedProducts.map((product, index) => (
          <Link 
            to={`/product/${product.id}`} 
            key={product.id}
            className="block transform hover:translate-y-[-4px] transition-transform duration-300 fade-in-up"
            style={{ 
              animationDelay: `${index * 0.1}s`,
              height: 'fit-content' 
            }}
          >
            <ProductCard 
              {...product} 
              onVote={() => handleVote(product.id)} 
              isFavorite={favorites.has(product.id)}
              onFavorite={(e) => {
                e.preventDefault(); // Prevent navigation when clicking favorite
                handleFavorite(product.id);
              }}
              showFavorite={true}
            />
          </Link>
        ))}
      </div>
      
      {paginatedProducts.length === 0 && (
        <div className="text-center text-gray-500 py-16 bg-white/50 backdrop-blur-sm rounded-lg shadow-sm">
          <div className="text-xl font-medium">No AI tools found</div>
          <p className="text-gray-400 mt-2">Try adjusting your search criteria</p>
        </div>
      )}
    </div>
  );
};