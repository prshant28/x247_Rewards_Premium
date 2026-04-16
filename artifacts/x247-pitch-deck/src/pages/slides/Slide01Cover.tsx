const base = import.meta.env.BASE_URL;

export default function Slide01Cover() {
  return (
    <div className="relative w-screen h-screen overflow-hidden">
      <img
        src={`${base}slide-hero-bg.png`}
        crossOrigin="anonymous"
        className="absolute inset-0 w-full h-full object-cover"
        alt=""
      />
      <div className="absolute inset-0 bg-black/72" />
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-white/15" />
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/15" />
      <div className="absolute top-0 right-0 w-[35vw] h-[35vh]" style={{background: 'radial-gradient(ellipse at top right, rgba(255,255,255,0.04) 0%, transparent 70%)'}} />

      <div className="relative z-10 flex flex-col justify-center items-center h-full">
        <div className="mb-[3vh] border border-white/25 px-[2vw] py-[0.8vh]">
          <p className="font-body text-white/50 tracking-[0.35em] text-[1.5vw] uppercase">India's Premier Giveaway Platform</p>
        </div>
        <h1 className="font-display text-[11vw] font-black tracking-[-0.04em] text-white leading-none">X247</h1>
        <h2 className="font-display text-[2.8vw] font-light tracking-[0.28em] text-white/70 uppercase mt-[1vh]">REWARDS</h2>
        <div className="w-[7vw] h-[1px] bg-white/35 my-[4vh]" />
        <p className="font-body text-[1.8vw] text-white/50 tracking-[0.25em] uppercase">EARN &nbsp;&nbsp;·&nbsp;&nbsp; REFER &nbsp;&nbsp;·&nbsp;&nbsp; WIN</p>
        <p className="absolute bottom-[4.5vh] right-[5vw] font-body text-white/25 text-[1.5vw] tracking-[0.2em]">2026</p>
        <p className="absolute bottom-[4.5vh] left-[5vw] font-body text-white/25 text-[1.5vw] tracking-[0.15em]">x247rewards.com</p>
      </div>
    </div>
  );
}
