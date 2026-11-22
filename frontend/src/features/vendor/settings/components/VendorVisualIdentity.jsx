import React from "react";
import { Upload } from "lucide-react";
import { DEFAULT_COVER, DEFAULT_LOGO, COVER_PRESETS } from "../constants";

/**
 * VendorVisualIdentity Component
 * Profile logo and hero cover customizer with live animated sizzle preview and presets.
 */
export function VendorVisualIdentity({
  settings,
  logoPreview,
  coverPreview,
  onLogoFileChange,
  onCoverFileChange,
  onLogoUrlChange,
  onCoverUrlChange,
  onSelectPreset,
}) {
  const activeCover = coverPreview || settings.coverImageUrl || DEFAULT_COVER;
  const activeLogo = logoPreview || settings.logoUrl || DEFAULT_LOGO;

  return (
    <section className="bg-surface border border-rule rounded-2xl p-6 space-y-5 shadow-2xs">
      <div className="flex items-center justify-between pb-3 border-b border-rule">
        <div>
          <h2 className="text-sm font-bold text-ink flex items-center gap-2">
            الهوية البصرية وغلاف الهيرو الترويجي (Profile & Cover Banner)
          </h2>
          <p className="text-xs text-ink-muted mt-0.5">
            يظهر هذا الغلاف في أعلى صفحة مطعمك لجذب العملاء بأنيميشن حركي مشهي
          </p>
        </div>
        <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
          معاينة حية ومباشرة
        </span>
      </div>

      {/* Live Interactive Hero Banner Preview with Animation */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-ink-secondary block">
          معاينة الغلاف الحي في صفحة المطعم (Live Cover Preview):
        </span>
        <div className="relative h-48 sm:h-56 w-full rounded-2xl overflow-hidden bg-ink border border-rule shadow-inner select-none">
          <img
            src={activeCover}
            alt="معاينة الغلاف"
            className="w-full h-full object-cover animate-ken-burns transform-gpu origin-center"
            onError={(e) => {
              e.currentTarget.src = DEFAULT_COVER;
            }}
          />

          {/* Ambient Glow & Steam Shimmer Layer */}
          <div className="absolute inset-0 bg-gradient-to-tr from-amber-600/35 via-transparent to-orange-700/25 mix-blend-color-dodge pointer-events-none animate-warm-glow" />
          <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none" />
          <div className="absolute inset-0 bg-radial-[at_50%_75%] from-amber-500/20 via-transparent to-transparent pointer-events-none animate-steam-shimmer" />

          {/* Foreground Logo & Badges Preview */}
          <div className="absolute bottom-3 right-4 left-4 z-10 flex items-end gap-3">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-surface border-2 border-white shadow-xl overflow-hidden flex-shrink-0">
              <img
                src={activeLogo}
                alt="معاينة اللوجو"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = DEFAULT_LOGO;
                }}
              />
            </div>
            <div className="text-white space-y-0.5">
              <span className="text-sm sm:text-base font-black block drop-shadow-md">
                {settings.name || "اسم مطعمك التجاري"}
              </span>
              <span className="text-[10px] text-amber-300 font-medium block">
                {settings.addressTitle ? `فرع ${settings.addressTitle}` : "طازج ويُحضر عند الطلب خصيصاً لك"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Preset Buttons for Quick Appealing Covers */}
      <div className="space-y-2 pt-2">
        <span className="text-xs font-semibold text-ink-muted block">
          أو اختر غلافاً شهياً جاهزاً بضغطة زر:
        </span>
        <div className="flex items-center gap-2 flex-wrap">
          {COVER_PRESETS.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => onSelectPreset(preset.url)}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-all cursor-pointer font-medium ${
                activeCover === preset.url
                  ? "bg-amber-50 border-amber-500 text-amber-900 font-bold shadow-xs"
                  : "bg-paper hover:bg-paper-subtle border-rule text-ink-secondary"
              }`}
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* Inputs for Custom Logo & Cover URL / Upload */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-rule">
        {/* Logo Customizer */}
        <div className="space-y-2 bg-paper/50 p-4 rounded-xl border border-rule">
          <label className="text-xs font-bold text-ink block">
            لوجو / صورة بروفايل المطعم
          </label>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl border border-rule overflow-hidden bg-surface flex-shrink-0">
              <img
                src={activeLogo}
                alt="لوجو"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = DEFAULT_LOGO;
                }}
              />
            </div>
            <label className="flex-1 cursor-pointer">
              <span className="btn btn-outline text-xs py-1.5 px-3 inline-flex items-center gap-1.5 w-full justify-center">
                <Upload size={13} />
                <span>رفع صورة من جهازك</span>
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={onLogoFileChange}
                className="sr-only"
              />
            </label>
          </div>
          <input
            type="url"
            value={settings.logoUrl}
            onChange={(e) => onLogoUrlChange(e.target.value)}
            placeholder="أو الصق رابط صورة اللوجو (URL)"
            className="w-full text-xs p-2.5 bg-paper rounded-lg border border-rule focus:outline-none focus:border-accent focus:bg-surface text-ink transition-colors mt-1"
          />
        </div>

        {/* Cover Customizer */}
        <div className="space-y-2 bg-paper/50 p-4 rounded-xl border border-rule">
          <label className="text-xs font-bold text-ink block">
            صورة الغلاف الترويجي (Cover Banner)
          </label>
          <div className="flex items-center gap-3">
            <label className="flex-1 cursor-pointer">
              <span className="btn btn-outline text-xs py-1.5 px-3 inline-flex items-center gap-1.5 w-full justify-center">
                <Upload size={13} />
                <span>رفع غلاف من جهازك</span>
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={onCoverFileChange}
                className="sr-only"
              />
            </label>
          </div>
          <input
            type="url"
            value={settings.coverImageUrl}
            onChange={(e) => onCoverUrlChange(e.target.value)}
            placeholder="أو الصق رابط صورة الغلاف (URL)"
            className="w-full text-xs p-2.5 bg-paper rounded-lg border border-rule focus:outline-none focus:border-accent focus:bg-surface text-ink transition-colors mt-1"
          />
        </div>
      </div>
    </section>
  );
}
