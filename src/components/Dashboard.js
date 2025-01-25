import React, { useEffect, useState } from 'react';
import { MetaApiService } from '../services/metaApi';

function Dashboard() {
  const [audiences, setAudiences] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('meta_access_token');
        const metaApi = new MetaApiService(token);
        
        const result = await metaApi.searchAudiences('test', {
          gender: 'all',
          age: '18-65',
          placement: 'automatic',
          objective: 'AWARENESS'
        });
        
        setAudiences(result);
      } catch (error) {
        console.error('Dashboard Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="dashboard">
      <h1>Meta Ads Dashboard</h1>
      <div className="audience-list">
        {audiences.map(audience => (
          <div key={audience.id} className="audience-card">
            <h3>{audience.name}</h3>
            <p>{audience.description}</p>
            <p>Size: {audience.size.toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard; 