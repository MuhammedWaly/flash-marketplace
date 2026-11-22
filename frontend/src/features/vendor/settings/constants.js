import L from "leaflet";

// أيقونة دبوس المطعم المميزة
export const createRestaurantPinIcon = () =>
  L.divIcon({
    className: "custom-leaflet-marker",
    html: `
      <div style="display:flex; flex-direction:column; align-items:center; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3));">
        <div style="background-color: #1A1816; color: white; padding: 3px 8px; border-radius: 9999px; font-size: 11px; font-weight: bold; font-family: 'Readex Pro', sans-serif; white-space: nowrap; margin-bottom: 2px; border: 1px solid #CEC7BC;">
          مقر المطعم 🍴
        </div>
        <div style="width: 22px; height: 22px; background-color: #C44D26; border: 3px solid #FDFDFB; border-radius: 50%;"></div>
        <div style="width: 2px; height: 12px; background-color: #C44D26; margin-top: -1px;"></div>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });

export const DEFAULT_COVER =
  "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1600&auto=format&fit=crop&q=80";

export const DEFAULT_LOGO =
  "https://images.unsplash.com/photo-1509722747041-616f39b57569?w=400&auto=format&fit=crop&q=80";

// نماذج أغلفة شهية جاهزة بضغطة زر
export const COVER_PRESETS = [
  {
    name: "مشويات وبرجر سيزلنج ",
    url: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1600&auto=format&fit=crop&q=80",
  },
  {
    name: "شاورما وفراخ صاج ",
    url: "https://images.unsplash.com/photo-1544025162-d76694265947?w=1600&auto=format&fit=crop&q=80",
  },
  {
    name: "بيتزا وموزاريلا دافية ",
    url: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1600&auto=format&fit=crop&q=80",
  },
  {
    name: "كريب وحلويات نوتيلا ",
    url: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=1600&auto=format&fit=crop&q=80",
  },
  {
    name: "أكل بيتي وشرقي طازج ",
    url: "https://images.unsplash.com/photo-1547592180-85f173990554?w=1600&auto=format&fit=crop&q=80",
  },
];
