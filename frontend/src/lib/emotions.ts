export type EmotionKey = 'happy' | 'sad' | 'angry' | 'fear' | 'surprise' | 'disgust' | 'neutral';

export interface EmotionResult {
  label: EmotionKey;
  probabilities: Record<EmotionKey, number>;
}

export const EMOTION_COLORS: Record<EmotionKey, string> = {
  happy: '#F59E0B',
  sad: '#4F8EF7',
  angry: '#FF2D55',
  fear: '#8B5CF6',
  surprise: '#84CC16',
  disgust: '#10B981',
  neutral: '#94A3B8',
};

export const EMOTION_ICONS: Record<EmotionKey, string> = {
  happy: '😊',
  sad: '😢',
  angry: '😠',
  fear: '😨',
  surprise: '😲',
  disgust: '🤢',
  neutral: '😐',
};

export const EMOTION_LABELS: Record<EmotionKey, string> = {
  happy: 'Happy',
  sad: 'Sad',
  angry: 'Angry',
  fear: 'Fear',
  surprise: 'Surprise',
  disgust: 'Disgust',
  neutral: 'Neutral',
};

export function normalizeLabel(label: string): EmotionKey {
  const l = label.toLowerCase();
  if (l === 'joy') return 'happy';
  return l as EmotionKey;
}

export function getEmotionBgStyle(emotion: EmotionKey | null): React.CSSProperties {
  if (!emotion) return {};
  const color = EMOTION_COLORS[emotion];
  return {
    background: `radial-gradient(ellipse at 50% 0%, ${color}12 0%, transparent 60%)`,
    transition: 'background 1.5s ease',
  };
}

const API_URL = import.meta.env.VITE_API_URL || '';

export async function predictText(text: string): Promise<EmotionResult> {
  const res = await fetch(`${API_URL}/predict_text`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  const data = await res.json();
  return { label: normalizeLabel(data.label), probabilities: data.probabilities };
}

export async function predictAudio(blob: Blob): Promise<EmotionResult> {
  const form = new FormData();
  form.append('file', blob);
  const res = await fetch(`${API_URL}/predict_audio`, { method: 'POST', body: form });
  const data = await res.json();
  return { label: normalizeLabel(data.label), probabilities: data.probabilities };
}

export async function predictImage(file: File | Blob): Promise<EmotionResult> {
  const form = new FormData();
  form.append('image', file);
  const res = await fetch(`${API_URL}/predict_image`, { method: 'POST', body: form });
  const data = await res.json();
  return { label: normalizeLabel(data.label), probabilities: data.probabilities };
}
