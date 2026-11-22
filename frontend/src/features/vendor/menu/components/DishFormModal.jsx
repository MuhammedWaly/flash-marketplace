import React, { useRef } from 'react';
import { Upload, X, AlertCircle } from 'lucide-react';
import { Button, Modal, Input } from '../../../../components/ui';

/**
 * DishFormModal Component
 * Modal for creating or updating a menu dish with name, price, description,
 * and image file upload / external URL preview.
 */
export function DishFormModal({
  isOpen,
  onClose,
  editingDish,
  formData,
  onFormDataChange,
  uploadMode,
  onUploadModeChange,
  imagePreview,
  submitting,
  submitError,
  onFileSelect,
  onRemoveImage,
  onSubmit,
}) {
  const fileInputRef = useRef(null);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingDish ? 'تعديل صنف في المنيو' : 'إضافة صنف جديد للمنيو'}
      size="lg"
      footer={
        <div className="flex justify-end gap-2 w-full">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={submitting}>
            إلغاء
          </Button>
          <Button
            variant="primary"
            size="md"
            loading={submitting}
            onClick={onSubmit}
          >
            {editingDish ? 'حفظ التعديلات' : 'إضافة الصنف للمنيو'}
          </Button>
        </div>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4 text-right">
        {submitError && (
          <div className="flex items-center gap-2 p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
            <AlertCircle size={15} className="flex-shrink-0" />
            <span>{submitError}</span>
          </div>
        )}

        <Input
          label="اسم الصنف أو الوجبة *"
          placeholder="مثلاً: ساندوتش شاورما فراخ صاج كبير..."
          required
          value={formData.name}
          onChange={(e) => onFormDataChange({ ...formData, name: e.target.value })}
        />

        <Input
          label="السعر بالجنيه المصري (Required) *"
          type="number"
          step="0.5"
          placeholder="85.00"
          required
          value={formData.price}
          onChange={(e) => onFormDataChange({ ...formData, price: e.target.value })}
        />

        <div className="space-y-1">
          <label className="text-xs font-semibold text-ink block">الوصف ومكونات الصنف (Required) *</label>
          <textarea
            rows="3"
            placeholder="اكتب وصفاً للوجبة والمكونات والخلطة..."
            required
            value={formData.description}
            onChange={(e) => onFormDataChange({ ...formData, description: e.target.value })}
            className="w-full text-xs p-2.5 bg-paper rounded-lg border border-rule focus:outline-none focus:border-accent"
          />
        </div>

        {/* 📸 قسم رفع صورة الصنف */}
        <div className="space-y-2 pt-2 border-t border-rule">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-xs font-semibold text-ink block">صورة الصنف (اختياري)</label>
              <span className="text-[11px] text-ink-muted">
                {editingDish
                  ? 'اتركها فارغة للاحتفاظ بالصورة السابقة، أو اختر صورة جديدة للاستبدال'
                  : 'إذا لم ترفع صورة، سيضع السيرفر صورة افتراضية ملائمة للصنف تلقائياً'}
              </span>
            </div>
            <div className="flex gap-2 text-[11px]">
              <button
                type="button"
                onClick={() => onUploadModeChange('file')}
                className={`px-2 py-0.5 rounded cursor-pointer transition ${
                  uploadMode === 'file' ? 'bg-accent text-white font-bold' : 'text-ink-muted hover:text-ink'
                }`}
              >
                رفع ملف
              </button>
              <button
                type="button"
                onClick={() => onUploadModeChange('url')}
                className={`px-2 py-0.5 rounded cursor-pointer transition ${
                  uploadMode === 'url' ? 'bg-accent text-white font-bold' : 'text-ink-muted hover:text-ink'
                }`}
              >
                رابط خارجي
              </button>
            </div>
          </div>

          {uploadMode === 'file' ? (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={onFileSelect}
                className="hidden"
              />

              {imagePreview ? (
                <div className="relative w-full h-40 rounded-xl border border-rule overflow-hidden bg-paper flex items-center justify-center group shadow-inner">
                  <img
                    src={imagePreview}
                    alt="معاينة الصنف"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 bg-white text-ink text-xs font-bold rounded-lg hover:bg-paper cursor-pointer shadow"
                    >
                      تغيير الصورة
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onRemoveImage();
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      className="p-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 cursor-pointer shadow"
                      title="حذف الصورة"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-32 rounded-xl border-2 border-dashed border-rule hover:border-accent hover:bg-accent/5 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer bg-paper/60 p-4"
                >
                  <div className="w-10 h-10 rounded-full bg-paper border border-rule flex items-center justify-center text-accent">
                    <Upload size={18} />
                  </div>
                  <div className="text-center">
                    <span className="text-xs font-bold text-ink block">اضغط لرفع صورة من جهازك</span>
                    <span className="text-[10px] text-ink-muted">يدعم صيغ JPG، PNG، WebP (أو اتركها وسيتولى السيرفر تعيين صورة ديفولت)</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <Input
                placeholder="https://images.unsplash.com/photo-..."
                value={formData.imageUrl}
                onChange={(e) => onFormDataChange({ ...formData, imageUrl: e.target.value })}
              />
              {imagePreview && (
                <div className="w-full h-32 rounded-lg border border-rule overflow-hidden bg-paper">
                  <img
                    src={imagePreview}
                    alt="معاينة"
                    className="w-full h-full object-cover"
                    onError={onRemoveImage}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </form>
    </Modal>
  );
}
