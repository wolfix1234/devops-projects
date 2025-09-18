"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Toaster, toast } from "react-hot-toast";
import Link from "next/link";
interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [shippingAddress, setShippingAddress] = useState({
    street: "",
    city: "",
    state: "",
    postalCode: "",
  });

  useEffect(() => {
    loadCartItems();
  }, []);

  const loadCartItems = async () => {
    const db = await openDB();
    const transaction = (db as IDBDatabase).transaction("cart", "readonly");
    const store = transaction.objectStore("cart");
    const request = store.getAll();
    request.onsuccess = () => {
      setCartItems(request.result as CartItem[]);
      setLoading(false);
    };
    request.onerror = () => {
      console.error("Failed to load cart items");
      setLoading(false);
    };
    setLoading(false);
  };
  const updateQuantity = async (itemId: string, change: number) => {
    const db = await openDB();
    const transaction = (db as IDBDatabase).transaction("cart", "readwrite");
    const store = transaction.objectStore("cart");

    const item = cartItems.find((item) => item.id === itemId);
    if (!item) return;

    const newQuantity = Math.max(0, item.quantity + change);

    if (newQuantity === 0) {
      // Remove item if quantity becomes 0
      await store.delete(itemId);
      setCartItems((prev) => prev.filter((item) => item.id !== itemId));
    } else {
      // Update quantity
      const updatedItem = { ...item, quantity: newQuantity };
      await store.put(updatedItem);
      setCartItems((prev) =>
        prev.map((item) => (item.id === itemId ? updatedItem : item))
      );
    }
  };
  const calculateTotal = () =>
    cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const initiatePayment = async () => {
    setPaymentLoading(true);
    const token = localStorage.getItem("tokenUser");
    
    if (!token) {
      toast.error("لطفا ابتدا وارد شوید");
      setPaymentLoading(false);
      return;
    }

    try {
      // Send cart items to server for validation and payment
      const response = await fetch("/api/payment/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          cartItems: cartItems.map((item) => ({
            productId: item.id,
            quantity: item.quantity,
            price: item.price // This will be validated server-side
          })),
          shippingAddress: {
            street: shippingAddress.street,
            city: shippingAddress.city,
            state: shippingAddress.state,
            postalCode: shippingAddress.postalCode,
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Payment response:", result);

      if (result.success && result.paymentUrl) {
        // Store only the authority for verification
        localStorage.setItem("paymentAuthority", result.authority);
        console.log("Redirecting to:", result.paymentUrl);
        window.location.href = result.paymentUrl;
      } else {
        console.error("Payment failed:", result);
        toast.error(result.message || "درخواست پرداخت ناموفق بود");
      }
    } catch (error) {
      console.error("Payment initiation error:", error);
      toast.error(error instanceof Error ? error.message : "خطا در ایجاد درخواست پرداخت");
    } finally {
      setPaymentLoading(false);
    }
  };

  const submitOrder = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    event.preventDefault();

    if (cartItems.length === 0) {
      toast.error("سبد خرید شما خالی است");
      return;
    }

    // Validate minimum amount (100 Toman)
    // if (calculateTotal() < 100000) {
    //   toast.error("حداقل مبلغ سفارش 100 تومان است. لطفا محصولات بیشتری اضافه کنید");
    //   return;
    // }

    // Validate shipping address
    if (
      !shippingAddress.street ||
      !shippingAddress.city ||
      !shippingAddress.state ||
      !shippingAddress.postalCode
    ) {
      toast.error("لطفا تمام فیلدهای آدرس را پر کنید");
      return;
    }

    initiatePayment();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 px-4 sm:px-6 lg:px-8 pt-36 pb-10">
      <Toaster position="top-right" />
       <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors duration-200 group"
          >
            <svg
              className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform duration-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <span className="font-medium">بازگشت به صفحه اصلی</span>
          </Link>
        </div>

      <div className="max-w-7xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold text-gray-800 mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600"
        >
          سبد خرید شما
        </motion.h1>

        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500" />
          </div>
        ) : cartItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12 bg-white rounded-2xl shadow-lg p-8"
          >
            <motion.div
              animate={{
                rotate: [0, 10, -10, 0],
                transition: { repeat: Infinity, duration: 2 },
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-32 w-32 mx-auto text-purple-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
            </motion.div>
            <p className="text-gray-600 text-xl mt-4">سبد خرید شما خالی است</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <AnimatePresence>
                {cartItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-6 flex items-center group"
                  >
                    <div className="relative overflow-hidden rounded-lg">
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={100}
                        height={100}
                        className="object-cover transform group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                    <div className="flex-1 mr-6">
                      <h3 className="text-xl font-semibold text-gray-800">
                        {item.name}
                      </h3>
                      <p className="text-purple-600 font-medium">
                        {item.price.toLocaleString()} تومان
                      </p>
                    </div>
                    <div className="flex items-center space-x-2 bg-gray-50 rounded-full p-1">
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => updateQuantity(item.id, -1)}
                        className="w-8 h-8 rounded-full bg-purple-100 hover:bg-purple-200 text-purple-600 flex items-center justify-center"
                      >
                        -
                      </motion.button>
                      <span className="mx-4 font-medium">{item.quantity}</span>
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => updateQuantity(item.id, 1)}
                        className="w-8 h-8 rounded-full bg-purple-100 hover:bg-purple-200 text-purple-600 flex items-center justify-center"
                      >
                        +
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-md p-6 mt-6"
              >
                <h3 className="text-xl font-semibold mb-4 text-gray-800">
                  آدرس تحویل
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="آدرس خیابان"
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none"
                    value={shippingAddress.street}
                    onChange={(e) =>
                      setShippingAddress((prev) => ({
                        ...prev,
                        street: e.target.value,
                      }))
                    }
                  />
                  <input
                    type="text"
                    placeholder="شهر"
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none"
                    value={shippingAddress.city}
                    onChange={(e) =>
                      setShippingAddress((prev) => ({
                        ...prev,
                        city: e.target.value,
                      }))
                    }
                  />
                  <input
                    type="text"
                    placeholder="استان"
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none"
                    value={shippingAddress.state}
                    onChange={(e) =>
                      setShippingAddress((prev) => ({
                        ...prev,
                        state: e.target.value,
                      }))
                    }
                  />
                  <input
                    type="text"
                    placeholder="کد پستی"
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none"
                    value={shippingAddress.postalCode}
                    onChange={(e) =>
                      setShippingAddress((prev) => ({
                        ...prev,
                        postalCode: e.target.value,
                      }))
                    }
                  />
                </div>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-1"
            >
              <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">
                  خلاصه سفارش
                </h2>
                <div className="space-y-4">
                  <div className="flex justify-between text-gray-600">
                    <span>جمع کل</span>
                    <span>{calculateTotal().toLocaleString()} تومان</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>هزینه ارسال</span>
                    <span className="text-green-500">رایگان</span>
                  </div>
                  <div className="h-px bg-gradient-to-r from-purple-100 via-purple-300 to-purple-100 my-4"></div>
                  <div className="flex justify-between text-xl font-bold text-gray-800">
                    <span>مبلغ قابل پرداخت</span>
                    <span>{calculateTotal().toLocaleString()} تومان</span>
                  </div>
                  <motion.button
                    whileHover={{ scale: paymentLoading ? 1 : 1.02 }}
                    whileTap={{ scale: paymentLoading ? 1 : 0.98 }}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={submitOrder}
                    disabled={paymentLoading}
                  >
                    {paymentLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white" />
                        در حال ایجاد درخواست...
                      </div>
                    ) : (
                      "پرداخت و ثبت سفارش"
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
async function openDB() {
  return await new Promise((resolve, reject) => {
    const request = indexedDB.open("CartDB", 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains("cart")) {
        db.createObjectStore("cart", { keyPath: "id" });
      }
    };
  });
}
