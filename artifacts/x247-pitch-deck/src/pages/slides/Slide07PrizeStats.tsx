import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const data = [
  { name: "Cash Prizes", value: 55 },
  { name: "Tech Gadgets", value: 25 },
  { name: "Gift Cards", value: 20 },
];

const COLORS = ["#e8e8e8", "#888888", "#444444"];

export default function Slide07PrizeStats() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#0a0a0a]">
      <div className="absolute top-[6vh] right-[6vw]">
        <p className="font-body text-white/20 text-[1.5vw] tracking-[0.3em] uppercase">07 — Prize Pool</p>
      </div>

      <div className="flex h-full">
        <div className="flex flex-col justify-center w-[42%] px-[8vw]">
          <p className="font-body text-[1.6vw] text-white/30 uppercase tracking-[0.2em] mb-[2vh]">Total Distributed</p>
          <p className="font-display text-[9vw] font-black text-white leading-none">₹5L+</p>
          <p className="font-body text-[1.8vw] text-white/45 mb-[4vh]">Across 50+ contests</p>
          <div className="w-full h-[1px] bg-white/10 mb-[3.5vh]" />
          <div className="flex gap-[5vw]">
            <div>
              <p className="font-display text-[2.8vw] font-black text-white leading-none">50+</p>
              <p className="font-body text-[1.5vw] text-white/40 mt-[0.5vh]">Contests Run</p>
            </div>
            <div>
              <p className="font-display text-[2.8vw] font-black text-white leading-none">15</p>
              <p className="font-body text-[1.5vw] text-white/40 mt-[0.5vh]">Partners</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-center w-[58%] px-[4vw]">
          <p className="font-display text-[2vw] font-bold text-white mb-[2vh]">Prize Composition</p>
          <div style={{ width: "100%", height: "55vh" }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius="30%"
                  outerRadius="58%"
                  dataKey="value"
                  startAngle={90}
                  endAngle={-270}
                  strokeWidth={0}
                >
                  <Cell fill={COLORS[0]} />
                  <Cell fill={COLORS[1]} />
                  <Cell fill={COLORS[2]} />
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "#111",
                    border: "1px solid #333",
                    color: "#fff",
                    fontFamily: "Poppins",
                    fontSize: "1.3vw",
                    borderRadius: 0,
                  }}
                  formatter={(value) => [`${value}%`, ""]}
                />
                <Legend
                  iconType="circle"
                  formatter={(value) => (
                    <span style={{ color: "#888", fontSize: "1.4vw", fontFamily: "Poppins" }}>
                      {value}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
