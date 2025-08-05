# Trip Visualizer

An interactive web application for visualizing trip data on an interactive map using React and Leaflet.

## Features

- **Interactive Map**: View trip routes on an interactive map using OpenStreetMap tiles
- **Trip Visualization**: Each trip is displayed as a colored path with speed-based markers
- **Speed Color Coding**: Markers are color-coded based on speed:
  - Green: < 20 km/h
  - Orange: 20-60 km/h  
  - Red: > 60 km/h
- **Detailed Popups**: Click on any marker to see detailed information including:
  - Timestamp
  - Speed
  - Temperature
  - Weather conditions
  - Elevation
  - Humidity
  - Pressure
- **Trip Statistics**: View comprehensive statistics for each trip including:
  - Maximum and average speed
  - Temperature range
  - Elevation range
  - Trip duration
- **Filtering Options**: Filter trips by:
  - Speed range
  - Weather conditions
- **Responsive Design**: Works on desktop and mobile devices

## Data Format

The application expects a CSV file with the following columns:
- `trip`: Trip identifier
- `timestamp`: Timestamp of the data point
- `longitude`: Longitude coordinate
- `latitude`: Latitude coordinate
- `speed_kmh`: Speed in kilometers per hour
- `temperature_c`: Temperature in Celsius
- `weather_condition`: Weather condition description
- `elevation_m`: Elevation in meters
- `humidity_percent`: Humidity percentage
- `pressure_hpa`: Pressure in hectopascals
- `fsd_active`: FSD active status
- `video_on`: Video recording status
- `fsd_event`: FSD event information
- `source_file`: Source file name
- `wind_speed_kmh`: Wind speed in km/h
- `wind_direction_degrees`: Wind direction in degrees

## Installation and Setup

1. **Prerequisites**: Make sure you have Node.js installed on your system

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Add Your Data**: Place your CSV file in the `public/` directory and name it `enhanced_merged_trip_data_fixed.csv`

4. **Start the Development Server**:
   ```bash
   npm start
   ```

5. **Open in Browser**: The application will open automatically at `http://localhost:3000`

## Usage

1. **View Trips**: The map will automatically load and display all trips from your CSV file
2. **Interact with Markers**: Click on any marker to see detailed information about that data point
3. **Use Filters**: Click "Show Statistics" to access filtering options:
   - Adjust speed range to focus on specific speed ranges
   - Select weather conditions to filter by weather
4. **Explore Trip Details**: Click on start/end markers to see comprehensive trip statistics

## Technical Details

- **Frontend**: React 18 with functional components and hooks
- **Mapping**: React-Leaflet for interactive maps
- **Data Parsing**: PapaParse for CSV parsing
- **Styling**: Inline styles for responsive design
- **Map Tiles**: OpenStreetMap tiles for base map

## Customization

You can customize the application by:

1. **Changing Colors**: Modify the `getTripColor` function to use different color schemes
2. **Adjusting Speed Thresholds**: Update the `getSpeedColor` function to change speed-based color coding
3. **Adding New Filters**: Extend the filtering system by adding new filter states and logic
4. **Modifying Popup Content**: Update the popup components to show different or additional information

## Troubleshooting

- **Data Not Loading**: Ensure your CSV file is in the `public/` directory and named correctly
- **Map Not Displaying**: Check that all dependencies are installed correctly
- **Performance Issues**: For large datasets, consider implementing data sampling or pagination

## License

This project is open source and available under the MIT License.
