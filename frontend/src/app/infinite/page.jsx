"use client";

import { useState, useRef, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";

export default function Infinite() {
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
  const [allLocations, setAllLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showResults, setShowResults] = useState(false);
  const [gameResults, setGameResults] = useState(null);
  const [lastPinchDistance, setLastPinchDistance] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [totalScore, setTotalScore] = useState(0);
  const [locationsPlayed, setLocationsPlayed] = useState(0);
  const containerRef = useRef(null);
  const imageRef = useRef(null);
  const pinTimeoutRef = useRef(null);
  const hoverTimeoutRef = useRef(null);

  const IMAGE_WIDTH = 300;
  const IMAGE_HEIGHT = 225;
  const MAP_OFFSET_X = -12;
  const MAP_OFFSET_Y = 5;
  const MAP_WIDTH = 5280;
  const MAP_HEIGHT = 417;

  useEffect(() => {
    const fetchAllLocations = async () => {
      try {
        const backendUrl = window.location.hostname === 'localhost' 
          ? 'http://localhost:3001' 
          : 'https://mapzoomgame.onrender.com';
        const response = await fetch(`${backendUrl}/data/infinite`);
        if (!response.ok) {
          throw new Error('Failed to fetch locations');
        }
        const data = await response.json();
        setAllLocations(data);
        
        const savedStats = localStorage.getItem('coastle-infinite-stats');
        if (savedStats) {
          const stats = JSON.parse(savedStats);
          setTotalScore(stats.totalScore || 0);
          setLocationsPlayed(stats.locationsPlayed || 0);
        }
        
        selectNextLocation(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching locations:', error);
        setLoading(false);
      }
    };

    fetchAllLocations();
  }, []);

  const selectNextLocation = (locations) => {
    const choiceValuesKey = 'coastle-infinite-choice-values';
    let choiceValues = JSON.parse(localStorage.getItem(choiceValuesKey) || '{}');
    
    if (Object.keys(choiceValues).length === 0) {
      locations.forEach(loc => {
        choiceValues[loc.id] = 1;
      });
    }
    
    const sortedByChoice = Object.entries(choiceValues)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
    
    const randomIndex = Math.floor(Math.random() * sortedByChoice.length);
    const selectedId = sortedByChoice[randomIndex][0];
    
    choiceValues[selectedId] = 0;
    Object.keys(choiceValues).forEach(id => {
        if (id !== selectedId) {
        choiceValues[id] = (choiceValues[id] || 0) + 1;
      }
    });
    
    localStorage.setItem(choiceValuesKey, JSON.stringify(choiceValues));
    
    const selectedLocation = locations.find(loc => loc.id === selectedId);
    setLocationData(selectedLocation);
    
    resetGameState();
  };

  const resetGameState = () => {
    setHasGuessed(false);
    setShowResults(false);
    setGameResults(null);
    setGuessMarker(null);
    setGuessLatLong(null);
    setSatelliteZoom(10);
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleNextLocation = () => {
    selectNextLocation(allLocations);
  };

  const formatZoom = (zoom) => {
    return zoom % 1 === 0 ? zoom.toString() : zoom.toFixed(1);
  };

  const pixelToLatLong = (x, y, imgWidth = MAP_WIDTH, imgHeight = MAP_HEIGHT) => {
    const mapX = x - MAP_OFFSET_X;
    const mapY = y - MAP_OFFSET_Y;
    
    const lon = (mapX / (imgWidth * 0.93)) * 360 - 198;

    let yNorm = mapY / imgHeight;
    yNorm = 0.715 * yNorm + 0.03

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
      const newZoom = Math.max(7, satelliteZoom - 1);
      setSatelliteZoom(newZoom);
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

      const resultsToSave = {
        distance: distance,
        isCorrect: isCorrect,
        turnNumber: turnNumber,
        score: scoreData,
        guessedLatLong: guessedLatLong,
        actualLocation: {
          lat: locationData.latitude,
          lon: locationData.longitude
        }
      };

      setGameResults(resultsToSave);
      setShowResults(true);
      
      const newTotalScore = totalScore + scoreData.finalScore;
      const newLocationsPlayed = locationsPlayed + 1;
      setTotalScore(newTotalScore);
      setLocationsPlayed(newLocationsPlayed);
      
      localStorage.setItem('coastle-infinite-stats', JSON.stringify({
        totalScore: newTotalScore,
        locationsPlayed: newLocationsPlayed
      }));
      
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
      const preloadUrl = `https://jddbikgujwntbkabchjw.supabase.co/storage/v1/object/public/map-images/${locationData.storage_path}/zoom_${formatZoom(nextZoom)}.png`;
      const img = new Image();
      img.src = preloadUrl;
      
      if (satelliteZoom === 7) {
        const finalZoomUrl = `https://jddbikgujwntbkabchjw.supabase.co/storage/v1/object/public/map-images/${locationData.storage_path}/zoom_3.png`;
        const img3 = new Image();
        img3.src = finalZoomUrl;
      }
    }
  }, [satelliteZoom, locationData]);

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
    ? `https://jddbikgujwntbkabchjw.supabase.co/storage/v1/object/public/map-images/${locationData.storage_path}/zoom_${formatZoom(satelliteZoom)}.png`
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
        <div className="absolute top-3 md:top-6 left-4 md:left-6 z-50">
          <h1 className="text-2xl md:text-5xl font-extrabold tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
            <span className="text-white">coastle</span>
          </h1>
          <p className="text-[12px] md:text-sm text-zinc-400 font-medium mt-0 md:mt-1" style={{textShadow: '0 0 40px #000, 0 0 60px #000, 0 0 80px #000, 0 0 100px #000, 0 4px 50px #000, 0 8px 80px #000'}}>infinite mode</p>
        </div>
        <div className="absolute top-[19px] md:top-6.5 right-4 md:right-6 z-50 flex items-center gap-3 md:gap-4 pr-[52px] md:pr-[56px]">
          <div className="text-right">
            <p className="text-xs md:text-sm font-medium text-zinc-400">
              Total Score: <span className="text-white font-bold">{totalScore.toLocaleString()}</span>
            </p>
            <p className="text-xs md:text-sm font-medium text-zinc-400">
              Locations: <span className="text-white font-bold">{locationsPlayed}</span>
            </p>
          </div>
          <Link
            href="/how-to-play"
            className="h-11 md:h-11 px-2 md:px-6 bg-white/3 hover:bg-white/20 active:bg-white/30 backdrop-blur-sm border border-white/30 text-white font-bold text-xs md:text-sm tracking-wider rounded-lg shadow-lg transition-colors whitespace-nowrap flex items-center justify-center"
          >
            HOW TO PLAY
          </Link>
        </div>
        <div className="absolute inset-0 bg-zinc-900">
          <img 
            src={satelliteImageUrl}
            alt="Satellite View"
            className="h-full w-full object-cover portrait:object-contain"
          />
    
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="relative">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 md:w-12 h-0.5 bg-white shadow-lg"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-8 md:h-12 w-0.5 bg-white shadow-lg"></div>
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
            className="absolute bottom-6 right-2 md:right-6 p-4 md:p-3 bg-white/3 hover:bg-white/20 active:bg-white/30 backdrop-blur-sm border border-white/30 rounded-lg shadow-lg transition-colors"
          >
            <svg className="w-6 h-6 md:w-5 md:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </button>
        )}

        {!hasGuessed && (
          <div className="absolute bottom-20 portrait:top-20 portrait:bottom-auto md:bottom-6 left-1/2 -translate-x-1/2 flex gap-3 md:gap-4 px-4 z-50">
            <button 
              onClick={handleSatelliteZoomOut}
              disabled={satelliteZoom <= 7}
              className={`w-[140px] md:w-[160px] py-4 md:py-4 font-bold text-xs md:text-sm tracking-wider rounded-lg shadow-lg transition-colors ${
                satelliteZoom <= 7 
                  ? 'bg-zinc-800/50 text-zinc-600 cursor-not-allowed border border-zinc-700/50 backdrop-blur-sm' 
                  : 'bg-white/3 hover:bg-white/20 text-white active:bg-white/30 border border-white/30 backdrop-blur-sm'
              }`}
            >
              ZOOM OUT
            </button>
            <button 
              onClick={handleGuessSubmit}
              className="w-[140px] md:w-[160px] py-4 md:py-4 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold text-xs md:text-sm tracking-wider rounded-lg shadow-lg transition-colors"
            >
              SUBMIT
            </button>
          </div>
        )}

        {hasGuessed && !showResults && (
          <div className="absolute bottom-20 portrait:top-20 portrait:bottom-auto md:bottom-6 left-1/2 -translate-x-1/2 flex gap-2 md:gap-3 px-4 z-50">
            <button 
              onClick={() => setShowResults(true)}
              className="w-[160px] md:w-[180px] py-4 md:py-4 bg-white/3 hover:bg-white/20 active:bg-white/30 backdrop-blur-sm border border-white/30 text-white font-bold text-xs md:text-sm tracking-wider rounded-lg shadow-lg transition-colors"
            >
              VIEW RESULTS
            </button>
          </div>
        )}

        {showResults && gameResults && (
          <div 
            className="absolute inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
            onClick={() => setShowResults(false)}
          >
            <div 
              className="bg-zinc-900 rounded-2xl p-5 md:p-6 max-w-sm w-full border border-zinc-800 max-h-[90vh] overflow-y-auto relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowResults(false)}
                className="absolute top-2 right-2 h-7 w-7 border border-zinc-700 hover:bg-zinc-800 active:bg-zinc-700 rounded-full flex items-center justify-center text-zinc-400 hover:text-white text-lg font-bold transition-colors"
              >
                ×
              </button>

              <div className="text-center mb-5">
                <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-1">
                  {gameResults.isCorrect ? "Perfect!" : "Results"}
                </h2>
                <p className="text-zinc-500 text-xs tracking-wide">
                  {gameResults.isCorrect ? "Within 200 miles" : `${gameResults.distance.toFixed(0)} miles away`}
                </p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-[10px] font-bold tracking-widest text-zinc-500 mb-2">
                    FINAL SCORE
                  </h3>
                  <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-center">
                    <p className="text-2xl md:text-3xl font-bold text-white">
                      {gameResults.score.finalScore.toLocaleString()}
                    </p>
                    <p className="text-zinc-500 text-xs font-medium">points</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-[10px] font-bold tracking-widest text-zinc-500 mb-2">
                    SCORE BREAKDOWN
                  </h3>
                  <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-3">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-400 text-xs">Turn {gameResults.turnNumber} base</span>
                        <span className="text-green-400 font-semibold text-sm">+{gameResults.score.basePoints.toLocaleString()}</span>
                      </div>
                      {gameResults.score.penalty > 0 && (
                        <div className="flex justify-between items-center">
                          <span className="text-zinc-400 text-xs">Distance penalty ({gameResults.score.distanceRings} × 200 mi)</span>
                          <span className={`font-semibold text-sm ${
                            gameResults.score.penalty >= 3000 ? 'text-red-400' :
                            gameResults.score.penalty >= 2000 ? 'text-orange-400' :
                            gameResults.score.penalty >= 1000 ? 'text-yellow-400' :
                            'text-green-400'
                          }`}>−{gameResults.score.penalty.toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-[10px] font-bold tracking-widest text-zinc-500 mb-2">
                    PERFORMANCE
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-3">
                      <p className="text-zinc-500 text-[10px] font-medium mb-0.5">Distance</p>
                      <p className="text-white text-lg font-bold">
                        {gameResults.distance.toFixed(0)} mi
                      </p>
                    </div>
                    <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-3">
                      <p className="text-zinc-500 text-[10px] font-medium mb-0.5">Turn</p>
                      <p className="text-white text-lg font-bold">
                        {gameResults.turnNumber} of 4
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-[10px] font-bold tracking-widest text-zinc-500 mb-2">
                    TOTAL STATS
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-3">
                      <p className="text-zinc-500 text-[10px] font-medium mb-0.5">Total Score</p>
                      <p className="text-white text-lg font-bold">
                        {totalScore.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-3">
                      <p className="text-zinc-500 text-[10px] font-medium mb-0.5">Locations</p>
                      <p className="text-white text-lg font-bold">
                        {locationsPlayed}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-5 space-y-2">
                <button
                  onClick={handleNextLocation}
                  className="w-full px-6 py-3 bg-white hover:bg-zinc-200 active:bg-zinc-300 text-black font-bold text-xs tracking-wider rounded-lg transition-colors"
                >
                  NEXT LOCATION
                </button>
                <button
                  onClick={() => setShowResults(false)}
                  className="w-full px-6 py-3 bg-zinc-800/50 hover:bg-zinc-800/70 active:bg-zinc-800/90 border border-zinc-700/50 text-white font-bold text-xs tracking-wider rounded-lg transition-colors"
                >
                  CLOSE
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}