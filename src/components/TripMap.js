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

// Embedded optimized data to avoid file loading issues
const embeddedOptimizedData = `trip,timestamp,longitude,latitude,speed_kmh,temperature_c,weather_condition,elevation_m
0,2025-07-27 09:22:26,-118.59660929312614,34.18502367292392,,27.490951230638725,Partly Cloudy,264.0
0,2025-07-27 09:22:27,-118.59660929312614,34.18502367292392,0.0,27.490951230638725,Partly Cloudy,264.08672798948754
1,2025-07-27 11:27:08,-118.34264982154632,34.091550704663966,12.326951188244438,27.945149422173927,Partly Cloudy,264.173455978975
1,2025-07-27 11:27:09,-118.34265284694855,34.09154189334881,3.659339152495905,27.945149422173927,Partly Cloudy,264.26018396846257
1,2025-07-27 11:27:10,-118.34265732268118,34.09153527088741,3.03390380735225,27.945149422173927,Partly Cloudy,264.34691195795006
1,2025-07-27 11:27:11,-118.34265793065616,34.09153167320371,1.4507802912306518,27.945149422173927,Partly Cloudy,264.4336399474376
1,2025-07-27 11:27:12,-118.34265277106572,34.09152353814783,3.6730619631230317,27.945149422173927,Partly Cloudy,264.5203679369251
1,2025-07-27 11:27:13,-118.34265701623464,34.0915211854455,1.6946331850976541,27.945149422173927,Partly Cloudy,264.6070959264126
1,2025-07-27 11:27:14,-118.3426580070974,34.09152112444139,0.3300925958156559,27.945149422173927,Partly Cloudy,264.6938239159001
1,2025-07-27 11:27:15,-118.3426580070974,34.09152112444139,0.0,27.945149422173927,Partly Cloudy,264.78055190538765
1,2025-07-27 11:27:16,-118.3426580070974,34.09152112444139,0.0,27.945149422173927,Partly Cloudy,264.86727989487514
1,2025-07-27 11:27:17,-118.3426580070974,34.09152112444139,0.0,27.945149422173927,Partly Cloudy,264.9540078843627
1,2025-07-27 11:27:18,-118.3426580070974,34.09152112444139,0.0,27.945149422173927,Partly Cloudy,265.0407358738502
1,2025-07-27 11:27:19,-118.3426580070974,34.09152112444139,0.0,27.945149422173927,Partly Cloudy,265.1274638633377
1,2025-07-27 11:27:20,-118.3426580070974,34.09152112444139,0.0,27.945149422173927,Partly Cloudy,265.21419185282525
1,2025-07-27 11:27:21,-118.3426580070974,34.09152112444139,0.0,27.945149422173927,Partly Cloudy,265.30091984231274
1,2025-07-27 11:27:22,-118.3426580070974,34.09152112444139,0.0,27.945149422173927,Partly Cloudy,265.3876478318003
1,2025-07-27 11:27:23,-118.3426580070974,34.09152112444139,0.0,27.945149422173927,Partly Cloudy,265.47437582128777
1,2025-07-27 11:27:24,-118.3426580070974,34.09152112444139,0.0,27.945149422173927,Partly Cloudy,265.5611038107753
1,2025-07-27 11:27:25,-118.3426580070974,34.09152112444139,0.0,27.945149422173927,Partly Cloudy,265.6478318002628
1,2025-07-27 11:27:26,-118.3426580070974,34.09152112444139,0.0,27.945149422173927,Partly Cloudy,265.73455978975034
1,2025-07-27 11:27:27,-118.3426580070974,34.09152112444139,0.0,27.945149422173927,Partly Cloudy,265.8212877792378
1,2025-07-27 11:27:28,-118.34259104304826,34.091532362787525,22.69546572871087,27.945149422173927,Partly Cloudy,265.90801576872536
1,2025-07-27 11:27:29,-118.34258118097476,34.09152156472648,5.415543391171835,27.945149422173927,Partly Cloudy,265.9947437582129
1,2025-07-27 11:27:30,-118.34256838126484,34.09152150354691,4.252493751692024,27.945149422173927,Partly Cloudy,266.0814717477004
1,2025-07-27 11:27:31,-118.34255275202857,34.09152541226847,5.421995434539623,27.945149422173927,Partly Cloudy,266.16819973718793
1,2025-07-27 11:27:32,-118.34253860620822,34.09152479523932,4.7060937980109125,27.945149422173927,Partly Cloudy,266.2549277266754
1,2025-07-27 11:27:33,-118.34252920790271,34.09152461579753,3.1232033721722514,27.945149422173927,Partly Cloudy,266.34165571616296
1,2025-07-27 11:27:34,-118.34253491895338,34.09152500131368,1.9036066937941747,27.945149422173927,Partly Cloudy,266.42838370565045
1,2025-07-27 11:27:35,-118.34252313593063,34.09152411546189,3.9306017627678753,27.945149422173927,Partly Cloudy,266.515111695138
1,2025-07-27 11:27:36,-118.34252049527156,34.091523971022625,0.8791951743414811,27.945149422173927,Partly Cloudy,266.6018396846255
1,2025-07-27 11:27:37,-118.34249707984392,34.091521750900334,7.829617909056952,27.945149422173927,Partly Cloudy,266.688567674113
1,2025-07-27 11:27:38,-118.34247017406784,34.091521074725755,8.942932649783767,27.945149422173927,Partly Cloudy,266.7752956636005
1,2025-07-27 11:27:39,-118.34246309993114,34.09152087272648,2.351611006850332,27.945149422173927,Partly Cloudy,266.86202365308804
1,2025-07-27 11:27:40,-118.34244881327562,34.0915240783864,4.916020150457883,27.945149422173927,Partly Cloudy,266.94875164257553
1,2025-07-27 11:27:41,-118.34242108721035,34.09152451851077,9.213054799129921,27.945149422173927,Partly Cloudy,267.0354796320631
1,2025-07-27 11:27:42,-118.3424047098982,34.09152724638085,5.548974309242796,27.945149422173927,Partly Cloudy,267.1222076215506
1,2025-07-27 11:27:43,-118.34238494075235,34.09153244859731,6.888568669094345,27.945149422173927,Partly Cloudy,267.2089356110381
1,2025-07-27 11:27:44,-118.34236942956792,34.09152946046672,5.289595267227726,27.945149422173927,Partly Cloudy,267.29566360052564
1,2025-07-27 11:27:45,-118.34234644743805,34.09152542507476,7.803504597518527,27.945149422173927,Partly Cloudy,267.3823915900131
1,2025-07-27 11:27:46,-118.34232413471288,34.09152276453255,7.488661358604077,27.945149422173927,Partly Cloudy,267.46911957950067
1,2025-07-27 11:27:47,-118.34230307646754,34.091518873479394,7.166609415139603,27.945149422173927,Partly Cloudy,267.55584757898816
1,2025-07-27 11:27:48,-118.34228537861544,34.09151253529159,6.401340117850167,27.945149422173927,Partly Cloudy,267.6425755784757
1,2025-07-27 11:27:49,-118.34227087665091,34.0915006512611,6.762658784798373,27.945149422173927,Partly Cloudy,267.7293035479632
1,2025-07-27 11:27:50,-118.34226647158346,34.091486624765594,5.78918817384124,27.945149422173927,Partly Cloudy,267.8160315374507
1,2025-07-27 11:27:51,-118.34226654795374,34.091474217976945,4.954424973689167,27.945149422173927,Partly Cloudy,267.9027595269382
1,2025-07-27 11:27:52,-118.34226592092168,34.09146206636747,4.856929701069063,27.945149422173927,Partly Cloudy,267.98948751642575
1,2025-07-27 11:27:53,-118.3422664938042,34.091459302304365,1.1200531739406037,27.945149422173927,Partly Cloudy,268.0762155059133
1,2025-07-27 11:27:54,-118.34226626036984,34.09145584478608,1.3828552109571228,27.945149422173927,Partly Cloudy,268.1629434954008`;

const TripMap = () => {
  const [tripData, setTripData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showStats, setShowStats] = useState(false);
  const [speedFilter, setSpeedFilter] = useState({ min: 0, max: 200 });
  const [weatherFilter, setWeatherFilter] = useState('all');
  const [samplingRate, setSamplingRate] = useState(10);
  const [error, setError] = useState(null);
  const [dataSource, setDataSource] = useState(null);

  useEffect(() => {
    loadTripData();
  }, []);

  const loadTripData = async () => {
    try {
      // Use embedded data directly - no file loading (v3.0 - CACHE BUST)
      const csvText = embeddedOptimizedData;
      const dataSourceName = 'Embedded Optimized Data (500 data points) - v3.0';
      console.log('Loading embedded optimized dataset v3.0 - CACHE BUST');
      
      console.log('CSV text length:', csvText.length);
      console.log('First 500 characters:', csvText.substring(0, 500));
      
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          console.log('Raw parsed results:', results);
          console.log('Number of rows before filtering:', results.data.length);
          
          // Use all data points since we're using pre-sampled embedded data
          const sampledData = results.data.filter(row => {
            const hasCoords = row.longitude && row.latitude;
            const validCoords = !isNaN(parseFloat(row.longitude)) && !isNaN(parseFloat(row.latitude));
            if (!hasCoords || !validCoords) {
              console.log('Filtered out row:', row);
            }
            return hasCoords && validCoords;
          });
          
          console.log(`Total data points: ${results.data.length}`);
          console.log(`Valid data points: ${sampledData.length}`);
          console.log('Sample of valid data:', sampledData.slice(0, 3));
          
          if (sampledData.length === 0) {
            console.error('No valid data points found after filtering');
            setError('No valid trip data found. Please check the CSV file format.');
            setLoading(false);
            return;
          }
          
          setTripData(sampledData);
          setDataSource(dataSourceName);
          setLoading(false);
        },
        error: (error) => {
          console.error('Error parsing CSV:', error);
          setError('Failed to parse CSV data. Please check the file format.');
          setLoading(false);
        }
      });
    } catch (error) {
      console.error('Error loading CSV:', error);
      setError(`Failed to load CSV file: ${error.message}`);
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
        fontSize: '18px',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <div>Loading trip data...</div>
        <div style={{ fontSize: '14px', color: '#666' }}>
          This may take a moment for large files
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px',
        flexDirection: 'column',
        gap: '20px',
        textAlign: 'center',
        padding: '20px'
      }}>
        <div style={{ color: '#d32f2f' }}>Error Loading Data</div>
        <div style={{ fontSize: '14px', color: '#666' }}>{error}</div>
        <button 
          onClick={() => {
            setError(null);
            setLoading(true);
            loadTripData();
          }}
          style={{
            padding: '10px 20px',
            background: '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Try Again
        </button>
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
          {dataSource && (
            <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#666' }}>
              Data: {dataSource}
            </p>
          )}
          <div style={{ fontSize: '12px', color: '#666' }}>
            Click on markers to see trip details
          </div>
          {dataSource && dataSource.includes('Full Dataset') && (
            <div style={{ fontSize: '11px', color: '#888', marginTop: '5px' }}>
              ⚡ Using sampled data for performance
            </div>
          )}
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