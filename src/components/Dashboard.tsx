import { useEffect, useRef, useState } from 'react';
import { 
  Bell, 
  User, 
  LogOut, 
  Settings, 
  MapPin, 
  Cpu, 
  Battery, 
  Signal, 
  Navigation, 
  RefreshCw, 
  ChevronDown, 
  X,
  Compass,
  Layers
} from 'lucide-react';
import { UserProfile, ActivePage, TrackingPoint, AppNotification } from '../types';

interface DashboardProps {
  currentUser: UserProfile;
  onNavigate: (page: ActivePage) => void;
  onLogout: () => void;
}

export default function Dashboard({ currentUser, onNavigate, onLogout }: DashboardProps) {
  // Map References
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);
  const parentMarkerRef = useRef<any>(null);
  const routeLineRef = useRef<any>(null);

  // States
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [mapViewType, setMapViewType] = useState<'satellite' | 'hybrid' | 'terrain'>('hybrid');

  // Base coordinates state for the Child/Tracker (defaults to Stanford area)
  const [baseLocation, setBaseLocation] = useState({ lat: 37.4320, lng: -122.1750 });

  // Parent's real or simulated GPS location
  const [parentLocation, setParentLocation] = useState<{ lat: number, lng: number }>({ 
    lat: 37.4420, 
    lng: -122.1620 
  });

  // Directions state
  const [showDirections, setShowDirections] = useState<boolean>(false);
  const [directionsSteps, setDirectionsSteps] = useState<string[]>([]);

  // 100% Live Tracking point synchronized to "hardware" updates
  const [trackingPoint, setTrackingPoint] = useState<TrackingPoint>({
    lat: 37.4320,
    lng: -122.1750,
    speed: 0,
    battery: 98,
    signal: 'Excellent',
    lastUpdated: 'Just now',
    locationName: 'Safe Beacon Bounds'
  });

  // App Notifications Stack (Top-Right Popups)
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [toasts, setToasts] = useState<AppNotification[]>([]);

  // Helper to push a notification
  const addNotification = (title: string, message: string, type: 'info' | 'warning' | 'success') => {
    const newNotif: AppNotification = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      type
    };
    
    // Add to persistent notifications list
    setNotifications(prev => [newNotif, ...prev]);
    
    // Add to visible popups (toasts) in top-right
    setToasts(prev => [newNotif, ...prev]);

    // Auto dismiss toasts after 5 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== newNotif.id));
    }, 5000);
  };

  // 1. Enter Dashboard Notification popups automatic sequence
  useEffect(() => {
    const timer1 = setTimeout(() => {
      addNotification(
        "Hardware Connected", 
        `Satellite link bound successfully for Chip ID: ${currentUser.chipId}.`, 
        "success"
      );
    }, 400);

    const timer2 = setTimeout(() => {
      addNotification(
        "Tracker Signal Strong", 
        "GPS connection locked with active high-precision satellites.", 
        "info"
      );
    }, 1800);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [currentUser.chipId]);

  // Initialize Map
  useEffect(() => {
    const L = (window as any).L;
    if (!L) return;

    // Check if map already exists, reset it
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    // Create Map (centered at Stanford University area)
    const map = L.map('leaflet-map-canvas', {
      zoomControl: false, // Position customly on bottomleft
      attributionControl: false // Minimalist look, no clutter
    }).setView([trackingPoint.lat, trackingPoint.lng], 15);

    mapRef.current = map;

    // Add appropriate layer based on current mapViewType (satellite, hybrid, or terrain)
    const layerUrl = mapViewType === 'hybrid'
      ? 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}'
      : mapViewType === 'terrain'
      ? 'https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}'
      : 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';

    const tileLayer = L.tileLayer(layerUrl, {
      maxZoom: 19
    }).addTo(map);
    tileLayerRef.current = tileLayer;

    // Zoom control in bottom-left to prevent overlap with switcher
    L.control.zoom({
      position: 'bottomleft'
    }).addTo(map);

    // Custom Blue Tracker Icon representing the student
    const studentIcon = L.divIcon({
      className: 'custom-student-marker',
      html: `
        <div class="relative flex items-center justify-center">
          <div class="absolute w-10 h-10 bg-blue-500/30 rounded-full animate-ping"></div>
          <div class="relative w-7 h-7 bg-white rounded-full border-2 border-blue-600 flex items-center justify-center shadow-md">
            <div class="w-3 h-3 bg-blue-600 rounded-full"></div>
          </div>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20]
    });

    // Create marker
    const marker = L.marker([trackingPoint.lat, trackingPoint.lng], { icon: studentIcon }).addTo(map);
    marker.bindPopup(`
      <div class="text-blue-900 font-sans p-1">
        <h4 class="font-bold text-sm">Target: ${currentUser.studentName}</h4>
        <p class="text-xs text-blue-600 mt-1">Chip ID: ${currentUser.chipId}</p>
        <p class="text-xs font-semibold mt-1">Status: Active Track</p>
      </div>
    `);
    markerRef.current = marker;

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update marker position dynamically whenever coordinates update
  useEffect(() => {
    if (markerRef.current && mapRef.current) {
      const L = (window as any).L;
      if (!L) return;

      const newLatLng = new L.LatLng(trackingPoint.lat, trackingPoint.lng);
      markerRef.current.setLatLng(newLatLng);
      
      // Only pan directly to child if not showing directions (directions fit bounds of both)
      if (!showDirections) {
        mapRef.current.panTo(newLatLng);
      }
    }
  }, [trackingPoint.lat, trackingPoint.lng, showDirections]);

  // Synchronize map with user's exact current physical location
  const syncWithUserLocation = (automatic = false) => {
    if (!navigator.geolocation) {
      if (!automatic) {
        addNotification(
          "GPS Unavailable", 
          "Your browser does not support Geolocation services.", 
          "warning"
        );
      }
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setParentLocation({ lat: latitude, lng: longitude });
        addNotification(
          "GPS Synchronized", 
          `Locked your current coordinates: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}.`, 
          "success"
        );
      },
      (error) => {
        console.log("Geolocation lookup status:", error.message || error);
        if (!automatic) {
          addNotification(
            "GPS Authorization Required", 
            "Please allow location permissions in your browser to position your coordinates.", 
            "warning"
          );
        }
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Auto sync parent location on dashboard load
  useEffect(() => {
    syncWithUserLocation(true);
  }, []);

  // Update map and tracker marker live when baseLocation changes
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.setView([baseLocation.lat, baseLocation.lng], 15);
    }
    if (markerRef.current) {
      markerRef.current.setLatLng([baseLocation.lat, baseLocation.lng]);
    }
    setTrackingPoint(prev => ({
      ...prev,
      lat: baseLocation.lat,
      lng: baseLocation.lng,
      lastUpdated: 'Just now',
      locationName: 'Active GPS Coordinates'
    }));
  }, [baseLocation.lat, baseLocation.lng]);

  // Switch map tile layer dynamically when user toggles view modes
  useEffect(() => {
    const L = (window as any).L;
    if (mapRef.current && L) {
      if (tileLayerRef.current) {
        mapRef.current.removeLayer(tileLayerRef.current);
      }
      
      const layerUrl = mapViewType === 'hybrid'
        ? 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}'
        : mapViewType === 'terrain'
        ? 'https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}'
        : 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';

      const newTileLayer = L.tileLayer(layerUrl, {
        maxZoom: 19
      }).addTo(mapRef.current);
      tileLayerRef.current = newTileLayer;
    }
  }, [mapViewType]);

  // Active Routing Paths Effect
  useEffect(() => {
    const L = (window as any).L;
    if (!L || !mapRef.current) return;

    // Clean up previous route lines and markers
    if (routeLineRef.current) {
      mapRef.current.removeLayer(routeLineRef.current);
      routeLineRef.current = null;
    }
    if (parentMarkerRef.current) {
      mapRef.current.removeLayer(parentMarkerRef.current);
      parentMarkerRef.current = null;
    }

    if (showDirections && parentLocation) {
      // 1. Create Parent/User Marker on the map
      const parentIcon = L.divIcon({
        className: 'custom-parent-marker',
        html: `
          <div class="relative flex items-center justify-center">
            <div class="absolute w-10 h-10 bg-emerald-500/30 rounded-full animate-pulse"></div>
            <div class="relative w-7 h-7 bg-white rounded-full border-2 border-emerald-600 flex items-center justify-center shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-user"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20]
      });

      const parentMarker = L.marker([parentLocation.lat, parentLocation.lng], { icon: parentIcon }).addTo(mapRef.current);
      parentMarker.bindPopup(`
        <div class="text-emerald-900 font-sans p-1">
          <h4 class="font-bold text-sm">Parent Location</h4>
          <p class="text-xs text-emerald-600 mt-1">Your synchronized coordinates</p>
        </div>
      `);
      parentMarkerRef.current = parentMarker;

      // 2. Generate intermediate points to create a realistic street-following route path
      const pLat = parentLocation.lat;
      const pLng = parentLocation.lng;
      const cLat = trackingPoint.lat;
      const cLng = trackingPoint.lng;

      const midLat = (pLat + cLat) / 2;
      const midLng = (pLng + cLng) / 2;

      const routePoints = [
        [pLat, pLng],
        [midLat + 0.0008, pLng - 0.0004], // realistic corner 1
        [cLat - 0.0006, midLng + 0.0005], // realistic corner 2
        [cLat, cLng]
      ];

      const routeLine = L.polyline(routePoints, {
        color: '#2563eb', // elegant royal blue
        weight: 4,
        opacity: 0.85,
        dashArray: '6, 8', // technical dashed look
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(mapRef.current);
      routeLineRef.current = routeLine;

      // 3. Zoom/pan the map to perfectly bound both markers
      const bounds = L.latLngBounds([
        [pLat, pLng],
        [cLat, cLng]
      ]);
      mapRef.current.fitBounds(bounds, { padding: [60, 60] });

      // 4. Generate beautiful navigation statistics and turn instructions
      const distanceDegrees = Math.sqrt(Math.pow(pLat - cLat, 2) + Math.pow(pLng - cLng, 2));
      const distanceMiles = (distanceDegrees * 69).toFixed(1);
      const estMinutes = Math.max(1, Math.round(parseFloat(distanceMiles) * 2.5));

      setDirectionsSteps([
        `Start navigation from your synchronized location (${pLat.toFixed(4)}, ${pLng.toFixed(4)})`,
        `Head onto the nearest arterial roadway for ${parseFloat(distanceMiles) > 0.4 ? '0.3 mi' : '0.1 mi'}`,
        `Follow active Beacon signals towards safe zone intersection`,
        `Arrive at child's live location: ${currentUser.studentName}'s device transmitter bounds (${cLat.toFixed(4)}, ${cLng.toISOString ? '' : cLng.toFixed(4)})`,
        `Total Distance: ${distanceMiles} miles (approx. ${estMinutes} min driving time)`
      ]);
    } else {
      // Reset if disabled
      if (routeLineRef.current) {
        mapRef.current.removeLayer(routeLineRef.current);
        routeLineRef.current = null;
      }
      if (parentMarkerRef.current) {
        mapRef.current.removeLayer(parentMarkerRef.current);
        parentMarkerRef.current = null;
      }
    }
  }, [showDirections, parentLocation, trackingPoint.lat, trackingPoint.lng]);

  // Handle manual location adjustments
  const adjustLocation = (direction: 'N' | 'S' | 'E' | 'W') => {
    const step = 0.0006; // nudge offset
    let newLat = trackingPoint.lat;
    let newLng = trackingPoint.lng;

    switch (direction) {
      case 'N': newLat += step; break;
      case 'S': newLat -= step; break;
      case 'E': newLng += step; break;
      case 'W': newLng -= step; break;
    }

    setTrackingPoint(prev => ({
      ...prev,
      lat: Number(newLat.toFixed(5)),
      lng: Number(newLng.toFixed(5)),
      speed: 12,
      lastUpdated: 'Just now',
      locationName: 'Telemetry Update'
    }));

    addNotification(
      "Coordinates Adjusted", 
      `Latitude: ${newLat.toFixed(5)}, Longitude: ${newLng.toFixed(5)}`, 
      "info"
    );
  };

  const clearNotifications = () => {
    setNotifications([]);
    addNotification("History Cleared", "Cleared alert logs.", "success");
  };

  return (
    <div className="h-screen bg-white text-blue-900 flex flex-col overflow-hidden relative">
      
      {/* 1. TOP BAR */}
      <header className="h-16 border-b border-blue-100 bg-white px-8 flex items-center justify-between z-20 flex-shrink-0">
        
        {/* Left branding */}
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-700 rounded-lg flex items-center justify-center">
              <Compass className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-blue-800">
              Beacon <span className="text-blue-400 font-light underline decoration-1 text-sm align-top ml-1">PRO</span>
            </span>
          </div>
          
          <nav className="hidden lg:flex space-x-6 text-sm font-medium">
            <span className="text-blue-700 border-b-2 border-blue-700 pb-1 cursor-default">Dashboard</span>
            <span className="text-blue-400 hover:text-blue-600 cursor-pointer transition" onClick={() => onNavigate('settings')}>Settings</span>
          </nav>
        </div>

        {/* Center active session badge */}
        <div className="hidden md:flex items-center space-x-6">
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-blue-400 uppercase tracking-widest font-bold">Active Device</span>
            <span className="text-sm font-mono font-bold text-blue-800">CHIP-ID: #{currentUser.chipId}</span>
          </div>
          <div className="w-px h-8 bg-blue-100"></div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-4">
          
          {/* NOTIFICATION BELL */}
          <div className="relative">
            <button
              onClick={() => {
                setNotificationsOpen(!notificationsOpen);
                setProfileDropdownOpen(false);
              }}
              className="p-2 text-blue-700 hover:bg-blue-50 rounded-lg transition relative"
              aria-label="Toggle alerts log"
            >
              <Bell className="w-5 h-5" />
              {notifications.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-600 text-[9px] font-bold text-white rounded-full flex items-center justify-center animate-bounce">
                  {notifications.length}
                </span>
              )}
            </button>

            {/* Notifications Dropdown Panel */}
            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-blue-100 rounded-xl shadow-xl z-30 flex flex-col max-h-96 overflow-hidden">
                <div className="bg-blue-900 px-4 py-3 flex items-center justify-between text-white">
                  <span className="text-xs font-bold uppercase tracking-wider">Device Alert & Activity Logs</span>
                  <button 
                    onClick={clearNotifications}
                    className="text-[10px] hover:underline opacity-80"
                  >
                    Clear All
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto divide-y divide-blue-50">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-xs text-blue-400 font-semibold">
                      No active alerts recorded.
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div key={notif.id} className="p-3 text-xs flex items-start space-x-2.5 hover:bg-blue-50/30 transition">
                        <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                          notif.type === 'warning' ? 'bg-red-500' : notif.type === 'success' ? 'bg-green-500' : 'bg-blue-500'
                        }`} />
                        <div className="space-y-1">
                          <div className="font-bold text-blue-900 flex justify-between items-center">
                            <span>{notif.title}</span>
                            <span className="text-[9px] text-blue-400 font-normal">{notif.timestamp}</span>
                          </div>
                          <p className="text-blue-600 leading-normal font-medium">{notif.message}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* PROFILE DROPDOWN */}
          <div className="relative">
            <button
              onClick={() => {
                setProfileDropdownOpen(!profileDropdownOpen);
                setNotificationsOpen(false);
              }}
              className="flex items-center space-x-1.5 p-1 px-2 hover:bg-blue-50 rounded-lg transition"
            >
              <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs uppercase border border-blue-200">
                {currentUser.studentName.charAt(0)}
              </div>
              <ChevronDown className="w-4 h-4 text-blue-600" />
            </button>

            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white border border-blue-100 rounded-xl shadow-xl z-30 py-2">
                <div className="px-4 py-2 border-b border-blue-50 mb-1">
                  <p className="text-xs text-blue-500 font-bold">Parent Account</p>
                  <p className="text-sm font-bold text-blue-900 truncate">{currentUser.email}</p>
                </div>
                
                <button
                  onClick={() => onNavigate('settings')}
                  className="w-full text-left px-4 py-2 text-xs text-blue-800 hover:bg-blue-50 font-semibold flex items-center space-x-2"
                >
                  <Settings className="w-4 h-4 text-blue-600" />
                  <span>Profile Settings</span>
                </button>

                <button
                  onClick={onLogout}
                  className="w-full text-left px-4 py-2 text-xs text-red-700 hover:bg-red-50 font-bold flex items-center space-x-2 border-t border-blue-50 mt-1"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>

        </div>
      </header>

      {/* 2. BODY CONTENT - SATELLITE MAP CONTAINER */}
      <div className="flex-1 relative overflow-hidden">
        
        {/* Leaflet map container */}
        <div id="leaflet-map-canvas" className="w-full h-full z-0" />

        {/* 2.5 FLOATING MAP LAYER SWITCHER CONTROL (Shifted to Bottom Right) */}
        <div className="absolute bottom-6 right-6 z-10 bg-white/95 backdrop-blur-md rounded-xl border border-blue-100 shadow-xl p-2 flex items-center space-x-1.5 pointer-events-auto">
          <div className="p-1.5 bg-blue-50 text-blue-700 rounded-lg flex items-center justify-center">
            <Layers className="w-4 h-4" />
          </div>
          <div className="flex bg-blue-50/50 p-0.5 rounded-lg border border-blue-100">
            <button
              onClick={() => setMapViewType('satellite')}
              className={`px-3 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider transition ${
                mapViewType === 'satellite'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-blue-700 hover:bg-blue-100/60'
              }`}
            >
              Satellite
            </button>
            <button
              onClick={() => setMapViewType('hybrid')}
              className={`px-3 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider transition ${
                mapViewType === 'hybrid'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-blue-700 hover:bg-blue-100/60'
              }`}
            >
              Hybrid
            </button>
            <button
              onClick={() => setMapViewType('terrain')}
              className={`px-3 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider transition ${
                mapViewType === 'terrain'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-blue-700 hover:bg-blue-100/60'
              }`}
            >
              Terrain
            </button>
          </div>
        </div>

        {/* 2.6 FLOATING DIRECTIONS PANEL */}
        {showDirections && parentLocation && (
          <div className="absolute top-6 left-6 z-10 max-w-xs w-full bg-white/95 backdrop-blur-md rounded-xl border border-blue-100 shadow-xl p-4 space-y-3 animate-fade-in pointer-events-auto">
            <div className="flex items-center justify-between border-b border-blue-50 pb-2">
              <div className="flex items-center space-x-2">
                <Navigation className="w-4 h-4 text-blue-600 animate-pulse" />
                <div>
                  <h3 className="text-xs font-bold text-blue-950">Directions to {currentUser.studentName}</h3>
                  <p className="text-[9px] text-blue-500 font-bold">LIVE ROUTING ROUTE</p>
                </div>
              </div>
              <button 
                onClick={() => setShowDirections(false)}
                className="p-1 hover:bg-blue-50 rounded-lg text-blue-400 hover:text-blue-600 transition"
                aria-label="Close directions"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Steps list */}
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {directionsSteps.map((step, idx) => (
                <div key={idx} className="flex items-start space-x-2 text-[11px] font-medium text-blue-800">
                  <span className="w-4 h-4 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-[9px] font-black text-blue-600 flex-shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <p className="leading-relaxed flex-1">{step}</p>
                </div>
              ))}
            </div>

            {/* Open Google Maps Button */}
            <div className="pt-2 border-t border-blue-50 flex space-y-2">
              <a
                href={`https://www.google.com/maps/dir/?api=1&origin=${parentLocation.lat},${parentLocation.lng}&destination=${trackingPoint.lat},${trackingPoint.lng}&travelmode=driving`}
                target="_blank"
                rel="referrer noopener"
                className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-bold flex items-center justify-center space-x-1 transition shadow-sm"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Open Google Maps</span>
              </a>
              <button
                onClick={() => {
                  // Simulate parent moving closer to child
                  setParentLocation({
                    lat: parentLocation.lat + (trackingPoint.lat - parentLocation.lat) * 0.4,
                    lng: parentLocation.lng + (trackingPoint.lng - parentLocation.lng) * 0.4
                  });
                  addNotification("Driving Simulated", "You are navigating closer to the beacon.", "success");
                }}
                className="px-2.5 py-1.5 border border-blue-200 hover:bg-blue-50 rounded-lg text-[10px] font-bold text-blue-700 transition"
                title="Simulate Driving closer"
              >
                Drive Closer
              </button>
            </div>
          </div>
        )}

        {/* 3. COMPACT LOCATION & HARDWARE CONTROLLER PANEL */}
        <div className="absolute bottom-6 left-6 z-10 max-w-xs w-full bg-white/95 backdrop-blur-md rounded-xl border border-blue-100 shadow-xl p-4 space-y-3.5">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-blue-50 pb-2">
            <div className="flex items-center space-x-2">
              <Cpu className="w-4 h-4 text-blue-600" />
              <div>
                <h3 className="text-xs font-bold text-blue-950">GPS Hardware Link</h3>
                <p className="text-[9px] text-blue-500 font-bold font-mono uppercase">Node: {currentUser.chipId}</p>
              </div>
            </div>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-green-50 text-green-700 uppercase tracking-wider animate-pulse">
              Live Stream
            </span>
          </div>

          {/* Coordinates display */}
          <div className="grid grid-cols-2 gap-2 bg-blue-50/50 p-2.5 rounded-lg border border-blue-100/60">
            <div className="space-y-0.5">
              <span className="text-[9px] font-bold text-blue-500 uppercase tracking-wider">Latitude</span>
              <p className="text-xs font-bold text-blue-900 font-mono">{trackingPoint.lat.toFixed(5)}</p>
            </div>
            <div className="space-y-0.5">
              <span className="text-[9px] font-bold text-blue-500 uppercase tracking-wider">Longitude</span>
              <p className="text-xs font-bold text-blue-900 font-mono">{trackingPoint.lng.toFixed(5)}</p>
            </div>
          </div>

          {/* Specs */}
          <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-bold">
            <div className="p-1.5 border border-blue-50 rounded bg-white flex flex-col items-center">
              <Battery className="w-3.5 h-3.5 text-blue-600 mb-1" />
              <span className="text-blue-900">{trackingPoint.battery}%</span>
              <span className="text-[8px] text-blue-400 uppercase font-semibold">Battery</span>
            </div>
            <div className="p-1.5 border border-blue-50 rounded bg-white flex flex-col items-center">
              <Navigation className="w-3.5 h-3.5 text-blue-600 mb-1" />
              <span className="text-blue-900">{trackingPoint.speed} km/h</span>
              <span className="text-[8px] text-blue-400 uppercase font-semibold">Speed</span>
            </div>
            <div className="p-1.5 border border-blue-50 rounded bg-white flex flex-col items-center">
              <Signal className="w-3.5 h-3.5 text-blue-600 mb-1" />
              <span className="text-blue-900">{trackingPoint.signal}</span>
              <span className="text-[8px] text-blue-400 uppercase font-semibold">Lock</span>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2 pt-1 border-t border-blue-50">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => syncWithUserLocation(false)}
                className="py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 transition shadow-sm"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Sync My Loc</span>
              </button>

              <button
                onClick={() => {
                  setShowDirections(!showDirections);
                  addNotification(
                    showDirections ? "Routing Disabled" : "Routing Enabled",
                    showDirections ? "Cleared routing coordinates." : "Visual directions active from your location.",
                    "success"
                  );
                }}
                className={`py-2 rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 transition shadow-sm border ${
                  showDirections 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600' 
                    : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>{showDirections ? 'Hide Route' : 'Get Directions'}</span>
              </button>
            </div>

            {/* Manual coordinate nudges */}
            <div className="space-y-1.5 pt-1.5">
              <p className="text-[8px] font-black text-blue-400 uppercase tracking-widest text-center">Nudge Beacon Coordinates</p>
              <div className="grid grid-cols-4 gap-1">
                <button
                  onClick={() => adjustLocation('N')}
                  className="py-1 border border-blue-100 hover:bg-blue-50 rounded text-[9px] font-bold text-blue-700 transition"
                  title="Nudge North"
                >
                  North ▲
                </button>
                <button
                  onClick={() => adjustLocation('S')}
                  className="py-1 border border-blue-100 hover:bg-blue-50 rounded text-[9px] font-bold text-blue-700 transition"
                  title="Nudge South"
                >
                  South ▼
                </button>
                <button
                  onClick={() => adjustLocation('E')}
                  className="py-1 border border-blue-100 hover:bg-blue-50 rounded text-[9px] font-bold text-blue-700 transition"
                  title="Nudge East"
                >
                  East ▶
                </button>
                <button
                  onClick={() => adjustLocation('W')}
                  className="py-1 border border-blue-100 hover:bg-blue-50 rounded text-[9px] font-bold text-blue-700 transition"
                  title="Nudge West"
                >
                  West ◀
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* 4. FOOTER STAT BAR */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm border border-blue-100 rounded-full px-6 py-2 shadow-lg flex items-center space-x-8 z-10 whitespace-nowrap">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400">Engine: Live GPS Stream</span>
          </div>
          <div className="h-4 w-px bg-blue-200"></div>
          <div className="flex items-center space-x-2 text-xs text-blue-900">
            <span className="font-bold">Target:</span>
            <span className="text-blue-600 font-semibold">{currentUser.studentName} ({trackingPoint.locationName})</span>
          </div>
        </div>

        {/* 5. TOP RIGHT TOAST STACK */}
        <div className="absolute top-6 right-6 z-40 max-w-xs w-full flex flex-col space-y-2 pointer-events-none">
          {toasts.map((toast) => (
            <div 
              key={toast.id} 
              className="bg-white border-l-4 border-blue-600 shadow-2xl rounded-lg p-4 flex space-x-4 pointer-events-auto items-start animate-fade-in border border-blue-50"
            >
              <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <Bell className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1 space-y-0.5">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold text-blue-950">{toast.title}</h4>
                  <button 
                    onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
                    className="text-blue-400 hover:text-blue-600 p-0.5"
                    aria-label="Dismiss toast"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
                <p className="text-[10px] text-blue-700 leading-normal font-semibold">{toast.message}</p>
              </div>
            </div>
          ))}
        </div>

      </div>

    </div>
  );
}
