import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { 
  Sparkles, 
  Shirt, 
  Search, 
  User, 
  LogOut, 
  Menu, 
  X,
  LayoutDashboard,
  Heart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Logo from '@/components/Logo';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Sparkles, label: 'Get Styled', path: '/get-styled' },
  { icon: Shirt, label: 'My Wardrobe', path: '/wardrobe' },
  { icon: Search, label: 'Visual Search', path: '/search' },
  { icon: Heart, label: 'Saved Looks', path: '/saved' },
  { icon: User, label: 'Style Profile', path: '/profile' },
];

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const { signOut, user } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-3 rounded-2xl glass-panel hover:border-primary/30 transition-colors"
      >
        <Menu className="w-6 h-6 text-foreground" />
      </button>

      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="lg:hidden fixed inset-0 bg-background/90 backdrop-blur-xl z-40"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ x: isOpen ? 0 : undefined }}
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 w-72",
          "bg-sidebar border-r border-sidebar-border p-6 flex flex-col",
          "transform -translate-x-full lg:translate-x-0 transition-transform duration-300",
          isOpen && "translate-x-0"
        )}
      >
        {/* Close button - mobile */}
        <button
          onClick={() => setIsOpen(false)}
          className="lg:hidden absolute top-4 right-4 p-2.5 rounded-xl hover:bg-secondary transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Logo */}
        <div className="mb-10">
          <Logo size="md" />
          <p className="text-xs text-muted-foreground mt-2 ml-[52px] tracking-wide">
            AI Fashion Assistant
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 group relative overflow-hidden",
                isActive 
                  ? "bg-primary/10 text-primary border border-primary/20" 
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute left-0 w-1 h-8 rounded-r-full bg-primary"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                    isActive ? "bg-primary/20" : "bg-secondary/50 group-hover:bg-secondary"
                  )}>
                    <item.icon className="w-5 h-5" />
                  </div>
                  <span className="font-medium">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User section */}
        <div className="pt-6 border-t border-sidebar-border space-y-4">
          <div className="px-4 py-3 rounded-2xl bg-secondary/30">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Signed in as</p>
            <p className="text-sm font-medium truncate">{user?.email}</p>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl h-12"
            onClick={handleSignOut}
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </Button>
        </div>
      </motion.aside>
    </>
  );
}
