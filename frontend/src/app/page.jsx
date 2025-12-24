"use client";

import { useState, useRef, useEffect } from "react";
import Head from "next/head";

export default function Home() {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [satelliteZoom, setSatelliteZoom] = useState(10);
  const [hasGuessed, setHasGuessed] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [didDrag, setDidDrag] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [guessMarker, setGuessMarker] = useState(null);
  const [guessLatLong, setGuessLatLong] = useState(null);
  const [locationData, setLocationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef(null);
  const imageRef = useRef(null);
  const pinTimeoutRef = useRef(null);
  const hoverTimeoutRef = useRef(null);

  const IMAGE_WIDTH = 300;
  const IMAGE_HEIGHT = 225;
  const MAP_OFFSET_X = 8;
  const MAP_OFFSET_Y = 5;
  const MAP_WIDTH = 590;
  const MAP_HEIGHT = 417;

  const dailyId = new Date().toISOString().split('T')[0];

  // Fetch today's location data
  useEffect(() => {
    const fetchLocationData = async () => {
      try {
        const response = await fetch('http://localhost:3001/data/daily');
        if (!response.ok) {
          throw new Error('Failed to fetch location data');
        }
        const data = await response.json();
        setLocationData(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching location data:', error);
        setLoading(false);
      }
    };

    fetchLocationData();
  }, []);

  const formatZoom = (zoom) => {
    return zoom % 1 === 0 ? zoom.toString() : zoom.toFixed(1);
  };

  const MERCATOR_COEFFICIENT = 0;
  const LATITUDE_SCALE = 1.0;

  const pixelToLatLong = (x, y) => {
    const mapX = x - MAP_OFFSET_X;
    const mapY = y - MAP_OFFSET_Y;
    
    const lon = (mapX / MAP_WIDTH) * 360 - 180;

    let yNorm = mapY / MAP_HEIGHT;

    yNorm = 0.71 * yNorm + 0.01;

    const mercN = Math.PI * (1 - 2 * yNorm);
    let lat = (180 / Math.PI) * Math.atan(Math.sinh(mercN));

    return { lat, lon };
  };

  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 3959; // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return distance;
  };

  const handleSatelliteZoomOut = () => {
    if (satelliteZoom > 7) {
      setSatelliteZoom(prev => Math.max(7, prev - 1));
    }
  };

  const handleZoomIn = () => {
    const container = containerRef.current;
    if (!container) return;

    const newZoom = Math.min(zoom + 1, 15);
    const rect = container.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const zoomRatio = newZoom / zoom;
    const newX = centerX - (centerX - position.x) * zoomRatio;
    const newY = centerY - (centerY - position.y) * zoomRatio;

    setZoom(newZoom);
    setPosition({ x: newX, y: newY });
  };

  const handleZoomOut = () => {
    const container = containerRef.current;
    if (!container) return;

    const newZoom = Math.max(zoom - 1, 1);
    const rect = container.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const zoomRatio = newZoom / zoom;
    const newX = centerX - (centerX - position.x) * zoomRatio;
    const newY = centerY - (centerY - position.y) * zoomRatio;

    setZoom(newZoom);
    setPosition({ x: newX, y: newY });
  };

  const handleRecenter = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleWheel = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (zoom <= 1 && e.deltaY > 0) {
      return;
    }
    
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const delta = e.deltaY > 0 ? -0.3 : 0.3;
    const newZoom = Math.max(1, Math.min(15, zoom + delta));

    if (newZoom === zoom) return;

    const zoomRatio = newZoom / zoom;
    
    const newX = mouseX - (mouseX - position.x) * zoomRatio;
    const newY = mouseY - (mouseY - position.y) * zoomRatio;

    setZoom(newZoom);
    setPosition({ x: newX, y: newY });
  };

  const handleMapClick = (e) => {
    if (didDrag) return;
    
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const imageX = (clickX - position.x) / zoom;
    const imageY = (clickY - position.y) / zoom;

    setGuessMarker({ x: imageX, y: imageY });
  };

  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    setDidDrag(false);
    setDragStart({ 
      x: e.clientX - position.x, 
      y: e.clientY - position.y 
    });
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      e.preventDefault();
      setDidDrag(true);
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setIsHovered(true);
    if (pinTimeoutRef.current) {
      clearTimeout(pinTimeoutRef.current);
    }
    pinTimeoutRef.current = setTimeout(() => {
      setShowPin(true);
    }, 300);
  };

  const handleMouseLeave = () => {
    setShowPin(false);
    if (pinTimeoutRef.current) {
      clearTimeout(pinTimeoutRef.current);
    }
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(false);
      handleMouseUp();
    }, 500);
  };

  const handleGuessSubmit = () => {
    if (guessMarker && locationData) {
      const guessedLatLong = pixelToLatLong(guessMarker.x, guessMarker.y);
      setGuessLatLong(guessedLatLong);
      setHasGuessed(true);
      setSatelliteZoom(3);
      
      // Calculate distance between guess and actual location
      const distance = calculateDistance(
        guessedLatLong.lat,
        guessedLatLong.lon,
        locationData.latitude,
        locationData.longitude
      );
      
      const isCorrect = distance <= 100;
      
      console.log("Guess submitted:", guessedLatLong);
      console.log("Actual location:", { lat: locationData.latitude, lon: locationData.longitude });
      console.log("Distance:", distance.toFixed(2), "miles");
      
      alert(
        `Your guess: ${guessedLatLong.lat.toFixed(4)}°, ${guessedLatLong.lon.toFixed(4)}°\n` +
        `Actual location: ${locationData.latitude.toFixed(4)}°, ${locationData.longitude.toFixed(4)}°\n` +
        `Distance: ${distance.toFixed(2)} miles\n\n` +
        `${isCorrect ? "✓ YES! You were within 100 miles!" : "✗ NO. You were not within 100 miles."}`
      );
    } else {
      alert("Please place a marker on the map first!");
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      const panAmount = 50;
      
      switch(e.key) {
        case 'ArrowUp':
          e.preventDefault();
          setPosition(prev => ({ ...prev, y: prev.y + panAmount }));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setPosition(prev => ({ ...prev, y: prev.y - panAmount }));
          break;
        case 'ArrowLeft':
          e.preventDefault();
          setPosition(prev => ({ ...prev, x: prev.x + panAmount }));
          break;
        case 'ArrowRight':
          e.preventDefault();
          setPosition(prev => ({ ...prev, x: prev.x - panAmount }));
          break;
        case '+':
        case '=':
          e.preventDefault();
          handleZoomIn();
          break;
        case '-':
        case '_':
          e.preventDefault();
          handleZoomOut();
          break;
      }
    };

    const preventPinchZoom = (e) => {
      if (e.touches && e.touches.length > 1) {
        e.preventDefault();
      }
    };

    const preventGesture = (e) => {
      e.preventDefault();
    };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('touchmove', preventPinchZoom, { passive: false });
    document.addEventListener('gesturestart', preventGesture);
    document.addEventListener('gesturechange', preventGesture);
    document.addEventListener('gestureend', preventGesture);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('touchmove', preventPinchZoom);
      document.removeEventListener('gesturestart', preventGesture);
      document.removeEventListener('gesturechange', preventGesture);
      document.removeEventListener('gestureend', preventGesture);
      if (pinTimeoutRef.current) {
        clearTimeout(pinTimeoutRef.current);
      }
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, [zoom]);

  // Construct satellite image URL from location data
  const satelliteImageUrl = locationData 
    ? `https://jddbikgujwntbkabchjw.supabase.co/storage/v1/object/public/map-images/${locationData.storage_path}/zoom_${formatZoom(satelliteZoom)}.png?date=${dailyId}`
    : '';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-black">
        <p className="text-white text-xl">Loading...</p>
      </div>
    );
  }

  if (!locationData) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-black">
        <p className="text-white text-xl">Error loading location data</p>
      </div>
    );
  }

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <style>{`
          html, body {
            touch-action: pan-x pan-y;
            overscroll-behavior: none;
            -ms-touch-action: pan-x pan-y;
          }
        `}</style>
      </Head>
      
      <div className="relative h-screen w-full overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={satelliteImageUrl}
            alt="Satellite View"
            className="h-full w-full object-cover"
          />
        </div>

        <p className="absolute bottom-4 left-4 text-xs text-white/70 z-10">
          © Mapbox © OpenStreetMap contributors © Maxar
        </p>

        {!hasGuessed && (
          <div className="absolute top-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
            <div className="px-4 py-2 bg-black/70 text-white rounded-lg">
              Current Zoom: {formatZoom(satelliteZoom)}
            </div>
            <button 
              onClick={handleSatelliteZoomOut}
              disabled={satelliteZoom <= 7}
              className={`px-6 py-3 font-bold text-lg rounded-lg shadow-lg transition-colors ${
                satelliteZoom <= 7 
                  ? 'bg-gray-600 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              Zoom Out (Lower Score)
            </button>
          </div>
        )}

        {!isMinimized && (
          <div 
            className={`
              absolute bottom-6 right-6 
              transition-opacity duration-300 ease-in-out
              ${isHovered ? 'opacity-100' : 'opacity-40'}
            `}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <div className="relative bg-black rounded-xl shadow-2xl overflow-hidden">
              <button
                onClick={() => setIsMinimized(true)}
                className="absolute top-2 right-2 z-10 h-8 w-8 bg-zinc-800 hover:bg-zinc-700 rounded-full flex items-center justify-center text-white text-base font-bold"
              >
                ×
              </button>

              <div className="absolute top-2 left-2 z-10 flex gap-1">
                <button
                  onClick={handleRecenter}
                  className="h-6 px-2 bg-zinc-800 hover:bg-zinc-700 rounded flex items-center justify-center text-white text-xs font-semibold"
                >
                  Recenter
                </button>
                <button
                  onClick={handleZoomIn}
                  className="h-6 w-6 bg-zinc-800 hover:bg-zinc-700 rounded flex items-center justify-center text-white text-sm font-bold"
                >
                  +
                </button>
                <button
                  onClick={handleZoomOut}
                  className="h-6 w-6 bg-zinc-800 hover:bg-zinc-700 rounded flex items-center justify-center text-white text-sm font-bold"
                >
                  −
                </button>
              </div>
              
              <div 
                ref={containerRef}
                className={`
                  overflow-hidden relative
                  ${isHovered ? 'w-[640px] h-[432px]' : 'w-[176px] h-[128px]'}
                  transition-all duration-300
                  cursor-crosshair
                `}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onWheel={handleWheel}
                onClick={handleMapClick}
              >
                <img 
                  ref={imageRef}
                  src="/pixelmap.png" 
                  alt="World Map"
                  style={{ 
                    imageRendering: 'pixelated',
                    WebkitFontSmoothing: 'none',
                    transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
                    transformOrigin: '0 0',
                    willChange: 'transform'
                  }}
                  className="w-full h-full object-cover select-none pointer-events-none"
                  draggable={false}
                />

                {guessMarker && showPin && (
                  <div
                    className="absolute pointer-events-none"
                    style={{
                      left: `${guessMarker.x * zoom + position.x}px`,
                      top: `${guessMarker.y * zoom + position.y}px`,
                      transform: 'translate(-50%, -50%)',
                      zIndex: 20
                    }}
                  >
                    <div className="w-3 h-3 bg-red-600 rounded-full border-2 border-white shadow-lg"></div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {isMinimized && (
          <button
            onClick={() => setIsMinimized(false)}
            className="absolute bottom-6 right-6 p-3 bg-zinc-900 hover:bg-zinc-800 border-[1px] border-zinc-700 rounded-xl shadow-lg transition-colors"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </button>
        )}

        {!hasGuessed && (
          <button 
            onClick={handleGuessSubmit}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-lg rounded-lg shadow-lg transition-colors"
          >
            Guess
          </button>
        )}
      </div>
    </>
  );
}