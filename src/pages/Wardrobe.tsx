import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
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
  List
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold">My Wardrobe</h1>
            <p className="text-muted-foreground">{items.length} items in your collection</p>
          </div>
          
          <div className="flex items-center gap-3">
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-40">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex rounded-lg border border-border overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-gold text-primary-foreground' : 'bg-secondary'}`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-gold text-primary-foreground' : 'bg-secondary'}`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button variant="gold">
                  <Plus className="w-5 h-5 mr-2" />
                  Add Item
                </Button>
              </DialogTrigger>
              <DialogContent className="glass-panel">
                <DialogHeader>
                  <DialogTitle className="font-display text-2xl">Add to Wardrobe</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                  <Input
                    placeholder="Item name (e.g., Blue Oxford Shirt)"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                  
                  <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={formData.color} onValueChange={(v) => setFormData({ ...formData, color: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select color" />
                    </SelectTrigger>
                    <SelectContent>
                      {colors.map(color => (
                        <SelectItem key={color} value={color}>
                          <div className="flex items-center gap-2">
                            <div className={`w-4 h-4 rounded-full ${colorClasses[color]}`} />
                            {color}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      placeholder="Brand (optional)"
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    />
                    <Input
                      placeholder="Size (optional)"
                      value={formData.size}
                      onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                    />
                  </div>

                  <Button type="submit" variant="gold" className="w-full">
                    Add to Wardrobe
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Items Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-12 h-12 rounded-full border-4 border-gold border-t-transparent animate-spin" />
          </div>
        ) : filteredItems.length === 0 ? (
          <Card variant="glass" className="p-12 text-center">
            <Shirt className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-display font-semibold mb-2">Your wardrobe is empty</h3>
            <p className="text-muted-foreground mb-6">Start adding your clothes to get personalized outfit suggestions</p>
            <Button variant="gold" onClick={() => setIsOpen(true)}>
              <Plus className="w-5 h-5 mr-2" />
              Add Your First Item
            </Button>
          </Card>
        ) : (
          <motion.div
            className={viewMode === 'grid' 
              ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
              : "space-y-3"
            }
          >
            <AnimatePresence>
              {filteredItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card variant="elevated" className={`group overflow-hidden ${viewMode === 'list' ? 'flex items-center' : ''}`}>
                    <div className={`${viewMode === 'grid' ? 'aspect-square' : 'w-20 h-20 flex-shrink-0'} bg-secondary flex items-center justify-center relative`}>
                      <div className={`w-16 h-16 rounded-xl ${colorClasses[item.color] || 'bg-muted'}`} />
                      <button
                        onClick={() => toggleFavorite(item.id, item.is_favorite)}
                        className="absolute top-2 right-2 p-2 rounded-full bg-background/50 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Heart className={`w-4 h-4 ${item.is_favorite ? 'fill-gold text-gold' : 'text-foreground'}`} />
                      </button>
                    </div>
                    <CardContent className={`${viewMode === 'grid' ? 'p-4' : 'flex-1 flex items-center justify-between p-4'}`}>
                      <div>
                        <p className="font-medium truncate">{item.name}</p>
                        <p className="text-sm text-muted-foreground capitalize">{item.category} · {item.color}</p>
                        {item.brand && <p className="text-xs text-muted-foreground">{item.brand}</p>}
                      </div>
                      <button
                        onClick={() => deleteItem(item.id)}
                        className={`${viewMode === 'grid' ? 'mt-3' : ''} p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </motion.div>
    </AppLayout>
  );
}
