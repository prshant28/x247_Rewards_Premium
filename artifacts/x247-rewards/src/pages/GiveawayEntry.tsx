import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Link, useParams } from "wouter";
import {
  Trophy, Sparkles, Shield, Camera, CheckCircle2, AlertCircle,
  Clock, Users, ArrowRight, Gift, Star, ExternalLink, Loader2, PartyPopper,
  Upload, X, EyeOff, Copy, Search, FileImage, Eye, User
} from "lucide-react";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getPartners, getGiveawayStatus, submitGiveawayEntry, uploadScreenshot, checkEntryCode, trackFormFill, getContest, registerUser, getCurrentUser, isUserLoggedIn, getUserTokenValue, type PartnerData, type GiveawayStatus, type ContestData } from "@/lib/api";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

export default function GiveawayEntry() {
  const params = useParams<{ slug: string }>();
  const contestSlug = params.slug;
  const queryClient = useQueryClient();

  const { data: partners = [] } = useQuery({
    queryKey: ["partners"],
    queryFn: getPartners,
    staleTime: 0,
  });
  const { data: status = null } = useQuery({
    queryKey: ["giveaway-status"],
    queryFn: getGiveawayStatus,
    refetchInterval: 15_000,
    staleTime: 0,
  });
  const { data: contest = null, isLoading: contestLoading } = useQuery({
    queryKey: ["contest", contestSlug],
    queryFn: () => getContest(contestSlug!),
    enabled: !!contestSlug,
    refetchInterval: 15_000,
    staleTime: 0,
  });
  const { data: currentUser } = useQuery({
    queryKey: ["current-user"],
    queryFn: getCurrentUser,
    staleTime: 60_000,
    enabled: isUserLoggedIn(),
  });
  const loading = !!contestSlug && contestLoading;

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [entryCode, setEntryCode] = useState("");
  const [error, setError] = useState("");
  const [codeCopied, setCodeCopied] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    age: "",
    city: "",
  });

  useEffect(() => {
    if (!currentUser) return;
    setForm(prev => ({
      ...prev,
      fullName: prev.fullName || currentUser.fullName || "",
      email: prev.email || currentUser.email || "",
      phone: prev.phone || currentUser.phone || "",
      city: prev.city || currentUser.city || "",
    }));
  }, [currentUser]);

  const [selectedPartners, setSelectedPartners] = useState<number[]>([]);
  const [screenshotConfirmed, setScreenshotConfirmed] = useState(false);
  const [screenshotFiles, setScreenshotFiles] = useState<Record<number, File>>({});
  const [screenshotPreviews, setScreenshotPreviews] = useState<Record<number, string>>({});
  const [uploadingScreenshot, setUploadingScreenshot] = useState(false);
  const [screenshotUrls, setScreenshotUrls] = useState<Record<number, string>>({});
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const captchaRef = useRef<HCaptcha>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  const [checkCode, setCheckCode] = useState("");
  const [checkResult, setCheckResult] = useState<any>(null);
  const [checking, setChecking] = useState(false);
  const [showChecker, setShowChecker] = useState(false);

  const [createAccount, setCreateAccount] = useState(false);
  const [accountPassword, setAccountPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);


  const activePartners = partners.filter((p) => {
    if (!p.isActive) return false;
    if (contest && contest.partnerIds && contest.partnerIds.length > 0) {
      return contest.partnerIds.includes(p.id);
    }
    return true;
  });
  const requiredPartners = activePartners.filter((p) => p.isRequired);
  const allRequiredSelected = requiredPartners.every((p) => selectedPartners.includes(p.id));

  function togglePartner(id: number) {
    setSelectedPartners((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    );
  }

  const activeFileInputRef = useRef<number | null>(null);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    const partnerId = activeFileInputRef.current;
    if (!file || partnerId === null) return;

    if (file.size > 10 * 1024 * 1024) {
      setError("Screenshot must be under 10 MB.");
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Only image files are allowed.");
      return;
    }

    if (screenshotPreviews[partnerId]) {
      URL.revokeObjectURL(screenshotPreviews[partnerId]);
    }
    setScreenshotFiles((prev) => ({ ...prev, [partnerId]: file }));
    setScreenshotPreviews((prev) => ({ ...prev, [partnerId]: URL.createObjectURL(file) }));
    setScreenshotConfirmed(true);
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
    activeFileInputRef.current = null;
  }

  function removeScreenshot(partnerId: number) {
    if (screenshotPreviews[partnerId]) {
      URL.revokeObjectURL(screenshotPreviews[partnerId]);
    }
    setScreenshotFiles((prev) => {
      const next = { ...prev };
      delete next[partnerId];
      return next;
    });
    setScreenshotPreviews((prev) => {
      const next = { ...prev };
      delete next[partnerId];
      return next;
    });
    setScreenshotUrls((prev) => {
      const next = { ...prev };
      delete next[partnerId];
      return next;
    });
    if (Object.keys(screenshotFiles).length <= 1) {
      setScreenshotConfirmed(false);
    }
  }

  function triggerFileUpload(partnerId: number) {
    activeFileInputRef.current = partnerId;
    fileInputRef.current?.click();
  }

  const hasAllScreenshots = selectedPartners.length > 0 && selectedPartners.every((pid) => screenshotFiles[pid] || screenshotUrls[pid]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!allRequiredSelected) {
      setError("You must complete all required partner registrations before entering.");
      return;
    }

    if (selectedPartners.length === 0) {
      setError("Please select at least one partner you've registered with.");
      return;
    }

    if (!hasAllScreenshots) {
      setError("Please upload a screenshot for each selected partner registration.");
      return;
    }

    if (!agreedToTerms) {
      setError("You must agree to the terms and conditions.");
      return;
    }

    if (!captchaToken) {
      setError("Please complete the captcha verification.");
      return;
    }

    const age = parseInt(form.age);
    if (isNaN(age) || age < 18) {
      setError("You must be 18 or older to participate.");
      return;
    }

    setSubmitting(true);

    const uploadedUrls = { ...screenshotUrls };
    const filesToUpload = selectedPartners.filter((pid) => screenshotFiles[pid] && !uploadedUrls[pid]);
    if (filesToUpload.length > 0) {
      try {
        setUploadingScreenshot(true);
        for (const pid of filesToUpload) {
          const url = await uploadScreenshot(screenshotFiles[pid]);
          uploadedUrls[pid] = url;
        }
        setScreenshotUrls(uploadedUrls);
        setUploadingScreenshot(false);
      } catch (err: any) {
        setError(err.message || "Failed to upload screenshot");
        setSubmitting(false);
        setUploadingScreenshot(false);
        return;
      }
    }
    const screenshotUrlsList = selectedPartners
      .map((pid) => uploadedUrls[pid])
      .filter(Boolean);
    const primaryScreenshotUrl = screenshotUrlsList[0] || null;

    if (createAccount && accountPassword) {
      if (accountPassword.length < 6) {
        setError("Password must be at least 6 characters");
        setSubmitting(false);
        return;
      }
      try {
        await registerUser({
          fullName: form.fullName,
          email: form.email,
          phone: form.phone || undefined,
          password: accountPassword,
          city: form.city || undefined,
        });
      } catch {
        console.warn("Account creation skipped — email may already be registered");
      }
    }

    const submissionData: any = {
      fullName: form.fullName,
      email: form.email,
      phone: form.phone,
      age,
      city: form.city,
      completedPartners: selectedPartners,
      screenshotConfirmed: true,
      screenshotUrl: primaryScreenshotUrl || undefined,
      screenshotUrls: screenshotUrlsList.length > 0 ? screenshotUrlsList : undefined,
      agreedToTerms,
      isAnonymous,
    };

    if (contest) {
      submissionData.contestId = contest.id;
    }

    const userToken = getUserTokenValue();
    if (userToken) {
      submissionData.userToken = userToken;
    }

    try {
      const result = await submitGiveawayEntry(submissionData);
      if (result.success) {
        setSubmitted(true);
        setSuccessMessage(result.message);
        setEntryCode(result.entryCode || "");
        selectedPartners.forEach((partnerId) => trackFormFill(partnerId));
        queryClient.invalidateQueries({ queryKey: ["contests"] });
        queryClient.invalidateQueries({ queryKey: ["contest", contestSlug] });
        queryClient.invalidateQueries({ queryKey: ["giveaway-status"] });
      } else {
        setError(result.error || "Something went wrong. Please try again.");
        captchaRef.current?.resetCaptcha();
        setCaptchaToken(null);
      }
    } catch (err: any) {
      setError(err.message || "Network error. Please try again.");
      captchaRef.current?.resetCaptcha();
      setCaptchaToken(null);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCheckCode() {
    if (!checkCode.trim()) return;
    setChecking(true);
    setCheckResult(null);
    const result = await checkEntryCode(checkCode.trim());
    setCheckResult(result);
    setChecking(false);
  }

  function copyEntryCode() {
    navigator.clipboard.writeText(entryCode);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-foreground">
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-6 h-6 text-foreground/30 animate-spin" />
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-black text-foreground">
        <div className="noise-overlay" />
        <div className="vignette-overlay" />
        <div className="flex items-center justify-center min-h-screen px-4 pt-28 pb-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative z-10 w-full max-w-lg text-center"
          >
            <div className="glass-card p-8 sm:p-12">
              <div className="card-top-accent card-top-accent-navy" />
              <div className="relative z-[2]">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-white/[0.08] to-white/[0.03] border border-white/[0.12] flex items-center justify-center mx-auto mb-6">
                  <PartyPopper className="w-8 h-8 text-foreground/70" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-display font-light text-foreground mb-3">You're In!</h2>
                <p className="text-foreground/60 text-sm font-light mb-6 leading-relaxed">{successMessage}</p>

                {entryCode && (
                  <div className="glass-card p-4 mb-4">
                    <div className="relative z-[2]">
                      <p className="text-[10px] uppercase tracking-widest text-foreground/30 font-display mb-2">Your Entry Code</p>
                      <div className="flex items-center justify-center gap-3">
                        <code className="text-lg sm:text-xl font-mono font-bold text-foreground tracking-wider">{entryCode}</code>
                        <button onClick={copyEntryCode} className="p-2 rounded-lg bg-white/[0.06] border border-white/[0.1] hover:bg-white/[0.1] transition-colors">
                          {codeCopied ? <CheckCircle2 className="w-4 h-4 text-foreground/70" /> : <Copy className="w-4 h-4 text-foreground/50" />}
                        </button>
                      </div>
                      <p className="text-[10px] text-foreground/30 font-light mt-2">Save this code! You'll need it to check if you've won.</p>
                    </div>
                  </div>
                )}

                <div className="glass-card p-4 mb-4">
                  <div className="relative z-[2] flex items-center gap-3">
                    <Clock className="w-5 h-5 text-foreground/50 shrink-0" />
                    <div className="text-left">
                      <p className="text-[10px] uppercase tracking-widest text-foreground/30 font-display">Winner Announcement</p>
                      <p className="text-sm text-foreground font-light">Within 24-48 hours after verification, when contest is filled</p>
                    </div>
                  </div>
                </div>

                <div className="glass-card p-4 mb-6">
                  <div className="relative z-[2] flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-foreground/50 shrink-0" />
                    <div className="text-left">
                      <p className="text-[10px] uppercase tracking-widest text-foreground/30 font-display">Confirmation Email</p>
                      <p className="text-sm text-foreground/60 font-light">A confirmation with your entry code has been sent to your email.</p>
                    </div>
                  </div>
                </div>

                <Link href="/partners" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/[0.06] border border-white/[0.1] text-foreground text-sm font-display font-light hover:bg-white/[0.1] transition-colors">
                  <ExternalLink className="w-4 h-4" />
                  Register with More Partners
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-foreground">
      <div className="noise-overlay" />
      <div className="vignette-overlay" />

      <main className="relative z-10 pt-28 pb-20 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div initial="hidden" animate="visible" className="text-center mb-10">
            {contest && (
              <motion.div variants={fadeUp} custom={0} className="mb-3">
                <Link href="/giveaway" className="text-xs text-foreground/30 hover:text-foreground/50 font-light transition-colors">
                  ← Back to Contests
                </Link>
              </motion.div>
            )}
            <motion.div variants={fadeUp} custom={0} className="flex items-center justify-center gap-2 mb-4">
              <span className="glass-pill-badge">
                <Gift className="w-3.5 h-3.5 text-foreground/60" />
                <span className="text-[11px] text-foreground/60 font-light">{contest ? contest.prize : "Daily Prize Draw"}</span>
              </span>
            </motion.div>
            <motion.h1 variants={fadeUp} custom={1} className="text-3xl sm:text-4xl lg:text-5xl font-display font-light text-foreground mb-4">
              {contest ? contest.name : "Enter the Giveaway"}
            </motion.h1>
            <motion.p variants={fadeUp} custom={2} className="text-foreground/40 text-sm sm:text-base font-light max-w-xl mx-auto leading-relaxed">
              {contest ? contest.description : "Complete partner registrations, submit your proof, and earn entries into the daily prize draw. More registrations = more entries = higher chances of winning!"}
            </motion.p>
          </motion.div>

          <motion.div variants={fadeUp} custom={3} initial="hidden" animate="visible" className="grid grid-cols-3 gap-3 mb-8">
            <div className="glass-card p-4 text-center">
              <div className="relative z-[2]">
                <div className="text-2xl font-display font-light text-foreground">{contest ? contest.spotsRemaining : (status?.spotsRemaining ?? "...")}</div>
                <div className="text-[9px] uppercase tracking-widest text-foreground/30 font-display mt-1">Spots Left</div>
              </div>
            </div>
            <div className="glass-card p-4 text-center">
              <div className="relative z-[2]">
                <div className="text-2xl font-display font-light text-foreground">{contest ? contest.maxSpots : (status?.maxSpots ?? 100)}</div>
                <div className="text-[9px] uppercase tracking-widest text-foreground/30 font-display mt-1">Total Spots</div>
              </div>
            </div>
            <div className="glass-card p-4 text-center">
              <div className="relative z-[2]">
                <div className="text-2xl font-display font-light text-foreground">{activePartners.length}</div>
                <div className="text-[9px] uppercase tracking-widest text-foreground/30 font-display mt-1">Partners</div>
              </div>
            </div>
          </motion.div>

          <motion.div variants={fadeUp} custom={3.5} initial="hidden" animate="visible" className="mb-8 flex flex-col items-center">
            <button
              onClick={() => setShowChecker(!showChecker)}
              className="premium-btn px-6 py-3"
            >
              <span className="relative z-[2] flex items-center gap-2 text-sm font-display font-light">
                <Search className="w-4 h-4" />
                Check Entry Code
              </span>
            </button>

            {showChecker && (
              <div className="glass-card p-5 mt-3">
                <div className="relative z-[2]">
                  <p className="text-xs text-foreground/40 font-light mb-3">Already submitted? Enter your entry code to check your status.</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={checkCode}
                      onChange={(e) => setCheckCode(e.target.value.toUpperCase())}
                      className="flex-1 px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-foreground text-sm font-mono placeholder-white/20 focus:outline-none focus:border-white/20 transition-colors"
                      placeholder="X247-XXXX-XXXX"
                    />
                    <button
                      onClick={handleCheckCode}
                      disabled={checking || !checkCode.trim()}
                      className="px-5 py-3 rounded-xl bg-white/[0.06] border border-white/[0.1] text-foreground/70 text-sm font-display font-light hover:bg-white/[0.1] transition-colors disabled:opacity-40"
                    >
                      {checking ? <Loader2 className="w-4 h-4 animate-spin" /> : "Check"}
                    </button>
                  </div>
                  {checkResult && (
                    <div className={`mt-3 p-3 rounded-xl text-sm font-light ${checkResult.found ? "bg-white/[0.04] border border-white/[0.1] text-foreground/70" : "bg-red-500/10 border border-red-500/20 text-red-400"}`}>
                      {checkResult.found ? (
                        <div className="space-y-1">
                          <p><strong className="font-medium">Entry Found!</strong></p>
                          <p>Name: {checkResult.entry.fullName}</p>
                          <p>Entries: {checkResult.entry.entryCount}</p>
                          <p>Partners: {checkResult.entry.partnersCompleted}</p>
                          <p>Submitted: {new Date(checkResult.entry.submittedAt).toLocaleDateString()}</p>
                        </div>
                      ) : (
                        <p>{checkResult.error || "Entry not found"}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>

          {(contest ? contest.isFull : status?.isFull) ? (
            <motion.div variants={fadeUp} custom={4} initial="hidden" animate="visible" className="glass-card p-8 text-center">
              <div className="relative z-[2]">
                <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                <h2 className="text-2xl font-display font-light text-foreground mb-2">Contest Full</h2>
                <p className="text-foreground/40 text-sm font-light mb-4">All {contest ? contest.maxSpots : status?.maxSpots} spots have been taken. Stay tuned for the next giveaway!</p>
                <div className="flex items-center gap-3 justify-center">
                  <Clock className="w-4 h-4 text-foreground/50" />
                  <span className="text-sm text-foreground/60 font-light">Winner announcement: Within 24-48 hours after verification, when contest is filled</span>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div variants={fadeUp} custom={4} initial="hidden" animate="visible">
              <div className="glass-card p-5 sm:p-6 mb-6">
                <div className="card-top-accent card-top-accent-red" />
                <div className="relative z-[2]">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0 mt-0.5">
                      <Shield className="w-5 h-5 text-red-400" />
                    </div>
                    <div>
                      <h3 className="text-base font-display font-light text-foreground mb-1">Before You Enter</h3>
                      <p className="text-xs text-foreground/40 font-light leading-relaxed">
                        Make sure you have completed partner registrations successfully. You will need to upload a screenshot as proof.
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {[
                      { icon: <CheckCircle2 className="w-3.5 h-3.5" />, text: "Complete all required partner registrations first" },
                      { icon: <Camera className="w-3.5 h-3.5" />, text: "Upload a screenshot of your completed registration as proof (max 10 MB)" },
                      { icon: <Star className="w-3.5 h-3.5" />, text: "More partners you join = more entries = higher chances of winning" },
                      { icon: <Trophy className="w-3.5 h-3.5" />, text: "Each partner registration counts as 1 separate entry" },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-white/[0.02]">
                        <span className="text-red-400/70">{item.icon}</span>
                        <span className="text-xs text-foreground/50 font-light">{item.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {error}
                  </div>
                )}

                <div className="glass-card p-5 sm:p-6">
                  <div className="card-top-accent card-top-accent-navy" />
                  <div className="relative z-[2]">
                    <div className="flex items-center gap-2 mb-5">
                      <span className="text-[10px] font-display font-medium text-foreground/40 uppercase tracking-[0.15em]">Step 1</span>
                      <span className="text-[10px] text-foreground/20">—</span>
                      <span className="text-sm font-display font-light text-foreground">Select Completed Registrations</span>
                    </div>
                    <p className="text-xs text-foreground/35 font-light mb-4">
                      Select the partners you've successfully registered with. Each selected partner = 1 entry into the draw. Partners marked as "Required" must be selected.
                    </p>
                    <div className="space-y-2">
                      {activePartners.map((partner) => {
                        const isSelected = selectedPartners.includes(partner.id);
                        const isRequired = partner.isRequired;
                        return (
                          <label
                            key={partner.id}
                            className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border ${
                              isSelected
                                ? "bg-white/[0.06] border-white/[0.12]"
                                : "bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.04]"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => togglePartner(partner.id)}
                              className="accent-blue-500 w-4 h-4 shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm text-foreground font-light">{partner.name}</span>
                                {isRequired && (
                                  <span className="px-1.5 py-0.5 rounded-full bg-red-500/15 border border-red-500/25 text-[8px] text-red-400 font-display">REQUIRED</span>
                                )}
                                {partner.badgeSecondary && (
                                  <span className="px-1.5 py-0.5 rounded-full bg-white/[0.06] border border-white/[0.1] text-[8px] text-foreground/50 font-display">{partner.badgeSecondary}</span>
                                )}
                              </div>
                              <p className="text-[11px] text-foreground/30 font-light truncate mt-0.5">{partner.tagline}</p>
                            </div>
                            <Link
                              href={`/partners/${partner.slug}`}
                              className="text-foreground/20 hover:text-foreground/50 transition-colors shrink-0"
                              onClick={(e: React.MouseEvent) => e.stopPropagation()}
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Link>
                          </label>
                        );
                      })}
                    </div>
                    {selectedPartners.length > 0 && (
                      <div className="mt-4 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.08]">
                        <p className="text-xs text-foreground/60 font-light">
                          <Star className="w-3 h-3 inline mr-1" />
                          You'll earn <strong className="font-medium text-foreground/80">{selectedPartners.length} {selectedPartners.length === 1 ? "entry" : "entries"}</strong> into the daily prize draw!
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="glass-card p-5 sm:p-6">
                  <div className="relative z-[2]">
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-display font-medium text-foreground/40 uppercase tracking-[0.15em]">Step 2</span>
                        <span className="text-[10px] text-foreground/20">—</span>
                        <span className="text-sm font-display font-light text-foreground">Your Details</span>
                      </div>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isAnonymous}
                          onChange={(e) => setIsAnonymous(e.target.checked)}
                          className="accent-white w-3.5 h-3.5"
                        />
                        <EyeOff className="w-3.5 h-3.5 text-foreground/40" />
                        <span className="text-[11px] text-foreground/40 font-light">Submit Anonymously</span>
                      </label>
                    </div>

                    {currentUser && (
                      <div className="mb-4 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.08] flex items-center gap-2">
                        <User className="w-3 h-3 text-foreground/35 shrink-0" />
                        <p className="text-[11px] text-foreground/40 font-light">
                          Pre-filled from your profile — edit any field if needed.
                        </p>
                      </div>
                    )}

                    {isAnonymous && (
                      <div className="mb-4 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.08]">
                        <p className="text-[11px] text-foreground/50 font-light">
                          <EyeOff className="w-3 h-3 inline mr-1" />
                          Your name will be hidden publicly. Your details are still required for verification and prize delivery.
                        </p>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <label className="text-[10px] font-display font-medium text-foreground/40 uppercase tracking-[0.15em] block mb-2">Full Name *</label>
                        <input
                          type="text" required value={form.fullName}
                          onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-foreground text-sm font-light placeholder-white/20 focus:outline-none focus:border-white/20 transition-colors"
                          placeholder="Enter your full name"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-display font-medium text-foreground/40 uppercase tracking-[0.15em] block mb-2">Email *</label>
                        <input
                          type="email" required value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-foreground text-sm font-light placeholder-white/20 focus:outline-none focus:border-white/20 transition-colors"
                          placeholder="your@email.com"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-display font-medium text-foreground/40 uppercase tracking-[0.15em] block mb-2">Phone *</label>
                        <input
                          type="tel" required value={form.phone}
                          onChange={(e) => setForm({ ...form, phone: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-foreground text-sm font-light placeholder-white/20 focus:outline-none focus:border-white/20 transition-colors"
                          placeholder="+91 XXXXX XXXXX"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-display font-medium text-foreground/40 uppercase tracking-[0.15em] block mb-2">Age *</label>
                        <input
                          type="number" required min={18} value={form.age}
                          onChange={(e) => setForm({ ...form, age: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-foreground text-sm font-light placeholder-white/20 focus:outline-none focus:border-white/20 transition-colors"
                          placeholder="18+"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-display font-medium text-foreground/40 uppercase tracking-[0.15em] block mb-2">City *</label>
                        <input
                          type="text" required value={form.city}
                          onChange={(e) => setForm({ ...form, city: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-foreground text-sm font-light placeholder-white/20 focus:outline-none focus:border-white/20 transition-colors"
                          placeholder="Your city"
                        />
                      </div>
                    </div>

                    {!isUserLoggedIn() && (
                      <div className="mt-4 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={createAccount}
                            onChange={(e) => setCreateAccount(e.target.checked)}
                            className="accent-white w-4 h-4 shrink-0"
                          />
                          <div className="flex items-center gap-2">
                            <User className="w-3.5 h-3.5 text-foreground/40" />
                            <span className="text-sm text-foreground/60 font-light">Create an account to track my entries</span>
                          </div>
                        </label>
                        {createAccount && (
                          <div className="mt-3 relative">
                            <input
                              type={showPassword ? "text" : "password"}
                              value={accountPassword}
                              onChange={(e) => setAccountPassword(e.target.value)}
                              placeholder="Create a password (min 6 characters)"
                              className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-foreground text-sm font-light placeholder-white/20 focus:outline-none focus:border-white/20 transition-colors pr-10"
                            />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/25 hover:text-foreground/40">
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="glass-card p-5 sm:p-6">
                  <div className="relative z-[2]">
                    <div className="flex items-center gap-2 mb-5">
                      <span className="text-[10px] font-display font-medium text-foreground/40 uppercase tracking-[0.15em]">Step 3</span>
                      <span className="text-[10px] text-foreground/20">—</span>
                      <span className="text-sm font-display font-light text-foreground">Upload Screenshot Proof</span>
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />

                    {selectedPartners.length === 0 ? (
                      <div className="text-center py-6 text-foreground/30 text-sm font-light">
                        Select partners in Step 1 to upload screenshots
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <p className="text-xs text-foreground/35 font-light">
                          Upload a screenshot for each partner registration you completed. One screenshot per partner.
                        </p>
                        {selectedPartners.map((pid) => {
                          const partner = activePartners.find((p) => p.id === pid);
                          if (!partner) return null;
                          const preview = screenshotPreviews[pid];
                          const file = screenshotFiles[pid];
                          return (
                            <div key={pid} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                              <div className="flex items-center gap-2 mb-3">
                                <Camera className="w-3.5 h-3.5 text-foreground/40" />
                                <span className="text-xs text-foreground/60 font-light">{partner.name}</span>
                                {preview && <CheckCircle2 className="w-3.5 h-3.5 text-foreground/50 ml-auto" />}
                              </div>
                              {preview ? (
                                <div>
                                  <div className="rounded-lg overflow-hidden border border-white/[0.08] mb-2">
                                    <img src={preview} alt={`Screenshot for ${partner.name}`} className="w-full max-h-40 object-contain bg-white/[0.02]" loading="lazy" decoding="async" />
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-[11px] text-foreground/40 font-light">{file?.name} ({((file?.size || 0) / 1024 / 1024).toFixed(1)} MB)</span>
                                    <button type="button" onClick={() => removeScreenshot(pid)} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08] text-foreground/40 text-[10px] hover:bg-white/[0.08] transition-colors">
                                      <X className="w-2.5 h-2.5" />
                                      Remove
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => triggerFileUpload(pid)}
                                  className="w-full flex items-center justify-center gap-2 py-4 rounded-lg border border-dashed border-white/[0.1] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.15] transition-all cursor-pointer"
                                >
                                  <Upload className="w-4 h-4 text-foreground/30" />
                                  <span className="text-xs text-foreground/40 font-light">Upload screenshot</span>
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                <div className="glass-card p-5 sm:p-6">
                  <div className="relative z-[2]">
                    <div className="flex items-center gap-2 mb-5">
                      <span className="text-[10px] font-display font-medium text-foreground/40 uppercase tracking-[0.15em]">Step 4</span>
                      <span className="text-[10px] text-foreground/20">—</span>
                      <span className="text-sm font-display font-light text-foreground">Agreement</span>
                    </div>

                    <label className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all border ${agreedToTerms ? "bg-white/[0.04] border-white/[0.12]" : "bg-white/[0.02] border-white/[0.05]"}`}>
                      <input
                        type="checkbox"
                        checked={agreedToTerms}
                        onChange={(e) => setAgreedToTerms(e.target.checked)}
                        className="accent-white w-4 h-4 shrink-0 mt-0.5"
                      />
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Shield className="w-3.5 h-3.5 text-foreground/50" />
                          <span className="text-sm text-foreground font-light">Terms & Conditions Agreement</span>
                        </div>
                        <p className="text-[11px] text-foreground/35 font-light leading-relaxed">
                          I agree to the X247 Rewards terms and conditions. I confirm that I am 18 years or older, all information provided is accurate, and I have genuinely completed the partner registrations I've selected. I understand that fraudulent entries will be disqualified. Winners will be announced within 24-48 hours after verification.
                        </p>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="glass-card p-5 sm:p-6">
                  <div className="relative z-[2]">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-[10px] font-display font-medium text-foreground/40 uppercase tracking-[0.15em]">Step 5</span>
                      <span className="text-[10px] text-foreground/20">—</span>
                      <span className="text-sm font-display font-light text-foreground">Verification</span>
                    </div>
                    <div className="flex justify-center">
                      <HCaptcha
                        ref={captchaRef}
                        sitekey="57c8688a-ca78-46a2-843e-8d1c3fdae89a"
                        theme="dark"
                        onVerify={(token) => setCaptchaToken(token)}
                        onExpire={() => setCaptchaToken(null)}
                        onError={() => setCaptchaToken(null)}
                      />
                    </div>
                    {captchaToken && (
                      <div className="mt-3 flex items-center justify-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-foreground/60" />
                        <span className="text-xs text-foreground/50 font-light">Verification complete</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="glass-card p-4 sm:p-5">
                  <div className="relative z-[2] flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                    <Clock className="w-5 h-5 text-foreground/50 shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs text-foreground/50 font-light">
                        <strong className="text-foreground/70 font-medium">Limited Spots:</strong> Only {contest ? contest.maxSpots : (status?.maxSpots ?? 100)} entries accepted.{" "}
                        <strong className="text-foreground/70 font-medium">{contest ? contest.spotsRemaining : (status?.spotsRemaining ?? "...")}</strong> spots remaining.
                      </p>
                      <p className="text-xs text-foreground/35 font-light mt-1">
                        Winner announcement: <strong className="text-foreground/60 font-medium">Within 24-48 hours after verification, when contest is filled</strong>. Once all spots are filled, no more entries will be accepted.
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting || !allRequiredSelected || !agreedToTerms || selectedPartners.length === 0 || !hasAllScreenshots || !captchaToken}
                  className="premium-btn w-full py-4 relative overflow-hidden disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <span className="relative z-[2] flex items-center justify-center gap-2 text-sm font-display font-light">
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {uploadingScreenshot ? "Uploading Screenshot..." : "Submitting Entry..."}
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Submit Entry — Earn {selectedPartners.length} {selectedPartners.length === 1 ? "Entry" : "Entries"}
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </span>
                </button>
              </form>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
