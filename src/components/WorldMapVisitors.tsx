'use client';

import { useEffect, useState } from 'react';
import { FaGlobe, FaEye, FaUsers, FaMapMarkerAlt, FaServer, FaLock } from 'react-icons/fa';

interface VisitorLocation {
  country: string;
  countryCode: string;
  city: string;
  count: number;
  lat: number;
  lng: number;
}

interface UserLocation {
  ip: string;
  latitude: number;
  longitude: number;
  city: string;
  region: string;
  country: string;
  isp: string;
}

export default function WorldMapVisitors() {
  const [visitors, setVisitors] = useState({
    current: 0,
    total: 0,
    locations: [] as VisitorLocation[]
  });
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(true);

  // Simulate visitor data with coordinates
  const mockLocations: VisitorLocation[] = [
    { country: 'United States', countryCode: 'US', city: 'San Francisco', count: 45, lat: 37.7749, lng: -122.4194 },
    { country: 'India', countryCode: 'IN', city: 'Mumbai', count: 89, lat: 19.0760, lng: 72.8777 },
    { country: 'United Kingdom', countryCode: 'GB', city: 'London', count: 32, lat: 51.5074, lng: -0.1278 },
    { country: 'Germany', countryCode: 'DE', city: 'Berlin', count: 28, lat: 52.5200, lng: 13.4050 },
    { country: 'Canada', countryCode: 'CA', city: 'Toronto', count: 21, lat: 43.6532, lng: -79.3832 },
    { country: 'Japan', countryCode: 'JP', city: 'Tokyo', count: 56, lat: 35.6762, lng: 139.6503 },
    { country: 'Australia', countryCode: 'AU', city: 'Sydney', count: 18, lat: -33.8688, lng: 151.2093 },
    { country: 'Brazil', countryCode: 'BR', city: 'São Paulo', count: 34, lat: -23.5505, lng: -46.6333 },
  ];

  useEffect(() => {
    const updateVisitors = () => {
      setVisitors({
        current: Math.floor(Math.random() * 8) + 3,
        total: 2847 + Math.floor(Math.random() * 200),
        locations: mockLocations
      });
    };

    updateVisitors();
    const interval = setInterval(updateVisitors, 15000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchUserLocation = async () => {
      try {
        const ipResponse = await fetch('https://ipapi.co/json/');
        const ipData = await ipResponse.json();

        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              setUserLocation({
                ip: ipData.ip || 'Unknown',
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                city: ipData.city || 'Unknown',
                region: ipData.region || 'Unknown',
                country: ipData.country_name || 'Unknown',
                isp: ipData.org || 'Unknown ISP'
              });
              setLoadingLocation(false);
            },
            () => {
              setUserLocation({
                ip: ipData.ip || 'Unknown',
                latitude: parseFloat(ipData.latitude) || 0,
                longitude: parseFloat(ipData.longitude) || 0,
                city: ipData.city || 'Unknown',
                region: ipData.region || 'Unknown',
                country: ipData.country_name || 'Unknown',
                isp: ipData.org || 'Unknown ISP'
              });
              setLoadingLocation(false);
            }
          );
        } else {
          setUserLocation({
            ip: ipData.ip || 'Unknown',
            latitude: parseFloat(ipData.latitude) || 0,
            longitude: parseFloat(ipData.longitude) || 0,
            city: ipData.city || 'Unknown',
            region: ipData.region || 'Unknown',
            country: ipData.country_name || 'Unknown',
            isp: ipData.org || 'Unknown ISP'
          });
          setLoadingLocation(false);
        }
      } catch (err) {
        setLoadingLocation(false);
      }
    };

    fetchUserLocation();
  }, []);

  // Convert coordinates to SVG position (updated for new viewBox)
  const coordToSVG = (lat: number, lng: number) => {
    const x = ((lng + 180) * (2000 / 360));
    const y = ((90 - lat) * (1000 / 180));
    return { x, y };
  };

  return (
    <section className="px-6 py-12 font-mono">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-emerald-500/5 border-2 border-emerald-500/30 rounded-lg mb-4">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
            <h2 className="text-2xl font-bold text-emerald-400">
              Global Visitor Map
            </h2>
          </div>
          <p className="text-zinc-400 text-lg">Real-time visitor tracking across the world</p>
        </div>

        <div className="border-2 border-emerald-500/30 rounded-lg bg-gradient-to-br from-black via-zinc-950 to-black p-6">

          {/* Stats Grid */}
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="border-2 border-emerald-500/30 rounded-lg p-4 bg-gradient-to-br from-black to-zinc-950">
              <div className="flex items-center gap-2 text-zinc-500 text-sm mb-2">
                <FaEye className="text-emerald-400" />
                <span>Developers Viewing</span>
              </div>
              <div className="text-3xl font-bold text-emerald-400">{visitors.current}</div>
              <div className="text-xs text-zinc-600 mt-1">Right now</div>
            </div>

            <div className="border-2 border-blue-500/30 rounded-lg p-4 bg-gradient-to-br from-black to-zinc-950">
              <div className="flex items-center gap-2 text-zinc-500 text-sm mb-2">
                <FaUsers className="text-blue-400" />
                <span>Total Visitors</span>
              </div>
              <div className="text-3xl font-bold text-blue-400">{visitors.total.toLocaleString()}</div>
              <div className="text-xs text-zinc-600 mt-1">All time</div>
            </div>

            <div className="border-2 border-purple-500/30 rounded-lg p-4 bg-gradient-to-br from-black to-zinc-950">
              <div className="flex items-center gap-2 text-zinc-500 text-sm mb-2">
                <FaMapMarkerAlt className="text-purple-400" />
                <span>Active Regions</span>
              </div>
              <div className="text-3xl font-bold text-purple-400">{visitors.locations.length}</div>
              <div className="text-xs text-zinc-600 mt-1">Countries</div>
            </div>
          </div>

          {/* OpenStreetMap Embed with User Location Overlay */}
          <div className="relative rounded-lg overflow-hidden bg-black border-2 border-emerald-500/30">
            <iframe
              src="https://www.openstreetmap.org/export/embed.html?bbox=-180,-85,180,85&layer=mapnik"
              width="100%"
              height="500"
              style={{
                border: 0,
                filter: 'invert(0.92) hue-rotate(180deg) brightness(0.9) contrast(1.2)',
                display: 'block'
              }}
              title="World Map"
            ></iframe>

            {/* User Location Overlay - Terminal Style */}
            {userLocation && (
              <div className="absolute top-4 left-4 right-4 bg-black/95 border-2 border-red-500/50 rounded-lg p-4 backdrop-blur-sm shadow-2xl shadow-red-500/20">
                <div className="flex items-center gap-2 text-red-400 mb-3 text-xs">
                  <FaLock className="animate-pulse" />
                  <span className="font-mono">$ geolocate --target=visitor --trace</span>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
                  {/* IP Address */}
                  <div className="border border-red-500/30 rounded bg-black/50 p-2">
                    <div className="text-red-400 mb-1 flex items-center gap-1">
                      <FaServer className="text-[10px]" />
                      <span>IP</span>
                    </div>
                    <div className="text-emerald-400 font-bold truncate">{userLocation.ip}</div>
                  </div>

                  {/* Coordinates */}
                  <div className="border border-red-500/30 rounded bg-black/50 p-2">
                    <div className="text-red-400 mb-1 flex items-center gap-1">
                      <FaMapMarkerAlt className="text-[10px]" />
                      <span>LAT</span>
                    </div>
                    <div className="text-emerald-400 font-bold">{userLocation.latitude.toFixed(4)}°</div>
                  </div>

                  <div className="border border-red-500/30 rounded bg-black/50 p-2">
                    <div className="text-red-400 mb-1 flex items-center gap-1">
                      <FaMapMarkerAlt className="text-[10px]" />
                      <span>LNG</span>
                    </div>
                    <div className="text-emerald-400 font-bold">{userLocation.longitude.toFixed(4)}°</div>
                  </div>

                  {/* Location */}
                  <div className="border border-red-500/30 rounded bg-black/50 p-2">
                    <div className="text-red-400 mb-1 flex items-center gap-1">
                      <FaGlobe className="text-[10px]" />
                      <span>LOC</span>
                    </div>
                    <div className="text-emerald-400 font-bold truncate">{userLocation.city}, {userLocation.country}</div>
                  </div>
                </div>

                <div className="mt-2 text-[10px] text-zinc-600 font-mono">
                  <span className="text-yellow-400">[TRACE]</span> ISP: {userLocation.isp}
                </div>
              </div>
            )}

            {loadingLocation && (
              <div className="absolute top-4 left-4 bg-black/95 border-2 border-red-500/50 rounded-lg p-4 backdrop-blur-sm">
                <div className="text-red-400 text-xs font-mono animate-pulse">
                  $ Initializing geolocation trace...
                </div>
              </div>
            )}
          </div>

          {/* Location List */}
          <div className="mt-6 grid md:grid-cols-2 gap-3">
            {visitors.locations.map((location, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-zinc-900/50 rounded border border-zinc-800 hover:border-emerald-500/50 transition"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{location.countryCode === 'US' ? '🇺🇸' : 
                    location.countryCode === 'IN' ? '🇮🇳' :
                    location.countryCode === 'GB' ? '🇬🇧' :
                    location.countryCode === 'DE' ? '🇩🇪' :
                    location.countryCode === 'CA' ? '🇨🇦' :
                    location.countryCode === 'JP' ? '🇯🇵' :
                    location.countryCode === 'AU' ? '🇦🇺' :
                    location.countryCode === 'BR' ? '🇧🇷' : '🌍'}</span>
                  <div>
                    <div className="text-sm font-semibold text-zinc-300">{location.city}</div>
                    <div className="text-xs text-zinc-600">{location.country}</div>
                  </div>
                </div>
                <div className="text-blue-400 font-bold">{location.count}</div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-emerald-500/20">
            <div className="text-xs text-zinc-600">
              <span className="text-emerald-400">●</span> Live tracking • Updates every 15s • 
              <span className="text-emerald-400"> Privacy-focused</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
