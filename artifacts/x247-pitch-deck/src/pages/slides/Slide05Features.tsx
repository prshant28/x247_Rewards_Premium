export default function Slide05Features() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#080808]">
      <div className="absolute top-[6vh] left-[6vw]">
        <p className="font-body text-white/20 text-[1.5vw] tracking-[0.3em] uppercase">05 — Platform Features</p>
      </div>

      <div className="flex flex-col h-full px-[6vw] py-[10vh]">
        <h2 className="font-display text-[3.5vw] font-black text-white tracking-tight mb-[1vh]">Built Different</h2>
        <p className="font-body text-[1.7vw] text-white/35 mb-[4.5vh]">Everything you need. Nothing you don't.</p>

        <div className="grid grid-cols-3 gap-[1.8vw]" style={{flex: 1}}>
          <div className="border border-white/10 p-[2.5vh_2vw] bg-white/[0.02]">
            <div className="w-[2.5vw] h-[2px] bg-white mb-[2.5vh]" />
            <p className="font-display text-[1.85vw] font-bold text-white mb-[1vh]">7 Visual Themes</p>
            <p className="font-body text-[1.5vw] text-white/45 leading-relaxed">Personalize your dashboard with seven distinct aesthetic themes.</p>
          </div>
          <div className="border border-white/10 p-[2.5vh_2vw] bg-white/[0.02]">
            <div className="w-[2.5vw] h-[2px] bg-white mb-[2.5vh]" />
            <p className="font-display text-[1.85vw] font-bold text-white mb-[1vh]">Public Profile Cards</p>
            <p className="font-body text-[1.5vw] text-white/45 leading-relaxed">Shareable profiles with badges, tier rank, and referral stats.</p>
          </div>
          <div className="border border-white/10 p-[2.5vh_2vw] bg-white/[0.02]">
            <div className="w-[2.5vw] h-[2px] bg-white mb-[2.5vh]" />
            <p className="font-display text-[1.85vw] font-bold text-white mb-[1vh]">Verified Membership</p>
            <p className="font-body text-[1.5vw] text-white/45 leading-relaxed">Gold and Black tier members receive platform verification badges.</p>
          </div>
          <div className="border border-white/10 p-[2.5vh_2vw] bg-white/[0.02]">
            <div className="w-[2.5vw] h-[2px] bg-white mb-[2.5vh]" />
            <p className="font-display text-[1.85vw] font-bold text-white mb-[1vh]">Smart Referral Engine</p>
            <p className="font-body text-[1.5vw] text-white/45 leading-relaxed">Track every referral in real time with full transparent entry counting.</p>
          </div>
          <div className="border border-white/10 p-[2.5vh_2vw] bg-white/[0.02]">
            <div className="w-[2.5vw] h-[2px] bg-white mb-[2.5vh]" />
            <p className="font-display text-[1.85vw] font-bold text-white mb-[1vh]">Daily Prize Draws</p>
            <p className="font-body text-[1.5vw] text-white/45 leading-relaxed">Automated daily contests with publicly announced, verified winners.</p>
          </div>
          <div className="border border-white/10 p-[2.5vh_2vw] bg-white/[0.02]">
            <div className="w-[2.5vw] h-[2px] bg-white mb-[2.5vh]" />
            <p className="font-display text-[1.85vw] font-bold text-white mb-[1vh]">Community Hub</p>
            <p className="font-body text-[1.5vw] text-white/45 leading-relaxed">Leaderboards, winners wall, and channels for 10,000+ members.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
