import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { cartService } from '../services/cartService';
import { useAuth } from './AuthContext';

const STORAGE_KEY = 'foodmarketplace_user_cart';
// مهلة صلاحية سلة الزائر في الـ localStorage (24 ساعة)
const GUEST_CART_TTL_MS = 24 * 60 * 60 * 1000;

const CartContext = createContext(null);

/**
 * CartProvider
 * محرك السلة المسؤول عن:
 * 1. دعم تجربة الزائر (Guest Cart) محلياً مع مهلة زمنية (TTL).
 * 2. ترحيل السلة تلقائياً إلى السيرفر (HybridCache) فور تسجيل الدخول أو التسجيل.
 * 3. عزل الجلسات وحماية الخصوصية عند تسجيل الخروج أو التبديل بين الحسابات.
 * 4. كشف تضارب المطاعم (409 Conflict) والتحكم في الاستبدال.
 */
export function CartProvider({ children }) {
  const { token, isAuthenticated } = useAuth();

  // تهيئة الحالة مع فحص الصلاحية الزمنية للـ localStorage
  const [cartState, setCartState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) {
        return { restaurant: null, items: [] };
      }
      const parsed = JSON.parse(saved);
      // فحص انتهاء الوقت للزائر
      if (parsed.expiresAt && Date.now() > parsed.expiresAt) {
        localStorage.removeItem(STORAGE_KEY);
        return { restaurant: null, items: [] };
      }
      return {
        restaurant: parsed.restaurant || null,
        items: Array.isArray(parsed.items) ? parsed.items : [],
      };
    } catch (e) {
      console.error('فشل قراءة السلة من localStorage:', e);
      return { restaurant: null, items: [] };
    }
  });

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [conflictData, setConflictData] = useState(null);

  const prevTokenRef = useRef(token);
  const isMigratingRef = useRef(false);

  // دالة مساعدة لتحديث الحالة ببيانات السلة القادمة من السيرفر
  const applyServerCart = useCallback((serverCart) => {
    if (serverCart && serverCart.items) {
      const restId = serverCart.resturantId || serverCart.restaurantId;
      const restName = serverCart.resturantName || serverCart.restaurantName || 'المطعم';
      setCartState({
        restaurant: restId ? { id: restId, name: restName, deliveryFee: 15 } : null,
        items: serverCart.items.map((it) => ({
          id: it.dishId || it.id,
          name: it.dishName || it.name || 'صنف',
          price: Number(it.unitPrice || it.price || 0),
          qty: it.quantity || it.qty || 1,
          imageUrl: it.imageUrl || '',
        })),
      });
    } else {
      setCartState({ restaurant: null, items: [] });
    }
  }, []);

  // حفظ محلي في localStorage مع تجديد الـ TTL
  useEffect(() => {
    try {
      if (!cartState.items || cartState.items.length === 0) {
        localStorage.removeItem(STORAGE_KEY);
      } else {
        const payload = {
          restaurant: cartState.restaurant,
          items: cartState.items,
          expiresAt: Date.now() + GUEST_CART_TTL_MS,
          updatedAt: Date.now(),
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      }
    } catch (e) {
      console.error('فشل حفظ السلة في localStorage:', e);
    }
  }, [cartState]);

  // فحص دوري لمسح سلة الزائر في حال انتهاء الـ TTL
  useEffect(() => {
    const checkExpiration = () => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.expiresAt && Date.now() > parsed.expiresAt) {
            localStorage.removeItem(STORAGE_KEY);
            setCartState({ restaurant: null, items: [] });
          }
        }
      } catch {}
    };

    checkExpiration();
    const interval = setInterval(checkExpiration, 60000); // كل دقيقة
    return () => clearInterval(interval);
  }, []);

  // إدارة تسجيل الدخول والترحيل / تسجيل الخروج وعزل الحسابات
  useEffect(() => {
    const prevToken = prevTokenRef.current;
    prevTokenRef.current = token;

    // 1. حالة تسجيل الخروج (Logout): تنظيف فوري لعزل الحسابات
    if (prevToken && !token) {
      setCartState({ restaurant: null, items: [] });
      localStorage.removeItem(STORAGE_KEY);
      return;
    }

    // 2. حالة تسجيل الدخول أو إنشاء حساب (Login / Register): ترحيل سلة الزائر إن وجدت
    if (!prevToken && token) {
      const migrateOrFetch = async () => {
        if (isMigratingRef.current) return;
        isMigratingRef.current = true;

        try {
          const localItems = cartState.items;
          const localRestaurant = cartState.restaurant;

          if (localItems && localItems.length > 0 && localRestaurant?.id) {
            // ترحيل أصناف الزائر إلى السيرفر
            // إرسال الصنف الأول مع overrideExisting: true لتهيئة السلة بالسيرفر
            await cartService.addItem({
              resturantId: localRestaurant.id,
              dishId: localItems[0].id,
              quantity: localItems[0].qty,
              overrideExisting: true,
            });

            // إرسال باقي الأصناف
            for (let i = 1; i < localItems.length; i++) {
              await cartService.addItem({
                resturantId: localRestaurant.id,
                dishId: localItems[i].id,
                quantity: localItems[i].qty,
                overrideExisting: false,
              });
            }

            // جلب السلة المحدثة من السيرفر
            const updated = await cartService.getCart();
            applyServerCart(updated);
          } else {
            // إذا لم يكن لدى الزائر سلة محلية، نجلب سلة حسابه السابقة إن وجدت على السيرفر
            const serverCart = await cartService.getCart();
            if (serverCart && serverCart.items && serverCart.items.length > 0) {
              applyServerCart(serverCart);
            }
          }
        } catch (err) {
          console.warn('Error during cart sync/migration:', err);
        } finally {
          isMigratingRef.current = false;
        }
      };

      migrateOrFetch();
    }
  }, [token, cartState.items, cartState.restaurant, applyServerCart]);

  // مزامنة أولية عند تحميل التطبيق إذا كان المستخدم مسجلاً بالفعل
  useEffect(() => {
    if (token && cartState.items.length === 0) {
      cartService
        .getCart()
        .then((serverCart) => {
          if (serverCart && serverCart.items && serverCart.items.length > 0) {
            applyServerCart(serverCart);
          }
        })
        .catch((err) => {
          console.warn('Initial server cart fetch warning:', err);
        });
    }
  }, []); // Run once on mount

  // ── الحسابات المالية (Getters) ──
  const itemsCount = cartState.items.reduce((sum, item) => sum + item.qty, 0);

  const subtotal = cartState.items.reduce(
    (sum, item) => sum + Number(item.price) * item.qty,
    0
  );

  const deliveryFee =
    cartState.items.length > 0 && cartState.restaurant
      ? Number(cartState.restaurant.deliveryFee || 15)
      : 0;

  const totalPrice = subtotal + deliveryFee;

  // ── إضافة صنف للسلة ──
  const addItem = async (dish, restaurant) => {
    const currentRestaurant = cartState.restaurant;
    const targetRestaurantId =
      restaurant?.id ||
      restaurant?.resturantId ||
      dish?.resturantId ||
      dish?.restaurantId ||
      currentRestaurant?.id;

    const targetRestaurantName =
      restaurant?.name ||
      restaurant?.restaurantName ||
      dish?.restaurantName ||
      currentRestaurant?.name ||
      'المطعم';

    // 🚨 فحص التضارب محلياً
    if (
      currentRestaurant &&
      currentRestaurant.id &&
      targetRestaurantId &&
      currentRestaurant.id !== targetRestaurantId &&
      cartState.items.length > 0
    ) {
      setConflictData({
        newItem: dish,
        newRestaurant: {
          id: targetRestaurantId,
          name: targetRestaurantName,
          deliveryFee: restaurant?.deliveryFee || 15,
        },
      });
      return;
    }

    const previousState = cartState;

    // 1. تحديث فوري وسريع (Optimistic UI)
    setCartState((prev) => {
      const existingIndex = prev.items.findIndex((item) => item.id === dish.id);
      let updatedItems = [];

      if (existingIndex > -1) {
        updatedItems = prev.items.map((item, index) =>
          index === existingIndex ? { ...item, qty: item.qty + 1 } : item
        );
      } else {
        updatedItems = [
          ...prev.items,
          {
            id: dish.id,
            name: dish.name || dish.dishName,
            price: Number(dish.price || dish.unitPrice || 0),
            qty: 1,
            imageUrl: dish.imageUrl || '',
          },
        ];
      }

      return {
        restaurant: {
          id: targetRestaurantId,
          name: targetRestaurantName,
          deliveryFee: restaurant?.deliveryFee || 15,
        },
        items: updatedItems,
      };
    });

    setIsDrawerOpen(true);

    // 2. إذا كان المستخدم مسجلاً، نقوم بالمزامنة مع السيرفر في الخلفية
    if (isAuthenticated) {
      try {
        await cartService.addItem({
          resturantId: targetRestaurantId,
          dishId: dish.id,
          quantity: 1,
          overrideExisting: false,
        });
      } catch (err) {
        if (err.status === 409 || err.statusCode === 409) {
          setCartState(previousState);
          setConflictData({
            newItem: dish,
            newRestaurant: {
              id: targetRestaurantId,
              name: targetRestaurantName,
              deliveryFee: restaurant?.deliveryFee || 15,
            },
          });
        } else {
          console.warn('Cart sync warning:', err);
        }
      }
    }
  };

  /**
   * تأكيد استبدال السلة (overrideExisting: true)
   */
  const resolveConflictAndReplace = async () => {
    if (!conflictData) return;
    const { newItem, newRestaurant } = conflictData;

    if (isAuthenticated) {
      try {
        await cartService.addItem({
          resturantId: newRestaurant.id,
          dishId: newItem.id,
          quantity: 1,
          overrideExisting: true,
        });
      } catch (e) {
        console.warn('Server offline on replace:', e);
      }
    }

    setCartState({
      restaurant: {
        id: newRestaurant.id,
        name: newRestaurant.name,
        deliveryFee: newRestaurant.deliveryFee || 15,
      },
      items: [
        {
          id: newItem.id,
          name: newItem.name || newItem.dishName,
          price: Number(newItem.price || newItem.unitPrice || 0),
          qty: 1,
          imageUrl: newItem.imageUrl || '',
        },
      ],
    });

    setConflictData(null);
    setIsDrawerOpen(true);
  };

  const cancelConflict = () => {
    setConflictData(null);
  };

  const increaseQty = async (itemId) => {
    if (isAuthenticated) {
      try {
        await cartService.addItem({
          dishId: itemId,
          quantity: 1,
          overrideExisting: false,
        });
      } catch (e) {
        console.warn('Server offline on increase:', e);
      }
    }

    setCartState((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.id === itemId ? { ...item, qty: item.qty + 1 } : item
      ),
    }));
  };

  const decreaseQty = async (itemId) => {
    const target = cartState.items.find((item) => item.id === itemId);
    if (!target) return;

    if (isAuthenticated && target.qty <= 1) {
      cartService.removeItem(itemId).catch(() => {});
    }

    setCartState((prev) => {
      let updatedItems = [];
      if (target.qty <= 1) {
        updatedItems = prev.items.filter((item) => item.id !== itemId);
      } else {
        updatedItems = prev.items.map((item) =>
          item.id === itemId ? { ...item, qty: item.qty - 1 } : item
        );
      }

      return {
        restaurant: updatedItems.length === 0 ? null : prev.restaurant,
        items: updatedItems,
      };
    });
  };

  const removeItem = async (itemId) => {
    if (isAuthenticated) {
      try {
        await cartService.removeItem(itemId);
      } catch (e) {
        console.warn('Server offline on removeItem:', e);
      }
    }

    setCartState((prev) => {
      const updatedItems = prev.items.filter((item) => item.id !== itemId);
      return {
        restaurant: updatedItems.length === 0 ? null : prev.restaurant,
        items: updatedItems,
      };
    });
  };

  const clearCart = async () => {
    if (isAuthenticated) {
      try {
        await cartService.clearCart();
      } catch (e) {
        console.warn('Server offline on clearCart:', e);
      }
    }
    setCartState({ restaurant: null, items: [] });
    localStorage.removeItem(STORAGE_KEY);
  };

  const openDrawer = () => setIsDrawerOpen(true);
  const closeDrawer = () => setIsDrawerOpen(false);

  return (
    <CartContext.Provider
      value={{
        restaurant: cartState.restaurant,
        items: cartState.items,
        itemsCount,
        subtotal,
        deliveryFee,
        totalPrice,
        isDrawerOpen,
        conflictData,
        addItem,
        increaseQty,
        decreaseQty,
        removeItem,
        clearCart,
        openDrawer,
        closeDrawer,
        resolveConflictAndReplace,
        cancelConflict,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
