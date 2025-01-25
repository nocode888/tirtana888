import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MetaApiService } from '../services/metaApi.ts';

function Login() {
  const navigate = useNavigate();

  const handleFacebookLogin = async () => {
    try {
      const metaApi = new MetaApiService();
      
      try {
        const testAudience = await metaApi.searchAudiences('test', {
          gender: 'all',
          age: '18-65',
          placement: 'automatic',
          objective: 'AWARENESS'
        });
        
        console.log('API Response:', testAudience);
        
        if (Array.isArray(testAudience) && testAudience.length > 0) {
          localStorage.setItem('isAuthenticated', 'true');
          navigate('/dashboard');
        } else {
          throw new Error('No data received from API');
        }
      } catch (error) {
        console.error('API Error Details:', error);
        alert(error.message || 'Failed to connect to Meta API. Please try again.');
      }
    } catch (error) {
      console.error('Login Error:', error);
      alert('Login failed. Please check console for details.');
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