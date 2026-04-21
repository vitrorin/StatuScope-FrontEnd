
export interface TopHeaderProps {
  sectionLabel?: string;
  searchPlaceholder?: string;
  userName: string;
  userId?: string;
  showNotificationDot?: boolean;
  avatarText?: string;
  onSearchPress?: () => void;
  onNotificationPress?: () => void;
  onProfilePress?: () => void;
  className?: string;
}

function getInitials(name: string): string {
  const parts = name.split(' ');
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.substring(0, 2).toUpperCase();
}

export function TopHeader({
  sectionLabel,
  searchPlaceholder = 'Search...',
  userName,
  userId,
  showNotificationDot = false,
  avatarText,
  onSearchPress,
  onNotificationPress,
  onProfilePress,
  className = '',
}: TopHeaderProps) {
  return (
    <div
      className={`flex flex-row items-center justify-between bg-white px-6 py-4 border-b border-gray-200 min-h-[72px] ${className}`}
    >
      <div className="flex-1">
        {sectionLabel && <span className="text-lg font-semibold text-gray-900">{sectionLabel}</span>}
      </div>

      <div className="flex-[2] flex justify-center px-6">
        <div
          className="flex flex-row items-center bg-gray-100 rounded-[10px] px-3 h-10 w-full max-w-[400px] cursor-text"
          onClick={onSearchPress}
        >
          <span className="text-sm mr-2">🔍</span>
          <input
            className="flex-1 text-sm text-gray-900 bg-transparent outline-none placeholder:text-slate-400"
            placeholder={searchPlaceholder}
            readOnly
          />
        </div>
      </div>

      <div className="flex-1 flex flex-row items-center justify-end">
        <button className="relative p-2" onClick={onNotificationPress}>
          <span className="text-xl">🔔</span>
          {showNotificationDot && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
          )}
        </button>

        <div className="w-px h-8 bg-gray-200 mx-4" />

        <button className="flex flex-row items-center" onClick={onProfilePress}>
          <div className="flex flex-col items-end mr-3">
            <span className="text-sm font-semibold text-gray-900">{userName}</span>
            {userId && <span className="text-xs text-gray-500 mt-0.5">{userId}</span>}
          </div>
          <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center">
            <span className="text-sm font-semibold text-blue-700">
              {avatarText || getInitials(userName)}
            </span>
          </div>
        </button>
      </div>
    </div>
  );
}
