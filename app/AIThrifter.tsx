'use client';
import React, { useState, useRef, useEffect } from 'react';
import { Send, ShoppingBag, Upload, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { mockProducts } from '@/data/mockProducts'; // 👈 imported from data file

const AIThrifter = () => {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Welcome. How can I help you today?' },
  ]);
  const [input, setInput] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState<typeof mockProducts>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [hoveredProduct, setHoveredProduct] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => setSelectedImage(event.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSend = async () => {
    if (!input.trim() && !selectedImage) return;

    const userMessage = {
      role: 'user',
      content: input || 'Image uploaded',
      image: selectedImage,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate AI response (will be replaced with actual API call)
    setTimeout(() => {
      const assistantMessage = {
        role: 'assistant',
        content: selectedImage
          ? 'Here are items matching your style.'
          : `Found ${mockProducts.length} items for you.`,
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setProducts(mockProducts); // 👈 temporary mock data
      setSelectedImage(null);
      setIsLoading(false);
    }, 1500);
  };

  const addToCart = (product: any) => {
    if (!cart.find((item) => item.id === product.id)) {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const removeFromCart = (productId: number) => {
    setCart(cart.filter((item) => item.id !== productId));
  };

  const totalPrice = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div className="flex h-screen bg-white">
      {/* Left: Chat */}
      {/* (same code for chat + UI remains unchanged) */}
      {/* Right: Product list and cart */}
      {/* (same code as before) */}
    </div>
  );
};

export default AIThrifter;
