import { motion } from 'framer-motion';

const LoadingSkeleton = () => (
  <div className="space-y-6 py-6">
    <div className="flex flex-col items-center gap-3">
      <motion.div
        className="w-16 h-16 rounded-full border-2 border-primary/40 border-t-primary"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      />
      <p className="text-sm text-muted-foreground animate-pulse">Analyzing...</p>
    </div>
    <div className="space-y-3">
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} className="space-y-1.5">
          <div className="h-3 w-20 bg-secondary rounded animate-pulse" />
          <div className="h-2.5 w-full bg-secondary rounded-full animate-pulse" />
        </div>
      ))}
    </div>
  </div>
);

export default LoadingSkeleton;
