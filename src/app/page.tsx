'use client';
import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  ShoppingBag,
  Upload,
  X,
  Loader2,
  RefreshCw,
  MessageSquare,
  Lock,
  Unlock
} from 'lucide-react';
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
  tags: string[];
  locked?: boolean;
  cartId?: string;
}

const convertToProduct = (item: ClothingItem): Product => ({
  id: item.id,
  name: item.name,
  price: 99.99,
  image: item.imageUrl,
  sizes: [],
  type: item.type,
  tags: item.tags,
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
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<Product[]>([]);

  const [currentTags, setCurrentTags] = useState<string[]>([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isChatOpen]);

  useEffect(() => {
    const fetchInitialProducts = async () => {
      setIsLoading(true);
      try {
        const res = await fetch('/api/get-products');
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to fetch products.');
        const initialProducts = data.products.map(convertToProduct);
        setProducts(initialProducts);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "An unknown error occurred.";
        setMessages((prev) => [...prev, { role: 'assistant', content: `Error: ${msg}` }]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInitialProducts();
  }, []);

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

  const handleSend = async () => {
    if (!input.trim() && !selectedFile) return;
    const userMessage = {
      role: 'user',
      content: input || 'Image uploaded',
      images: selectedImagesBase64,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const formData = new FormData();
    if (selectedFile) {
      formData.append('image', selectedFile);
    } else {
      formData.append('theme', input);
    }

    try {
      const response = await fetch('/api/generate-outfit-set', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate outfit.');
      }

      const assistantMessage = {
        role: 'assistant',
        content: 'Here are items matching your style.',
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setCurrentTags(data.tags);

      const newProductsFromAPI: Product[] = Object.values(data.outfit)
        .filter((item): item is ClothingItem => item !== null)
        .map(convertToProduct);

      const lockedProducts = products.filter((p) => p.locked);
      const lockedTypes = lockedProducts.map(p => p.type);

      const filteredNewProducts = newProductsFromAPI.filter(
        (p) => !lockedTypes.includes(p.type)
      );
      setProducts([...lockedProducts, ...filteredNewProducts]);

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An unknown error occurred.";
      setMessages((prev) => [...prev, { role: 'assistant', content: `Error: ${msg}` }]);
    } finally {
      setSelectedFile(null);
      setSelectedImagesBase64([]);
      setIsLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleReshuffle = async (productToShuffle: Product, index: number) => {
    if (productToShuffle.locked) return;
    if (currentTags.length === 0) {
      alert("Please generate an outfit first using the chat.");
      return;
    }

    const lockedProducts = products.filter(p => p.locked);
    const lockedTags = lockedProducts.flatMap(p => p.tags);
    const combinedTags = [...new Set([...currentTags, ...lockedTags])];

    try {
      const response = await fetch('/api/reshuffle-item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tags: combinedTags,
          item_type: productToShuffle.type,
          exclude_id: productToShuffle.id,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to reshuffle.');
      }

      if (data.message) {
        alert(data.message);
      }

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
    const newCartItem = { ...product, cartId: crypto.randomUUID() };
    setCart(prevCart => [...prevCart, newCartItem]);
  };

  const removeFromCart = (cartItemId: string) => {
    setCart(cart.filter((item) => item.cartId !== cartItemId));
  };

  const totalPrice = cart.reduce((sum, item) => sum + item.price, 0);

  const toggleLock = (index: number) => {
    const newProducts = [...products];
    newProducts[index].locked = !newProducts[index].locked;
    setProducts(newProducts);
  };

  const ChatInterface = () => (
    <>
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
        {isLoading && messages.length <= 1 && (
          <div className="flex justify-center items-center p-4">
            <Loader2 className="animate-spin w-8 h-8 text-gray-400" />
          </div>
        )}
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
        <Button onClick={handleSend} disabled={isLoading || (!input.trim() && !selectedFile)}>
          {isLoading ?
            <Loader2 className="animate-spin w-4 h-4" /> : <Send className="w-4 h-4" />}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-gray-50 relative">
      <div className="hidden md:flex md:w-2/5 border-r flex-col h-screen">
        <ChatInterface />
      </div>

      {isChatOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-gray-50 flex flex-col h-screen">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-50"
            onClick={() => setIsChatOpen(false)}
          >
            <X className="w-6 h-6" />
          </Button>
          <ChatInterface />
        </div>
      )}

      <div className="w-full md:w-3/5 p-4 overflow-y-auto h-screen">
        <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
          <ShoppingBag className="w-5 h-5" /> Products
        </h2>
        <div className="grid grid-cols-2 gap-4">
          {products.map((product, index) => (
            <Card key={`${product.id}-${index}`} className="hover:shadow-lg transition relative h-72 flex flex-col">
              <CardContent className="p-3 flex flex-col h-full">
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-32 w-full object-cover rounded-lg"
                />
                <h3 className="mt-2 font-semibold truncate" title={product.name}>{product.name}</h3>
                <p className="text-sm text-gray-500">${product.price}</p>
                <div className="mt-auto">
                  <div className="flex gap-2 mt-2">
                    <Button
                      variant={product.locked ? 'destructive' : 'outline'}
                      size="sm"
                      onClick={() => toggleLock(index)}
                    >
                      {product.locked ?
                        <Lock className="w-4 h-4" /> :
                        <Unlock className="w-4 h-4" />}
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
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-6 border-t pt-4">
          <h2 className="text-lg font-bold mb-2">Your Cart</h2>
          {cart.length === 0 ? (
            <p className="text-gray-500">No items yet.</p>
          ) : (
            <ul>
              {cart.map((item) => (
                <li key={item.cartId} className="flex justify-between items-center mb-2">
                  <span className="truncate w-1/2" title={item.name}>{item.name}</span>
                  <span>${item.price}</span>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => removeFromCart(item.cartId!)}
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
            className="fixed bottom-6 right-6 px-6 py-3 bg-black! bg-opacity-90! text-white! uppercase tracking-wide text-sm font-medium hover:bg-opacity-100!
 transition-opacity duration-300 shadow-md z-50"
            onClick={() => alert('Proceed to checkout!')}
          >
            Checkout ${totalPrice.toFixed(2)}
          </Button>
        )}
      </div>

      {!isChatOpen && (
        <Button
          className="md:hidden fixed bottom-6 right-6 z-30 rounded-full w-14 h-14 p-0 shadow-lg"
          onClick={() => setIsChatOpen(true)}
          variant="default"
        >
          <MessageSquare className="w-6 h-6" />
        </Button>
      )}
    </div>
  );
};

export default AIThrifter;
