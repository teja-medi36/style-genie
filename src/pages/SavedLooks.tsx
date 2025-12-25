import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { 
  Heart, 
  Trash2, 
  Shirt,
  Calendar,
  Sparkles
} from 'lucide-react';

interface SavedOutfit {
  id: string;
  occasion: string;
  suggestion_data: {
    outfit: {
      top: string;
      bottom: string;
      outerwear: string | null;
      shoes: string;
      accessories: string | null;
    };
    explanation: string;
  };
  created_at: string;
}

export default function SavedLooks() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [outfits, setOutfits] = useState<SavedOutfit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchSavedOutfits();
  }, [user]);

  const fetchSavedOutfits = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('outfit_suggestions')
      .select('*')
      .eq('user_id', user?.id)
      .eq('is_saved', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching saved outfits:', error);
    } else {
      // Type assertion for JSONB data
      const typedData = (data || []).map(item => ({
        ...item,
        suggestion_data: item.suggestion_data as SavedOutfit['suggestion_data']
      }));
      setOutfits(typedData);
    }
    setLoading(false);
  };

  const deleteOutfit = async (id: string) => {
    const { error } = await supabase
      .from('outfit_suggestions')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete outfit.',
        variant: 'destructive',
      });
    } else {
      setOutfits(outfits.filter(o => o.id !== id));
      toast({
        title: 'Deleted',
        description: 'Outfit removed from saved looks.',
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
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
          <h1 className="text-3xl font-display font-bold mb-2">Saved Looks</h1>
          <p className="text-muted-foreground">{outfits.length} outfit{outfits.length !== 1 ? 's' : ''} saved</p>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          </div>
        ) : outfits.length === 0 ? (
          <Card variant="glass" className="p-12 text-center">
            <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-display font-semibold mb-2">No saved looks yet</h3>
            <p className="text-muted-foreground mb-6">
              Generate outfit suggestions and save your favorites to view them here
            </p>
            <Button variant="gold" asChild>
              <a href="/get-styled">
                <Sparkles className="w-5 h-5 mr-2" />
                Get Styled
              </a>
            </Button>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            <AnimatePresence>
              {outfits.map((outfit, index) => (
                <motion.div
                  key={outfit.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card variant="elevated" className="overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                            <Heart className="w-5 h-5 text-primary fill-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-lg capitalize">{outfit.occasion} Look</CardTitle>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Calendar className="w-4 h-4" />
                              {formatDate(outfit.created_at)}
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteOutfit(outfit.id)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="w-5 h-5" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 rounded-lg bg-secondary/50">
                          <span className="text-xs text-muted-foreground">Top</span>
                          <p className="text-sm font-medium truncate">{outfit.suggestion_data.outfit.top}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-secondary/50">
                          <span className="text-xs text-muted-foreground">Bottom</span>
                          <p className="text-sm font-medium truncate">{outfit.suggestion_data.outfit.bottom}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-secondary/50">
                          <span className="text-xs text-muted-foreground">Shoes</span>
                          <p className="text-sm font-medium truncate">{outfit.suggestion_data.outfit.shoes}</p>
                        </div>
                        {outfit.suggestion_data.outfit.accessories && (
                          <div className="p-3 rounded-lg bg-secondary/50">
                            <span className="text-xs text-muted-foreground">Accessories</span>
                            <p className="text-sm font-medium truncate">{outfit.suggestion_data.outfit.accessories}</p>
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {outfit.suggestion_data.explanation}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
    </AppLayout>
  );
}
