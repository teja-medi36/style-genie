import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { ArrowRight, Camera, Sparkles, Menu, Search, ShoppingBag, ChevronRight } from 'lucide-react';

import fashionModel1 from '@/assets/fashion-model-1.jpg';
import fashionModel2 from '@/assets/fashion-model-2.jpg';
import fashionModel3 from '@/assets/fashion-model-3.jpg';
import fashionModel4 from '@/assets/fashion-model-4.jpg';

const categories = [
  { name: 'Dresses', count: 124 },
  { name: 'Tops', count: 89 },
  { name: 'Bottoms', count: 67 },
  { name: 'Outerwear', count: 45 },
  { name: 'Accessories', count: 156 },
];

export default function Index() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-border bg-card">
        <Menu className="w-6 h-6 text-foreground" />
        <h1 className="text-2xl font-display font-bold">stylesync.</h1>
        <Link to="/auth">
          <Search className="w-6 h-6 text-foreground" />
        </Link>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8 max-w-lg">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h2 className="text-4xl font-display font-bold mb-2">
            Discover Your
            <br />
            <span className="text-gradient-orange">Perfect Style</span>
          </h2>
          <p className="text-muted-foreground">AI-powered fashion for you</p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
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
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="promo-banner p-8 mb-8 text-center"
        >
          <p className="text-4xl font-display font-bold mb-1">AI Styling</p>
          <p className="text-xl opacity-90">Personalized for You</p>
        </motion.div>

        {/* Shop the Look */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-8"
        >
          <h3 className="text-xl font-display font-semibold mb-4">Shop the look</h3>
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

        {/* Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mb-8"
        >
          <h3 className="text-xl font-display font-semibold mb-4">Categories</h3>
          <div className="space-y-3">
            {categories.map((category, index) => (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.05 }}
                className="category-item cursor-pointer"
              >
                <span className="font-medium">{category.name}</span>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Trending Looks */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mb-8"
        >
          <h3 className="text-xl font-display font-semibold mb-4">Trending now</h3>
          <div className="flex gap-4 overflow-x-auto pb-2 -mx-6 px-6 scrollbar-hide">
            {[fashionModel3, fashionModel4, fashionModel1, fashionModel2].map((img, index) => (
              <div
                key={index}
                className="flex-shrink-0 w-32 shop-card group cursor-pointer"
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

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="text-center pb-8"
        >
          <Link to="/auth">
            <Button size="lg" className="w-full rounded-full">
              Get Started
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
          <p className="text-sm text-muted-foreground mt-4">
            Already have an account?{' '}
            <Link to="/auth" className="text-primary font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </motion.div>
      </main>
    </div>
  );
}
