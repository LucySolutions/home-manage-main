import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types';
import { auth } from '@/lib/firebase';
import { login as apiLogin, registerConstructora, getConstructoraByUser, setAuthToken, syncAuthUser } from '@/lib/api';
import type { AuthLoginResponse, BackendUser } from '@/lib/api';

// Tipo mínimo para respuestas de constructora desde el backend
type ConstructoraRes = { id?: string };
import { signOut } from 'firebase/auth';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, companyName: string, phone?: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

// Sin OTP: no reCAPTCHA ni phone auth

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular verificación de sesión
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Sin OTP: no configuración especial en desarrollo

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const resp: AuthLoginResponse = await apiLogin(email, password);
      const backendUser: BackendUser = (resp.user ?? {}) as BackendUser;

      // Intentar obtener constructora ligada al usuario (si existe en Supabase)
      let constructoraId: string | undefined;
      try {
        if (backendUser.id) {
          const constructora = (await getConstructoraByUser(backendUser.id)) as ConstructoraRes;
          constructoraId = constructora?.id;
        }
      } catch {
        void 0; // noop
      }

      const role = backendUser.user_type === 'constructora' ? 'constructora' : backendUser.user_type === 'residente' ? 'residente' : 'residente';
      const loggedUser: User = {
        id: backendUser.firebase_uid || backendUser.id || `user-${Date.now()}`,
        email: backendUser.email || email,
        name: backendUser.name || 'Usuario',
        role,
        constructoraId,
      };

      setUser(lockedUserFix(loggedUser));
      localStorage.setItem('user', JSON.stringify(lockedUserFix(loggedUser)));
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, companyName: string, phone?: string) => {
    setLoading(true);
    try {
      // Registro en backend: crea usuario en Firebase y Supabase, y entidad constructora
      await registerConstructora({ email, password, companyName, telefono: phone });
      // Iniciar sesión para obtener tokens
      const resp: AuthLoginResponse = await apiLogin(email, password);
      const backendUser: BackendUser = (resp.user ?? {}) as BackendUser;
      let constructoraId: string | undefined;
      try {
        if (backendUser.id) {
          const constructora = (await getConstructoraByUser(backendUser.id)) as ConstructoraRes;
          constructoraId = constructora?.id;
        }
      } catch {
        void 0; // noop
      }

      const newUser: User = {
        id: backendUser.firebase_uid || backendUser.id || `const-${Date.now()}`,
        email: backendUser.email || email,
        name: companyName,
        role: 'constructora',
        constructoraId,
      };

      setUser(lockedUserFix(newUser));
      localStorage.setItem('user', JSON.stringify(lockedUserFix(newUser)));
    } finally {
      setLoading(false);
    }
  };

  // Sin OTP: flujo únicamente por email/password

  const logout = () => {
    signOut(auth).catch(() => undefined);
    setUser(null);
    localStorage.removeItem('user');
    setAuthToken(null);
  };

  function lockedUserFix(u: User): User {
    // Asegura que campos opcionales existan para evitar errores en el resto de la app
    return { ...u, phone: u.phone, residenteId: u.residenteId };
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
