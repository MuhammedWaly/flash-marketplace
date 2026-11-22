/**
 * Utility for parsing and standardizing OpenStreetMap Nominatim reverse geocoding results
 */

/**
 * Extracts governorate, city, and structured street text from OpenStreetMap response
 * @param {object} addr - Address object returned by Nominatim
 * @param {string} displayName - Full display_name string fallback
 * @returns {{ governorate: string, city: string, formatted: string }}
 */
export function parseOsmAddress(addr, displayName = '') {
  if (!addr) {
    return {
      governorate: '',
      city: '',
      formatted: displayName ? displayName.split('،').slice(0, 3).join('،') : 'موقع محدد',
    };
  }

  // 1. استخراج المحافظة بدقة (state أو governorate أو province)
  let governorate = addr.state || addr.governorate || addr.province || addr.region || '';
  governorate = governorate.replace(/^محافظة\s+/, '').trim();

  // 2. استخراج المدينة أو المركز (city أو town أو municipality أو county)
  let city = addr.city || addr.town || addr.municipality || addr.county || '';
  city = city.replace(/^مدينة\s+/, '').trim();

  // 3. استخراج الحي / المنطقة
  const neighborhood = addr.suburb || addr.neighbourhood || addr.quarter || addr.district || addr.village || '';

  // 4. استخراج اسم الشارع
  const street = addr.road || addr.street || '';

  // اختيار اسم النطاق الرئيسي: المحافظة أولاً، أو المدينة إذا لم تتوافر
  const primaryRegion = governorate || city;

  // صياغة العنوان بشكل متدرج: [المحافظة / المدينة]، [الحي] - [الشارع]
  let formatted;
  if (primaryRegion && neighborhood && street) {
    formatted = `${primaryRegion}، ${neighborhood} - ${street}`;
  } else if (primaryRegion && (neighborhood || street)) {
    formatted = `${primaryRegion}، ${neighborhood || street}`;
  } else if (primaryRegion) {
    formatted = primaryRegion;
  } else if (displayName) {
    formatted = displayName.split('،').slice(0, 3).join('،');
  } else {
    formatted = 'موقع محدد';
  }

  return {
    governorate: primaryRegion || 'موقع محدد',
    city: city || primaryRegion || 'موقع محدد',
    formatted,
  };
}
