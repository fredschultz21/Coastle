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
  const [showResults, setShowResults] = useState(false);
  const [gameResults, setGameResults] = useState(null);
  const [lastPinchDistance, setLastPinchDistance] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const containerRef = useRef(null);
  const imageRef = useRef(null);
  const pinTimeoutRef = useRef(null);
  const hoverTimeoutRef = useRef(null);

  const IMAGE_WIDTH = 300;
  const IMAGE_HEIGHT = 225;
  const MAP_OFFSET_X = -10;
  const MAP_OFFSET_Y = 12;
  const MAP_WIDTH = 590;
  const MAP_HEIGHT = 417;

  const dailyId = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const fetchLocationData = async () => {
      try {
        const backendUrl = window.location.hostname === 'localhost' 
          ? 'http://localhost:3001' 
          : 'https://mapzoomgame.onrender.com';
        const response = await fetch(`${backendUrl}/data/daily`);
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

  const pixelToLatLong = (x, y, imgWidth = MAP_WIDTH, imgHeight = MAP_HEIGHT) => {
    const mapX = x - MAP_OFFSET_X;
    const mapY = y - MAP_OFFSET_Y;
    
    const lon = (mapX / imgWidth) * 360 - 180;

    let yNorm = mapY / imgHeight;

    yNorm = 0.74 * yNorm - 0.03;

    const mercN = Math.PI * (1 - 2 * yNorm);
    let lat = (180 / Math.PI) * Math.atan(Math.sinh(mercN));

    return { lat, lon };
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 3959;
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

  const calculateScore = (turn, distance) => {
    const basePoints = (5 - turn) * 1000;
    const distanceRings = Math.floor(distance / 200);
    const penalty = distanceRings * 1000;
    const finalScore = Math.max(0, basePoints - penalty);
    
    return {
      basePoints,
      penalty,
      finalScore,
      distanceRings
    };
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

    const touch = e.touches?.[0] || e.changedTouches?.[0];
    const clientX = touch ? touch.clientX : e.clientX;
    const clientY = touch ? touch.clientY : e.clientY;

    const rect = container.getBoundingClientRect();
    const clickX = clientX - rect.left;
    const clickY = clientY - rect.top;

    const imageX = (clickX - position.x) / zoom;
    const imageY = (clickY - position.y) / zoom;

    setGuessMarker({ 
      x: imageX, 
      y: imageY,
      containerWidth: rect.width,
      containerHeight: rect.height,
      currentZoom: zoom
    });
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
    setIsTransitioning(true);
    setIsHovered(true);
    setTimeout(() => setIsTransitioning(false), 300);
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
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice) {
      setIsHovered(false);
      handleMouseUp();
    } else {
      hoverTimeoutRef.current = setTimeout(() => {
        setIsHovered(false);
        handleMouseUp();
      }, 500);
    }
  };

  const handleGuessSubmit = () => {
    if (guessMarker && locationData) {
      const container = containerRef.current;
      const image = imageRef.current;
      if (!container || !image) return;
      
      const containerRect = container.getBoundingClientRect();
      
      const currentWidth = guessMarker.containerWidth;
      const currentHeight = guessMarker.containerHeight;
      
      const scaleX = image.naturalWidth / currentWidth;
      const scaleY = image.naturalHeight / currentHeight;
      
      const naturalX = guessMarker.x * scaleX;
      const naturalY = guessMarker.y * scaleY;

      /*
      alert(`Debug Info:
        Natural coords: ${naturalX.toFixed(2)}, ${naturalY.toFixed(2)}
        Image dimensions: ${image.naturalWidth} × ${image.naturalHeight}
        Rendered size: ${currentWidth.toFixed(2)} × ${currentHeight.toFixed(2)}
        Scale factors: ${scaleX.toFixed(4)} × ${scaleY.toFixed(4)}
        Marker in container: ${guessMarker.x.toFixed(2)}, ${guessMarker.y.toFixed(2)}`);
      */
      
      const guessedLatLong = pixelToLatLong(naturalX, naturalY, image.naturalWidth, image.naturalHeight);
      setGuessLatLong(guessedLatLong);
      setHasGuessed(true);
      setSatelliteZoom(3);
      
      const distance = calculateDistance(
        guessedLatLong.lat,
        guessedLatLong.lon,
        locationData.latitude,
        locationData.longitude
      );
      
      const isCorrect = distance <= 200;
      const turnNumber = 11 - satelliteZoom;
      const scoreData = calculateScore(turnNumber, distance);

      setGameResults({
        distance: distance,
        isCorrect: isCorrect,
        turnNumber: turnNumber,
        score: scoreData,
        guessedLatLong: guessedLatLong,
        actualLocation: {
          lat: locationData.latitude,
          lon: locationData.longitude
        }
      });
      
      setShowResults(true);
      
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

  
useEffect(() => {
  if (locationData && satelliteZoom > 7) {
    const nextZoom = satelliteZoom - 1;
    const preloadUrl = `https://jddbikgujwntbkabchjw.supabase.co/storage/v1/object/public/map-images/${locationData.storage_path}/zoom_${formatZoom(nextZoom)}.png?date=${dailyId}`;
    const img = new Image();
    img.src = preloadUrl;
    
    if (satelliteZoom === 7) {
      const finalZoomUrl = `https://jddbikgujwntbkabchjw.supabase.co/storage/v1/object/public/map-images/${locationData.storage_path}/zoom_3.png?date=${dailyId}`;
      const img3 = new Image();
      img3.src = finalZoomUrl;
    }
  }
}, [satelliteZoom, locationData, dailyId]);

  useEffect(() => {
      if (isHovered) {
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';
      } else {
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.width = '';
      }
      
      return () => {
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.width = '';
      };
    }, [isHovered]);

  const satelliteImageUrl = locationData 
    ? `https://jddbikgujwntbkabchjw.supabase.co/storage/v1/object/public/map-images/${locationData.storage_path}/zoom_${formatZoom(satelliteZoom)}.png?date=${dailyId}`
    : '';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-black">
        <p className="text-white text-xl md:text-2xl px-4 text-center">Loading...</p>
      </div>
    );
  }

  if (!locationData) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-black">
        <p className="text-white text-xl md:text-2xl px-4 text-center">Error loading location data</p>
      </div>
    );
  }

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
        <meta name="theme-color" content="#000000" />
        <style>{`
          html, body {
            touch-action: pan-x pan-y;
            overscroll-behavior: none;
            -ms-touch-action: pan-x pan-y;
            -webkit-tap-highlight-color: transparent;
          }
          * {
            -webkit-touch-callout: none;
            -webkit-user-select: none;
            user-select: none;
          }
          input, textarea {
            -webkit-user-select: text;
            user-select: text;
          }
          img[alt="World Map"] {
            image-rendering: -moz-crisp-edges;
            image-rendering: -webkit-crisp-edges;
            image-rendering: pixelated;
            image-rendering: crisp-edges;
          }
        `}</style>
      </Head>
      
      <div className="relative h-screen w-full overflow-hidden">
        <div className="absolute top-4 md:top-6 left-4 md:left-6 z-50">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-wide drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
            <span className="text-white">coastle</span>
          </h1>
        </div>
        <div className="absolute top-4 md:top-6 right-4 md:right-6 z-50">
          <p className="text-sm md:text-base font-semibold tracking-wide drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] text-white text-right">
            daily game for<br />
            {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        <div className="absolute inset-0 bg-zinc-900">
          <img 
            src={satelliteImageUrl}
            alt="Satellite View"
            className="h-full w-full object-cover"
          />
          {/* Center crosshair */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="relative">
              {/* Horizontal line */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 md:w-12 h-0.5 bg-white shadow-lg"></div>
              {/* Vertical line */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-8 md:h-12 w-0.5 bg-white shadow-lg"></div>
              {/* Center dot */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-white rounded-full shadow-lg"></div>
            </div>
          </div>
        </div>

        <p className="absolute bottom-28 md:bottom-4 left-2 md:left-4 text-[10px] md:text-xs text-white/80 z-10 drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
          © Mapbox © OpenStreetMap contributors © Maxar
        </p>

        {!isMinimized && (
          <div 
            className={`
              absolute bottom-32 md:bottom-6 right-2 md:right-6 
              transition-opacity duration-300 ease-in-out
              ${isHovered ? 'opacity-100' : 'opacity-40'}
            `}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onTouchStart={handleMouseEnter}
          >
            <div className="relative bg-black rounded-xl shadow-2xl overflow-hidden">
              <button
                onClick={() => setIsMinimized(true)}
                className="absolute top-2 right-2 z-10 h-10 w-10 md:h-8 md:w-8 bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 rounded-full flex items-center justify-center text-white text-xl md:text-base font-bold shadow-lg"
              >
                ×
              </button>

              <div className="absolute top-2 left-2 z-10 flex gap-1">
                <button
                  onClick={handleRecenter}
                  className="h-8 md:h-6 px-3 md:px-2 bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 rounded flex items-center justify-center text-white text-sm md:text-xs font-semibold shadow-lg"
                >
                  recenter
                </button>
                <button
                  onClick={handleZoomIn}
                  className="h-8 w-8 md:h-6 md:w-6 bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 rounded flex items-center justify-center text-white text-lg md:text-sm font-bold shadow-lg"
                >
                  +
                </button>
                <button
                  onClick={handleZoomOut}
                  className="h-8 w-8 md:h-6 md:w-6 bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 rounded flex items-center justify-center text-white text-lg md:text-sm font-bold shadow-lg"
                >
                  −
                </button>
              </div>
              
              <div 
                ref={containerRef}
                className={`
                  overflow-hidden relative
                  ${isHovered ? 'w-[85vw] aspect-[40/27] md:w-[640px] md:h-[432px]' : 'w-[140px] h-[100px] md:w-[176px] md:h-[128px]'}
                  transition-all duration-300
                  cursor-crosshair
                `}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onTouchStart={(e) => {
                  const touch = e.touches[0];
                  handleMouseDown({ 
                    preventDefault: () => e.preventDefault(),
                    clientX: touch.clientX, 
                    clientY: touch.clientY 
                  });
                }}
                onTouchMove={(e) => {
                  if (e.touches.length === 1) {
                    const touch = e.touches[0];
                    handleMouseMove({ 
                      preventDefault: () => e.preventDefault(),
                      clientX: touch.clientX, 
                      clientY: touch.clientY 
                    });
                  }
                }}
                onTouchEnd={(e) => {
                  if (e.touches.length < 2) {
                    setLastPinchDistance(null);
                  }
                  if (e.touches.length === 0) {
                    handleMouseUp();
                  }
                }}
                onWheel={handleWheel}
                onClick={handleMapClick}
              >
                <img 
                  ref={imageRef}
                  src="/pixelmap.png" 
                  alt="World Map"
                  style={{ 
                    imageRendering: 'pixelated',
                    imageRendering: '-moz-crisp-edges',
                    imageRendering: 'crisp-edges',
                    WebkitFontSmoothing: 'none',
                    imageRendering: '-webkit-optimize-contrast',
                    msInterpolationMode: 'nearest-neighbor',
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
                    <div className="w-4 h-4 md:w-3 md:h-3 bg-red-600 rounded-full border-2 md:border-2 border-white shadow-lg"></div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {isMinimized && (
          <button
            onClick={() => setIsMinimized(false)}
            className="absolute bottom-6 right-2 md:right-6 p-4 md:p-3 bg-zinc-900 hover:bg-zinc-800 active:bg-zinc-700 border-2 md:border-[1px] border-zinc-700 rounded-xl shadow-lg transition-colors"
          >
            <svg className="w-8 h-8 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </button>
        )}

        {!hasGuessed && (
          <div className="absolute bottom-20 portrait:top-20 portrait:bottom-auto md:bottom-6 left-1/2 -translate-x-1/2 flex gap-2 md:gap-3 px-4 z-50">
            <button 
              onClick={handleSatelliteZoomOut}
              disabled={satelliteZoom <= 7}
              className={`w-[140px] md:w-[150px] py-4 md:py-3 font-extrabold text-base md:text-lg rounded-lg shadow-lg transition-colors ${
                satelliteZoom <= 7 
                  ? 'bg-gray-700 cursor-not-allowed' 
                  : 'bg-sky-900 hover:bg-sky-700 text-white active:bg-sky-600'
              }`}
            >
              zoom out
            </button>
            <button 
              onClick={handleGuessSubmit}
              className="w-[140px] md:w-[150px] py-4 md:py-3 bg-red-800 hover:bg-red-700 active:bg-red-600 text-white font-extrabold text-base md:text-lg rounded-lg shadow-lg transition-colors"
            >
              guess
            </button>
          </div>
        )}

        {showResults && gameResults && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-zinc-900 rounded-2xl p-6 md:p-8 max-w-md w-full border-2 border-zinc-700 max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-4 md:mb-6">
                {gameResults.isCorrect ? "Correct!" : "Not Quite!"}
              </h2>
              
              <div className="space-y-3 md:space-y-4">
                <div className="bg-zinc-800 rounded-lg p-3 md:p-4">
                  <p className="text-zinc-400 text-xs md:text-sm">Distance</p>
                  <p className="text-white text-xl md:text-2xl font-bold">
                    {gameResults.distance.toFixed(2)} miles
                  </p>
                </div>

                <div className="bg-zinc-800 rounded-lg p-3 md:p-4">
                  <p className="text-zinc-400 text-xs md:text-sm">Turn</p>
                  <p className="text-white text-xl md:text-2xl font-bold">
                    Turn {gameResults.turnNumber} of 4
                  </p>
                </div>

                <div className="bg-zinc-800 rounded-lg p-3 md:p-4">
                  <p className="text-zinc-400 text-xs md:text-sm mb-2">Score Breakdown</p>
                  <div className="space-y-1 text-xs md:text-sm">
                    <div className="flex justify-between text-white">
                      <span>Base Points (Turn {gameResults.turnNumber}):</span>
                      <span className="font-bold">+{gameResults.score.basePoints}</span>
                    </div>
                    {gameResults.score.penalty > 0 && (
                      <div className="flex justify-between text-red-400">
                        <span>Distance Penalty ({gameResults.score.distanceRings} × 200 mi):</span>
                        <span className="font-bold">-{gameResults.score.penalty}</span>
                      </div>
                    )}
                    <div className="border-t border-zinc-600 my-2"></div>
                    <div className="flex justify-between text-white text-base md:text-lg">
                      <span className="font-bold">Final Score:</span>
                      <span className="font-bold text-green-400">{gameResults.score.finalScore}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-zinc-800 rounded-lg p-3 md:p-4">
                  <p className="text-zinc-400 text-xs md:text-sm mb-2">Coordinates</p>
                  <div className="space-y-1 text-[10px] md:text-xs">
                    <div className="flex justify-between text-white">
                      <span>Your Guess:</span>
                      <span>{gameResults.guessedLatLong.lat.toFixed(4)}°, {gameResults.guessedLatLong.lon.toFixed(4)}°</span>
                    </div>
                    <div className="flex justify-between text-green-400">
                      <span>Actual Location:</span>
                      <span>{gameResults.actualLocation.lat.toFixed(4)}°, {gameResults.actualLocation.lon.toFixed(4)}°</span>
                    </div>
                  </div>
                </div>

                {gameResults.isCorrect && (
                  <div className="bg-green-900/30 border border-green-600 rounded-lg p-3 md:p-4 text-center">
                    <p className="text-green-400 font-bold text-sm md:text-base">
                      Within 200 miles!
                    </p>
                  </div>
                )}
              </div>

              <button
                onClick={() => setShowResults(false)}
                className="w-full mt-4 md:mt-6 px-6 py-4 md:py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-500 text-white font-bold text-base md:text-lg rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
