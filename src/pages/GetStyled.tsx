import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AppLayout from '@/components/layout/AppLayout';
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
  ShoppingBag,
  Wand2,
  ArrowRight
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
  { value: 'casual', label: 'Casual Day Out', icon: '☕' },
  { value: 'work', label: 'Work / Office', icon: '💼' },
  { value: 'date', label: 'Date Night', icon: '✨' },
  { value: 'party', label: 'Party / Event', icon: '🎉' },
  { value: 'sport', label: 'Sports / Active', icon: '🏃' },
  { value: 'formal', label: 'Formal / Business', icon: '👔' },
  { value: 'weekend', label: 'Weekend Brunch', icon: '🥐' },
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
      <div className="relative min-h-full">
        <div className="absolute inset-0 hero-gradient pointer-events-none" />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative space-y-10"
        >
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="w-24 h-24 rounded-3xl icon-box-lg mx-auto mb-8 flex items-center justify-center animate-glow"
            >
              <Wand2 className="w-12 h-12 text-primary-foreground" />
            </motion.div>
            <h1 className="text-5xl lg:text-6xl font-display font-bold mb-4 tracking-tight">
              AI <span className="text-gradient-gold">Style Assistant</span>
            </h1>
            <p className="text-muted-foreground text-xl max-w-xl mx-auto">
              Get personalized outfit recommendations crafted just for you
            </p>
          </div>

          {/* Occasion Selector */}
          <div className="max-w-2xl mx-auto">
            <div className="luxury-card rounded-3xl p-1">
              <div className="rounded-[22px] p-8">
                <label className="block text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wider">
                  What's the occasion?
                </label>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Select value={occasion} onValueChange={setOccasion}>
                    <SelectTrigger className="flex-1 h-14 text-lg bg-secondary/50 border-border/50">
                      <SelectValue placeholder="Select occasion" />
                    </SelectTrigger>
                    <SelectContent className="glass-panel">
                      {occasions.map(occ => (
                        <SelectItem key={occ.value} value={occ.value} className="text-base">
                          <span className="flex items-center gap-3">
                            <span>{occ.icon}</span>
                            <span>{occ.label}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button 
                    variant="hero" 
                    size="xl"
                    onClick={generateOutfit}
                    disabled={loading}
                    className="min-w-[180px]"
                  >
                    {loading ? (
                      <RefreshCw className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 mr-2" />
                        Generate
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="relative">
                <div className="w-32 h-32 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="w-10 h-10 text-primary animate-pulse" />
                </div>
              </div>
              <p className="mt-8 text-xl text-muted-foreground">Crafting your perfect outfit...</p>
            </div>
          )}

          {/* Suggestion Result */}
          {suggestion && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              {/* Main Outfit Card */}
              <div className="luxury-card rounded-3xl overflow-hidden">
                <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 lg:p-8 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl icon-box-lg flex items-center justify-center">
                      <Shirt className="w-7 h-7 text-primary-foreground" />
                    </div>
                    <h2 className="text-3xl font-display font-bold">Your Outfit</h2>
                  </div>
                  <Button variant="gold" size="lg" onClick={saveOutfit}>
                    <Save className="w-5 h-5 mr-2" />
                    Save Look
                  </Button>
                </div>
                <div className="p-6 lg:p-8 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Top */}
                  <div className="stat-card p-5 rounded-2xl">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-10 h-10 rounded-xl icon-box flex items-center justify-center">
                        <Shirt className="w-5 h-5 text-primary" />
                      </div>
                      <span className="font-semibold">Top</span>
                    </div>
                    <p className="text-muted-foreground">{suggestion.outfit.top}</p>
                  </div>

                  {/* Bottom */}
                  <div className="stat-card p-5 rounded-2xl">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-10 h-10 rounded-xl icon-box flex items-center justify-center">
                        <Shirt className="w-5 h-5 text-primary" />
                      </div>
                      <span className="font-semibold">Bottom</span>
                    </div>
                    <p className="text-muted-foreground">{suggestion.outfit.bottom}</p>
                  </div>

                  {/* Shoes */}
                  <div className="stat-card p-5 rounded-2xl">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-10 h-10 rounded-xl icon-box flex items-center justify-center">
                        <ShoppingBag className="w-5 h-5 text-primary" />
                      </div>
                      <span className="font-semibold">Shoes</span>
                    </div>
                    <p className="text-muted-foreground">{suggestion.outfit.shoes}</p>
                  </div>

                  {/* Outerwear */}
                  {suggestion.outfit.outerwear && (
                    <div className="stat-card p-5 rounded-2xl">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-10 h-10 rounded-xl icon-box flex items-center justify-center">
                          <Shirt className="w-5 h-5 text-primary" />
                        </div>
                        <span className="font-semibold">Outerwear</span>
                      </div>
                      <p className="text-muted-foreground">{suggestion.outfit.outerwear}</p>
                    </div>
                  )}

                  {/* Accessories */}
                  {suggestion.outfit.accessories && (
                    <div className="stat-card p-5 rounded-2xl">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-10 h-10 rounded-xl icon-box flex items-center justify-center">
                          <Sparkles className="w-5 h-5 text-primary" />
                        </div>
                        <span className="font-semibold">Accessories</span>
                      </div>
                      <p className="text-muted-foreground">{suggestion.outfit.accessories}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Explanation */}
              <div className="luxury-card rounded-3xl p-8">
                <p className="text-xl leading-relaxed text-foreground/90">{suggestion.explanation}</p>
              </div>

              {/* Tips & Color Harmony */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="luxury-card rounded-3xl p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-2xl icon-box flex items-center justify-center">
                      <Lightbulb className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-display font-bold">Styling Tips</h3>
                  </div>
                  <ul className="space-y-4">
                    {suggestion.styling_tips.map((tip, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <span className="w-7 h-7 rounded-full bg-primary/10 text-primary text-sm flex items-center justify-center flex-shrink-0 font-medium">
                          {index + 1}
                        </span>
                        <span className="text-muted-foreground">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="luxury-card rounded-3xl p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-2xl icon-box flex items-center justify-center">
                      <Palette className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-display font-bold">Color Harmony</h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">{suggestion.color_harmony}</p>
                </div>
              </div>

              {/* Alternatives */}
              <div className="luxury-card rounded-3xl p-6">
                <h3 className="text-xl font-display font-bold mb-6">Alternative Options</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="stat-card p-5 rounded-2xl">
                    <span className="text-sm text-muted-foreground uppercase tracking-wider">Alternative Top</span>
                    <p className="font-semibold mt-2">{suggestion.alternatives.top}</p>
                  </div>
                  <div className="stat-card p-5 rounded-2xl">
                    <span className="text-sm text-muted-foreground uppercase tracking-wider">Alternative Bottom</span>
                    <p className="font-semibold mt-2">{suggestion.alternatives.bottom}</p>
                  </div>
                </div>
              </div>

              {/* Regenerate Button */}
              <div className="text-center pt-4">
                <Button variant="outline" size="lg" onClick={generateOutfit} disabled={loading}>
                  <RefreshCw className="w-5 h-5 mr-2" />
                  Generate Another Look
                </Button>
              </div>
            </motion.div>
          )}

          {/* Empty State */}
          {!suggestion && !loading && (
            <div className="max-w-2xl mx-auto">
              <div className="luxury-card rounded-3xl text-center p-12">
                <div className="w-20 h-20 rounded-3xl icon-box mx-auto mb-6 flex items-center justify-center">
                  <Sparkles className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-2xl font-display font-bold mb-3">Ready to get styled?</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Select an occasion and click Generate to get AI-powered outfit suggestions tailored just for you.
                </p>
                {wardrobe.length === 0 && (
                  <p className="text-sm text-primary flex items-center justify-center gap-2">
                    <ArrowRight className="w-4 h-4" />
                    Add items to your wardrobe for more personalized suggestions
                  </p>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AppLayout>
  );
}
