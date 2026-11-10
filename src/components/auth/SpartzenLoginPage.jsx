import React, { useState } from 'react';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  X, 
  AlertCircle 
} from 'lucide-react';
import { useCrm } from '../../context/CrmContext';
import SportsBallsCorner from './SportsBallsCorner';

export default function SpartzenLoginPage() {
  const { login, addToast, setCurrentPortal } = useCrm();

  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [forgotInput, setForgotInput] = useState('');

  const handleSignIn = (e) => {
    e && e.preventDefault();
    setErrorMsg('');

    if (!emailOrPhone.trim()) {
      setErrorMsg('Please enter your email or mobile number.');
      return;
    }

    if (!password.trim()) {
      setErrorMsg('Please enter your password.');
      return;
    }

    const input = emailOrPhone.toLowerCase().trim();
    let targetRole = 'admin';

    if (input.includes('parent') || input.includes('rohan')) {
      targetRole = 'parent';
    } else if (input.includes('coach') || input.includes('vikram')) {
      targetRole = 'coach';
    } else if (input.includes('support') || input.includes('priya')) {
      targetRole = 'support';
    } else {
      targetRole = 'admin';
    }

    setCurrentPortal(targetRole);
    login(targetRole);
    addToast(`Welcome to ZenConnect! Signed in to ${targetRole.toUpperCase()} Portal.`);
  };

  const handleForgotSubmit = (e) => {
    e.preventDefault();
    if (!forgotInput.trim()) return;
    addToast(`Password recovery instructions dispatched to ${forgotInput}`);
    setIsForgotPasswordOpen(false);
    setForgotInput('');
  };

  const handleQuickPortalLogin = (role) => {
    let email = 'admin@littlespartans.com';
    if (role === 'parent') email = 'parent@littlespartans.com';
    if (role === 'coach') email = 'coach@littlespartans.com';

    setEmailOrPhone(email);
    setPassword('Spartan2026!');
    setErrorMsg('');
    setCurrentPortal(role);
    login(role);
    addToast(`Welcome to ZenConnect! Signed in to ${role.toUpperCase()} Portal.`);
  };

  return (
    <div className="w-full min-h-screen bg-white text-[#172B50] font-sans flex items-center justify-center p-4 sm:p-6 lg:p-10 select-none relative overflow-x-hidden">
      
      {/* ============================================================ */}
      {/* 4K ULTRA-SHARP SPORTS BALLS AT CORNER EDGE OF LOGIN PAGE     */}
      {/* ============================================================ */}
      <div className="absolute bottom-0 left-0 pointer-events-none select-none z-10 p-2 sm:p-4 lg:p-6 animate-float-gentle">
        <SportsBallsCorner 
          position="bottom-left" 
          className="w-[230px] sm:w-[300px] md:w-[360px] lg:w-[420px] max-w-[85vw]" 
        />
      </div>

      {/* Perfectly Centered Split Layout */}
      <div className="w-full max-w-[1060px] mx-auto flex flex-col lg:flex-row items-center justify-center gap-10 lg:gap-14 relative z-10 my-auto">
        
        {/* ============================================================ */}
        {/* LEFT COLUMN: 4K ULTRA-SHARP REDUCED-SIZE LOGO ARTWORK        */}
        {/* ============================================================ */}
        <div className="w-full lg:w-1/2 flex justify-center items-center">
          <img 
            src="/assets/zenconnect-logo-4k-crisp.png" 
            alt="Little Spartans ZenConnect" 
            className="w-full max-w-[340px] sm:max-w-[370px] lg:max-w-[385px] h-auto object-contain pointer-events-none drop-shadow-xs transition-transform hover:scale-[1.02] duration-300"
            style={{ 
              imageRendering: '-webkit-optimize-contrast',
              transform: 'translateZ(0)'
            }}
          />
        </div>

        {/* ============================================================ */}
        {/* RIGHT COLUMN: 4K VECTOR-CRISP NATIVE ZENCONNECT LOGIN CARD   */}
        {/* ============================================================ */}
        <div className="w-full lg:w-1/2 flex justify-center items-center">
          
          <div className="relative w-full max-w-[405px] sm:max-w-[425px] bg-white rounded-[28px] sm:rounded-[32px] border border-[#172B5014] shadow-[0_20px_50px_rgba(23,43,80,0.08),0_4px_16px_rgba(23,43,80,0.03)] px-6 sm:px-8 pt-7 pb-6 overflow-hidden animate-scale-in">
            
            {/* 1. Vector Top-Left Orange Curved Swoosh */}
            <svg 
              className="absolute top-0 left-0 w-24 h-24 pointer-events-none select-none z-0" 
              viewBox="0 0 100 100" 
              fill="none"
            >
              {/* Main swoosh */}
              <path d="M 0 0 L 80 0 C 55 4, 25 20, 8 48 C 3 58, 1 70, 0 85 Z" fill="#F4510B" />
              {/* Accent wave line */}
              <path d="M 0 85 C 3 65, 12 45, 28 30 C 45 15, 68 3, 95 0 L 98 0 C 70 5, 42 20, 24 38 C 8 56, 1 74, 0 92 Z" fill="#F4510B" opacity="0.85" />
            </svg>

            {/* 2. Vector Bottom-Right Orange Curved Swoosh */}
            <svg 
              className="absolute bottom-0 right-0 w-24 h-24 pointer-events-none select-none z-0" 
              viewBox="0 0 100 100" 
              fill="none"
            >
              {/* Main swoosh */}
              <path d="M 100 100 L 20 100 C 45 96, 75 80, 92 52 C 97 42, 99 30, 100 15 Z" fill="#F4510B" />
              {/* Accent wave line */}
              <path d="M 100 15 C 97 35, 88 55, 72 70 C 55 85, 32 97, 5 100 L 2 100 C 30 95, 58 80, 76 62 C 92 44, 99 26, 100 8 Z" fill="#F4510B" opacity="0.85" />
            </svg>

            <div className="relative z-10">
              
              {/* 3. Vector 4K Laurel & Trophy Crest */}
              <div className="flex justify-center mb-1">
                <svg className="w-16 h-12 text-[#F4510B]" viewBox="0 0 68 52" fill="currentColor">
                  {/* Left Laurel Leaves */}
                  <path d="M12 18c-3 4-3 9 0 13-3-2-5-6-4-10 1-2 3-3 4-3zM7 28c-3 3-3 8 0 12-3-3-3-8 0-11 1-1 2-1 0-1zM18 10c-1 3-1 7 1 10-3-1-4-5-4-8 1-2 3-2 3-2zM23 4c0 3 1 6 3 8-2 0-4-3-4-6 0-2 1-3 1-2z" />
                  {/* Right Laurel Leaves */}
                  <path d="M56 18c3 4 3 9 0 13 3-2 5-6 4-10-1-2-3-3-4-3zM61 28c3 3 3 8 0 12 3-3 3-8 0-11-1-1-2-1 0-1zM50 10c1 3 1 7-1 10 3-1 4-5 4-8-1-2-3-2-3-2zM45 4c0 3-1 6-3 8 2 0 4-3 4-6 0-2-1-3-1-2z" />
                  {/* Wreath branch stems */}
                  <path d="M13 41c6 6 14 8 21 8s15-2 21-8" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                  {/* Central Trophy Cup */}
                  <path d="M24 10h20v13c0 6-4.5 10.5-10 10.5S24 29 24 23V10z" />
                  {/* Left Trophy Handle */}
                  <path d="M24 13h-4c-2.5 0-4 2-4 4.5 0 5 3.5 9 8 9v-3c-2.5 0-5-3-5-6 0-1.5 1-2 2-2h3v-2.5z" />
                  {/* Right Trophy Handle */}
                  <path d="M44 13h4c2.5 0 4 2 4 4.5 0 5-3.5 9-8 9v-3c2.5 0 5-3 5-6 0-1.5-1-2-2-2h-3v-2.5z" />
                  {/* Trophy Pedestal Base */}
                  <path d="M32 33.5h4v6h-4zM26 39.5h16v3.5H26z" />
                </svg>
              </div>

              {/* 4. Welcome to ZenConnect Title (Pure Vector Text) */}
              <h2 className="text-[23px] sm:text-[25px] font-extrabold text-[#172B50] tracking-tight text-center font-sans">
                Welcome to ZenConnect
              </h2>
              <svg className="w-36 h-2 mx-auto mt-1" viewBox="0 0 144 8" fill="none">
                <path d="M 4 2 Q 72 8 140 2" stroke="#F4510B" strokeWidth="2.5" strokeLinecap="round" />
              </svg>

              {/* 5. Subtitle (Pure Vector Text) */}
              <p className="text-[12px] sm:text-[12.5px] font-semibold text-[#172B50] text-center mt-2 max-w-[270px] mx-auto leading-snug opacity-80 font-sans">
                Sign in to manage, track and grow the Little Spartans community.
              </p>

              {/* Validation Error Alert */}
              {errorMsg && (
                <div className="w-full mt-3 p-2 bg-[#FFF4E8] border border-[#F4510B] text-[#F4510B] text-xs font-bold rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-1.5 truncate">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{errorMsg}</span>
                  </div>
                  <X className="w-3.5 h-3.5 shrink-0 cursor-pointer hover:opacity-75" onClick={() => setErrorMsg('')} />
                </div>
              )}

              {/* 6. Form with Native 4K Inputs */}
              <form onSubmit={handleSignIn} className="mt-4 space-y-2.5">
                
                {/* Email / Mobile Input */}
                <div className="relative flex items-center bg-white border border-[#CBD5E1] rounded-xl px-3.5 py-2.5 focus-within:border-[#F4510B] focus-within:ring-1 focus-within:ring-[#F4510B] transition-all">
                  <Mail className="w-4 h-4 text-[#172B50] opacity-75 mr-2.5 shrink-0" />
                  <input
                    type="text"
                    value={emailOrPhone}
                    onChange={(e) => {
                      setEmailOrPhone(e.target.value);
                      setErrorMsg('');
                    }}
                    placeholder="Enter your email or mobile number"
                    className="w-full bg-transparent border-0 outline-none text-xs sm:text-[13px] text-[#172B50] font-normal placeholder-[#8A99AD] font-sans"
                    autoComplete="username"
                  />
                </div>

                {/* Password Input */}
                <div className="relative flex items-center bg-white border border-[#CBD5E1] rounded-xl px-3.5 py-2.5 focus-within:border-[#F4510B] focus-within:ring-1 focus-within:ring-[#F4510B] transition-all">
                  <Lock className="w-4 h-4 text-[#172B50] opacity-75 mr-2.5 shrink-0" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setErrorMsg('');
                    }}
                    placeholder="Enter your password"
                    className="w-full bg-transparent border-0 outline-none text-xs sm:text-[13px] text-[#172B50] font-normal placeholder-[#8A99AD] font-sans"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[#8A99AD] hover:text-[#172B50] ml-2 shrink-0 cursor-pointer transition-colors"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4 text-[#F4510B]" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Remember Me & Forgot Password Row */}
                <div className="flex items-center justify-between text-xs pt-0.5 px-0.5 font-sans">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-[#172B50]">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-3.5 h-3.5 rounded border-[#CBD5E1] text-[#F4510B] focus:ring-[#F4510B] accent-[#F4510B] cursor-pointer"
                    />
                    <span className="text-[12px] font-bold text-[#172B50]">Remember me</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => setIsForgotPasswordOpen(true)}
                    className="text-[12px] font-bold text-[#F4510B] hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>

                {/* Sign In CTA Button */}
                <button
                  type="submit"
                  title="Sign in to ZenConnect"
                  className="w-full py-2.5 sm:py-3 bg-[#F4510B] hover:bg-[#E04505] active:scale-[0.99] text-white text-[14px] font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer mt-2 font-sans"
                >
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

              </form>

              {/* Quick 1-Click Portal Access: Admin, Parent, Coach */}
              <div className="mt-3.5 pt-3 border-t border-[#172B5014]">
                <div className="flex items-center justify-between mb-2 px-0.5">
                  <span className="text-[11px] font-bold text-[#172B50] opacity-75 uppercase tracking-wider font-sans">
                    Quick Portal Access
                  </span>
                  <span className="text-[10.5px] font-semibold text-[#F4510B] font-sans">
                    1-Click Launch
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickPortalLogin('admin')}
                    className="py-1.5 px-2 bg-[#FFF4E8] hover:bg-[#F4510B] text-[#172B50] hover:text-white rounded-xl text-[12px] font-bold transition-all border border-[#F4510B26] text-center shadow-xs cursor-pointer active:scale-95 font-sans"
                    title="Launch Admin Portal (Full Academy Management)"
                  >
                    Admin
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickPortalLogin('parent')}
                    className="py-1.5 px-2 bg-[#FFF4E8] hover:bg-[#F4510B] text-[#172B50] hover:text-white rounded-xl text-[12px] font-bold transition-all border border-[#F4510B26] text-center shadow-xs cursor-pointer active:scale-95 font-sans"
                    title="Launch Parent Portal (Children, Classes & Fees)"
                  >
                    Parent
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickPortalLogin('coach')}
                    className="py-1.5 px-2 bg-[#FFF4E8] hover:bg-[#F4510B] text-[#172B50] hover:text-white rounded-xl text-[12px] font-bold transition-all border border-[#F4510B26] text-center shadow-xs cursor-pointer active:scale-95 font-sans"
                    title="Launch Coach Portal (Rosters, Drills & Attendance)"
                  >
                    Coach
                  </button>
                </div>
              </div>

              {/* Divider Line */}
              <div className="w-full h-px bg-[#E2E8F0] mt-3.5 mb-3" />

              {/* Bottom Footer Text (Pure Vector Text) */}
              <p className="text-[11.5px] text-[#485C82] text-center font-sans">
                New to <strong className="font-bold text-[#172B50]">ZenConnect</strong>? Contact your academy administrator.
              </p>

            </div>

          </div>

        </div>

      </div>

      {/* Forgot Password Modal */}
      {isForgotPasswordOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#172B5066] backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 border border-[#172B501A] shadow-dropdown relative font-sans">
            <button
              onClick={() => setIsForgotPasswordOpen(false)}
              className="absolute top-5 right-5 p-1 rounded-xl text-[#172B50] opacity-60 hover:opacity-100 hover:bg-[#FFF4E8] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-black text-[#172B50] tracking-tight">
              Password Recovery
            </h3>
            <p className="text-xs text-[#485C82] mt-1">
              Enter your registered email address or mobile number to receive reset instructions.
            </p>

            <form onSubmit={handleForgotSubmit} className="mt-5 space-y-4">
              <div>
                <label className="text-xs font-bold text-[#172B50] block mb-1">
                  Email or Mobile Number
                </label>
                <input
                  type="text"
                  required
                  value={forgotInput}
                  onChange={(e) => setForgotInput(e.target.value)}
                  placeholder="e.g. director@littlespartans.co.in"
                  className="w-full px-3.5 py-2.5 text-xs font-medium text-[#172B50] placeholder-[#94A3B8] bg-[#FFF4E8]/60 border border-[#CBD5E1] rounded-xl focus:outline-none focus:border-[#F4510B]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsForgotPasswordOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-[#172B50] hover:bg-[#FFF4E8] rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-[#F4510B] text-white rounded-xl shadow-sm hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                >
                  Send Reset Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}