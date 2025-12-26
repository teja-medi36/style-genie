import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { 
  Sparkles, 
  Shirt, 
  Search, 
  TrendingUp,
  Plus,
  ArrowRight,
  Zap,
  Heart,
  Camera,
  Crown
} from 'lucide-react';

import fashionModel1 from '@/assets/fashion-model-1.jpg';
import fashionModel2 from '@/assets/fashion-model-2.jpg';

interface Profile {
  full_name: string | null;
  style_preference: string | null;
}

interface WardrobeStats {
  total: number;
  shirts: number;
  pants: number;
  other: number;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const }
  }
};

export default function Dashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<WardrobeStats>({ total: 0, shirts: 0, pants: 0, other: 0 });

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchStats();
    }
  }, [user]);

  const fetchProfile = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('full_name, style_preference')
      .eq('user_id', user?.id)
      .maybeSingle();
    
    if (data) setProfile(data);
  };

  const fetchStats = async () => {
    const { data, count } = await supabase
      .from('wardrobe_items')
      .select('category', { count: 'exact' })
      .eq('user_id', user?.id);

    if (data) {
      const shirts = data.filter(item => item.category === 'shirt').length;
      const pants = data.filter(item => item.category === 'pants').length;
      setStats({
        total: count || 0,
        shirts,
        pants,
        other: (count || 0) - shirts - pants
      });
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <AppLayout>
      <div className="relative min-h-full">
        {/* Background Effects */}
        <div className="absolute inset-0 hero-gradient pointer-events-none" />
        
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative space-y-10"
        >
          {/* Header with Profile */}
          <motion.div variants={itemVariants} className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl icon-box-lg flex items-center justify-center">
                  <Crown className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-muted-foreground text-sm font-medium tracking-wide uppercase">
                    {getGreeting()}
                  </p>
                  <h1 className="text-4xl lg:text-5xl font-display font-bold tracking-tight">
                    <span className="text-gradient-gold">{profile?.full_name || 'Style Icon'}</span>
                  </h1>
                </div>
              </div>
              <p className="text-muted-foreground text-lg pl-[60px]">
                Your personal AI stylist awaits
              </p>
            </div>
          </motion.div>

          {/* Hero Action Card */}
          <motion.div variants={itemVariants}>
            <div className="luxury-card rounded-3xl p-1">
              <div className="relative rounded-[22px] overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-background via-background/95 to-transparent z-10" />
                <div className="absolute inset-0">
                  <img 
                    src={fashionModel1} 
                    alt="Fashion"
                    className="w-full h-full object-cover opacity-40"
                  />
                </div>
                <div className="relative z-20 p-8 lg:p-12 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
                  <div className="flex items-start gap-6">
                    <motion.div 
                      className="w-20 h-20 rounded-3xl icon-box-lg flex items-center justify-center flex-shrink-0"
                      animate={{ 
                        boxShadow: [
                          '0 8px 32px -8px hsla(40, 90%, 55%, 0.5)',
                          '0 12px 40px -8px hsla(40, 90%, 55%, 0.7)',
                          '0 8px 32px -8px hsla(40, 90%, 55%, 0.5)'
                        ]
                      }}
                      transition={{ duration: 3, repeat: Infinity }}
                    >
                      <Zap className="w-10 h-10 text-primary-foreground" />
                    </motion.div>
                    <div>
                      <h2 className="text-3xl lg:text-4xl font-display font-bold mb-2">
                        AI-Powered Styling
                      </h2>
                      <p className="text-muted-foreground text-lg max-w-md">
                        Get personalized outfit recommendations crafted just for you
                      </p>
                    </div>
                  </div>
                  <Button variant="hero" size="xl" asChild className="w-full lg:w-auto">
                    <Link to="/get-styled">
                      <Sparkles className="w-5 h-5 mr-2" />
                      Get Styled Now
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Stats Row */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <Link to="/wardrobe" className="stat-card rounded-2xl p-6 group">
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 rounded-2xl icon-box flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Shirt className="w-7 h-7 text-primary" />
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>
              <p className="text-5xl font-display font-bold text-gradient-gold mb-1">{stats.total}</p>
              <p className="text-muted-foreground font-medium">Wardrobe Items</p>
              <div className="mt-4 flex gap-2 flex-wrap">
                <span className="px-3 py-1 rounded-full bg-secondary/50 text-xs text-muted-foreground">
                  {stats.shirts} tops
                </span>
                <span className="px-3 py-1 rounded-full bg-secondary/50 text-xs text-muted-foreground">
                  {stats.pants} bottoms
                </span>
              </div>
            </Link>

            <Link to="/profile" className="stat-card rounded-2xl p-6 group">
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 rounded-2xl icon-box flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="w-7 h-7 text-primary" />
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>
              <p className="text-2xl font-display font-bold mb-1 capitalize">
                {profile?.style_preference || 'Not Set'}
              </p>
              <p className="text-muted-foreground font-medium">Style Profile</p>
              <p className="mt-4 text-sm text-primary hover:text-primary/80 transition-colors inline-flex items-center gap-1">
                Customize your style <ArrowRight className="w-4 h-4" />
              </p>
            </Link>

            <Link to="/search" className="stat-card rounded-2xl p-6 group">
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 rounded-2xl icon-box flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Camera className="w-7 h-7 text-primary" />
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>
              <p className="text-2xl font-display font-bold mb-1">Visual Search</p>
              <p className="text-muted-foreground font-medium">Click to Shop</p>
              <p className="mt-4 text-sm text-primary hover:text-primary/80 transition-colors inline-flex items-center gap-1">
                Find any outfit <ArrowRight className="w-4 h-4" />
              </p>
            </Link>
          </motion.div>

          {/* Quick Actions */}
          <motion.div variants={itemVariants} className="space-y-6">
            <h2 className="text-2xl font-display font-semibold flex items-center gap-3">
              <span className="w-1 h-6 rounded-full bg-primary" />
              Quick Actions
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Link to="/wardrobe" className="action-card rounded-2xl p-6 group hover:-translate-y-1 transition-all duration-300">
                <div className="w-14 h-14 rounded-2xl bg-secondary/50 flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
                  <Plus className="w-7 h-7 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <p className="font-semibold mb-1">Add Items</p>
                <p className="text-sm text-muted-foreground">Build your wardrobe</p>
              </Link>

              <Link to="/get-styled" className="action-card rounded-2xl p-6 group hover:-translate-y-1 transition-all duration-300">
                <div className="w-14 h-14 rounded-2xl bg-secondary/50 flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
                  <Sparkles className="w-7 h-7 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <p className="font-semibold mb-1">AI Suggest</p>
                <p className="text-sm text-muted-foreground">Get outfit ideas</p>
              </Link>

              <Link to="/search" className="action-card rounded-2xl p-6 group hover:-translate-y-1 transition-all duration-300">
                <div className="w-14 h-14 rounded-2xl bg-secondary/50 flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
                  <Search className="w-7 h-7 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <p className="font-semibold mb-1">Shop Deals</p>
                <p className="text-sm text-muted-foreground">Find best prices</p>
              </Link>

              <Link to="/saved" className="action-card rounded-2xl p-6 group hover:-translate-y-1 transition-all duration-300">
                <div className="w-14 h-14 rounded-2xl bg-secondary/50 flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
                  <Heart className="w-7 h-7 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <p className="font-semibold mb-1">Saved Looks</p>
                <p className="text-sm text-muted-foreground">View favorites</p>
              </Link>
            </div>
          </motion.div>

          {/* Featured Look */}
          <motion.div variants={itemVariants}>
            <div className="luxury-card rounded-3xl overflow-hidden">
              <div className="grid lg:grid-cols-2">
                <div className="p-8 lg:p-12 flex flex-col justify-center">
                  <span className="text-primary text-sm font-semibold tracking-wider uppercase mb-4">
                    Featured
                  </span>
                  <h3 className="text-3xl font-display font-bold mb-4">
                    Explore Trending Styles
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Discover curated lookbooks and click on any item to find where to buy it at the best price.
                  </p>
                  <Button variant="gold" asChild className="w-fit">
                    <Link to="/search">
                      Explore Lookbooks
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Link>
                  </Button>
                </div>
                <div className="relative aspect-[4/3] lg:aspect-auto">
                  <img 
                    src={fashionModel2} 
                    alt="Featured fashion"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-card via-card/50 to-transparent lg:from-transparent" />
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </AppLayout>
  );
}
