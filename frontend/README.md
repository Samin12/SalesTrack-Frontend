# YouTube Analytics Frontend

Next.js frontend application for the YouTube Analytics Dashboard. This provides an interactive user interface for analytics visualization, UTM link management, and dashboard features.

## 🚀 Features

- **Interactive Analytics Dashboard**: Real-time YouTube channel and video performance metrics
- **UTM Link Management**: Create, track, and analyze UTM campaign links
- **Video Performance Tracking**: Detailed analytics for individual videos
- **Traffic Analytics**: Website traffic correlation with YouTube content
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS
- **Real-time Updates**: Live data synchronization with backend API
- **Export Capabilities**: Download analytics data and reports

## 📋 Prerequisites

- Node.js 18+ and npm
- YouTube Analytics Backend API running
- Modern web browser

## 🛠️ Installation

### 1. Clone the Repository

```bash
git clone https://github.com/AI-Answer/youtube-analytics-frontend.git
cd youtube-analytics-frontend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create environment files for different environments:

```bash
# For development
cp .env.example .env.local

# For production
cp .env.example .env.production
```

Edit the environment files with your backend API URL:

```env
# .env.local (development)
NEXT_PUBLIC_API_URL=http://localhost:8000

# .env.production (production)
NEXT_PUBLIC_API_URL=https://your-backend-api-url.com
```

## 🚀 Running the Application

### Development Mode

```bash
npm run dev
```

The application will be available at http://localhost:3000

### Production Build

```bash
npm run build
npm start
```

### Docker Deployment

```bash
docker build -t youtube-analytics-frontend .
docker run -p 3000:3000 youtube-analytics-frontend
```

## 📚 Features Overview

### Analytics Dashboard

- **Overview Page**: Channel statistics, subscriber growth, video performance
- **Video Analytics**: Individual video metrics, engagement rates, traffic sources
- **Traffic Analysis**: Website traffic correlation with YouTube content
- **Growth Metrics**: Historical data and trend analysis

### UTM Link Management

- **Link Creation**: Generate UTM tracking links for YouTube videos
- **Campaign Tracking**: Monitor click-through rates and conversions
- **Performance Analytics**: Detailed UTM link performance metrics
- **Bulk Operations**: Create and manage multiple UTM links

### User Interface

- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Dark/Light Mode**: Theme switching for user preference
- **Interactive Charts**: Dynamic data visualization with Chart.js
- **Export Features**: Download data as CSV, PDF, or Excel

## 🔧 Configuration

### API Integration

The frontend communicates with the YouTube Analytics Backend API. Configure the API URL in your environment variables:

```env
NEXT_PUBLIC_API_URL=https://your-backend-api-url.com
```

### CORS Configuration

Ensure your backend API allows requests from your frontend domain. Update the backend's `BACKEND_CORS_ORIGINS` environment variable:

```env
BACKEND_CORS_ORIGINS=["http://localhost:3000", "https://your-frontend-domain.com"]
```

## 🚢 Deployment

### Railway Deployment

1. Connect your GitHub repository to Railway
2. Set the `NEXT_PUBLIC_API_URL` environment variable
3. Deploy automatically on git push

### Vercel Deployment

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on git push

### Manual Deployment

```bash
# Build the application
npm run build

# Start the production server
npm start
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── analytics/      # Analytics-specific components
│   ├── utm/           # UTM link management components
│   └── ui/            # Generic UI components
├── pages/             # Next.js pages
│   ├── analytics/     # Analytics dashboard pages
│   ├── utm/          # UTM management pages
│   └── api/          # API routes (if any)
├── hooks/            # Custom React hooks
├── utils/            # Utility functions
├── types/            # TypeScript type definitions
└── styles/           # CSS and styling files
```

## 🎨 Styling

This project uses:
- **Tailwind CSS**: Utility-first CSS framework
- **CSS Modules**: Component-scoped styling
- **Responsive Design**: Mobile-first approach

## 🔒 Security

- Environment variables for sensitive configuration
- API request validation
- CORS protection
- Input sanitization

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
- Create an issue on GitHub
- Check the backend API documentation
- Review the deployment guides

## 🔗 Related Projects

- [YouTube Analytics Backend](https://github.com/AI-Answer/youtube-analytics-backend) - FastAPI backend service
