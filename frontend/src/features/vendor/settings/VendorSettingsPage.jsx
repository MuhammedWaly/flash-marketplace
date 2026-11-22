import React from "react";
import "leaflet/dist/leaflet.css";
import { Navigation, Loader2, CheckCircle2, AlertCircle, Store } from "lucide-react";
import { PageLoader } from "../../../components/ui";
import { useVendorSettings } from "./hooks/useVendorSettings";
import { VendorVisualIdentity } from "./components/VendorVisualIdentity";
import { VendorStripeConnect } from "./components/VendorStripeConnect";
import { VendorLocationMap } from "./components/VendorLocationMap";
import { VendorOperationalForm } from "./components/VendorOperationalForm";

export function VendorSettingsPage() {
  const {
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
  } = useVendorSettings();

  if (loading) return <PageLoader />;

  return (
    <div className="max-w-4xl p-6 space-y-6 font-readex">
      {/* ── Page Header ── */}
      <div className="pb-4 border-b border-rule flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-ink">إعدادات المطعم</h1>
          <p className="text-xs text-ink-muted mt-1">
            خصص لوجو مطعمك، غلاف الصفحة الترويجي المتحرك، موقع الفرع على الخريطة وحدود التوصيل
          </p>
        </div>

        <button
          type="button"
          onClick={handleUseCurrentLocation}
          className="flex items-center gap-1.5 px-3 py-2 bg-surface hover:bg-paper border border-rule rounded-lg text-xs font-medium text-ink transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Navigation size={14} className="text-accent" />
          <span>موقع الفرع الحالي (GPS)</span>
        </button>
      </div>

      {successMsg && (
        <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl animate-fade-in">
          <CheckCircle2 size={16} className="flex-shrink-0" />
          <span>
            تم حفظ الهوية البصرية وغلاف الهيرو وموقع الفرع الجغرافي بنجاح.
          </span>
        </div>
      )}

      {errorMsg && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
          <AlertCircle size={16} className="flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* ── Section 0: Restaurant Basic Profile (Name & Branch) ── */}
        <section className="bg-surface border border-rule rounded-2xl p-6 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-rule">
            <div>
              <h2 className="text-sm font-bold text-ink flex items-center gap-2">
                <Store size={18} className="text-accent" />
                <span>الاسم التجاري للمطعم (Restaurant Profile)</span>
              </h2>
              <p className="text-xs text-ink-muted mt-0.5">
                هذا الاسم هو ما يظهر للزبائن في نتائج البحث، صفحة المطعم، وقوائم الطلبات
              </p>
            </div>
            <span className="text-[11px] font-semibold text-accent bg-accent-light px-2.5 py-0.5 rounded-full border border-accent/20">
              بيانات المطعم
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-ink block">
                اسم المطعم التجاري <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                required
                value={settings.name || ""}
                onChange={(e) => setSettings((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="مثال: مطعم البرنس للمأكولات الشرقية"
                className="w-full text-xs p-3 bg-paper rounded-xl border border-rule focus:outline-none focus:border-accent focus:bg-surface text-ink transition-colors font-semibold"
              />
              <span className="text-[11px] text-ink-muted block">
                يظهر كعنوان رئيسي في التطبيق وللزبائن في قائمة المطاعم والـ Navbar
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-ink block">
                اسم الفرع أو المنطقة (Address Title)
              </label>
              <input
                type="text"
                value={settings.addressTitle || ""}
                onChange={(e) => setSettings((prev) => ({ ...prev, addressTitle: e.target.value }))}
                placeholder="مثال: فرع الدقي، شارع مصدق"
                className="w-full text-xs p-3 bg-paper rounded-xl border border-rule focus:outline-none focus:border-accent focus:bg-surface text-ink transition-colors"
              />
              <span className="text-[11px] text-ink-muted block">
                يحدد الفرع التابع له في حال كان لمطعمك فروع متعددة
              </span>
            </div>
          </div>
        </section>

        {/* ── Section 1: Visual Identity & Animated Hero Cover ── */}
        <VendorVisualIdentity
          settings={settings}
          logoPreview={logoPreview}
          coverPreview={coverPreview}
          onLogoFileChange={handleLogoFileChange}
          onCoverFileChange={handleCoverFileChange}
          onLogoUrlChange={(url) => setSettings((prev) => ({ ...prev, logoUrl: url }))}
          onCoverUrlChange={(url) => setSettings((prev) => ({ ...prev, coverImageUrl: url }))}
          onSelectPreset={handleSelectPreset}
        />

        {/* ── Section 2: Store Operational Rules (Hours, Min Order, Delivery Radius) ── */}
        <VendorOperationalForm
          isOpen={settings.isOpen}
          deliveryRadiusKm={settings.deliveryRadiusKm}
          minOrderValue={settings.minOrderValue}
          onIsOpenChange={(open) => setSettings((prev) => ({ ...prev, isOpen: open }))}
          onDeliveryRadiusChange={(radius) => setSettings((prev) => ({ ...prev, deliveryRadiusKm: radius }))}
          onMinOrderValueChange={(min) => setSettings((prev) => ({ ...prev, minOrderValue: min }))}
        />

        {/* ── Section 3: Stripe Connect Account Settings ── */}
        <VendorStripeConnect
          stripeStatus={stripeStatus}
          loadingStripe={loadingStripe}
          stripeError={stripeError}
          onStartOnboarding={handleStripeOnboard}
        />

        {/* ── Section 4: Interactive Leaflet Map for Restaurant Location ── */}
        <VendorLocationMap
          mapContainerRef={mapContainerRef}
          isGeocoding={isGeocoding}
          latitude={settings.latitude}
          longitude={settings.longitude}
          addressTitle={settings.addressTitle}
          onLatitudeChange={(lat) => setSettings((prev) => ({ ...prev, latitude: lat }))}
          onLongitudeChange={(lng) => setSettings((prev) => ({ ...prev, longitude: lng }))}
          onAddressTitleChange={(addr) => setSettings((prev) => ({ ...prev, addressTitle: addr }))}
          onUseCurrentLocation={handleUseCurrentLocation}
        />

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={saving}
            className="btn btn-primary text-xs py-2.5 px-6 flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>جاري حفظ الإعدادات والهوية البصرية…</span>
              </>
            ) : (
              <span>حفظ جميع التعديلات</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
