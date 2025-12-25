import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { 
  User,
  Save,
  Palette,
  Ruler,
  Scissors,
  Camera,
  Sparkles,
  Upload
} from 'lucide-react';

const bodyTypes = [
  { value: 'slim', label: 'Slim' },
  { value: 'athletic', label: 'Athletic' },
  { value: 'average', label: 'Average' },
  { value: 'curvy', label: 'Curvy' },
  { value: 'plus', label: 'Plus Size' },
];

const skinTones = [
  { value: 'fair', label: 'Fair' },
  { value: 'light', label: 'Light' },
  { value: 'medium', label: 'Medium' },
  { value: 'olive', label: 'Olive' },
  { value: 'tan', label: 'Tan' },
  { value: 'dark', label: 'Dark' },
];

const hairColors = [
  { value: 'blonde', label: 'Blonde' },
  { value: 'brown', label: 'Brown' },
  { value: 'black', label: 'Black' },
  { value: 'red', label: 'Red' },
  { value: 'gray', label: 'Gray' },
  { value: 'other', label: 'Other' },
];

const hairStyles = [
  { value: 'short', label: 'Short' },
  { value: 'medium', label: 'Medium' },
  { value: 'long', label: 'Long' },
  { value: 'bald', label: 'Bald' },
];

const stylePreferences = [
  { value: 'casual', label: 'Casual' },
  { value: 'formal', label: 'Formal' },
  { value: 'streetwear', label: 'Streetwear' },
  { value: 'bohemian', label: 'Bohemian' },
  { value: 'minimalist', label: 'Minimalist' },
  { value: 'classic', label: 'Classic' },
];

const colorOptions = [
  'Black', 'White', 'Navy', 'Gray', 'Brown', 'Beige',
  'Red', 'Blue', 'Green', 'Yellow', 'Pink', 'Purple'
];

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState({
    full_name: '',
    body_type: '',
    skin_tone: '',
    hair_color: '',
    hair_style: '',
    style_preference: '',
    preferred_colors: [] as string[],
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file',
        description: 'Please upload an image file.',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please upload an image smaller than 5MB.',
        variant: 'destructive',
      });
      return;
    }

    setAnalyzing(true);

    try {
      // Convert to base64
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target?.result as string;
        setPreviewImage(base64);

        // Call the AI analysis edge function
        const { data, error } = await supabase.functions.invoke('analyze-profile-image', {
          body: { imageBase64: base64 },
        });

        if (error) throw error;

        const analysis = data.analysis;
        
        // Update profile with AI predictions
        setProfile(prev => ({
          ...prev,
          body_type: analysis.body_type || prev.body_type,
          skin_tone: analysis.skin_tone || prev.skin_tone,
          hair_color: analysis.hair_color || prev.hair_color,
          hair_style: analysis.hair_style || prev.hair_style,
        }));

        toast({
          title: 'Analysis Complete',
          description: `Detected your features with ${analysis.confidence}% confidence. You can adjust if needed.`,
        });
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error analyzing image:', error);
      toast({
        title: 'Analysis Failed',
        description: 'Could not analyze the image. Please try again or set manually.',
        variant: 'destructive',
      });
    } finally {
      setAnalyzing(false);
    }
  };

  useEffect(() => {
    if (user) fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user?.id)
      .maybeSingle();

    if (data) {
      setProfile({
        full_name: data.full_name || '',
        body_type: data.body_type || '',
        skin_tone: data.skin_tone || '',
        hair_color: data.hair_color || '',
        hair_style: data.hair_style || '',
        style_preference: data.style_preference || '',
        preferred_colors: data.preferred_colors || [],
      });
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: profile.full_name,
        body_type: profile.body_type || null,
        skin_tone: profile.skin_tone || null,
        hair_color: profile.hair_color || null,
        hair_style: profile.hair_style || null,
        style_preference: profile.style_preference || null,
        preferred_colors: profile.preferred_colors.length > 0 ? profile.preferred_colors : null,
      })
      .eq('user_id', user?.id);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to update profile.',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Profile Updated',
        description: 'Your style profile has been saved.',
      });
    }
    setSaving(false);
  };

  const toggleColor = (color: string) => {
    setProfile(prev => ({
      ...prev,
      preferred_colors: prev.preferred_colors.includes(color)
        ? prev.preferred_colors.filter(c => c !== color)
        : [...prev.preferred_colors, color]
    }));
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-20">
          <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto space-y-8"
      >
        {/* Header */}
        <div className="text-center">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-accent mx-auto mb-6 flex items-center justify-center shadow-[0_4px_30px_-5px_hsla(38,92%,50%,0.4)]">
            <User className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-display font-bold mb-3">Style Profile</h1>
          <p className="text-muted-foreground text-lg">
            Help us understand your style for better outfit recommendations
          </p>
        </div>

        {/* Basic Info */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Full Name</label>
              <Input
                value={profile.full_name}
                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                placeholder="Your name"
              />
            </div>
          </CardContent>
        </Card>

        {/* AI Photo Analysis */}
        <Card variant="elevated" className="overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-primary" />
              AI Photo Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Upload a photo and let AI detect your body type, skin tone, and hair features automatically.
            </p>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />

            <div className="flex flex-col md:flex-row gap-6 items-center">
              {/* Preview Area */}
              <div 
                onClick={() => !analyzing && fileInputRef.current?.click()}
                className={`w-40 h-40 rounded-2xl border-2 border-dashed flex items-center justify-center cursor-pointer transition-all duration-300 overflow-hidden ${
                  previewImage ? 'border-primary' : 'border-border hover:border-primary/50'
                } ${analyzing ? 'opacity-50 cursor-wait' : ''}`}
              >
                {previewImage ? (
                  <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center p-4">
                    <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                    <span className="text-sm text-muted-foreground">Upload Photo</span>
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-3">
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={analyzing}
                  className="w-full md:w-auto"
                >
                  {analyzing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-foreground border-t-transparent rounded-full animate-spin mr-2" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      {previewImage ? 'Upload New Photo' : 'Upload & Analyze'}
                    </>
                  )}
                </Button>
                <p className="text-xs text-muted-foreground">
                  For best results, use a well-lit, full-body photo. Max 5MB.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Body & Features */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ruler className="w-5 h-5 text-primary" />
              Body & Features
              {(profile.body_type || profile.skin_tone || profile.hair_color || profile.hair_style) && (
                <span className="ml-auto text-xs font-normal text-muted-foreground">
                  {previewImage ? 'AI detected • adjust if needed' : 'Set manually'}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Body Type</label>
              <Select value={profile.body_type} onValueChange={(v) => setProfile({ ...profile, body_type: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select body type" />
                </SelectTrigger>
                <SelectContent>
                  {bodyTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Skin Tone</label>
              <Select value={profile.skin_tone} onValueChange={(v) => setProfile({ ...profile, skin_tone: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select skin tone" />
                </SelectTrigger>
                <SelectContent>
                  {skinTones.map(tone => (
                    <SelectItem key={tone.value} value={tone.value}>{tone.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Hair Color</label>
              <Select value={profile.hair_color} onValueChange={(v) => setProfile({ ...profile, hair_color: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select hair color" />
                </SelectTrigger>
                <SelectContent>
                  {hairColors.map(color => (
                    <SelectItem key={color.value} value={color.value}>{color.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Hair Style</label>
              <Select value={profile.hair_style} onValueChange={(v) => setProfile({ ...profile, hair_style: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select hair style" />
                </SelectTrigger>
                <SelectContent>
                  {hairStyles.map(style => (
                    <SelectItem key={style.value} value={style.value}>{style.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Style Preferences */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scissors className="w-5 h-5 text-primary" />
              Style Preference
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {stylePreferences.map(style => (
                <button
                  key={style.value}
                  onClick={() => setProfile({ ...profile, style_preference: style.value })}
                  className={`p-4 rounded-xl border text-center transition-all duration-300 ${
                    profile.style_preference === style.value
                      ? 'border-primary bg-primary/10 text-foreground'
                      : 'border-border bg-secondary/30 text-muted-foreground hover:border-primary/50'
                  }`}
                >
                  {style.label}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Color Preferences */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5 text-primary" />
              Preferred Colors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">Select colors you love to wear</p>
            <div className="flex flex-wrap gap-3">
              {colorOptions.map(color => (
                <button
                  key={color}
                  onClick={() => toggleColor(color)}
                  className={`px-4 py-2 rounded-full border text-sm transition-all duration-300 ${
                    profile.preferred_colors.includes(color)
                      ? 'border-primary bg-primary/10 text-foreground'
                      : 'border-border bg-secondary/30 text-muted-foreground hover:border-primary/50'
                  }`}
                >
                  {color}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-center pb-8">
          <Button variant="gold" size="lg" onClick={handleSave} disabled={saving}>
            {saving ? (
              <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
                Save Profile
              </>
            )}
          </Button>
        </div>
      </motion.div>
    </AppLayout>
  );
}
