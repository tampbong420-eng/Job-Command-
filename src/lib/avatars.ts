const DEMO_PORTRAITS: Record<string, string> = {
  user_admin: "/avatars/user_admin.jpg",
  user_dispatcher: "/avatars/user_dispatcher.jpg",
  user_tech: "/avatars/user_tech.jpg",
  user_dana: "/avatars/user_dana.jpg",
  user_liv: "/avatars/user_liv.jpg",
  user_viewer: "/avatars/user_viewer.jpg",
};

export function portraitUrl(userId: string, name: string) {
  return (
    DEMO_PORTRAITS[userId] ??
    `https://api.dicebear.com/9.x/adventurer/png?seed=${encodeURIComponent(name)}&size=160`
  );
}
