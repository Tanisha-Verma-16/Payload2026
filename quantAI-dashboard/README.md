# 🚀 Quant Research Dashboard

A stunning, professional-grade quantitative finance dashboard built with Next.js 14, React, TypeScript, and Recharts. Features real-time market data visualization, AI-powered insights, and advanced portfolio analytics.

![Dashboard Preview](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![React](https://img.shields.io/badge/React-18-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)

## ✨ Features

### 📊 **Real-Time Market Analytics**
- Live price charts with interactive visualizations
- Historical data analysis (OHLCV)
- Volatility tracking (20-day & 60-day)
- Return calculations and performance metrics

### 🎯 **AI-Powered Regime Prediction**
- Machine learning-based volatility regime classification
- 21-day forward-looking predictions
- Confidence scoring and probability distributions
- Visual "weather system" for market conditions

### 💼 **Portfolio Intelligence**
- Customized strategy recommendations
- Risk-adjusted position sizing
- Asset allocation guidance
- Rebalancing frequency optimization

### 📈 **Advanced Risk Metrics**
- Sharpe Ratio (risk-adjusted returns)
- Maximum Drawdown analysis
- Value at Risk (VaR 95%)
- Conditional VaR (CVaR)
- Expected returns & volatility

### 🤖 **Executive Summaries**
- AI-generated plain-English insights
- Market outlook assessments
- Key driver analysis
- Actionable recommendations

### 🎨 **Stunning UI/UX**
- Dark cyberpunk aesthetic with neon accents
- Smooth animations with Framer Motion
- Responsive design (mobile, tablet, desktop)
- Glassmorphism effects and gradient backgrounds

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **UI Library**: React 18
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **API**: REST (Quantitative Research API)

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Steps

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd quant-dashboard
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
```

3. **Run the development server**
```bash
npm run dev
# or
yarn dev
```

4. **Open your browser**
Navigate to [http://localhost:3000](http://localhost:3000)

## 🚀 Deployment to Vercel

### Quick Deploy

1. **Push to GitHub**
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-github-repo>
git push -u origin main
```

2. **Connect to Vercel**
- Visit [vercel.com](https://vercel.com)
- Click "New Project"
- Import your GitHub repository
- Vercel will auto-detect Next.js configuration
- Click "Deploy"

### Manual Deployment

1. **Install Vercel CLI**
```bash
npm install -g vercel
```

2. **Deploy**
```bash
vercel
```

3. **Follow the prompts**
- Set up project name
- Choose deployment settings
- Your app will be live in seconds!

### Environment Variables (Optional)

If you need to configure the API URL, create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=https://quant-research-api.onrender.com
```

## 📱 Features Breakdown

### Phase 1 (Current)
✅ Core dashboard with ticker search  
✅ Market overview metrics cards  
✅ Price chart with historical data  
✅ Regime prediction indicator  
✅ Executive summary panel  
✅ Risk metrics visualization  
✅ Strategy recommendations  

### Phase 2 (Coming Soon)
⏳ Monte Carlo simulation visualization  
⏳ Alpha signals charts  
⏳ Factor importance analysis  
⏳ SHAP explanation waterfall  

### Phase 3 (Planned)
⏳ Correlation matrix heatmap  
⏳ Multi-ticker comparison  
⏳ Portfolio optimization tools  
⏳ Batch analysis dashboard  

## 🎨 Design Philosophy

This dashboard follows a **"Financial Renaissance"** aesthetic:
- **Dark Theme**: Deep space backgrounds with midnight blue gradients
- **Neon Accents**: Electric blue, cyber cyan, and gold highlights
- **Typography**: Orbitron for headings, Inter for body text
- **Motion**: Smooth animations and micro-interactions
- **Glassmorphism**: Translucent cards with backdrop blur

## 🔧 Customization

### Change Color Theme

Edit `tailwind.config.js`:

```javascript
colors: {
  'electric-blue': '#00d4ff',  // Change primary accent
  'cyber-cyan': '#00fff5',      // Change secondary accent
  'gold-accent': '#ffd700',     // Change tertiary accent
}
```

### Modify Fonts

Update `app/globals.css`:

```css
@import url('https://fonts.googleapis.com/css2?family=YourFont');
```

## 📊 API Integration

The dashboard connects to the Quant Research API:

**Base URL**: `https://quant-research-api.onrender.com`

### Key Endpoints Used:
- `/api/tickers` - Get available tickers
- `/api/portfolio-analysis/{ticker}` - Get comprehensive analysis
- `/api/market-data/{ticker}` - Get historical price data
- `/api/predict-regime/{ticker}` - Get volatility predictions
- `/api/risk-metrics` - Get portfolio risk metrics

## 🐛 Troubleshooting

### API Errors
If you see "Failed to load data":
- Check your internet connection
- The API may be experiencing high load (it's hosted on free tier)
- Wait a few moments and refresh

### Build Errors
```bash
# Clear cache and reinstall
rm -rf .next node_modules
npm install
npm run build
```

## 📄 License

MIT License - Feel free to use this for your own projects!

## 🤝 Contributing

Contributions welcome! Please feel free to submit a Pull Request.

## 📧 Support

For questions or issues, please open an issue on GitHub.

---

**Built with ❤️ using Next.js and Quantitative Finance APIs**
