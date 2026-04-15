import { BadgeCheck, Users, Trophy, Link as LinkIcon } from "lucide-react";

interface UserProfileCardProps {
  fullName: string;
  bio?: string | null;
  avatarUrl?: string | null;
  isVerified?: boolean;
  selectedBadge?: string | null;
  stats?: { entries: number; contestsJoined: number };
  membershipTier?: string;
  compact?: boolean;
  onShare?: () => void;
}

const BADGE_ICONS: Record<string, string> = {
  "early-adopter": "\u{1F680}",
  "streak-master": "\u{1F525}",
  "first-win": "\u{1F3C6}",
  "social-butterfly": "\u{1F98B}",
  "partner-pro": "\u2B50",
  "community-hero": "\u{1F6E1}\uFE0F",
  "lucky-charm": "\u{1F340}",
  "mega-streak": "\u{1F48E}",
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function UserProfileCard({
  fullName,
  bio,
  avatarUrl,
  isVerified,
  selectedBadge,
  stats,
  membershipTier,
  compact,
  onShare,
}: UserProfileCardProps) {
  return (
    <div className="user-profile-card">
      <div className="user-profile-card-inner">
        <div className="user-profile-avatar-area">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={fullName}
              className="user-profile-avatar-img"
            />
          ) : (
            <div className="user-profile-avatar-placeholder">
              <span className="user-profile-initials">
                {getInitials(fullName)}
              </span>
            </div>
          )}
          {membershipTier && membershipTier !== "free" && (
            <div className="user-profile-tier-badge">
              {membershipTier}
            </div>
          )}
        </div>

        <div className="user-profile-info">
          <div className="user-profile-name-row">
            <h3 className="user-profile-name">
              {fullName}
            </h3>
            {isVerified && (
              <BadgeCheck className="user-profile-verified-icon" />
            )}
            {selectedBadge && BADGE_ICONS[selectedBadge] && (
              <span className="user-profile-badge-emoji" title={selectedBadge}>
                {BADGE_ICONS[selectedBadge]}
              </span>
            )}
          </div>

          {bio && (
            <p className="user-profile-bio">
              {bio}
            </p>
          )}

          {!compact && (
            <div className="user-profile-footer">
              <div className="user-profile-stat">
                <Users className="w-4 h-4" />
                <span>{stats?.entries ?? 0}</span>
              </div>
              <div className="user-profile-stat">
                <Trophy className="w-4 h-4" />
                <span>{stats?.contestsJoined ?? 0}</span>
              </div>
              {onShare && (
                <button
                  onClick={onShare}
                  className="user-profile-share-btn"
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                  Share
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
