/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  MapPin,
  Crosshair,
  Plus,
  Minus,
  Search,
  RefreshCw,
  AlertCircle,
  Navigation,
  Check,
  X,
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';

declare global {
  interface Window {
    ymaps: any;
  }
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export const TASHKENT_CENTER: Coordinates = {
  lat: 41.311081,
  lng: 69.240562,
};

// Tashkent's 12 districts with accurate coordinates
export const TASHKENT_DISTRICTS = [
  { name: 'Chilonzor', coords: { lat: 41.2758, lng: 69.2045 } },
  { name: 'Yunusobod', coords: { lat: 41.3653, lng: 69.2891 } },
  { name: 'Mirzo Ulug\'bek', coords: { lat: 41.3265, lng: 69.3289 } },
  { name: 'Yakkasaroy', coords: { lat: 41.2825, lng: 69.2555 } },
  { name: 'Shayxontohur', coords: { lat: 41.3228, lng: 69.2401 } },
  { name: 'Uchtepa', coords: { lat: 41.2941, lng: 69.1764 } },
  { name: 'Sergeli', coords: { lat: 41.2238, lng: 69.2201 } },
  { name: 'Mirobod', coords: { lat: 41.2917, lng: 69.2889 } },
  { name: 'Olmazor', coords: { lat: 41.3533, lng: 69.2215 } },
  { name: 'Yashnobod', coords: { lat: 41.2982, lng: 69.3378 } },
  { name: 'Bektemir', coords: { lat: 41.2081, lng: 69.3358 } },
  { name: 'Yangihayot', coords: { lat: 41.1969, lng: 69.2033 } },
];

interface YandexMapPickerProps {
  initialCoordinates?: Coordinates;
  onCoordinatesChange: (coords: Coordinates) => void;
  onAddressChange?: (address: string) => void;
  addressText?: string;
  readOnly?: boolean;
  height?: string;
  showSearchAndDistricts?: boolean;
  userCoordinates?: Coordinates | null;
}

export const YandexMapPicker: React.FC<YandexMapPickerProps> = ({
  initialCoordinates = TASHKENT_CENTER,
  onCoordinatesChange,
  onAddressChange,
  addressText = '',
  readOnly = false,
  height = '260px',
  showSearchAndDistricts = true,
  userCoordinates = null,
}) => {
  const { showToast } = useToast();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const placemarkRef = useRef<any>(null);
  const userPlacemarkRef = useRef<any>(null);

  const [coords, setCoords] = useState<Coordinates>(initialCoordinates);
  const [currentAddress, setCurrentAddress] = useState<string>(addressText || 'Toshkent shahri');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<
    Array<{ display_name: string; lat: string; lon: string }>
  >([]);
  const [showSearchResults, setShowSearchResults] = useState<boolean>(false);

  // OpenStreetMap Nominatim Reverse Geocoding
  const reverseGeocode = useCallback(
    async (lat: number, lng: number) => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=uz`
        );
        if (!response.ok) throw new Error('Geocoding response not ok');
        const data = await response.json();

        if (data && data.address) {
          const addr = data.address;
          const district =
            addr.county ||
            addr.suburb ||
            addr.city_district ||
            addr.district ||
            addr.borough;
          const neighbourhood = addr.neighbourhood || addr.quarter || addr.subdivision;
          const road = addr.road || addr.pedestrian || addr.street;
          const houseNumber = addr.house_number;

          const parts = [district, neighbourhood, road, houseNumber].filter(Boolean);
          const formatted =
            parts.length > 0
              ? parts.join(', ')
              : data.display_name?.split(',').slice(0, 3).join(', ') || 'Toshkent shahri';

          setCurrentAddress(formatted);
          if (onAddressChange) onAddressChange(formatted);
        } else {
          setCurrentAddress('Toshkent shahri');
          if (onAddressChange) onAddressChange('Toshkent shahri');
        }
      } catch (e) {
        console.warn('Nominatim reverse geocode fallback:', e);
      }
    },
    [onAddressChange]
  );

  // Move map & pin to target coordinates
  const handleCoordinatesChange = useCallback(
    (lat: number, lng: number, moveCenter = false, zoomLevel = 16) => {
      const rounded = {
        lat: Number(lat.toFixed(6)),
        lng: Number(lng.toFixed(6)),
      };
      setCoords(rounded);
      onCoordinatesChange(rounded);
      reverseGeocode(rounded.lat, rounded.lng);

      if (placemarkRef.current) {
        placemarkRef.current.geometry.setCoordinates([lat, lng]);
      }
      if (moveCenter && mapInstanceRef.current) {
        mapInstanceRef.current.setCenter([lat, lng], zoomLevel, { duration: 350 });
      }
    },
    [onCoordinatesChange, reverseGeocode]
  );

  // Native GPS geolocation handler
  const handleLocateMe = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (typeof window === 'undefined' || !('geolocation' in navigator)) {
      showToast('Brauzeringizda geolokatsiya qoʻllab-quvvatlanmaydi', 'error');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        handleCoordinatesChange(lat, lng, true, 16);

        try {
          sessionStorage.setItem('kitto_user_coords', JSON.stringify({ lat, lng }));
          sessionStorage.setItem('bookswap_user_coords', JSON.stringify({ lat, lng }));
          window.dispatchEvent(
            new CustomEvent('kitto_coords_updated', { detail: { lat, lng } })
          );
          window.dispatchEvent(
            new CustomEvent('bookswap_coords_updated', { detail: { lat, lng } })
          );
        } catch {
          // ignore
        }

        setIsLocating(false);
        showToast('Joylashuvingiz aniqlandi!', 'success');
      },
      (err) => {
        setIsLocating(false);
        if (err.code === 1) {
          showToast(
            "Brauzerda joylashuvga ruxsat berilmagan. Manzil panelidan ruxsat bering yoki xaritadan o'zingiz belgilang.",
            'error'
          );
        } else {
          showToast("Joylashuvni aniqlab bo'lmadi. Qulay tumanni tanlang.", 'info');
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Zoom controls
  const handleZoomIn = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (mapInstanceRef.current) {
      const currentZoom = mapInstanceRef.current.getZoom();
      mapInstanceRef.current.setZoom(currentZoom + 1, { duration: 200 });
    }
  };

  const handleZoomOut = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (mapInstanceRef.current) {
      const currentZoom = mapInstanceRef.current.getZoom();
      mapInstanceRef.current.setZoom(currentZoom - 1, { duration: 200 });
    }
  };

  // Debounced search query handler
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const queryWithCity = `${searchQuery.trim()}, Toshkent`;
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(
            queryWithCity
          )}&accept-language=uz&limit=5`
        );
        if (!res.ok) throw new Error('Search failed');
        const data = await res.json();
        setSearchResults(data || []);
        setShowSearchResults(true);
      } catch (err) {
        console.error('Nominatim search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Select search result
  const handleSelectSearchResult = (result: { lat: string; lon: string; display_name: string }) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    if (!isNaN(lat) && !isNaN(lng)) {
      handleCoordinatesChange(lat, lng, true, 16);
      setShowSearchResults(false);
      setSearchQuery('');
    }
  };

  // Select district chip
  const handleSelectDistrict = (district: (typeof TASHKENT_DISTRICTS)[0]) => {
    handleCoordinatesChange(district.coords.lat, district.coords.lng, true, 15);
  };

  // Map initialization & ResizeObserver setup
  useEffect(() => {
    let isMounted = true;
    let resizeObserver: ResizeObserver | null = null;

    const initMap = () => {
      if (!mapContainerRef.current || !window.ymaps) return;

      window.ymaps.ready(() => {
        if (!isMounted || !mapContainerRef.current) return;

        try {
          if (mapInstanceRef.current) {
            mapInstanceRef.current.destroy();
            mapInstanceRef.current = null;
          }

          const currentLat = coords.lat || TASHKENT_CENTER.lat;
          const currentLng = coords.lng || TASHKENT_CENTER.lng;

          // Initialize with controls: [] so broken keyless Yandex buttons are absent
          const map = new window.ymaps.Map(
            mapContainerRef.current,
            {
              center: [currentLat, currentLng],
              zoom: readOnly ? 15 : 14,
              controls: [],
            },
            {
              suppressMapOpenBlock: true,
            }
          );

          mapInstanceRef.current = map;

          // Main placemark
          const placemark = new window.ymaps.Placemark(
            [currentLat, currentLng],
            {
              balloonContent: 'Kitob uchrashuv joyi',
              iconCaption: readOnly ? 'Kitob joyi' : 'Belgilangan joy',
            },
            {
              preset: 'islands#redDotIconWithCaption',
              draggable: !readOnly,
            }
          );

          placemarkRef.current = placemark;
          map.geoObjects.add(placemark);

          // Optional user location pin if in readOnly mode
          if (readOnly && userCoordinates) {
            const userPin = new window.ymaps.Placemark(
              [userCoordinates.lat, userCoordinates.lng],
              {
                balloonContent: 'Joriy joylashuv',
                iconCaption: 'Siz',
              },
              {
                preset: 'islands#blueCircleDotIconWithCaption',
                draggable: false,
              }
            );
            userPlacemarkRef.current = userPin;
            map.geoObjects.add(userPin);
          }

          // Map events if not readOnly
          if (!readOnly) {
            placemark.events.add('dragend', () => {
              const newCoords = placemark.geometry.getCoordinates();
              handleCoordinatesChange(newCoords[0], newCoords[1], false);
            });

            map.events.add('click', (e: any) => {
              const clickCoords = e.get('coords');
              handleCoordinatesChange(clickCoords[0], clickCoords[1], false);
            });
          }

          // Modal Grey-Tile / Viewport Fix
          setTimeout(() => {
            if (mapInstanceRef.current && mapInstanceRef.current.container) {
              mapInstanceRef.current.container.fitToViewport();
            }
          }, 250);

          if (mapContainerRef.current && 'ResizeObserver' in window) {
            resizeObserver = new ResizeObserver(() => {
              if (mapInstanceRef.current && mapInstanceRef.current.container) {
                mapInstanceRef.current.container.fitToViewport();
              }
            });
            resizeObserver.observe(mapContainerRef.current);
          }

          setIsLoading(false);
          if (!addressText) {
            reverseGeocode(currentLat, currentLng);
          }
        } catch (err) {
          console.error('Yandex Maps init error:', err);
          if (isMounted) {
            setLoadError('Xarita yuklanishida xatolik yuz berdi');
            setIsLoading(false);
          }
        }
      });
    };

    // Load Yandex SDK singleton
    if (typeof window !== 'undefined') {
      if (window.ymaps) {
        initMap();
      } else {
        const existingScript = document.getElementById('yandex-maps-sdk');
        if (!existingScript) {
          const script = document.createElement('script');
          script.id = 'yandex-maps-sdk';
          script.src = 'https://api-maps.yandex.ru/2.1/?lang=uz_UZ';
          script.type = 'text/javascript';
          script.async = true;
          script.onload = () => {
            if (isMounted) initMap();
          };
          script.onerror = () => {
            if (isMounted) {
              setLoadError('Xarita skripti yuklanmadi');
              setIsLoading(false);
            }
          };
          document.head.appendChild(script);
        } else {
          existingScript.addEventListener('load', initMap);
        }
      }
    }

    return () => {
      isMounted = false;
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.destroy();
        } catch {
          // ignore
        }
        mapInstanceRef.current = null;
      }
    };
  }, [readOnly, reverseGeocode]); // eslint-disable-line react-hooks/exhaustive-deps

  // Synchronize incoming addressText prop
  useEffect(() => {
    if (addressText && addressText !== currentAddress) {
      setCurrentAddress(addressText);
    }
  }, [addressText]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="space-y-2.5">
      {/* Search Input Bar (When enabled) */}
      {!readOnly && showSearchAndDistricts && (
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-stone-400 dark:text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => {
                if (searchResults.length > 0) setShowSearchResults(true);
              }}
              placeholder="Ko'cha, metro yoki mo'ljalni yozing..."
              className="w-full pl-8.5 pr-8 py-2 rounded-xl border border-stone-200 dark:border-zinc-800 text-xs bg-white dark:bg-zinc-900 text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-[#141413] dark:focus:ring-stone-400 dark:focus:border-stone-400"
            />
            {isSearching && (
              <RefreshCw className="absolute right-2.5 top-2.5 w-3.5 h-3.5 text-amber-600 animate-spin" />
            )}
            {!isSearching && searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSearchResults([]);
                  setShowSearchResults(false);
                }}
                className="absolute right-2.5 top-2.5 text-stone-400 dark:text-zinc-400 hover:text-stone-600 dark:hover:text-stone-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Search suggestions dropdown */}
          {showSearchResults && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 z-30 rounded-xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 shadow-xl overflow-hidden max-h-48 overflow-y-auto">
              {searchResults.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectSearchResult(item)}
                  className="w-full text-left px-3 py-2 text-xs hover:bg-stone-50 dark:hover:bg-zinc-800 border-b border-stone-100 dark:border-zinc-800/80 last:border-0 flex items-start gap-2 text-stone-800 dark:text-stone-200"
                >
                  <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                  <span className="line-clamp-2">{item.display_name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Quick Tashkent District Chips */}
      {!readOnly && showSearchAndDistricts && (
        <div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {TASHKENT_DISTRICTS.map((district) => {
              const isSelected =
                Math.abs(coords.lat - district.coords.lat) < 0.02 &&
                Math.abs(coords.lng - district.coords.lng) < 0.02;

              return (
                <button
                  key={district.name}
                  type="button"
                  onClick={() => handleSelectDistrict(district)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all whitespace-nowrap border flex items-center gap-1 ${
                    isSelected
                      ? 'bg-[#141413] text-white dark:bg-zinc-800 dark:border-stone-400 dark:text-stone-100 shadow-2xs'
                      : 'bg-white dark:bg-zinc-900 text-stone-600 dark:text-stone-200 border-stone-200 dark:border-zinc-800 hover:border-stone-400 dark:hover:bg-zinc-800'
                  }`}
                >
                  <span>{district.name}</span>
                  {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Map Section Title in natural Uzbek */}
      {!readOnly && (
        <div className="pt-0.5">
          <label className="block text-xs font-semibold text-stone-800 dark:text-stone-100">
            Kitobni qayerdan olib ketish mumkin?
          </label>
          <p className="text-[11px] text-stone-500 dark:text-zinc-400 mt-0.5">
            Xaritadan o&#39;zingizga qulay joyni belgilang
          </p>
        </div>
      )}

      {/* Map Container: rounded-2xl with Custom Overlays */}
      <div
        className="relative w-full rounded-2xl overflow-hidden border border-stone-200/90 dark:border-zinc-800 bg-stone-100 dark:bg-zinc-950 shadow-sm"
        style={{ height }}
      >
        <div
          ref={mapContainerRef}
          id="yandex-map-picker-container"
          className="w-full h-full"
        />

        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-stone-100/90 dark:bg-zinc-900/90 backdrop-blur-xs flex flex-col items-center justify-center gap-2 z-10">
            <RefreshCw className="w-5 h-5 text-amber-600 animate-spin" />
            <span className="text-xs text-stone-600 dark:text-stone-200 font-medium">
              Xarita yuklanmoqda...
            </span>
          </div>
        )}

        {/* Error Fallback */}
        {loadError && (
          <div className="absolute inset-0 bg-stone-50/95 dark:bg-zinc-900/95 p-4 flex flex-col items-center justify-center text-center z-10">
            <AlertCircle className="w-6 h-6 text-amber-500 mb-1.5" />
            <span className="text-xs font-semibold text-stone-800 dark:text-stone-200">
              {loadError}
            </span>
            <p className="text-[11px] text-stone-500 dark:text-zinc-400 mt-1">
              Yuqoridagi tumanlardan birini tanlashingiz mumkin.
            </p>
          </div>
        )}

        {/* Custom Zoom Controls (+ / -) */}
        <div className="absolute top-3 right-3 z-20 flex flex-col gap-1 shadow-md">
          <button
            type="button"
            onClick={handleZoomIn}
            className="w-7 h-7 rounded-lg bg-white/95 dark:bg-zinc-900/95 text-stone-800 dark:text-stone-100 flex items-center justify-center border border-stone-200/80 dark:border-zinc-700 hover:bg-stone-100 dark:hover:bg-zinc-800 active:scale-95 transition-all"
            title="Kattalashtirish"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            className="w-7 h-7 rounded-lg bg-white/95 dark:bg-zinc-900/95 text-stone-800 dark:text-stone-100 flex items-center justify-center border border-stone-200/80 dark:border-zinc-700 hover:bg-stone-100 dark:hover:bg-zinc-800 active:scale-95 transition-all"
            title="Kichiklashtirish"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Custom "Joriy joylashuvni aniqlash" (Locate Me) Button */}
        {!readOnly && (
          <div className="absolute bottom-3 right-3 z-20">
            <button
              type="button"
              onClick={handleLocateMe}
              disabled={isLocating}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/95 dark:bg-zinc-900/95 text-stone-800 dark:text-stone-100 text-xs font-semibold backdrop-blur-md shadow-md border border-black/[0.08] dark:border-zinc-700 hover:bg-stone-50 dark:hover:bg-zinc-800 active:scale-95 transition-all"
              title="GPS orqali joriy joylashuvni aniqlash"
            >
              <Crosshair
                className={`w-3.5 h-3.5 text-amber-600 ${isLocating ? 'animate-spin' : ''}`}
              />
              <span>{isLocating ? 'Aniqlanmoqda...' : 'Joriy joylashuvni aniqlash'}</span>
            </button>
          </div>
        )}

        {/* Selected Marker Pill on Top-Left */}
        <div className="absolute top-3 left-3 z-20 pointer-events-none">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#141413]/85 dark:bg-stone-100/90 text-white dark:text-[#141413] text-[10px] font-semibold backdrop-blur-md shadow-sm border border-white/10 dark:border-black/10">
            <MapPin className="w-3 h-3 text-amber-400 dark:text-amber-600" />
            <span>{readOnly ? 'Uchrashuv nuqtasi' : 'Nuqta belgilandi ✓'}</span>
          </div>
        </div>
      </div>

      {/* Editable Address Input Field (Live Reverse-Geocoded) */}
      {!readOnly && (
        <div>
          <label className="block text-[11px] font-semibold text-stone-800 dark:text-stone-200 mb-1">
            Manzil va mo&#39;ljal (xaritadan avtomatik olindi, tahrirlashingiz mumkin)
          </label>
          <div className="relative">
            <Navigation className="absolute left-3 top-2.5 w-3.5 h-3.5 text-amber-600" />
            <input
              type="text"
              value={currentAddress}
              onChange={(e) => {
                setCurrentAddress(e.target.value);
                if (onAddressChange) onAddressChange(e.target.value);
              }}
              placeholder="masalan: Chilonzor tumani, Bunyodkor ko'chasi, metro yonida"
              className="w-full pl-8.5 pr-3 py-2 rounded-xl border border-stone-200 dark:border-zinc-800 text-xs bg-white dark:bg-zinc-900 text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-[#141413] dark:focus:ring-stone-400 dark:focus:border-stone-400"
            />
          </div>
        </div>
      )}
    </div>
  );
};
