import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { 
  FiPlusSquare, FiUser, FiMessageSquare, FiSearch, 
  FiBell, FiLogIn, FiUserPlus, FiRadio
} from 'react-icons/fi';
import LanguageSwitcher from './LanguageSwitcher';
import ThemeSwitcher from './ThemeSwitcher';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <nav className="bg-gradient-to-r from-yellow-400 via-green-500 to-blue-600 shadow-lg fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center p-3">
        <Link to="/" className="flex items-center space-x-2">
          <motion.div 
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.5 }}
            className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center"
          >
            <span className="text-2xl">🇷🇼</span>
          </motion.div>
          <span className="text-xl font-black text-white">IwacuHub</span>
        </Link>

        {/* Search Bar - Desktop */}
        <div className="hidden md:flex flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={t('search')}
              onClick={() => navigate('/search')}
              className="w-full pl-10 pr-4 py-2 bg-white/20 text-white placeholder-white/60 rounded-full focus:outline-none focus:ring-2 focus:ring-white cursor-pointer"
            />
          </div>
        </div>

        <div className="flex items-center space-x-1">
          <Link to="/search" className="md:hidden text-white p-2 hover:bg-white/20 rounded-xl transition">
            <FiSearch className="text-xl" />
          </Link>
          
          {user ? (
            <>
              <Link to="/live" className="text-white p-2 hover:bg-white/20 rounded-xl transition relative">
                <FiRadio className="text-xl" />
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              </Link>
              <Link to="/notifications" className="text-white p-2 hover:bg-white/20 rounded-xl transition relative">
                <FiBell className="text-xl" />
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
              </Link>
              <Link to="/upload" className="text-white p-2 hover:bg-white/20 rounded-xl transition">
                <FiPlusSquare className="text-xl" />
              </Link>
              <Link to="/chat" className="text-white p-2 hover:bg-white/20 rounded-xl transition">
                <FiMessageSquare className="text-xl" />
              </Link>
              <Link to="/profile" className="text-white p-2 hover:bg-white/20 rounded-xl transition">
                <FiUser className="text-xl" />
              </Link>
              <button onClick={logout} className="text-white text-sm px-3 py-1 bg-white/20 rounded-lg ml-2">
                {t('logout')}
              </button>
            </>
          ) : (
            <>
              <button onClick={() => navigate('/login')} className="text-white p-2 hover:bg-white/20 rounded-xl transition">
                <FiLogIn className="text-xl" />
              </button>
              <button onClick={() => navigate('/register')} className="text-white p-2 hover:bg-white/20 rounded-xl transition">
                <FiUserPlus className="text-xl" />
              </button>
            </>
          )}
          
          <ThemeSwitcher />
          <LanguageSwitcher />
        </div>
      </div>
      
      {/* Mobile Search Bar */}
      <div className="md:hidden px-3 pb-2">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={t('search')}
            onClick={() => navigate('/search')}
            className="w-full pl-10 pr-4 py-2 bg-white/20 text-white placeholder-white/60 rounded-full focus:outline-none focus:ring-2 focus:ring-white cursor-pointer"
          />
        </div>
      </div>
    </nav>
  );
}