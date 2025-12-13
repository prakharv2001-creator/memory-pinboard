import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

interface Pin {
  id: string;
  user_id: string;
  text_content: string;
  gif_url?: string
    sticker_url?: string;
  music_link?: string;;
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

  const stickers = ['🌸', '💕', '😊', '💜', '🌹', '🔥', '🌙', '🦋', '⭐', '✨', '🌺', '💖', '💗', '🦄', '🎀', '🌼', '🍀', '🎈'];

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
            .eq('is_archived', false)
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
      text_content: content,      music_link: musicLink || null,
      gif_url: gifUrl || null,
      sticker_url: selectedSticker || null,    });

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
    <div>
      <header>
        <div className="header-content">
          <Link to="/" className="header-logo">
            <span className="header-emoji">💕</span>
            <h1>Memory Pinboard</h1>
            <span className="header-emoji">💕</span>
          </Link>
          <nav>
            <Link to={`/profile/${session.user.user_metadata?.username}`}>My Profile</Link>
            <Link to="/discover">Discover</Link>
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </nav>
        </div>
      </header>

      <div className="container">
        <div className="create-section">
          <h2>Create a Memory Pin</h2>
          <form onSubmit={handleCreatePin}>
            <div className="form-group">
              <label>What's on your mind?</label>
              <textarea
                placeholder="Share a memory..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Music Link (optional)</label>
              <input
                type="url"
                placeholder="Spotify, YouTube, etc."
                value={musicLink}
                onChange={(e) => setMusicLink(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>GIF URL (optional)</label>
              <input
                type="url"
                placeholder="From Giphy, Tenor, etc."
                value={gifUrl}
                onChange={(e) => setGifUrl(e.target.value)}
              />
            </div>

            <div className="sticker-section">
              <p>Pick a sticker (optional):</p>
              <div className="sticker-grid">
                {stickers.map((sticker) => (
                  <div
                    key={sticker}
                    className={`sticker-option ${selectedSticker === sticker ? 'selected' : ''}`}
                    onClick={() => setSelectedSticker(sticker === selectedSticker ? '' : sticker)}
                  >
                    {sticker}
                  </div>
                ))}
              </div>
            </div>

            <button type="submit" className="create-btn" disabled={loading}>
              {loading ? 'Creating...' : 'Create Pin'}
            </button>
          </form>
        </div>

        <div className="memories-section">
          <h2>My Pins</h2>
          {pins.length === 0 ? (
            <div className="empty-state">
              <p>No pins yet! Create your first memory above.</p>
            </div>
          ) : (
            <div className="memories-grid">
              {pins.map((pin) => (
                <div key={pin.id} className="memory-card">
                  {pin.sticker && <div className="memory-sticker">{pin.sticker}</div>}
                  
                  <div className="memory-content">
                    <p>{pin.content}</p>
                  </div>

                  <div className="memory-meta">
                    <span className="memory-date">{new Date(pin.created_at).toLocaleDateString()}</span>
                    <div className="memory-links">
                      {pin.music_link && (
                        <a href={pin.music_link} target="_blank" rel="noopener noreferrer" className="memory-link">
                          🎵 Music
                        </a>
                      )}
                      {pin.gif_url && (
                        <a href={pin.gif_url} target="_blank" rel="noopener noreferrer" className="memory-link">
                          🎬 GIF
                        </a>
                      )}
                    </div>
                  </div>

                  {canEdit(pin.created_at) && (
                    <div className="memory-actions">
                      <button
                        className="btn"
                        onClick={() => {
                          const newContent = prompt('Edit your pin:', pin.content);
                          if (newContent) handleEdit(pin.id, newContent);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="btn"
                        onClick={() => handleDelete(pin.id)}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default HomePage;
