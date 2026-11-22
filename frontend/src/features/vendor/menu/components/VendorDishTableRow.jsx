import React from 'react';
import { Edit2, Trash2, Image as ImageIcon } from 'lucide-react';
import { getFullImageUrl } from '../../../../utils/imageUrl';
import { formatCurrency } from '../../../../utils/formatters';

/**
 * VendorDishTableRow Component
 * Single table row representing a dish in the vendor menu
 */
export function VendorDishTableRow({ dish, onEdit, onDelete }) {
  const resolvedImg = getFullImageUrl(dish.imageUrl);

  return (
    <tr className="hover:bg-paper/50 transition-colors">
      <td className="py-3 px-3">
        {resolvedImg ? (
          <img
            src={resolvedImg}
            alt={dish.name}
            className="w-14 h-14 object-cover rounded-lg border border-rule shadow-2xs bg-paper"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        ) : (
          <div className="w-14 h-14 bg-paper rounded-lg border border-rule flex items-center justify-center text-ink-faint">
            <ImageIcon size={20} />
          </div>
        )}
      </td>
      <td className="py-3 px-3 font-bold text-ink text-sm">{dish.name}</td>
      <td
        className="py-3 px-3 text-ink-muted text-xs max-w-sm leading-relaxed"
        title={dish.description}
      >
        {dish.description || '—'}
      </td>
      <td className="py-3 px-3 font-bold text-accent whitespace-nowrap tabular-nums text-sm">
        {formatCurrency(dish.price, true)}
      </td>
      <td className="py-3 px-3">
        <div className="flex items-center justify-center gap-1.5">
          <button
            type="button"
            onClick={() => onEdit(dish)}
            className="p-1.5 rounded hover:bg-paper text-ink-muted hover:text-ink transition cursor-pointer"
            title="تعديل الطبق"
          >
            <Edit2 size={15} />
          </button>
          <button
            type="button"
            onClick={() => onDelete(dish.id)}
            className="p-1.5 rounded hover:bg-red-50 text-ink-muted hover:text-red-600 transition cursor-pointer"
            title="حذف الطبق"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </td>
    </tr>
  );
}
