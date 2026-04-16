export default function Slide08ReferralDivider() {
  return (
    <div
      className="relative w-screen h-screen overflow-hidden"
      style={{ background: "linear-gradient(145deg, #111 0%, #080808 100%)" }}
    >
      <div
        className="absolute right-[-3vw] bottom-[-8vh] font-display font-black text-white/[0.03] leading-none select-none pointer-events-none"
        style={{ fontSize: "38vw" }}
      >
        R
      </div>
      <div className="absolute top-0 left-0 bottom-0 w-[0.6vw] bg-white/8" />

      <div className="flex flex-col justify-center items-start h-full px-[10vw]">
        <div className="w-[5vw] h-[2px] bg-white mb-[4.5vh]" />
        <h2 className="font-display text-[7vw] font-black text-white tracking-tight leading-none mb-[3.5vh]">
          REFERRAL<br />ECOSYSTEM
        </h2>
        <p className="font-body text-[2vw] text-white/35 mb-[5vh]">
          How word-of-mouth becomes real rewards
        </p>
        <div className="border border-white/20 px-[2.5vw] py-[1.5vh]">
          <p className="font-body text-[1.6vw] text-white/50 tracking-[0.2em] uppercase">
            742+ Active Referrals This Month
          </p>
        </div>
      </div>
    </div>
  );
}
