import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { 
  Sparkles, 
  RefreshCw,
  Save,
  ChevronRight,
  Search
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

  const userName = profile?.full_name?.split(' ')[0] || 'there';

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

      if (error) throw error;

      if (data.error) {
        toast({ title: 'Error', description: data.error, variant: 'destructive' });
      } else {
        setSuggestion(data.suggestion);
        toast({ title: 'Outfit Generated!', description: 'Your personalized outfit is ready.' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to generate outfit.', variant: 'destructive' });
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
      toast({ title: 'Error', description: 'Failed to save outfit.', variant: 'destructive' });
    } else {
      toast({ title: 'Saved!', description: 'Outfit added to your saved looks.' });
    }
  };

  return (
    <AppLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6 max-w-md mx-auto"
      >
        {/* Header Greeting */}
        <div className="pt-2">
          <h1 className="text-3xl font-display font-semibold text-foreground leading-tight">
            Welcome back<br />{userName}
          </h1>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="What are you looking for?"
            className="search-input pr-12"
            readOnly
          />
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        </div>

        {/* Occasion Tabs */}
        <div className="flex gap-6 border-b border-border overflow-x-auto scrollbar-hide pb-0">
          {['casual', 'work', 'formal'].map((tab) => (
            <button
              key={tab}
              onClick={() => setOccasion(tab)}
              className={`tab-item pb-3 whitespace-nowrap capitalize ${
                occasion === tab ? 'active' : ''
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Occasion Categories */}
        <div className="space-y-3">
          {occasions.map((occ) => (
            <button
              key={occ.value}
              onClick={() => {
                setOccasion(occ.value);
                generateOutfit();
              }}
              disabled={loading}
              className="category-item w-full text-left"
            >
              <span className="font-medium">{occ.label}</span>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          ))}
        </div>

        {/* Promo Banner */}
        <div className="promo-banner p-6 text-center">
          <p className="text-2xl font-display font-semibold">
            AI Styling<br />Assistant
          </p>
          <p className="text-sm opacity-90 mt-2">Get personalized outfit recommendations</p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center py-8">
            <div className="w-12 h-12 rounded-full border-3 border-primary/20 border-t-primary animate-spin" />
            <p className="mt-4 text-muted-foreground text-sm">Crafting your outfit...</p>
          </div>
        )}

        {/* Result */}
        {suggestion && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Your Outfit Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-display font-semibold">Your Outfit</h2>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={saveOutfit}
                className="text-primary hover:text-primary/80"
              >
                <Save className="w-4 h-4 mr-1" />
                Save
              </Button>
            </div>

            {/* Outfit Items */}
            <div className="space-y-3">
              {[
                { label: 'Top', value: suggestion.outfit.top },
                { label: 'Bottom', value: suggestion.outfit.bottom },
                { label: 'Shoes', value: suggestion.outfit.shoes },
                suggestion.outfit.outerwear && { label: 'Outerwear', value: suggestion.outfit.outerwear },
                suggestion.outfit.accessories && { label: 'Accessories', value: suggestion.outfit.accessories },
              ].filter(Boolean).map((item: any, index) => (
                <div key={index} className="category-item">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">{item.label}</p>
                    <p className="font-medium mt-0.5">{item.value}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>
              ))}
            </div>

            {/* Explanation Card */}
            <div className="card-clean p-4">
              <p className="text-muted-foreground text-sm leading-relaxed">{suggestion.explanation}</p>
            </div>

            {/* Styling Tips */}
            <div className="card-clean p-4">
              <h3 className="font-semibold text-sm mb-3">Styling Tips</h3>
              <div className="space-y-2">
                {suggestion.styling_tips.map((tip, index) => (
                  <div key={index} className="flex items-start gap-3 text-sm text-muted-foreground">
                    <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                      {index + 1}
                    </span>
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Color Harmony */}
            <div className="card-clean p-4">
              <h3 className="font-semibold text-sm mb-2">Color Harmony</h3>
              <p className="text-sm text-muted-foreground">{suggestion.color_harmony}</p>
            </div>

            {/* Generate Another */}
            <button
              onClick={generateOutfit}
              disabled={loading}
              className="category-item w-full justify-center gap-2 text-primary"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="font-medium">Generate Another</span>
            </button>
          </motion.div>
        )}

        {/* Empty State */}
        {!suggestion && !loading && (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="font-medium text-foreground mb-1">Ready to get styled?</p>
            <p className="text-sm text-muted-foreground">
              Tap an occasion above to generate
            </p>
          </div>
        )}
      </motion.div>
    </AppLayout>
  );
}
