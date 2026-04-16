export default function Slide09ReferralMechanics() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#080808]">
      <div className="absolute top-[6vh] left-[6vw]">
        <p className="font-body text-white/20 text-[1.5vw] tracking-[0.3em] uppercase">09 — Referral Mechanics</p>
      </div>

      <div className="flex h-full pt-[12vh]">
        <div className="flex flex-col justify-center w-[38%] px-[7vw] border-r border-white/10">
          <p className="font-body text-[1.6vw] text-white/30 uppercase tracking-[0.2em] mb-[2vh]">Referral Network</p>
          <div className="mb-[4.5vh]">
            <p className="font-display text-[7.5vw] font-black text-white leading-none">742+</p>
            <p className="font-body text-[1.7vw] text-white/45">Active referrals this month</p>
          </div>
          <div className="w-full h-[1px] bg-white/10 mb-[4.5vh]" />
          <div>
            <p className="font-display text-[4vw] font-black text-white leading-none">10x</p>
            <p className="font-body text-[1.7vw] text-white/45">Max referral multiplier — Black tier</p>
          </div>
        </div>

        <div className="flex flex-col justify-center w-[62%] px-[5vw] gap-[3.5vh]">
          <h3 className="font-display text-[2.5vw] font-bold text-white mb-[1vh]">How Referrals Work</h3>
          <div className="flex gap-[2vw] items-start">
            <div className="w-[3px] h-[6vh] bg-white/25 shrink-0 mt-[0.5vh]" />
            <div>
              <p className="font-display text-[1.9vw] font-bold text-white">Get Your Unique Link</p>
              <p className="font-body text-[1.55vw] text-white/45 mt-[0.5vh]">Every member receives a personalized referral URL on registration.</p>
            </div>
          </div>
          <div className="flex gap-[2vw] items-start">
            <div className="w-[3px] h-[6vh] bg-white/25 shrink-0 mt-[0.5vh]" />
            <div>
              <p className="font-display text-[1.9vw] font-bold text-white">Share Anywhere</p>
              <p className="font-body text-[1.55vw] text-white/45 mt-[0.5vh]">WhatsApp, Instagram, Telegram — wherever your audience lives.</p>
            </div>
          </div>
          <div className="flex gap-[2vw] items-start">
            <div className="w-[3px] h-[6vh] bg-white/25 shrink-0 mt-[0.5vh]" />
            <div>
              <p className="font-display text-[1.9vw] font-bold text-white">Earn Draw Entries</p>
              <p className="font-body text-[1.55vw] text-white/45 mt-[0.5vh]">Each successful signup via your link adds entries to your daily draw pool automatically.</p>
            </div>
          </div>
          <div className="flex gap-[2vw] items-start">
            <div className="w-[3px] h-[6vh] bg-white/25 shrink-0 mt-[0.5vh]" />
            <div>
              <p className="font-display text-[1.9vw] font-bold text-white">Multiply with Membership</p>
              <p className="font-body text-[1.55vw] text-white/45 mt-[0.5vh]">Upgrade to Silver, Gold, or Black to multiply your referral entry earnings.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
