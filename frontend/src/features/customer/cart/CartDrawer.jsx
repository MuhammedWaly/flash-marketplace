import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowLeft } from 'lucide-react';
import { useCart } from '../../../context/CartContext';
import { Button } from '../../../components/ui';
import { getFullImageUrl } from '../../../utils/imageUrl';

/**
 * CartDrawer Component
 * درج السلة الجانبي المنزلق لعرض محتويات الطلب، تعديل الكميات، وتفاصيل الفاتورة
 */
export function CartDrawer() {
  const navigate = useNavigate();
  const {
    restaurant,
    items,
    itemsCount,
    subtotal,
    deliveryFee,
    totalPrice,
    isDrawerOpen,
    closeDrawer,
    increaseQty,
    decreaseQty,
    removeItem,
  } = useCart();

  const handleCheckout = () => {
    closeDrawer();
    navigate('/checkout');
  };

  return (
    <>
      {/* 1. Backdrop Overlay */}
      <div
        className={`drawer-overlay fixed inset-0 bg-ink/40 z-50 transition-opacity duration-300 ${
          isDrawerOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
        onClick={closeDrawer}
      />

      {/* 2. Sliding Drawer Body */}
      <div
        className={`cart-drawer ${isDrawerOpen ? 'is-open' : ''}`}
        role="dialog"
        aria-label="سلة المشتريات"
      >
        {/* Header */}
        <div className="cart-drawer__header">
          <div className="flex items-center gap-2">
            <ShoppingBag size={18} className="text-accent" />
            <div>
              <h3 className="text-sm font-bold text-ink">سلة طلباتك</h3>
              {restaurant && (
                <p className="text-[11px] text-muted truncate max-w-[200px]">
                  من مطعم: {restaurant.name}
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={closeDrawer}
            className="p-1.5 rounded-lg text-muted hover:text-ink hover:bg-paper-2 transition"
            aria-label="إغلاق السلة"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body: قائمة الأصناف أو الـ Empty State */}
        <div className="cart-drawer__body">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
              <div className="w-14 h-14 rounded-full bg-paper-2 flex items-center justify-center text-muted">
                <ShoppingBag size={24} />
              </div>
              <p className="text-sm font-semibold text-ink">سلتك فارغة حالياً</p>
              <p className="text-xs text-muted leading-relaxed">
                تصفح المطاعم الشهية واختر أطباقك المفضلة لتظهر هنا.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-rule">
              {items.map((item) => (
                <div key={item.id} className="cart-item">
                  {/* صورة الصنف إن وجدت */}
                  <div className="cart-item__image">
                    {item.imageUrl || item.image ? (
                      <img
                        src={getFullImageUrl(item.imageUrl || item.image)}
                        alt={item.name}
                        className="w-full h-full object-cover rounded"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <span className="text-[10px]">وجبة</span>
                    )}
                  </div>

                  {/* الاسم والسعر */}
                  <div className="cart-item__body">
                    <h4 className="cart-item__name truncate">{item.name}</h4>
                    <p className="cart-item__price">
                      {item.price} ج.م × {item.qty} ={' '}
                      <span className="font-semibold text-ink">
                        {item.price * item.qty} ج.م
                      </span>
                    </p>
                  </div>

                  {/* أزرار الكمية (+ / -) */}
                  <div className="flex items-center gap-2">
                    <div className="cart-item__qty">
                      <button
                        type="button"
                        onClick={() => decreaseQty(item.id)}
                        className="cart-item__qty-btn"
                        title="تقليل الكمية"
                      >
                        {item.qty === 1 ? <Trash2 size={12} className="text-red-500" /> : <Minus size={12} />}
                      </button>
                      <span className="cart-item__qty-val">{item.qty}</span>
                      <button
                        type="button"
                        onClick={() => increaseQty(item.id)}
                        className="cart-item__qty-btn"
                        title="زيادة الكمية"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer: الفاتورة وزر الدفع */}
        {items.length > 0 && (
          <div className="cart-drawer__footer space-y-3">
            {/* تفاصيل الحساب */}
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-muted">
                <span>المجموع الفرعي ({itemsCount} أصناف)</span>
                <span>{subtotal} ج.م</span>
              </div>
              <div className="flex justify-between text-muted">
                <span>رسوم التوصيل</span>
                <span>{deliveryFee === 0 ? 'مجاني' : `${deliveryFee} ج.م`}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-ink pt-2 border-t border-rule">
                <span>الإجمالي النهائي</span>
                <span className="text-accent">{totalPrice} ج.م</span>
              </div>
            </div>

            {/* زر إتمام الشراء */}
            <Button
              variant="primary"
              size="lg"
              block
              icon={<ArrowLeft size={16} />}
              onClick={handleCheckout}
            >
              المتابعة إلى الدفع ({totalPrice} ج.م)
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
