import React, { useState, useEffect, useRef } from 'react';
import { Search, Check, Navigation, Loader2, AlertCircle } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Modal, Button } from '../../../components/ui';
import { useLocationState } from '../../../context/LocationContext';
import { parseOsmAddress } from '../../../utils/locationParser';
import { PRESET_LOCATIONS, createPinIcon } from './constants';

/**
 * LocationModal
 * نافذة خريطة تفاعلية حقيقية مع Leaflet و OpenStreetMap
 * تدعم تحريك الدبوس، السحب، النقر، والـ Geocoding التلقائي
 * وإرسال POST /api/locations/customer إلى الـ Backend
 */
export function LocationModal() {
  const {
    selectedLocation,
    isLocationModalOpen,
    closeLocationModal,
    updateLocation,
  } = useLocationState();

  const [coords, setCoords] = useState({
    lat: selectedLocation?.lat || 30.0382,
    lng: selectedLocation?.lng || 31.2117,
  });
  const [addressTitle, setAddressTitle] = useState(
    selectedLocation?.addressName || 'الجيزة، الدقي - شارع التحرير'
  );
  const [cityName, setCityName] = useState(
    selectedLocation?.city || 'الجيزة'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  // تحديث الإحداثيات عند فتح المودال بموقع المستخدم المحفوظ
  useEffect(() => {
    if (isLocationModalOpen && selectedLocation?.lat && selectedLocation?.lng) {
      setCoords({ lat: selectedLocation.lat, lng: selectedLocation.lng });
      setAddressTitle(selectedLocation.addressName || 'الجيزة، الدقي - شارع التحرير');
      setCityName(selectedLocation.city || 'الجيزة');
      setErrorMessage(null);
    }
  }, [isLocationModalOpen, selectedLocation]);

  // دالة لجلب العنوان والمحافظة ديناميكياً عبر OpenStreetMap Nominatim
  const reverseGeocode = async (lat, lng) => {
    setIsGeocoding(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=ar`,
        { headers: { 'Accept-Language': 'ar' } }
      );
      if (!res.ok) throw new Error('Geocoding service unavailable');
      const data = await res.json();
      const parsed = parseOsmAddress(data?.address, data?.display_name);
      setAddressTitle(parsed.formatted);
      setCityName(parsed.governorate || parsed.city);
    } catch {
      // Fallback في حال تعذر الاتصال بـ Nominatim
      setAddressTitle(`موقع محدد (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
    } finally {
      setIsGeocoding(false);
    }
  };

  // تهيئة خريطة Leaflet عند فتح المودال
  useEffect(() => {
    if (!isLocationModalOpen) return;

    // مهلة قصيرة لضمان ظهور الـ DOM الخاص بالـ Modal
    const timer = setTimeout(() => {
      if (!mapContainerRef.current) return;

      const initialLat = coords.lat || 30.0382;
      const initialLng = coords.lng || 31.2117;

      // إنشاء كائن الخريطة
      if (!mapInstanceRef.current) {
        const map = L.map(mapContainerRef.current, {
          center: [initialLat, initialLng],
          zoom: 14,
          zoomControl: true,
        });

        // طبقة البلاطات الرسمية لـ OpenStreetMap
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '© OpenStreetMap contributors',
        }).addTo(map);

        // إنشاء الدبوس التفاعلي القابل للسحب
        const marker = L.marker([initialLat, initialLng], {
          draggable: true,
          icon: createPinIcon(),
        }).addTo(map);

        // عند سحب الدبوس
        marker.on('dragend', (e) => {
          const newPos = e.target.getLatLng();
          setCoords({ lat: newPos.lat, lng: newPos.lng });
          reverseGeocode(newPos.lat, newPos.lng);
        });

        // عند النقر على أي مكان بالخريطة
        map.on('click', (e) => {
          const { lat, lng } = e.latlng;
          marker.setLatLng([lat, lng]);
          setCoords({ lat, lng });
          reverseGeocode(lat, lng);
        });

        mapInstanceRef.current = map;
        markerRef.current = marker;
      } else {
        mapInstanceRef.current.invalidateSize();
        mapInstanceRef.current.setView([initialLat, initialLng], 14);
        if (markerRef.current) {
          markerRef.current.setLatLng([initialLat, initialLng]);
        }
      }
    }, 120);

    return () => {
      clearTimeout(timer);
    };
  }, [isLocationModalOpen]);

  // إزالة الخريطة بالكامل عند إغلاق المودال لمنع تسريب الذاكرة وتكرار الـ Containers
  useEffect(() => {
    if (!isLocationModalOpen && mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
      markerRef.current = null;
    }
  }, [isLocationModalOpen]);

  // الانتقال لمنطقة محددة من الـ Presets
  const handleSelectPreset = (preset) => {
    setCoords({ lat: preset.lat, lng: preset.lng });
    setAddressTitle(preset.name);
    setCityName(preset.city);
    if (mapInstanceRef.current && markerRef.current) {
      mapInstanceRef.current.flyTo([preset.lat, preset.lng], 15);
      markerRef.current.setLatLng([preset.lat, preset.lng]);
    }
  };

  // استخدام موقع الـ GPS المباشر
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setErrorMessage('متصفحك لا يدعم تحديد الموقع التلقائي (GPS).');
      return;
    }

    setIsGeocoding(true);
    setErrorMessage(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setCoords({ lat: latitude, lng: longitude });
        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.flyTo([latitude, longitude], 16);
          markerRef.current.setLatLng([latitude, longitude]);
        }
        reverseGeocode(latitude, longitude);
      },
      (err) => {
        setIsGeocoding(false);
        console.warn('Geolocation error:', err);
        setErrorMessage('تعذر الوصول لموقعك الحالي. يرجى السماح بالوصول أو تحريك الدبوس يدوياً.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // تأكيد الموقع وإرساله للـ Backend
  const handleConfirm = async () => {
    setIsSaving(true);
    setErrorMessage(null);
    try {
      await updateLocation(
        { lat: coords.lat, lng: coords.lng },
        addressTitle,
        cityName
      );
      closeLocationModal();
    } catch (err) {
      console.error('Failed to save location:', err);
      setErrorMessage('تعذر حفظ الموقع في السيرفر. يرجى التحقق من الاتصال والمحاولة ثانية.');
    } finally {
      setIsSaving(false);
    }
  };

  // تصفية المناطق بحسب بحث المستخدم
  const filteredPresets = PRESET_LOCATIONS.filter((loc) =>
    loc.name.includes(searchQuery) || loc.city.includes(searchQuery)
  );

  return (
    <Modal
      isOpen={isLocationModalOpen}
      onClose={closeLocationModal}
      title="تحديد موقع التوصيل على الخريطة"
      size="lg"
      footer={
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 w-full">
          {/* العنوان المحدد حالياً */}
          <div className="text-right w-full sm:w-auto">
            <span className="text-[11px] text-ink-muted block">العنوان المختار:</span>
            <span className="text-xs font-semibold text-ink flex items-center gap-1.5">
              {isGeocoding && <Loader2 size={12} className="animate-spin text-accent" />}
              <span>{addressTitle}</span>
            </span>
          </div>

          {/* أزرار التحكم */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Button variant="ghost" size="sm" onClick={closeLocationModal} disabled={isSaving}>
              إلغاء
            </Button>
            <Button
              variant="primary"
              size="md"
              icon={isSaving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
              onClick={handleConfirm}
              disabled={isSaving || isGeocoding}
            >
              {isSaving ? 'جاري الحفظ…' : 'تأكيد وحفظ الموقع'}
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {/* تنبيه الخطأ إن وجد */}
        {errorMessage && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg text-xs">
            <AlertCircle size={16} className="flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* شريط البحث السريع والزر المباشر للـ GPS */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint pointer-events-none" />
            <input
              type="text"
              placeholder="ابحث عن منطقتك (المعادي، الدقي، التجمع، الشيخ زايد)…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-paper border border-rule rounded-lg pr-9 pl-3 py-2 text-xs text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none"
            />
          </div>

          <button
            type="button"
            onClick={handleUseCurrentLocation}
            disabled={isGeocoding}
            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 bg-paper hover:bg-paper-subtle border border-rule hover:border-rule-strong rounded-lg text-xs font-medium text-ink-secondary transition-colors cursor-pointer"
            title="تحديد موقعي الحالي بدقة GPS"
          >
            <Navigation size={14} className="text-accent" />
            <span className="hidden sm:inline">موقعي الحالي</span>
          </button>
        </div>

        {/* 🗺️ الخريطة التفاعلية الحقيقية (Leaflet + OpenStreetMap) */}
        <div className="relative w-full h-72 sm:h-80 bg-paper-subtle rounded-xl border border-rule overflow-hidden shadow-inner">
          <div ref={mapContainerRef} className="w-full h-full" />

          {/* تلميح مساعدة عائم على الخريطة */}
          <div className="absolute bottom-2 right-2 z-[400] bg-white/90 backdrop-blur px-2.5 py-1 rounded text-[10px] text-ink-muted border border-rule/70 pointer-events-none">
            انقر على الخريطة أو اسحب الدبوس لتحديد نقطة التوصيل
          </div>
        </div>

        {/* مناطق سريعة للاختيار المباشر */}
        <div>
          <span className="text-[11px] font-medium text-ink-muted block mb-2">
            أو اختر من المناطق الشائعة:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {filteredPresets.map((loc) => {
              const isSelected =
                Math.abs(coords.lat - loc.lat) < 0.005 &&
                Math.abs(coords.lng - loc.lng) < 0.005;
              return (
                <button
                  key={loc.name}
                  type="button"
                  onClick={() => handleSelectPreset(loc)}
                  className={`p-2 text-right rounded-lg border text-xs transition cursor-pointer flex flex-col gap-0.5 ${
                    isSelected
                      ? 'border-accent bg-accent/5 font-semibold text-accent'
                      : 'border-rule bg-surface text-ink hover:bg-paper'
                  }`}
                >
                  <span className="truncate">{loc.name.split('،')[0]}</span>
                  <span className="text-[10px] text-ink-faint truncate">{loc.name.split('،')[1] || loc.city}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </Modal>
  );
}