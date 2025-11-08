// /app/page.tsx (simplified)
"use client";
import { useState } from 'react';

export default function Home() {
  const [theme, setTheme] = useState("");
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setResults([]);

    const response = await fetch('/api/generate-tags', {
      method: 'POST',
      body: JSON.stringify({ theme: theme }),
    });

    const data = await response.json();
    setResults(data.results);
    setIsLoading(false);
  };

  return (
    <div>
      <h1>ThemeWeaver AI</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
          placeholder="Enter an outfit theme (e.g., 'goth night out')"
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Weaving..." : "Get Outfit"}
        </button>
      </form>

      <div>
        {/* Grid to display results */}
        {results.map((item) => (
          <div key={item.id}>
            <img src={item.imageUrl} alt={item.name} />
            <h3>{item.name}</h3>
            <a href={item.shopUrl} target="_blank">Shop Now</a>
          </div>
        ))}
      </div>
    </div>
  );
}
