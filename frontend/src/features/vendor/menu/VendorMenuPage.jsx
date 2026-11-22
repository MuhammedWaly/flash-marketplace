import React, { useState, useEffect } from 'react';
import { Plus, CheckCircle2 } from 'lucide-react';
import { vendorService } from '../../../services/vendorService';
import { Button, PageLoader } from '../../../components/ui';
import { getFullImageUrl } from '../../../utils/imageUrl';
import { DishFormModal } from './components/DishFormModal';
import { VendorDishTableRow } from './components/VendorDishTableRow';

export function VendorMenuPage() {
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // حالة مودال الإضافة والتعديل
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDish, setEditingDish] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    imageUrl: '',
  });

  // حالة رفع الصورة
  const [uploadMode, setUploadMode] = useState('file');
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // جلب قائمة الأطباق من GET /api/vendor/dishes
  const fetchDishes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await vendorService.getDishes();
      setDishes(Array.isArray(data) ? data : data?.items || []);
    } catch (err) {
      console.error('فشل جلب أطباق المنيو من السيرفر:', err);
      setError('تعذر تحميل أطباق المنيو من الخادم.');
      setDishes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDishes();
  }, []);

  const handleOpenAddModal = () => {
    setEditingDish(null);
    setFormData({ name: '', description: '', price: '', imageUrl: '' });
    setSelectedFile(null);
    setImagePreview(null);
    setUploadMode('file');
    setSubmitError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (dish) => {
    setEditingDish(dish);
    setFormData({
      name: dish.name || '',
      description: dish.description || '',
      price: dish.price || '',
      imageUrl: dish.imageUrl || '',
    });
    setSelectedFile(null);
    setImagePreview(dish.imageUrl ? getFullImageUrl(dish.imageUrl) : null);
    setUploadMode(dish.imageUrl && !dish.imageUrl.startsWith('/uploads') ? 'url' : 'file');
    setSubmitError('');
    setIsModalOpen(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setSubmitError('يرجى اختيار ملف صورة صالح (JPG, PNG, WebP).');
        return;
      }
      setSelectedFile(file);
      setSubmitError('');
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setImagePreview(null);
    setFormData((prev) => ({ ...prev, imageUrl: '' }));
  };

  const handleDeleteDish = async (dishId) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الطبق من قائمتك؟')) return;

    try {
      await vendorService.deleteDish(dishId);
      setDishes((prev) => prev.filter((d) => d.id !== dishId));
      setSuccessMessage('تم حذف الصنف من القائمة بنجاح.');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('فشل حذف الطبق:', err);
      setDishes((prev) => prev.filter((d) => d.id !== dishId));
    }
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setSubmitError('');

    if (!formData.name.trim()) {
      setSubmitError('اسم الطبق مطلوب.');
      return;
    }
    if (!formData.description.trim()) {
      setSubmitError('الوصف ومكونات الوجبة مطلوبة.');
      return;
    }
    if (!formData.price || Number(formData.price) <= 0) {
      setSubmitError('يرجى إدخال سعر صالح للطبق.');
      return;
    }

    try {
      setSubmitting(true);
      let uploadedUrl = formData.imageUrl;

      if (uploadMode === 'file' && selectedFile) {
        const mediaForm = new FormData();
        mediaForm.append('file', selectedFile);
        try {
          const mediaRes = await vendorService.uploadDishMedia(mediaForm);
          if (mediaRes?.url || mediaRes?.imageUrl) {
            uploadedUrl = mediaRes.url || mediaRes.imageUrl;
          }
        } catch (mediaErr) {
          console.warn('Media upload warning, fallback to dish payload:', mediaErr);
        }
      }

      const dishPayload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: Number(formData.price),
        imageUrl: uploadedUrl,
      };

      if (editingDish) {
        await vendorService.updateDish(editingDish.id, dishPayload);
        setSuccessMessage('تم تحديث الصنف بنجاح.');
      } else {
        await vendorService.createDish(dishPayload);
        setSuccessMessage('تمت إضافة الصنف الجديد إلى المنيو بنجاح.');
      }

      setIsModalOpen(false);
      fetchDishes();
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      console.error('فشل حفظ الصنف:', err);
      setSubmitError(err.message || 'حدث خطأ أثناء حفظ الصنف، يرجى المحاولة مرة أخرى.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col font-readex max-w-6xl w-full p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-rule">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-ink">قائمة الطعام (المنيو)</h1>
          <p className="text-xs text-ink-muted mt-1">
            أضف وجباتك الجديدة، عدل الأسعار، وارفع صور الأطباق المعروضة لزبائنك
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAddModal}
          className="btn btn-primary text-xs py-2 px-4 flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <Plus size={15} />
          <span>إضافة صنف جديد</span>
        </button>
      </div>

      {successMessage && (
        <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl animate-fade-in">
          <CheckCircle2 size={16} className="flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Main Content */}
      {loading ? (
        <PageLoader />
      ) : error ? (
        <div className="text-center py-12 bg-surface rounded-xl border border-rule p-6">
          <p className="text-sm text-ink-muted mb-2">{error}</p>
          <button
            type="button"
            onClick={fetchDishes}
            className="btn btn-outline text-xs px-4 py-1.5"
          >
            إعادة المحاولة
          </button>
        </div>
      ) : (
        <div className="bg-surface border border-rule rounded-xl overflow-hidden shadow-2xs">
          {dishes.length > 0 ? (
            <table className="w-full text-right text-xs">
              <thead className="bg-paper border-b border-rule text-ink-muted font-semibold">
                <tr>
                  <th className="py-2.5 px-3 w-16">الصورة</th>
                  <th className="py-2.5 px-3">اسم الوجبة</th>
                  <th className="py-2.5 px-3">الوصف والمكونات</th>
                  <th className="py-2.5 px-3">السعر</th>
                  <th className="py-2.5 px-3 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rule/60">
                {dishes.map((dish) => (
                  <VendorDishTableRow
                    key={dish.id}
                    dish={dish}
                    onEdit={handleOpenEditModal}
                    onDelete={handleDeleteDish}
                  />
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-12">
              <p className="text-sm font-semibold text-ink mb-1">قائمة المنيو فارغة حالياً</p>
              <p className="text-xs text-ink-muted mb-4">
                ابدأ بإضافة أول صنف وسيقوم السيرفر بتعيين صورة تلقائية إذا لم ترفع صورة.
              </p>
              <Button variant="primary" size="sm" onClick={handleOpenAddModal}>
                + إضافة أول صنف الآن
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Modal إضافة / تعديل طبق */}
      <DishFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingDish={editingDish}
        formData={formData}
        onFormDataChange={setFormData}
        uploadMode={uploadMode}
        onUploadModeChange={setUploadMode}
        imagePreview={imagePreview}
        submitting={submitting}
        submitError={submitError}
        onFileSelect={handleFileChange}
        onRemoveImage={handleRemoveImage}
        onSubmit={handleSubmitForm}
      />
    </div>
  );
}
