import { SignIn, useAuth, useUser } from '@clerk/clerk-react';
import axios from 'axios';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const SignInPage = () => {
  const { isSignedIn, getToken } = useAuth();
  const { user, isLoaded } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    const createUser = async () => {
      if (!isSignedIn || !isLoaded || !user) return;

      try {
        const token = await getToken();

        await axios.post(
          `${BACKEND_URL}/user`,
          {
            id: user.id,
            name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
            email: user.emailAddresses[0]?.emailAddress,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        navigate('/');
      } catch (error) {
        console.error('Error creating user:', error);
      }
    };

    createUser();
  }, [isSignedIn, isLoaded, user, getToken, navigate]);

  if (!isSignedIn) {
    return <SignIn forceRedirectUrl='/' fallbackRedirectUrl="/" />
  }

  return <div>Creating your account...</div>;
};

export default SignInPage;
