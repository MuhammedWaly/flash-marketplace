/**
 * Helper to build pre-formatted WhatsApp message for delivery riders
 */
export function buildDriverWhatsAppText(ord) {
  const orderId = ord.orderNumber || ord.orderId || ord.id;
  const lat = ord.deliveryLocation?.latitude || ord.latitude || ord.lat || 30.0382;
  const lng = ord.deliveryLocation?.longitude || ord.longitude || ord.lng || 31.2117;
  const address =
    ord.shippingAddress ||
    ord.deliveryAddress ||
    ord.deliveryLocation?.addressTitle ||
    ord.addressTitle ||
    'موقع محدد بالدبوس على الخريطة';
  const customer = ord.customerName || ord.customer || 'عميل';
  const phone = ord.customerPhone || ord.phone || 'غير محدد';
  const total = Number(ord.totalAmount || ord.total || 0).toFixed(2);

  let itemsText = '';
  if (Array.isArray(ord.items)) {
    itemsText = ord.items
      .map((it) => {
        const itemName =
          it.productName ||
          it.name ||
          it.dishName ||
          it.dish?.name ||
          it.title ||
          it.itemName ||
          'صنف';
        const price = it.unitPrice || it.price;
        const priceStr = price ? ` (${Number(price).toFixed(2)} ج.م)` : '';
        return `• ${it.quantity || it.qty || 1}x ${itemName}${priceStr}`;
      })
      .join('\n');
  }

  return `🛵 *طلب توصيل جديد* #${orderId}
 *العميل:* ${customer}
 *الهاتف:* ${phone}
 *العنوان:* ${address}
 *لوكيشن الخريطة:* https://www.google.com/maps/search/?api=1&query=${lat},${lng}
 *المبلغ المطلوب تحصيله:* ${total} ج.م
 *الوجبات:*
${itemsText}
 شكراً ونتمنى لك توصيلاً آمناً!`;
}
