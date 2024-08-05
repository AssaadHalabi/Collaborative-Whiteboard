import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';

export const useAuth = (protect = false) => {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [email, setEmail] = useState("");
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data, status } = await api.get('/api/check-auth');
        setAuthenticated(true);
        if (status === 200) setEmail(data.email)
      } catch (error: any) {
        setAuthenticated(false);
        if (error.cause === 401) {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
          }
          if(protect) router.push("/authentication")
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  return { loading, authenticated, email };
};

export default useAuth;
