import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const data = [
  { tier: "Free", entries: 1 },
  { tier: "Silver", entries: 3 },
  { tier: "Gold", entries: 7 },
  { tier: "Black", entries: 15 },
];

const COLORS = ["#3a3a3a", "#777777", "#b0b0b0", "#f0f0f0"];

export default function Slide14WhyX247() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#080808]">
      <div className="absolute top-[6vh] left-[6vw]">
        <p className="font-body text-white/20 text-[1.5vw] tracking-[0.3em] uppercase">14 — Why X247</p>
      </div>

      <div className="flex h-full pt-[12vh]">
        <div className="flex flex-col justify-center w-[50%] px-[7vw] border-r border-white/10">
          <h2 className="font-display text-[3.5vw] font-black text-white tracking-tight mb-[4.5vh]">
            Why X247<br />Wins
          </h2>
          <div className="flex flex-col gap-[3vh]">
            <div className="flex items-start gap-[2vw]">
              <div className="w-[2px] h-[5.5vh] bg-white/40 shrink-0 mt-[0.3vh]" />
              <p className="font-body text-[1.65vw] text-white/65">Daily guaranteed draws — not monthly or random events</p>
            </div>
            <div className="flex items-start gap-[2vw]">
              <div className="w-[2px] h-[5.5vh] bg-white/40 shrink-0 mt-[0.3vh]" />
              <p className="font-body text-[1.65vw] text-white/65">Transparent, publicly verifiable winners every single time</p>
            </div>
            <div className="flex items-start gap-[2vw]">
              <div className="w-[2px] h-[5.5vh] bg-white/40 shrink-0 mt-[0.3vh]" />
              <p className="font-body text-[1.65vw] text-white/65">Referral engine that rewards genuine community growth</p>
            </div>
            <div className="flex items-start gap-[2vw]">
              <div className="w-[2px] h-[5.5vh] bg-white/40 shrink-0 mt-[0.3vh]" />
              <p className="font-body text-[1.65vw] text-white/65">Premium identity system with badges and public profiles</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-center w-[50%] px-[5vw]">
          <p className="font-display text-[2vw] font-bold text-white mb-[1vh]">Daily Entries by Tier</p>
          <p className="font-body text-[1.55vw] text-white/35 mb-[3vh]">More entries means more chances to win every day</p>
          <div style={{ width: "100%", height: "42vh" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                <XAxis
                  dataKey="tier"
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
                  formatter={(value) => [`${value} entries/day`, ""]}
                />
                <Bar dataKey="entries" radius={[2, 2, 0, 0]}>
                  <Cell fill={COLORS[0]} />
                  <Cell fill={COLORS[1]} />
                  <Cell fill={COLORS[2]} />
                  <Cell fill={COLORS[3]} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
