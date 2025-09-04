# SalesTrack Frontend

**Frontend-only repository** for the YouTube Analytics tracking system. Built with Next.js, TypeScript, and Tailwind CSS.

> **📁 Repository Structure:**
> - **Frontend**: This repository ([SalesTrack-Frontend](https://github.com/Samin12/SalesTrack-Frontend))
> - **Backend**: Separate repository ([SalesTrack-Backend](https://github.com/Samin12/SalesTrack-Backend))

## 🚀 Features

- **📊 Analytics Dashboard** - Real-time YouTube analytics visualization
- **🔗 UTM Link Management** - Create and track UTM links for videos
- **📈 Performance Metrics** - Video performance tracking and insights
- **🌐 Website Analytics** - PostHog integration for website tracking
- **📱 Responsive Design** - Mobile-first responsive interface
- **🎨 Modern UI** - Built with Radix UI and Tailwind CSS

## 🛠️ Tech Stack

- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **Charts**: Recharts
- **HTTP Client**: Axios
- **State Management**: SWR

## 🚀 Deployment

### Railway Deployment

1. **Connect Repository**: Link this repository to Railway
2. **Set Environment Variables**:
   ```bash
   NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app
   ```
3. **Deploy**: Railway will automatically build and deploy

### Environment Variables

- `NEXT_PUBLIC_API_URL`: Backend API URL (required)

## 🔗 Related Repositories

- **Backend**: [SalesTrack Backend](https://github.com/Samin12/SalesTrack-Backend)
- **Current Backend URL**: `https://web-production-ad878.up.railway.app`

## 🏗️ Local Development

1. **Clone this repository**:
   ```bash
   git clone https://github.com/Samin12/SalesTrack-Frontend.git
   cd SalesTrack-Frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set environment variables**:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your backend URL
   ```

4. **Run development server**:
   ```bash
   npm run dev
   ```

5. **Open**: [http://localhost:3000](http://localhost:3000)

## 📄 License

MIT License
# Force Railway redeploy - Thu Sep  4 14:49:29 EDT 2025
