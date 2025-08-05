import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, CircleMarker } from 'react-leaflet';
import Papa from 'papaparse';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const TripMap = () => {
  const [tripData, setTripData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [showStats, setShowStats] = useState(false);
  const [filteredTrips, setFilteredTrips] = useState([]);
  const [speedFilter, setSpeedFilter] = useState({ min: 0, max: 200 });
  const [weatherFilter, setWeatherFilter] = useState('all');
  const [samplingRate, setSamplingRate] = useState(3600);

  useEffect(() => {
    loadTripData();
  }, []);

  const loadTripData = async () => {
    try {
      const response = await fetch('/enhanced_merged_trip_data_fixed.csv');
      const csvText = await response.text();
      
      Papa.parse(csvText, {
        header: true,
        complete: (results) => {
          // Sample data by taking every 3600th line to improve performance
          const sampledData = results.data.filter((row, index) => {
            // Keep header row and every Nth data point based on sampling rate
            return index === 0 || (index % samplingRate === 0);
          }).filter(row => 
            row.longitude && row.latitude && 
            !isNaN(parseFloat(row.longitude)) && 
            !isNaN(parseFloat(row.latitude))
          );
          
          console.log(`Original data points: ${results.data.length}`);
          console.log(`Sampled data points: ${sampledData.length}`);
          console.log(`Sampling ratio: 1 in ${samplingRate}`);
          
          setTripData(sampledData);
          setLoading(false);
        },
        error: (error) => {
          console.error('Error parsing CSV:', error);
          setLoading(false);
        }
      });
    } catch (error) {
      console.error('Error loading CSV:', error);
      setLoading(false);
    }
  };

  const reloadWithNewSampling = () => {
    setLoading(true);
    loadTripData();
  };

  const groupDataByTrip = (data) => {
    const trips = {};
    data.forEach(row => {
      const tripId = row.trip;
      if (!trips[tripId]) {
        trips[tripId] = [];
      }
      trips[tripId].push(row);
    });
    return trips;
  };

  const getTripColor = (tripId) => {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
      '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
    ];
    return colors[tripId % colors.length];
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleString();
  };

  const formatSpeed = (speed) => {
    if (!speed || isNaN(speed)) return 'N/A';
    return `${parseFloat(speed).toFixed(1)} km/h`;
  };

  const formatTemperature = (temp) => {
    if (!temp || isNaN(temp)) return 'N/A';
    return `${parseFloat(temp).toFixed(1)}°C`;
  };

  const calculateTripStats = (tripPoints) => {
    const speeds = tripPoints.map(p => parseFloat(p.speed_kmh)).filter(s => !isNaN(s));
    const temps = tripPoints.map(p => parseFloat(p.temperature_c)).filter(t => !isNaN(t));
    const elevations = tripPoints.map(p => parseFloat(p.elevation_m)).filter(e => !isNaN(e));
    
    return {
      maxSpeed: speeds.length > 0 ? Math.max(...speeds) : 0,
      avgSpeed: speeds.length > 0 ? speeds.reduce((a, b) => a + b, 0) / speeds.length : 0,
      maxTemp: temps.length > 0 ? Math.max(...temps) : 0,
      minTemp: temps.length > 0 ? Math.min(...temps) : 0,
      maxElevation: elevations.length > 0 ? Math.max(...elevations) : 0,
      minElevation: elevations.length > 0 ? Math.min(...elevations) : 0,
      duration: tripPoints.length > 1 ? 
        new Date(tripPoints[tripPoints.length - 1].timestamp) - new Date(tripPoints[0].timestamp) : 0
    };
  };

  const getSpeedColor = (speed) => {
    const speedNum = parseFloat(speed);
    if (isNaN(speedNum)) return '#ccc';
    if (speedNum < 20) return '#4CAF50';
    if (speedNum < 60) return '#FF9800';
    return '#F44336';
  };

  const trips = groupDataByTrip(tripData);
  const allWeatherConditions = [...new Set(tripData.map(row => row.weather_condition).filter(Boolean))];

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px'
      }}>
        Loading trip data...
      </div>
    );
  }

  return (
    <div style={{ height: '100vh', width: '100%' }}>
      {/* Control Panel */}
      <div style={{ 
        position: 'absolute', 
        top: '10px', 
        left: '10px', 
        zIndex: 1000,
        background: 'white',
        padding: '15px',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        maxWidth: '350px',
        maxHeight: '80vh',
        overflowY: 'auto'
      }}>
        <h3 style={{ margin: '0 0 15px 0' }}>Trip Visualizer</h3>
        
        <div style={{ marginBottom: '15px' }}>
          <p style={{ margin: '0 0 5px 0', fontSize: '14px' }}>
            {Object.keys(trips).length} trips loaded
          </p>
          <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#666' }}>
            Sampling: 1 in {samplingRate} data points
          </p>
          <button 
            onClick={() => setShowStats(!showStats)}
            style={{
              padding: '8px 12px',
              background: showStats ? '#4CAF50' : '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            {showStats ? 'Hide' : 'Show'} Statistics
          </button>
        </div>

        {showStats && (
          <div style={{ marginBottom: '15px', fontSize: '12px' }}>
            <h4 style={{ margin: '0 0 10px 0' }}>Filters</h4>
            
            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Speed Range (km/h):</label>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <input
                  type="number"
                  value={speedFilter.min}
                  onChange={(e) => setSpeedFilter({...speedFilter, min: parseFloat(e.target.value) || 0})}
                  style={{ width: '60px', padding: '4px' }}
                  placeholder="Min"
                />
                <span>-</span>
                <input
                  type="number"
                  value={speedFilter.max}
                  onChange={(e) => setSpeedFilter({...speedFilter, max: parseFloat(e.target.value) || 200})}
                  style={{ width: '60px', padding: '4px' }}
                  placeholder="Max"
                />
              </div>
            </div>

            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Weather:</label>
              <select
                value={weatherFilter}
                onChange={(e) => setWeatherFilter(e.target.value)}
                style={{ width: '100%', padding: '4px' }}
              >
                <option value="all">All Weather</option>
                {allWeatherConditions.map(weather => (
                  <option key={weather} value={weather}>{weather}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Data Sampling (1 in N):</label>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <input
                  type="number"
                  value={samplingRate}
                  onChange={(e) => setSamplingRate(parseInt(e.target.value) || 3600)}
                  style={{ width: '80px', padding: '4px' }}
                  placeholder="3600"
                />
                <button 
                  onClick={reloadWithNewSampling}
                  style={{
                    padding: '4px 8px',
                    background: '#4CAF50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '10px'
                  }}
                >
                  Reload
                </button>
              </div>
              <div style={{ fontSize: '10px', color: '#666', marginTop: '2px' }}>
                Higher numbers = less data = faster loading
              </div>
            </div>
          </div>
        )}

        <div style={{ fontSize: '12px', color: '#666' }}>
          Click on markers to see trip details
        </div>
      </div>

      <MapContainer
        center={[34.18502367292392, -118.59660929312614]}
        zoom={10}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {Object.entries(trips).map(([tripId, tripPoints]) => {
          const color = getTripColor(parseInt(tripId));
          const coordinates = tripPoints.map(point => [
            parseFloat(point.latitude),
            parseFloat(point.longitude)
          ]);

          // Apply filters
          const filteredPoints = tripPoints.filter(point => {
            const speed = parseFloat(point.speed_kmh);
            const weather = point.weather_condition;
            
            const speedOk = !isNaN(speed) && speed >= speedFilter.min && speed <= speedFilter.max;
            const weatherOk = weatherFilter === 'all' || weather === weatherFilter;
            
            return speedOk && weatherOk;
          });

          if (filteredPoints.length === 0) return null;

          const stats = calculateTripStats(tripPoints);

          return (
            <React.Fragment key={tripId}>
              {/* Trip path */}
              <Polyline
                positions={coordinates}
                color={color}
                weight={3}
                opacity={0.7}
              />
              
              {/* Speed-based markers */}
              {filteredPoints.map((point, index) => (
                <CircleMarker
                  key={`${tripId}-${index}`}
                  center={[parseFloat(point.latitude), parseFloat(point.longitude)]}
                  radius={3}
                  fillColor={getSpeedColor(point.speed_kmh)}
                  color={getSpeedColor(point.speed_kmh)}
                  weight={1}
                  opacity={0.8}
                  fillOpacity={0.6}
                >
                  <Popup>
                    <div style={{ minWidth: '200px' }}>
                      <h4>Trip {tripId} - Point {index + 1}</h4>
                      <p><strong>Time:</strong> {formatTimestamp(point.timestamp)}</p>
                      <p><strong>Speed:</strong> {formatSpeed(point.speed_kmh)}</p>
                      <p><strong>Temperature:</strong> {formatTemperature(point.temperature_c)}</p>
                      <p><strong>Weather:</strong> {point.weather_condition || 'N/A'}</p>
                      <p><strong>Elevation:</strong> {point.elevation_m ? `${parseFloat(point.elevation_m).toFixed(0)}m` : 'N/A'}</p>
                      <p><strong>Humidity:</strong> {point.humidity_percent ? `${parseFloat(point.humidity_percent).toFixed(1)}%` : 'N/A'}</p>
                      <p><strong>Pressure:</strong> {point.pressure_hpa ? `${parseFloat(point.pressure_hpa).toFixed(1)} hPa` : 'N/A'}</p>
                    </div>
                  </Popup>
                </CircleMarker>
              ))}

              {/* Start marker */}
              {filteredPoints[0] && (
                <Marker
                  position={[parseFloat(filteredPoints[0].latitude), parseFloat(filteredPoints[0].longitude)]}
                  icon={L.divIcon({
                    className: 'custom-div-icon',
                    html: `<div style="background-color: ${color}; width: 15px; height: 15px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
                    iconSize: [15, 15],
                    iconAnchor: [7.5, 7.5]
                  })}
                >
                  <Popup>
                    <div style={{ minWidth: '250px' }}>
                      <h4>Trip {tripId} - Start</h4>
                      <p><strong>Time:</strong> {formatTimestamp(filteredPoints[0].timestamp)}</p>
                      <p><strong>Speed:</strong> {formatSpeed(filteredPoints[0].speed_kmh)}</p>
                      <p><strong>Temperature:</strong> {formatTemperature(filteredPoints[0].temperature_c)}</p>
                      <p><strong>Weather:</strong> {filteredPoints[0].weather_condition || 'N/A'}</p>
                      <p><strong>Elevation:</strong> {filteredPoints[0].elevation_m ? `${parseFloat(filteredPoints[0].elevation_m).toFixed(0)}m` : 'N/A'}</p>
                      
                      {showStats && (
                        <div style={{ marginTop: '10px', padding: '10px', background: '#f5f5f5', borderRadius: '4px' }}>
                          <h5 style={{ margin: '0 0 5px 0' }}>Trip Statistics:</h5>
                          <p style={{ margin: '2px 0', fontSize: '12px' }}>Max Speed: {stats.maxSpeed.toFixed(1)} km/h</p>
                          <p style={{ margin: '2px 0', fontSize: '12px' }}>Avg Speed: {stats.avgSpeed.toFixed(1)} km/h</p>
                          <p style={{ margin: '2px 0', fontSize: '12px' }}>Temp Range: {stats.minTemp.toFixed(1)}°C - {stats.maxTemp.toFixed(1)}°C</p>
                          <p style={{ margin: '2px 0', fontSize: '12px' }}>Elevation Range: {stats.minElevation.toFixed(0)}m - {stats.maxElevation.toFixed(0)}m</p>
                          <p style={{ margin: '2px 0', fontSize: '12px' }}>Duration: {Math.round(stats.duration / 1000 / 60)} minutes</p>
                        </div>
                      )}
                    </div>
                  </Popup>
                </Marker>
              )}

              {/* End marker */}
              {filteredPoints[filteredPoints.length - 1] && filteredPoints.length > 1 && (
                <Marker
                  position={[parseFloat(filteredPoints[filteredPoints.length - 1].latitude), parseFloat(filteredPoints[filteredPoints.length - 1].longitude)]}
                  icon={L.divIcon({
                    className: 'custom-div-icon',
                    html: `<div style="background-color: ${color}; width: 15px; height: 15px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
                    iconSize: [15, 15],
                    iconAnchor: [7.5, 7.5]
                  })}
                >
                  <Popup>
                    <div style={{ minWidth: '250px' }}>
                      <h4>Trip {tripId} - End</h4>
                      <p><strong>Time:</strong> {formatTimestamp(filteredPoints[filteredPoints.length - 1].timestamp)}</p>
                      <p><strong>Speed:</strong> {formatSpeed(filteredPoints[filteredPoints.length - 1].speed_kmh)}</p>
                      <p><strong>Temperature:</strong> {formatTemperature(filteredPoints[filteredPoints.length - 1].temperature_c)}</p>
                      <p><strong>Weather:</strong> {filteredPoints[filteredPoints.length - 1].weather_condition || 'N/A'}</p>
                      <p><strong>Elevation:</strong> {filteredPoints[filteredPoints.length - 1].elevation_m ? `${parseFloat(filteredPoints[filteredPoints.length - 1].elevation_m).toFixed(0)}m` : 'N/A'}</p>
                    </div>
                  </Popup>
                </Marker>
              )}
            </React.Fragment>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default TripMap; 