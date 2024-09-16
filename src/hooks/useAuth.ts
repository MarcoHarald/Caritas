import { useState, useEffect } from 'react';
import { getAuth, signInAnonymously, User } from 'firebase/auth';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async () => {
    const auth = getAuth();
    try {
      await signInAnonymously(auth);
    } catch (error) {
      console.error('Error signing in:', error);
    }
  };

  return { user, signIn };
};