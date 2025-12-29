import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { 
  User,
  Save,
  Palette,
  Sparkles,
  Camera,
  Check,
  ChevronRight,
  Upload,
  Video,
  X,
  SwitchCamera,
  Circle
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const bodyTypes = [
  { value: 'slim', label: 'Slim', icon: '🏃' },
  { value: 'athletic', label: 'Athletic', icon: '💪' },
  { value: 'average', label: 'Average', icon: '👤' },
  { value: 'curvy', label: 'Curvy', icon: '✨' },
  { value: 'plus', label: 'Plus Size', icon: '🌟' },
];

const skinTones = [
  { value: 'fair', label: 'Fair', color: '#FDEBD0' },
  { value: 'light', label: 'Light', color: '#F5CBA7' },
  { value: 'medium', label: 'Medium', color: '#D4A574' },
  { value: 'olive', label: 'Olive', color: '#C19A6B' },
  { value: 'tan', label: 'Tan', color: '#A67B5B' },
  { value: 'dark', label: 'Dark', color: '#6F4E37' },
];

const hairColors = [
  { value: 'blonde', label: 'Blonde', color: '#F4D03F' },
  { value: 'brown', label: 'Brown', color: '#6B4423' },
  { value: 'black', label: 'Black', color: '#1C1C1C' },
  { value: 'red', label: 'Red', color: '#A52A2A' },
  { value: 'gray', label: 'Gray', color: '#808080' },
  { value: 'other', label: 'Other', color: 'linear-gradient(135deg, #ff6b6b, #4ecdc4, #45b7d1)' },
];

const hairStyles = [
  { value: 'short', label: 'Short' },
  { value: 'medium', label: 'Medium' },
  { value: 'long', label: 'Long' },
  { value: 'bald', label: 'Bald' },
];

const stylePreferences = [
  { value: 'casual', label: 'Casual', desc: 'Relaxed & comfortable' },
  { value: 'formal', label: 'Formal', desc: 'Professional & elegant' },
  { value: 'streetwear', label: 'Streetwear', desc: 'Urban & trendy' },
  { value: 'bohemian', label: 'Bohemian', desc: 'Free-spirited & artistic' },
  { value: 'minimalist', label: 'Minimalist', desc: 'Clean & simple' },
  { value: 'classic', label: 'Classic', desc: 'Timeless & refined' },
];

const colorOptions = [
  { name: 'Black', hex: '#1a1a1a' },
  { name: 'White', hex: '#f5f5f5' },
  { name: 'Navy', hex: '#1e3a5f' },
  { name: 'Gray', hex: '#6b7280' },
  { name: 'Brown', hex: '#7c4a03' },
  { name: 'Beige', hex: '#d4b896' },
  { name: 'Red', hex: '#dc2626' },
  { name: 'Blue', hex: '#2563eb' },
  { name: 'Green', hex: '#16a34a' },
  { name: 'Yellow', hex: '#eab308' },
  { name: 'Pink', hex: '#ec4899' },
  { name: 'Purple', hex: '#9333ea' },
];

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [showPhotoOptions, setShowPhotoOptions] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [cameraReady, setCameraReady] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [profile, setProfile] = useState({
    full_name: '',
    body_type: '',
    skin_tone: '',
    hair_color: '',
    hair_style: '',
    style_preference: '',
    preferred_colors: [] as string[],
  });

  // Camera functions
  const startCamera = useCallback(async () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          setCameraReady(true);
        };
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast({
        title: 'Camera Error',
        description: 'Could not access your camera. Please check permissions.',
        variant: 'destructive',
      });
      setShowCamera(false);
    }
  }, [facingMode, toast]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraReady(false);
  }, []);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Flip horizontally if using front camera
    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    
    ctx.drawImage(video, 0, 0);
    
    const base64 = canvas.toDataURL('image/jpeg', 0.9);
    stopCamera();
    setShowCamera(false);
    processImage(base64);
  }, [facingMode, stopCamera]);

  const switchCamera = useCallback(() => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  }, []);

  useEffect(() => {
    if (showCamera) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [showCamera, startCamera, stopCamera]);

  useEffect(() => {
    if (showCamera && cameraReady) {
      startCamera();
    }
  }, [facingMode]);

  const processImage = async (base64: string) => {
    setPreviewImage(base64);
    setAnalyzing(true);

    try {
      const { data, error } = await supabase.functions.invoke('analyze-profile-image', {
        body: { imageBase64: base64 },
      });

      if (error) throw error;

      const analysis = data.analysis;
      
      setProfile(prev => ({
        ...prev,
        body_type: analysis.body_type || prev.body_type,
        skin_tone: analysis.skin_tone || prev.skin_tone,
        hair_color: analysis.hair_color || prev.hair_color,
        hair_style: analysis.hair_style || prev.hair_style,
      }));

      toast({ title: 'Analysis Complete', description: `Detected with ${analysis.confidence}% confidence.` });
    } catch (error) {
      console.error('Error analyzing image:', error);
      toast({ title: 'Analysis Failed', description: 'Could not analyze the image.', variant: 'destructive' });
    } finally {
      setAnalyzing(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({ title: 'Invalid file', description: 'Please upload an image file.', variant: 'destructive' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Please upload an image smaller than 5MB.', variant: 'destructive' });
      return;
    }

    setShowPhotoOptions(false);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      processImage(base64);
    };
    reader.readAsDataURL(file);
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
      toast({ title: 'Error', description: 'Failed to update profile.', variant: 'destructive' });
    } else {
      toast({ title: 'Profile Updated', description: 'Your style profile has been saved.' });
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
          <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-4xl mx-auto pb-12"
      >
        {/* Header with Photo Upload */}
        <div className="relative mb-12">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-primary/5 to-transparent rounded-3xl blur-3xl" />
          <div className="relative glass-panel rounded-3xl p-8 md:p-12">
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Photo Upload Area */}
              <div className="relative group">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => !analyzing && setShowPhotoOptions(true)}
                  className={`relative w-36 h-36 md:w-44 md:h-44 rounded-full cursor-pointer overflow-hidden transition-all duration-500 ${
                    analyzing ? 'animate-pulse' : ''
                  }`}
                >
                  {/* Outer ring */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary via-accent to-primary p-[3px]">
                    <div className="w-full h-full rounded-full bg-card overflow-hidden">
                      {previewImage ? (
                        <img src={previewImage} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-secondary/50">
                          <Camera className="w-10 h-10 text-muted-foreground mb-2" />
                          <span className="text-xs text-muted-foreground text-center px-4">
                            Add Photo
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Hover overlay */}
                  <div className="absolute inset-[3px] rounded-full bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="text-center">
                      <Sparkles className="w-6 h-6 mx-auto text-primary mb-1" />
                      <span className="text-xs font-medium">
                        {analyzing ? 'Analyzing...' : 'AI Scan'}
                      </span>
                    </div>
                  </div>
                </motion.div>
                
                {/* Status badge */}
                <AnimatePresence>
                  {previewImage && !analyzing && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-gold"
                    >
                      <Check className="w-4 h-4 text-primary-foreground" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Name and Email */}
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl md:text-4xl font-display font-bold mb-2 text-gradient-gold">
                  Style Profile
                </h1>
                <p className="text-muted-foreground mb-6">
                  Upload a photo for AI-powered feature detection
                </p>
                <Input
                  value={profile.full_name}
                  onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                  placeholder="Your name"
                  className="max-w-xs bg-secondary/50 border-border/50"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Body Type Selection */}
        <Section title="Body Type" icon={<User className="w-5 h-5" />}>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {bodyTypes.map((type) => (
              <SelectCard
                key={type.value}
                selected={profile.body_type === type.value}
                onClick={() => setProfile({ ...profile, body_type: type.value })}
              >
                <span className="text-2xl mb-2">{type.icon}</span>
                <span className="text-sm font-medium">{type.label}</span>
              </SelectCard>
            ))}
          </div>
        </Section>

        {/* Skin Tone */}
        <Section title="Skin Tone" icon={<Palette className="w-5 h-5" />}>
          <div className="flex flex-wrap gap-3 justify-center md:justify-start">
            {skinTones.map((tone) => (
              <motion.button
                key={tone.value}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setProfile({ ...profile, skin_tone: tone.value })}
                className={`group relative flex flex-col items-center gap-2 p-3 rounded-xl transition-all ${
                  profile.skin_tone === tone.value
                    ? 'ring-2 ring-primary ring-offset-2 ring-offset-background'
                    : 'hover:bg-secondary/50'
                }`}
              >
                <div
                  className="w-12 h-12 rounded-full shadow-md transition-transform group-hover:scale-110"
                  style={{ backgroundColor: tone.color }}
                />
                <span className="text-xs font-medium">{tone.label}</span>
              </motion.button>
            ))}
          </div>
        </Section>

        {/* Hair Color */}
        <Section title="Hair Color" icon={<ChevronRight className="w-5 h-5" />}>
          <div className="flex flex-wrap gap-3 justify-center md:justify-start">
            {hairColors.map((color) => (
              <motion.button
                key={color.value}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setProfile({ ...profile, hair_color: color.value })}
                className={`group relative flex flex-col items-center gap-2 p-3 rounded-xl transition-all ${
                  profile.hair_color === color.value
                    ? 'ring-2 ring-primary ring-offset-2 ring-offset-background'
                    : 'hover:bg-secondary/50'
                }`}
              >
                <div
                  className="w-12 h-12 rounded-full shadow-md transition-transform group-hover:scale-110 border border-border/30"
                  style={{ background: color.color }}
                />
                <span className="text-xs font-medium">{color.label}</span>
              </motion.button>
            ))}
          </div>
        </Section>

        {/* Hair Style */}
        <Section title="Hair Style" icon={<ChevronRight className="w-5 h-5" />}>
          <div className="flex flex-wrap gap-3">
            {hairStyles.map((style) => (
              <SelectPill
                key={style.value}
                selected={profile.hair_style === style.value}
                onClick={() => setProfile({ ...profile, hair_style: style.value })}
                label={style.label}
              />
            ))}
          </div>
        </Section>

        {/* Style Preference */}
        <Section title="Style Preference" icon={<Sparkles className="w-5 h-5" />}>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {stylePreferences.map((style) => (
              <motion.button
                key={style.value}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setProfile({ ...profile, style_preference: style.value })}
                className={`relative p-4 rounded-2xl text-left transition-all duration-300 overflow-hidden ${
                  profile.style_preference === style.value
                    ? 'bg-primary/15 border border-primary/50'
                    : 'bg-secondary/30 border border-transparent hover:border-border/50'
                }`}
              >
                {profile.style_preference === style.value && (
                  <div className="absolute top-3 right-3">
                    <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-3 h-3 text-primary-foreground" />
                    </div>
                  </div>
                )}
                <h3 className="font-semibold mb-1">{style.label}</h3>
                <p className="text-xs text-muted-foreground">{style.desc}</p>
              </motion.button>
            ))}
          </div>
        </Section>

        {/* Preferred Colors */}
        <Section title="Preferred Colors" icon={<Palette className="w-5 h-5" />}>
          <p className="text-sm text-muted-foreground mb-4">Select colors you love to wear</p>
          <div className="flex flex-wrap gap-2">
            {colorOptions.map((color) => (
              <motion.button
                key={color.name}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => toggleColor(color.name)}
                className={`group relative flex items-center gap-2 px-3 py-2 rounded-full transition-all ${
                  profile.preferred_colors.includes(color.name)
                    ? 'bg-primary/15 border border-primary/50'
                    : 'bg-secondary/30 border border-transparent hover:border-border/50'
                }`}
              >
                <div
                  className="w-4 h-4 rounded-full border border-white/20"
                  style={{ backgroundColor: color.hex }}
                />
                <span className="text-sm">{color.name}</span>
                {profile.preferred_colors.includes(color.name) && (
                  <Check className="w-3 h-3 text-primary" />
                )}
              </motion.button>
            ))}
          </div>
        </Section>

        {/* Save Button */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex justify-center mt-12"
        >
          <Button 
            variant="gold" 
            size="lg" 
            onClick={handleSave} 
            disabled={saving}
            className="px-12 py-6 text-lg shadow-gold"
          >
            {saving ? (
              <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
                Save Profile
              </>
            )}
          </Button>
        </motion.div>
      </motion.div>

      {/* Photo Options Dialog */}
      <Dialog open={showPhotoOptions} onOpenChange={setShowPhotoOptions}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">Add Profile Photo</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setShowPhotoOptions(false);
                setShowCamera(true);
              }}
              className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-secondary/50 hover:bg-secondary transition-colors"
            >
              <div className="w-14 h-14 rounded-full bg-primary/15 flex items-center justify-center">
                <Video className="w-7 h-7 text-primary" />
              </div>
              <div className="text-center">
                <p className="font-semibold">Take Photo</p>
                <p className="text-xs text-muted-foreground">Use your camera</p>
              </div>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-secondary/50 hover:bg-secondary transition-colors"
            >
              <div className="w-14 h-14 rounded-full bg-primary/15 flex items-center justify-center">
                <Upload className="w-7 h-7 text-primary" />
              </div>
              <div className="text-center">
                <p className="font-semibold">Upload Photo</p>
                <p className="text-xs text-muted-foreground">Choose from device</p>
              </div>
            </motion.button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Camera Modal */}
      <Dialog open={showCamera} onOpenChange={(open) => {
        if (!open) stopCamera();
        setShowCamera(open);
      }}>
        <DialogContent className="sm:max-w-lg p-0 overflow-hidden">
          <div className="relative aspect-[3/4] bg-black">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
            />
            <canvas ref={canvasRef} className="hidden" />

            {/* Camera loading overlay */}
            {!cameraReady && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                <div className="text-center">
                  <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">Starting camera...</p>
                </div>
              </div>
            )}

            {/* Face guide overlay */}
            {cameraReady && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-48 h-56 border-2 border-dashed border-white/40 rounded-[50%]" />
              </div>
            )}

            {/* Close button */}
            <button
              onClick={() => setShowCamera(false)}
              className="absolute top-4 left-4 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Switch camera button */}
            <button
              onClick={switchCamera}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-colors"
            >
              <SwitchCamera className="w-5 h-5" />
            </button>

            {/* Capture controls */}
            {cameraReady && (
              <div className="absolute bottom-6 left-0 right-0 flex justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={capturePhoto}
                  className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-lg"
                >
                  <Circle className="w-14 h-14 text-primary fill-primary/20" />
                </motion.button>
              </div>
            )}
          </div>
          
          {/* Instructions */}
          <div className="p-4 bg-background text-center">
            <p className="text-sm text-muted-foreground">
              Position your face in the circle for best AI analysis
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}

// Reusable Section Component
function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-10"
    >
      <div className="flex items-center gap-2 mb-4">
        <span className="text-primary">{icon}</span>
        <h2 className="text-lg font-semibold">{title}</h2>
      </div>
      {children}
    </motion.div>
  );
}

// Selection Card Component
function SelectCard({ 
  selected, 
  onClick, 
  children 
}: { 
  selected: boolean; 
  onClick: () => void; 
  children: React.ReactNode;
}) {
  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`relative flex flex-col items-center justify-center p-4 rounded-2xl transition-all duration-300 ${
        selected
          ? 'bg-primary/15 border-2 border-primary shadow-gold'
          : 'bg-secondary/30 border-2 border-transparent hover:border-border/50'
      }`}
    >
      {children}
      {selected && (
        <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
          <Check className="w-2.5 h-2.5 text-primary-foreground" />
        </div>
      )}
    </motion.button>
  );
}

// Selection Pill Component
function SelectPill({ 
  selected, 
  onClick, 
  label 
}: { 
  selected: boolean; 
  onClick: () => void; 
  label: string;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
        selected
          ? 'bg-primary text-primary-foreground shadow-gold'
          : 'bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground'
      }`}
    >
      {label}
    </motion.button>
  );
}
