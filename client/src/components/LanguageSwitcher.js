import { useTranslation } from 'react-i18next';
import { FiGlobe } from 'react-icons/fi';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'kin', name: 'Kinyarwanda', flag: '🇷🇼' },
  ];

  const changeLanguage = (langCode) => {
    i18n.changeLanguage(langCode);
    localStorage.setItem('language', langCode);
  };

  return (
    <div className="relative group">
      <button className="flex items-center gap-2 text-white hover:bg-white/20 rounded-lg px-3 py-2 transition">
        <FiGlobe className="w-5 h-5" />
        <span className="text-sm hidden sm:inline">
          {languages.find(l => l.code === i18n.language)?.name || 'English'}
        </span>
      </button>
      
      <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => changeLanguage(lang.code)}
            className={`w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition ${
              i18n.language === lang.code ? 'bg-gray-100 dark:bg-gray-700 text-green-600' : 'text-gray-700 dark:text-gray-300'
            }`}
          >
            <span className="text-xl">{lang.flag}</span>
            <span>{lang.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}