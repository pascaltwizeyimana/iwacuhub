import { useTheme } from '../context/ThemeContext';
import { FiSun, FiMoon, FiMonitor } from 'react-icons/fi';

export default function ThemeSwitcher() {
  const { theme, themes, toggleTheme } = useTheme();

  const getIcon = () => {
    switch(theme) {
      case 'dark': return <FiMoon className="w-5 h-5" />;
      case 'light': return <FiSun className="w-5 h-5" />;
      default: return <FiMonitor className="w-5 h-5" />;
    }
  };

  return (
    <div className="relative group">
      <button
        onClick={toggleTheme}
        className="flex items-center gap-2 text-white hover:bg-white/20 rounded-lg px-3 py-2 transition"
      >
        {getIcon()}
        <span className="text-sm hidden sm:inline capitalize">{theme} Mode</span>
      </button>
      
      <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
        {Object.entries(themes).map(([key, value]) => (
          <button
            key={key}
            onClick={() => toggleTheme()}
            className={`w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition capitalize ${
              theme === key ? 'bg-gray-100 dark:bg-gray-700 text-green-600' : 'text-gray-700 dark:text-gray-300'
            }`}
          >
            <div className={`w-4 h-4 rounded-full ${value.bg} border`}></div>
            <span>{value.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}