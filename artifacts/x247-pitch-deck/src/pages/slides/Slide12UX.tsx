export default function Slide12UX() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#0a0a0a]">
      <div className="absolute top-[6vh] right-[6vw]">
        <p className="font-body text-white/20 text-[1.5vw] tracking-[0.3em] uppercase">12 — User Experience</p>
      </div>
      <div className="absolute top-0 left-0 bottom-0 w-[0.4vw] bg-white/6" />

      <div className="flex h-full">
        <div className="flex flex-col justify-center w-[40%] px-[7vw] border-r border-white/10">
          <p className="font-body text-[1.6vw] text-white/30 uppercase tracking-[0.2em] mb-[2vh]">Dashboard</p>
          <h2 className="font-display text-[3.8vw] font-black text-white tracking-tight leading-tight mb-[3vh]">
            Built for<br />Serious Players
          </h2>
          <p className="font-body text-[1.7vw] text-white/50 leading-relaxed">
            A feature-rich command center — track entries, referrals, wins, and membership status all in one place.
          </p>
          <div className="w-[4vw] h-[2px] bg-white/30 mt-[3.5vh]" />
        </div>

        <div className="flex flex-col justify-center w-[60%] px-[5vw] gap-[2.5vh]">
          <div className="flex items-center gap-[2.5vw] border-b border-white/8 pb-[2.5vh]">
            <span className="font-display text-[2vw] font-black text-white/18 w-[3.5vw] shrink-0">01</span>
            <div>
              <p className="font-display text-[1.9vw] font-bold text-white">Live Entry Counter</p>
              <p className="font-body text-[1.5vw] text-white/40">See your draw entries update in real time throughout the day.</p>
            </div>
          </div>
          <div className="flex items-center gap-[2.5vw] border-b border-white/8 pb-[2.5vh]">
            <span className="font-display text-[2vw] font-black text-white/18 w-[3.5vw] shrink-0">02</span>
            <div>
              <p className="font-display text-[1.9vw] font-bold text-white">Referral Tree View</p>
              <p className="font-body text-[1.5vw] text-white/40">Visualize your referral network and track conversion performance.</p>
            </div>
          </div>
          <div className="flex items-center gap-[2.5vw] border-b border-white/8 pb-[2.5vh]">
            <span className="font-display text-[2vw] font-black text-white/18 w-[3.5vw] shrink-0">03</span>
            <div>
              <p className="font-display text-[1.9vw] font-bold text-white">Activity Timeline</p>
              <p className="font-body text-[1.5vw] text-white/40">Full history of entries, wins, and all referral activity.</p>
            </div>
          </div>
          <div className="flex items-center gap-[2.5vw] border-b border-white/8 pb-[2.5vh]">
            <span className="font-display text-[2vw] font-black text-white/18 w-[3.5vw] shrink-0">04</span>
            <div>
              <p className="font-display text-[1.9vw] font-bold text-white">Membership Manager</p>
              <p className="font-body text-[1.5vw] text-white/40">Upgrade, manage, and track your tier benefits in one click.</p>
            </div>
          </div>
          <div className="flex items-center gap-[2.5vw]">
            <span className="font-display text-[2vw] font-black text-white/18 w-[3.5vw] shrink-0">05</span>
            <div>
              <p className="font-display text-[1.9vw] font-bold text-white">Badge Collection</p>
              <p className="font-body text-[1.5vw] text-white/40">Earn badges for milestones — displayed prominently on your public profile.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
