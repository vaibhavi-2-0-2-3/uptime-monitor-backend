# Dynamic Response Time Charts

## Overview

The response time charts in the monitor dashboard are now fully dynamic and functional, fetching real data from the backend API.

## Features

### ✅ **Dynamic Data Fetching**

- Charts fetch real response time data from `/api/monitors/:id/history`
- Data updates automatically when time range changes
- Real-time statistics (average, minimum, maximum response times)

### ✅ **Time Range Filtering**

- **24 Hours**: Shows hourly data points
- **7 Days**: Shows daily aggregated data
- **30 Days**: Shows weekly aggregated data

### ✅ **Interactive Charts**

- Hover tooltips with timestamp and response time
- Responsive design that adapts to screen size
- Dark theme styling consistent with the app

### ✅ **Error Handling**

- Loading states while fetching data
- Error messages with retry functionality
- Empty state when no data is available

## Backend API

### Endpoint: `GET /api/monitors/:id/history`

**Query Parameters:**

- `range` (optional): `24h`, `7d`, or `30d` (default: `24h`)

**Response:**

```json
{
  "data": [
    {
      "timestamp": "2024-01-15T10:30:00.000Z",
      "responseTime": 125,
      "status": "UP",
      "time": "10:30",
      "date": "1/15/2024"
    }
  ],
  "statistics": {
    "average": 120,
    "minimum": 85,
    "maximum": 180,
    "totalChecks": 1440,
    "successfulChecks": 1368
  },
  "range": "24h"
}
```

## Frontend Components

### `ResponseTimeChart.jsx`

- Main chart component with Recharts integration
- Handles data fetching, loading states, and error handling
- Supports time range filtering
- Displays statistics below the chart

### Integration in `MonitorPanel.jsx`

- Replaces static mock data with dynamic component
- Passes monitor ID and authentication token
- Maintains consistent styling with the rest of the app

## Testing

### 1. Generate Sample Data

```bash
cd uptime-monitor-backend
node scripts/generateSampleData.js
```

This will create 24 hours of sample data with:

- Realistic response times (50-200ms)
- 95% uptime, 5% downtime
- 1 data point per minute

### 2. Test Different Time Ranges

1. Create a monitor in the dashboard
2. Run the sample data script
3. View the monitor panel
4. Test different time ranges (24h, 7d, 30d)
5. Verify tooltips and statistics

### 3. Test Error Scenarios

- Disconnect from backend to test error handling
- Create a monitor without any data to test empty state
- Test with invalid monitor IDs

## Data Structure

### MonitorLog Schema

```javascript
{
  monitorId: ObjectId,
  timestamp: Date,
  status: "UP" | "DOWN",
  responseTime: Number (in milliseconds)
}
```

### Chart Data Processing

- Timestamps are formatted based on time range
- Response times are filtered for valid values (> 0)
- Statistics are calculated from actual data
- Empty data points are handled gracefully

## Performance Considerations

- **Data Limits**: Maximum 1000 data points per request
- **Caching**: Consider implementing Redis caching for frequently accessed data
- **Aggregation**: For longer time ranges, consider pre-aggregating data
- **Pagination**: For very large datasets, implement pagination

## Future Enhancements

- [ ] Real-time WebSocket updates
- [ ] Data export functionality
- [ ] Custom time range selection
- [ ] Multiple monitor comparison charts
- [ ] Alert thresholds visualization
- [ ] Historical trend analysis
