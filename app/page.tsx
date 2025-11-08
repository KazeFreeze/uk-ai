"use client";

import { useState, FormEvent } from 'react';
import { ClothingItem, OutfitSet } from './lib/types'; // Import shared types

// --- Component for a single clothing item ---
function OutfitItem({ item, tags, onReshuffle }: {
  item: ClothingItem | null;
  tags: string[];
  onReshuffle: (type: string, id: string) => void;
}) {
  if (!item) {
    return (
      <div className="item-card placeholder">
        <p>No item found for this category and style.</p>
      </div>
    );
  }

  const handleReshuffle = () => {
    onReshuffle(item.type, item.id);
  };

  return (
    <div className="item-card">
      <img src={item.imageUrl || '/placeholder.jpg'} alt={item.name} />
      <h3>{item.name}</h3>
      <p className="tags">{item.tags.join(', ')}</p>
      <div className="actions">
        <a href={item.shopUrl} target="_blank" rel="noopener noreferrer" className="shop-button">
          Shop Now
        </a>
        <button onClick={handleReshuffle} className="reshuffle-button" title="Find another">
          🔄
        </button>
      </div>
    </div>
  );
}

// --- Main Page Component ---
export default function Home() {
  const [outfit, setOutfit] = useState<OutfitSet | null>(null);
  const [activeTags, setActiveTags] = useState<string[]>([]);

  const [prompt, setPrompt] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handles the main outfit generation
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!prompt && !imageFile) {
      setError("Please enter a theme or upload an image.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setOutfit(null);
    setActiveTags([]);

    const formData = new FormData();
    if (prompt) formData.append('theme', prompt);
    if (imageFile) formData.append('image', imageFile);

    try {
      const res = await fetch('/api/generate-outfit-set', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to generate outfit");
      }

      const data = await res.json();
      setOutfit(data.outfit);
      setActiveTags(data.tags);

    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setIsLoading(false);
      setPrompt("");
      setImageFile(null);
      // Clear the file input
      (document.getElementById('file-input') as HTMLInputElement).value = "";
    }
  };

  // Handles reshuffling a single item
  const handleReshuffle = async (item_type: string, exclude_id: string) => {
    if (activeTags.length === 0 || !outfit) return;

    try {
      const res = await fetch('/api/reshuffle-item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tags: activeTags,
          item_type: item_type,
          exclude_id: exclude_id,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to reshuffle");
      }

      const { newItem } = await res.json();

      if (newItem) {
        // Update the outfit state with the new item
        setOutfit(prevOutfit => ({
          ...prevOutfit!,
          [item_type]: newItem,
        }));
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    }
  };

  return (
    <div className="container">
      {/* --- SIDEBAR --- */}
      <aside className="sidebar">
        <h2>AI Stylist</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="theme-input">Chat with me</label>
            <input
              id="theme-input"
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. 'cyberpunk street style'"
              disabled={isLoading || !!imageFile}
            />
          </div>

          <div className="divider">or</div>

          <div className="form-group">
            <label htmlFor="file-input">Upload an image</label>
            <input
              id="file-input"
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files ? e.target.files[0] : null)}
              disabled={isLoading || prompt.length > 0}
            />
          </div>

          <button type="submit" disabled={isLoading} className="generate-button">
            {isLoading ? "Generating..." : "Find My Style"}
          </button>
        </form>

        {error && <p className="error-message">{error}</p>}

        {activeTags.length > 0 && (
          <div className="active-tags">
            <strong>Active Tags:</strong>
            <p>{activeTags.join(', ')}</p>
          </div>
        )}
      </aside>

      {/* --- MAIN CONTENT (OUTFIT) --- */}
      <main className="main-content">
        {!outfit && !isLoading && (
          <div className="placeholder-main">
            <h2>Your generated outfit will appear here.</h2>
            <p>Enter a theme or upload an image to get started.</p>
          </div>
        )}

        {isLoading && (
          <div className="placeholder-main">
            <h2>Generating your outfit...</h2>
            <p>This may take a moment.</p>
          </div>
        )}

        {outfit && (
          <div className="outfit-grid">
            <OutfitItem item={outfit.top} tags={activeTags} onReshuffle={handleReshuffle} />
            <OutfitItem item={outfit.bottom} tags={activeTags} onReshuffle={handleReshuffle} />
            <OutfitItem item={outfit.jacket} tags={activeTags} onReshuffle={handleReshuffle} />
          </div>
        )}
      </main>
    </div>
  );
}
