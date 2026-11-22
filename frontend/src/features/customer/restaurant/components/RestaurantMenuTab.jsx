import React from "react";
import { UtensilsCrossed } from "lucide-react";
import { DishCard } from "../../search/DishCard";

/**
 * RestaurantMenuTab Component
 * Displays the grid of dishes or an empty state
 */
export function RestaurantMenuTab({ dishes = [], restaurant, onAddToCart }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-rule">
        <h2 className="text-base font-bold text-ink">
          قائمة الوجبات المتاحة للطلب ({dishes.length})
        </h2>
      </div>

      {dishes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {dishes.map((dish) => (
            <DishCard
              key={dish.id}
              dish={dish}
              onAddToCart={() =>
                onAddToCart(
                  {
                    id: dish.id,
                    name: dish.name,
                    price: dish.price,
                    imageUrl: dish.imageUrl,
                  },
                  {
                    id: restaurant.id,
                    name: restaurant.name,
                    deliveryFee: restaurant.deliveryFee,
                  },
                )
              }
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-surface rounded-xl border border-rule">
          <UtensilsCrossed className="w-10 h-10 text-ink-faint mx-auto mb-2 opacity-50" />
          <p className="text-sm font-medium text-ink-muted">
            لم يتم إضافة أطباق في قائمة هذا المطعم بعد.
          </p>
        </div>
      )}
    </div>
  );
}
