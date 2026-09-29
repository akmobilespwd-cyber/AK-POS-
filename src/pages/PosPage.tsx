import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Search, Barcode, ShoppingCart, Trash2, Plus, Minus, 
  CreditCard, Check, User, Car, Percent, DollarSign, 
  Sparkles, Save, PauseCircle, PlayCircle, RotateCcw, 
  Tag, Shield, Wrench, Package, Disc3, BatteryCharging, 
  Layers, CheckCircle, Split
} from 'lucide-react';
import { CartItem, PaymentMethod, ProductCategory, Product, ServiceItem } from '../types';

export const PosPage: React.FC = () => {
  const { 
    products, 
    services, 
    customers, 
    vehicles, 
    createPOSSale, 
    settings,
    addToast,
    addCustomer,
    addVehicle 
  } = useApp();

  // Selected Category filter
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [barcodeQuery, setBarcodeQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<string>('All');

  // Cart State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(customers[0]?.id || '');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');
  const [invoiceDiscount, setInvoiceDiscount] = useState<number>(0);
  const [includeTax, setIncludeTax] = useState<boolean>(true);
  const [notes, setNotes] = useState<string>('');

  // Payment State & Modals
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [amountPaid, setAmountPaid] = useState<number>(0);
  const [splitCashAmount, setSplitCashAmount] = useState<number>(0);
  const [splitCardAmount, setSplitCardAmount] = useState<number>(0);

  // Quick Customer Creation modal
  const [isNewCustomerModalOpen, setIsNewCustomerModalOpen] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newVehReg, setNewVehReg] = useState('');
  const [newVehMake, setNewVehMake] = useState('');
  const [newVehModel, setNewVehModel] = useState('');

  // Held Orders (Hold / Resume)
  const [heldOrders, setHeldOrders] = useState<{ id: string; timestamp: string; customerName: string; cart: CartItem[]; total: number }[]>([]);

  // Unique Brands
  const brands = useMemo(() => {
    const list = Array.from(new Set(products.map(p => p.brand).filter(Boolean)));
    return ['All', ...list];
  }, [products]);

  // Customer's vehicles
  const customerVehicles = useMemo(() => {
    return vehicles.filter(v => v.customerId === selectedCustomerId);
  }, [vehicles, selectedCustomerId]);

  // Filtered Products + Services Catalog
  const filteredCatalog = useMemo(() => {
    let prods = products;
    if (selectedCategory !== 'All' && selectedCategory !== 'Services') {
      prods = prods.filter(p => p.category === selectedCategory);
    }
    if (selectedBrand !== 'All') {
      prods = prods.filter(p => p.brand === selectedBrand);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      prods = prods.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.sku.toLowerCase().includes(q) || 
        p.barcode.includes(q) ||
        (p.compatibility && p.compatibility.toLowerCase().includes(q))
      );
    }

    // Include services if category is All or Services
    let servs: ServiceItem[] = [];
    if (selectedCategory === 'All' || selectedCategory === 'Services') {
      servs = services.filter(s => s.isActive);
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        servs = servs.filter(s => s.name.toLowerCase().includes(q) || s.category.toLowerCase().includes(q));
      }
    }

    return { products: selectedCategory === 'Services' ? [] : prods, services: selectedCategory === 'Spare Part' || selectedCategory === 'Tyre' || selectedCategory === 'Battery' ? [] : servs };
  }, [products, services, selectedCategory, selectedBrand, searchQuery]);

  // Add Product to Cart
  const handleAddProductToCart = (prod: Product) => {
    if (prod.stock <= 0) {
      addToast('warning', 'Out of Stock', `${prod.name} has 0 physical stock in store`);
      return;
    }

    setCart(prev => {
      const existing = prev.find(item => item.productId === prod.id);
      if (existing) {
        if (existing.quantity >= prod.stock) {
          addToast('warning', 'Stock Limit', `Cannot exceed available warehouse stock (${prod.stock})`);
          return prev;
        }
        return prev.map(item => item.productId === prod.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [
        ...prev,
        {
          productId: prod.id,
          sku: prod.sku,
          name: prod.name,
          category: prod.category,
          price: prod.salePrice,
          quantity: 1,
          stock: prod.stock,
          discountPercent: 0,
          taxPercent: settings.defaultTaxRate,
          isService: false,
        }
      ];
    });
  };

  // Add Service to Cart
  const handleAddServiceToCart = (srv: ServiceItem) => {
    setCart(prev => {
      const existing = prev.find(item => item.productId === srv.id && item.isService);
      if (existing) {
        return prev.map(item => item.productId === srv.id && item.isService ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [
        ...prev,
        {
          productId: srv.id,
          sku: 'SRV-' + srv.id.slice(-4),
          name: srv.name,
          category: 'Service',
          price: srv.labourPrice,
          quantity: 1,
          stock: 999,
          discountPercent: 0,
          taxPercent: settings.defaultTaxRate,
          isService: true,
        }
      ];
    });
  };

  // Barcode Instant Match Add
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeQuery.trim()) return;
    const match = products.find(p => p.barcode === barcodeQuery.trim() || p.sku.toLowerCase() === barcodeQuery.trim().toLowerCase());
    if (match) {
      handleAddProductToCart(match);
      addToast('success', 'Scanned', `Added ${match.name}`);
      setBarcodeQuery('');
    } else {
      addToast('error', 'Barcode Not Found', `No matching product for barcode ${barcodeQuery}`);
    }
  };

  // Cart Calculations
  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => {
      const itemSub = item.price * item.quantity;
      const discount = (itemSub * (item.discountPercent || 0)) / 100;
      return sum + (itemSub - discount);
    }, 0);
  }, [cart]);

  const taxAmount = useMemo(() => {
    if (!includeTax) return 0;
    const net = Math.max(0, subtotal - invoiceDiscount);
    return Number((net * (settings.defaultTaxRate / 100)).toFixed(2));
  }, [subtotal, invoiceDiscount, includeTax, settings.defaultTaxRate]);

  const grandTotal = useMemo(() => {
    const net = Math.max(0, subtotal - invoiceDiscount);
    return Number((net + taxAmount).toFixed(2));
  }, [subtotal, invoiceDiscount, taxAmount]);

  // Adjust item quantity
  const handleUpdateQuantity = (productId: string, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveItem(productId);
      return;
    }
    const item = cart.find(c => c.productId === productId);
    if (item && !item.isService && newQty > item.stock) {
      addToast('warning', 'Stock Limit', `Only ${item.stock} units available`);
      return;
    }
    setCart(prev => prev.map(c => c.productId === productId ? { ...c, quantity: newQty } : c));
  };

  const handleRemoveItem = (productId: string) => {
    setCart(prev => prev.filter(c => c.productId !== productId));
  };

  const handleClearCart = () => {
    setCart([]);
    setInvoiceDiscount(0);
    setNotes('');
  };

  // Hold Order
  const handleHoldOrder = () => {
    if (cart.length === 0) return;
    const cust = customers.find(c => c.id === selectedCustomerId);
    const order = {
      id: 'hold-' + Date.now(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      customerName: cust?.name || 'Walk-in',
      cart: [...cart],
      total: grandTotal,
    };
    setHeldOrders(prev => [order, ...prev]);
    setCart([]);
    addToast('info', 'Order Held', `Saved to pending queue (${order.customerName})`);
  };

  const handleResumeOrder = (orderId: string) => {
    const order = heldOrders.find(o => o.id === orderId);
    if (!order) return;
    setCart(order.cart);
    setHeldOrders(prev => prev.filter(o => o.id !== orderId));
    addToast('success', 'Order Resumed', `Restored ${order.customerName}'s cart`);
  };

  // Open Checkout Modal
  const handleOpenCheckout = () => {
    if (cart.length === 0) {
      addToast('warning', 'Cart Empty', 'Please add products or services to checkout');
      return;
    }
    if (!selectedCustomerId) {
      addToast('warning', 'No Customer', 'Please select or create a customer for the invoice');
      return;
    }
    setAmountPaid(grandTotal);
    setSplitCashAmount(Number((grandTotal / 2).toFixed(2)));
    setSplitCardAmount(Number((grandTotal - Number((grandTotal / 2).toFixed(2))).toFixed(2)));
    setIsPaymentModalOpen(true);
  };

  // Execute Sale Complete Flow
  const handleCompleteSale = () => {
    createPOSSale({
      customerId: selectedCustomerId,
      vehicleId: selectedVehicleId || undefined,
      cart,
      invoiceDiscount,
      taxRate: includeTax ? settings.defaultTaxRate : 0,
      paymentMethod,
      paidAmount: paymentMethod === 'Credit' ? 0 : amountPaid,
      notes,
    });

    setIsPaymentModalOpen(false);
    handleClearCart();
  };

  // Quick Customer & Vehicle Registration
  const handleQuickRegisterCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName || !newCustPhone) return;

    const newCust = addCustomer({
      name: newCustName,
      phone: newCustPhone,
      creditLimit: 1000,
      notes: 'Registered via POS quick register',
    });

    let newVehId = '';
    if (newVehReg && newVehMake) {
      const newVeh = addVehicle({
        customerId: newCust.id,
        regNumber: newVehReg.toUpperCase(),
        make: newVehMake,
        model: newVehModel || 'Standard',
        year: 2022,
        color: 'Silver',
        mileage: 0,
        fuelType: 'Petrol',
      });
      newVehId = newVeh.id;
    }

    setSelectedCustomerId(newCust.id);
    if (newVehId) setSelectedVehicleId(newVehId);

    setIsNewCustomerModalOpen(false);
    setNewCustName('');
    setNewCustPhone('');
    setNewVehReg('');
    setNewVehMake('');
    setNewVehModel('');
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-6.5rem)] print:hidden">
      {/* ======================================================== */}
      {/* LEFT SECTION: Search, Barcode, Categories & Catalog Grid */}
      {/* ======================================================== */}
      <div className="flex-1 flex flex-col bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl min-w-0">
        {/* Search & Barcode Bar */}
        <div className="p-3 border-b border-slate-800 bg-slate-950/40 flex flex-wrap gap-2 items-center justify-between">
          {/* Main search text */}
          <div className="relative flex-1 min-w-[180px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search part name, SKU, compatibility..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Barcode scanner input */}
          <form onSubmit={handleBarcodeSubmit} className="relative w-48 shrink-0">
            <Barcode className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-amber-400" />
            <input
              type="text"
              placeholder="Scan Barcode [Enter]..."
              value={barcodeQuery}
              onChange={(e) => setBarcodeQuery(e.target.value)}
              className="w-full bg-slate-950 border border-amber-500/40 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 font-mono"
            />
          </form>

          {/* Brand Filter */}
          <select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="bg-slate-950 border border-slate-700/80 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
          >
            {brands.map(b => (
              <option key={b} value={b}>{b === 'All' ? 'All Brands' : b}</option>
            ))}
          </select>
        </div>

        {/* Category Tabs */}
        <div className="px-3 py-2 border-b border-slate-800/80 bg-slate-950/20 flex items-center space-x-1.5 overflow-x-auto custom-scrollbar">
          {[
            { id: 'All', label: 'All Items', icon: <Layers className="w-3.5 h-3.5" /> },
            { id: 'Spare Part', label: 'Spare Parts', icon: <Package className="w-3.5 h-3.5" /> },
            { id: 'Services', label: 'Labour & Services', icon: <Wrench className="w-3.5 h-3.5" /> },
            { id: 'Tyre', label: 'Tyres', icon: <Disc3 className="w-3.5 h-3.5" /> },
            { id: 'Battery', label: 'Batteries', icon: <BatteryCharging className="w-3.5 h-3.5" /> },
            { id: 'Fluid', label: 'Lubricants & Fluids', icon: <Tag className="w-3.5 h-3.5" /> },
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-amber-500 text-slate-950 shadow-sm shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Catalog Grid View */}
        <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2.5">
            {/* Products */}
            {filteredCatalog.products.map(prod => {
              const inCart = cart.find(c => c.productId === prod.id);
              const isOutOfStock = prod.stock <= 0;
              return (
                <div
                  key={prod.id}
                  onClick={() => !isOutOfStock && handleAddProductToCart(prod)}
                  className={`relative p-3 bg-slate-950/60 border rounded-xl flex flex-col justify-between transition-all select-none ${
                    isOutOfStock
                      ? 'border-slate-800 opacity-50 cursor-not-allowed'
                      : inCart
                      ? 'border-amber-500 bg-amber-500/5 cursor-pointer shadow-md'
                      : 'border-slate-800/80 hover:border-slate-700 hover:bg-slate-800/40 cursor-pointer'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400/90 truncate">
                        {prod.brand}
                      </span>
                      <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-semibold ${
                        prod.stock <= prod.minStock ? 'bg-rose-500/20 text-rose-400' : 'bg-slate-800 text-slate-300'
                      }`}>
                        {prod.stock} in stock
                      </span>
                    </div>
                    <h4 className="text-xs font-semibold text-slate-100 line-clamp-2 leading-tight">
                      {prod.name}
                    </h4>
                    {prod.compatibility && (
                      <p className="text-[10px] text-slate-500 truncate mt-1">
                        {prod.compatibility}
                      </p>
                    )}
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between">
                    <span className="text-sm font-extrabold font-mono text-white">
                      {settings.currency}{prod.salePrice.toFixed(2)}
                    </span>
                    <button
                      disabled={isOutOfStock}
                      className="p-1 rounded-lg bg-amber-500/20 text-amber-400 hover:bg-amber-500 hover:text-slate-950 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {inCart && (
                    <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-bold text-[10px] flex items-center justify-center shadow">
                      {inCart.quantity}
                    </span>
                  )}
                </div>
              );
            })}

            {/* Services */}
            {filteredCatalog.services.map(srv => {
              const inCart = cart.find(c => c.productId === srv.id && c.isService);
              return (
                <div
                  key={srv.id}
                  onClick={() => handleAddServiceToCart(srv)}
                  className={`p-3 bg-slate-950/60 border rounded-xl flex flex-col justify-between transition-all select-none cursor-pointer ${
                    inCart ? 'border-blue-500 bg-blue-500/5' : 'border-slate-800/80 hover:border-slate-700 hover:bg-slate-800/40'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
                        LABOUR SERVICE
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {srv.estimatedDurationMin}m
                      </span>
                    </div>
                    <h4 className="text-xs font-semibold text-slate-100 line-clamp-2 leading-tight">
                      {srv.name}
                    </h4>
                    <p className="text-[10px] text-slate-500 line-clamp-2 mt-1">
                      {srv.description}
                    </p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between">
                    <span className="text-sm font-extrabold font-mono text-white">
                      {settings.currency}{srv.labourPrice.toFixed(2)}
                    </span>
                    <button className="p-1 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500 hover:text-white transition-colors">
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {inCart && (
                    <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-blue-500 text-white font-bold text-[10px] flex items-center justify-center shadow">
                      {inCart.quantity}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {filteredCatalog.products.length === 0 && filteredCatalog.services.length === 0 && (
            <div className="py-12 text-center text-slate-500 text-xs">
              No matching products or services found for this query.
            </div>
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* RIGHT SECTION: Customer, Vehicle, Live Cart, Totals & Pay */}
      {/* ======================================================== */}
      <div className="w-full lg:w-96 flex flex-col bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl shrink-0">
        {/* Customer & Vehicle Header Box */}
        <div className="p-3 border-b border-slate-800 bg-slate-950/40 space-y-2">
          {/* Customer Selection Row */}
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <select
                value={selectedCustomerId}
                onChange={(e) => {
                  setSelectedCustomerId(e.target.value);
                  setSelectedVehicleId('');
                }}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              >
                {customers.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.phone})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setIsNewCustomerModalOpen(true)}
              title="Add New Customer"
              className="p-1.5 bg-amber-500/20 text-amber-400 hover:bg-amber-500 hover:text-slate-950 rounded-xl transition-colors shrink-0"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Vehicle Selection Row */}
          <div className="flex items-center space-x-2">
            <Car className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={selectedVehicleId}
              onChange={(e) => setSelectedVehicleId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-1 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
            >
              <option value="">No Vehicle Attached (Over-the-Counter)</option>
              {customerVehicles.map(v => (
                <option key={v.id} value={v.id}>
                  {v.regNumber} - {v.make} {v.model}
                </option>
              ))}
            </select>
          </div>

          {/* Held Orders quick bar if any */}
          {heldOrders.length > 0 && (
            <div className="pt-1 flex items-center justify-between text-[11px] text-amber-400 bg-amber-500/10 px-2 py-1 rounded-lg">
              <span>{heldOrders.length} Held Order(s) pending</span>
              <button
                onClick={() => handleResumeOrder(heldOrders[0].id)}
                className="font-bold underline text-amber-300 hover:text-amber-200"
              >
                Resume latest
              </button>
            </div>
          )}
        </div>

        {/* Cart Item Rows */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 text-xs">
              <ShoppingCart className="w-10 h-10 text-slate-700 mb-2" />
              <p className="font-semibold text-slate-400">Cart is empty</p>
              <p className="text-[11px] mt-1">Tap items on the catalog or scan barcodes to begin sale</p>
            </div>
          ) : (
            cart.map(item => {
              const itemTotal = (item.price * item.quantity * (1 - (item.discountPercent || 0) / 100));
              return (
                <div
                  key={item.productId}
                  className="p-2.5 bg-slate-950/60 border border-slate-800/80 rounded-xl flex items-center justify-between gap-2 text-xs"
                >
                  <div className="flex-1 min-w-0">
                    <h5 className="font-semibold text-slate-200 truncate">{item.name}</h5>
                    <div className="flex items-center space-x-2 text-[11px] text-slate-400 mt-0.5 font-mono">
                      <span>{settings.currency}{item.price.toFixed(2)}</span>
                      <span>×</span>
                      <span className="text-amber-400 font-bold">{item.quantity}</span>
                      <span>=</span>
                      <span className="text-white font-bold">{settings.currency}{itemTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Quantity controls */}
                  <div className="flex items-center space-x-1 shrink-0">
                    <button
                      onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)}
                      className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center font-mono font-bold text-slate-100">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
                      className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleRemoveItem(item.productId)}
                      className="w-6 h-6 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 flex items-center justify-center transition-colors ml-1"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Invoice Discount & Tax Configuration */}
        {cart.length > 0 && (
          <div className="px-3 py-2 border-t border-slate-800/80 bg-slate-950/30 space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-[11px]">Invoice Discount ($):</span>
              <input
                type="number"
                min="0"
                step="1"
                value={invoiceDiscount}
                onChange={(e) => setInvoiceDiscount(Math.max(0, Number(e.target.value) || 0))}
                className="w-20 bg-slate-950 border border-slate-700/80 rounded-lg px-2 py-0.5 text-right font-mono text-xs text-white"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-1.5 cursor-pointer text-slate-400 text-[11px]">
                <input
                  type="checkbox"
                  checked={includeTax}
                  onChange={(e) => setIncludeTax(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-950 text-amber-500 focus:ring-amber-500 w-3 h-3"
                />
                <span>Apply Sales Tax ({settings.defaultTaxRate}%)</span>
              </label>
              <span className="font-mono text-slate-300">{settings.currency}{taxAmount.toFixed(2)}</span>
            </div>
          </div>
        )}

        {/* Cart Totals & Checkout Button */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/60 space-y-2">
          <div className="flex justify-between items-baseline">
            <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Grand Total</span>
            <span className="text-2xl font-black font-mono text-white">
              {settings.currency}{grandTotal.toFixed(2)}
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2">
            <button
              onClick={handleHoldOrder}
              disabled={cart.length === 0}
              className="py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 rounded-xl text-xs font-semibold flex items-center justify-center transition-colors"
              title="Hold this order in queue"
            >
              <PauseCircle className="w-4 h-4 mr-1" />
              <span>Hold</span>
            </button>

            <button
              onClick={handleClearCart}
              disabled={cart.length === 0}
              className="py-2 bg-slate-800 hover:bg-rose-500/20 hover:text-rose-400 disabled:opacity-40 text-slate-400 rounded-xl text-xs font-semibold flex items-center justify-center transition-colors"
              title="Clear Cart"
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              <span>Clear</span>
            </button>

            <button
              onClick={handleOpenCheckout}
              disabled={cart.length === 0}
              className="col-span-2 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-40 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider flex items-center justify-center space-x-1.5 shadow-lg shadow-amber-500/25 transition-all transform active:scale-95"
            >
              <CreditCard className="w-4 h-4 stroke-[2.5]" />
              <span>Checkout</span>
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* CHECKOUT & PAYMENT MODAL                                 */}
      {/* ======================================================== */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                  <CreditCard className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-extrabold text-base text-white uppercase">Finalize Sale Settlement</h3>
                  <p className="text-xs text-slate-400">Choose payment method & verify cash drawer amounts</p>
                </div>
              </div>
              <button
                onClick={() => setIsPaymentModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Total Display */}
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex justify-between items-center">
              <span className="text-xs text-slate-400 uppercase font-bold">Total Payable</span>
              <span className="text-2xl font-black font-mono text-amber-400">
                {settings.currency}{grandTotal.toFixed(2)}
              </span>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Payment Gateway / Method</label>
              <div className="grid grid-cols-3 gap-2">
                {(['Cash', 'Card', 'Bank Transfer', 'Mobile Wallet', 'Credit', 'Split Payment'] as PaymentMethod[]).map(method => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => {
                      setPaymentMethod(method);
                      if (method === 'Credit') {
                        setAmountPaid(0);
                      } else {
                        setAmountPaid(grandTotal);
                      }
                    }}
                    className={`py-2 px-2 rounded-xl text-xs font-bold transition-all border text-center ${
                      paymentMethod === method
                        ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm'
                        : 'bg-slate-800/80 text-slate-300 border-slate-700/80 hover:bg-slate-700'
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>

            {/* Amount input for partial or cash change calculation */}
            {paymentMethod !== 'Split Payment' && paymentMethod !== 'Credit' && (
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-300">Amount Tendered</span>
                  {amountPaid > grandTotal && (
                    <span className="text-emerald-400 font-bold">
                      Change Due: {settings.currency}{(amountPaid - grandTotal).toFixed(2)}
                    </span>
                  )}
                </div>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-base font-mono font-bold text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            )}

            {/* Split Payment inputs */}
            {paymentMethod === 'Split Payment' && (
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-950 rounded-xl border border-slate-800">
                <div>
                  <span className="text-xs text-slate-400 block mb-1">Cash Part ($)</span>
                  <input
                    type="number"
                    value={splitCashAmount}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setSplitCashAmount(v);
                      setSplitCardAmount(Number((grandTotal - v).toFixed(2)));
                      setAmountPaid(grandTotal);
                    }}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 font-mono text-xs text-white"
                  />
                </div>
                <div>
                  <span className="text-xs text-slate-400 block mb-1">Card Part ($)</span>
                  <input
                    type="number"
                    value={splitCardAmount}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setSplitCardAmount(v);
                      setSplitCashAmount(Number((grandTotal - v).toFixed(2)));
                      setAmountPaid(grandTotal);
                    }}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 font-mono text-xs text-white"
                  />
                </div>
              </div>
            )}

            {paymentMethod === 'Credit' && (
              <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-xl text-xs text-purple-300">
                Notice: Grand total will be booked to the customer's outstanding receivable ledger balance.
              </div>
            )}

            {/* Notes input */}
            <div>
              <label className="text-xs text-slate-400 block mb-1">Invoice Notes / PO Reference</label>
              <input
                type="text"
                placeholder="Optional memo (e.g. Paid in cash at counter)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsPaymentModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCompleteSale}
                className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20"
              >
                Confirm & Print Invoice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* QUICK NEW CUSTOMER & VEHICLE MODAL                       */}
      {/* ======================================================== */}
      {isNewCustomerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl">
            <h3 className="font-extrabold text-base text-white uppercase mb-1">Fast Register Customer</h3>
            <p className="text-xs text-slate-400 mb-4">Quick enroll customer and vehicle for immediate POS tagging</p>

            <form onSubmit={handleQuickRegisterCustomer} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Customer Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Johnathan Smith"
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Phone Number *</label>
                <input
                  type="text"
                  required
                  placeholder="+1 555-0199"
                  value={newCustPhone}
                  onChange={(e) => setNewCustPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                />
              </div>

              <div className="pt-2 border-t border-slate-800">
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block mb-2">Optional Vehicle</span>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Reg No (e.g. KAA-1002)"
                    value={newVehReg}
                    onChange={(e) => setNewVehReg(e.target.value)}
                    className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono"
                  />
                  <input
                    type="text"
                    placeholder="Make (e.g. Toyota)"
                    value={newVehMake}
                    onChange={(e) => setNewVehMake(e.target.value)}
                    className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsNewCustomerModalOpen(false)}
                  className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs uppercase"
                >
                  Save & Tag
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
