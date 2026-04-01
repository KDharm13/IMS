import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogIn, KeyRound, User, Lock, Layout, ShieldCheck } from 'lucide-react';
import emailjs from 'emailjs-com';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);
  const [forgotPasswordStep, setForgotPasswordStep] = useState(0);
  const [newPassword, setNewPassword] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [userOtp, setUserOtp] = useState('');
  const [pendingUser, setPendingUser] = useState(null);
  
  const { login, finalizeLogin, verifyUserEmail, checkUserExists, updatePassword } = useAuth();
  const navigate = useNavigate();

  const handleCredentialsSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const user = await login(email, password);
      // Admin bypasses OTP. Verified users bypass OTP.
      // (Using strictly false so older existing accounts don't get locked out)
      if (user.role === 'admin' || user.isVerified !== false) {
        finalizeLogin(user);
        navigate('/');
        return;
      }
      
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(otp);
      setPendingUser(user);

      // --- EMAILJS CONFIGURATION ---
      const SERVICE_ID = 'service_foh4x9q';
      const TEMPLATE_ID = 'template_j43olo7';
      const PUBLIC_KEY = 'F6xajPiLsbCrWQRL8';

      try {
        await emailjs.send(SERVICE_ID, TEMPLATE_ID, {
          to_email: email,
          otp_code: otp,
          to_name: user.name
        }, PUBLIC_KEY);
      } catch (err) {
        console.error("EmailJS sending failed:", err);
        console.log("PRESENTATION OTP FALLBACK: " + otp);
        alert("EmailJS Failed to send the email.\nError: " + (err.text || err.message) + "\n\nFallback OTP for testing: " + otp);
      }

      setStep(2);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (userOtp === generatedOtp) {
      try {
        await verifyUserEmail(pendingUser.id);
        const verifiedUser = { ...pendingUser, isVerified: true };
        finalizeLogin(verifiedUser);
        navigate('/');
      } catch (err) {
        setError('Error verifying email. Please try again.');
        console.error(err);
      }
    } else {
      setError('Invalid OTP code. Please try again.');
    }
  };

  const handleForgotEmailSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const user = await checkUserExists(email);
      setPendingUser(user);

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(otp);

      const SERVICE_ID = 'service_foh4x9q';
      const TEMPLATE_ID = 'template_j43olo7';
      const PUBLIC_KEY = 'F6xajPiLsbCrWQRL8';

      try {
        await emailjs.send(SERVICE_ID, TEMPLATE_ID, {
          to_email: email,
          otp_code: otp,
          to_name: user.name
        }, PUBLIC_KEY);
      } catch (err) {
        console.error("EmailJS sending failed:", err);
        console.log("PRESENTATION OTP FALLBACK: " + otp);
        alert("EmailJS Failed to send the email.\nError: " + (err.text || err.message) + "\n\nFallback OTP for testing: " + otp);
      }

      setForgotPasswordStep(2);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleForgotOtpSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (userOtp === generatedOtp) {
      setForgotPasswordStep(3);
      setUserOtp('');
    } else {
      setError('Invalid OTP code. Please try again.');
    }
  };

  const handleNewPasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await updatePassword(pendingUser.id, newPassword);
      alert('Password updated successfully! You can now log in.');
      setForgotPasswordStep(0);
      setNewPassword('');
      setPassword('');
      setUserOtp('');
    } catch (err) {
      setError('Failed to update password. Please try again.');
    }
  };

  return (
    <div className="login-split-layout">
      {/* Left Interface Layer */}
      <div className="login-left">
        <div className="login-logo">
          <div className="login-logo-icon">
            <Layout size={16} />
          </div>
          RDB Internship Portal
        </div>

        <div className="login-form-wrapper">
          <div className="login-avatar">
            <User size={36} />
          </div>

          {forgotPasswordStep > 0 ? (
            <>
              {forgotPasswordStep === 1 && (
                <>
                  <h2 style={{ textAlign: 'center', fontFamily: '"Outfit", sans-serif', marginBottom: '0.5rem' }}>Reset Password</h2>
                  <p style={{ textAlign: 'center', marginBottom: '1.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Enter your registered email to receive a reset code.</p>
                  {error && <div style={{ color: 'red', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}
                  <form onSubmit={handleForgotEmailSubmit}>
                    <div className="login-input-wrapper">
                      <User size={18} color="var(--text-muted)" />
                      <input 
                        type="email" 
                        placeholder="USERNAME (EMAIL)"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required 
                      />
                    </div>
                    <button type="submit" className="login-btn" style={{ marginBottom: '1rem' }}>SEND RESET CODE</button>
                    <button type="button" className="login-btn" style={{ background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border)' }} onClick={() => { setForgotPasswordStep(0); setError(''); }}>BACK TO LOGIN</button>
                  </form>
                </>
              )}
              {forgotPasswordStep === 2 && (
                <>
                  <h2 style={{ textAlign: 'center', fontFamily: '"Outfit", sans-serif', marginBottom: '0.5rem' }}>Verify Reset Code</h2>
                  <p style={{ textAlign: 'center', marginBottom: '1.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>We've sent a 6-digit code to <br/><strong>{email}</strong></p>
                  {error && <div style={{ color: 'red', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}
                  <form onSubmit={handleForgotOtpSubmit}>
                    <div className="login-input-wrapper" style={{ justifyContent: 'center' }}>
                      <ShieldCheck size={18} color="var(--text-muted)" />
                      <input 
                        type="text" 
                        maxLength={6}
                        placeholder="000000"
                        style={{ textAlign: 'center', letterSpacing: '8px', fontSize: '1.2rem', fontWeight: 'bold', paddingLeft: 0, width: '150px' }}
                        value={userOtp}
                        onChange={(e) => setUserOtp(e.target.value)}
                        required 
                      />
                    </div>
                    <button type="submit" className="login-btn" style={{ marginBottom: '1rem' }}>VERIFY CODE</button>
                    <button type="button" className="login-btn" style={{ background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border)' }} onClick={() => { setForgotPasswordStep(1); setError(''); setUserOtp(''); }}>GO BACK</button>
                  </form>
                </>
              )}
              {forgotPasswordStep === 3 && (
                <>
                  <h2 style={{ textAlign: 'center', fontFamily: '"Outfit", sans-serif', marginBottom: '0.5rem' }}>Set New Password</h2>
                  <p style={{ textAlign: 'center', marginBottom: '1.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Must be secure and easy to remember.</p>
                  {error && <div style={{ color: 'red', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}
                  <form onSubmit={handleNewPasswordSubmit}>
                    <div className="login-input-wrapper">
                      <Lock size={18} color="var(--text-muted)" />
                      <input 
                        type="password" 
                        placeholder="NEW PASSWORD"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required 
                      />
                    </div>
                    <button type="submit" className="login-btn" style={{ marginBottom: '1rem' }}>UPDATE PASSWORD</button>
                  </form>
                </>
              )}
            </>
          ) : step === 1 ? (
            <>
              {error && <div style={{ color: 'red', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}
              <form onSubmit={handleCredentialsSubmit}>
                <div className="login-input-wrapper">
                  <User size={18} color="var(--text-muted)" />
                  <input 
                    type="email" 
                    placeholder="USERNAME (EMAIL)"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required 
                  />
                </div>
                <div className="login-input-wrapper">
                  <Lock size={18} color="var(--text-muted)" />
                  <input 
                    type="password" 
                    placeholder="PASSWORD"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required 
                  />
                </div>
                
                <button type="submit" className="login-btn">
                  LOGIN
                </button>

                <div className="login-meta">
                  <label><input type="checkbox" /> Remember me</label>
                  <a href="#" onClick={(e) => { e.preventDefault(); setForgotPasswordStep(1); setError(''); }}>Forgot your password?</a>
                </div>

                <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.9rem', color: 'var(--text-main)' }}>
                  Don't have an account? <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 'bold', textDecoration: 'none' }}>Sign up</Link>
                </div>
              </form>
            </>
          ) : (
            <>
              <h2 style={{ textAlign: 'center', fontFamily: '"Outfit", sans-serif', marginBottom: '0.5rem' }}>Verify Email</h2>
              <p style={{ textAlign: 'center', marginBottom: '1.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                We've sent a 6-digit code to <br/><strong>{email}</strong>
              </p>
              {error && <div style={{ color: 'red', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}
              <form onSubmit={handleOtpSubmit}>
                <div className="login-input-wrapper" style={{ justifyContent: 'center' }}>
                  <ShieldCheck size={18} color="var(--text-muted)" />
                  <input 
                    type="text" 
                    maxLength={6}
                    placeholder="000000"
                    style={{ textAlign: 'center', letterSpacing: '8px', fontSize: '1.2rem', fontWeight: 'bold', paddingLeft: 0, width: '150px' }}
                    value={userOtp}
                    onChange={(e) => setUserOtp(e.target.value)}
                    required 
                  />
                </div>
                <button type="submit" className="login-btn" style={{ marginBottom: '1rem' }}>
                  VERIFY
                </button>
                <button 
                  type="button" 
                  className="login-btn"
                  style={{ background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
                  onClick={() => { setStep(1); setError(''); setUserOtp(''); }}
                >
                  BACK TO LOGIN
                </button>
              </form>
            </>
          )}

          <div style={{ marginTop: 'auto', paddingTop: '2rem', display: 'flex', justifyContent: 'center', gap: '0.25rem' }}>
            <span style={{ height: '6px', width: '6px', backgroundColor: 'var(--text-muted)', borderRadius: '50%' }}></span>
            <span style={{ height: '6px', width: '6px', backgroundColor: 'var(--text-muted)', borderRadius: '50%' }}></span>
            <span style={{ height: '6px', width: '6px', backgroundColor: 'var(--text-muted)', borderRadius: '50%' }}></span>
          </div>
        </div>
      </div>

      {/* Right Presentation Layer */}
      <div className="login-right">
        <div className="login-nav">

          <Link to="/register" style={{ textDecoration: 'none' }}>
            <button className="login-nav-btn">SIGN UP</button>
          </Link>
        </div>

        <div className="welcome-text">
          <h1>Welcome.</h1>
          <p>Internship Management System portal. Join our robust network of opportunities or discover top talent.</p>
          <div style={{ marginTop: '2rem', display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
            Not a member? <Link to="/register" style={{ color: 'white', fontWeight: 'bold' }}>Sign up now</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
