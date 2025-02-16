import React, { useEffect, useState } from 'react';
import GetWeatherDataApi from '../api/weatherApi';
import {
  TextField,
  MenuItem,
  Grid,
  Paper,
} from '@mui/material';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';

function Weatherpage() {
  const [weatherData, setWeatherData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');

  // Fetch weather data from the API
  const fetchWeatherData = async () => {
    try {
      const response = await GetWeatherDataApi();
      console.log("Weather data:", response.data);
      setWeatherData(response.data);
      setFilteredData(response.data); // Initialize with full data
    } catch (error) {
      console.error("Failed to fetch weather data:", error.message);
    }
  };

  // Apply filters for month and location
  const applyFilters = () => {
    const filtered = weatherData.filter((data) => {
      const isMonthMatch = selectedMonth
        ? new Date(data.Timestamp).getMonth() + 1 === parseInt(selectedMonth)
        : true;
      const isLocationMatch = selectedLocation
        ? data.Location === selectedLocation
        : true;
      return isMonthMatch && isLocationMatch;
    });
    setFilteredData(filtered);
  };

  useEffect(() => {
    fetchWeatherData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [selectedMonth, selectedLocation]);

  // Prepare data for the chart
  const forecastCounts = filteredData.reduce((acc, data) => {
    acc[data.forecast] = (acc[data.forecast] || 0) + 1;
    return acc;
  }, {});

  const chartData = {
    labels: Object.keys(forecastCounts), // Forecast types
    datasets: [
      {
        label: 'Forecast Frequency',
        data: Object.values(forecastCounts), // Frequency of each forecast type
        backgroundColor: 'rgba(63, 81, 181, 0.6)',
        borderColor: 'rgba(63, 81, 181, 1)',
        borderWidth: 1,
      },
    ],
  };

  // Extract unique locations for the dropdown
  const uniqueLocations = Array.from(
    new Set(weatherData.map((data) => data.Location))
  );

  return (
    <Grid container spacing={3} sx={{ padding: 3 }}>
      {/* Filters */}
      <Grid item xs={12} md={4}>
        <TextField
          select
          label="Filter by Month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          fullWidth
        >
          <MenuItem value="">All Months</MenuItem>
          {Array.from({ length: 12 }, (_, i) => (
            <MenuItem key={i + 1} value={i + 1}>
              {new Date(0, i).toLocaleString('default', { month: 'long' })}
            </MenuItem>
          ))}
        </TextField>
      </Grid>
      <Grid item xs={12} md={4}>
        <TextField
          select
          label="Filter by Location"
          value={selectedLocation}
          onChange={(e) => setSelectedLocation(e.target.value)}
          fullWidth
        >
          <MenuItem value="">All Locations</MenuItem>
          {uniqueLocations.map((location, index) => (
            <MenuItem key={index} value={location}>
              {location}
            </MenuItem>
          ))}
        </TextField>
      </Grid>

      {/* Graph */}
      <Grid item xs={12}>
        <Paper elevation={3} sx={{ padding: 3 }}>
          {filteredData.length ? (
            <Bar data={chartData} options={{ responsive: true }} />
          ) : (
            <p>No data available for the selected filters.</p>
          )}
        </Paper>
      </Grid>
    </Grid>
  );
}

export default Weatherpage;
