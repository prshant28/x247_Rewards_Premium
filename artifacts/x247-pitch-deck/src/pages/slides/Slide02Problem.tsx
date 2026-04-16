export default function Slide02Problem() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#0c0c0c]">
      <div className="absolute inset-0 opacity-[0.025]" style={{backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '6vw 6vw'}} />
      <div className="absolute left-0 top-0 bottom-0 w-[1vw] bg-white/5" />
      <div className="absolute top-[6vh] right-[6vw]">
        <p className="font-body text-white/20 text-[1.5vw] tracking-[0.3em] uppercase">02 — The Problem</p>
      </div>

      <div className="flex flex-col justify-center h-full pl-[10vw] pr-[8vw]">
        <p className="font-body text-[1.7vw] text-white/35 tracking-[0.2em] uppercase mb-[2.5vh]">The state of giveaways in India</p>
        <h2 className="font-display text-[5vw] font-black text-white tracking-tight leading-tight mb-[6vh]">Three Problems<br />We Are Solving</h2>

        <div className="flex flex-col gap-[3.5vh]">
          <div className="flex items-start gap-[2.5vw]">
            <span className="font-display text-[3vw] font-black text-white/15 leading-tight w-[5vw] shrink-0">01</span>
            <div>
              <p className="font-display text-[2vw] font-bold text-white mb-[0.8vh]">No Trust, No Transparency</p>
              <p className="font-body text-[1.6vw] text-white/45">Winners announced but never verified. No proof, no accountability, no platform of record.</p>
            </div>
          </div>
          <div className="flex items-start gap-[2.5vw]">
            <span className="font-display text-[3vw] font-black text-white/15 leading-tight w-[5vw] shrink-0">02</span>
            <div>
              <p className="font-display text-[2vw] font-bold text-white mb-[0.8vh]">Zero Reward for Participation</p>
              <p className="font-body text-[1.6vw] text-white/45">Users invest time entering contests with nothing earned — no loyalty, no recognition.</p>
            </div>
          </div>
          <div className="flex items-start gap-[2.5vw]">
            <span className="font-display text-[3vw] font-black text-white/15 leading-tight w-[5vw] shrink-0">03</span>
            <div>
              <p className="font-display text-[2vw] font-bold text-white mb-[0.8vh]">Fragmented Community Infrastructure</p>
              <p className="font-body text-[1.6vw] text-white/45">Giveaways are isolated events with zero community building, referral economy, or identity layer.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
