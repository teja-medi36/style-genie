import { motion } from 'framer-motion';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export default function Logo({ size = 'md', showText = true }: LogoProps) {
  const sizes = {
    sm: { icon: 'w-8 h-8', text: 'text-lg', innerIcon: 'text-sm' },
    md: { icon: 'w-10 h-10', text: 'text-xl', innerIcon: 'text-base' },
    lg: { icon: 'w-14 h-14', text: 'text-2xl', innerIcon: 'text-xl' },
  };

  return (
    <motion.div 
      className="flex items-center gap-2.5"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Logo Icon */}
      <motion.div 
        className={`${sizes[size].icon} relative flex items-center justify-center`}
        whileHover={{ scale: 1.05 }}
        transition={{ type: "spring", stiffness: 400 }}
      >
        {/* Outer glow ring */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary via-accent to-primary opacity-20 blur-md" />
        
        {/* Main icon container */}
        <div className="relative w-full h-full rounded-xl bg-gradient-to-br from-primary via-accent to-primary p-[2px] shadow-lg">
          <div className="w-full h-full rounded-[10px] bg-background/10 backdrop-blur-sm flex items-center justify-center overflow-hidden">
            {/* Animated shimmer effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"
              animate={{ x: ['-150%', '150%'] }}
              transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 4, ease: "easeInOut" }}
            />
            
            {/* Stylized SS monogram */}
            <div className={`${sizes[size].innerIcon} font-display font-black text-white z-10 tracking-tighter leading-none`}>
              <span className="drop-shadow-lg">SS</span>
            </div>
          </div>
        </div>
        
        {/* Decorative accent dot */}
        <motion.div 
          className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-accent shadow-md border border-background"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>

      {showText && (
        <motion.div 
          className="flex flex-col leading-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <span className={`${sizes[size].text} font-display font-bold tracking-tight`}>
            <span className="text-foreground">Style</span>
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">Sync</span>
          </span>
          {size !== 'sm' && (
            <span className="text-[10px] text-muted-foreground font-medium tracking-widest uppercase mt-0.5">
              AI Fashion Assistant
            </span>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
