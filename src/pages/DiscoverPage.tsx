import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

interface Pin {
  id: string;
  user_id: string;
  content: string;
  music_link?: string;
  gif_url?: string;
  sticker?: string;
  created_at: string;
  profiles?: {
    username: string;
  };
}

function DiscoverPage({ session }: { session: any }) {
  const [pins, setPins] = useState<Pin[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAllPins();
  }, []);

  const fetchAllPins = async () => {
    const { data, error } = await supabase
      .from('pins')
      .select(`
        *,
        profiles (username)
      `)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching pins:', error);
    } else {
      setPins(data || []);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <div className="app-container">
      <nav className="navbar">
        <h1>Memory Pinboard</h1>
        <div className="nav-links">
          <Link to="/">Home</Link>
          <Link to={`/profile/${session.user.user_metadata?.username}`}>My Profile</Link>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      <h2 style={{ marginBottom: '20px', color: '#ff6b9d' }}>Discover Memories</h2>
      <p style={{ marginBottom: '30px', color: '#666' }}>
        Explore pins from the community
      </p>

      <div className="pins-grid">
        {pins.map((pin) => (
          <div key={pin.id} className="pin-card">
            <div className="pin-header">
              <Link to={`/profile/${pin.profiles?.username}`} className="pin-username">
                @{pin.profiles?.username || 'Anonymous'}
              </Link>
              <span className="pin-date">{new Date(pin.created_at).toLocaleDateString()}</span>
            </div>

            <p className="pin-content">{pin.content}</p>

            {pin.sticker && <div className="pin-sticker">{pin.sticker}</div>}

            {pin.gif_url && <img src={pin.gif_url} alt="GIF" className="pin-gif" />}

            {pin.music_link && (
              <div className="pin-music">
                🎵 <a href={pin.music_link} target="_blank" rel="noopener noreferrer">
                  Listen to music
                </a>
              </div>
            )}
          </div>
        ))}

        {pins.length === 0 && (
          <p style={{ color: '#666', textAlign: 'center', gridColumn: '1 / -1' }}>
            No pins to discover yet. Be the first to create one!
          </p>
        )}
      </div>
    </div>
  );
}

export default DiscoverPage;
