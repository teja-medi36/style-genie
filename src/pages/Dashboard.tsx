import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  Zap
} from 'lucide-react';

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
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
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
        <motion.div variants={itemVariants} className="space-y-2">
          <h1 className="text-3xl lg:text-4xl font-display font-bold">
            {getGreeting()}, <span className="text-gradient-gold">{profile?.full_name || 'Style Icon'}</span>
          </h1>
          <p className="text-muted-foreground text-lg">Ready to discover your perfect outfit?</p>
        </motion.div>

        {/* Quick Action Card */}
        <motion.div variants={itemVariants}>
          <Card variant="glass" className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-gold/10 via-transparent to-gold/5" />
            <CardContent className="p-8 relative">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center shadow-gold animate-float">
                    <Zap className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-display font-bold">Get AI-Powered Styling</h2>
                    <p className="text-muted-foreground">Let our AI create the perfect outfit for any occasion</p>
                  </div>
                </div>
                <Button variant="hero" asChild>
                  <Link to="/get-styled">
                    <Sparkles className="w-5 h-5 mr-2" />
                    Get Styled Now
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats Grid */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card variant="elevated" className="group cursor-pointer hover:-translate-y-1 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Wardrobe Items</p>
                  <p className="text-3xl font-display font-bold mt-1">{stats.total}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center group-hover:bg-gold/20 transition-colors">
                  <Shirt className="w-6 h-6 text-gold" />
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <span className="text-xs px-2 py-1 rounded-full bg-secondary text-muted-foreground">{stats.shirts} shirts</span>
                <span className="text-xs px-2 py-1 rounded-full bg-secondary text-muted-foreground">{stats.pants} pants</span>
              </div>
            </CardContent>
          </Card>

          <Card variant="elevated" className="group cursor-pointer hover:-translate-y-1 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Style Profile</p>
                  <p className="text-xl font-display font-bold mt-1 capitalize">{profile?.style_preference || 'Not Set'}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center group-hover:bg-gold/20 transition-colors">
                  <TrendingUp className="w-6 h-6 text-gold" />
                </div>
              </div>
              <Link to="/profile" className="mt-4 inline-flex items-center text-sm text-gold hover:text-gold-light transition-colors">
                Update profile <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </CardContent>
          </Card>

          <Card variant="elevated" className="group cursor-pointer hover:-translate-y-1 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Quick Search</p>
                  <p className="text-xl font-display font-bold mt-1">Find Deals</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center group-hover:bg-gold/20 transition-colors">
                  <Search className="w-6 h-6 text-gold" />
                </div>
              </div>
              <Link to="/search" className="mt-4 inline-flex items-center text-sm text-gold hover:text-gold-light transition-colors">
                Search outfits <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={itemVariants}>
          <h2 className="text-xl font-display font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Link to="/wardrobe">
              <Card variant="glass" className="group cursor-pointer hover:border-gold/30 transition-all duration-300">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center group-hover:bg-gold/10 transition-colors mb-3">
                    <Plus className="w-6 h-6 text-muted-foreground group-hover:text-gold transition-colors" />
                  </div>
                  <p className="font-medium">Add to Wardrobe</p>
                  <p className="text-xs text-muted-foreground mt-1">Add new items</p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/get-styled">
              <Card variant="glass" className="group cursor-pointer hover:border-gold/30 transition-all duration-300">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center group-hover:bg-gold/10 transition-colors mb-3">
                    <Sparkles className="w-6 h-6 text-muted-foreground group-hover:text-gold transition-colors" />
                  </div>
                  <p className="font-medium">AI Suggest</p>
                  <p className="text-xs text-muted-foreground mt-1">Get outfit ideas</p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/search">
              <Card variant="glass" className="group cursor-pointer hover:border-gold/30 transition-all duration-300">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center group-hover:bg-gold/10 transition-colors mb-3">
                    <Search className="w-6 h-6 text-muted-foreground group-hover:text-gold transition-colors" />
                  </div>
                  <p className="font-medium">Shop Deals</p>
                  <p className="text-xs text-muted-foreground mt-1">Find best prices</p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/saved">
              <Card variant="glass" className="group cursor-pointer hover:border-gold/30 transition-all duration-300">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center group-hover:bg-gold/10 transition-colors mb-3">
                    <TrendingUp className="w-6 h-6 text-muted-foreground group-hover:text-gold transition-colors" />
                  </div>
                  <p className="font-medium">Saved Looks</p>
                  <p className="text-xs text-muted-foreground mt-1">View favorites</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </AppLayout>
  );
}
