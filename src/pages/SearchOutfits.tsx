import { useState } from 'react';
import { motion } from 'framer-motion';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search as SearchIcon, 
  ExternalLink,
  ShoppingBag,
  Star,
  Filter
} from 'lucide-react';

// Mock data for demo - in production this would come from an API
const mockResults = [
  {
    id: 1,
    name: 'Classic Oxford Button-Down Shirt',
    category: 'shirt',
    price: 49.99,
    originalPrice: 79.99,
    store: 'Nordstrom',
    rating: 4.5,
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=300&h=400&fit=crop',
    url: 'https://nordstrom.com'
  },
  {
    id: 2,
    name: 'Slim Fit Chino Pants',
    category: 'pants',
    price: 39.99,
    originalPrice: 59.99,
    store: 'H&M',
    rating: 4.2,
    image: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=300&h=400&fit=crop',
    url: 'https://hm.com'
  },
  {
    id: 3,
    name: 'Leather Chelsea Boots',
    category: 'shoes',
    price: 129.99,
    originalPrice: 189.99,
    store: 'Zappos',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1638247025967-b4e38f787b76?w=300&h=400&fit=crop',
    url: 'https://zappos.com'
  },
  {
    id: 4,
    name: 'Wool Blend Blazer',
    category: 'jacket',
    price: 159.99,
    originalPrice: 249.99,
    store: 'Zara',
    rating: 4.4,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop',
    url: 'https://zara.com'
  },
  {
    id: 5,
    name: 'Cotton Crew Neck T-Shirt',
    category: 'shirt',
    price: 24.99,
    originalPrice: 34.99,
    store: 'Uniqlo',
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=400&fit=crop',
    url: 'https://uniqlo.com'
  },
  {
    id: 6,
    name: 'Classic Baseball Cap',
    category: 'cap',
    price: 19.99,
    originalPrice: 29.99,
    store: 'New Era',
    rating: 4.3,
    image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=300&h=400&fit=crop',
    url: 'https://neweracap.com'
  },
];

const categories = [
  { value: 'all', label: 'All Categories' },
  { value: 'shirt', label: 'Shirts & Tops' },
  { value: 'pants', label: 'Pants' },
  { value: 'jacket', label: 'Jackets' },
  { value: 'shoes', label: 'Shoes' },
  { value: 'cap', label: 'Caps & Hats' },
  { value: 'accessories', label: 'Accessories' },
];

export default function SearchOutfits() {
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [results, setResults] = useState(mockResults);
  const [loading, setLoading] = useState(false);

  const handleSearch = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      let filtered = mockResults;
      
      if (category !== 'all') {
        filtered = filtered.filter(item => item.category === category);
      }
      
      if (searchQuery) {
        filtered = filtered.filter(item => 
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.store.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      
      setResults(filtered);
      setLoading(false);
    }, 500);
  };

  const handleShop = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <AppLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Header */}
        <div>
          <h1 className="text-3xl font-display font-bold mb-2">Find the Best Deals</h1>
          <p className="text-muted-foreground">Search for clothing items and find the best prices across stores</p>
        </div>

        {/* Search Bar */}
        <Card variant="glass">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search for shirts, pants, shoes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-12"
                />
              </div>
              
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-full md:w-48">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button variant="gold" onClick={handleSearch} disabled={loading}>
                <SearchIcon className="w-5 h-5 mr-2" />
                Search
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          </div>
        ) : results.length === 0 ? (
          <Card variant="glass" className="p-12 text-center">
            <SearchIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-display font-semibold mb-2">No results found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filters</p>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card variant="elevated" className="overflow-hidden group">
                  <div className="aspect-[3/4] relative overflow-hidden">
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-3 py-1 rounded-full bg-destructive text-destructive-foreground text-xs font-semibold">
                        {Math.round((1 - item.price / item.originalPrice) * 100)}% OFF
                      </span>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-1 mb-2">
                      <Star className="w-4 h-4 fill-primary text-primary" />
                      <span className="text-sm font-medium">{item.rating}</span>
                      <span className="text-sm text-muted-foreground">• {item.store}</span>
                    </div>
                    <h3 className="font-medium mb-2 line-clamp-2">{item.name}</h3>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-xl font-bold text-primary">${item.price}</span>
                      <span className="text-sm text-muted-foreground line-through">${item.originalPrice}</span>
                    </div>
                    <Button 
                      variant="gold" 
                      className="w-full"
                      onClick={() => handleShop(item.url)}
                    >
                      <ShoppingBag className="w-4 h-4 mr-2" />
                      Shop Now
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Info Note */}
        <Card variant="glass" className="p-4">
          <p className="text-sm text-muted-foreground text-center">
            💡 Tip: Click on any item to be redirected to the store for the best available deal. 
            Prices are updated regularly to ensure you get the best value.
          </p>
        </Card>
      </motion.div>
    </AppLayout>
  );
}
