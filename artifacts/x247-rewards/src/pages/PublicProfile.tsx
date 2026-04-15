import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { motion } from "framer-motion";
import SiteFooter from "@/components/SiteFooter";
import UserProfileCard from "@/components/UserProfileCard";
import { getPublicProfile } from "@/lib/api";
import { Calendar, Shield } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

export default function PublicProfile() {
  const params = useParams<{ slug: string }>();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await getPublicProfile(params.slug);
      if (data) {
        setProfile(data);
      } else {
        setNotFound(true);
      }
      setLoading(false);
    };
    load();
  }, [params.slug]);

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: `${profile.fullName} on X247`, url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="noise-overlay" />
      <div className="vignette-overlay" />

      <main className="relative z-10 pt-28 pb-20 sm:pt-36 sm:pb-32">
        <div className="container mx-auto px-4 max-w-lg">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-6 h-6 border border-white/20 border-t-white/60 rounded-full animate-spin" />
            </div>
          ) : notFound ? (
            <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0} className="text-center">
              <Shield className="w-12 h-12 text-white/15 mx-auto mb-4" />
              <h1 className="text-2xl font-display font-light text-white mb-2">Profile Not Found</h1>
              <p className="text-sm text-white/35 font-light">This profile is private or doesn't exist.</p>
            </motion.div>
          ) : (
            <>
              <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
                <UserProfileCard
                  fullName={profile.fullName}
                  bio={profile.bio}
                  avatarUrl={profile.avatarUrl}
                  isVerified={profile.isVerified}
                  selectedBadge={profile.selectedBadge}
                  stats={profile.stats}
                  membershipTier={profile.membershipTier}
                  onShare={handleShare}
                />
              </motion.div>

              <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1} className="mt-6">
                <div className="glass-card p-5">
                  <div className="card-shine" />
                  <div className="relative z-[2]">
                    <div className="flex items-center gap-2 text-xs text-white/30 font-light">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Member since {new Date(profile.memberSince).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}</span>
                    </div>

                    {profile.badges && profile.badges.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-white/[0.06]">
                        <div className="text-[10px] text-white/25 uppercase tracking-widest font-display mb-3">Badges</div>
                        <div className="flex flex-wrap gap-2">
                          {profile.badges.map((b: string) => (
                            <div key={b} className="px-3 py-1.5 bg-white/[0.03] border border-white/[0.06] rounded-lg text-xs text-white/50 font-light">
                              {b.replace(/-/g, " ")}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </div>
      </main>

      <SiteFooter links={[
        { label: "Home", href: "/" },
        { label: "Giveaway", href: "/giveaway" },
      ]} />
    </div>
  );
}
