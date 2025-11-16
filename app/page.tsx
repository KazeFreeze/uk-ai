"use client";

import React, { useState, useRef } from "react";
import { OutfitSet, ClothingItem } from "@/app/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Send, Upload, Loader2, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

export default function OutfitGeneratorPage() {
  const [outfit, setOutfit] = useState<OutfitSet | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [theme, setTheme] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  /**
   * Handles the main form submission.
   * Sends either a 'theme' string or an 'image' file to the API.
   */
  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!theme && !imageFile) {
      setError("Please enter a theme or upload an image.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setOutfit(null);

    const formData = new FormData();
    if (imageFile) {
      formData.append("image", imageFile);
    } else {
      formData.append("theme", theme);
    }

    try {
      const response = await fetch("/api/generate-outfit-set", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate outfit.");
      }

      setOutfit(data.outfit);
      setTags(data.tags);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(msg);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles the "reshuffle" request for a single item.
   * It uses the 'tags' state from the last successful generation.
   */
  const handleReshuffle = async (itemType: string, currentItemId: string) => {
    if (tags.length === 0) {
      alert("Please generate an outfit first before reshuffling.");
      return;
    }

    console.log(`Reshuffling ${itemType}...`);

    try {
      const response = await fetch("/api/reshuffle-item", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tags: tags,
          item_type: itemType,
          exclude_id: currentItemId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to reshuffle item.");
      }

      if (data.message) {
        alert(data.message);
      }

      setOutfit((prevOutfit) => {
        if (!prevOutfit) return null;
        return {
          ...prevOutfit,
          [itemType]: data.newItem,
        };
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An unknown error occurred.";
      alert(`Error reshuffling: ${msg}`);
      console.error(err);
    }
  };

  const handleTextInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTheme(e.target.value);
    if (e.target.value) {
      setImageFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
      setTheme("");
    }
  };

  return (
    <div className="flex h-screen bg-background text-foreground">
      <div className="w-full md:w-1/3 border-r flex flex-col p-4 gap-4">
        <h1 className="text-2xl font-bold">AI Outfit Generator</h1>
        <form onSubmit={handleGenerate} className="flex flex-col gap-4">
          <Input
            type="text"
            placeholder="Enter a theme (e.g., 'summer beach party')"
            value={theme}
            onChange={handleTextInput}
            disabled={isLoading}
          />

          <span className="text-center text-sm text-muted-foreground">OR</span>

          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
          >
            <Upload className="w-4 h-4 mr-2" />
            {imageFile ? imageFile.name : "Upload an Image"}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInput}
            className="hidden"
          />

          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="animate-spin w-4 h-4 mr-2" />
            ) : (
              <Send className="w-4 h-4 mr-2" />
            )}
            Generate Outfit
          </Button>

          {error && <p className="text-destructive text-center">{error}</p>}
        </form>

        {tags.length > 0 && !isLoading && (
          <div className="border-t pt-4">
            <h3 className="font-semibold">Generated Tags:</h3>
            <p className="text-sm text-muted-foreground">{tags.join(", ")}</p>
          </div>
        )}
      </div>

      <div className="w-full md:w-2/3 p-4 overflow-y-auto">
        <h2 className="text-lg font-bold mb-3">Your Outfit</h2>
        {isLoading && !outfit && (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="animate-spin w-12 h-12 text-primary" />
          </div>
        )}
        {!isLoading && !outfit && (
          <p className="text-muted-foreground">
            Your generated outfit will appear here.
          </p>
        )}
        {outfit && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(outfit).map(([type, item]) => (
              <OutfitItemCard
                key={type}
                itemType={type}
                item={item}
                onReshuffle={() => item && handleReshuffle(type, item.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * A sub-component to display a single clothing item.
 * This re-uses your <Card> component.
 */
function OutfitItemCard({
  itemType,
  item,
  onReshuffle,
}: {
  itemType: string;
  item: ClothingItem | null;
  onReshuffle: () => void;
}) {
  const title = itemType.charAt(0).toUpperCase() + itemType.slice(1);

  if (!item) {
    return (
      <Card className="hover:shadow-lg transition relative">
        <CardContent className="p-3 flex flex-col items-center justify-center min-h-[200px]">
          <h3 className="mt-2 font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground text-center">
            No {itemType} found for this style.
          </T>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-lg transition relative">
      <CardContent className="p-3">
        <img
          src={item.imageUrl}
          alt={item.name}
          className="h-48 w-full object-cover rounded-lg"
        />
        <h3 className="mt-2 font-semibold truncate" title={item.name}>
          {item.name}
        </h3>
        <a
          href={item.shopUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-primary hover:underline"
        >
          Shop Now
        </a>
        <div className="flex gap-2 mt-2">
          <Button variant="outline" size="sm" onClick={onReshuffle}>
            <RefreshCw className="w-4 h-4 mr-1" />
            Shuffle
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
