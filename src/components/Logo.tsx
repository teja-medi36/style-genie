import { motion } from 'framer-motion';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export default function Logo({ size = 'md', showText = true }: LogoProps) {
  const sizes = {
    sm: { icon: 'w-8 h-8', text: 'text-lg', innerIcon: 'w-4 h-4' },
    md: { icon: 'w-10 h-10', text: 'text-xl', innerIcon: 'w-5 h-5' },
    lg: { icon: 'w-14 h-14', text: 'text-3xl', innerIcon: 'w-7 h-7' },
  };

  return (
    <motion.div 
      className="flex items-center gap-3"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div 
        className={`${sizes[size].icon} rounded-xl bg-gradient-to-br from-primary via-accent to-primary flex items-center justify-center relative overflow-hidden`}
        whileHover={{ scale: 1.05, rotate: 5 }}
        transition={{ type: "spring", stiffness: 400 }}
      >
        {/* Animated shimmer effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
        />
        {/* S icon */}
        <span className={`${sizes[size].innerIcon} font-display font-bold text-primary-foreground z-10`}>
          S
        </span>
      </motion.div>
      {showText && (
        <motion.span 
          className={`${sizes[size].text} font-display font-bold`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <span className="text-foreground">Style</span>
          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Sync</span>
        </motion.span>
      )}
    </motion.div>
  );
}
