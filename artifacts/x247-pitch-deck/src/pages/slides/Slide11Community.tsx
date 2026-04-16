import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { month: "Sep", members: 800 },
  { month: "Oct", members: 2100 },
  { month: "Nov", members: 3800 },
  { month: "Dec", members: 5200 },
  { month: "Jan", members: 7100 },
  { month: "Feb", members: 8900 },
  { month: "Mar", members: 10000 },
];

export default function Slide11Community() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#080808]">
      <div className="absolute top-[6vh] left-[6vw]">
        <p className="font-body text-white/20 text-[1.5vw] tracking-[0.3em] uppercase">11 — Community Growth</p>
      </div>

      <div className="flex h-full pt-[12vh]">
        <div className="flex flex-col justify-center w-[33%] px-[6vw] border-r border-white/10">
          <p className="font-display text-[7vw] font-black text-white leading-none">10K+</p>
          <p className="font-body text-[1.8vw] text-white/45 mb-[4vh]">Registered Members</p>
          <div className="w-full h-[1px] bg-white/10 mb-[4vh]" />
          <div className="flex flex-col gap-[2.5vh]">
            <div>
              <p className="font-display text-[2.8vw] font-black text-white leading-none">50+</p>
              <p className="font-body text-[1.5vw] text-white/40 mt-[0.5vh]">Contests Run</p>
            </div>
            <div>
              <p className="font-display text-[2.8vw] font-black text-white leading-none">₹3L+</p>
              <p className="font-body text-[1.5vw] text-white/40 mt-[0.5vh]">Prizes Distributed</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-center w-[67%] px-[5vw]">
          <p className="font-display text-[2vw] font-bold text-white mb-[4vh]">Member Growth — Sep 2025 to Mar 2026</p>
          <div style={{ width: "100%", height: "45vh" }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                <defs>
                  <linearGradient id="memberGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ffffff" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="#ffffff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="month"
                  stroke="#333"
                  tick={{ fill: "#666", fontFamily: "Poppins", fontSize: 14 }}
                />
                <YAxis
                  stroke="#333"
                  tick={{ fill: "#666", fontFamily: "Poppins", fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    background: "#111",
                    border: "1px solid #333",
                    color: "#fff",
                    fontFamily: "Poppins",
                    fontSize: "1.3vw",
                    borderRadius: 0,
                  }}
                  labelStyle={{ color: "#aaa" }}
                  formatter={(value) => [value.toLocaleString(), "Members"]}
                />
                <Area
                  type="monotone"
                  dataKey="members"
                  stroke="#ffffff"
                  strokeWidth={2}
                  fill="url(#memberGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
