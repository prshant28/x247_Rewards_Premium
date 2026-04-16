export default function Slide10Partners() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#0c0c0c]">
      <div className="absolute top-[6vh] right-[6vw]">
        <p className="font-body text-white/20 text-[1.5vw] tracking-[0.3em] uppercase">10 — Partners</p>
      </div>
      <div className="absolute inset-0 opacity-[0.02]" style={{backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '4vw 4vw'}} />

      <div className="flex flex-col justify-center h-full px-[8vw]">
        <p className="font-body text-[1.6vw] text-white/30 uppercase tracking-[0.2em] mb-[2vh]">Our Partner Network</p>
        <h2 className="font-display text-[4vw] font-black text-white tracking-tight mb-[6vh]">15 Trusted Partners</h2>

        <div className="grid grid-cols-2 gap-[2vw]">
          <div className="border border-white/12 p-[3vh_3vw] bg-white/[0.02]">
            <p className="font-display text-[2.2vw] font-bold text-white mb-[1vh]">TenzorX 2026</p>
            <p className="font-body text-[1.55vw] text-white/40">Flagship tech innovation challenge for India's student builders and engineers.</p>
          </div>
          <div className="border border-white/12 p-[3vh_3vw] bg-white/[0.02]">
            <p className="font-display text-[2.2vw] font-bold text-white mb-[1vh]">Solution Challenge</p>
            <p className="font-body text-[1.55vw] text-white/40">National-scale problem-solving competition with measurable real-world impact.</p>
          </div>
          <div className="border border-white/12 p-[3vh_3vw] bg-white/[0.02]">
            <p className="font-display text-[2.2vw] font-bold text-white mb-[1vh]">Unstop AI Innovations</p>
            <p className="font-body text-[1.55vw] text-white/40">AI-focused hackathon series attracting India's top machine learning talent.</p>
          </div>
          <div className="border border-white/12 p-[3vh_3vw] bg-white/[0.02]">
            <p className="font-display text-[2.2vw] font-bold text-white mb-[1vh]">Devfolio Build With</p>
            <p className="font-body text-[1.55vw] text-white/40">India's largest developer community and premier hackathon discovery platform.</p>
          </div>
        </div>

        <p className="font-body text-[1.5vw] text-white/22 mt-[4vh]">+ 11 more partner organizations across India's tech and startup ecosystem</p>
      </div>
    </div>
  );
}
