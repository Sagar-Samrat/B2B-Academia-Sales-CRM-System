import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const API_BASE_URL = 'http://localhost:8000/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      // Validate token with backend /auth/me
      fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => {
          if (res.ok) {
            return res.json();
          } else {
            throw new Error('Token invalid or expired');
          }
        })
        .then((data) => {
          setUser(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          // Token is invalid, clear storage
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || 'Failed to login');
      }

      const data = await res.json();
      localStorage.setItem('token', data.access_token);
      setToken(data.access_token);
      setUser(data.user);
      return data.user;
    } catch (err) {
      throw err;
    }
  };

  const signup = async (name, email, password, role) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password, role }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || 'Failed to sign up');
      }

      return await res.json();
    } catch (err) {
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  // Profile update simulator
  const updateProfile = async (updateData) => {
    if (!token) return;
    try {
      // Simulate profile update or handle keys
      // Save gemini_api_key locally or in state for AI
      if (updateData.gemini_api_key !== undefined) {
        localStorage.setItem('gemini_api_key', updateData.gemini_api_key);
      }
      setUser(prev => ({
        ...prev,
        ...updateData
      }));
    } catch (err) {
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        signup,
        logout,
        updateProfile,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
