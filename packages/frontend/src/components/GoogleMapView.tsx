'use client';

import { useEffect, useRef, useState } from 'react';
import { HiExclamationTriangle, HiMapPin, HiAcademicCap } from 'react-icons/hi2';

declare global {
  interface Window {
    google: any;
  }
}

export interface PGMapItem {
  id: number;
  title: string;
  latitude: number;
  longitude: number;
  minRent: number;
  genderRestriction: string;
  isDemoData: boolean;
  distanceKm?: number;
  photoUrl?: string;
}

export interface CollegeMapItem {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
}

interface GoogleMapViewProps {
  college?: CollegeMapItem | null;
  pgs: PGMapItem[];
  selectedPgId?: number | null;
  hoveredPgId?: number | null;
  onSelectPg: (pgId: number) => void;
  radiusKm?: number;
}

export default function GoogleMapView({
  college,
  pgs,
  selectedPgId,
  hoveredPgId,
  onSelectPg,
  radiusKm = 5,
}: GoogleMapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapObj = useRef<any>(null);
  const markersRef = useRef<Map<number, any>>(new Map());
  const infoWindowsRef = useRef<Map<number, any>>(new Map());
  const collegeMarkerRef = useRef<any>(null);
  const circleRef = useRef<any>(null);

  const [mapLoaded, setMapLoaded] = useState(false);
  const [apiKeyMissing, setApiKeyMissing] = useState(false);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  const centerLat = college?.latitude || (pgs.length > 0 ? pgs[0].latitude : 28.6904);
  const centerLng = college?.longitude || (pgs.length > 0 ? pgs[0].longitude : 77.2066);

  // Auto-pan & open InfoWindow popup when hovering over a PG card
  useEffect(() => {
    if (hoveredPgId && googleMapObj.current && markersRef.current.has(hoveredPgId)) {
      const marker = markersRef.current.get(hoveredPgId);
      const infoWindow = infoWindowsRef.current.get(hoveredPgId);
      if (marker && infoWindow) {
        infoWindowsRef.current.forEach((iw) => iw.close());
        infoWindow.open(googleMapObj.current, marker);
        googleMapObj.current.panTo(marker.getPosition());
      }
    }
  }, [hoveredPgId]);

  useEffect(() => {
    (window as any).gm_authFailure = () => {
      console.warn('[GoogleMapView] Google Maps Authentication failed or key invalid. Reverting to interactive fallback preview.');
      setApiKeyMissing(true);
    };

    if (!apiKey || apiKey === 'YOUR_GOOGLE_MAPS_API_KEY' || !apiKey.startsWith('AIza')) {
      setApiKeyMissing(true);
      return;
    }

    if (window.google?.maps) {
      setMapLoaded(true);
      return;
    }

    const scriptId = 'google-maps-js-script';
    let script = document.getElementById(scriptId) as HTMLScriptElement;

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry`;
      script.async = true;
      script.defer = true;
      script.onload = () => setMapLoaded(true);
      script.onerror = () => setApiKeyMissing(true);
      document.head.appendChild(script);
    } else {
      script.addEventListener('load', () => setMapLoaded(true));
    }
  }, [apiKey]);

  useEffect(() => {
    if (!mapLoaded || !mapRef.current || !window.google?.maps) return;

    if (!googleMapObj.current) {
      googleMapObj.current = new window.google.maps.Map(mapRef.current, {
        center: { lat: centerLat, lng: centerLng },
        zoom: 14,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
      });
    } else {
      googleMapObj.current.panTo({ lat: centerLat, lng: centerLng });
    }

    const map = googleMapObj.current;

    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current.clear();
    infoWindowsRef.current.forEach((iw) => iw.close());
    infoWindowsRef.current.clear();
    if (collegeMarkerRef.current) collegeMarkerRef.current.setMap(null);
    if (circleRef.current) circleRef.current.setMap(null);

    if (college) {
      collegeMarkerRef.current = new window.google.maps.Marker({
        position: { lat: college.latitude, lng: college.longitude },
        map,
        title: college.name,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 12,
          fillColor: '#1d4ed8',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 3,
        },
      });

      circleRef.current = new window.google.maps.Circle({
        strokeColor: '#2563eb',
        strokeOpacity: 0.6,
        strokeWeight: 2,
        fillColor: '#3b82f6',
        fillOpacity: 0.1,
        map,
        center: { lat: college.latitude, lng: college.longitude },
        radius: radiusKm * 1000,
      });
    }

    pgs.forEach((pg) => {
      const isSelected = selectedPgId === pg.id;
      const isHovered = hoveredPgId === pg.id;

      const marker = new window.google.maps.Marker({
        position: { lat: pg.latitude, lng: pg.longitude },
        map,
        title: pg.title,
        icon: {
          path: window.google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
          scale: isSelected || isHovered ? 8 : 6,
          fillColor: isSelected ? '#dc2626' : isHovered ? '#f59e0b' : '#2563eb',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
        },
      });

      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 8px; max-width: 200px; font-family: system-ui, sans-serif;">
            ${pg.photoUrl ? `<img src="${pg.photoUrl}" style="width: 100%; height: 90px; object-fit: cover; border-radius: 8px; margin-bottom: 6px;" />` : ''}
            <strong style="font-size: 13px; color: #0f172a; display: block; line-height: 1.3;">${pg.title}</strong>
            <div style="display: flex; items-center; justify-content: space-between; margin-top: 4px;">
              <span style="font-size: 13px; color: #10b981; font-weight: 800;">₹${pg.minRent.toLocaleString()}/mo</span>
              ${pg.distanceKm !== undefined ? `<span style="font-size: 11px; color: #64748b; font-weight: 600;">${pg.distanceKm} km</span>` : ''}
            </div>
          </div>
        `,
      });

      marker.addListener('click', () => {
        infoWindowsRef.current.forEach((iw) => iw.close());
        infoWindow.open(map, marker);
        onSelectPg(pg.id);
      });

      markersRef.current.set(pg.id, marker);
      infoWindowsRef.current.set(pg.id, infoWindow);
    });
  }, [mapLoaded, college, pgs, selectedPgId, hoveredPgId, radiusKm, centerLat, centerLng, onSelectPg]);

  if (apiKeyMissing || !mapLoaded) {
    return (
      <div className="relative w-full h-full min-h-[400px] bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 flex flex-col justify-between p-4 shadow-inner">
        <div className="bg-amber-500/90 backdrop-blur-md text-slate-950 font-bold text-xs p-3 rounded-xl flex items-center justify-between shadow-md z-20">
          <div className="flex items-center gap-2">
            <HiExclamationTriangle className="w-5 h-5 shrink-0" />
            <span>
              Google Maps API Key not set (`NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`). Interactive Fallback Preview Active.
            </span>
          </div>
        </div>

        <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center p-6">
          <svg className="w-full h-full opacity-30 absolute inset-0" xmlns="http://www.w3.org/2000/svg">
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>

          <div className="relative z-10 w-full h-full flex flex-col items-center justify-center text-center space-y-4">
            <div className="relative w-72 h-72 rounded-full border-2 border-blue-500/30 bg-blue-500/5 flex items-center justify-center animate-pulse">
              <span className="absolute top-2 text-[10px] font-bold text-blue-400 uppercase tracking-widest bg-slate-900/80 px-2 py-0.5 rounded-full border border-blue-500/30">
                {radiusKm} km Search Radius
              </span>

              {college && (
                <div className="w-12 h-12 rounded-full bg-blue-600 text-white font-extrabold text-xs flex flex-col items-center justify-center shadow-lg shadow-blue-500/50 border-2 border-white z-20">
                  <HiAcademicCap className="w-6 h-6" />
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 max-w-md">
              {pgs.slice(0, 8).map((pg) => {
                const isSelected = selectedPgId === pg.id;
                const isHovered = hoveredPgId === pg.id;

                return (
                  <button
                    key={pg.id}
                    onClick={() => onSelectPg(pg.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-extrabold transition-all flex items-center gap-1 shadow-md ${
                      isSelected
                        ? 'bg-rose-600 text-white ring-4 ring-rose-500/30 scale-110 z-30'
                        : isHovered
                        ? 'bg-amber-500 text-slate-950 scale-105 z-20'
                        : 'bg-blue-600/90 text-white hover:bg-blue-500'
                    }`}
                  >
                    <HiMapPin className="w-3.5 h-3.5" />
                    <span>₹{(pg.minRent / 1000).toFixed(1)}k</span>
                  </button>
                );
              })}
            </div>

            <p className="text-slate-400 text-xs font-medium max-w-sm">
              Click any PG marker above to highlight its card. Configure Google Maps API Key to activate vector road maps.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full min-h-[400px] rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
      <div ref={mapRef} className="w-full h-full min-h-[400px]" />
    </div>
  );
}
