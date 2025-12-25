import { useState, useRef } from 'react';
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
  MousePointerClick,
  Upload,
  ImagePlus,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

import fashionModel1 from '@/assets/fashion-model-1.jpg';
import fashionModel2 from '@/assets/fashion-model-2.jpg';
import fashionModel3 from '@/assets/fashion-model-3.jpg';
import fashionModel4 from '@/assets/fashion-model-4.jpg';

interface DetectedItem {
  id: string;
  label: string;
  category: string;
  x: number;
  y: number;
  color?: string;
  style?: string;
}

interface Lookbook {
  id: number;
  image: string;
  title: string;
  hotspots: DetectedItem[];
  isUploaded?: boolean;
}

// Fashion lookbooks with clickable hotspots
const defaultLookbooks: Lookbook[] = [
  {
    id: 1,
    image: fashionModel1,
    title: 'Urban Chic',
    hotspots: [
      { id: 'jacket', x: 50, y: 25, label: 'Camel Trench Coat', category: 'Outerwear' },
      { id: 'top', x: 50, y: 40, label: 'Sage Crop Top', category: 'Tops' },
      { id: 'pants', x: 50, y: 60, label: 'Khaki Chinos', category: 'Bottoms' },
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
      { id: 'pants', x: 50, y: 65, label: 'Charcoal Trousers', category: 'Bottoms' },
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
      { id: 'pants', x: 50, y: 65, label: 'High-Waist Trousers', category: 'Bottoms' },
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
      { id: 'joggers', x: 50, y: 62, label: 'Side-Stripe Joggers', category: 'Bottoms' },
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
};

// Default results for items without specific mock data
const getDefaultResults = (itemName: string, category: string) => [
  { id: 100, name: `${itemName} - Best Match`, price: 59.99, originalPrice: 89.99, store: 'Nordstrom', rating: 4.3, image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=300&h=400&fit=crop', url: 'https://nordstrom.com' },
  { id: 101, name: `Similar ${category} Item`, price: 44.99, originalPrice: 69.99, store: 'ASOS', rating: 4.1, image: 'https://images.unsplash.com/photo-1467043237213-65f2da53396f?w=300&h=400&fit=crop', url: 'https://asos.com' },
  { id: 102, name: `${category} Alternative`, price: 79.99, originalPrice: 119.99, store: 'Zara', rating: 4.5, image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300&h=400&fit=crop', url: 'https://zara.com' },
];

export default function SearchOutfits() {
  const [lookbooks, setLookbooks] = useState<Lookbook[]>(defaultLookbooks);
  const [selectedLook, setSelectedLook] = useState<Lookbook | null>(null);
  const [selectedItem, setSelectedItem] = useState<{ label: string; category: string } | null>(null);
  const [searchResults, setSearchResults] = useState<typeof mockSearchResults[string]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setUploading(true);
    
    try {
      // Convert to base64
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64Image = event.target?.result as string;
        
        // Create preview URL
        const previewUrl = URL.createObjectURL(file);
        
        toast.info('Analyzing your outfit...', { duration: 3000 });
        
        // Call AI to detect clothing items
        const { data, error } = await supabase.functions.invoke('detect-clothing', {
          body: { image: base64Image }
        });

        if (error) {
          console.error('Error detecting clothing:', error);
          toast.error('Failed to analyze image. Please try again.');
          setUploading(false);
          return;
        }

        const detectedItems: DetectedItem[] = (data.items || []).map((item: any, index: number) => ({
          id: `uploaded-${index}`,
          label: item.label || 'Unknown Item',
          category: item.category || 'Clothing',
          x: item.x || 50,
          y: item.y || 50,
          color: item.color,
          style: item.style,
        }));

        if (detectedItems.length === 0) {
          toast.warning('No clothing items detected. Try a clearer image.');
        } else {
          toast.success(`Found ${detectedItems.length} items in your photo!`);
        }

        // Add as new lookbook
        const newLookbook: Lookbook = {
          id: Date.now(),
          image: previewUrl,
          title: 'Your Upload',
          hotspots: detectedItems,
          isUploaded: true,
        };

        setLookbooks(prev => [newLookbook, ...prev]);
        setSelectedLook(newLookbook);
        setUploading(false);
      };

      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Upload error:', err);
      toast.error('Failed to upload image');
      setUploading(false);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleHotspotClick = (hotspot: { label: string; category: string }) => {
    setLoading(true);
    setSelectedItem(hotspot);
    
    // Simulate API search
    setTimeout(() => {
      const results = mockSearchResults[hotspot.label] || getDefaultResults(hotspot.label, hotspot.category);
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

  const removeUploadedLook = (lookId: number) => {
    setLookbooks(prev => prev.filter(l => l.id !== lookId));
    if (selectedLook?.id === lookId) {
      setSelectedLook(null);
      closeResults();
    }
  };

  return (
    <AppLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold mb-2">Visual Search</h1>
            <p className="text-muted-foreground">Upload a photo or click on outfit items to find where to buy them</p>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />
            <Button 
              variant="gold" 
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5 mr-2" />
                  Upload Photo
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Upload Card */}
        <Card 
          variant="glass" 
          className="border-dashed border-2 border-primary/30 cursor-pointer hover:border-primary/50 transition-colors"
          onClick={() => !uploading && fileInputRef.current?.click()}
        >
          <CardContent className="p-8">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                {uploading ? (
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                ) : (
                  <ImagePlus className="w-8 h-8 text-primary" />
                )}
              </div>
              <h3 className="text-lg font-display font-semibold mb-2">
                {uploading ? 'Analyzing your outfit...' : 'Upload Your Own Outfit'}
              </h3>
              <p className="text-sm text-muted-foreground max-w-md">
                {uploading 
                  ? 'Our AI is detecting clothing items in your photo'
                  : 'Drop an image here or click to upload. Our AI will detect all clothing items so you can shop them instantly.'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Lookbook Grid */}
        <div>
          <h2 className="text-xl font-display font-semibold mb-4">Lookbooks</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {lookbooks.map((look, index) => (
              <motion.div
                key={look.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card 
                  variant="elevated" 
                  className={`overflow-hidden cursor-pointer group relative ${look.isUploaded ? 'ring-2 ring-primary' : ''}`}
                  onClick={() => setSelectedLook(look)}
                >
                  {look.isUploaded && (
                    <button
                      onClick={(e) => { e.stopPropagation(); removeUploadedLook(look.id); }}
                      className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full bg-background/80 flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
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
                      <div className="flex items-center gap-2 mb-1">
                        {look.isUploaded && (
                          <span className="px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-xs">Your Photo</span>
                        )}
                      </div>
                      <h3 className="text-lg font-display font-semibold text-foreground mb-1">{look.title}</h3>
                      <p className="text-sm text-muted-foreground">{look.hotspots.length} shoppable items</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
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
                      <div className="flex items-center gap-2 mb-2">
                        {selectedLook.isUploaded && (
                          <span className="px-2 py-1 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                            Your Upload
                          </span>
                        )}
                        <h2 className="text-2xl font-display font-bold">{selectedLook.title}</h2>
                      </div>
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
                    {selectedLook.hotspots.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center p-8">
                        <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mb-6">
                          <Sparkles className="w-10 h-10 text-muted-foreground" />
                        </div>
                        <h3 className="text-xl font-display font-semibold mb-2">No Items Detected</h3>
                        <p className="text-muted-foreground max-w-xs">
                          We couldn't detect any clothing items in this image. Try uploading a clearer photo with visible clothing.
                        </p>
                      </div>
                    ) : !selectedItem ? (
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
                <strong>Upload your own photo</strong> and our AI will automatically detect all clothing items. 
                Or browse our curated lookbooks. Click on any item to find it across multiple stores at the best prices.
              </p>
            </div>
          </div>
        </Card>
      </motion.div>
    </AppLayout>
  );
}
