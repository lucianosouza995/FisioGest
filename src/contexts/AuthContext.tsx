import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from '../services/firebase.ts';
import { COLLECTIONS, type UserProfile, type Clinic } from '../services/collections.ts';

export type UserRole = 'admin' | 'secretary';

interface AuthContextType {
  user: User | { uid: string; email: string; displayName?: string } | null;
  role: UserRole;
  userProfile: UserProfile | null;
  tenantId: string | null;
  loading: boolean;
  isFirebaseActive: boolean;
  login: (email: string, password?: string) => Promise<void>;
  logout: () => Promise<void>;
  switchRole: (newRole: UserRole) => void;
  updatePixKey: (newPixKey: string) => void;
}

// Perfis mockados agora possuem um tenantId compartilhado
const MOCK_TENANT_ID = 'tenant_demo_01';

const DEFAULT_ADMIN_PROFILE: UserProfile = {
  uid: 'usr_fisio_admin_01',
  tenantId: MOCK_TENANT_ID,
  name: 'Dr. Lucas Ferreira',
  email: 'lucas.fisio@fisiogest.com.br',
  role: 'admin',
  phone: '11988887777',
};

const DEFAULT_SECRETARY_PROFILE: UserProfile = {
  uid: 'usr_secretaria_02',
  tenantId: MOCK_TENANT_ID,
  name: 'Mariana Silva',
  email: 'mariana.recepcao@fisiogest.com.br',
  role: 'secretary',
  phone: '11977776666',
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | { uid: string; email: string; displayName?: string } | null>(null);
  const [role, setRole] = useState<UserRole>('admin');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isFirebaseConfigured && auth && db) {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser && db) {
          setUser(firebaseUser);
          try {
            const userDocRef = doc(db, COLLECTIONS.USERS, firebaseUser.uid);
            const userDocSnap = await getDoc(userDocRef);

            if (userDocSnap.exists()) {
              const data = userDocSnap.data() as UserProfile;
              setRole(data.role || 'secretary');
              setUserProfile(data);
              setTenantId(data.tenantId);
            } else {
              // Simulação de Onboarding: Cria Tenant e Admin no primeiro login
              const newTenantId = `tenant_${firebaseUser.uid}`;

              const newClinic: Clinic = {
                id: newTenantId,
                name: 'Clínica Padrão',
                pixKey: firebaseUser.email || 'chave-pix-padrao',
                plan: 'free',
                active: true,
                createdAt: new Date().toISOString()
              };

              const initialProfile: UserProfile = {
                uid: firebaseUser.uid,
                tenantId: newTenantId,
                name: firebaseUser.displayName || 'Fisioterapeuta',
                email: firebaseUser.email || '',
                role: 'admin',
              };

              // CORREÇÃO: Salvar o Usuário PRIMEIRO para validar as regras do Firebase
              await setDoc(userDocRef, initialProfile);

              // DEPOIS salva a clínica (agora as regras vão encontrar o perfil admin)
              await setDoc(doc(db, COLLECTIONS.CLINICS, newTenantId), newClinic);

              setRole('admin');
              setUserProfile(initialProfile);
              setTenantId(newTenantId);
            }
          } catch (err) {
            console.error('[AuthContext] Erro ao carregar perfil:', err);
            // Trava de segurança: Garante que o sistema não trave se a internet cair
            setRole('admin');
            setTenantId(`tenant_${firebaseUser.uid}`);
          }
        } else {
          setUser(null);
          setUserProfile(null);
          setTenantId(null);
        }
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      // Modo Demonstração
      const savedSession = localStorage.getItem('fisiogest_demo_auth');
      if (savedSession) {
        try {
          const parsed = JSON.parse(savedSession);
          setUser({ uid: parsed.uid, email: parsed.email, displayName: parsed.name });
          setRole(parsed.role || 'admin');
          setUserProfile(parsed);
          setTenantId(parsed.tenantId);
        } catch (e) {
          // ignore
        }
      }
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password = 'password123') => {
    setLoading(true);
    try {
      if (isFirebaseConfigured && auth) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const isSecretary = email.toLowerCase().includes('sec') || email.toLowerCase().includes('recep');
        const selectedProfile = isSecretary ? { ...DEFAULT_SECRETARY_PROFILE, email } : { ...DEFAULT_ADMIN_PROFILE, email };

        setUser({
          uid: selectedProfile.uid,
          email: selectedProfile.email,
          displayName: selectedProfile.name
        });
        setRole(selectedProfile.role);
        setUserProfile(selectedProfile);
        setTenantId(selectedProfile.tenantId);
        localStorage.setItem('fisiogest_demo_auth', JSON.stringify(selectedProfile));
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      if (isFirebaseConfigured && auth) {
        await firebaseSignOut(auth);
      }
      setUser(null);
      setUserProfile(null);
      setTenantId(null);
      localStorage.removeItem('fisiogest_demo_auth');
    } finally {
      setLoading(false);
    }
  };

  const switchRole = (newRole: UserRole) => {
    const updatedProfile = newRole === 'admin'
      ? { ...DEFAULT_ADMIN_PROFILE }
      : { ...DEFAULT_SECRETARY_PROFILE };

    setRole(newRole);
    setUserProfile(updatedProfile);
    setTenantId(updatedProfile.tenantId);

    if (user) {
      setUser({
        uid: updatedProfile.uid,
        email: updatedProfile.email,
        displayName: updatedProfile.name
      });
      localStorage.setItem('fisiogest_demo_auth', JSON.stringify(updatedProfile));
    }
  };

  const updatePixKey = (newPixKey: string) => {
    console.log('Update PIX key for tenant:', tenantId, newPixKey);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        userProfile,
        tenantId,
        loading,
        isFirebaseActive: isFirebaseConfigured,
        login,
        logout,
        switchRole,
        updatePixKey
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider');
  }
  return context;
};