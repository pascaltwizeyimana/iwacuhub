import { Link } from 'react-router-dom';
import { FiHome, FiPlusSquare, FiUser, FiMessageSquare, FiVideo, FiPlayCircle } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function Navbar() {
  const { t } = useTranslation();
  const { user, logout } = useContext(AuthContext);

  return (
    <nav className="bg-gradient-to-r from-rwandaBlue to-rwandaGreen/80 backdrop-blur-md border-b border-white/20 fixed w-full top-0 z-50 shadow-2xl">
      <div className="max-w-md mx-auto flex justify-between items-center p-3">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center">
            🇷🇼
          </div>
          <span className="text-xl font-black text-white drop-shadow-lg">IwacuHub</span>
        </Link>

        {/* Navigation */}
        <div className="flex space-x-1">
          <Link to="/" title={t('feed')}>
            <FiHome className="text-white text-2xl p-2 hover:bg-white/20 rounded-xl transition-all" />
          </Link>
          <Link to="/reels" title="Reels">
            <FiVideo className="text-white text-2xl p-2 hover:bg-white/20 rounded-xl transition-all" />
          </Link>
          <Link to="/videos" title="Videos">
            <FiPlayCircle className="text-white text-2xl p-2 hover:bg-white/20 rounded-xl transition-all" />
          </Link>
          <Link to="/upload" title={t('upload')}>
            <FiPlusSquare className="text-white text-2xl p-2 hover:bg-white/20 rounded-xl transition-all" />
          </Link>
          <Link to="/chat" title={t('chat')}>
            <FiMessageSquare className="text-white text-2xl p-2 hover:bg-white/20 rounded-xl transition-all" />
          </Link>
          <Link to="/profile" title={t('profile')}>
            <FiUser className="text-white text-2xl p-2 hover:bg-white/20 rounded-xl transition-all" />
          </Link>
        </div>

        <div className="flex items-center space-x-1">
          <LanguageSwitcher />
          {user && (
            <button onClick={logout} className="text-white text-sm p-1 hover:bg-white/20 rounded">
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}

