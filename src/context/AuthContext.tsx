import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Data pengguna default untuk demo
const defaultUsers = [
  {
    id: '1',
    name: 'Admin Sistem',
    email: 'admin@rapat.com',
    password: 'admin123',
    role: 'admin' as const,
    createdAt: new Date()
  },
  {
    id: '2',
    name: 'John Doe',
    email: 'john@rapat.com',
    password: 'user123',
    role: 'user' as const,
    createdAt: new Date()
  },
  {
    id: '3',
    name: 'Jane Smith',
    email: 'jane@rapat.com',
    password: 'user123',
    role: 'user' as const,
    createdAt: new Date()
  }
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = () => {
      try {
        // Inisialisasi data pengguna default jika belum ada
        const existingUsers = localStorage.getItem('users');
        if (!existingUsers) {
          localStorage.setItem('users', JSON.stringify(defaultUsers));
        }

        // Cek sesi pengguna yang tersimpan
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        localStorage.removeItem('user');
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      if (!email || !password) {
        throw new Error('Email dan password wajib diisi');
      }

      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const foundUser = users.find((u: any) => 
        u.email.toLowerCase() === email.toLowerCase() && u.password === password
      );
      
      if (foundUser) {
        const userWithoutPassword = { 
          id: foundUser.id,
          name: foundUser.name,
          email: foundUser.email,
          role: foundUser.role,
          createdAt: foundUser.createdAt
        };
        
        setUser(userWithoutPassword);
        localStorage.setItem('user', JSON.stringify(userWithoutPassword));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      if (!name || !email || !password) {
        throw new Error('Semua field wajib diisi');
      }

      const users = JSON.parse(localStorage.getItem('users') || '[]');
      
      // Cek apakah email sudah digunakan
      if (users.some((u: any) => u.email.toLowerCase() === email.toLowerCase())) {
        return false;
      }

      const newUser = {
        id: Date.now().toString(),
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password,
        role: 'user' as const,
        createdAt: new Date()
      };

      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));

      const userWithoutPassword = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        createdAt: newUser.createdAt
      };
      
      setUser(userWithoutPassword);
      localStorage.setItem('user', JSON.stringify(userWithoutPassword));
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};