import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { Type, Mic, ImageIcon, Video, Eye } from 'lucide-react';

const sectionVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 60 },
  visible: {
    opacity: 1, 
    y: 0,
    transition: { ease: [0.25, 0.1, 0.25, 1] as any, duration: 0.7 }
  }
};

const AnimatedCounter = ({ value, suffix, decimals = 1, duration = 2 }: { value: number; suffix: string; decimals?: number; duration?: number }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <span ref={ref} className="text-5xl font-mono font-bold text-primary flex items-baseline justify-center">
      <motion.span
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
      >
        {isInView ? (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration }}
          >
            {value.toFixed(decimals)}
          </motion.span>
        ) : '0'}
      </motion.span>
      <span className="text-xl text-muted-foreground ml-2 font-body font-normal">{suffix}</span>
    </span>
  );
};

const HomePage = () => {
  return (
    <div className="relative min-h-screen bg-background overflow-hidden selection:bg-primary/30 selection:text-primary-foreground">
      
      {/* Background Mesh Gradient */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#050A2E] blur-[120px] opacity-60 animate-blob1" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-[#020818] blur-[150px] opacity-50 animate-blob2" />
        <div className="noise-overlay" />
      </div>

      <main className="relative z-10">
        
        {/* SECTION 1 - Hero */}
        <section className="min-h-screen flex flex-col items-center justify-center px-6 pt-20 pb-12">
          
          {/* Floating Eye (Background element) */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-[0.04] pointer-events-none z-[-1] overflow-hidden">
            <Eye className="w-[800px] h-[800px] text-white" strokeWidth={0.5} />
          </div>

          <motion.div 
            className="max-w-4xl mx-auto text-center"
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
          >
            
            <motion.div
              variants={itemVariants}
              className="inline-flex items-center px-4 py-1.5 rounded-full border border-white/20 bg-card/40 backdrop-blur-sm mb-12"
            >
              <span className="text-xs font-mono font-medium text-white uppercase tracking-widest">
                ✦ Multimodal Emotion AI
              </span>
            </motion.div>

            <h1 className="flex flex-col gap-2 mb-8">
              <motion.span 
                variants={itemVariants}
                className="text-muted-foreground tracking-[0.3em] text-sm md:text-base font-body font-bold uppercase"
              >
                INSIGHT AI
              </motion.span>
              <motion.span 
                variants={itemVariants}
                className="text-white text-7xl md:text-[110px] font-display leading-[0.9]"
              >
                EMOTION
              </motion.span>
              <motion.span 
                variants={itemVariants}
                className="relative inline-block text-primary text-7xl md:text-[110px] font-display leading-[0.9]"
              >
                <div className="scan-sweep" />
                DECODED
              </motion.span>
            </h1>

            <motion.p
              variants={itemVariants}
              className="text-lg md:text-xl text-muted-foreground font-body max-w-2xl mx-auto mb-10 leading-relaxed"
            >
              Insight AI reads emotion from text, voice, face, and live video — powered by deep learning.
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
            >
              <Link to="/dashboard" className="btn-glow w-full sm:w-auto h-12 flex items-center justify-center">
                Start Analyzing →
              </Link>
              <button 
                onClick={() => document.getElementById('what-is')?.scrollIntoView()}
                className="btn-ghost-blue w-full sm:w-auto h-12 flex items-center justify-center"
              >
                Learn How It Works
              </button>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm font-mono text-muted-foreground"
            >
              <span>80.2% Accuracy</span>
              <span className="text-border">|</span>
              <span>4 Modalities</span>
              <span className="text-border">|</span>
              <span>Real-time Detection</span>
            </motion.div>

          </motion.div>
        </section>

        {/* SECTION 2 - What is Insight AI */}
        <motion.section 
          id="what-is" 
          className="py-24 px-6 border-t border-border/30 bg-card/20"
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-16">
            <motion.div 
              variants={itemVariants}
              className="flex-1"
            >
              <h2 className="text-5xl md:text-6xl font-display text-white mb-6 leading-tight">
                Emotion is data.<br/>We decode it.
              </h2>
              <p className="text-muted-foreground font-body text-lg leading-relaxed mb-6">
                Human communication is complex. While words convey explicit meaning, the underlying emotional state is hidden in tone, micro-expressions, and syntax.
              </p>
              <p className="text-muted-foreground font-body text-lg leading-relaxed">
                Insight AI bridges this gap. By combining four distinct neural networks and analysis engines, we can extract the genuine sentiment behind any interaction, turning invisible signals into actionable data.
              </p>
            </motion.div>

            <motion.div 
              variants={itemVariants}
              className="flex-1 space-y-4 w-full"
            >
              {[
                { icon: Type, title: 'Text Analysis', desc: 'NLP-driven linguistic pattern recognition.' },
                { icon: Mic, title: 'Audio Analysis', desc: 'Vocal tone and pitch extraction.' },
                { icon: ImageIcon, title: 'Image Analysis', desc: 'Deep learning facial expression detection.' },
                { icon: Video, title: 'Video Analysis', desc: 'Real-time temporal micro-expression tracking.' },
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-4 bg-card border border-border/50 border-l-[3px] border-l-white rounded-lg p-5">
                  <div className="bg-white/5 p-2 rounded shrink-0 border border-white/10">
                    <feature.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-body font-semibold">{feature.title}</h3>
                    <p className="text-muted-foreground font-body text-sm mt-1">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </motion.section>

        {/* SECTION 3 - 4 Modality Cards */}
        <motion.section 
          className="py-24 px-6"
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          <div className="max-w-6xl mx-auto">
            <motion.h2 
              variants={itemVariants}
              className="text-5xl font-display text-center text-white mb-16"
            >
              CHOOSE YOUR INPUT
            </motion.h2>

            <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { num: '01', title: 'Text Analysis', desc: 'Paste text or tweets to uncover underlying sentiment.', icon: Type, link: '/dashboard?tab=text' },
                { num: '02', title: 'Audio Analysis', desc: 'Record speech and evaluate emotional prosody.', icon: Mic, link: '/dashboard?tab=audio' },
                { num: '03', title: 'Image Analysis', desc: 'Upload faces to extract Ekman\'s core emotions.', icon: ImageIcon, link: '/dashboard?tab=image' },
                { num: '04', title: 'Video Analysis', desc: 'Enable webcam for live expression tracking.', icon: Video, link: '/dashboard?tab=video' },
              ].map((card) => (
                <Link to={card.link} className="block group" key={card.num}>
                  <div className="bg-card border border-border rounded-[16px] p-8 h-full transition-all duration-300 hover:border-primary/50 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10">
                    <div className="flex justify-between items-start mb-12">
                      <span className="font-mono text-3xl font-light text-primary group-hover:text-primary transition-colors">{card.num}</span>
                      <div className="p-3 rounded-xl bg-background border border-border">
                        <card.icon className="w-6 h-6 text-white group-hover:text-primary transition-colors duration-300" />
                      </div>
                    </div>
                    
                    <h3 className="text-3xl font-display text-white mb-3">{card.title}</h3>
                    <p className="text-muted-foreground font-body mb-8 leading-relaxed">{card.desc}</p>
                    
                    <div className="font-body font-semibold text-primary transition-colors flex items-center gap-2">
                      Launch <span className="text-lg leading-none group-hover:translate-x-1 transition-transform">→</span>
                    </div>
                  </div>
                </Link>
              ))}
            </motion.div>
          </div>
        </motion.section>

        {/* SECTION 4 - How It Works */}
        <motion.section 
          className="py-24 px-6 bg-card/30 border-y border-border/30 overflow-hidden"
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row items-start justify-between relative">
              
              {/* Dashed line background on desktop */}
              <div className="hidden md:block absolute top-[40px] left-[10%] right-[10%] h-[1px] border-t border-white/10 border-dashed z-0" />

              {[
                { num: '1', title: 'Input', desc: 'Choose your modality and provide the raw unstructured data.' },
                { num: '2', title: 'Analyze', desc: 'Our AI processes the signal using deep learning in real time.' },
                { num: '3', title: 'Insight', desc: 'View quantified emotion probabilities and confidence scores.' },
              ].map((step, i) => (
                <motion.div 
                  key={step.num}
                  variants={itemVariants}
                  className="flex-1 flex flex-col items-center text-center relative z-10 w-full mb-12 md:mb-0 px-4"
                >
                  <div className="w-20 h-20 rounded-full bg-card border-2 border-primary flex items-center justify-center mb-6">
                    <span className="font-display text-4xl text-primary mt-1">{step.num}</span>
                  </div>
                  <h3 className="text-3xl font-display text-white mb-3">{step.title}</h3>
                  <p className="text-muted-foreground font-body max-w-[250px]">{step.desc}</p>
                </motion.div>
              ))}

            </div>
          </div>
        </motion.section>

        {/* SECTION 5 - Stats Bar */}
        <motion.section 
          className="py-20 border-b border-border/30 bg-[#050510]"
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          <div className="max-w-7xl mx-auto px-6">
            <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-12 text-center divide-x-0 md:divide-x divide-white/10">
              
              <div className="flex flex-col items-center justify-center">
                <AnimatedCounter value={80.2} suffix="%" />
                <span className="text-muted-foreground font-mono text-sm mt-3 uppercase tracking-wider">Accuracy</span>
              </div>
              
              <div className="flex flex-col items-center justify-center">
                <AnimatedCounter value={7} suffix="" decimals={0} />
                <span className="text-muted-foreground font-mono text-sm mt-3 uppercase tracking-wider">Emotions Detected</span>
              </div>
              
              <div className="flex flex-col items-center justify-center">
                <AnimatedCounter value={4} suffix="" decimals={0} />
                <span className="text-muted-foreground font-mono text-sm mt-3 uppercase tracking-wider">Input Modalities</span>
              </div>

              <div className="flex flex-col items-center justify-center">
                <AnimatedCounter value={3} suffix="s" decimals={0} />
                <span className="text-muted-foreground font-mono text-sm mt-3 uppercase tracking-wider">Max Analysis Time</span>
              </div>

            </motion.div>
          </div>
        </motion.section>

        {/* SECTION 6 - CTA */}
        <motion.section 
          className="py-32 px-6 text-center"
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          <motion.div 
            variants={itemVariants}
            className="max-w-2xl mx-auto"
          >
            <h2 className="text-5xl md:text-6xl font-display text-white mb-6">
              READY TO READ EMOTION?
            </h2>
            <p className="text-muted-foreground font-body text-lg mb-10">
              Start with text — paste any sentence, tweet, or review and see what Insight AI detects.
            </p>
            
            <Link to="/dashboard" className="btn-glow inline-flex items-center justify-center h-14 px-10 text-base">
              Analyze Now →
            </Link>

            <p className="text-sm text-muted-foreground font-mono mt-6">
              No signup. No setup. Just paste and analyze.
            </p>
          </motion.div>
        </motion.section>

      </main>
    </div>
  );
};

export default HomePage;
