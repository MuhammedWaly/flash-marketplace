import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { Modal, Button } from '../../../components/ui';

/**
 * RatingModal Component
 * مودال لتقييم المطعم والأصناف بنجوم تفاعلية وكتابة تعليق
 */
export function RatingModal({ isOpen, onClose, order, onSubmitRating }) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!order) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const targetOrderId = order.orderId || order.id;
      await onSubmitRating?.(targetOrderId, { rating, comment });
      onClose?.();
    } finally {
      setSubmitting(false);
    }
  };

  const storeName = order.resturantName || order.restaurantName || 'المطعم';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`تقييم طلبك من "${storeName}"`}
      footer={
        <div className="flex justify-end gap-2 w-full">
          <Button variant="ghost" size="sm" onClick={onClose}>
            إلغاء
          </Button>
          <Button
            variant="primary"
            size="md"
            loading={submitting}
            onClick={handleSubmit}
          >
            إرسال التقييم
          </Button>
        </div>
      }
    >
      <div className="space-y-4 text-center py-2">
        <p className="text-xs text-muted">
          كيف كانت تجربتك مع جودة الأكل وسرعة التوصيل؟
        </p>

        {/* النجوم التفاعلية */}
        <div className="flex items-center justify-center gap-2 py-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="p-1 transition-transform hover:scale-125 focus:outline-none"
            >
              <Star
                size={28}
                className={`transition-colors ${
                  star <= (hoverRating || rating)
                    ? 'fill-warning text-warning'
                    : 'text-rule'
                }`}
              />
            </button>
          ))}
        </div>

        <span className="text-xs font-bold text-ink block">
          {rating === 5 && 'ممتاز جداً! ⭐⭐⭐⭐⭐'}
          {rating === 4 && 'جيد جداً! ⭐⭐⭐⭐'}
          {rating === 3 && 'مقبول ⭐⭐⭐'}
          {rating === 2 && 'أقل من المتوقع ⭐⭐'}
          {rating === 1 && 'تجربة سيئة ⭐'}
        </span>

        {/* خانة التعليق */}
        <div className="text-right space-y-1">
          <label className="text-xs text-muted block">اكتب تعليقك (اختياري)</label>
          <textarea
            rows="3"
            placeholder="شاركنا رأيك في طعم الوجبة والتغليف..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="form-input text-xs"
          />
        </div>
      </div>
    </Modal>
  );
}
