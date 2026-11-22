import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Modal, Button } from '../../../components/ui';
import { useCart } from '../../../context/CartContext';

/**
 * CartConflictModal Component
 * يظهر تلقائياً عندما يحاول الزبون إضافة أكل من مطعم مختلف عن المطعم الموجود في السلة حالياً
 */
export function CartConflictModal() {
  const {
    restaurant: currentRestaurant,
    conflictData,
    resolveConflictAndReplace,
    cancelConflict,
  } = useCart();

  if (!conflictData) return null;

  const { newItem, newRestaurant } = conflictData;

  return (
    <Modal
      isOpen={Boolean(conflictData)}
      onClose={cancelConflict}
      title="بدء سلة طلبات جديدة؟"
      footer={
        <div className="flex items-center justify-end gap-2 w-full">
          <Button variant="ghost" size="sm" onClick={cancelConflict}>
            إلغاء والاحتفاظ بالسلة
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={resolveConflictAndReplace}
          >
            إفراغ السلة وبدء طلب جديد
          </Button>
        </div>
      }
    >
      <div className="space-y-4 text-xs">
        <div className="flex items-start gap-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-ink">
          <AlertTriangle size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-sm">
              سلتك تحتوي بالفعل على أصناف من مطعم "{currentRestaurant?.name}"
            </p>
            <p className="text-muted leading-relaxed">
              لتتمكن من إضافة "{newItem?.name}" من مطعم "{newRestaurant?.name}"، يجب إفراغ السلة الحالية لأن كل أوردر يتم توصيله من مطعم واحد فقط.
            </p>
          </div>
        </div>

        <p className="text-muted text-[11px]">
          هل تود إفراغ سلتك الحالية والبدء بالطلب من "{newRestaurant?.name}"؟
        </p>
      </div>
    </Modal>
  );
}
