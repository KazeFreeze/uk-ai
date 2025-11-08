// "use client"
// import React, { useState, useRef, useEffect } from 'react';
// import { Send, ShoppingBag, Upload, X, Loader2, Minus, Plus } from 'lucide-react';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Card, CardContent } from '@/components/ui/card';
// import { Badge } from '@/components/ui/badge';
// import { ScrollArea } from '@/components/ui/scroll-area';

// const AIThrifter = () => {
//   const [messages, setMessages] = useState([
//     { role: 'assistant', content: 'Welcome. How can I help you today?' }
//   ]);
//   const [input, setInput] = useState('');
//   const [selectedImage, setSelectedImage] = useState(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [products, setProducts] = useState([]);
//   const [cart, setCart] = useState([]);
//   const [hoveredProduct, setHoveredProduct] = useState(null);
//   const fileInputRef = useRef(null);
//   const messagesEndRef = useRef(null);

//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   };

//   useEffect(() => {
//     scrollToBottom();
//   }, [messages]);

//   const mockProducts = [
//     { id: 1, name: 'OVERSIZED DENIM JACKET', price: 49.90, image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400', sizes: ['S', 'M', 'L', 'XL'] },
//     { id: 2, name: 'GRAPHIC T-SHIRT', price: 19.90, image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=400', sizes: ['XS', 'S', 'M', 'L'] },
//     { id: 3, name: 'LEATHER ANKLE BOOTS', price: 79.90, image: 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=400', sizes: ['36', '37', '38', '39', '40'] },
//     { id: 4, name: 'MIDI FLORAL DRESS', price: 39.90, image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400', sizes: ['XS', 'S', 'M', 'L'] },
//     { id: 5, name: 'KNIT CARDIGAN', price: 35.90, image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400', sizes: ['S', 'M', 'L'] },
//     { id: 6, name: 'HIGH-RISE STRAIGHT JEANS', price: 29.90, image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400', sizes: ['26', '28', '30', '32'] }
//   ];

//   const handleImageUpload = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       const reader = new FileReader();
//       reader.onload = (e) => {
//         setSelectedImage(e.target.result);
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   const handleSend = async () => {
//     if (!input.trim() && !selectedImage) return;

//     const userMessage = {
//       role: 'user',
//       content: input || 'Image uploaded',
//       image: selectedImage
//     };

//     setMessages(prev => [...prev, userMessage]);
//     setInput('');
//     setIsLoading(true);

//     setTimeout(() => {
//       const assistantMessage = {
//         role: 'assistant',
//         content: selectedImage 
//           ? 'Here are items matching your style.'
//           : `Found ${mockProducts.length} items for you.`
//       };
      
//       setMessages(prev => [...prev, assistantMessage]);
//       setProducts(mockProducts);
//       setSelectedImage(null);
//       setIsLoading(false);
//     }, 1500);
//   };

//   const addToCart = (product) => {
//     if (!cart.find(item => item.id === product.id)) {
//       setCart([...cart, { ...product, quantity: 1 }]);
//     }
//   };

//   const removeFromCart = (productId) => {
//     setCart(cart.filter(item => item.id !== productId));
//   };

//   const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

//   return (
//     <div className="flex h-screen bg-white">
//       {/* Chat Section - Left Side */}
//       <div className="w-1/2 flex flex-col border-r border-black">
//         <div className="p-8 border-b border-black">
//           <h1 className="text-4xl font-light tracking-widest text-black mb-1">
//             THRIFTER
//           </h1>
//           <p className="text-xs tracking-wider text-black/60 uppercase">AI Style Assistant</p>
//         </div>

//         <ScrollArea className="flex-1 p-8">
//           <div className="space-y-6 mb-4">
//             {messages.map((message, index) => (
//               <div
//                 key={index}
//                 className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
//               >
//                 <div
//                   className={`max-w-[75%] ${
//                     message.role === 'user'
//                       ? 'bg-black text-white px-5 py-3'
//                       : 'text-black px-0 py-1'
//                   }`}
//                 >
//                   {message.image && (
//                     <img
//                       src={message.image}
//                       alt="Uploaded"
//                       className="mb-3 max-w-full h-auto"
//                     />
//                   )}
//                   <p className="text-sm leading-relaxed tracking-wide">{message.content}</p>
//                 </div>
//               </div>
//             ))}
//             {isLoading && (
//               <div className="flex justify-start">
//                 <div className="text-black py-1">
//                   <Loader2 className="h-5 w-5 animate-spin" />
//                 </div>
//               </div>
//             )}
//             <div ref={messagesEndRef} />
//           </div>
//         </ScrollArea>

//         <div className="p-8 border-t border-black">
//           {selectedImage && (
//             <div className="mb-4 relative inline-block">
//               <img src={selectedImage} alt="Preview" className="h-24" />
//               <button
//                 onClick={() => setSelectedImage(null)}
//                 className="absolute -top-2 -right-2 bg-black text-white w-6 h-6 flex items-center justify-center"
//               >
//                 <X className="h-3 w-3" />
//               </button>
//             </div>
//           )}
//           <div className="flex gap-3">
//             <input
//               type="file"
//               ref={fileInputRef}
//               onChange={handleImageUpload}
//               accept="image/*"
//               className="hidden"
//             />
//             <Button
//               variant="outline"
//               size="icon"
//               onClick={() => fileInputRef.current?.click()}
//               className="shrink-0 border-black hover:bg-black hover:text-white transition-colors"
//             >
//               <Upload className="h-4 w-4" />
//             </Button>
//             <Input
//               value={input}
//               onChange={(e) => setInput(e.target.value)}
//               onKeyPress={(e) => e.key === 'Enter' && handleSend()}
//               placeholder="SEARCH"
//               className="flex-1 border-black focus-visible:ring-0 focus-visible:ring-offset-0 uppercase text-xs tracking-widest placeholder:text-black/40"
//             />
//             <Button 
//               onClick={handleSend} 
//               disabled={isLoading} 
//               className="shrink-0 bg-black hover:bg-black/90 text-white"
//             >
//               <Send className="h-4 w-4" />
//             </Button>
//           </div>
//         </div>
//       </div>

//       {/* Products Section - Right Side */}
//       <div className="w-1/2 flex flex-col">
//         <div className="p-8 border-b border-black">
//           <div className="flex justify-between items-center">
//             <div>
//               <h2 className="text-2xl font-light tracking-widest text-black uppercase">Selection</h2>
//               <p className="text-xs tracking-wider text-black/60 mt-1 uppercase">
//                 {products.length > 0 ? `${products.length} Items` : 'Ready to assist'}
//               </p>
//             </div>
//             <div className="relative">
//               <Button variant="ghost" size="icon" className="relative hover:bg-transparent">
//                 <ShoppingBag className="h-6 w-6 stroke-[1.5]" />
//                 {cart.length > 0 && (
//                   <span className="absolute -top-1 -right-1 bg-black text-white text-xs w-5 h-5 flex items-center justify-center font-light">
//                     {cart.length}
//                   </span>
//                 )}
//               </Button>
//             </div>
//           </div>
//         </div>

//         <ScrollArea className="flex-1 p-8">
//           {products.length === 0 ? (
//             <div className="flex items-center justify-center h-full text-black/30">
//               <div className="text-center">
//                 <ShoppingBag className="h-20 w-20 mx-auto mb-4 stroke-[1]" />
//                 <p className="text-sm tracking-widest uppercase">Begin your search</p>
//               </div>
//             </div>
//           ) : (
//             <div className="grid grid-cols-2 gap-6">
//               {products.map((product) => (
//                 <Card 
//                   key={product.id} 
//                   className="border-0 shadow-none overflow-hidden cursor-pointer group"
//                   onMouseEnter={() => setHoveredProduct(product.id)}
//                   onMouseLeave={() => setHoveredProduct(null)}
//                 >
//                   <div className="relative overflow-hidden bg-gray-50">
//                     <img
//                       src={product.image}
//                       alt={product.name}
//                       className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-105"
//                     />
//                     {hoveredProduct === product.id && (
//                       <div className="absolute inset-0 bg-black/10 transition-opacity duration-300" />
//                     )}
//                   </div>
//                   <CardContent className="p-4">
//                     <h3 className="text-xs font-light tracking-widest text-black mb-2 uppercase">{product.name}</h3>
//                     <p className="text-sm font-light text-black mb-3">{product.price.toFixed(2)} EUR</p>
//                     <div className="flex gap-1 mb-3">
//                       {product.sizes.slice(0, 4).map((size) => (
//                         <span key={size} className="text-xs border border-black/20 px-2 py-1 text-black/60">
//                           {size}
//                         </span>
//                       ))}
//                     </div>
//                     <Button
//                       onClick={() => addToCart(product)}
//                       className="w-full bg-black hover:bg-black/90 text-white uppercase text-xs tracking-widest font-light py-5"
//                       disabled={cart.some(item => item.id === product.id)}
//                     >
//                       {cart.some(item => item.id === product.id) ? 'Added to bag' : 'Add'}
//                     </Button>
//                   </CardContent>
//                 </Card>
//               ))}
//             </div>
//           )}
//         </ScrollArea>

//         {cart.length > 0 && (
//           <div className="p-8 border-t border-black">
//             <div className="mb-4">
//               <div className="flex justify-between items-center mb-4">
//                 <h3 className="text-sm font-light tracking-widest uppercase text-black">Shopping Bag ({cart.length})</h3>
//                 <p className="text-xl font-light text-black">{totalPrice.toFixed(2)} EUR</p>
//               </div>
//               <div className="space-y-3 max-h-32 overflow-y-auto">
//                 {cart.map((item) => (
//                   <div key={item.id} className="flex justify-between items-center text-xs border-b border-black/10 pb-3">
//                     <span className="text-black tracking-wide uppercase flex-1">{item.name}</span>
//                     <div className="flex items-center gap-4">
//                       <span className="font-light text-black">{item.price.toFixed(2)} EUR</span>
//                       <button
//                         onClick={() => removeFromCart(item.id)}
//                         className="text-black/60 hover:text-black"
//                       >
//                         <X className="h-4 w-4" />
//                       </button>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//             <Button className="w-full bg-black hover:bg-black/90 text-white uppercase text-sm tracking-widest font-light py-6">
//               Checkout — {totalPrice.toFixed(2)} EUR
//             </Button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default AIThrifter;

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
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
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

    setTimeout(() => {
      const assistantMessage = {
        role: 'assistant',
        content: selectedImage
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
      setSelectedImage(null);
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
    <div className="flex h-screen bg-gray-50">
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
              {msg.image && (
                <img
                  src={msg.image}
                  alt="uploaded"
                  className="mt-2 max-h-40 rounded-lg mx-auto"
                />
              )}
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

                <Button className="mt-2 w-full" onClick={() => addToCart(product)}>
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
                <li
                  key={item.id}
                  className="flex justify-between items-center mb-2"
                >
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
      </div>
    </div>
  );
};

export default AIThrifter;
