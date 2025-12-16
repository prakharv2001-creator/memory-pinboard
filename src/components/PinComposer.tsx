import React, { useState, ChangeEvent } from 'react';
import { supabase } from '../supabaseClient';

interface PinComposerProps {
  onPinCreated: () => void;
}

const PinComposer: React.FC<PinComposerProps> = ({ onPinCreated }) => {
  const [textContent, setTextContent] = useState('');
  const [musicLink, setMusicLink] = useState('');
  const [gifUrl, setGifUrl] = useState('');
  const [selectedSticker, setSelectedSticker] = useState('');
  const [backgroundColor, setBackgroundColor] = useState('#FFF9E6');
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [showGifInput, setShowGifInput] = useState(false);

  // Romantic pastel color swatches
  const colors = [
    { name: 'Cream', value: '#FFF9E6' },
    { name: 'Blush Pink', value: '#FFB6C1' },
    { name: 'Soft Pink', value: '#FFC0CB' },
    { name: 'Warm Beige', value: '#F5F5DC' },
    { name: 'Lavender', value: '#E6E6FA' },
  ];

  // Curated romantic stickers
  const stickers = [
    '🌸', '💕', '😊', '💜', '🌹', '🔥', '🌙', '🦋', 
    '⭐', '✨', '🌺', '💖', '💗', '🦄', '🎀', '🌼'
  ];

  const handleImageSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    setImageFiles(prev => [...prev, ...newFiles]);

    // Create preview URLs
    newFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const uploadImages = async (): Promise<string[]> => {
    const uploadedUrls: string[] = [];

    for (const file of imageFiles) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `pin-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('pins')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Error uploading image:', uploadError);
        continue;
      }

      const { data } = supabase.storage
        .from('pins')
        .getPublicUrl(filePath);

      uploadedUrls.push(data.publicUrl);
    }

    return uploadedUrls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!textContent.trim()) return;

    setLoading(true);

    try {
      // Upload images if any
      const imageUrls = imageFiles.length > 0 ? await uploadImages() : [];

      const { error } = await supabase.from('pins').insert({
        text_content: textContent,
        image_urls: imageUrls.length > 0 ? imageUrls : null,
        music_link: musicLink || null,
        gif_url: gifUrl || null,
        sticker_url: selectedSticker || null,
        background_color: backgroundColor,
      });

      if (error) throw error;

      // Reset form
      setTextContent('');
      setMusicLink('');
      setGifUrl('');
      setSelectedSticker('');
      setBackgroundColor('#FFF9E6');
      setImageFiles([]);
      setImagePreviews([]);
      setShowGifInput(false);

      onPinCreated();
    } catch (error: any) {
      alert('Error creating pin: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pin-composer">
      <h2 className="composer-title">✨ Create a Memory ✨</h2>
      
      <form onSubmit={handleSubmit} className="composer-form">
        {/* Text Area - WhatsApp style */}
        <div className="composer-section">
          <textarea
            className="composer-textarea"
            placeholder="What's on your mind? Share a memory, thought, or feeling... 💭"
            value={textContent}
            onChange={(e) => setTextContent(e.target.value)}
            rows={4}
            required
          />
        </div>

        {/* Image Upload Section */}
        <div className="composer-section">
          <label className="composer-label">
            <span className="label-icon">📸</span>
            <span>Add Photos</span>
          </label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageSelect}
            className="file-input"
            id="image-upload"
          />
          <label htmlFor="image-upload" className="file-label">
            + Add Photos
          </label>
          
          {imagePreviews.length > 0 && (
            <div className="image-previews">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="image-preview-item">
                  <img src={preview} alt={`Preview ${index + 1}`} />
                  <button
                    type="button"
                    className="remove-image"
                    onClick={() => removeImage(index)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* GIF Section */}
        <div className="composer-section">
          <button
            type="button"
            className="media-button"
            onClick={() => setShowGifInput(!showGifInput)}
          >
            <span className="label-icon">🎬</span>
            {showGifInput ? 'Hide GIF' : 'Add GIF'}
          </button>
          
          {showGifInput && (
            <input
              type="url"
              className="composer-input"
              placeholder="Paste GIF URL from Giphy or Tenor"
              value={gifUrl}
              onChange={(e) => setGifUrl(e.target.value)}
            />
          )}
        </div>

        {/* Music Link Section */}
        <div className="composer-section">
          <label className="composer-label">
            <span className="label-icon">🎵</span>
            <span>Music Link (optional)</span>
          </label>
          <input
            type="url"
            className="composer-input"
            placeholder="Spotify, YouTube, etc."
            value={musicLink}
            onChange={(e) => setMusicLink(e.target.value)}
          />
        </div>

        {/* Sticker Selector */}
        <div className="composer-section">
          <label className="composer-label">
            <span className="label-icon">✨</span>
            <span>Pick a Sticker</span>
          </label>
          <div className="sticker-grid">
            {stickers.map((sticker) => (
              <button
                key={sticker}
                type="button"
                className={`sticker-option ${selectedSticker === sticker ? 'selected' : ''}`}
                onClick={() => setSelectedSticker(sticker === selectedSticker ? '' : sticker)}
              >
                {sticker}
              </button>
            ))}
          </div>
        </div>

        {/* Background Color Selector */}
        <div className="composer-section">
          <label className="composer-label">
            <span className="label-icon">🎨</span>
            <span>Pin Color</span>
          </label>
          <div className="color-swatches">
            {colors.map((color) => (
              <button
                key={color.value}
                type="button"
                className={`color-swatch ${backgroundColor === color.value ? 'selected' : ''}`}
                style={{ backgroundColor: color.value }}
                onClick={() => setBackgroundColor(color.value)}
                title={color.name}
              />
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="composer-submit"
          disabled={loading || !textContent.trim()}
        >
          {loading ? '✨ Creating...' : '💕 Create Pin'}
        </button>
      </form>
    </div>
  );
};

export default PinComposer;
