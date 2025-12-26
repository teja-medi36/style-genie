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
  Plus,
  ArrowRight,
  Heart,
  Camera,
  ChevronRight
} from 'lucide-react';

import fashionModel1 from '@/assets/fashion-model-1.jpg';
import fashionModel2 from '@/assets/fashion-model-2.jpg';
import fashionModel3 from '@/assets/fashion-model-3.jpg';

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
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const }
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
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        {/* Header */}
        <motion.div variants={itemVariants}>
          <h1 className="text-3xl font-display font-bold">
            Welcome back
            <br />
            <span className="text-gradient-orange">{profile?.full_name || 'Style Icon'}</span>
          </h1>
        </motion.div>

        {/* Search Bar */}
        <motion.div variants={itemVariants}>
          <div className="relative">
            <input
              type="text"
              placeholder="What are you looking for?"
              className="search-input pr-12"
            />
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          </div>
        </motion.div>

        {/* Promo Banner */}
        <motion.div variants={itemVariants}>
          <div className="promo-banner p-8 text-center">
            <p className="text-3xl font-display font-bold mb-1">AI Styling</p>
            <p className="text-lg opacity-90">Get personalized outfits</p>
            <Button 
              variant="secondary" 
              className="mt-4 bg-white/20 hover:bg-white/30 text-white border-0"
              asChild
            >
              <Link to="/get-styled">
                Try Now
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4">
          <Link to="/wardrobe" className="stat-card group">
            <div className="icon-circle mb-3 group-hover:bg-primary/10 transition-colors">
              <Shirt className="w-5 h-5 text-primary" />
            </div>
            <p className="text-3xl font-display font-bold">{stats.total}</p>
            <p className="text-sm text-muted-foreground">Wardrobe Items</p>
          </Link>

          <Link to="/search" className="stat-card group">
            <div className="icon-circle mb-3 group-hover:bg-primary/10 transition-colors">
              <Camera className="w-5 h-5 text-primary" />
            </div>
            <p className="text-lg font-display font-semibold">Visual Search</p>
            <p className="text-sm text-muted-foreground">Find any outfit</p>
          </Link>
        </motion.div>

        {/* Shop the Look */}
        <motion.div variants={itemVariants}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-display font-semibold">Shop the look</h3>
            <Link to="/search" className="text-primary text-sm font-medium flex items-center gap-1">
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="shop-card group cursor-pointer">
              <div className="aspect-[3/4] overflow-hidden">
                <img
                  src={fashionModel1}
                  alt="Fashion look"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>
            <div className="shop-card group cursor-pointer">
              <div className="aspect-[3/4] overflow-hidden">
                <img
                  src={fashionModel2}
                  alt="Fashion look"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={itemVariants}>
          <h3 className="text-xl font-display font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <Link to="/wardrobe" className="action-card flex items-center gap-3">
              <div className="icon-circle">
                <Plus className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium text-sm">Add Items</p>
                <p className="text-xs text-muted-foreground">Build wardrobe</p>
              </div>
            </Link>

            <Link to="/get-styled" className="action-card flex items-center gap-3">
              <div className="icon-circle">
                <Sparkles className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium text-sm">AI Suggest</p>
                <p className="text-xs text-muted-foreground">Get outfit ideas</p>
              </div>
            </Link>

            <Link to="/search" className="action-card flex items-center gap-3">
              <div className="icon-circle">
                <Search className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium text-sm">Shop Deals</p>
                <p className="text-xs text-muted-foreground">Find best prices</p>
              </div>
            </Link>

            <Link to="/saved" className="action-card flex items-center gap-3">
              <div className="icon-circle">
                <Heart className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium text-sm">Saved</p>
                <p className="text-xs text-muted-foreground">View favorites</p>
              </div>
            </Link>
          </div>
        </motion.div>

        {/* Trending */}
        <motion.div variants={itemVariants} className="pb-6">
          <h3 className="text-xl font-display font-semibold mb-4">Trending now</h3>
          <div className="flex gap-4 overflow-x-auto pb-2 -mx-6 px-6 scrollbar-hide">
            {[fashionModel3, fashionModel1, fashionModel2].map((img, index) => (
              <div
                key={index}
                className="flex-shrink-0 w-28 shop-card group cursor-pointer"
              >
                <div className="aspect-[3/4] overflow-hidden rounded-xl">
                  <img
                    src={img}
                    alt={`Trending look ${index + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AppLayout>
  );
}
