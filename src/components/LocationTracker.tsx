'use client';

import { useEffect, useState } from 'react';
import { FaMapMarkerAlt, FaGlobe, FaLock, FaServer } from 'react-icons/fa';

interface LocationData {
  ip: string;
  latitude: number;
  longitude: number;
  city: string;
  region: string;
  country: string;
  isp: string;
  timezone: string;
}

export default function LocationTracker() {
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [typing, setTyping] = useState(0);

  useEffect(() => {
    const fetchLocationData = async () => {
      try {
        // Fetch IP and location data from ipapi
        const ipResponse = await fetch('https://ipapi.co/json/');
        const ipData = await ipResponse.json();

        // Request geolocation permission
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              setLocationData({
                ip: ipData.ip || 'Unknown',
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                city: ipData.city || 'Unknown',
                region: ipData.region || 'Unknown',
                country: ipData.country_name || 'Unknown',
                isp: ipData.org || 'Unknown ISP',
                timezone: ipData.timezone || 'Unknown'
              });
              setLoading(false);
            },
            () => {
              // If geolocation denied, use IP-based location
              setLocationData({
                ip: ipData.ip || 'Unknown',
                latitude: parseFloat(ipData.latitude) || 0,
                longitude: parseFloat(ipData.longitude) || 0,
                city: ipData.city || 'Unknown',
                region: ipData.region || 'Unknown',
                country: ipData.country_name || 'Unknown',
                isp: ipData.org || 'Unknown ISP',
                timezone: ipData.timezone || 'Unknown'
              });
              setLoading(false);
            }
          );
        } else {
          // No geolocation API, use IP-based
          setLocationData({
            ip: ipData.ip || 'Unknown',
            latitude: parseFloat(ipData.latitude) || 0,
            longitude: parseFloat(ipData.longitude) || 0,
            city: ipData.city || 'Unknown',
            region: ipData.region || 'Unknown',
            country: ipData.country_name || 'Unknown',
            isp: ipData.org || 'Unknown ISP',
            timezone: ipData.timezone || 'Unknown'
          });
          setLoading(false);
        }
      } catch (err) {
        setError('Failed to detect location');
        setLoading(false);
      }
    };

    fetchLocationData();

    // Typing animation
    const interval = setInterval(() => {
      setTyping(prev => (prev + 1) % 4);
    }, 500);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <section className="px-6 py-12 font-mono">
        <div className="max-w-7xl mx-auto">
          <div className="border-2 border-red-500/50 rounded-lg bg-gradient-to-br from-red-950/20 via-black to-black p-8">
            <div className="text-red-400 animate-pulse">
              <span className="text-emerald-400">$</span> Initializing location trace{'.'.repeat(typing)}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error || !locationData) {
    return null;
  }

  return (
    <section className="px-6 py-12 font-mono">
      <div className="max-w-7xl mx-auto">
        <div className="border-2 border-red-500/50 rounded-lg bg-gradient-to-br from-red-950/20 via-black to-black p-8 shadow-2xl shadow-red-500/20">
          {/* Terminal Header */}
          <div className="mb-6">
            <div className="flex items-center gap-2 text-red-400 mb-2">
              <FaLock className="animate-pulse" />
              <span className="text-sm">ACCESS GRANTED • LOCATION TRACED</span>
            </div>
            <div className="text-xs text-zinc-600 font-mono">
              <span className="text-emerald-400">root@portfolio:~$</span> geolocate --target=visitor --verbose
            </div>
          </div>

          {/* Location Data Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* IP Address */}
            <div className="border border-red-500/30 rounded-lg p-4 bg-black/50 hover:border-red-500/60 transition-all">
              <div className="flex items-center gap-2 text-red-400 mb-3">
                <FaServer className="text-sm" />
                <span className="text-xs uppercase tracking-wider">IP Address</span>
              </div>
              <div className="text-2xl font-bold text-emerald-400 mb-1 font-mono tracking-wide">
                {locationData.ip}
              </div>
              <div className="text-xs text-zinc-500">ISP: {locationData.isp}</div>
            </div>

            {/* Coordinates */}
            <div className="border border-red-500/30 rounded-lg p-4 bg-black/50 hover:border-red-500/60 transition-all">
              <div className="flex items-center gap-2 text-red-400 mb-3">
                <FaMapMarkerAlt className="text-sm" />
                <span className="text-xs uppercase tracking-wider">Coordinates</span>
              </div>
              <div className="text-lg font-bold text-emerald-400 font-mono">
                {locationData.latitude.toFixed(4)}°N
              </div>
              <div className="text-lg font-bold text-blue-400 font-mono">
                {locationData.longitude.toFixed(4)}°E
              </div>
            </div>

            {/* Location */}
            <div className="border border-red-500/30 rounded-lg p-4 bg-black/50 hover:border-red-500/60 transition-all">
              <div className="flex items-center gap-2 text-red-400 mb-3">
                <FaGlobe className="text-sm" />
                <span className="text-xs uppercase tracking-wider">Location</span>
              </div>
              <div className="text-xl font-bold text-emerald-400 mb-1">
                {locationData.city}
              </div>
              <div className="text-sm text-zinc-400">
                {locationData.region}, {locationData.country}
              </div>
            </div>

            {/* Timezone */}
            <div className="border border-red-500/30 rounded-lg p-4 bg-black/50 hover:border-red-500/60 transition-all">
              <div className="flex items-center gap-2 text-red-400 mb-3">
                <span className="text-sm">⏰</span>
                <span className="text-xs uppercase tracking-wider">Timezone</span>
              </div>
              <div className="text-xl font-bold text-emerald-400 mb-1">
                {locationData.timezone}
              </div>
              <div className="text-sm text-zinc-400">
                {new Date().toLocaleTimeString()}
              </div>
            </div>
          </div>

          {/* Terminal Output Style Footer */}
          <div className="mt-6 pt-4 border-t border-red-500/20">
            <div className="text-xs text-zinc-600 font-mono space-y-1">
              <div><span className="text-red-400">[INFO]</span> Location accuracy: ~10-50 meters</div>
              <div><span className="text-yellow-400">[WARN]</span> Your data is not stored or shared</div>
              <div><span className="text-emerald-400">[OK]</span> Geolocation trace complete</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
