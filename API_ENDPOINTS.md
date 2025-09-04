# 📊 SalesTrack Analytics API Endpoints

Simple, focused API endpoints for retrieving specific analytics metrics.

## 🎯 **Individual Metric Endpoints**

### **📺 YouTube Views (Weekly)**
```bash
GET /api/v1/analytics/youtube-views-weekly
```

**Response:**
```json
{
  "status": "success",
  "week_start": "2025-08-31T10:47:56.731986",
  "week_end": "2025-09-06T10:47:56.731986",
  "youtube_views_this_week": null,
  "total_videos": 54,
  "data_available": false,
  "message": "Weekly YouTube views require historical daily analytics data",
  "lifetime_views": 102266
}
```

### **🔗 Link Clicks (Weekly)**
```bash
GET /api/v1/analytics/link-clicks-weekly
```

**Response:**
```json
{
  "status": "success",
  "week_start": "2025-08-31T10:48:50.385177",
  "week_end": "2025-09-06T10:48:50.385177",
  "link_clicks_this_week": 4,
  "active_links_count": 6,
  "top_link": "YouTube Video Link",
  "data_available": true,
  "message": "Showing lifetime clicks (weekly tracking not implemented)",
  "link_details": [
    {
      "link_id": 1,
      "name": "YouTube Video Link",
      "destination_url": "https://youtube.com/watch?v=example",
      "clicks": 2,
      "utm_source": "youtube",
      "utm_medium": "description",
      "utm_campaign": "video_promotion"
    }
  ]
}
```

### **🌐 Website Visits (Weekly)**
```bash
GET /api/v1/analytics/website-visits-weekly
```

**Response:**
```json
{
  "status": "success",
  "week_start": "2025-08-31T10:48:50.385177",
  "week_end": "2025-09-06T10:48:50.385177",
  "website_visits_this_week": 44,
  "unique_visitors": 1,
  "page_views": 44,
  "top_page": "www.bookedin.ai/",
  "data_available": true,
  "message": "Data from PostHog for past 7 days",
  "daily_visits": [
    {"date": "3-Sep-2025", "visits": 31},
    {"date": "4-Sep-2025", "visits": 13}
  ],
  "top_pages": [
    {"url": "https://www.bookedin.ai/", "views": 33.0},
    {"url": "http://localhost:3000/", "views": 6.0}
  ]
}
```

### **👥 Subscribers (Weekly)**
```bash
GET /api/v1/analytics/subscribers-weekly
```

**Response:**
```json
{
  "status": "success",
  "week_start": "2025-08-31T10:48:50.385177",
  "week_end": "2025-09-06T10:48:50.385177",
  "current_subscribers": 6500,
  "subscribers_gained_this_week": null,
  "data_available": false,
  "message": "Weekly subscriber tracking requires historical daily data"
}
```

## 📈 **Summary & Analytics Endpoints**

### **📊 Summary Statistics**
```bash
GET /api/v1/analytics/summary-stats
```

**Response:**
```json
{
  "status": "success",
  "youtube": {
    "total_subscribers": 6500,
    "total_videos": 54,
    "total_views": 102266,
    "total_likes": 3622,
    "total_comments": 1044,
    "average_views_per_video": 1894.0
  },
  "utm_links": {
    "active_links": 6,
    "total_clicks": 4
  },
  "website": {
    "total_visits": 44,
    "unique_visitors": 1
  },
  "last_updated": "2025-09-04T10:49:02.328988"
}
```

### **🏆 Top Content (Weekly)**
```bash
GET /api/v1/analytics/top-content-weekly
```

**Response:**
```json
{
  "status": "success",
  "week_start": "2025-08-31T10:48:50.385177",
  "week_end": "2025-09-06T10:48:50.385177",
  "top_videos": [
    {
      "title": "I Built an AI Cold Caller and Made 10k in 5 days",
      "views": 16301,
      "likes": 542,
      "comments": 89,
      "published_at": "2025-08-15T10:00:00",
      "video_id": "abc123"
    }
  ],
  "top_utm_links": [
    {
      "name": "YouTube Video Link",
      "clicks": 2,
      "destination_url": "https://youtube.com/watch?v=example",
      "utm_campaign": "video_promotion"
    }
  ],
  "top_website_pages": [
    {"url": "https://www.bookedin.ai/", "views": 33.0}
  ],
  "data_available": true,
  "message": "Showing lifetime performance (weekly tracking not implemented for YouTube)"
}
```

### **📈 Growth Metrics**
```bash
GET /api/v1/analytics/growth-metrics?days=30
```

**Response:**
```json
{
  "status": "success",
  "period_days": 30,
  "start_date": "2025-08-05T10:49:02.328988",
  "end_date": "2025-09-04T10:49:02.328988",
  "youtube": {
    "videos_published": 3,
    "total_views_from_new_videos": 28909,
    "subscriber_growth": null,
    "data_available": true
  },
  "utm_links": {
    "clicks_in_period": 0,
    "data_available": false,
    "message": "UTM click timestamps not tracked"
  },
  "website": {
    "current_period": 44,
    "previous_period": 0,
    "growth_rate": 0
  },
  "message": "Growth calculations require historical baseline data"
}
```

## 🔧 **System Health**

### **⚡ Health Check**
```bash
GET /api/v1/analytics/health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-09-04T10:49:53.569651",
  "services": {
    "database": {
      "status": "healthy",
      "message": "Connected"
    },
    "posthog": {
      "status": "healthy",
      "message": "API responding"
    },
    "youtube": {
      "status": "configured",
      "message": "API key and channel ID present"
    }
  }
}
```

## 🚀 **Usage Examples**

### **JavaScript/Frontend**
```javascript
// Get weekly website visits
const response = await fetch('/api/v1/analytics/website-visits-weekly');
const data = await response.json();
console.log(`Website visits this week: ${data.website_visits_this_week}`);

// Get summary stats
const summary = await fetch('/api/v1/analytics/summary-stats');
const stats = await summary.json();
console.log(`Total YouTube views: ${stats.youtube.total_views}`);
```

### **Python**
```python
import requests

# Get YouTube views
response = requests.get('http://localhost:8000/api/v1/analytics/youtube-views-weekly')
data = response.json()
print(f"YouTube views available: {data['data_available']}")

# Check system health
health = requests.get('http://localhost:8000/api/v1/analytics/health')
print(f"System status: {health.json()['status']}")
```

### **cURL**
```bash
# Test all endpoints
curl http://localhost:8000/api/v1/analytics/youtube-views-weekly
curl http://localhost:8000/api/v1/analytics/link-clicks-weekly
curl http://localhost:8000/api/v1/analytics/website-visits-weekly
curl http://localhost:8000/api/v1/analytics/summary-stats
curl http://localhost:8000/api/v1/analytics/health
```

## 📝 **Notes**

- **Week Boundaries:** Sunday to Saturday
- **Data Availability:** Some metrics require historical data collection
- **Real-time Data:** Website visits use PostHog real-time data
- **Honest Reporting:** APIs clearly indicate when data is not available
- **Error Handling:** All endpoints return proper HTTP status codes and error messages

## 🔄 **Status Codes**

- `200` - Success
- `500` - Internal server error
- `404` - Endpoint not found

All successful responses include a `status` field indicating success/error state.
