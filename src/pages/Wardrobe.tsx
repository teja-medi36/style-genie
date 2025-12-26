import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  Shirt, 
  Trash2, 
  Heart,
  Filter,
  Grid,
  List,
  Package
} from 'lucide-react';

interface WardrobeItem {
  id: string;
  name: string;
  category: string;
  color: string;
  brand: string | null;
  size: string | null;
  image_url: string | null;
  is_favorite: boolean;
}

const categories = [
  { value: 'shirt', label: 'Shirt / Top' },
  { value: 'pants', label: 'Pants / Jeans' },
  { value: 'jacket', label: 'Jacket / Coat' },
  { value: 'dress', label: 'Dress' },
  { value: 'shoes', label: 'Shoes' },
  { value: 'accessories', label: 'Accessories' },
  { value: 'cap', label: 'Cap / Hat' },
];

const colors = [
  'Black', 'White', 'Navy', 'Gray', 'Brown', 'Beige', 
  'Red', 'Blue', 'Green', 'Yellow', 'Pink', 'Purple', 'Orange'
];

const colorClasses: Record<string, string> = {
  'Black': 'bg-gray-900',
  'White': 'bg-white border border-border',
  'Navy': 'bg-blue-900',
  'Gray': 'bg-gray-500',
  'Brown': 'bg-amber-800',
  'Beige': 'bg-amber-100',
  'Red': 'bg-red-500',
  'Blue': 'bg-blue-500',
  'Green': 'bg-green-500',
  'Yellow': 'bg-yellow-400',
  'Pink': 'bg-pink-400',
  'Purple': 'bg-purple-500',
  'Orange': 'bg-orange-500',
};

export default function Wardrobe() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<WardrobeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    color: '',
    brand: '',
    size: '',
  });

  useEffect(() => {
    if (user) fetchItems();
  }, [user]);

  const fetchItems = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('wardrobe_items')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: 'Error', description: 'Failed to load wardrobe', variant: 'destructive' });
    } else {
      setItems(data || []);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.category || !formData.color) {
      toast({ title: 'Missing fields', description: 'Please fill in all required fields', variant: 'destructive' });
      return;
    }

    const { error } = await supabase
      .from('wardrobe_items')
      .insert({
        user_id: user?.id,
        name: formData.name,
        category: formData.category,
        color: formData.color,
        brand: formData.brand || null,
        size: formData.size || null,
      });

    if (error) {
      toast({ title: 'Error', description: 'Failed to add item', variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Item added to wardrobe' });
      setFormData({ name: '', category: '', color: '', brand: '', size: '' });
      setIsOpen(false);
      fetchItems();
    }
  };

  const toggleFavorite = async (id: string, current: boolean) => {
    const { error } = await supabase
      .from('wardrobe_items')
      .update({ is_favorite: !current })
      .eq('id', id);

    if (!error) {
      setItems(items.map(item => 
        item.id === id ? { ...item, is_favorite: !current } : item
      ));
    }
  };

  const deleteItem = async (id: string) => {
    const { error } = await supabase
      .from('wardrobe_items')
      .delete()
      .eq('id', id);

    if (!error) {
      setItems(items.filter(item => item.id !== id));
      toast({ title: 'Deleted', description: 'Item removed from wardrobe' });
    }
  };

  const filteredItems = filterCategory === 'all' 
    ? items 
    : items.filter(item => item.category === filterCategory);

  return (
    <AppLayout>
      <div className="relative min-h-full">
        <div className="absolute inset-0 hero-gradient pointer-events-none" />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative space-y-8"
        >
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl icon-box-lg flex items-center justify-center">
                  <Package className="w-6 h-6 text-primary-foreground" />
                </div>
                <span className="text-primary text-sm font-semibold tracking-wider uppercase">
                  My Collection
                </span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-display font-bold tracking-tight">
                My <span className="text-gradient-gold">Wardrobe</span>
              </h1>
              <p className="text-muted-foreground text-lg">
                {items.length} items in your collection
              </p>
            </div>
            
            <div className="flex items-center gap-3 flex-wrap">
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-44 bg-secondary/50 border-border/50">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent className="glass-panel">
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex rounded-xl border border-border overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-3 transition-colors ${viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'bg-secondary/50 hover:bg-secondary'}`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-3 transition-colors ${viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'bg-secondary/50 hover:bg-secondary'}`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>

              <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                  <Button variant="hero" size="lg">
                    <Plus className="w-5 h-5 mr-2" />
                    Add Item
                  </Button>
                </DialogTrigger>
                <DialogContent className="luxury-card border-0">
                  <DialogHeader>
                    <DialogTitle className="font-display text-3xl">Add to Wardrobe</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-5 mt-6">
                    <Input
                      placeholder="Item name (e.g., Blue Oxford Shirt)"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="h-12 bg-secondary/50 border-border/50"
                    />
                    
                    <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                      <SelectTrigger className="h-12 bg-secondary/50 border-border/50">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent className="glass-panel">
                        {categories.map(cat => (
                          <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={formData.color} onValueChange={(v) => setFormData({ ...formData, color: v })}>
                      <SelectTrigger className="h-12 bg-secondary/50 border-border/50">
                        <SelectValue placeholder="Select color" />
                      </SelectTrigger>
                      <SelectContent className="glass-panel">
                        {colors.map(color => (
                          <SelectItem key={color} value={color}>
                            <div className="flex items-center gap-3">
                              <div className={`w-5 h-5 rounded-full ${colorClasses[color]}`} />
                              {color}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        placeholder="Brand (optional)"
                        value={formData.brand}
                        onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                        className="h-12 bg-secondary/50 border-border/50"
                      />
                      <Input
                        placeholder="Size (optional)"
                        value={formData.size}
                        onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                        className="h-12 bg-secondary/50 border-border/50"
                      />
                    </div>

                    <Button type="submit" variant="hero" className="w-full h-12">
                      Add to Wardrobe
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Items Grid */}
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="luxury-card rounded-3xl p-16 text-center">
              <div className="w-24 h-24 rounded-3xl icon-box mx-auto mb-6 flex items-center justify-center">
                <Shirt className="w-12 h-12 text-primary" />
              </div>
              <h3 className="text-2xl font-display font-bold mb-3">Your wardrobe is empty</h3>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Start adding your clothes to get personalized outfit suggestions from our AI stylist
              </p>
              <Button variant="hero" size="lg" onClick={() => setIsOpen(true)}>
                <Plus className="w-5 h-5 mr-2" />
                Add Your First Item
              </Button>
            </div>
          ) : (
            <motion.div
              className={viewMode === 'grid' 
                ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5"
                : "space-y-4"
              }
            >
              <AnimatePresence>
                {filteredItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.03 }}
                  >
                    <div className={`stat-card group overflow-hidden rounded-2xl ${viewMode === 'list' ? 'flex items-center' : ''}`}>
                      <div className={`${viewMode === 'grid' ? 'aspect-square' : 'w-24 h-24 flex-shrink-0'} bg-secondary/50 flex items-center justify-center relative`}>
                        <div className={`w-16 h-16 rounded-xl ${colorClasses[item.color] || 'bg-muted'} shadow-lg`} />
                        <button
                          onClick={() => toggleFavorite(item.id, item.is_favorite)}
                          className="absolute top-3 right-3 p-2 rounded-full bg-background/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all hover:bg-background/80"
                        >
                          <Heart className={`w-4 h-4 ${item.is_favorite ? 'fill-primary text-primary' : 'text-foreground'}`} />
                        </button>
                      </div>
                      <div className={`${viewMode === 'grid' ? 'p-4' : 'flex-1 flex items-center justify-between p-4'}`}>
                        <div className="min-w-0">
                          <p className="font-semibold truncate">{item.name}</p>
                          <p className="text-sm text-muted-foreground capitalize">{item.category} · {item.color}</p>
                          {item.brand && <p className="text-xs text-muted-foreground mt-1">{item.brand}</p>}
                        </div>
                        <button
                          onClick={() => deleteItem(item.id)}
                          className={`${viewMode === 'grid' ? 'mt-3' : 'ml-4'} p-2.5 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </motion.div>
      </div>
    </AppLayout>
  );
}
