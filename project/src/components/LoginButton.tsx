import React, { useEffect, useState } from 'react';
import { LogIn, LogOut } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

declare global {
  interface Window {
    FB: any;
    fbAsyncInit: () => void;
  }
}

export const LoginButton: React.FC = () => {
  const { login, logout, isAuthenticated } = useAuthStore();
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('initializing');
  const [jssdkError, setJssdkError] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const loadFacebookSDK = () => {
      try {
        const script = document.createElement('script');
        script.src = 'https://connect.facebook.net/en_US/sdk.js';
        script.async = true;
        script.defer = true;
        
        script.onload = () => {
          window.FB.init({
            appId: '1596472587898777',
            cookie: true,
            xfbml: true,
            version: 'v18.0'
          });
          
          window.FB.getLoginStatus((response: any) => {
            setStatus(response.status);
            setJssdkError(false);
            
            if (response.status === 'connected') {
              login(response.authResponse.accessToken);
            }
          });
          
          setIsSDKLoaded(true);
        };

        document.body.appendChild(script);
      } catch (err) {
        console.error('Error during SDK initialization:', err);
        setJssdkError(true);
      }
    };

    loadFacebookSDK();
  }, [login]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      if (window.FB) {
        await new Promise<void>((resolve) => {
          window.FB.logout(() => {
            resolve();
          });
        });
      }
      logout();
      setStatus('not_authorized');
      window.location.reload();
    } catch (err) {
      console.error('Logout error:', err);
      setError('Failed to logout. Please try again.');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleLogin = () => {
    if (jssdkError) {
      return;
    }

    setError(null);
    
    if (!isSDKLoaded) {
      setError('Facebook SDK is still loading. Please try again in a moment.');
      return;
    }

    try {
      window.FB.login(
        (response: any) => {
          if (response.authResponse) {
            login(response.authResponse.accessToken);
            setStatus('connected');
          } else {
            setError('Login was cancelled or failed');
            setStatus('not_authorized');
          }
        },
        { 
          scope: 'public_profile,email,ads_management,ads_read,business_management',
          return_scopes: true
        }
      );
    } catch (err) {
      console.error('Facebook login error:', err);
      setError('Failed to initialize login. Please try again.');
    }
  };

  if (jssdkError) {
    return (
      <div className="max-w-md w-full mx-auto bg-white rounded shadow-sm">
        <div className="bg-[#3b5998] text-white p-3 flex items-center gap-2 rounded-t">
          <img 
            src="https://static.xx.fbcdn.net/rsrc.php/v3/y2/r/yvbqZOJed1M.png" 
            alt="Facebook" 
            className="h-5"
          />
          <span>Facebook</span>
        </div>
        <div className="p-4">
          <p className="text-sm mb-4">
            Log in to use your Facebook account with <span className="font-semibold">bold io</span>.
          </p>
          <div className="bg-[#ffebe8] border border-[#dd3c10] text-[#333333] p-3 text-sm rounded">
            <div className="font-bold mb-1">JSSDK option is not toggled</div>
            <p>Please toggle the "Log in with JavaScript SDK" option to Yes in developers.facebook.com to use the JSSDK for Login.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-2">
      {isAuthenticated ? (
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">Connected to Meta</span>
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
              isLoggingOut
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-red-600 text-white hover:bg-red-700'
            } transition-colors`}
          >
            <LogOut size={20} />
            <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
          </button>
        </div>
      ) : (
        <button
          onClick={handleLogin}
          disabled={!isSDKLoaded || jssdkError}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            isSDKLoaded && !jssdkError
              ? 'bg-[#3b5998] hover:bg-[#2d4373] text-white'
              : 'bg-gray-300 cursor-not-allowed text-gray-600'
          }`}
        >
          <LogIn size={20} />
          <span>Connect Meta Account</span>
        </button>
      )}
      {error && !jssdkError && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      {status === 'connected' && !error && (
        <p className="text-sm text-green-600">Successfully connected to Meta</p>
      )}
    </div>
  );
};