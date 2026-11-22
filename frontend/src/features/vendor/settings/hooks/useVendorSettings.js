import { useState, useEffect, useRef } from "react";
import L from "leaflet";
import { vendorService } from "../../../../services/vendorService";
import { paymentService } from "../../../../services/paymentService";
import { createRestaurantPinIcon } from "../constants";

export function useVendorSettings() {
  const [settings, setSettings] = useState({
    name: "",
    isOpen: true,
    minOrderValue: 50,
    deliveryRadiusKm: 10.0,
    latitude: 30.0382,
    longitude: 31.2117,
    addressTitle: "الدقي، شارع التحرير",
    logoUrl: "",
    coverImageUrl: "",
  });

  const [restaurantId, setRestaurantId] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [coverPreview, setCoverPreview] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [stripeStatus, setStripeStatus] = useState(null);
  const [loadingStripe, setLoadingStripe] = useState(false);
  const [stripeError, setStripeError] = useState("");

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const circleRef = useRef(null);

  // 1. جلب إعدادات المطعم من السيرفر
  useEffect(() => {
    let isMounted = true;
    async function loadSettings() {
      try {
        setLoading(true);
        setErrorMsg("");
        const data = await vendorService.getSettings();
        if (isMounted && data) {
          const restId = data.restaurantId || data.id;
          setRestaurantId(restId);

          let localMedia = {};
          try {
            const raw =
              localStorage.getItem(`vendor_media_${restId}`) ||
              localStorage.getItem("vendor_media_current");
            if (raw) localMedia = JSON.parse(raw);
          } catch {
            localMedia = {};
          }

          const currentLogo = data.logoUrl || localMedia.logoUrl || "";
          const currentCover =
            data.coverImageUrl || localMedia.coverImageUrl || "";

          const storeName =
            data.name ||
            data.storeName ||
            localStorage.getItem(`vendor_name_${restId}`) ||
            localStorage.getItem("vendor_store_name") ||
            "";

          setSettings({
            name: storeName,
            isOpen: data.isOpen !== undefined ? data.isOpen : true,
            minOrderValue: data.minOrderValue || 50,
            deliveryRadiusKm: data.deliveryRadiusKm || 10.0,
            latitude: data.latitude || 30.0382,
            longitude: data.longitude || 31.2117,
            addressTitle: data.addressTitle || "الدقي، شارع التحرير",
            logoUrl: currentLogo,
            coverImageUrl: currentCover,
          });

          setLogoPreview(currentLogo);
          setCoverPreview(currentCover);

          // جلب حالة حساب Stripe Connect
          try {
            const stripeData = await paymentService.getSellerStatus();
            if (isMounted) setStripeStatus(stripeData);
          } catch (stErr) {
            console.warn("تنبيه: تعذر جلب حالة Stripe للبائع:", stErr);
          }
        }
      } catch (e) {
        if (isMounted) {
          console.error("فشل جلب إعدادات المطعم من السيرفر:", e);
          setErrorMsg("تعذر تحميل الإعدادات من الخادم.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadSettings();
    return () => {
      isMounted = false;
    };
  }, []);

  // معالجة اختيار ملف اللوجو
  const handleLogoFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    const objectUrl = URL.createObjectURL(file);
    setLogoPreview(objectUrl);
    setSettings((prev) => ({ ...prev, logoUrl: objectUrl }));
  };

  // معالجة اختيار ملف الغلاف
  const handleCoverFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverFile(file);
    const objectUrl = URL.createObjectURL(file);
    setCoverPreview(objectUrl);
    setSettings((prev) => ({ ...prev, coverImageUrl: objectUrl }));
  };

  const handleSelectPreset = (url) => {
    setSettings((prev) => ({ ...prev, coverImageUrl: url }));
    setCoverPreview(url);
    setCoverFile(null);
  };

  // جلب اسم المنطقة تلقائياً عند تحريك الدبوس
  const reverseGeocode = async (lat, lng) => {
    setIsGeocoding(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=ar`,
        { headers: { "Accept-Language": "ar" } },
      );
      if (!res.ok) throw new Error("Geocoding service unavailable");
      const data = await res.json();
      if (data && data.address) {
        const addr = data.address;
        const state = (addr.state || addr.governorate || "")
          .replace(/^محافظة\s+/, "")
          .trim();
        const road =
          addr.road || addr.street || addr.neighbourhood || addr.suburb || "";
        const formatted =
          state && road
            ? `${state}، ${road}`
            : data.display_name.split("،").slice(0, 2).join("،");
        setSettings((prev) => ({ ...prev, addressTitle: formatted }));
      }
    } catch {
      // تجاهل الخطأ والاحتفاظ بالعنوان السابق
    } finally {
      setIsGeocoding(false);
    }
  };

  // 2. تهيئة وتحديث خريطة Leaflet
  useEffect(() => {
    if (loading || !mapContainerRef.current) return;

    const lat = settings.latitude || 30.0382;
    const lng = settings.longitude || 31.2117;
    const radiusMeters = (settings.deliveryRadiusKm || 10.0) * 1000;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [lat, lng],
        zoom: 13,
        zoomControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "© OpenStreetMap contributors",
      }).addTo(map);

      const marker = L.marker([lat, lng], {
        icon: createRestaurantPinIcon(),
        draggable: true,
      }).addTo(map);

      const circle = L.circle([lat, lng], {
        radius: radiusMeters,
        color: "#C44D26",
        fillColor: "#C44D26",
        fillOpacity: 0.12,
        weight: 2,
        dashArray: "4, 8",
      }).addTo(map);

      marker.on("dragend", (e) => {
        const newPos = e.target.getLatLng();
        const fixedLat = Number(newPos.lat.toFixed(5));
        const fixedLng = Number(newPos.lng.toFixed(5));
        setSettings((prev) => ({
          ...prev,
          latitude: fixedLat,
          longitude: fixedLng,
        }));
        circle.setLatLng(newPos);
        reverseGeocode(fixedLat, fixedLng);
      });

      map.on("click", (e) => {
        const fixedLat = Number(e.latlng.lat.toFixed(5));
        const fixedLng = Number(e.latlng.lng.toFixed(5));
        marker.setLatLng(e.latlng);
        circle.setLatLng(e.latlng);
        setSettings((prev) => ({
          ...prev,
          latitude: fixedLat,
          longitude: fixedLng,
        }));
        reverseGeocode(fixedLat, fixedLng);
      });

      mapInstanceRef.current = map;
      markerRef.current = marker;
      circleRef.current = circle;

      setTimeout(() => {
        map.invalidateSize();
      }, 150);
    } else {
      mapInstanceRef.current.setView(
        [lat, lng],
        mapInstanceRef.current.getZoom(),
      );
      if (markerRef.current) markerRef.current.setLatLng([lat, lng]);
      if (circleRef.current) {
        circleRef.current.setLatLng([lat, lng]);
        circleRef.current.setRadius(radiusMeters);
      }
    }
  }, [loading, settings.deliveryRadiusKm]);

  // استخدام GPS لتحديد موقع الفرع الحالي
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("متصفحك لا يدعم تحديد الموقع المباشر (GPS).");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const fixedLat = Number(latitude.toFixed(5));
        const fixedLng = Number(longitude.toFixed(5));
        setSettings((prev) => ({
          ...prev,
          latitude: fixedLat,
          longitude: fixedLng,
        }));
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([fixedLat, fixedLng], 15);
          if (markerRef.current)
            markerRef.current.setLatLng([fixedLat, fixedLng]);
          if (circleRef.current)
            circleRef.current.setLatLng([fixedLat, fixedLng]);
        }
        reverseGeocode(fixedLat, fixedLng);
      },
      () => {
        alert(
          "تعذر الوصول لموقعك الحالي. يرجى تحريك الدبوس يدوياً على الخريطة.",
        );
      },
      { enableHighAccuracy: true, timeout: 8000 },
    );
  };

  const handleStripeOnboard = async () => {
    try {
      setLoadingStripe(true);
      setStripeError("");
      const data = await paymentService.startOnboarding();
      if (data?.onboardingUrl) {
        window.location.href = data.onboardingUrl;
      }
    } catch (err) {
      setStripeError(err.message || "تعذر بدء الربط مع Stripe");
    } finally {
      setLoadingStripe(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setErrorMsg("");

      // 1. لو تم اختيار ملفات باينري، نرفعها للميديا أولاً
      let uploadedLogoUrl = settings.logoUrl;
      let uploadedCoverUrl = settings.coverImageUrl;

      if (logoFile || coverFile) {
        const formData = new FormData();
        if (logoFile) formData.append("logo", logoFile);
        if (coverFile) formData.append("cover", coverFile);
        try {
          const mediaRes = await vendorService.uploadMedia(formData);
          if (mediaRes?.logoUrl) uploadedLogoUrl = mediaRes.logoUrl;
          if (mediaRes?.coverImageUrl)
            uploadedCoverUrl = mediaRes.coverImageUrl;
        } catch (mediaErr) {
          console.warn(
            "تنبيه: تعذر رفع الميديا عبر /vendor/media، سيتم استخدام الروابط المباشرة:",
            mediaErr,
          );
        }
      }

      // 2. تحديث إعدادات المطعم
      await vendorService.updateSettings({
        name: settings.name?.trim() || undefined,
        isOpen: settings.isOpen,
        minOrderValue: Number(settings.minOrderValue),
        deliveryRadiusKm: Number(settings.deliveryRadiusKm),
        latitude: Number(settings.latitude),
        longitude: Number(settings.longitude),
        addressTitle: settings.addressTitle,
        logoUrl: uploadedLogoUrl,
        coverImageUrl: uploadedCoverUrl,
      });

      // حفظ نسخة احتياطية فورية في localStorage لسرعة التحديث التلقائي
      if (settings.name?.trim()) {
        localStorage.setItem("vendor_store_name", settings.name.trim());
        if (restaurantId) {
          localStorage.setItem(`vendor_name_${restaurantId}`, settings.name.trim());
        }
      }

      if (restaurantId) {
        localStorage.setItem(
          `vendor_media_${restaurantId}`,
          JSON.stringify({
            logoUrl: uploadedLogoUrl,
            coverImageUrl: uploadedCoverUrl,
          }),
        );
      }
      localStorage.setItem(
        "vendor_media_current",
        JSON.stringify({
          logoUrl: uploadedLogoUrl,
          coverImageUrl: uploadedCoverUrl,
        }),
      );

      // إشعار فوري لجميع شاشات التاجر والسايدبار
      window.dispatchEvent(
        new CustomEvent("vendor-settings-updated", {
          detail: {
            name: settings.name?.trim(),
            addressTitle: settings.addressTitle,
            isOpen: settings.isOpen,
            logoUrl: uploadedLogoUrl,
          },
        }),
      );

      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 4000);
    } catch (e) {
      console.error("فشل حفظ الإعدادات:", e);
      setErrorMsg("حدث خطأ أثناء حفظ الإعدادات بالسيرفر.");
    } finally {
      setSaving(false);
    }
  };

  return {
    settings,
    setSettings,
    logoPreview,
    coverPreview,
    loading,
    saving,
    isGeocoding,
    successMsg,
    errorMsg,
    stripeStatus,
    loadingStripe,
    stripeError,
    mapContainerRef,
    handleLogoFileChange,
    handleCoverFileChange,
    handleSelectPreset,
    handleUseCurrentLocation,
    handleStripeOnboard,
    handleSave,
  };
}
