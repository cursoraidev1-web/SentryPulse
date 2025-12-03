import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth, User } from '../auth';

export function useAuth(requireAuth = false) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await auth.getCurrentUser();
      setUser(currentUser);
      setLoading(false);

      if (requireAuth && !currentUser) {
        router.push('/login');
      }
    };

    loadUser();
  }, [requireAuth, router]);

  return { user, loading, isAuthenticated: !!user };
}
