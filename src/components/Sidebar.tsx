
export type SidebarActive = 'dashboard' | 'diagnosis' | 'analytics';

export interface SidebarProps {
  active?: SidebarActive;
}

interface NavItem {
  key: SidebarActive;
  label: string;
  icon: string;
}

const navItems: NavItem[] = [
  { key: 'dashboard', label: 'Dashboard', icon: '◉' },
  { key: 'diagnosis', label: 'Diagnosis', icon: '◎' },
  { key: 'analytics', label: 'Analytics', icon: '◈' },
];

export function Sidebar({ active = 'dashboard' }: SidebarProps) {
  return (
    <div className="w-60 bg-slate-50 border-r border-gray-200 py-6 px-4 flex flex-col">
      <div className="mb-8 pl-1">
        <p className="text-xl font-bold text-blue-700 mb-1">StatuScope</p>
        <p className="text-[10px] font-semibold text-gray-400 tracking-[1.2px]">HEALTHCARE ANALYTICS</p>
      </div>

      <nav className="flex-1">
        {navItems.map((item) => {
          const isActive = active === item.key;
          return (
            <button
              key={item.key}
              className={`flex flex-row items-center w-full py-3 px-3.5 rounded-xl mb-1.5 text-left transition-colors
                ${isActive ? 'bg-indigo-50' : 'hover:bg-gray-100'}`}
            >
              <span
                className={`text-base w-5 text-center mr-3 ${isActive ? 'text-blue-700' : 'text-gray-500'}`}
              >
                {item.icon}
              </span>
              <span
                className={`text-sm ${isActive ? 'font-semibold text-blue-700' : 'font-medium text-gray-600'}`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      <button className="flex flex-row items-center py-3 px-3.5 border-t border-gray-200 mt-4">
        <span className="text-base w-5 text-center mr-3 text-gray-400">⏻</span>
        <span className="text-sm font-medium text-gray-500">Logout</span>
      </button>
    </div>
  );
}
