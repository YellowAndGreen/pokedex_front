
import React, { useState, useEffect } from 'react';
import { useNavigate }  from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { sendVerificationCode, verifyCodeAndGetToken } from '../services/api';
import type { ApiError } from '../types';
import ErrorDisplay from './ErrorDisplay';
import LoadingSpinner from './LoadingSpinner';
import { useAuth } from '../contexts/AuthContext'; // Import useAuth

const LoginPage: React.FC = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const { isAuthenticated, login } = useAuth(); // Use login from AuthContext
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [error, setError] = useState<ApiError | string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isCodeSent, setIsCodeSent] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleGetCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError({ message: 'Please enter your email address.' });
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
        setError({ message: 'Please enter a valid email address.' });
        return;
    }

    setIsSendingCode(true);
    setError(null);
    setSuccessMessage(null);
    try {
      await sendVerificationCode(email);
      setSuccessMessage(`Verification code sent to ${email}. Please check your inbox (and spam folder).`);
      setIsCodeSent(true);
    } catch (err) {
      setError(err as ApiError);
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !code.trim()) {
      setError({ message: 'Please enter both email and verification code.' });
      return;
    }
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const tokenResponse = await verifyCodeAndGetToken(email, code);
      if (tokenResponse && tokenResponse.access_token) {
        login(tokenResponse.access_token); // Use login from context
        navigate('/');
      } else {
        setError({ message: 'Login successful, but no token received.' });
      }
    } catch (err) {
      setError(err as ApiError);
    } finally {
      setIsLoading(false);
    }
  };
  
  const inputClasses = `mt-1 block w-full px-3 py-2 ${theme.input.bg} ${theme.input.border} ${theme.card.rounded} shadow-sm ${theme.input.focusRing} ${theme.input.text} ${theme.input.placeholderText} text-sm sm:text-base`;
  const buttonPrimaryClasses = `w-full px-4 py-2 ${theme.button.primary} ${theme.button.primaryText} ${theme.card.rounded} transition disabled:opacity-70 text-sm sm:text-base flex justify-center items-center`;
  const buttonSecondaryClasses = `w-full px-4 py-2 ${theme.button.secondary} ${theme.button.secondaryText} ${theme.card.rounded} transition disabled:opacity-70 text-sm sm:text-base flex justify-center items-center`;


  return (
    <div className={`min-h-[calc(100vh-10rem)] flex flex-col items-center justify-center ${theme.bg} p-4 animate-fadeInUp`}>
      <div className={`w-full max-w-md p-6 sm:p-8 ${theme.card.bg} ${theme.card.rounded} ${theme.card.shadow} ${theme.card.border || ''}`}>
        <h2 className={`text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8 ${theme.modal.titleText}`}>
          Login / Register
        </h2>
        
        {error && <div className="mb-4"><ErrorDisplay error={error} /></div>}
        {successMessage && (
          <div className={`mb-4 p-3 ${theme.button.primary.replace('bg-', 'bg-').replace('hover:bg-', '')} bg-opacity-20 ${theme.button.primaryText.replace('text-','text-')} text-opacity-80 ${theme.card.rounded} text-sm`} role="alert">
            {successMessage}
          </div>
        )}

        <form onSubmit={isCodeSent ? handleLogin : handleGetCode} className="space-y-5 sm:space-y-6">
          <div>
            <label htmlFor="email" className={`block text-sm font-medium ${theme.card.text}`}>
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com"
              required
              className={inputClasses}
              disabled={isSendingCode || isLoading || isCodeSent}
            />
          </div>

          {isCodeSent && (
            <div className="animate-fadeInUp" style={{animationDuration: '0.3s'}}>
              <label htmlFor="code" className={`block text-sm font-medium ${theme.card.text}`}>
                Verification Code
              </label>
              <input
                type="text"
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Enter 6-digit code"
                required
                minLength={6}
                maxLength={6}
                className={inputClasses}
                disabled={isLoading}
              />
            </div>
          )}
          
          {!isCodeSent ? (
            <button type="submit" disabled={isSendingCode || !email.trim()} className={buttonSecondaryClasses}>
              {isSendingCode ? <LoadingSpinner size="sm"/> : 'Get Verification Code'}
            </button>
          ) : (
             <button type="submit" disabled={isLoading || !code.trim() || code.length < 6} className={buttonPrimaryClasses}>
              {isLoading ? <LoadingSpinner size="sm"/> : 'Login'}
            </button>
          )}
        </form>
        {isCodeSent && (
             <button 
                onClick={() => { 
                    setIsCodeSent(false); 
                    setCode(''); 
                    setError(null); 
                    setSuccessMessage(null);
                }} 
                disabled={isLoading || isSendingCode}
                className={`mt-3 text-xs text-center w-full ${theme.card.secondaryText} hover:underline`}
            >
                Entered wrong email? Change email.
            </button>
        )}
      </div>
    </div>
  );
};

export default LoginPage;