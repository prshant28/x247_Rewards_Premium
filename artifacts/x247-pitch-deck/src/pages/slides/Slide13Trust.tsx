const base = import.meta.env.BASE_URL;

export default function Slide13Trust() {
  return (
    <div className="relative w-screen h-screen overflow-hidden">
      <img
        src={`${base}slide-grid-bg.png`}
        crossOrigin="anonymous"
        className="absolute inset-0 w-full h-full object-cover"
        alt=""
      />
      <div className="absolute inset-0 bg-black/82" />
      <div className="absolute top-[6vh] left-[6vw] z-10">
        <p className="font-body text-white/20 text-[1.5vw] tracking-[0.3em] uppercase">13 — Trust &amp; Verification</p>
      </div>

      <div className="relative z-10 flex flex-col justify-center items-center h-full text-center px-[15vw]">
        <div className="w-[4vw] h-[1px] bg-white/45 mb-[4vh]" />
        <h2 className="font-display text-[4.8vw] font-black text-white tracking-tight leading-tight mb-[4vh]">
          "Verified Members<br />Win More"
        </h2>
        <p className="font-body text-[1.8vw] text-white/45 leading-relaxed mb-[5.5vh]">
          Gold and Black tier members receive platform-verified status — increasing trust, credibility, and prize eligibility across all X247 contests.
        </p>
        <div className="flex items-stretch gap-[5vw]">
          <div className="text-center">
            <p className="font-display text-[3vw] font-black text-white">Gold</p>
            <p className="font-body text-[1.5vw] text-white/40 mt-[0.5vh]">Verified at ₹499/mo</p>
          </div>
          <div className="w-[1px] bg-white/18" />
          <div className="text-center">
            <p className="font-display text-[3vw] font-black text-white">Black</p>
            <p className="font-body text-[1.5vw] text-white/40 mt-[0.5vh]">Premium verified at ₹999/mo</p>
          </div>
        </div>
      </div>
    </div>
  );
}
