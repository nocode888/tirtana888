import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

function Login() {
  useEffect(() => {
    // Initialize Facebook SDK
    window.fbAsyncInit = function() {
      window.FB.init({
        appId: 'YOUR_APP_ID', // Replace with your Meta App ID
        cookie: true,
        xfbml: true,
        version: 'v18.0'
      });
    };
  }, []);

  const handleFacebookLogin = () => {
    window.FB.login(function(response) {
      if (response.authResponse) {
        console.log('Welcome! Fetching your information....');
        window.FB.api('/me', function(response) {
          console.log('Good to see you, ' + response.name + '.');
          // Handle successful login here
        });
      } else {
        console.log('User cancelled login or did not fully authorize.');
      }
    }, {scope: 'public_profile,email'});
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      {/* Add your login form here */}
      <form>
        <input type="text" placeholder="Username" />
        <input type="password" placeholder="Password" />
        <button type="submit">Login</button>
      </form>
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

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App; 