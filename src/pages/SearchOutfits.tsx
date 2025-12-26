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
  Upload,
  ImagePlus,
  Loader2,
  ChevronRight
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

interface ProductResult {
  id: number;
  name: string;
  price: number;
  originalPrice: number;
  store: string;
  rating: number;
  image: string;
  url: string;
}

export default function SearchOutfits() {
  const [lookbooks, setLookbooks] = useState<Lookbook[]>(defaultLookbooks);
  const [selectedLook, setSelectedLook] = useState<Lookbook | null>(null);
  const [selectedItem, setSelectedItem] = useState<{ label: string; category: string } | null>(null);
  const [searchResults, setSearchResults] = useState<ProductResult[]>([]);
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

  const handleHotspotClick = async (hotspot: DetectedItem) => {
    setLoading(true);
    setSelectedItem(hotspot);
    
    try {
      const { data, error } = await supabase.functions.invoke('search-products', {
        body: { 
          item: {
            label: hotspot.label,
            category: hotspot.category,
            color: hotspot.color,
            style: hotspot.style,
          }
        }
      });

      if (error) {
        console.error('Search error:', error);
        toast.error('Failed to search for products');
        setSearchResults([]);
      } else {
        setSearchResults(data.products || []);
        if (data.products?.length === 0) {
          toast.info('No products found for this item');
        }
      }
    } catch (err) {
      console.error('Search error:', err);
      toast.error('Failed to search for products');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
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
        <div>
          <h1 className="text-3xl font-display font-bold mb-2">
            Visual <span className="text-gradient-orange">Search</span>
          </h1>
          <p className="text-muted-foreground">
            Upload a photo or click items to shop
          </p>
        </div>

        {/* Upload Card */}
        <div 
          className="card-elevated p-6 cursor-pointer group"
          onClick={() => !uploading && fileInputRef.current?.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            className="hidden"
          />
          <div className="flex items-center gap-4">
            <div className="icon-circle-primary">
              {uploading ? (
                <Loader2 className="w-5 h-5 text-primary-foreground animate-spin" />
              ) : (
                <Upload className="w-5 h-5 text-primary-foreground" />
              )}
            </div>
            <div className="flex-1">
              <p className="font-semibold">{uploading ? 'Analyzing...' : 'Upload Photo'}</p>
              <p className="text-sm text-muted-foreground">AI detects clothing items</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </div>
        </div>

        {/* Lookbook Grid */}
        <div>
          <h3 className="text-xl font-display font-semibold mb-4">Shop the look</h3>
          <div className="grid grid-cols-2 gap-4">
            {lookbooks.map((look, index) => (
              <motion.div
                key={look.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div 
                  className={`shop-card cursor-pointer group relative ${look.isUploaded ? 'ring-2 ring-primary' : ''}`}
                  onClick={() => setSelectedLook(look)}
                >
                  {look.isUploaded && (
                    <button
                      onClick={(e) => { e.stopPropagation(); removeUploadedLook(look.id); }}
                      className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full bg-card flex items-center justify-center hover:bg-destructive hover:text-primary-foreground transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  <div className="aspect-[3/4] overflow-hidden">
                    <img 
                      src={look.image} 
                      alt={look.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-3">
                    {look.isUploaded && (
                      <span className="text-xs text-primary font-medium">Your Photo</span>
                    )}
                    <p className="font-medium text-sm">{look.title}</p>
                    <p className="text-xs text-muted-foreground">{look.hotspots.length} items</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Modal */}
        <AnimatePresence>
          {selectedLook && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-foreground/20 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
              onClick={() => { setSelectedLook(null); closeResults(); }}
            >
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                className="relative w-full sm:max-w-4xl max-h-[90vh] overflow-hidden rounded-t-3xl sm:rounded-3xl bg-card"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-4 border-b border-border flex items-center justify-between">
                  <h3 className="font-display font-semibold">{selectedLook.title}</h3>
                  <button
                    onClick={() => { setSelectedLook(null); closeResults(); }}
                    className="p-2 rounded-full hover:bg-secondary transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid sm:grid-cols-2 max-h-[calc(90vh-60px)] overflow-auto">
                  {/* Image */}
                  <div className="relative aspect-[3/4] sm:aspect-auto">
                    <img 
                      src={selectedLook.image} 
                      alt={selectedLook.title}
                      className="w-full h-full object-cover"
                    />
                    {selectedLook.hotspots.map((hotspot) => (
                      <motion.button
                        key={hotspot.id}
                        className="absolute w-8 h-8 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary flex items-center justify-center shadow-lg"
                        style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
                        onClick={() => handleHotspotClick(hotspot)}
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <ShoppingBag className="w-4 h-4 text-primary-foreground" />
                      </motion.button>
                    ))}
                  </div>

                  {/* Results Panel */}
                  <div className="p-4 bg-secondary/30">
                    {!selectedItem ? (
                      <div className="h-full flex flex-col items-center justify-center text-center p-6">
                        <div className="icon-circle mb-4">
                          <Camera className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <p className="font-medium">Tap an item to shop</p>
                        <p className="text-sm text-muted-foreground">Click on the hotspots</p>
                      </div>
                    ) : loading ? (
                      <div className="h-full flex items-center justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold">{selectedItem.label}</p>
                            <p className="text-sm text-muted-foreground">{selectedItem.category}</p>
                          </div>
                          <button onClick={closeResults} className="text-sm text-primary">
                            Clear
                          </button>
                        </div>
                        <div className="space-y-3">
                          {searchResults.map((result) => (
                            <div key={result.id} className="card-clean p-3 flex gap-3">
                              <img
                                src={result.image}
                                alt={result.name}
                                className="w-16 h-20 object-cover rounded-lg"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">{result.name}</p>
                                <p className="text-xs text-muted-foreground">{result.store}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-primary font-bold">${result.price}</span>
                                  <span className="text-xs text-muted-foreground line-through">${result.originalPrice}</span>
                                </div>
                                <div className="flex items-center gap-1 mt-1">
                                  <Star className="w-3 h-3 fill-primary text-primary" />
                                  <span className="text-xs">{result.rating}</span>
                                </div>
                              </div>
                              <Button
                                size="sm"
                                onClick={() => handleShop(result.url)}
                              >
                                Shop
                                <ExternalLink className="w-3 h-3 ml-1" />
                              </Button>
                            </div>
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
    </AppLayout>
  );
}
