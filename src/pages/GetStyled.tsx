import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { 
  Sparkles, 
  Shirt, 
  RefreshCw,
  Save,
  Lightbulb,
  Palette,
  ShoppingBag
} from 'lucide-react';

interface OutfitSuggestion {
  outfit: {
    top: string;
    bottom: string;
    outerwear: string | null;
    shoes: string;
    accessories: string | null;
  };
  explanation: string;
  styling_tips: string[];
  color_harmony: string;
  alternatives: {
    top: string;
    bottom: string;
  };
}

const occasions = [
  { value: 'casual', label: 'Casual Day Out' },
  { value: 'work', label: 'Work / Office' },
  { value: 'date', label: 'Date Night' },
  { value: 'party', label: 'Party / Event' },
  { value: 'sport', label: 'Sports / Active' },
  { value: 'formal', label: 'Formal / Business' },
  { value: 'weekend', label: 'Weekend Brunch' },
];

export default function GetStyled() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [occasion, setOccasion] = useState('casual');
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<OutfitSuggestion | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [wardrobe, setWardrobe] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchWardrobe();
    }
  }, [user]);

  const fetchProfile = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user?.id)
      .maybeSingle();
    setProfile(data);
  };

  const fetchWardrobe = async () => {
    const { data } = await supabase
      .from('wardrobe_items')
      .select('*')
      .eq('user_id', user?.id);
    setWardrobe(data || []);
  };

  const generateOutfit = async () => {
    setLoading(true);
    setSuggestion(null);

    try {
      const { data, error } = await supabase.functions.invoke('suggest-outfit', {
        body: { profile, wardrobe, occasion }
      });

      if (error) {
        console.error('Function error:', error);
        throw error;
      }

      if (data.error) {
        toast({
          title: 'Error',
          description: data.error,
          variant: 'destructive',
        });
      } else {
        setSuggestion(data.suggestion);
        toast({
          title: 'Outfit Generated!',
          description: 'Your personalized outfit is ready.',
        });
      }
    } catch (error) {
      console.error('Error generating outfit:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate outfit. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const saveOutfit = async () => {
    if (!suggestion || !user) return;

    const { error } = await supabase
      .from('outfit_suggestions')
      .insert([{
        user_id: user.id,
        occasion,
        suggestion_data: JSON.parse(JSON.stringify(suggestion)),
        is_saved: true,
      }]);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to save outfit.',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Saved!',
        description: 'Outfit added to your saved looks.',
      });
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
        <div className="text-center max-w-2xl mx-auto">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-accent mx-auto mb-6 flex items-center justify-center shadow-[0_4px_30px_-5px_hsla(38,92%,50%,0.4)]"
          >
            <Sparkles className="w-10 h-10 text-primary-foreground" />
          </motion.div>
          <h1 className="text-4xl font-display font-bold mb-3">AI Style Assistant</h1>
          <p className="text-muted-foreground text-lg">
            Get personalized outfit recommendations based on your style profile and wardrobe
          </p>
        </div>

        {/* Occasion Selector */}
        <Card variant="glass" className="max-w-xl mx-auto">
          <CardContent className="p-6">
            <label className="block text-sm font-medium mb-3">What's the occasion?</label>
            <div className="flex gap-3">
              <Select value={occasion} onValueChange={setOccasion}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select occasion" />
                </SelectTrigger>
                <SelectContent>
                  {occasions.map(occ => (
                    <SelectItem key={occ.value} value={occ.value}>{occ.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                variant="gold" 
                onClick={generateOutfit}
                disabled={loading}
                className="min-w-[140px]"
              >
                {loading ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generate
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="relative">
              <div className="w-24 h-24 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
              <Sparkles className="w-8 h-8 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
            <p className="mt-6 text-muted-foreground animate-pulse">Crafting your perfect outfit...</p>
          </div>
        )}

        {/* Suggestion Result */}
        {suggestion && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            {/* Main Outfit Card */}
            <Card variant="elevated" className="overflow-hidden">
              <div className="bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10 p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-display font-bold">Your Outfit</h2>
                  <Button variant="gold" size="sm" onClick={saveOutfit}>
                    <Save className="w-4 h-4 mr-2" />
                    Save Look
                  </Button>
                </div>
              </div>
              <CardContent className="p-6 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Top */}
                <div className="p-4 rounded-xl bg-secondary/50 border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <Shirt className="w-5 h-5 text-primary" />
                    <span className="font-medium">Top</span>
                  </div>
                  <p className="text-muted-foreground">{suggestion.outfit.top}</p>
                </div>

                {/* Bottom */}
                <div className="p-4 rounded-xl bg-secondary/50 border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <Shirt className="w-5 h-5 text-primary" />
                    <span className="font-medium">Bottom</span>
                  </div>
                  <p className="text-muted-foreground">{suggestion.outfit.bottom}</p>
                </div>

                {/* Shoes */}
                <div className="p-4 rounded-xl bg-secondary/50 border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <ShoppingBag className="w-5 h-5 text-primary" />
                    <span className="font-medium">Shoes</span>
                  </div>
                  <p className="text-muted-foreground">{suggestion.outfit.shoes}</p>
                </div>

                {/* Outerwear */}
                {suggestion.outfit.outerwear && (
                  <div className="p-4 rounded-xl bg-secondary/50 border border-border">
                    <div className="flex items-center gap-2 mb-2">
                      <Shirt className="w-5 h-5 text-primary" />
                      <span className="font-medium">Outerwear</span>
                    </div>
                    <p className="text-muted-foreground">{suggestion.outfit.outerwear}</p>
                  </div>
                )}

                {/* Accessories */}
                {suggestion.outfit.accessories && (
                  <div className="p-4 rounded-xl bg-secondary/50 border border-border">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-5 h-5 text-primary" />
                      <span className="font-medium">Accessories</span>
                    </div>
                    <p className="text-muted-foreground">{suggestion.outfit.accessories}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Explanation */}
            <Card variant="glass">
              <CardContent className="p-6">
                <p className="text-lg leading-relaxed">{suggestion.explanation}</p>
              </CardContent>
            </Card>

            {/* Tips & Color Harmony */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card variant="elevated">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Lightbulb className="w-5 h-5 text-primary" />
                    Styling Tips
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {suggestion.styling_tips.map((tip, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-sm flex items-center justify-center flex-shrink-0 mt-0.5">
                          {index + 1}
                        </span>
                        <span className="text-muted-foreground">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card variant="elevated">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Palette className="w-5 h-5 text-primary" />
                    Color Harmony
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{suggestion.color_harmony}</p>
                </CardContent>
              </Card>
            </div>

            {/* Alternatives */}
            <Card variant="glass">
              <CardHeader>
                <CardTitle className="text-lg">Alternative Options</CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-muted-foreground">Alternative Top:</span>
                  <p className="font-medium">{suggestion.alternatives.top}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Alternative Bottom:</span>
                  <p className="font-medium">{suggestion.alternatives.bottom}</p>
                </div>
              </CardContent>
            </Card>

            {/* Regenerate Button */}
            <div className="text-center">
              <Button variant="outline" onClick={generateOutfit} disabled={loading}>
                <RefreshCw className="w-5 h-5 mr-2" />
                Generate Another Look
              </Button>
            </div>
          </motion.div>
        )}

        {/* Empty State */}
        {!suggestion && !loading && (
          <Card variant="glass" className="max-w-xl mx-auto text-center p-12">
            <Sparkles className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-display font-semibold mb-2">Ready to get styled?</h3>
            <p className="text-muted-foreground mb-6">
              Select an occasion and click Generate to get AI-powered outfit suggestions tailored just for you.
            </p>
            {wardrobe.length === 0 && (
              <p className="text-sm text-primary">
                Tip: Add items to your wardrobe for more personalized suggestions!
              </p>
            )}
          </Card>
        )}
      </motion.div>
    </AppLayout>
  );
}
