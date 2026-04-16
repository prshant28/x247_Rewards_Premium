export default function Slide03Solution() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#080808]">
      <div className="absolute top-[6vh] left-[6vw]">
        <p className="font-body text-white/20 text-[1.5vw] tracking-[0.3em] uppercase">03 — The Solution</p>
      </div>
      <div className="absolute bottom-0 right-0 w-[25vw] h-[25vw]" style={{background: 'radial-gradient(ellipse at bottom right, rgba(255,255,255,0.04) 0%, transparent 70%)'}} />

      <div className="flex h-full pt-[12vh]">
        <div className="flex flex-col justify-center w-[44%] px-[7vw] border-r border-white/10">
          <p className="font-body text-white/35 tracking-[0.2em] text-[1.6vw] uppercase mb-[2vh]">Introducing</p>
          <h2 className="font-display text-[5vw] font-black text-white tracking-tight leading-tight">X247<br />Rewards</h2>
          <div className="w-[4.5vw] h-[2px] bg-white/40 my-[3.5vh]" />
          <p className="font-body text-[1.7vw] text-white/55 leading-relaxed">A gamified giveaway and referral platform built for India's next generation of contest participants.</p>
        </div>

        <div className="flex flex-col justify-center w-[56%] px-[5vw] gap-[2.5vh]">
          <div className="border border-white/10 p-[2.5vh_2.5vw] bg-white/[0.02]">
            <p className="font-display text-[1.9vw] font-bold text-white mb-[0.8vh]">Daily Prize Draws</p>
            <p className="font-body text-[1.55vw] text-white/45">Automated, verifiable draws — every single day without exception.</p>
          </div>
          <div className="border border-white/10 p-[2.5vh_2.5vw] bg-white/[0.02]">
            <p className="font-display text-[1.9vw] font-bold text-white mb-[0.8vh]">Referral-Based Entries</p>
            <p className="font-body text-[1.55vw] text-white/45">Grow the community, earn more draw entries, win bigger prizes.</p>
          </div>
          <div className="border border-white/10 p-[2.5vh_2.5vw] bg-white/[0.02]">
            <p className="font-display text-[1.9vw] font-bold text-white mb-[0.8vh]">Public Identity &amp; Badges</p>
            <p className="font-body text-[1.55vw] text-white/45">Build reputation with a verifiable public profile and earned badges.</p>
          </div>
          <div className="border border-white/10 p-[2.5vh_2.5vw] bg-white/[0.02]">
            <p className="font-display text-[1.9vw] font-bold text-white mb-[0.8vh]">Premium Membership Tiers</p>
            <p className="font-body text-[1.55vw] text-white/45">Unlock higher earning potential with Silver, Gold, and Black tiers.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
