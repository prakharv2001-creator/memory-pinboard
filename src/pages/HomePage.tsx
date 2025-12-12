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

function HomePage({ session }: { session: any }) {
  const [pins, setPins] = useState<Pin[]>([]);
  const [content, setContent] = useState('');
  const [musicLink, setMusicLink] = useState('');
  const [gifUrl, setGifUrl] = useState('');
  const [selectedSticker, setSelectedSticker] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const stickers = ['🌸', '🌺', '🌻', '🌷', '🌹', '💐', '🌼', '🌈', '⭐', '✨', '💫', '🎀', '🎈', '🎉', '💝', '💖'];

  useEffect(() => {
    fetchUserPins();
  }, [session]);

  const fetchUserPins = async () => {
    const { data, error } = await supabase
      .from('pins')
      .select(`
        *,
        profiles (username)
      `)
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching pins:', error);
    } else {
      setPins(data || []);
    }
  };

  const handleCreatePin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);

    const { error } = await supabase.from('pins').insert({
      user_id: session.user.id,
      content: content.trim(),
      music_link: musicLink || null,
      gif_url: gifUrl || null,
      sticker: selectedSticker || null,
    });

    if (error) {
      alert('Error creating pin: ' + error.message);
    } else {
      setContent('');
      setMusicLink('');
      setGifUrl('');
      setSelectedSticker('');
      fetchUserPins();
    }

    setLoading(false);
  };

  const handleEdit = async (pinId: string, newContent: string) => {
    const { error } = await supabase
      .from('pins')
      .update({ content: newContent })
      .eq('id', pinId);

    if (error) {
      alert('Error updating pin: ' + error.message);
    } else {
      fetchUserPins();
    }
  };

  const handleDelete = async (pinId: string) => {
    if (!confirm('Are you sure you want to delete this pin?')) return;

    const { error } = await supabase.from('pins').delete().eq('id', pinId);

    if (error) {
      alert('Error deleting pin: ' + error.message);
    } else {
      fetchUserPins();
    }
  };

  const canEdit = (createdAt: string) => {
    const pinDate = new Date(createdAt);
    const now = new Date();
    const hoursDiff = (now.getTime() - pinDate.getTime()) / (1000 * 60 * 60);
    return hoursDiff < 24;
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
          <Link to={`/profile/${session.user.user_metadata?.username}`}>My Profile</Link>
          <Link to="/discover">Discover</Link>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      <div className="pin-form">
        <h2>Create a Memory Pin</h2>
        <form onSubmit={handleCreatePin}>
          <textarea
            placeholder="What's on your mind? Share a memory..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />

          <input
            type="url"
            placeholder="Music link (optional - Spotify, YouTube, etc.)"
            value={musicLink}
            onChange={(e) => setMusicLink(e.target.value)}
          />

          <input
            type="url"
            placeholder="GIF URL (optional - from Giphy, Tenor, etc.)"
            value={gifUrl}
            onChange={(e) => setGifUrl(e.target.value)}
          />

          <p style={{ marginBottom: '10px', color: '#666' }}>Pick a sticker (optional):</p>
          <div className="sticker-grid">
            {stickers.map((sticker) => (
              <div
                key={sticker}
                className={`sticker ${selectedSticker === sticker ? 'selected' : ''}`}
                onClick={() => setSelectedSticker(sticker === selectedSticker ? '' : sticker)}
              >
                {sticker}
              </div>
            ))}
          </div>

          <button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Pin'}
          </button>
        </form>
      </div>

      <h2 style={{ marginBottom: '20px', color: '#ff6b9d' }}>My Pins</h2>
      <div className="pins-grid">
        {pins.map((pin) => (
          <div key={pin.id} className="pin-card">
            <div className="pin-header">
              <span className="pin-username">@{pin.profiles?.username || 'Anonymous'}</span>
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
          </div>
        ))}

        {pins.length === 0 && (
          <p style={{ color: '#666', textAlign: 'center', gridColumn: '1 / -1' }}>
            No pins yet! Create your first memory above.
          </p>
        )}
      </div>
    </div>
  );
}

export default HomePage;
