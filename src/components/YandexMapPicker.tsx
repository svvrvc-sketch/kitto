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
  Compass,
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';

declare global {
  interface Window {
    ymaps: any;
    L: any;
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

export function getClosestTashkentDistrict(lat: number, lng: number) {
  let closest = TASHKENT_DISTRICTS[0];
  let minDist = Infinity;
  for (const district of TASHKENT_DISTRICTS) {
    const dist = Math.hypot(lat - district.coords.lat, lng - district.coords.lng);
    if (dist < minDist) {
      minDist = dist;
      closest = district;
    }
  }
  return closest;
}

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
  height = '280px',
  showSearchAndDistricts = true,
  userCoordinates = null,
}) => {
  const { showToast } = useToast();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const leafletMapRef = useRef<any>(null);
  const placemarkRef = useRef<any>(null);
  const leafletMarkerRef = useRef<any>(null);
  const userPlacemarkRef = useRef<any>(null);

  const [coords, setCoords] = useState<Coordinates>(initialCoordinates);
  const [currentAddress, setCurrentAddress] = useState<string>(addressText || 'O‘zbekiston');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [mapEngine, setMapEngine] = useState<'yandex' | 'leaflet' | 'none'>('yandex');

  // Search state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<
    Array<{ display_name: string; lat: string; lon: string }>
  >([]);
  const [showSearchResults, setShowSearchResults] = useState<boolean>(false);

  // Fast reverse geocode with guaranteed district fallback
  const reverseGeocode = useCallback(
    async (lat: number, lng: number) => {
      const closest = getClosestTashkentDistrict(lat, lng);
      const fallbackDistrictAddress = `Toshkent shahri, ${closest.name} tumani`;

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);

        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=uz`,
          { signal: controller.signal }
        );
        clearTimeout(timeoutId);

        if (!response.ok) throw new Error('Geocoding response not ok');
        const data = await response.json();

        if (data && data.address) {
          const addr = data.address;
          const district =
            addr.county ||
            addr.suburb ||
            addr.city_district ||
            addr.district ||
            closest.name + ' tumani';
          const road = addr.road || addr.pedestrian || addr.street;
          const houseNumber = addr.house_number;

          const parts = [district, road, houseNumber].filter(Boolean);
          const formatted =
            parts.length > 0
              ? parts.join(', ')
              : `Toshkent shahri, ${closest.name} tumani`;

          setCurrentAddress(formatted);
          if (onAddressChange) onAddressChange(formatted);
        } else {
          setCurrentAddress(fallbackDistrictAddress);
          if (onAddressChange) onAddressChange(fallbackDistrictAddress);
        }
      } catch {
        // Fallback gracefully without throwing
        setCurrentAddress(fallbackDistrictAddress);
        if (onAddressChange) onAddressChange(fallbackDistrictAddress);
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

      // Update Yandex Map
      if (placemarkRef.current && window.ymaps) {
        placemarkRef.current.geometry.setCoordinates([lat, lng]);
      }
      if (moveCenter && mapInstanceRef.current && window.ymaps) {
        mapInstanceRef.current.setCenter([lat, lng], zoomLevel, { duration: 300 });
      }

      // Update Leaflet Map
      if (leafletMarkerRef.current) {
        leafletMarkerRef.current.setLatLng([lat, lng]);
      }
      if (moveCenter && leafletMapRef.current) {
        leafletMapRef.current.setView([lat, lng], zoomLevel, { animate: true });
      }
    },
    [onCoordinatesChange, reverseGeocode]
  );

  // Native GPS geolocation handler with fast fallback
  const handleLocateMe = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (typeof window === 'undefined' || !('geolocation' in navigator)) {
      showToast('Brauzeringizda geolokatsiya qoʻllab-quvvatlanmaydi', 'error');
      return;
    }

    setIsLocating(true);

    const onGeoSuccess = (pos: GeolocationPosition) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      const closest = getClosestTashkentDistrict(lat, lng);

      handleCoordinatesChange(lat, lng, true, 16);

      try {
        sessionStorage.setItem('kitto_user_coords', JSON.stringify({ lat, lng }));
        sessionStorage.setItem('bookswap_user_coords', JSON.stringify({ lat, lng }));
        localStorage.setItem('kitto_user_coords', JSON.stringify({ lat, lng }));
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
      showToast(`Joylashuvingiz aniqlandi: ${closest.name} tumani!`, 'success');
    };

    const onGeoError = () => {
      // Fallback with low accuracy for instant cellular/Wi-Fi positioning
      navigator.geolocation.getCurrentPosition(
        onGeoSuccess,
        (fallbackErr) => {
          setIsLocating(false);
          if (fallbackErr.code === 1) {
            showToast(
              "Brauzerda joylashuvga ruxsat berilmadi. Qulay tumanni tanlang.",
              'error'
            );
          } else {
            showToast("GPS aniqlab bo'lmadi. Tumanni bosing.", 'info');
          }
        },
        { enableHighAccuracy: false, timeout: 6000, maximumAge: 300000 }
      );
    };

    navigator.geolocation.getCurrentPosition(
      onGeoSuccess,
      onGeoError,
      { enableHighAccuracy: true, timeout: 6000, maximumAge: 60000 }
    );
  };

  // Zoom controls
  const handleZoomIn = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (mapInstanceRef.current && window.ymaps) {
      const currentZoom = mapInstanceRef.current.getZoom();
      mapInstanceRef.current.setZoom(currentZoom + 1, { duration: 200 });
    } else if (leafletMapRef.current) {
      leafletMapRef.current.zoomIn();
    }
  };

  const handleZoomOut = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (mapInstanceRef.current && window.ymaps) {
      const currentZoom = mapInstanceRef.current.getZoom();
      mapInstanceRef.current.setZoom(currentZoom - 1, { duration: 200 });
    } else if (leafletMapRef.current) {
      leafletMapRef.current.zoomOut();
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
        const queryWithCity = `${searchQuery.trim()}, O‘zbekiston`;
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(
            queryWithCity
          )}&accept-language=uz&limit=5`
        );
        if (!res.ok) throw new Error('Search failed');
        const data = await res.json();
        setSearchResults(data || []);
        setShowSearchResults(true);
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 350);

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

  // Leaflet Map Initialization Fallback
  const initLeaflet = useCallback(() => {
    if (!mapContainerRef.current) return;

    const loadLeafletAssets = () => {
      return new Promise<any>((resolve, reject) => {
        if (window.L) return resolve(window.L);

        if (!document.getElementById('leaflet-css')) {
          const link = document.createElement('link');
          link.id = 'leaflet-css';
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          document.head.appendChild(link);
        }

        const script = document.createElement('script');
        script.id = 'leaflet-js';
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.async = true;
        script.onload = () => resolve(window.L);
        script.onerror = reject;
        document.head.appendChild(script);
      });
    };

    loadLeafletAssets()
      .then((L) => {
        if (!mapContainerRef.current) return;

        // Clean container if needed
        if (leafletMapRef.current) {
          leafletMapRef.current.remove();
          leafletMapRef.current = null;
        }

        const currentLat = coords.lat || TASHKENT_CENTER.lat;
        const currentLng = coords.lng || TASHKENT_CENTER.lng;

        const map = L.map(mapContainerRef.current, {
          center: [currentLat, currentLng],
          zoom: readOnly ? 15 : 14,
          zoomControl: false,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '© OpenStreetMap',
        }).addTo(map);

        const marker = L.marker([currentLat, currentLng], {
          draggable: !readOnly,
        }).addTo(map);

        if (!readOnly) {
          marker.on('dragend', () => {
            const pos = marker.getLatLng();
            handleCoordinatesChange(pos.lat, pos.lng, false);
          });

          map.on('click', (e: any) => {
            const { lat, lng } = e.latlng;
            marker.setLatLng([lat, lng]);
            handleCoordinatesChange(lat, lng, false);
          });
        }

        leafletMapRef.current = map;
        leafletMarkerRef.current = marker;
        setMapEngine('leaflet');
        setIsLoading(false);
        setLoadError(null);
      })
      .catch((err) => {
        console.warn('Leaflet fallback load failed:', err);
        setIsLoading(false);
        setMapEngine('none');
      });
  }, [coords.lat, coords.lng, handleCoordinatesChange, readOnly]);

  // Main Map initialization
  useEffect(() => {
    let isMounted = true;
    let resizeObserver: ResizeObserver | null = null;
    let yandexTimeout: NodeJS.Timeout | null = null;

    const initYandexMap = () => {
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

          const placemark = new window.ymaps.Placemark(
            [currentLat, currentLng],
            {
              balloonContent: 'Kitob uchrashuv joyi',
              iconCaption: readOnly ? 'Kitob joyi' : 'Belgilangan joy',
            },
            {
              preset: 'islands#darkOrangeDotIconWithCaption',
              draggable: !readOnly,
            }
          );

          placemarkRef.current = placemark;
          map.geoObjects.add(placemark);

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
          setMapEngine('yandex');
          if (!addressText) {
            reverseGeocode(currentLat, currentLng);
          }
        } catch (err) {
          console.warn('Yandex Maps init failed, switching to Leaflet:', err);
          initLeaflet();
        }
      });
    };

    // Load Yandex SDK singleton with fallback timeout
    if (typeof window !== 'undefined') {
      if (window.ymaps) {
        initYandexMap();
      } else {
        const existingScript = document.getElementById('yandex-maps-sdk');

        // If Yandex doesn't respond in 2500ms, immediately fall back to Leaflet
        yandexTimeout = setTimeout(() => {
          if (isLoading && isMounted && !mapInstanceRef.current) {
            console.info('Yandex response timed out, loading Leaflet OpenStreetMap fallback...');
            initLeaflet();
          }
        }, 2500);

        if (!existingScript) {
          const script = document.createElement('script');
          script.id = 'yandex-maps-sdk';
          script.src = 'https://api-maps.yandex.ru/2.1/?lang=uz_UZ';
          script.type = 'text/javascript';
          script.async = true;
          script.onload = () => {
            if (yandexTimeout) clearTimeout(yandexTimeout);
            if (isMounted) initYandexMap();
          };
          script.onerror = () => {
            if (yandexTimeout) clearTimeout(yandexTimeout);
            if (isMounted) initLeaflet();
          };
          document.head.appendChild(script);
        } else {
          existingScript.addEventListener('load', () => {
            if (yandexTimeout) clearTimeout(yandexTimeout);
            initYandexMap();
          });
        }
      }
    }

    return () => {
      isMounted = false;
      if (yandexTimeout) clearTimeout(yandexTimeout);
      if (resizeObserver) resizeObserver.disconnect();
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.destroy();
        } catch {
          // ignore
        }
        mapInstanceRef.current = null;
      }
      if (leafletMapRef.current) {
        try {
          leafletMapRef.current.remove();
        } catch {
          // ignore
        }
        leafletMapRef.current = null;
      }
    };
  }, [readOnly, reverseGeocode, initLeaflet]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (addressText && addressText !== currentAddress) {
      setCurrentAddress(addressText);
    }
  }, [addressText]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="space-y-3">
      {/* 1. GPS Auto-Detect Button (Prominent top banner) */}
      {!readOnly && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Compass className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
            </div>
            <div>
              <p className="text-xs font-bold text-stone-900 dark:text-stone-100">
                Hozirgi joylashuvimni aniqlash
              </p>
              <p className="text-[11px] text-stone-600 dark:text-stone-400">
                {currentAddress || 'O‘zbekiston'}
              </p>
            </div>
          </div>

          <button
            id="map-locate-gps-btn"
            type="button"
            onClick={handleLocateMe}
            disabled={isLocating}
            className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 active:scale-95 text-white text-xs font-bold shadow-xs transition-all disabled:opacity-60 shrink-0"
          >
            <Crosshair className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
            <span>{isLocating ? 'Aniqlanmoqda...' : 'GPS orqali aniqlash'}</span>
          </button>
        </div>
      )}

      {/* 2. Search Bar */}
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
              placeholder="Ko'cha, metro yoki mo'ljalni qidiring..."
              className="w-full pl-8.5 pr-8 py-2 rounded-xl border border-stone-200 dark:border-zinc-800 text-xs bg-white dark:bg-zinc-900 text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-amber-600 dark:focus:ring-amber-500 transition-all"
            />
            {isSearching && (
              <RefreshCw className="absolute right-2.5 top-2.5 w-3.5 h-3.5 text-amber-600 animate-spin" />
            )}
            {searchQuery && !isSearching && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-stone-400 hover:text-stone-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Search Results Dropdown */}
          {showSearchResults && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1.5 z-30 bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-xl shadow-xl overflow-hidden max-h-48 overflow-y-auto">
              {searchResults.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectSearchResult(item)}
                  className="w-full text-left px-3 py-2 text-xs text-stone-800 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-zinc-800 border-b border-stone-100 dark:border-zinc-800 last:border-0 flex items-start gap-2"
                >
                  <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                  <span className="truncate">{item.display_name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. District Chips */}
      {!readOnly && showSearchAndDistricts && (
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-stone-600 dark:text-stone-300">
              Tezkor tumanlar:
            </span>
            <span className="text-[10px] text-stone-500 dark:text-zinc-400">
              Bir bosishda tanlang
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
            {TASHKENT_DISTRICTS.map((district) => {
              const isSelected =
                Math.hypot(coords.lat - district.coords.lat, coords.lng - district.coords.lng) <
                0.035;
              return (
                <button
                  key={district.name}
                  type="button"
                  onClick={() => handleSelectDistrict(district)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all flex items-center gap-1 ${
                    isSelected
                      ? 'bg-amber-600 text-white border-amber-600 shadow-2xs'
                      : 'bg-white dark:bg-zinc-900 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-zinc-800 hover:border-amber-500'
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

      {/* 4. Map Container */}
      <div
        className="relative w-full rounded-2xl overflow-hidden border border-stone-200/90 dark:border-zinc-800 bg-stone-100 dark:bg-zinc-950 shadow-sm"
        style={{ height }}
      >
        <div
          ref={mapContainerRef}
          id="kitto-map-canvas"
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

        {/* Custom Zoom Controls */}
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

        {/* Selected Marker Pill on Top-Left */}
        <div className="absolute top-3 left-3 z-20 pointer-events-none">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-stone-900/90 text-white text-[10px] font-semibold backdrop-blur-md shadow-sm border border-white/10">
            <MapPin className="w-3 h-3 text-amber-400" />
            <span className="max-w-[200px] truncate">
              {currentAddress || `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default YandexMapPicker;
