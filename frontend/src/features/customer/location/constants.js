import L from 'leaflet';

/**
 * مناطق حيوية سريعة تغطي عدة محافظات مصرية (القاهرة، الجيزة، الإسكندرية، الدلتا)
 */
export const PRESET_LOCATIONS = [
  { name: 'الجيزة، الدقي - شارع التحرير', city: 'الجيزة', lat: 30.0382, lng: 31.2117 },
  { name: 'القاهرة، الزمالك - شارع 26 يوليو', city: 'القاهرة', lat: 30.0617, lng: 31.2215 },
  { name: 'القاهرة، المعادي - شارع النصر', city: 'القاهرة', lat: 29.9602, lng: 31.2825 },
  { name: 'القاهرة، مدينة نصر - شارع عباس العقاد', city: 'القاهرة', lat: 30.0561, lng: 31.3412 },
  { name: 'القاهرة الجديدة، التجمع الخامس - التسعين', city: 'القاهرة الجديدة', lat: 30.0254, lng: 31.4721 },
  { name: 'الجيزة، الشيخ زايد - وصلة دهشور', city: 'الجيزة', lat: 30.0531, lng: 30.9856 },
  { name: 'الإسكندرية، سموحة - شارع فوزي معاذ', city: 'الإسكندرية', lat: 31.2156, lng: 29.9495 },
  { name: 'الإسكندرية، محطة الرمل - الكورنيش', city: 'الإسكندرية', lat: 31.2001, lng: 29.8998 },
  { name: 'الدقهلية، المنصورة - المشاية السفلية', city: 'الدقهلية', lat: 31.0409, lng: 31.3785 },
  { name: 'الغربية، طنطا - شارع الجيش', city: 'الغربية', lat: 30.7865, lng: 31.0004 },
];

/**
 * أيقونة دبوس خريطة مميزة باللون Persimmon (#C44D26)
 */
export const createPinIcon = () =>
  L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="display:flex; flex-direction:column; align-items:center; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.25));">
        <div style="background-color: #C44D26; color: white; padding: 4px 10px; border-radius: 9999px; font-size: 11px; font-weight: 600; font-family: 'Readex Pro', sans-serif; white-space: nowrap; margin-bottom: 2px;">
          موقع التوصيل
        </div>
        <div style="width: 20px; height: 20px; background-color: #C44D26; border: 3px solid #FDFDFB; border-radius: 50%;"></div>
        <div style="width: 2px; height: 12px; background-color: #C44D26; margin-top: -1px;"></div>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
