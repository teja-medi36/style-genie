import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { 
  Camera, 
  X, 
  ExternalLink, 
  ShoppingBag, 
  Star,
  Sparkles,
  Upload,
  ImagePlus,
  Loader2,
  ArrowRight,
  MousePointerClick
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
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64Image = event.target?.result as string;
        const previewUrl = URL.createObjectURL(file);
        
        toast.info('Analyzing your outfit...', { duration: 3000 });
        
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

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleHotspotClick = (hotspot: { label: string; category: string }) => {
    setLoading(true);
    setSelectedItem(hotspot);
    
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
      <div className="relative min-h-full">
        <div className="absolute inset-0 hero-gradient pointer-events-none" />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative space-y-10"
        >
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl icon-box-lg flex items-center justify-center">
                  <Camera className="w-6 h-6 text-primary-foreground" />
                </div>
                <span className="text-primary text-sm font-semibold tracking-wider uppercase">
                  Visual Search
                </span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-display font-bold tracking-tight">
                Click to <span className="text-gradient-gold">Shop</span>
              </h1>
              <p className="text-muted-foreground text-lg max-w-lg">
                Upload a photo or click on outfit items to find where to buy them at the best prices
              </p>
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
                variant="hero" 
                size="lg"
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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div 
              className="luxury-card rounded-3xl p-1 cursor-pointer group"
              onClick={() => !uploading && fileInputRef.current?.click()}
            >
              <div className="rounded-[22px] border-2 border-dashed border-primary/20 group-hover:border-primary/40 transition-colors p-8 lg:p-12">
                <div className="flex flex-col lg:flex-row items-center gap-8 text-center lg:text-left">
                  <div className="w-24 h-24 rounded-3xl icon-box flex items-center justify-center group-hover:scale-110 transition-transform">
                    {uploading ? (
                      <Loader2 className="w-12 h-12 text-primary animate-spin" />
                    ) : (
                      <ImagePlus className="w-12 h-12 text-primary" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-display font-bold mb-2">
                      {uploading ? 'Analyzing your outfit...' : 'Upload Your Own Outfit'}
                    </h3>
                    <p className="text-muted-foreground max-w-lg">
                      {uploading 
                        ? 'Our AI is detecting clothing items in your photo'
                        : 'Drop an image here or click to upload. Our AI will detect all clothing items so you can shop them instantly.'}
                    </p>
                  </div>
                  {!uploading && (
                    <ArrowRight className="w-8 h-8 text-muted-foreground group-hover:text-primary group-hover:translate-x-2 transition-all" />
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Lookbook Grid */}
          <div className="space-y-6">
            <h2 className="text-2xl font-display font-semibold flex items-center gap-3">
              <span className="w-1 h-6 rounded-full bg-primary" />
              Curated Lookbooks
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {lookbooks.map((look, index) => (
                <motion.div
                  key={look.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div 
                    className={`luxury-card rounded-2xl overflow-hidden cursor-pointer group ${look.isUploaded ? 'ring-2 ring-primary' : ''}`}
                    onClick={() => setSelectedLook(look)}
                  >
                    {look.isUploaded && (
                      <button
                        onClick={(e) => { e.stopPropagation(); removeUploadedLook(look.id); }}
                        className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-background/80 flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                    <div className="aspect-[3/4] relative overflow-hidden">
                      <img 
                        src={look.image} 
                        alt={look.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
                      
                      {/* Hotspot indicators */}
                      {look.hotspots.map((hotspot) => (
                        <motion.div
                          key={hotspot.id}
                          className="absolute w-5 h-5 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                          style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
                          animate={{ scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }}
                          transition={{ duration: 2, repeat: Infinity, delay: Math.random() }}
                        >
                          <div className="w-full h-full rounded-full bg-primary/80 flex items-center justify-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary-foreground" />
                          </div>
                        </motion.div>
                      ))}

                      <div className="absolute bottom-0 left-0 right-0 p-5">
                        <div className="flex items-center gap-2 mb-2">
                          {look.isUploaded && (
                            <span className="px-2 py-1 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                              Your Photo
                            </span>
                          )}
                        </div>
                        <h3 className="text-xl font-display font-bold mb-1">{look.title}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MousePointerClick className="w-4 h-4" />
                          {look.hotspots.length} shoppable items
                        </div>
                      </div>
                    </div>
                  </div>
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
                className="fixed inset-0 z-50 bg-background/90 backdrop-blur-xl flex items-center justify-center p-4"
                onClick={() => { setSelectedLook(null); closeResults(); }}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="relative w-full max-w-7xl max-h-[90vh] overflow-hidden rounded-3xl luxury-card"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-4 right-4 z-20 bg-background/50 backdrop-blur hover:bg-background/80"
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
                          className={`absolute w-12 h-12 -translate-x-1/2 -translate-y-1/2 rounded-full flex items-center justify-center transition-all shadow-lg ${
                            selectedItem?.label === hotspot.label 
                              ? 'bg-primary scale-125 shadow-gold' 
                              : 'bg-background/90 hover:bg-primary hover:scale-110 hover:shadow-gold'
                          }`}
                          style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
                          onClick={() => handleHotspotClick(hotspot)}
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <ShoppingBag className={`w-5 h-5 ${
                            selectedItem?.label === hotspot.label ? 'text-primary-foreground' : 'text-foreground'
                          }`} />
                        </motion.button>
                      ))}

                      {/* Item Labels */}
                      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background via-background/80 to-transparent">
                        <div className="flex items-center gap-2 mb-3">
                          {selectedLook.isUploaded && (
                            <span className="px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-sm font-medium">
                              Your Upload
                            </span>
                          )}
                          <h2 className="text-3xl font-display font-bold">{selectedLook.title}</h2>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {selectedLook.hotspots.map((hotspot) => (
                            <button
                              key={hotspot.id}
                              onClick={() => handleHotspotClick(hotspot)}
                              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                                selectedItem?.label === hotspot.label
                                  ? 'bg-primary text-primary-foreground shadow-gold'
                                  : 'bg-secondary/80 hover:bg-primary/20 text-foreground'
                              }`}
                            >
                              {hotspot.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Shopping Results Panel */}
                    <div className="p-6 lg:p-8 overflow-y-auto max-h-[50vh] lg:max-h-[90vh] bg-card">
                      {!selectedItem ? (
                        <div className="h-full flex flex-col items-center justify-center text-center p-8">
                          <div className="w-20 h-20 rounded-3xl icon-box flex items-center justify-center mb-6">
                            <Sparkles className="w-10 h-10 text-primary" />
                          </div>
                          <h3 className="text-2xl font-display font-bold mb-3">
                            Click Any Item to Shop
                          </h3>
                          <p className="text-muted-foreground max-w-sm">
                            Tap on the shopping bag icons or select an item below to see where to buy it
                          </p>
                        </div>
                      ) : loading ? (
                        <div className="h-full flex items-center justify-center">
                          <div className="text-center">
                            <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
                            <p className="text-muted-foreground">Finding best deals...</p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-primary text-sm font-medium uppercase tracking-wider mb-1">
                                {selectedItem.category}
                              </p>
                              <h3 className="text-2xl font-display font-bold">{selectedItem.label}</h3>
                            </div>
                            <button
                              onClick={closeResults}
                              className="p-2 rounded-lg hover:bg-secondary transition-colors"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>

                          <div className="space-y-4">
                            {searchResults.map((result) => (
                              <motion.div
                                key={result.id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="stat-card rounded-2xl p-4 flex gap-4 group"
                              >
                                <div className="w-24 h-28 rounded-xl overflow-hidden flex-shrink-0">
                                  <img 
                                    src={result.image} 
                                    alt={result.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs text-muted-foreground mb-1">{result.store}</p>
                                  <h4 className="font-semibold truncate mb-2">{result.name}</h4>
                                  <div className="flex items-baseline gap-2 mb-2">
                                    <span className="text-xl font-bold text-primary">${result.price}</span>
                                    <span className="text-sm text-muted-foreground line-through">${result.originalPrice}</span>
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                                      {Math.round((1 - result.price / result.originalPrice) * 100)}% OFF
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-1">
                                      <Star className="w-4 h-4 fill-primary text-primary" />
                                      <span className="text-sm">{result.rating}</span>
                                    </div>
                                    <Button
                                      size="sm"
                                      variant="gold"
                                      onClick={() => handleShop(result.url)}
                                    >
                                      Shop Now
                                      <ExternalLink className="w-4 h-4 ml-1" />
                                    </Button>
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </AppLayout>
  );
}
