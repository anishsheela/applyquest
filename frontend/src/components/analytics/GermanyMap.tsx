import React, { useMemo, useState, useEffect } from 'react';
import { MapPin, Info, Loader2 } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { JobApplication, ApplicationStatus } from '../../types';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface GermanyMapProps {
  applications: JobApplication[];
}

interface LocationData {
  name: string;
  coordinates: [number, number];
  applications: JobApplication[];
  count: number;
  geocoded: boolean;
}

// Cache for geocoding results
const geocodeCache: Map<string, [number, number]> = new Map();

// Geocode a city name to coordinates
const geocodeLocation = async (location: string): Promise<[number, number] | null> => {
  // Check cache first
  const cacheKey = location.toLowerCase().trim();
  if (geocodeCache.has(cacheKey)) {
    return geocodeCache.get(cacheKey)!;
  }

  try {
    // Use Nominatim (OpenStreetMap) geocoding service - free and no API key needed
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)},Germany&limit=1&countrycodes=de`
    );

    if (!response.ok) {
      throw new Error('Geocoding request failed');
    }

    const data = await response.json();

    if (data && data.length > 0) {
      const coords: [number, number] = [parseFloat(data[0].lat), parseFloat(data[0].lon)];

      // Cache the result
      geocodeCache.set(cacheKey, coords);

      // Also cache in localStorage for persistence
      try {
        localStorage.setItem(`geocode_${cacheKey}`, JSON.stringify(coords));
      } catch (e) {
        // localStorage might not be available
      }

      return coords;
    }
  } catch (error) {
    console.warn(`Failed to geocode location: ${location}`, error);
  }

  // Try to load from localStorage if fetch failed
  try {
    const cached = localStorage.getItem(`geocode_${cacheKey}`);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (e) {
    // localStorage might not be available
  }

  return null;
};

// Load cached coordinates on component mount
const loadCachedCoordinates = () => {
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('geocode_')) {
        const value = localStorage.getItem(key);
        if (value) {
          const coords = JSON.parse(value);
          geocodeCache.set(key.replace('geocode_', ''), coords);
        }
      }
    }
  } catch (e) {
    // localStorage might not be available
  }
};

// Custom marker component with status-based colors
const StatusMarker: React.FC<{
  position: [number, number];
  location: LocationData;
}> = ({ position, location }) => {
  // Get status color based on most common status
  const getStatusColor = (applications: JobApplication[]) => {
    const statusCounts = applications.reduce((acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
      return acc;
    }, {} as Record<ApplicationStatus, number>);

    const topStatus = Object.entries(statusCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] as ApplicationStatus;

    switch (topStatus) {
      case 'Offer': return '#10B981'; // green
      case 'Final Round':
      case 'Technical Round 1':
      case 'Technical Round 2': return '#F97316'; // orange
      case 'Phone Screen': return '#F59E0B'; // yellow
      case 'Replied': return '#8B5CF6'; // purple
      case 'Applied': return '#3B82F6'; // blue
      case 'Rejected': return '#EF4444'; // red
      case 'Ghosted': return '#6B7280'; // gray
      default: return '#6B7280';
    }
  };

  const color = getStatusColor(location.applications);

  // Create custom icon
  const customIcon = L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background-color: ${color};
        border: 3px solid white;
        border-radius: 50%;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 12px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        cursor: pointer;
        transition: transform 0.2s;
      "
      onmouseover="this.style.transform='scale(1.2)'"
      onmouseout="this.style.transform='scale(1)'"
      >
        ${location.count}
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });

  return (
    <Marker position={position} icon={customIcon}>
      <Popup>
        <div className="p-2 min-w-[200px]">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-4 h-4 text-indigo-600" />
            <h3 className="font-semibold text-gray-800">{location.name}</h3>
          </div>

          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Total applications:</span>
              <span className="font-medium">{location.count}</span>
            </div>

            {/* Status breakdown */}
            {Object.entries(
              location.applications.reduce((acc, app) => {
                acc[app.status] = (acc[app.status] || 0) + 1;
                return acc;
              }, {} as Record<ApplicationStatus, number>)
            ).map(([status, count]) => (
              <div key={status} className="flex justify-between text-xs">
                <span className="text-gray-500">{status}:</span>
                <span>{count}</span>
              </div>
            ))}
          </div>
        </div>
      </Popup>
    </Marker>
  );
};

const GermanyMap: React.FC<GermanyMapProps> = ({ applications }) => {
  const [locations, setLocations] = useState<LocationData[]>([]);
  const [loading, setLoading] = useState(true);

  // Load cached coordinates on mount
  useEffect(() => {
    loadCachedCoordinates();
  }, []);

  // Process applications and geocode locations
  useEffect(() => {
    const processLocations = async () => {
      setLoading(true);

      // Group applications by location
      const locationGroups = applications.reduce((acc, app) => {
        const location = app.location.trim();
        if (!acc[location]) {
          acc[location] = [];
        }
        acc[location].push(app);
        return acc;
      }, {} as Record<string, JobApplication[]>);

      // Geocode each location
      const locationPromises = Object.entries(locationGroups).map(async ([locationName, apps]) => {
        const coordinates = await geocodeLocation(locationName);

        if (coordinates) {
          return {
            name: locationName,
            coordinates,
            applications: apps,
            count: apps.length,
            geocoded: true
          } as LocationData;
        }

        return null;
      });

      const geocodedLocations = (await Promise.all(locationPromises)).filter(
        (location): location is LocationData => location !== null
      );

      setLocations(geocodedLocations);
      setLoading(false);
    };

    if (applications.length > 0) {
      processLocations();
    } else {
      setLocations([]);
      setLoading(false);
    }
  }, [applications]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalCities = locations.length;
    const totalApplications = locations.reduce((sum, loc) => sum + loc.count, 0);
    const citiesWithOffers = locations.filter(loc =>
      loc.applications.some(app => app.status === 'Offer')
    ).length;
    const mostActiveCity = locations.reduce((max, loc) =>
      loc.count > max.count ? loc : max,
      locations[0] || { name: 'N/A', count: 0 }
    );

    return {
      totalCities,
      totalApplications,
      citiesWithOffers,
      mostActiveCity: mostActiveCity?.name || 'N/A'
    };
  }, [locations]);

  // Germany center coordinates
  const germanyCenter: [number, number] = [51.1657, 10.4515];

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-md">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full p-3">
            <MapPin className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl font-bold text-gray-800">Germany Applications Map</h2>
        </div>

        <div className="h-96 flex items-center justify-center bg-gray-50 rounded-lg">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading map and geocoding locations...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-md">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full p-3">
          <MapPin className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-xl font-bold text-gray-800">Germany Applications Map</h2>
      </div>

      {/* Map Container */}
      <div className="h-96 rounded-lg overflow-hidden border border-gray-200">
        <MapContainer
          center={germanyCenter}
          zoom={6}
          style={{ height: '100%', width: '100%' }}
          className="z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {locations.map((location) => (
            <StatusMarker
              key={location.name}
              position={location.coordinates}
              location={location}
            />
          ))}
        </MapContainer>
      </div>

      {/* Legend */}
      <div className="mt-6">
        <h3 className="text-sm font-semibold text-gray-800 mb-3">Application Status Legend</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>Offer</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
            <span>Interview</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span>Phone Screen</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span>Applied</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full bg-purple-500"></div>
            <span>Replied</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span>Rejected</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full bg-gray-500"></div>
            <span>Ghosted</span>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-indigo-600">{stats.totalCities}</div>
            <div className="text-xs text-gray-600">Cities with Applications</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600">{stats.totalApplications}</div>
            <div className="text-xs text-gray-600">Total Applications</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">{stats.citiesWithOffers}</div>
            <div className="text-xs text-gray-600">Cities with Offers</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">{stats.mostActiveCity}</div>
            <div className="text-xs text-gray-600">Most Active City</div>
          </div>
        </div>
      </div>

      {/* Info about geocoding */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-blue-800">
            <p className="font-medium mb-1">Map Data:</p>
            <p>Locations are automatically geocoded using OpenStreetMap's free geocoding service. Results are cached locally for better performance.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GermanyMap;