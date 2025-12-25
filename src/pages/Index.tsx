import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { ArrowRight, Camera, Sparkles, TrendingUp, ShoppingBag } from 'lucide-react';
import Logo from '@/components/Logo';

import fashionModel1 from '@/assets/fashion-model-1.jpg';
import fashionModel2 from '@/assets/fashion-model-2.jpg';
import fashionModel3 from '@/assets/fashion-model-3.jpg';
import fashionModel4 from '@/assets/fashion-model-4.jpg';

const fashionImages = [fashionModel1, fashionModel2, fashionModel3, fashionModel4];

export default function Index() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-bl from-primary/10 via-primary/5 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-primary/5 to-transparent rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between p-6 lg:px-12">
        <Logo size="md" />
        <Link to="/auth">
          <Button variant="outline">Sign In</Button>
        </Link>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10">
        <div className="container mx-auto px-6 pt-8 lg:pt-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-xl"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm mb-6"
              >
                <Sparkles className="w-4 h-4" />
                AI-Powered Fashion Assistant
              </motion.div>

              <h1 className="text-4xl lg:text-6xl font-display font-bold mb-6 leading-tight">
                Your Style,
                <br />
                <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                  Perfectly Synced
                </span>
              </h1>

              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Click on any outfit to find it instantly. AI-powered style predictions 
                based on your unique features. Discover deals across all your favorite stores.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Link to="/auth">
                  <Button variant="hero" size="xl">
                    Get Started Free
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button variant="outline" size="lg">
                    Sign In
                  </Button>
                </Link>
              </div>

              {/* Feature Pills */}
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card/50 border border-border text-sm">
                  <Camera className="w-4 h-4 text-primary" />
                  Click to Search
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card/50 border border-border text-sm">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  AI Predictions
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card/50 border border-border text-sm">
                  <ShoppingBag className="w-4 h-4 text-primary" />
                  Best Deals
                </div>
              </div>
            </motion.div>

            {/* Right - Fashion Gallery */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="grid grid-cols-2 gap-4">
                {fashionImages.map((img, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className={`relative group cursor-pointer overflow-hidden rounded-2xl ${
                      index % 3 === 0 ? 'aspect-[3/4]' : 'aspect-[3/4]'
                    }`}
                    whileHover={{ scale: 1.02 }}
                  >
                    <img
                      src={img}
                      alt={`Fashion model ${index + 1}`}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />
                    <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <Camera className="w-4 h-4" />
                        Click items to shop
                      </div>
                    </div>
                    {/* Clickable hotspots indicator */}
                    <motion.div 
                      className="absolute top-4 right-4 w-8 h-8 rounded-full bg-primary/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Sparkles className="w-4 h-4 text-primary-foreground" />
                    </motion.div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Features Section */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="container mx-auto px-6 py-20"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-display font-bold mb-4">
              How StyleSync Works
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Revolutionary AI technology that understands your style and helps you look your best
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div 
              className="p-8 rounded-3xl bg-card/50 backdrop-blur border border-border hover:border-primary/30 transition-all duration-300 hover:translate-y-[-4px]"
              whileHover={{ scale: 1.02 }}
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-6">
                <Camera className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-display font-semibold mb-3">Visual Search</h3>
              <p className="text-muted-foreground">
                See an outfit you love? Click on any item to instantly find where to buy it at the best price.
              </p>
            </motion.div>

            <motion.div 
              className="p-8 rounded-3xl bg-card/50 backdrop-blur border border-border hover:border-primary/30 transition-all duration-300 hover:translate-y-[-4px]"
              whileHover={{ scale: 1.02 }}
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-6">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-display font-semibold mb-3">AI Style Matching</h3>
              <p className="text-muted-foreground">
                Upload your photo and let AI analyze your features to suggest outfits that complement you perfectly.
              </p>
            </motion.div>

            <motion.div 
              className="p-8 rounded-3xl bg-card/50 backdrop-blur border border-border hover:border-primary/30 transition-all duration-300 hover:translate-y-[-4px]"
              whileHover={{ scale: 1.02 }}
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-6">
                <ShoppingBag className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-display font-semibold mb-3">Best Deals</h3>
              <p className="text-muted-foreground">
                Compare prices across multiple stores and never overpay for your favorite pieces again.
              </p>
            </motion.div>
          </div>
        </motion.section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border py-8">
        <div className="container mx-auto px-6 text-center text-sm text-muted-foreground">
          <p>© 2024 StyleSync. Your personal AI fashion assistant.</p>
        </div>
      </footer>
    </div>
  );
}
