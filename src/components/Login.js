import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MetaApiService } from '../services/metaApi.ts';

function Login() {
  const navigate = useNavigate();

  const handleFacebookLogin = async () => {
    try {
      // Create new instance of MetaApiService (no need to pass token anymore)
      const metaApi = new MetaApiService();
      
      // Test API connection
      try {
        const testAudience = await metaApi.searchAudiences('test', {
          gender: 'all',
          age: '18-65',
          placement: 'automatic',
          objective: 'AWARENESS'
        });
        
        console.log('API Connection successful:', testAudience);
        
        // Store success state in localStorage
        localStorage.setItem('isAuthenticated', 'true');
        
        // Redirect to dashboard
        navigate('/dashboard');
      } catch (error) {
        console.error('API Test Error:', error);
        alert('Failed to connect to Meta API. Please try again.');
      }
    } catch (error) {
      console.error('Login Error:', error);
      alert('Login failed. Please try again.');
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