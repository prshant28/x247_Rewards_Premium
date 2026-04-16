export default function Slide06Tiers() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#0a0a0a]">
      <div className="absolute top-[6vh] right-[6vw]">
        <p className="font-body text-white/20 text-[1.5vw] tracking-[0.3em] uppercase">06 — Membership</p>
      </div>

      <div className="flex flex-col h-full px-[6vw] py-[8vh]">
        <h2 className="font-display text-[3.5vw] font-black text-white tracking-tight mb-[1vh]">Membership Tiers</h2>
        <p className="font-body text-[1.7vw] text-white/35 mb-[4vh]">Choose your level. Unlock your potential.</p>

        <div className="grid grid-cols-4 gap-[1.5vw]" style={{flex: 1}}>
          <div className="flex flex-col border border-white/12 p-[3vh_2vw]">
            <p className="font-body text-[1.5vw] text-white/35 tracking-[0.2em] uppercase mb-[1vh]">Free</p>
            <p className="font-display text-[3.5vw] font-black text-white leading-none mb-[3vh]">₹0</p>
            <div className="w-full h-[1px] bg-white/10 mb-[2.5vh]" />
            <div className="flex flex-col gap-[1.5vh]">
              <p className="font-body text-[1.5vw] text-white/55">1 daily entry</p>
              <p className="font-body text-[1.5vw] text-white/55">Standard referrals</p>
              <p className="font-body text-[1.5vw] text-white/55">Public profile</p>
              <p className="font-body text-[1.5vw] text-white/55">Community access</p>
            </div>
          </div>

          <div className="flex flex-col border border-white/18 p-[3vh_2vw] bg-white/[0.03]">
            <p className="font-body text-[1.5vw] text-white/40 tracking-[0.2em] uppercase mb-[1vh]">Silver</p>
            <p className="font-display text-[3.5vw] font-black text-white leading-none mb-[3vh]">₹199</p>
            <div className="w-full h-[1px] bg-white/12 mb-[2.5vh]" />
            <div className="flex flex-col gap-[1.5vh]">
              <p className="font-body text-[1.5vw] text-white/65">3 daily entries</p>
              <p className="font-body text-[1.5vw] text-white/65">2x referral bonus</p>
              <p className="font-body text-[1.5vw] text-white/65">Silver badge</p>
              <p className="font-body text-[1.5vw] text-white/65">Priority draws</p>
            </div>
            <p className="font-body text-[1.4vw] text-white/25 mt-[2.5vh]">per month</p>
          </div>

          <div className="flex flex-col border border-white/28 p-[3vh_2vw] bg-white/[0.06]">
            <p className="font-body text-[1.5vw] text-white/55 tracking-[0.2em] uppercase mb-[1vh]">Gold</p>
            <p className="font-display text-[3.5vw] font-black text-white leading-none mb-[3vh]">₹499</p>
            <div className="w-full h-[1px] bg-white/15 mb-[2.5vh]" />
            <div className="flex flex-col gap-[1.5vh]">
              <p className="font-body text-[1.5vw] text-white/80">7 daily entries</p>
              <p className="font-body text-[1.5vw] text-white/80">5x referral bonus</p>
              <p className="font-body text-[1.5vw] text-white/80">Verified badge</p>
              <p className="font-body text-[1.5vw] text-white/80">Exclusive contests</p>
            </div>
            <p className="font-body text-[1.4vw] text-white/40 mt-[2.5vh]">per month</p>
          </div>

          <div className="flex flex-col border border-white/45 p-[3vh_2vw] bg-white/[0.1]">
            <p className="font-body text-[1.5vw] text-white/70 tracking-[0.2em] uppercase mb-[1vh]">Black</p>
            <p className="font-display text-[3.5vw] font-black text-white leading-none mb-[3vh]">₹999</p>
            <div className="w-full h-[1px] bg-white/22 mb-[2.5vh]" />
            <div className="flex flex-col gap-[1.5vh]">
              <p className="font-body text-[1.5vw] text-white">Unlimited entries</p>
              <p className="font-body text-[1.5vw] text-white">10x referral bonus</p>
              <p className="font-body text-[1.5vw] text-white">Black verified badge</p>
              <p className="font-body text-[1.5vw] text-white">VIP prize access</p>
            </div>
            <p className="font-body text-[1.4vw] text-white/55 mt-[2.5vh]">per month</p>
          </div>
        </div>
      </div>
    </div>
  );
}
