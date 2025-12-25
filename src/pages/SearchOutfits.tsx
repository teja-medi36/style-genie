import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Camera, 
  X, 
  ExternalLink, 
  ShoppingBag, 
  Star,
  Sparkles,
  MousePointerClick
} from 'lucide-react';

import fashionModel1 from '@/assets/fashion-model-1.jpg';
import fashionModel2 from '@/assets/fashion-model-2.jpg';
import fashionModel3 from '@/assets/fashion-model-3.jpg';
import fashionModel4 from '@/assets/fashion-model-4.jpg';

// Fashion lookbooks with clickable hotspots
const lookbooks = [
  {
    id: 1,
    image: fashionModel1,
    title: 'Urban Chic',
    hotspots: [
      { id: 'jacket', x: 50, y: 25, label: 'Camel Trench Coat', category: 'Outerwear' },
      { id: 'top', x: 50, y: 40, label: 'Sage Crop Top', category: 'Tops' },
      { id: 'pants', x: 50, y: 60, label: 'Khaki Chinos', category: 'Pants' },
      { id: 'boots', x: 50, y: 85, label: 'Black Ankle Boots', category: 'Shoes' },
    ]
  },
  {
    id: 2,
    image: fashionModel2,
    title: 'Casual Elegance',
    hotspots: [
      { id: 'coat', x: 50, y: 30, label: 'Beige Trench Coat', category: 'Outerwear' },
      { id: 'shirt', x: 50, y: 45, label: 'White V-Neck Tee', category: 'Tops' },
      { id: 'pants', x: 50, y: 65, label: 'Charcoal Trousers', category: 'Pants' },
      { id: 'shoes', x: 50, y: 88, label: 'Navy Sneakers', category: 'Shoes' },
    ]
  },
  {
    id: 3,
    image: fashionModel3,
    title: 'Power Suit',
    hotspots: [
      { id: 'blazer', x: 50, y: 32, label: 'Black Tailored Blazer', category: 'Outerwear' },
      { id: 'blouse', x: 50, y: 45, label: 'Silk Button-Up', category: 'Tops' },
      { id: 'pants', x: 50, y: 65, label: 'High-Waist Trousers', category: 'Pants' },
      { id: 'heels', x: 50, y: 90, label: 'Patent Leather Heels', category: 'Shoes' },
    ]
  },
  {
    id: 4,
    image: fashionModel4,
    title: 'Athleisure Mix',
    hotspots: [
      { id: 'jacket', x: 50, y: 28, label: 'Navy Bomber Jacket', category: 'Outerwear' },
      { id: 'sweater', x: 50, y: 42, label: 'Grey Sweatshirt', category: 'Tops' },
      { id: 'joggers', x: 50, y: 62, label: 'Side-Stripe Joggers', category: 'Pants' },
      { id: 'sneakers', x: 50, y: 88, label: 'Retro Running Shoes', category: 'Shoes' },
    ]
  },
];

// Mock search results for items
const mockSearchResults: Record<string, Array<{
  id: number;
  name: string;
  price: number;
  originalPrice: number;
  store: string;
  rating: number;
  image: string;
  url: string;
}>> = {
  'Camel Trench Coat': [
    { id: 1, name: 'Classic Camel Trench Coat', price: 149.99, originalPrice: 249.99, store: 'Zara', rating: 4.6, image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=300&h=400&fit=crop', url: 'https://zara.com' },
    { id: 2, name: 'Wool Blend Camel Coat', price: 199.99, originalPrice: 299.99, store: 'H&M', rating: 4.4, image: 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=300&h=400&fit=crop', url: 'https://hm.com' },
  ],
  'Sage Crop Top': [
    { id: 3, name: 'Ribbed Sage Crop Top', price: 24.99, originalPrice: 39.99, store: 'Forever 21', rating: 4.2, image: 'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=300&h=400&fit=crop', url: 'https://forever21.com' },
    { id: 4, name: 'Seamless Sage Bralette', price: 29.99, originalPrice: 44.99, store: 'Aritzia', rating: 4.7, image: 'https://images.unsplash.com/photo-1564557287817-3785e38ec1f5?w=300&h=400&fit=crop', url: 'https://aritzia.com' },
  ],
  'Khaki Chinos': [
    { id: 5, name: 'Relaxed Fit Khaki Chinos', price: 49.99, originalPrice: 79.99, store: 'Gap', rating: 4.5, image: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=300&h=400&fit=crop', url: 'https://gap.com' },
  ],
  'Black Ankle Boots': [
    { id: 6, name: 'Leather Ankle Boots', price: 129.99, originalPrice: 189.99, store: 'Steve Madden', rating: 4.8, image: 'https://images.unsplash.com/photo-1638247025967-b4e38f787b76?w=300&h=400&fit=crop', url: 'https://stevemadden.com' },
  ],
};

// Default results for items without specific mock data
const defaultResults = [
  { id: 100, name: 'Similar Style Item', price: 59.99, originalPrice: 89.99, store: 'Nordstrom', rating: 4.3, image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=300&h=400&fit=crop', url: 'https://nordstrom.com' },
  { id: 101, name: 'Best Match Alternative', price: 44.99, originalPrice: 69.99, store: 'ASOS', rating: 4.1, image: 'https://images.unsplash.com/photo-1467043237213-65f2da53396f?w=300&h=400&fit=crop', url: 'https://asos.com' },
];

export default function SearchOutfits() {
  const [selectedLook, setSelectedLook] = useState<typeof lookbooks[0] | null>(null);
  const [selectedItem, setSelectedItem] = useState<{ label: string; category: string } | null>(null);
  const [searchResults, setSearchResults] = useState<typeof defaultResults>([]);
  const [loading, setLoading] = useState(false);

  const handleHotspotClick = (hotspot: { label: string; category: string }) => {
    setLoading(true);
    setSelectedItem(hotspot);
    
    // Simulate API search
    setTimeout(() => {
      const results = mockSearchResults[hotspot.label] || defaultResults;
      setSearchResults(results);
      setLoading(false);
    }, 600);
  };

  const handleShop = (url: string) => {
    window.open(url, '_blank');
  };

  const closeResults = () => {
    setSelectedItem(null);
    setSearchResults([]);
  };

  return (
    <AppLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold mb-2">Visual Search</h1>
            <p className="text-muted-foreground">Click on any item in the outfits to find where to buy it</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm">
            <MousePointerClick className="w-4 h-4" />
            Click to Shop
          </div>
        </div>

        {/* Lookbook Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {lookbooks.map((look, index) => (
            <motion.div
              key={look.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card 
                variant="elevated" 
                className="overflow-hidden cursor-pointer group"
                onClick={() => setSelectedLook(look)}
              >
                <div className="aspect-[3/4] relative overflow-hidden">
                  <img 
                    src={look.image} 
                    alt={look.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
                  
                  {/* Hotspot indicators */}
                  {look.hotspots.map((hotspot) => (
                    <motion.div
                      key={hotspot.id}
                      className="absolute w-6 h-6 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                      style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity, delay: Math.random() }}
                    >
                      <div className="w-full h-full rounded-full bg-primary/60 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                      </div>
                    </motion.div>
                  ))}

                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-lg font-display font-semibold text-foreground mb-1">{look.title}</h3>
                    <p className="text-sm text-muted-foreground">{look.hotspots.length} shoppable items</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Expanded Lookbook Modal */}
        <AnimatePresence>
          {selectedLook && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
              onClick={() => { setSelectedLook(null); closeResults(); }}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="relative w-full max-w-6xl max-h-[90vh] overflow-hidden rounded-3xl bg-card border border-border shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-4 right-4 z-10 bg-background/50 backdrop-blur"
                  onClick={() => { setSelectedLook(null); closeResults(); }}
                >
                  <X className="w-5 h-5" />
                </Button>

                <div className="grid lg:grid-cols-2 h-full">
                  {/* Image with Hotspots */}
                  <div className="relative aspect-[3/4] lg:aspect-auto overflow-hidden">
                    <img 
                      src={selectedLook.image} 
                      alt={selectedLook.title}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Interactive Hotspots */}
                    {selectedLook.hotspots.map((hotspot) => (
                      <motion.button
                        key={hotspot.id}
                        className={`absolute w-10 h-10 -translate-x-1/2 -translate-y-1/2 rounded-full flex items-center justify-center transition-all ${
                          selectedItem?.label === hotspot.label 
                            ? 'bg-primary scale-125' 
                            : 'bg-background/80 hover:bg-primary hover:scale-110'
                        }`}
                        style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
                        onClick={() => handleHotspotClick(hotspot)}
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <ShoppingBag className={`w-5 h-5 ${
                          selectedItem?.label === hotspot.label ? 'text-primary-foreground' : 'text-foreground'
                        }`} />
                      </motion.button>
                    ))}

                    {/* Item Labels on Hover */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background to-transparent">
                      <h2 className="text-2xl font-display font-bold mb-2">{selectedLook.title}</h2>
                      <div className="flex flex-wrap gap-2">
                        {selectedLook.hotspots.map((hotspot) => (
                          <button
                            key={hotspot.id}
                            onClick={() => handleHotspotClick(hotspot)}
                            className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                              selectedItem?.label === hotspot.label
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground'
                            }`}
                          >
                            {hotspot.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Search Results Panel */}
                  <div className="p-6 overflow-y-auto max-h-[90vh] lg:max-h-none bg-background/50">
                    {!selectedItem ? (
                      <div className="h-full flex flex-col items-center justify-center text-center p-8">
                        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                          <Camera className="w-10 h-10 text-primary" />
                        </div>
                        <h3 className="text-xl font-display font-semibold mb-2">Click an Item</h3>
                        <p className="text-muted-foreground max-w-xs">
                          Tap on any hotspot in the image or select an item below to find where to buy it
                        </p>
                      </div>
                    ) : loading ? (
                      <div className="h-full flex items-center justify-center">
                        <div className="text-center">
                          <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto mb-4" />
                          <p className="text-muted-foreground">Searching for "{selectedItem.label}"...</p>
                        </div>
                      </div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Sparkles className="w-4 h-4 text-primary" />
                              <span className="text-sm text-primary font-medium">{selectedItem.category}</span>
                            </div>
                            <h3 className="text-xl font-display font-semibold">{selectedItem.label}</h3>
                          </div>
                          <Button variant="ghost" size="sm" onClick={closeResults}>
                            <X className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="space-y-4">
                          {searchResults.map((item, index) => (
                            <motion.div
                              key={item.id}
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                            >
                              <Card variant="glass" className="overflow-hidden">
                                <div className="flex gap-4 p-4">
                                  <div className="w-24 h-32 rounded-xl overflow-hidden flex-shrink-0">
                                    <img 
                                      src={item.image} 
                                      alt={item.name}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1 mb-1">
                                      <Star className="w-3 h-3 fill-primary text-primary" />
                                      <span className="text-xs font-medium">{item.rating}</span>
                                      <span className="text-xs text-muted-foreground">• {item.store}</span>
                                    </div>
                                    <h4 className="font-medium text-sm mb-2 line-clamp-2">{item.name}</h4>
                                    <div className="flex items-center gap-2 mb-3">
                                      <span className="text-lg font-bold text-primary">${item.price}</span>
                                      <span className="text-xs text-muted-foreground line-through">${item.originalPrice}</span>
                                      <span className="px-2 py-0.5 rounded-full bg-destructive/10 text-destructive text-xs font-medium">
                                        {Math.round((1 - item.price / item.originalPrice) * 100)}% off
                                      </span>
                                    </div>
                                    <Button 
                                      variant="gold" 
                                      size="sm" 
                                      className="w-full"
                                      onClick={() => handleShop(item.url)}
                                    >
                                      <ShoppingBag className="w-4 h-4 mr-2" />
                                      Shop Now
                                      <ExternalLink className="w-3 h-3 ml-2" />
                                    </Button>
                                  </div>
                                </div>
                              </Card>
                            </motion.div>
                          ))}
                        </div>

                        <p className="text-xs text-muted-foreground text-center pt-4">
                          Prices are updated regularly. Click to visit store for latest deals.
                        </p>
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Instructions Card */}
        <Card variant="glass" className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <MousePointerClick className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-display font-semibold mb-1">How Visual Search Works</h3>
              <p className="text-sm text-muted-foreground">
                Browse our curated lookbooks and click on any item you love. Our AI will instantly search across 
                multiple stores to find the exact item or similar alternatives at the best prices. 
                Look for the pulsing dots to discover shoppable items in each outfit.
              </p>
            </div>
          </div>
        </Card>
      </motion.div>
    </AppLayout>
  );
}
