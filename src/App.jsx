import React, { useState, useRef, useEffect } from 'react';
import { 
  ShoppingBag, Store, Truck, User, Plus, CheckCircle, 
  Clock, MapPin, Star, Package, X, CreditCard, MessageSquare, Edit3, Trash2, Upload, Save
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const INITIAL_PRODUCTS = [
  { id: 1, name: '招牌红烧肉', price: 48, stock: 20, status: 'onsale', image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=300&h=200&fit=crop', description: '秘制红烧肉，肥而不腻。' },
  { id: 2, name: '清蒸鲈鱼', price: 68, stock: 10, status: 'onsale', image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=300&h=200&fit=crop', description: '肉质鲜美，原汁原味。' },
  { id: 3, name: '麻婆豆腐', price: 28, stock: 50, status: 'onsale', image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=300&h=200&fit=crop', description: '经典川菜，麻辣鲜香。' },
];

const INITIAL_REVIEWS = [
  { id: 1, productId: 1, userName: '张三', rating: 5, comment: '味道真的很棒，肉质很嫩！', date: '2023-10-01' },
];

export default function App() {
  const [role, setRole] = useState('user'); 
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [orders, setOrders] = useState([]);
  const [reviews, setReviews] = useState(INITIAL_REVIEWS);
  const [cart, setCart] = useState([]);
  const [activeTab, setActiveTab] = useState('shop');
  
  // --- Persistence Logic ---
  // Initialize from localStorage
  useEffect(() => {
    const savedProducts = localStorage.getItem('xb_products');
    const savedOrders = localStorage.getItem('xb_orders');
    const savedReviews = localStorage.getItem('xb_reviews');
    
    if (savedProducts) setProducts(JSON.parse(savedProducts));
    if (savedOrders) setOrders(JSON.parse(savedOrders));
    if (savedReviews) setReviews(JSON.parse(savedReviews));
  }, []);

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('xb_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('xb_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('xb_reviews', JSON.stringify(reviews));
  }, [reviews]);
  
  // Checkout & Review State
  const [checkoutForm, setCheckoutForm] = useState({ userName: '', phone: '', address: '', note: '' });
  const [reviewForm, setReviewForm] = useState({ orderId: null, rating: 5, comment: '', isEditing: false, reviewId: null });

  // Merchant Product Edit State
  const [editingProduct, setEditingProduct] = useState(null);
  const fileInputRef = useRef(null);

  // --- Logic ---
  
  // Product Management
  const handleProductSubmit = (e) => {
    e.preventDefault();
    if (editingProduct.id) {
      setProducts(products.map(p => p.id === editingProduct.id ? editingProduct : p));
    } else {
      const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
      setProducts([...products, { ...editingProduct, id: newId }]);
    }
    setEditingProduct(null);
  };

  const deleteProduct = (id) => {
    if (confirm('确定要删除这个商品吗？')) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditingProduct({ ...editingProduct, image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  // Order Management
  const placeOrder = () => {
    if (!checkoutForm.userName || !checkoutForm.phone || !checkoutForm.address) {
      alert('请填写姓名、手机号和地址');
      return;
    }
    
    // Incrementing order ID starting from #1
    const nextOrderNum = orders.length + 1;
    
    const newOrder = { 
      id: nextOrderNum, 
      items: [...cart], 
      total: cart.reduce((s, i) => s + i.price * i.quantity, 0), 
      status: 'pending', 
      paid: false,
      address: checkoutForm.address, 
      userName: checkoutForm.userName, 
      phone: checkoutForm.phone,
      note: checkoutForm.note,
      createdAt: new Date().toLocaleString() 
    };
    
    setProducts(products.map(p => { 
      const ci = cart.find(c => c.id === p.id); 
      return ci ? { ...p, stock: p.stock - ci.quantity } : p; 
    }));
    setOrders([newOrder, ...orders]);
    setCart([]);
    setCheckoutForm({ userName: '', phone: '', address: '', note: '' });
    setActiveTab('orders');
  };

  // Common Actions
  const toggleProductStatus = (id) => setProducts(products.map(p => p.id === id ? { ...p, status: p.status === 'onsale' ? 'offsite' : 'onsale' } : p));
  const updateStock = (id, newStock) => setProducts(products.map(p => p.id === id ? { ...p, stock: Math.max(0, parseInt(newStock) || 0) } : p));
  const updateOrderStatus = (orderId, newStatus) => setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
  
  const addToCart = (product) => {
    if (product.stock <= 0) return;
    const existing = cart.find(item => item.id === product.id);
    if (existing) setCart(cart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
    else setCart([...cart, { ...product, quantity: 1 }]);
  };

  const handlePay = (orderId) => {
    setOrders(orders.map(o => o.id === orderId ? { ...o, paid: true, status: 'preparing' } : o));
  };

  const submitReview = () => {
    if (!reviewForm.comment.trim()) return;
    if (reviewForm.isEditing) {
      setReviews(reviews.map(r => r.id === reviewForm.reviewId ? { ...r, rating: reviewForm.rating, comment: reviewForm.comment } : r));
    } else {
      const order = orders.find(o => o.id === reviewForm.orderId);
      const newReviews = order.items.map(item => ({
        id: Date.now() + Math.random(),
        productId: item.id,
        orderId: order.id,
        userName: order.userName,
        rating: reviewForm.rating,
        comment: reviewForm.comment,
        date: new Date().toISOString().split('T')[0]
      }));
      setReviews([...newReviews, ...reviews]);
      setOrders(orders.map(o => o.id === reviewForm.orderId ? { ...o, reviewed: true } : o));
    }
    setReviewForm({ orderId: null, rating: 5, comment: '', isEditing: false, reviewId: null });
  };

  const deleteReview = (id) => {
    if (confirm('确认删除该评价吗？')) {
      setReviews(reviews.filter(r => r.id !== id));
    }
  };

  // --- UI Components ---
  const StatusBadge = ({ order }) => {
    if (!order.paid && order.status === 'pending') {
      return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">待支付</span>;
    }
    const c = { 
      pending: ['待支付', 'bg-yellow-100 text-yellow-800'], 
      preparing: ['备餐中', 'bg-blue-100 text-blue-800'], 
      ready: ['待配送', 'bg-purple-100 text-purple-800'], 
      delivering: ['配送中', 'bg-blue-100 text-blue-800'], 
      completed: ['已送达', 'bg-green-100 text-green-800'] 
    }[order.status] || ['未知', 'bg-gray-100'];
    return <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", c[1])}>{c[0]}</span>;
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans pb-10">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50 px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src="/xiaoba.jpeg" className="w-10 h-10 rounded-full object-cover border-2 border-blue-500" alt="logo" />
          <span className="font-bold text-xl text-blue-900">小八外卖</span>
        </div>
        <div className="flex bg-gray-100 p-1 rounded-lg text-sm">
          {['user', 'merchant', 'rider'].map(r => (
            <button key={r} onClick={() => { setRole(r); setActiveTab(r === 'user' ? 'shop' : r === 'merchant' ? 'inventory' : 'delivery'); setEditingProduct(null); }} className={cn("px-4 py-1.5 rounded-md transition-all", role === r ? "bg-white shadow font-bold text-blue-600" : "text-gray-500")}>
              {r === 'user' ? '用户' : r === 'merchant' ? '商家' : '骑手'}
            </button>
          ))}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {role === 'user' && (
          <div className="space-y-6">
            <div className="flex gap-4 border-b">
              {['shop', 'orders'].map(t => (
                <button key={t} onClick={() => setActiveTab(t)} className={cn("pb-2 px-2 transition-all", activeTab === t ? "border-b-2 border-blue-500 text-blue-600 font-bold" : "text-gray-500")}>
                  {t === 'shop' ? '逛逛' : '订单'}
                </button>
              ))}
            </div>

            {activeTab === 'shop' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {products.filter(p => p.status === 'onsale').map(p => (
                      <div key={p.id} className="bg-white rounded-xl border p-4 flex flex-col gap-3">
                        <img src={p.image} className="w-full h-40 object-cover rounded-lg" />
                        <div className="flex justify-between font-bold text-lg"><span>{p.name}</span><span className="text-blue-600">¥{p.price}</span></div>
                        <p className="text-gray-500 text-sm line-clamp-2">{p.description}</p>
                        <div className="flex justify-between items-center mt-auto">
                          <span className="text-xs text-gray-400">库存: {p.stock}</span>
                          <button onClick={() => addToCart(p)} disabled={p.stock <= 0} className="bg-blue-600 text-white p-2 rounded-full disabled:bg-gray-300 hover:bg-blue-700"><Plus size={18} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-white p-6 rounded-xl border h-fit sticky top-24 space-y-4">
                  <h3 className="font-bold text-lg flex items-center gap-2"><ShoppingBag size={20} className="text-blue-600" /> 购物车</h3>
                  {cart.length === 0 ? <p className="text-gray-400 text-center py-10">购物车是空的</p> : (
                    <div className="space-y-4">
                      {cart.map(i => (
                        <div key={i.id} className="flex justify-between items-center text-sm">
                          <div><p className="font-bold">{i.name}</p><p className="text-gray-400">¥{i.price} x {i.quantity}</p></div>
                          <button onClick={() => setCart(cart.filter(c => c.id !== i.id))}><X size={16} className="text-gray-300" /></button>
                        </div>
                      ))}
                      <div className="border-t pt-4 flex justify-between font-bold"><span>合计</span><span className="text-blue-600 text-xl">¥{cart.reduce((s, i) => s + i.price * i.quantity, 0)}</span></div>
                      <button onClick={() => setActiveTab('checkout')} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700">去结算</button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'checkout' && (
              <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl border shadow-sm space-y-6">
                <h2 className="text-2xl font-bold flex items-center gap-2"><MapPin className="text-blue-600" /> 配送信息</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-sm font-bold mb-1">收货人姓名</label><input type="text" value={checkoutForm.userName} onChange={e => setCheckoutForm({...checkoutForm, userName: e.target.value})} className="w-full border rounded-lg p-3" placeholder="怎么称呼您？" /></div>
                    <div><label className="block text-sm font-bold mb-1">手机号码</label><input type="tel" value={checkoutForm.phone} onChange={e => setCheckoutForm({...checkoutForm, phone: e.target.value})} className="w-full border rounded-lg p-3" placeholder="联系电话" /></div>
                  </div>
                  <div><label className="block text-sm font-bold mb-1">详细地址</label><input type="text" value={checkoutForm.address} onChange={e => setCheckoutForm({...checkoutForm, address: e.target.value})} className="w-full border rounded-lg p-3" placeholder="送到哪里？" /></div>
                  <div><label className="block text-sm font-bold mb-1">订单备注</label><textarea value={checkoutForm.note} onChange={e => setCheckoutForm({...checkoutForm, note: e.target.value})} className="w-full border rounded-lg p-3" placeholder="口味偏好、配送要求等..." rows="3" /></div>
                </div>
                <div className="border-t pt-6">
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-gray-500">应付总额</span>
                    <span className="text-3xl font-bold text-blue-600">¥{cart.reduce((s, i) => s + i.price * i.quantity, 0)}</span>
                  </div>
                  <div className="flex gap-4">
                    <button onClick={() => setActiveTab('shop')} className="flex-1 border border-gray-200 py-3 rounded-xl font-bold text-gray-500">返回修改</button>
                    <button onClick={placeOrder} className="flex-2 bg-blue-600 text-white py-3 px-8 rounded-xl font-bold shadow-lg shadow-blue-100">提交订单</button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="space-y-6">
                {reviewForm.orderId !== null && (
                  <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 space-y-4 animate-in fade-in slide-in-from-top-4">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                      {reviewForm.isEditing ? <Edit3 size={20} /> : <MessageSquare size={20} />} 
                      {reviewForm.isEditing ? '修改评价' : '发表评价'}
                    </h3>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map(s => <button key={s} onClick={() => setReviewForm({ ...reviewForm, rating: s })}><Star className={cn("w-6 h-6", reviewForm.rating >= s ? "text-yellow-400 fill-current" : "text-gray-200")} /></button>)}
                    </div>
                    <textarea value={reviewForm.comment} onChange={e => setReviewForm({ ...reviewForm, comment: e.target.value })} className="w-full border border-blue-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="分享你的用餐体验..." rows="3" />
                    <div className="flex gap-2">
                      <button onClick={submitReview} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold text-sm">提交</button>
                      <button onClick={() => setReviewForm({ orderId: null, rating: 5, comment: '', isEditing: false, reviewId: null })} className="text-gray-500 px-4 py-2 text-sm">取消</button>
                    </div>
                  </div>
                )}

                {orders.length === 0 ? <p className="text-center py-20 text-gray-400">还没订单呢</p> : orders.map(o => (
                  <div key={o.id} className="bg-white p-6 rounded-xl border space-y-4 shadow-sm">
                    <div className="flex justify-between items-start">
                      <div><h3 className="font-bold text-lg">订单 #{o.id}</h3><p className="text-xs text-gray-400">{o.createdAt}</p></div>
                      <StatusBadge order={o} />
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                      {o.items.map((i, idx) => <div key={idx} className="flex justify-between text-sm"><span>{i.name} x {i.quantity}</span><span>¥{i.price * i.quantity}</span></div>)}
                      {o.note && <div className="text-[10px] text-blue-400 mt-2 pt-2 border-t border-gray-100">备注: {o.note}</div>}
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs text-gray-500 flex items-center gap-1"><MapPin size={12} /> {o.userName} ({o.phone}) · {o.address}</span>
                        <span className="text-xl font-bold text-blue-600">¥{o.total}</span>
                      </div>
                      <div className="flex gap-2">
                        {!o.paid && (
                          <button onClick={() => handlePay(o.id)} className="bg-red-500 text-white px-6 py-2 rounded-lg font-bold text-sm flex items-center gap-2 shadow-lg shadow-red-100"><CreditCard size={16} /> 立即支付</button>
                        )}
                        {o.status === 'completed' && !o.reviewed && (
                          <button onClick={() => setReviewForm({...reviewForm, orderId: o.id})} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2"><MessageSquare size={16} /> 评价</button>
                        )}
                      </div>
                    </div>
                    
                    {reviews.filter(r => r.orderId === o.id).map(r => (
                      <div key={r.id} className="mt-4 pt-4 border-t border-dashed border-gray-100 flex justify-between items-start">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <div className="flex text-yellow-400">{[...Array(r.rating)].map((_, i) => <Star key={i} size={10} className="fill-current" />)}</div>
                            <span className="text-[10px] text-gray-400">{r.date}</span>
                          </div>
                          <p className="text-xs text-gray-600 italic">“{r.comment}”</p>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => setReviewForm({ orderId: r.orderId, rating: r.rating, comment: r.comment, isEditing: true, reviewId: r.id })} className="text-blue-500 hover:bg-blue-50 p-1.5 rounded-full transition-colors"><Edit3 size={14} /></button>
                          <button onClick={() => deleteReview(r.id)} className="text-red-400 hover:bg-red-50 p-1.5 rounded-full transition-colors"><Trash2 size={14} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {role === 'merchant' && (
          <div className="space-y-6">
            <div className="flex gap-4 border-b">
              {['inventory', 'orders', 'reviews'].map(t => <button key={t} onClick={() => setActiveTab(t)} className={cn("pb-2 px-2 transition-all", activeTab === t ? "border-b-2 border-blue-500 text-blue-600 font-bold" : "text-gray-500")}>{t === 'inventory' ? '商品' : t === 'orders' ? '订单' : '评价'}</button>)}
            </div>

            {editingProduct ? (
              <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl border shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold">{editingProduct.id ? '编辑商品' : '添加商品'}</h2>
                  <button onClick={() => setEditingProduct(null)} className="text-gray-400 hover:text-gray-600"><X /></button>
                </div>
                <form onSubmit={handleProductSubmit} className="space-y-4">
                  <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl gap-4 bg-gray-50 relative overflow-hidden group">
                    {editingProduct.image ? (
                      <>
                        <img src={editingProduct.image} className="max-h-40 object-cover rounded-lg" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button type="button" onClick={() => fileInputRef.current.click()} className="text-white flex items-center gap-2 font-bold"><Upload size={18} /> 更换图片</button>
                        </div>
                      </>
                    ) : (
                      <button type="button" onClick={() => fileInputRef.current.click()} className="flex flex-col items-center text-gray-400">
                        <Upload size={32} />
                        <span className="text-xs mt-2">选择商品宣传图</span>
                      </button>
                    )}
                    <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
                  </div>
                  <div><label className="block text-sm font-bold mb-1">商品名称</label><input type="text" value={editingProduct.name} onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} className="w-full border rounded-lg p-2" required /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-sm font-bold mb-1">价格 (¥)</label><input type="number" value={editingProduct.price} onChange={e => setEditingProduct({...editingProduct, price: parseInt(e.target.value)})} className="w-full border rounded-lg p-2" required /></div>
                    <div><label className="block text-sm font-bold mb-1">初始库存</label><input type="number" value={editingProduct.stock} onChange={e => setEditingProduct({...editingProduct, stock: parseInt(e.target.value)})} className="w-full border rounded-lg p-2" required /></div>
                  </div>
                  <div><label className="block text-sm font-bold mb-1">商品描述</label><textarea value={editingProduct.description} onChange={e => setEditingProduct({...editingProduct, description: e.target.value})} className="w-full border rounded-lg p-2" rows="3" /></div>
                  <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 shadow-lg shadow-blue-100"><Save size={18} /> 保存商品</button>
                </form>
              </div>
            ) : activeTab === 'inventory' ? (
              <div className="space-y-4">
                <div className="flex justify-end"><button onClick={() => setEditingProduct({ name: '', price: 0, stock: 0, description: '', image: '', status: 'onsale' })} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-blue-700"><Plus size={16} /> 添加新商品</button></div>
                <div className="bg-white rounded-xl border overflow-hidden">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 border-b"><tr><th className="p-4">图片</th><th className="p-4">名称</th><th className="p-4">价格</th><th className="p-4">库存</th><th className="p-4">状态</th><th className="p-4 text-right">操作</th></tr></thead>
                    <tbody className="divide-y">
                      {products.map(p => (
                        <tr key={p.id}>
                          <td className="p-4"><img src={p.image} className="w-10 h-10 object-cover rounded shadow-sm" /></td>
                          <td className="p-4 font-bold">{p.name}</td>
                          <td className="p-4">¥{p.price}</td>
                          <td className="p-4"><input type="number" value={p.stock} onChange={e => updateStock(p.id, e.target.value)} className="w-16 border rounded px-1" /></td>
                          <td className="p-4"><span className={cn("px-2 py-0.5 rounded-full text-xs", p.status === 'onsale' ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800")}>{p.status === 'onsale' ? '上架中' : '已下架'}</span></td>
                          <td className="p-4 text-right flex justify-end gap-3">
                            <button onClick={() => setEditingProduct(p)} className="text-blue-600 hover:text-blue-800"><Edit3 size={18} /></button>
                            <button onClick={() => toggleProductStatus(p.id)} className={cn("font-bold text-xs", p.status === 'onsale' ? "text-blue-600" : "text-green-600")}>{p.status === 'onsale' ? '下架' : '上架'}</button>
                            <button onClick={() => deleteProduct(p.id)} className="text-red-500 hover:text-red-700"><Trash2 size={18} /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : activeTab === 'orders' ? (
              <div className="space-y-4">
                {orders.map(o => (
                  <div key={o.id} className="bg-white p-6 rounded-xl border flex flex-col gap-4">
                    <div className="flex justify-between items-start">
                      <div><h3 className="font-bold">客户: {o.userName} ({o.phone})</h3><p className="text-xs text-gray-400">订单号: #{o.id}</p></div>
                      <StatusBadge order={o} />
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg text-sm">{o.items.map((i, idx) => <div key={idx}>{i.name} x {i.quantity}</div>)}</div>
                    <div className="flex justify-between items-center">
                      <div className="space-y-1">
                        <p className="text-xs text-gray-400 font-bold">地址: {o.address}</p>
                        {o.note && <p className="text-xs text-blue-500">备注: {o.note}</p>}
                      </div>
                      <div className="flex gap-2">
                        {o.paid && o.status === 'preparing' && <button onClick={() => updateOrderStatus(o.id, 'ready')} className="bg-green-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-green-700">备餐完成</button>}
                        {!o.paid && <span className="text-xs text-red-500 font-bold animate-pulse">等待用户支付...</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reviews.map(r => (
                  <div key={r.id} className="bg-white p-6 rounded-xl border space-y-2">
                    <div className="flex justify-between font-bold"><span>{r.userName}</span><div className="flex text-yellow-400">{[...Array(r.rating)].map((_, i) => <Star key={i} size={14} className="fill-current" />)}</div></div>
                    <p className="text-gray-600 text-sm">{r.comment}</p>
                    <p className="text-xs text-gray-400">商品: {products.find(p => p.id === r.productId)?.name} | {r.date}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {role === 'rider' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-2"><Truck className="text-green-600" /> 配送中心</h2>
            <div className="space-y-4">
              {orders.filter(o => o.paid && ['ready', 'delivering'].includes(o.status)).length === 0 ? <p className="text-center py-20 text-gray-400 bg-white rounded-xl border border-dashed">暂无任务</p> : (
                orders.filter(o => o.paid && ['ready', 'delivering'].includes(o.status)).map(o => (
                  <div key={o.id} className="bg-white p-6 rounded-xl border-l-4 border-green-500 shadow-md space-y-4">
                    <div className="flex justify-between items-start">
                      <div><span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">{o.status === 'ready' ? '待取货' : '配送中'}</span><h3 className="font-bold text-lg mt-1">订单 #{o.id}</h3></div>
                      <p className="text-xs text-gray-400">时间: {o.createdAt.split(' ')[1]}</p>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p className="text-gray-400 font-bold uppercase text-[10px]">取货地址</p><p className="font-bold">演示餐厅 (张江店)</p>
                      <p className="text-gray-400 font-bold uppercase text-[10px]">送货地址</p><p className="font-bold">{o.address} (客户: {o.userName} · {o.phone})</p>
                      {o.note && <p className="text-[10px] text-blue-500 bg-blue-50 p-2 rounded">备注: {o.note}</p>}
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg text-xs">{o.items.map((i, idx) => <div key={idx} className="flex justify-between"><span>{i.name}</span><span>x{i.quantity}</span></div>)}</div>
                    {o.status === 'ready' ? (
                      <button onClick={() => updateOrderStatus(o.id, 'delivering')} className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700">确认取货</button>
                    ) : (
                      <button onClick={() => updateOrderStatus(o.id, 'completed')} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700">确认送达</button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>

      {/* Role Tag */}
      <div className="fixed bottom-6 right-6 bg-gray-900 text-white px-4 py-2 rounded-full text-[10px] font-bold flex items-center gap-2 shadow-2xl z-50">
        <div className={cn("w-2 h-2 rounded-full animate-pulse", role === 'user' ? "bg-blue-500" : role === 'merchant' ? "bg-blue-500" : "bg-green-500")} />
        {role === 'user' ? '用户端' : role === 'merchant' ? '商家端' : '骑手端'}
      </div>
    </div>
  );
}
