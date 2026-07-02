import { createContext, useContext, useState, ReactNode } from 'react';
import { AuthContextType } from '../types/index';

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<string | null>(
    localStorage.getItem('username') || null
  );

  const login = (token: string, username: string): void => {
    localStorage.setItem('token', token);
    localStorage.setItem('username', username);
    setUser(username);
  };

  const logout = (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};