import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    !!localStorage.getItem('access_token')
  );
  const navigate = useNavigate();
  const location = useLocation(); // To track location changes for re-check

  useEffect(() => {
    // This effect ensures isAuthenticated is synced if localStorage changes directly
    // or on navigation events (e.g. after login/logout).
    const checkAuthStatus = () => {
      setIsAuthenticated(!!localStorage.getItem('access_token'));
    };

    checkAuthStatus(); // Check on initial mount and location change

    window.addEventListener('storage', checkAuthStatus); // Listen for direct localStorage changes from other tabs/windows

    // Custom event listener for in-app token changes (e.g. if not using context's login/logout everywhere)
    // This is a fallback, prefer using context's login/logout.
    const handleTokenChange = () => checkAuthStatus();
    window.addEventListener('tokenChanged', handleTokenChange);

    return () => {
      window.removeEventListener('storage', checkAuthStatus);
      window.removeEventListener('tokenChanged', handleTokenChange);
    };
  }, [location.pathname]); // Re-check on path change as well

  const login = (token: string) => {
    localStorage.setItem('access_token', token);
    setIsAuthenticated(true);
    window.dispatchEvent(new Event('tokenChanged')); // Notify other parts if needed
    // navigate('/'); // Or to a specific post-login page
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    setIsAuthenticated(false);
    window.dispatchEvent(new Event('tokenChanged')); // Notify other parts if needed
    navigate('/');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
