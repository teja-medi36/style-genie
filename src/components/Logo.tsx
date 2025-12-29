import { motion } from 'framer-motion';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export default function Logo({ size = 'md', showText = true }: LogoProps) {
  const sizes = {
    sm: { text: 'text-lg', tagline: 'text-[8px]' },
    md: { text: 'text-xl', tagline: 'text-[9px]' },
    lg: { text: 'text-3xl', tagline: 'text-[10px]' },
  };

  return (
    <motion.div 
      className="flex items-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <motion.div 
        className="flex flex-col"
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        {/* Main Logo Text */}
        <div className="flex items-baseline gap-0.5">
          <span className={`${sizes[size].text} font-display font-light tracking-[0.2em] uppercase text-foreground`}>
            Style
          </span>
          <span className={`${sizes[size].text} font-display font-semibold tracking-[0.15em] uppercase bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent`}>
            Sync
          </span>
        </div>
        
        {/* Elegant underline */}
        {showText && (
          <motion.div 
            className="flex items-center gap-2 mt-0.5"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <div className="flex-1 h-[0.5px] bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
            {size !== 'sm' && (
              <span className={`${sizes[size].tagline} text-muted-foreground font-medium tracking-[0.3em] uppercase`}>
                Curated Style
              </span>
            )}
            <div className="flex-1 h-[0.5px] bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}