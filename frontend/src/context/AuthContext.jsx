import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  apiLogin,
  apiVerifySession,
  getAuthToken,
  setAuthToken,
  getStoredUser,
  setStoredUser
} from '../services/api.js';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredUser());
  const [token, setToken] = useState(() => getAuthToken());
  const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(getAuthToken()));
  const [isLoading, setIsLoading] = useState(() => !getAuthToken());
  const [error, setError] = useState(null);

  // Validate session on application startup
  useEffect(() => {
    let isMounted = true;

    async function validateSession() {
      const storedToken = getAuthToken();

      // Missing token -> redirect directly to Login
      if (!storedToken) {
        if (isMounted) {
          setIsAuthenticated(false);
          setUser(null);
          setToken(null);
          setIsLoading(false);
        }
        return;
      }

      try {
        const res = await apiVerifySession();
        if (isMounted && res.success && res.user) {
          setUser(res.user);
          setToken(storedToken);
          setStoredUser(res.user);
          setIsAuthenticated(true);
        } else {
          throw new Error('Session verification failed');
        }
      } catch (err) {
        // Invalid or expired token -> purge session and force Login
        console.warn('[AuthContext] Session invalid or expired, redirecting to login:', err.message);
        setAuthToken(null);
        setStoredUser(null);
        if (isMounted) {
          setUser(null);
          setToken(null);
          setIsAuthenticated(false);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    validateSession();

    // Prevent browser Back button from accessing dashboard after logout
    const handlePopState = () => {
      const currentToken = getAuthToken();
      if (!currentToken) {
        setIsAuthenticated(false);
        setUser(null);
        setToken(null);
      }
    };
    window.addEventListener('popstate', handlePopState);

    return () => {
      isMounted = false;
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const login = async (email, password) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiLogin(email, password);
      if (res.success && res.token) {
        setUser(res.user);
        setToken(res.token);
        setIsAuthenticated(true);
        // Replace history state to lock in authenticated state
        window.history.replaceState({ authenticated: true }, '', window.location.pathname);
        return true;
      } else {
        setError(res.message || 'Login failed');
        return false;
      }
    } catch (err) {
      setError(err.message || 'Authentication error');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setAuthToken(null);
    setStoredUser(null);
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    // Push new history state and redirect so browser Back does not restore session
    window.history.pushState(null, '', window.location.pathname);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isLoading,
        error,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
