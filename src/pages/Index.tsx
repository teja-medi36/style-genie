import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight, Shirt, Search, Palette } from 'lucide-react';

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
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-display font-bold">StyleAI</span>
        </div>
        <Link to="/auth">
          <Button variant="outline">Sign In</Button>
        </Link>
      </nav>

      {/* Hero */}
      <main className="relative z-10 container mx-auto px-6 pt-12 lg:pt-24 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm mb-8"
          >
            <Sparkles className="w-4 h-4" />
            AI-Powered Fashion Assistant
          </motion.div>

          <h1 className="text-5xl lg:text-7xl font-display font-bold mb-6 leading-tight">
            Your Personal
            <br />
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              AI Stylist
            </span>
          </h1>

          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            Get personalized outfit recommendations based on your body type, color preferences, 
            and style. Build your wardrobe and discover the best deals across stores.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
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

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="grid md:grid-cols-3 gap-6 mt-20"
          >
            <div className="p-6 rounded-2xl bg-card/50 backdrop-blur border border-border hover:border-primary/30 transition-colors">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 mx-auto">
                <Sparkles className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-display font-semibold mb-2">AI Suggestions</h3>
              <p className="text-muted-foreground">
                Get outfit recommendations tailored to your unique style profile and occasion
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-card/50 backdrop-blur border border-border hover:border-primary/30 transition-colors">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 mx-auto">
                <Shirt className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-display font-semibold mb-2">Digital Wardrobe</h3>
              <p className="text-muted-foreground">
                Organize your clothes and let AI create perfect combinations from your collection
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-card/50 backdrop-blur border border-border hover:border-primary/30 transition-colors">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 mx-auto">
                <Search className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-display font-semibold mb-2">Best Deals</h3>
              <p className="text-muted-foreground">
                Find the best prices across multiple stores with one click shopping
              </p>
            </div>
          </motion.div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border py-8">
        <div className="container mx-auto px-6 text-center text-sm text-muted-foreground">
          <p>© 2024 StyleAI. Your personal AI fashion assistant.</p>
        </div>
      </footer>
    </div>
  );
}
