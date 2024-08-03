import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';

export const useAuth = () => {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await api.get('/api/check-auth');
        setAuthenticated(true);
        alert(JSON.stringify(response))
      } catch (error) {
        setAuthenticated(false);
        console.log(error);
        
        // router.push('/login');  // Redirect to login page if not authenticated
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  return { loading, authenticated };
};

export default useAuth;
