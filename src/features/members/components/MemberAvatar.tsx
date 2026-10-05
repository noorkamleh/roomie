import { memberTone } from "../../../shared/utils/memberTone";
function MemberAvatar({
  name,
  avatar,
  size = "large",
}: {
  name: string;
  avatar?: string;
  size?: "small" | "large";
}) {
  return (
    <span
      className={`members-avatar member-identity members-avatar--${size}`}
      data-member-tone={memberTone(name)}
      aria-hidden="true"
    >
      {avatar ? <img src={avatar} alt="" /> : name.slice(0, 1).toUpperCase()}
    </span>
  );
}
export default MemberAvatar;
