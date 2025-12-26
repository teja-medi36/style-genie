import { useState, useEffect } from 'react';
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
  ChevronRight
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
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="icon-circle-primary mx-auto mb-4">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-display font-bold mb-2">
            AI <span className="text-gradient-orange">Style Assistant</span>
          </h1>
          <p className="text-muted-foreground">Get personalized outfit recommendations</p>
        </div>

        {/* Occasion Selector */}
        <div className="card-elevated p-6 space-y-4 max-w-lg mx-auto">
          <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            What's the occasion?
          </label>
          <Select value={occasion} onValueChange={setOccasion}>
            <SelectTrigger className="h-12">
              <SelectValue placeholder="Select occasion" />
            </SelectTrigger>
            <SelectContent>
              {occasions.map(occ => (
                <SelectItem key={occ.value} value={occ.value}>
                  <span className="flex items-center gap-2">
                    <span>{occ.icon}</span>
                    <span>{occ.label}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button 
            onClick={generateOutfit}
            disabled={loading}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Generate Outfit
              </>
            )}
          </Button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center py-12">
            <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
            <p className="mt-4 text-muted-foreground">Crafting your outfit...</p>
          </div>
        )}

        {/* Result */}
        {suggestion && !loading && (
          <div className="space-y-6 max-w-lg mx-auto">
            {/* Outfit Card */}
            <div className="card-elevated overflow-hidden">
              <div className="promo-banner p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Shirt className="w-5 h-5" />
                  <span className="font-semibold">Your Outfit</span>
                </div>
                <Button variant="secondary" size="sm" onClick={saveOutfit} className="bg-white/20 hover:bg-white/30 text-white border-0">
                  <Save className="w-4 h-4 mr-1" />
                  Save
                </Button>
              </div>
              <div className="p-4 space-y-3">
                {[
                  { label: 'Top', value: suggestion.outfit.top },
                  { label: 'Bottom', value: suggestion.outfit.bottom },
                  { label: 'Shoes', value: suggestion.outfit.shoes },
                  suggestion.outfit.outerwear && { label: 'Outerwear', value: suggestion.outfit.outerwear },
                  suggestion.outfit.accessories && { label: 'Accessories', value: suggestion.outfit.accessories },
                ].filter(Boolean).map((item: any, index) => (
                  <div key={index} className="category-item">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase">{item.label}</p>
                      <p className="font-medium">{item.value}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                ))}
              </div>
            </div>

            {/* Explanation */}
            <div className="card-clean p-4">
              <p className="text-muted-foreground leading-relaxed">{suggestion.explanation}</p>
            </div>

            {/* Tips */}
            <div className="card-clean p-4">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="w-4 h-4 text-primary" />
                <span className="font-semibold text-sm">Styling Tips</span>
              </div>
              <ul className="space-y-2">
                {suggestion.styling_tips.map((tip, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center flex-shrink-0">
                      {index + 1}
                    </span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>

            {/* Color Harmony */}
            <div className="card-clean p-4">
              <div className="flex items-center gap-2 mb-2">
                <Palette className="w-4 h-4 text-primary" />
                <span className="font-semibold text-sm">Color Harmony</span>
              </div>
              <p className="text-sm text-muted-foreground">{suggestion.color_harmony}</p>
            </div>

            {/* Regenerate */}
            <Button variant="outline" className="w-full" onClick={generateOutfit} disabled={loading}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Generate Another
            </Button>
          </div>
        )}

        {/* Empty State */}
        {!suggestion && !loading && (
          <div className="card-clean text-center p-8 max-w-lg mx-auto">
            <div className="icon-circle mx-auto mb-4">
              <Sparkles className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="font-medium mb-1">Ready to get styled?</p>
            <p className="text-sm text-muted-foreground">
              Select an occasion and tap Generate
            </p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
