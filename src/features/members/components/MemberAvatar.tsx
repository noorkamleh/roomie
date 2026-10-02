import type { MemberTone } from "../utils/presentation";
function MemberAvatar({
  name,
  avatar,
  tone = "purple",
  size = "large",
}: {
  name: string;
  avatar?: string;
  tone?: MemberTone;
  size?: "small" | "large";
}) {
  return (
    <span
      className={`members-avatar members-avatar--${tone} members-avatar--${size}`}
      aria-hidden="true"
    >
      {avatar ? <img src={avatar} alt="" /> : name.slice(0, 1).toUpperCase()}
    </span>
  );
}
export default MemberAvatar;
