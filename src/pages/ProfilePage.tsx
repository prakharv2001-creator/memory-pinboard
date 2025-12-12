import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

interface Pin {
  id: string;
  user_id: string;
  content: string;
  music_link?: string;
  gif_url?: string;
  sticker?: string;
  created_at: string;
}

function ProfilePage({ session }: { session: any }) {
  const { username } = useParams();
  const [pins, setPins] = useState<Pin[]>([]);
  const [profileUser, setProfileUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, [username]);

  const fetchProfile = async () => {
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', username)
      .single();

    if (userError || !userData) {
      alert('User not found');
      navigate('/');
      return;
    }

    setProfileUser(userData);

    const { data: pinsData, error: pinsError } = await supabase
      .from('pins')
      .select('*')
      .eq('user_id', userData.id)
      .order('created_at', { ascending: false });

    if (pinsError) {
      console.error('Error fetching pins:', pinsError);
    } else {
      setPins(pinsData || []);
    }
  };

  const handleEdit = async (pinId: string, newContent: string) => {
    const { error } = await supabase
      .from('pins')
      .update({ content: newContent })
      .eq('id', pinId);

    if (error) {
      alert('Error updating pin: ' + error.message);
    } else {
      fetchProfile();
    }
  };

  const handleDelete = async (pinId: string) => {
    if (!confirm('Are you sure you want to delete this pin?')) return;

    const { error } = await supabase.from('pins').delete().eq('id', pinId);

    if (error) {
      alert('Error deleting pin: ' + error.message);
    } else {
      fetchProfile();
    }
  };

  const canEdit = (createdAt: string) => {
    const pinDate = new Date(createdAt);
    const now = new Date();
    const hoursDiff = (now.getTime() - pinDate.getTime()) / (1000 * 60 * 60);
    return hoursDiff < 24;
  };

  const isOwnProfile = profileUser?.id === session.user.id;

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
          <Link to="/discover">Discover</Link>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      <div className="profile-header">
        <h2>@{profileUser?.username || username}</h2>
        <p>{profileUser?.email}</p>
        <p style={{ marginTop: '10px', color: '#999' }}>
          {pins.length} {pins.length === 1 ? 'pin' : 'pins'}
        </p>
      </div>

      <h2 style={{ marginBottom: '20px', color: '#ff6b9d' }}>
        {isOwnProfile ? 'My Pins' : `${username}'s Pins`}
      </h2>

      <div className="pins-grid">
        {pins.map((pin) => (
          <div key={pin.id} className="pin-card">
            <div className="pin-header">
              <span className="pin-username">@{username}</span>
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

            {isOwnProfile && (
              <div className="pin-actions">
                <button
                  className="edit-btn"
                  disabled={!canEdit(pin.created_at)}
                  onClick={() => {
                    const newContent = prompt('Edit your pin:', pin.content);
                    if (newContent) handleEdit(pin.id, newContent);
                  }}
                >
                  {canEdit(pin.created_at) ? 'Edit' : 'Edit (24h passed)'}
                </button>
                <button
                  className="delete-btn"
                  disabled={!canEdit(pin.created_at)}
                  onClick={() => handleDelete(pin.id)}
                >
                  {canEdit(pin.created_at) ? 'Delete' : 'Delete (24h passed)'}
                </button>
              </div>
            )}
          </div>
        ))}

        {pins.length === 0 && (
          <p style={{ color: '#666', textAlign: 'center', gridColumn: '1 / -1' }}>
            No pins yet.
          </p>
        )}
      </div>
    </div>
  );
}

export default ProfilePage;
