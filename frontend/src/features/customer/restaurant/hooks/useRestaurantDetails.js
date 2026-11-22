import { useState, useEffect } from "react";
import { restaurantService } from "../../../../services/restaurantService";

/**
 * Custom Hook: useRestaurantDetails
 * Fetches restaurant profile details and customer reviews concurrently
 */
export function useRestaurantDetails(restaurantId) {
  const [restaurant, setRestaurant] = useState(null);
  const [dishes, setDishes] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchRestaurantDetails = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [restRes, reviewsRes] = await Promise.allSettled([
          restaurantService.getRestaurantById(restaurantId),
          restaurantService.getRestaurantReviews(restaurantId, {
            pageNumber: 1,
            pageSize: 50,
          }),
        ]);

        if (isMounted) {
          if (restRes.status === "fulfilled" && restRes.value) {
            setRestaurant(restRes.value);
            setDishes(restRes.value?.menu || restRes.value?.dishes || []);
          } else if (restRes.status === "rejected") {
            throw restRes.reason;
          }

          if (reviewsRes.status === "fulfilled" && reviewsRes.value) {
            const list = Array.isArray(reviewsRes.value)
              ? reviewsRes.value
              : reviewsRes.value?.items || [];
            setReviews(list);
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error("فشل جلب تفاصيل المطعم أو المراجعات:", err);
          setError("تعذر تحميل بيانات المطعم من الخادم.");
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    if (restaurantId) {
      fetchRestaurantDetails();
    }
    return () => {
      isMounted = false;
    };
  }, [restaurantId]);

  return {
    restaurant,
    dishes,
    reviews,
    isLoading,
    error,
  };
}
