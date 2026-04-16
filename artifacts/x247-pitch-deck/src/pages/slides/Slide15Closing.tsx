const base = import.meta.env.BASE_URL;

export default function Slide15Closing() {
  return (
    <div className="relative w-screen h-screen overflow-hidden">
      <img
        src={`${base}slide-hero-bg.png`}
        crossOrigin="anonymous"
        className="absolute inset-0 w-full h-full object-cover"
        alt=""
      />
      <div className="absolute inset-0 bg-black/76" />
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-white/18" />
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/18" />
      <div
        className="absolute top-0 left-0 bottom-0 w-[12vw]"
        style={{ background: "linear-gradient(90deg, rgba(255,255,255,0.04) 0%, transparent 100%)" }}
      />

      <div className="relative z-10 flex flex-col justify-center items-center h-full">
        <p className="font-body text-white/35 tracking-[0.35em] text-[1.6vw] uppercase mb-[3vh]">
          Join India's Fastest Growing
        </p>
        <h1 className="font-display text-[10vw] font-black text-white tracking-[-0.03em] leading-none mb-[1vh]">
          X247
        </h1>
        <h2 className="font-display text-[2.5vw] font-light tracking-[0.28em] text-white/65 uppercase mb-[4.5vh]">
          REWARDS PLATFORM
        </h2>
        <div className="w-[7vw] h-[1px] bg-white/35 mb-[4.5vh]" />
        <p className="font-body text-[1.8vw] text-white/45 mb-[5.5vh]">
          10,000+ Members &nbsp;·&nbsp; ₹5L+ Prizes &nbsp;·&nbsp; Daily Draws
        </p>
        <div className="border border-white/28 px-[3.5vw] py-[1.5vh]">
          <a
            href="https://x247rewards.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-body text-[1.8vw] text-white/70 tracking-wide"
          >
            x247rewards.com
          </a>
        </div>
        <p className="absolute bottom-[4.5vh] font-body text-white/20 text-[1.4vw] tracking-[0.25em] uppercase">
          Earn &nbsp;&nbsp;·&nbsp;&nbsp; Refer &nbsp;&nbsp;·&nbsp;&nbsp; Win
        </p>
      </div>
    </div>
  );
}
