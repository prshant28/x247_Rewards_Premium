import { Users, Trophy, Link as LinkIcon, UserPlus } from "lucide-react";

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
    <div className="upc">
      <div className="upc-photo-area">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={fullName}
            className="upc-photo"
          />
        ) : (
          <div className="upc-photo-placeholder">
            <span className="upc-initials">
              {getInitials(fullName)}
            </span>
          </div>
        )}
        {membershipTier && membershipTier !== "free" && (
          <div className="upc-tier">
            {membershipTier}
          </div>
        )}
      </div>

      <div className="upc-body">
        <div className="upc-name-row">
          <h3 className="upc-name">{fullName}</h3>
          {isVerified && (
            <span className="upc-verified">
              <svg viewBox="0 0 22 22" fill="none" className="upc-verified-svg">
                <path d="M11 0L13.09 2.26L16 1.27L16.87 4.24L19.87 4.63L19.47 7.63L22 9.24L20.24 11.76L22 14.28L19.47 15.89L19.87 18.89L16.87 19.28L16 22.25L13.09 21.26L11 23.52L8.91 21.26L6 22.25L5.13 19.28L2.13 18.89L2.53 15.89L0 14.28L1.76 11.76L0 9.24L2.53 7.63L2.13 4.63L5.13 4.24L6 1.27L8.91 2.26L11 0Z" fill="currentColor"/>
                <path d="M7.5 11.5L10 14L15 9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
          )}
          {selectedBadge && BADGE_ICONS[selectedBadge] && (
            <span className="upc-badge-emoji" title={selectedBadge}>
              {BADGE_ICONS[selectedBadge]}
            </span>
          )}
        </div>

        {bio && (
          <p className="upc-bio">{bio}</p>
        )}

        {!compact && (
          <div className="upc-footer">
            <div className="upc-stat">
              <Users className="upc-stat-icon" />
              <span>{stats?.entries ?? 0}</span>
            </div>
            <div className="upc-stat">
              <Trophy className="upc-stat-icon" />
              <span>{stats?.contestsJoined ?? 0}</span>
            </div>
            {onShare && (
              <button onClick={onShare} className="upc-follow-btn">
                <LinkIcon className="upc-follow-icon" />
                Share
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
