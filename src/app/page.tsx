'use client';
import React, { useState, useRef, useEffect } from 'react';
import { Send, ShoppingBag, Upload, X, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

import { ClothingItem } from '@/lib/types';

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  sizes: string[];
  type: string;
  locked?: boolean;
}

// Helper function to convert backend item to frontend product
const convertToProduct = (item: ClothingItem): Product => ({
  id: item.id,
  name: item.name,
  price: 99.99,
  image: item.imageUrl,
  sizes: [],
  type: item.type,
  locked: false,
});

const AIThrifter = () => {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Welcome. How can I help you today?' },
  ]);
  const [input, setInput] = useState('');

  const [selectedImagesBase64, setSelectedImagesBase64] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]); // <- No longer uses mockProducts
  const [cart, setCart] = useState<any[]>([]);

  const [currentTags, setCurrentTags] = useState<string[]>([]);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    setSelectedFile(file);

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImagesBase64([reader.result as string]);
    };
    reader.readAsDataURL(file);
  };

  /**
   * This function now calls your REAL backend API.
   * It preserves your "locked" item logic.
   */
  const handleSend = async () => {
    if (!input.trim() && !selectedFile) return;

    const userMessage = {
      role: 'user',
      content: input || 'Image uploaded',
      images: selectedImagesBase64, // <- Use Base64 for UI
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // 1. Build the FormData for the API
    const formData = new FormData();
    if (selectedFile) {
      formData.append('image', selectedFile);
    } else {
      formData.append('theme', input);
    }

    try {
      // 2. Call the generate-outfit-set API
      const response = await fetch('/api/generate-outfit-set', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate outfit.');
      }

      // 3. Add the assistant's response to chat
      const assistantMessage = {
        role: 'assistant',
        content: 'Here are items matching your style.',
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setCurrentTags(data.tags); // <- Save tags for reshuffling

      // 4. Convert API response (OutfitSet) to Product[]
      const newProductsFromAPI: Product[] = Object.values(data.outfit)
        .filter((item): item is ClothingItem => item !== null)
        .map(convertToProduct);

      // 5. Preserve locked products (your UI logic)
      const lockedProducts = products.filter((p) => p.locked);
      const lockedTypes = lockedProducts.map(p => p.type);

      // Filter out new items whose *type* is already locked
      const filteredNewProducts = newProductsFromAPI.filter(
        (p) => !lockedTypes.includes(p.type)
      );

      setProducts([...lockedProducts, ...filteredNewProducts]);

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An unknown error occurred.";
      setMessages((prev) => [...prev, { role: 'assistant', content: `Error: ${msg}` }]);
    } finally {
      // Clear inputs
      setSelectedFile(null);
      setSelectedImagesBase64([]);
      setIsLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  /**
   * This function now calls reshuffle API.
   */
  const handleReshuffle = async (productToShuffle: Product, index: number) => {
    if (productToShuffle.locked) return;

    if (currentTags.length === 0) {
      alert("Please generate an outfit first using the chat.");
      return;
    }


    try {
      // 1. Call the reshuffle-item API
      const response = await fetch('/api/reshuffle-item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tags: currentTags,
          item_type: productToShuffle.type,
          exclude_id: productToShuffle.id,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to reshuffle.');
      }

      if (data.message) {
        alert(data.message); // e.g., "No other items match"
      }

      // 2. Convert the new item and update the products list
      if (data.newItem) {
        const newProduct = convertToProduct(data.newItem);
        const newProductsList = [...products];
        newProductsList[index] = newProduct;
        setProducts(newProductsList);
      }

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An unknown error occurred.";
      alert(`Error reshuffling: ${msg}`);
    }
  };


  const addToCart = (product: Product) => {
    if (!cart.find((item) => item.id === product.id)) {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  // Updated to handle string ID
  const removeFromCart = (productId: string) => {
    setCart(cart.filter((item) => item.id !== productId));
  };

  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const toggleLock = (index: number) => {
    const newProducts = [...products];
    newProducts[index].locked = !newProducts[index].locked;
    setProducts(newProducts);
  };

  return (
    <div className="flex h-screen bg-gray-50 relative">
      {/* Left: Chat */}
      <div className="w-1/2 border-r flex flex-col">
        <ScrollArea className="flex-1 p-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`mb-3 ${msg.role === 'assistant' ? 'text-blue-700' : 'text-gray-900 text-right'
                }`}
            >
              <p className="bg-white inline-block px-3 py-2 rounded-2xl shadow">
                {msg.content}
              </p>
              {(msg as any).images &&
                (msg as any).images.map((img: string, idx: number) => (
                  <img
                    key={idx}
                    src={img}
                    alt="uploaded"
                    className="mt-2 max-h-40 rounded-lg mx-auto"
                  />
                ))}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </ScrollArea>

        <div className="p-4 border-t flex gap-2 items-center">
          <Input
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
          />
          <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
            <Upload className="w-4 h-4" />
          </Button>
          <Button onClick={handleSend} disabled={isLoading}>
            {isLoading ? <Loader2 className="animate-spin w-4 h-4" /> : <Send className="w-4 h-4" />}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </div>
      </div>

      {/* Right: Product list & cart */}
      <div className="w-1/2 p-4 overflow-y-auto">
        <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
          <ShoppingBag className="w-5 h-5" /> Products
        </h2>
        <div className="grid grid-cols-2 gap-4">
          {products.map((product, index) => (
            <Card key={product.id} className="hover:shadow-lg transition relative">
              <CardContent className="p-3">
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-32 w-full object-cover rounded-lg"
                />
                <h3 className="mt-2 font-semibold truncate" title={product.name}>{product.name}</h3>
                <p className="text-sm text-gray-500">${product.price}</p>
                <div className="flex gap-2 mt-2">
                  {/* Lock Button (Unchanged) */}
                  <Button
                    variant={product.locked ? 'destructive' : 'outline'}
                    size="sm"
                    onClick={() => toggleLock(index)}
                  >
                    {product.locked ? '🔒' : '🔓'}
                  </Button>

                  <Button
                    size="sm"
                    onClick={() => handleReshuffle(product, index)}
                    disabled={product.locked}
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
                <Button
                  size="sm"
                  className="w-full mt-2"
                  onClick={() => addToCart(product)}
                >
                  Add to Cart
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Cart */}
        <div className="mt-6 border-t pt-4">
          <h2 className="text-lg font-bold mb-2">Your Cart</h2>
          {cart.length === 0 ? (
            <p className="text-gray-500">No items yet.</p>
          ) : (
            <ul>
              {cart.map((item) => (
                <li key={item.id} className="flex justify-between items-center mb-2">
                  <span className="truncate w-1/2" title={item.name}>{item.name}</span>
                  <span>${item.price}</span>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => removeFromCart(item.id)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
          {cart.length > 0 && (
            <div className="mt-4 font-semibold">Total: ${totalPrice.toFixed(2)}</div>
          )}
        </div>

        {cart.length > 0 && (
          <Button
            className="fixed bottom-6 right-6 px-6 py-3 bg-black! bg-opacity-90! text-white! uppercase tracking-wide text-sm font-medium hover:bg-opacity-100! transition-opacity duration-300 shadow-md z-50"
            onClick={() => alert('Proceed to checkout!')}
          >
            Checkout ${totalPrice.toFixed(2)}
          </Button>
        )}
      </div>
    </div>
  );
};

export default AIThrifter;
