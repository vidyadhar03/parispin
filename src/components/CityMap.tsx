'use client';
import { useEffect, useRef, useState } from 'react';
import maplibregl, { Map, Marker, Popup } from 'maplibre-gl';

// POI Categories
type POICategory = 'all' | 'landmarks' | 'food' | 'art' | 'history' | 'culture';

interface POI {
  id: string;
  name: string;
  category: POICategory;
  coordinates: [number, number]; // [lng, lat]
  description: string;
}

// Sample Paris POIs
const PARIS_POIS: POI[] = [
  {
    id: '1',
    name: 'Eiffel Tower',
    category: 'landmarks',
    coordinates: [2.2945, 48.8584],
    description: 'Iconic iron lattice tower and symbol of Paris'
  },
  {
    id: '2',
    name: 'Louvre Museum',
    category: 'art',
    coordinates: [2.3376, 48.8606],
    description: 'World\'s largest art museum and historic monument'
  },
  {
    id: '3',
    name: 'Notre-Dame Cathedral',
    category: 'history',
    coordinates: [2.3499, 48.8530],
    description: 'Medieval Catholic cathedral and Gothic architecture masterpiece'
  },
  {
    id: '4',
    name: 'Sacré-Cœur Basilica',
    category: 'culture',
    coordinates: [2.3431, 48.8867],
    description: 'Roman Catholic church and minor basilica in Montmartre'
  },
  {
    id: '5',
    name: 'Le Comptoir du Relais',
    category: 'food',
    coordinates: [2.3387, 48.8532],
    description: 'Traditional French bistro in Saint-Germain'
  },
  {
    id: '6',
    name: 'Arc de Triomphe',
    category: 'landmarks',
    coordinates: [2.2950, 48.8738],
    description: 'Monumental arch honoring fallen French soldiers'
  },
  {
    id: '7',
    name: 'Musée d\'Orsay',
    category: 'art',
    coordinates: [2.3266, 48.8600],
    description: 'Museum housing world\'s finest collection of Impressionist art'
  },
  {
    id: '8',
    name: 'L\'As du Fallafel',
    category: 'food',
    coordinates: [2.3590, 48.8575],
    description: 'Famous falafel restaurant in the Marais district'
  }
];

const CATEGORIES = [
  { id: 'all' as POICategory, label: 'All', icon: '🗺️' },
  { id: 'landmarks' as POICategory, label: 'Landmarks', icon: '🏛️' },
  { id: 'food' as POICategory, label: 'Food', icon: '🍽️' },
  { id: 'art' as POICategory, label: 'Art', icon: '🎨' },
  { id: 'history' as POICategory, label: 'History', icon: '⛪' },
  { id: 'culture' as POICategory, label: 'Culture', icon: '🎭' }
];

export default function CityMap() {
  const mapRef = useRef<Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<Marker[]>([]);
  const [mapError, setMapError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<POICategory>('all');

  // Create marker element with category styling
  const createMarkerElement = (poi: POI) => {
    const el = document.createElement('div');
    el.className = 'custom-marker';
    el.style.cssText = `
      width: 30px;
      height: 30px;
      border-radius: 50%;
      background-color: ${getCategoryColor(poi.category)};
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      transition: transform 0.2s ease;
    `;
    el.innerHTML = getCategoryIcon(poi.category);
    
    // Hover effect
    el.addEventListener('mouseenter', () => {
      el.style.transform = 'scale(1.2)';
    });
    el.addEventListener('mouseleave', () => {
      el.style.transform = 'scale(1)';
    });
    
    return el;
  };

  // Get category color
  const getCategoryColor = (category: POICategory): string => {
    const colors = {
      landmarks: '#FF6B6B',
      food: '#4ECDC4',
      art: '#45B7D1',
      history: '#96CEB4',
      culture: '#FECA57',
      all: '#6C5CE7'
    };
    return colors[category] || colors.all;
  };

  // Get category icon
  const getCategoryIcon = (category: POICategory): string => {
    const icons = {
      landmarks: '🏛️',
      food: '🍽️',
      art: '🎨',
      history: '⛪',
      culture: '🎭',
      all: '📍'
    };
    return icons[category] || icons.all;
  };

  // Add markers to map
  const addMarkers = () => {
    if (!mapRef.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Filter POIs based on selected category
    const filteredPOIs = selectedCategory === 'all' 
      ? PARIS_POIS 
      : PARIS_POIS.filter(poi => poi.category === selectedCategory);

    // Create new markers
    filteredPOIs.forEach(poi => {
      const el = createMarkerElement(poi);
      
      const marker = new maplibregl.Marker(el)
        .setLngLat(poi.coordinates)
        .addTo(mapRef.current!);

      // Add popup on click
      const popup = new maplibregl.Popup({ offset: 25 })
        .setHTML(`
          <div class="p-3">
            <h3 class="font-bold text-lg mb-1">${poi.name}</h3>
            <p class="text-sm text-gray-600 mb-2">${poi.description}</p>
            <span class="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
              ${poi.category}
            </span>
          </div>
        `);

      el.addEventListener('click', () => {
        popup.setLngLat(poi.coordinates).addTo(mapRef.current!);
      });

      markersRef.current.push(marker);
    });
  };

  // Effect to update markers when category changes
  useEffect(() => {
    if (mapRef.current && !isLoading) {
      addMarkers();
    }
  }, [selectedCategory, isLoading]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    try {
      mapRef.current = new maplibregl.Map({
        container: containerRef.current,
        style: {
          version: 8,
          sources: {
            'osm-tiles': {
              type: 'raster',
              tiles: [
                'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
              ],
              tileSize: 256,
              attribution: '© OpenStreetMap contributors'
            }
          },
          layers: [
            {
              id: 'osm-tiles-layer',
              type: 'raster',
              source: 'osm-tiles',
              minzoom: 0,
              maxzoom: 19
            }
          ]
        },
        center: [2.3522, 48.8566],      // Paris lon, lat
        zoom: 13,
        pitch: 0
      });

      mapRef.current.on('load', () => {
        setIsLoading(false);
        console.log('Map loaded successfully');
        addMarkers();
      });

      mapRef.current.on('error', (e) => {
        console.error('Map error:', e);
        setMapError('Failed to load map');
        setIsLoading(false);
      });

    } catch (error) {
      console.error('Map initialization error:', error);
      setMapError('Failed to initialize map');
      setIsLoading(false);
    }

    return () => {
      // Clean up markers
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];
      
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  if (mapError) {
    return (
              <div className="h-screen w-screen flex items-center justify-center bg-blue-50">
        <div className="text-center">
          <h2 className="text-xl font-bold text-red-600 mb-2">Map Error</h2>
          <p className="text-gray-700">{mapError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-screen">
      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 z-30">
        <div className="top-bar bg-blue-50/95 backdrop-blur-sm border-b border-blue-200 shadow-sm">
          <div className="flex items-center justify-between px-4 py-3">
            {/* Left side - Menu icon */}
            <button className="p-2 rounded-lg hover:bg-blue-100 transition-colors">
              <svg 
                className="w-6 h-6 text-gray-700" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M4 6h16M4 12h16M4 18h16" 
                />
              </svg>
            </button>

            {/* Center - Title */}
            <div className="flex-1 text-center">
              <h1 className="text-xl font-bold text-gray-900">Map View</h1>
              <p className="text-xs text-gray-500">Discover Paris</p>
            </div>

            {/* Right side - User/Settings */}
            <button className="p-2 rounded-lg hover:bg-blue-100 transition-colors">
              <svg 
                className="w-6 h-6 text-gray-700" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div 
        ref={containerRef} 
        className="absolute inset-0 w-full h-full pt-16"
        style={{ minHeight: '100vh', minWidth: '100vw' }}
      />
      
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-blue-50 bg-opacity-75 z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
            <p className="text-gray-700">Loading map...</p>
          </div>
        </div>
      )}

      {/* Filter Chips Bar */}
      <div className="absolute bottom-6 left-4 right-4 z-20">
        <div className="bg-blue-50/95 backdrop-blur-sm rounded-xl shadow-lg border border-blue-200 p-3">
          <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide">
            <span className="text-sm font-medium text-gray-700 whitespace-nowrap mr-2">
              Filter:
            </span>
            {CATEGORIES.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap
                  transition-all duration-200 ease-in-out transform hover:scale-105
                  ${selectedCategory === category.id 
                    ? 'bg-blue-500 text-white shadow-md' 
                    : 'bg-blue-100 text-gray-700 hover:bg-blue-200'
                  }
                `}
              >
                <span className="text-base">{category.icon}</span>
                <span>{category.label}</span>
                {selectedCategory === category.id && (
                  <span className="bg-white/20 text-xs px-1.5 py-0.5 rounded-full">
                    {selectedCategory === 'all' 
                      ? PARIS_POIS.length 
                      : PARIS_POIS.filter(poi => poi.category === category.id).length
                    }
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 