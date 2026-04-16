export default function Slide04HowItWorks() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#0a0a0a]">
      <div className="absolute top-[6vh] right-[6vw]">
        <p className="font-body text-white/20 text-[1.5vw] tracking-[0.3em] uppercase">04 — How It Works</p>
      </div>

      <div className="flex flex-col justify-center h-full px-[7vw]">
        <h2 className="font-display text-[4vw] font-black text-white tracking-tight mb-[1.5vh]">How It Works</h2>
        <p className="font-body text-[1.8vw] text-white/35 mb-[7vh]">Four steps from registration to prizes</p>

        <div className="flex items-start gap-0">
          <div className="flex-1 border-l-2 border-white/15 pl-[2.5vw] pr-[2vw]">
            <p className="font-display text-[4.5vw] font-black text-white/10 leading-none mb-[2.5vh]">01</p>
            <p className="font-display text-[2vw] font-bold text-white mb-[1.5vh]">REGISTER</p>
            <p className="font-body text-[1.55vw] text-white/45 leading-relaxed">Sign up through a partner link to join the X247 ecosystem. Free to start, forever.</p>
          </div>

          <div className="flex items-start pt-[8vh] px-[0.5vw] text-white/20 text-[2vw] shrink-0">→</div>

          <div className="flex-1 border-l-2 border-white/15 pl-[2.5vw] pr-[2vw]">
            <p className="font-display text-[4.5vw] font-black text-white/10 leading-none mb-[2.5vh]">02</p>
            <p className="font-display text-[2vw] font-bold text-white mb-[1.5vh]">REFER</p>
            <p className="font-body text-[1.55vw] text-white/45 leading-relaxed">Share your unique link. Every successful referral earns bonus draw entries instantly.</p>
          </div>

          <div className="flex items-start pt-[8vh] px-[0.5vw] text-white/20 text-[2vw] shrink-0">→</div>

          <div className="flex-1 border-l-2 border-white/15 pl-[2.5vw] pr-[2vw]">
            <p className="font-display text-[4.5vw] font-black text-white/10 leading-none mb-[2.5vh]">03</p>
            <p className="font-display text-[2vw] font-bold text-white mb-[1.5vh]">ENTER</p>
            <p className="font-body text-[1.55vw] text-white/45 leading-relaxed">Entries accumulate automatically. Upgraded members earn daily bonus entries every morning.</p>
          </div>

          <div className="flex items-start pt-[8vh] px-[0.5vw] text-white/20 text-[2vw] shrink-0">→</div>

          <div className="flex-1 border-l-2 border-white/15 pl-[2.5vw] pr-[2vw]">
            <p className="font-display text-[4.5vw] font-black text-white/10 leading-none mb-[2.5vh]">04</p>
            <p className="font-display text-[2vw] font-bold text-white mb-[1.5vh]">WIN</p>
            <p className="font-body text-[1.55vw] text-white/45 leading-relaxed">Daily draws are held publicly. Winners are verified on-platform for full transparency.</p>
          </div>
        </div>

        <div className="w-full h-[1px] bg-white/8 mt-[6vh]" />
        <p className="font-body text-white/25 text-[1.5vw] mt-[2vh] tracking-wide">Free to join. Daily prizes. Real, verified winners.</p>
      </div>
    </div>
  );
}
