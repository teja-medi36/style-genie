import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { ArrowRight, Camera, Sparkles, TrendingUp, ShoppingBag, Star, Wand2 } from 'lucide-react';
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
      <div className="absolute inset-0 hero-gradient" />
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-gradient-to-bl from-primary/8 via-primary/3 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-gradient-to-tr from-primary/5 to-transparent rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between p-6 lg:px-16">
        <Logo size="lg" />
        <div className="flex items-center gap-4">
          <Link to="/auth" className="text-muted-foreground hover:text-foreground transition-colors hidden sm:block">
            Sign In
          </Link>
          <Link to="/auth">
            <Button variant="hero">Get Started</Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10">
        <div className="container mx-auto px-6 pt-12 lg:pt-24">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-2xl"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8"
              >
                <Sparkles className="w-4 h-4" />
                AI-Powered Fashion Assistant
              </motion.div>

              <h1 className="text-5xl lg:text-7xl font-display font-bold mb-8 leading-[1.1] tracking-tight">
                Your Style,
                <br />
                <span className="text-gradient-gold">
                  Perfectly Synced
                </span>
              </h1>

              <p className="text-xl text-muted-foreground mb-10 leading-relaxed max-w-lg">
                Click on any outfit to find it instantly. AI-powered style predictions 
                based on your unique features. Discover deals across all your favorite stores.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-14">
                <Link to="/auth">
                  <Button variant="hero" size="xl" className="w-full sm:w-auto">
                    Get Started Free
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    Sign In
                  </Button>
                </Link>
              </div>

              {/* Feature Pills */}
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2.5 px-5 py-3 rounded-full bg-card/50 border border-border text-sm font-medium">
                  <Camera className="w-5 h-5 text-primary" />
                  Click to Search
                </div>
                <div className="flex items-center gap-2.5 px-5 py-3 rounded-full bg-card/50 border border-border text-sm font-medium">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  AI Predictions
                </div>
                <div className="flex items-center gap-2.5 px-5 py-3 rounded-full bg-card/50 border border-border text-sm font-medium">
                  <ShoppingBag className="w-5 h-5 text-primary" />
                  Best Deals
                </div>
              </div>
            </motion.div>

            {/* Right - Fashion Gallery */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="relative"
            >
              <div className="grid grid-cols-2 gap-5">
                {fashionImages.map((img, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + index * 0.1, duration: 0.8 }}
                    className={`relative group cursor-pointer overflow-hidden rounded-3xl aspect-[3/4] ${
                      index === 0 ? 'lg:translate-y-8' : index === 3 ? 'lg:-translate-y-8' : ''
                    }`}
                    whileHover={{ scale: 1.02 }}
                  >
                    <img
                      src={img}
                      alt={`Fashion model ${index + 1}`}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute bottom-5 left-5 right-5 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
                      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <Camera className="w-4 h-4" />
                        Click items to shop
                      </div>
                    </div>
                    {/* Clickable hotspots indicator */}
                    <motion.div 
                      className="absolute top-5 right-5 w-10 h-10 rounded-full bg-primary/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-gold"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Sparkles className="w-5 h-5 text-primary-foreground" />
                    </motion.div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Features Section */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="container mx-auto px-6 py-32"
        >
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-display font-bold mb-5">
              How <span className="text-gradient-gold">StyleSync</span> Works
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Revolutionary AI technology that understands your style and helps you look your best
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div 
              className="luxury-card p-8 rounded-3xl"
              whileHover={{ y: -8 }}
              transition={{ duration: 0.3 }}
            >
              <div className="w-18 h-18 rounded-3xl icon-box-lg flex items-center justify-center mb-7">
                <Camera className="w-9 h-9 text-primary-foreground" />
              </div>
              <h3 className="text-2xl font-display font-bold mb-4">Visual Search</h3>
              <p className="text-muted-foreground leading-relaxed">
                See an outfit you love? Click on any item to instantly find where to buy it at the best price.
              </p>
            </motion.div>

            <motion.div 
              className="luxury-card p-8 rounded-3xl"
              whileHover={{ y: -8 }}
              transition={{ duration: 0.3 }}
            >
              <div className="w-18 h-18 rounded-3xl icon-box-lg flex items-center justify-center mb-7">
                <Wand2 className="w-9 h-9 text-primary-foreground" />
              </div>
              <h3 className="text-2xl font-display font-bold mb-4">AI Style Matching</h3>
              <p className="text-muted-foreground leading-relaxed">
                Upload your photo and let AI analyze your features to suggest outfits that complement you perfectly.
              </p>
            </motion.div>

            <motion.div 
              className="luxury-card p-8 rounded-3xl"
              whileHover={{ y: -8 }}
              transition={{ duration: 0.3 }}
            >
              <div className="w-18 h-18 rounded-3xl icon-box-lg flex items-center justify-center mb-7">
                <ShoppingBag className="w-9 h-9 text-primary-foreground" />
              </div>
              <h3 className="text-2xl font-display font-bold mb-4">Best Deals</h3>
              <p className="text-muted-foreground leading-relaxed">
                Compare prices across multiple stores and never overpay for your favorite pieces again.
              </p>
            </motion.div>
          </div>
        </motion.section>

        {/* Social Proof */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="container mx-auto px-6 pb-24"
        >
          <div className="luxury-card rounded-3xl p-12 text-center">
            <div className="flex items-center justify-center gap-1 mb-6">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-6 h-6 fill-primary text-primary" />
              ))}
            </div>
            <p className="text-2xl font-display font-semibold mb-4 max-w-2xl mx-auto">
              "StyleSync completely changed how I shop. The AI suggestions are spot-on!"
            </p>
            <p className="text-muted-foreground">— 10,000+ happy users</p>
          </div>
        </motion.section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border py-10">
        <div className="container mx-auto px-6 text-center text-sm text-muted-foreground">
          <p>© 2024 StyleSync. Your personal AI fashion assistant.</p>
        </div>
      </footer>
    </div>
  );
}
