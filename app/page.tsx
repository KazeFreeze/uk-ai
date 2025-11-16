'use client';
import React, { useState, useRef, useEffect } from 'react';
import { Send, ShoppingBag, Upload, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { mockProducts } from './data/mockProducts';

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  sizes: string[];
  locked?: boolean;
}

const AIThrifter = () => {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Welcome. How can I help you today?' },
  ]);
  const [input, setInput] = useState('');
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>(mockProducts); // initially show all
  const [cart, setCart] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    const readers = files.map(
      (file) =>
        new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        })
    );
    Promise.all(readers).then((images) => setSelectedImages(images));
  };

  const handleSend = async () => {
    if (!input.trim() && selectedImages.length === 0) return;

    const userMessage = {
      role: 'user',
      content: input || 'Image(s) uploaded',
      images: selectedImages,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    setTimeout(() => {
      const assistantMessage = {
        role: 'assistant',
        content:
          selectedImages.length > 0
            ? 'Here are items matching your style.'
            : `AI has suggested some products for you.`,
      };
      setMessages((prev) => [...prev, assistantMessage]);

      // AI suggestion logic: only replace **unlocked products**
      const unlockedProducts = products.filter((p) => p.locked);
      const remainingProducts = mockProducts.filter(
        (p) => !unlockedProducts.some((up) => up.id === p.id)
      );

      // simulate picking a few AI suggestions
      const suggestedProducts = remainingProducts.slice(0, 3); // pick first 3, can randomize
      const newProductList = [...unlockedProducts, ...suggestedProducts].map((p) => ({
        ...p,
        locked: p.locked ?? false,
      }));

      setProducts(newProductList);
      setSelectedImages([]);
      setIsLoading(false);
    }, 1500);
  };

  const addToCart = (product: Product) => {
    if (!cart.find((item) => item.id === product.id)) {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const removeFromCart = (productId: number) => {
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
              className={`mb-3 ${
                msg.role === 'assistant' ? 'text-blue-700' : 'text-gray-900 text-right'
              }`}
            >
              <p className="bg-white inline-block px-3 py-2 rounded-2xl shadow">
                {msg.content}
              </p>
              {msg.images &&
                msg.images.map((img: string, idx: number) => (
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
            multiple
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
                <h3 className="mt-2 font-semibold">{product.name}</h3>
                <p className="text-sm text-gray-500">${product.price}</p>
                <div className="flex gap-2 mt-2">
                  {/* Lock Button */}
                  <Button
                    variant={product.locked ? 'destructive' : 'outline'}
                    size="sm"
                    onClick={() => toggleLock(index)}
                  >
                    {product.locked ? '🔒' : '🔓'}
                  </Button>

                  {/* Shuffle Button */}
                  <Button
                    size="sm"
                    onClick={() => {
                      if (product.locked) return;
                      const available = mockProducts.filter(
                        (p) => !products.some((prod) => prod.id === p.id)
                      );
                      if (available.length === 0) return;
                      const random =
                        available[Math.floor(Math.random() * available.length)];
                      const newProducts = [...products];
                      newProducts[index] = { ...random, locked: false };
                      setProducts(newProducts);
                    }}
                  >
                    🔀
                  </Button>
                </div>
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
                  <span>{item.name}</span>
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

        
          <Button
    className="fixed bottom-6 right-6 px-6 py-3 !bg-black !bg-opacity-90 !text-white uppercase tracking-wide text-sm font-medium hover:!bg-opacity-100 transition-opacity duration-300 shadow-md z-50"
    onClick={() => alert('Proceed to checkout!')}
  >
    Checkout $18.99
  </Button>
        
      </div>
    </div>
  );
};

export default AIThrifter;
