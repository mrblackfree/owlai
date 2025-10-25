import React, { createContext, useContext, useState } from 'react';
import { useClerk, useUser } from '@clerk/clerk-react';

type ModalType = 'login' | 'signup' | 'verify-email' | 'forgot-password' | 'reset-password' | 'otp' | null;

interface AuthContextType {
  isAuthenticated: boolean;
  user: any;
  currentModal: ModalType;
  userEmail: string;
  openModal: (type: ModalType, email?: string) => void;
  closeModal: () => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentModal, setCurrentModal] = useState<ModalType>(null);
  const [userEmail, setUserEmail] = useState('');
  const { isSignedIn, user } = useUser();
  const { signOut: clerkSignOut } = useClerk();

  const openModal = (type: ModalType, email?: string) => {
    setCurrentModal(type);
    if (email) {
      setUserEmail(email);
    }
  };

  const closeModal = () => {
    setCurrentModal(null);
    setUserEmail('');
  };

  const signOut = async () => {
    await clerkSignOut();
    closeModal();
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: isSignedIn || false,
        user,
        currentModal,
        userEmail,
        openModal,
        closeModal,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 