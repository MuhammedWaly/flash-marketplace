import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { locationService } from '../services/locationService';
import { useAuth } from './AuthContext';

// القيمة الافتراضية المبدئية عند عدم وجود موقع محفوظ
const DEFAULT_LOCATION = {
  lat: 30.0444,
  lng: 31.2357,
  addressName: 'تحديد موقع التوصيل',
  city: '',
  isConfigured: false,
};

const STORAGE_KEY = 'foodmarketplace_user_location';

const LocationContext = createContext(null);

/**
 * LocationProvider
 * يغلف التطبيق ويوفر حالة الموقع الجغرافي المختار بالـ Pin
 * مربوط بـ GET & POST /api/locations/customer
 */
export function LocationProvider({ children }) {
  const { token, isAuthenticated, isVendor } = useAuth();

  const [selectedLocation, setSelectedLocation] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_LOCATION;
    } catch (e) {
      console.error('فشل قراءة الموقع من localStorage:', e);
      return DEFAULT_LOCATION;
    }
  });

  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isLocationLoading, setIsLocationLoading] = useState(false);

  // جلب موقع العميل من السيرفر فقط للعملاء (Customer) وليس لأصحاب المطاعم
  const refreshCustomerLocation = useCallback(async () => {
    const currentToken = token || localStorage.getItem('foodmarketplace_auth_token');
    // إذا كان المستخدم تاجراً أو غير مسجل، لا نسحب عنوان التوصيل للزبون
    if (!currentToken || isVendor) return;

    setIsLocationLoading(true);
    try {
      const data = await locationService.getCustomerLocation();
      if (data && data.isConfigured) {
        // استخراج اسم المحافظة أو المدينة ديناميكياً من العنوان المحفوظ بدون تثبيت
        const titleParts = (data.addressTitle || '').split(/[،,-]/);
        const derivedCity = titleParts[0]?.trim() || 'موقعي المحدد';

        const configuredLoc = {
          lat: Number(data.latitude),
          lng: Number(data.longitude),
          addressName: data.addressTitle || 'موقعي المحدد',
          city: derivedCity,
          isConfigured: true,
        };
        setSelectedLocation(configuredLoc);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(configuredLoc));
      } else if (data && data.isConfigured === false) {
        // إذا كان الزائر قد حدد موقعه بالفعل كـ Guest قبل تسجيل الدخول، نرحله للسيرفر فوراً
        const saved = localStorage.getItem(STORAGE_KEY);
        let parsed = null;
        try {
          parsed = saved ? JSON.parse(saved) : null;
        } catch {}

        if (parsed && parsed.isConfigured && parsed.lat && parsed.lng) {
          try {
            await locationService.saveCustomerLocation({
              latitude: Number(parsed.lat),
              longitude: Number(parsed.lng),
              addressTitle: parsed.addressName || 'موقعي المحدد',
            });
          } catch (err) {
            console.warn('فشل ترحيل موقع الزائر للسيرفر:', err);
          }
        } else {
          // إذا لم يحدد موقعه بعد في قاعدة البيانات أو محلياً، نفتح نافذة الخريطة ليضع الدبوس
          setSelectedLocation((prev) => ({ ...prev, isConfigured: false }));
          setIsLocationModalOpen(true);
        }
      }
    } catch (e) {
      console.warn('تعذر جلب موقع العميل من السيرفر:', e);
    } finally {
      setIsLocationLoading(false);
    }
  }, [token, isVendor]);

  useEffect(() => {
    if (isAuthenticated && !isVendor) {
      refreshCustomerLocation();
    }
  }, [isAuthenticated, isVendor, refreshCustomerLocation]);

  // حفظ الموقع محلياً
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedLocation));
    } catch (e) {
      console.error('فشل حفظ الموقع في localStorage:', e);
    }
  }, [selectedLocation]);

  /**
   * دالة تحديث وحفظ الموقع بالدبوس على الخريطة
   * ترسل POST /api/locations/customer للباك إند
   */
  const updateLocation = async (coords, addressName, city) => {
    const cleanAddress = (addressName || 'موقع محدد').replace(/[📍🏢🏠]/g, '').trim();
    // استخراج اسم المحافظة ديناميكياً بناءً على ما رجعته الخريطة
    const derivedCity = city || cleanAddress.split(/[،,-]/)[0]?.trim() || 'موقع محدد';

    const newLoc = {
      lat: Number(coords.lat),
      lng: Number(coords.lng),
      addressName: cleanAddress,
      city: derivedCity,
      isConfigured: true,
    };

    setSelectedLocation(newLoc);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newLoc));

    // إرسال الإحداثيات للباك إند إذا كان المستخدم مسجلاً
    const currentToken = token || localStorage.getItem('foodmarketplace_auth_token');
    if (currentToken) {
      try {
        await locationService.saveCustomerLocation({
          latitude: Number(coords.lat),
          longitude: Number(coords.lng),
          addressTitle: cleanAddress,
        });
      } catch (e) {
        console.error('فشل حفظ الموقع في الباك إند:', e);
        throw e;
      }
    }
  };

  const openLocationModal = () => setIsLocationModalOpen(true);
  const closeLocationModal = () => setIsLocationModalOpen(false);

  return (
    <LocationContext.Provider
      value={{
        selectedLocation,
        isLocationModalOpen,
        isLocationLoading,
        updateLocation,
        openLocationModal,
        closeLocationModal,
        refreshCustomerLocation,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocationState() {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocationState must be used within a LocationProvider');
  }
  return context;
}
