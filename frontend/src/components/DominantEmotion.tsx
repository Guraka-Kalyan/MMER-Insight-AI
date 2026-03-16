import { type EmotionKey, EMOTION_COLORS, EMOTION_ICONS, EMOTION_LABELS } from '@/lib/emotions';
import { motion } from 'framer-motion';

interface DominantEmotionProps {
  emotion: EmotionKey;
  confidence: number;
}

const DominantEmotion = ({ emotion, confidence }: DominantEmotionProps) => {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="text-center py-6"
    >
      <div className="text-5xl mb-3">{EMOTION_ICONS[emotion]}</div>
      <h3
        className="text-3xl font-display font-bold uppercase tracking-wider"
        style={{ color: EMOTION_COLORS[emotion] }}
      >
        {EMOTION_LABELS[emotion]}
      </h3>
      <p className="text-muted-foreground font-mono text-sm mt-1">
        {Math.round(confidence * 100)}% confidence
      </p>
    </motion.div>
  );
};

export default DominantEmotion;
