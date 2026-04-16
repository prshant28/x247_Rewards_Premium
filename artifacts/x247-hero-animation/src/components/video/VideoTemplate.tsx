import { motion, AnimatePresence } from 'framer-motion';
import { useVideoPlayer } from '@/lib/video';
import { Particles } from './video_scenes/Particles';
import { Scene1 } from './video_scenes/Scene1';
import { Scene2 } from './video_scenes/Scene2';
import { Scene3 } from './video_scenes/Scene3';
import { Scene4 } from './video_scenes/Scene4';

const SCENE_DURATIONS = {
  scene1: 4000,
  scene2: 3500,
  scene3: 4500,
  scene4: 3000
};

export default function VideoTemplate() {
  const { currentScene } = useVideoPlayer({ durations: SCENE_DURATIONS });

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black text-white">
      {/* Persistent Background */}
      <div className="absolute inset-0 bg-black z-0" />
      
      {/* Persistent Layer: 60 particles drifting */}
      <Particles />

      {/* Cinematic Noise Texture */}
      <div className="noise-overlay" />

      {/* Watermark in Scene 4 that persists into loop start if needed, handled mostly in scenes, but we can do a persistent layout element if we want. Actually, requirements say 'X247 shrinks to a corner watermark as scene loops back' - we'll handle this in Scene 4 and cross-scene continuity. */}

      <AnimatePresence mode="popLayout">
        {currentScene === 0 && <Scene1 key="scene1" />}
        {currentScene === 1 && <Scene2 key="scene2" />}
        {currentScene === 2 && <Scene3 key="scene3" />}
        {currentScene === 3 && <Scene4 key="scene4" />}
      </AnimatePresence>
    </div>
  );
}
