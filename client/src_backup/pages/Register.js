import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import { FiUser, FiMail, FiLock, FiUserPlus, FiArrowLeft } from "react-icons/fi";

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth(); // Remove authError
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (!username || !email || !password) {
      setError("Please fill in all fields");
      return;
    }
    
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    
    setLoading(true);
    setError("");
    
    const result = await register(username, email, password);
    
    if (result.success) {
      navigate("/");
    } else {
      setError(result.error || "Registration failed");
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-400 via-green-500 to-blue-600 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-64 h-64 bg-yellow-400 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-64 h-64 bg-green-400 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-pulse delay-2000"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-8 max-w-md w-full border border-white/20"
      >
        <Link
          to="/"
          className="absolute top-4 left-4 text-white/70 hover:text-white transition p-2 rounded-lg hover:bg-white/20"
        >
          <FiArrowLeft className="w-5 h-5" />
        </Link>

        <div className="text-center mb-8">
          <motion.div 
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-green-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
          >
            <span className="text-4xl">🇷🇼</span>
          </motion.div>
          <h1 className="text-3xl font-bold text-white mb-2">Join IwacuHub</h1>
          <p className="text-white/80">Create your account</p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-100 text-sm text-center"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="relative">
            <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60" />
            <input
              type="text"
              placeholder="Username"
              className="w-full pl-10 pr-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="relative">
            <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60" />
            <input
              type="email"
              placeholder="Email address"
              className="w-full pl-10 pr-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="relative">
            <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60" />
            <input
              type="password"
              placeholder="Password (min. 6 characters)"
              className="w-full pl-10 pr-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="relative">
            <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60" />
            <input
              type="password"
              placeholder="Confirm Password"
              className="w-full pl-10 pr-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-yellow-400 via-green-500 to-blue-600 text-white font-bold py-3 rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Creating account...
              </div>
            ) : (
              <span className="flex items-center justify-center">
                <FiUserPlus className="mr-2" /> Create Account
              </span>
            )}
          </motion.button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-white/70 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-yellow-300 font-semibold hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}