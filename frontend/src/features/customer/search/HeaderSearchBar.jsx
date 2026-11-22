import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { searchService } from '../../../services/searchService';
import { getFullImageUrl } from '../../../utils/imageUrl';
import { useLocationState } from '../../../context/LocationContext';

export function HeaderSearchBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedLocation } = useLocationState();

  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState([]);
  
  const containerRef = useRef(null);
  const debounceTimerRef = useRef(null);

  // إغلاق الـ Dropdown عند الانتقال لأي صفحة أخرى
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // إغلاق الـ Dropdown عند النقر خارجه
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // البحث المباشر مع Debounce (250ms)
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      setIsLoading(false);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    setIsOpen(true);

    debounceTimerRef.current = setTimeout(async () => {
      try {
        const response = await searchService.searchCatalog({
          query: trimmed,
          pageNumber: 1,
          pageSize: 7,
          userLat: selectedLocation?.isConfigured ? selectedLocation.lat : undefined,
          userLng: selectedLocation?.isConfigured ? selectedLocation.lng : undefined,
        });

        const rawRestaurants = response?.restaurants?.items || response?.restaurants || [];
        const rawDishes = response?.dishes?.items || response?.dishes || [];

        // تشكيل قائمة موحدة لأفضل 7 نتائج متطابقة
        const formattedRestaurants = rawRestaurants.map((r) => ({
          id: r.id,
          type: 'restaurant',
          title: r.name,
          subtitle: r.category || 'مطعم مأكولات',
          image: getFullImageUrl(r.logoUrl || r.coverImageUrl),
          rating: r.averageRating,
          restaurantId: r.id,
        }));

        const formattedDishes = rawDishes.map((d) => ({
          id: d.id,
          type: 'dish',
          title: d.name,
          subtitle: d.resturantName || d.restaurantName ? `من: ${d.resturantName || d.restaurantName}` : 'وجبة شهية',
          price: d.price,
          image: getFullImageUrl(d.imageUrl),
          restaurantId: d.resturantId || d.restaurantId,
        }));

        // دمج النتائج وأخذ أول 7 نتائج مطابقة (Top 7 Matched Results)
        const combined = [...formattedRestaurants, ...formattedDishes].slice(0, 7);
        setResults(combined);
      } catch (err) {
        console.error('فشل جلب نتائج السيرش السريع:', err);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [query, selectedLocation?.lat, selectedLocation?.lng, selectedLocation?.isConfigured]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      setIsOpen(false);
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleSelectResult = (item) => {
    setIsOpen(false);
    setQuery('');
    if (item.restaurantId) {
      navigate(`/restaurant/${item.restaurantId}`);
    } else {
      navigate(`/search?q=${encodeURIComponent(item.title)}`);
    }
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative flex-1 max-w-md mx-4 font-readex">
      {/* ── Search Input Field ── */}
      <form onSubmit={handleSubmit} className="w-full">
        <div className="w-full flex items-center gap-2 px-3 py-1.5 bg-paper rounded-lg border border-rule focus-within:border-accent focus-within:bg-surface focus-within:shadow-xs transition-all">
          <svg
            className="text-ink-faint flex-shrink-0"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>

          <input
            type="text"
            placeholder="ابحث عن مطعم أو وجبة مفضلة…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => {
              if (query.trim() && results.length > 0) setIsOpen(true);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Escape') setIsOpen(false);
            }}
            className="w-full bg-transparent border-0 text-xs text-ink placeholder:text-ink-faint focus:outline-none"
          />

          {/* Loading Indicator */}
          {isLoading && (
            <svg
              className="animate-spin text-accent flex-shrink-0"
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          )}

          {/* Clear Button */}
          {query && !isLoading && (
            <button
              type="button"
              onClick={handleClear}
              className="text-ink-faint hover:text-ink transition-colors cursor-pointer p-0.5"
              aria-label="مسح نص البحث"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </form>

      {/* ── Dropdown: Top 7 Matched Results ── */}
      {isOpen && query.trim() && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-surface rounded-xl border border-rule shadow-lg overflow-hidden z-50 animate-in fade-in slide-in-from-top-1 duration-150">
          {isLoading && results.length === 0 ? (
            <div className="p-4 text-center text-xs text-ink-muted">
              <span>جاري البحث عن المطاعم والوجبات…</span>
            </div>
          ) : results.length > 0 ? (
            <div className="divide-y divide-rule/60 max-h-[380px] overflow-y-auto">
              <div className="px-3 py-1.5 bg-paper text-[10px] font-semibold text-ink-muted flex items-center justify-between">
                <span>أفضل النتائج المطابقة ({results.length})</span>
                <span className="text-ink-faint">اضغط للذهاب للمطعم مباشرة</span>
              </div>

              {results.map((item) => (
                <div
                  key={`${item.type}-${item.id}`}
                  onClick={() => handleSelectResult(item)}
                  className="flex items-center gap-3 p-2.5 hover:bg-accent-light/50 transition-colors cursor-pointer group"
                >
                  {/* Thumbnail / Badge */}
                  <div className="w-10 h-10 rounded-lg bg-paper border border-rule overflow-hidden flex-shrink-0 flex items-center justify-center">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : item.type === 'restaurant' ? (
                      <span className="text-sm font-bold text-accent">
                        {item.title.charAt(0)}
                      </span>
                    ) : (
                      <span className="text-xs text-ink-faint">🍽️</span>
                    )}
                  </div>

                  {/* Title & Details */}
                  <div className="flex-1 min-w-0 text-right">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-bold text-ink group-hover:text-accent transition-colors truncate">
                        {item.title}
                      </h4>
                      <span
                        className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full flex-shrink-0 ${
                          item.type === 'restaurant'
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        }`}
                      >
                        {item.type === 'restaurant' ? 'مطعم' : 'وجبة'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2 mt-0.5 text-[11px] text-ink-muted">
                      <span className="truncate">{item.subtitle}</span>
                      {item.price !== undefined && (
                        <span className="font-bold text-ink flex-shrink-0 tabular-nums">
                          {Number(item.price).toFixed(2)} ج.م
                        </span>
                      )}
                      {item.rating && (
                        <span className="flex items-center gap-0.5 text-[10px] text-amber-700 flex-shrink-0">
                          ⭐ {Number(item.rating).toFixed(1)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* View All Search Results Footer */}
              <button
                type="button"
                onClick={handleSubmit}
                className="w-full p-2.5 bg-paper hover:bg-paper-subtle text-accent text-xs font-semibold text-center transition-colors cursor-pointer border-t border-rule flex items-center justify-center gap-1"
              >
                <span>عرض جميع نتائج البحث عن «{query.trim()}»</span>
                <span aria-hidden="true">←</span>
              </button>
            </div>
          ) : (
            <div className="p-5 text-center text-xs text-ink-muted">
              <p className="font-medium text-ink">لا توجد نتائج مطابقة لـ «{query.trim()}»</p>
              <p className="text-[11px] text-ink-faint mt-1">جرب البحث بكلمات أخرى مثل "شاورما" أو "برجر" أو "بيتزا".</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
