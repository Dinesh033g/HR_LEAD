import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { ColorBends } from '../components/ColorBends';
import { ArrowRight, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';

const LoginPage = () => {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-no-repeat flex flex-col items-center justify-center p-4 relative"
      style={{ backgroundImage: `url('/fic_bg.jpg')` }}
    >
      {/* Dark Translucent Glass Backdrop Overlay */}
      <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[3px] pointer-events-none" />

      {/* Login Card with ColorBends background and glassmorphism styling */}
      <div className="w-full max-w-[440px] rounded-[32px] p-8 md:p-10 shadow-2xl shadow-slate-950/60 border border-white/30 relative z-10 overflow-hidden backdrop-blur-xl bg-slate-950/40 text-white">
        {/* ColorBends Canvas dynamic animation inside the login card */}
        <ColorBends
          color="#A855F7"
          speed={0.2}
          frequency={1.0}
          noise={0.15}
          bandWidth={0.14}
          rotation={90}
          fadeTop={0.75}
          iterations={1}
          intensity={1.3}
          className="absolute inset-0 z-0 opacity-40 pointer-events-none"
        />

        {/* Dark solid contrast backplate overlay behind branding */}
        <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-md pointer-events-none z-[1]" />
        
        <div className="relative z-10">
          {/* Yellow Squircle Logo Badge with crisp white background */}
          <div className="w-16 h-16 bg-[#facc15] rounded-2xl mx-auto flex items-center justify-center p-2 shadow-xl shadow-black/50 mb-4 border-2 border-amber-300">
            <img src="/forge_logo.jpg" alt="Forge India Logo" className="w-full h-full object-cover rounded-xl shadow-xs" />
          </div>

          {/* Header Title & Subtitle with high contrast pop */}
          <div className="text-center mb-8">
            <h1 className="font-extrabold text-2xl text-white tracking-tight font-['Outfit'] drop-shadow-md">
              Forge India Connect
            </h1>
            <p className="text-[11px] font-extrabold text-amber-300 tracking-widest uppercase mt-1 drop-shadow-xs">
              SIGN IN TO YOUR ACCOUNT
            </p>
          </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email or Username */}
          <div>
            <label className="block text-xs font-bold text-slate-200 mb-1.5">Email or Username</label>
            <input
              type="email"
              required
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-900/60 border border-white/20 focus:border-[#a855f7] focus:bg-slate-900/90 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-400 focus:outline-none transition-all font-medium"
            />
          </div>

          {/* Password with Eye Toggle */}
          <div>
            <label className="block text-xs font-bold text-slate-200 mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-900/60 border border-white/20 focus:border-[#a855f7] rounded-xl pl-4 pr-10 py-3 text-sm text-white placeholder-slate-400 focus:outline-none transition-all font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5865f2]/70 hover:text-[#5865f2] p-1 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-600 font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#5865f2] hover:bg-[#4752c4] text-white font-bold text-sm py-3.5 rounded-xl shadow-lg shadow-[#5865f2]/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-3"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Authenticating...
              </>
            ) : (
              <>
                Sign In <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
