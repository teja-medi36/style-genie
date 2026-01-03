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
  ChevronRight,
  Camera,
  Image as ImageIcon
} from 'lucide-react';
import { Label } from '@/components/ui/label';

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
  const [filterCategory, setFilterCategory] = useState<string>('all');
  
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    color: '',
    brand: '',
    size: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

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

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    if (!user?.id) return null;
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('wardrobe-images')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return null;
    }

    const { data } = supabase.storage
      .from('wardrobe-images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.category || !formData.color) {
      toast({ title: 'Missing fields', description: 'Please fill in all required fields', variant: 'destructive' });
      return;
    }

    setUploading(true);
    let imageUrl: string | null = null;

    if (imageFile) {
      imageUrl = await uploadImage(imageFile);
      if (!imageUrl) {
        toast({ title: 'Error', description: 'Failed to upload image', variant: 'destructive' });
        setUploading(false);
        return;
      }
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
        image_url: imageUrl,
      });

    setUploading(false);

    if (error) {
      toast({ title: 'Error', description: 'Failed to add item', variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Item added to wardrobe' });
      setFormData({ name: '', category: '', color: '', brand: '', size: '' });
      setImageFile(null);
      setImagePreview(null);
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
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-display font-bold truncate">
              My <span className="text-gradient-orange">Wardrobe</span>
            </h1>
            <p className="text-sm text-muted-foreground">{items.length} items</p>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="shrink-0">
                <Plus className="w-5 h-5 sm:mr-1" />
                <span className="hidden sm:inline">Add</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="card-elevated border-0 max-w-[95vw] sm:max-w-lg mx-auto">
              <DialogHeader>
                <DialogTitle className="font-display text-xl sm:text-2xl">Add Item</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4 max-h-[70vh] overflow-y-auto pr-1">
                {/* Image Upload */}
                <div className="space-y-2">
                  <Label>Photo (optional)</Label>
                  <div className="flex gap-3">
                    <label className="flex-1 cursor-pointer">
                      <div className={`h-24 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 hover:border-primary/50 hover:bg-secondary/50 transition-colors ${imagePreview ? 'border-primary' : ''}`}>
                        {imagePreview ? (
                          <img src={imagePreview} alt="Preview" className="h-full w-full object-cover rounded-xl" />
                        ) : (
                          <>
                            <Camera className="w-6 h-6 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">Add photo</span>
                          </>
                        )}
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                      />
                    </label>
                    {imagePreview && (
                      <button
                        type="button"
                        onClick={() => { setImageFile(null); setImagePreview(null); }}
                        className="p-2 h-fit rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <Input
                  placeholder="Item name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="h-12"
                />
                
                <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={formData.color} onValueChange={(v) => setFormData({ ...formData, color: v })}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Color" />
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
                    placeholder="Brand"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="h-12"
                  />
                  <Input
                    placeholder="Size"
                    value={formData.size}
                    onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                    className="h-12"
                  />
                </div>

                <Button type="submit" className="w-full h-12" disabled={uploading}>
                  {uploading ? 'Uploading...' : 'Add to Wardrobe'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:-mx-6 sm:px-6 scrollbar-hide">
          <button
            onClick={() => setFilterCategory('all')}
            className={`px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-colors ${
              filterCategory === 'all' 
                ? 'bg-foreground text-background' 
                : 'bg-secondary text-muted-foreground'
            }`}
          >
            All
          </button>
          {categories.map(cat => (
            <button
              key={cat.value}
              onClick={() => setFilterCategory(cat.value)}
              className={`px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-colors ${
                filterCategory === cat.value 
                  ? 'bg-foreground text-background' 
                  : 'bg-secondary text-muted-foreground'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Items */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="card-clean text-center p-6 sm:p-8">
            <div className="icon-circle mx-auto mb-4">
              <Shirt className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="font-medium mb-1">No items yet</p>
            <p className="text-sm text-muted-foreground mb-4">Add your clothes to get started</p>
            <Button onClick={() => setIsOpen(true)}>
              <Plus className="w-4 h-4 mr-1" />
              Add Item
            </Button>
          </div>
        ) : (
          <div className="space-y-2 sm:space-y-3">
            <AnimatePresence>
              {filteredItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <div className="category-item group">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {item.image_url ? (
                        <img 
                          src={item.image_url} 
                          alt={item.name} 
                          className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl object-cover shrink-0"
                        />
                      ) : (
                        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 ${colorClasses[item.color] || 'bg-muted'}`}>
                          <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white/50" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="font-medium truncate text-sm sm:text-base">{item.name}</p>
                        <p className="text-xs sm:text-sm text-muted-foreground capitalize truncate">
                          {item.category} · {item.color}
                          {item.brand && ` · ${item.brand}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => toggleFavorite(item.id, item.is_favorite)}
                        className="p-2 rounded-full hover:bg-secondary transition-colors active:scale-95"
                      >
                        <Heart className={`w-4 h-4 ${item.is_favorite ? 'fill-primary text-primary' : 'text-muted-foreground'}`} />
                      </button>
                      <button
                        onClick={() => deleteItem(item.id)}
                        className="p-2 rounded-full hover:bg-destructive/10 hover:text-destructive transition-colors active:scale-95"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
    </AppLayout>
  );
}
