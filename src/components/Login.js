import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MetaApiService } from '../services/metaApi';

function Login() {
  const navigate = useNavigate();
  const META_TOKEN = 'EAAWrZB71ZBz5kBO9ZBgEZCvGmTqfsYEjBRsR4g2oVZBYChMxoZChav0VRBBfL7V3t8tZA1kIGfLVI4AFHWhdFOvkkdlQomWiQ7hcRsNMwuUMoPkyTFUaf7LsmiDfeduZBf5EChoW3b2yaZCOx5WMmZCp8ZA9TqfAjpfcHgjH7cNEicNO7iAEn62pxFK72aUTTOG9wLYQuZBKvAa4Rg5Mr2tN';

  useEffect(() => {
    window.fbAsyncInit = function() {
      window.FB.init({
        appId: '1906862729697329', // App ID dari Meta API
        cookie: true,
        xfbml: true,
        version: 'v18.0'
      });
    };
  }, []);

  const handleFacebookLogin = async () => {
    try {
      // Langsung gunakan token yang sudah ada
      localStorage.setItem('meta_access_token', META_TOKEN);
      
      // Initialize Meta API
      const metaApi = new MetaApiService(META_TOKEN);
      
      // Test API connection
      try {
        const testAudience = await metaApi.searchAudiences('test', {
          gender: 'all',
          age: '18-65',
          placement: 'automatic',
          objective: 'AWARENESS'
        });
        
        console.log('API Connection successful:', testAudience);
        // Redirect ke dashboard jika API berhasil
        navigate('/dashboard');
      } catch (error) {
        console.error('API Test Error:', error);
      }
    } catch (error) {
      console.error('Login Error:', error);
    }
  };

  return (
    <div className="login-container">
      <h2>Meta Ads Manager</h2>
      <div className="social-login">
        <button 
          className="facebook-login-button"
          onClick={handleFacebookLogin}
          type="button"
        >
          Login with Facebook
        </button>
      </div>
    </div>
  );
}

export default Login; 