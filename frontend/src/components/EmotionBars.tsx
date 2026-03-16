import { motion } from 'framer-motion';
import { type EmotionKey, EMOTION_COLORS, EMOTION_LABELS } from '@/lib/emotions';

interface EmotionBarsProps {
  probabilities: Record<EmotionKey, number> | null;
}

const emotions: EmotionKey[] = ['happy', 'sad', 'angry', 'fear', 'surprise', 'disgust', 'neutral'];

const EmotionBars = ({ probabilities }: EmotionBarsProps) => {
  return (
    <div className="space-y-3">
      {emotions.map((key) => {
        const value = probabilities ? (probabilities[key] ?? 0) : 0;
        const pct = Math.round(value * 100);
        return (
          <div key={key} className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-foreground">{EMOTION_LABELS[key]}</span>
              <span className="text-xs font-mono text-muted-foreground">{pct}%</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-secondary/80 overflow-hidden">
              <motion.div
                className="emotion-bar"
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                style={{ backgroundColor: EMOTION_COLORS[key] }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default EmotionBars;
