# Restaurant Management System - Web Frontend

Modern, responsive web interface for the Restaurant Management System built with React and Material-UI.

## 🎨 Features

- **Modern UI/UX**: Beautiful, intuitive interface with Material-UI
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Fast Performance**: Built with Vite for lightning-fast development
- **Component-Based**: Modular, reusable React components

## 🚀 Tech Stack

- **React 18** - UI Library
- **Material-UI v5** - Component Library
- **React Router v6** - Routing
- **Axios** - HTTP Client
- **Vite** - Build Tool

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Backend API running on http://localhost:5001

## 🔧 Installation

1. **Navigate to web directory**:
   ```bash
   cd web
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

The app will open at http://localhost:3000

## 📁 Project Structure

```
web/
├── public/              # Static assets
├── src/
│   ├── components/      # Reusable components
│   │   └── Navbar.jsx
│   ├── pages/          # Page components
│   │   └── HomePage.jsx
│   ├── theme.js        # Material-UI theme
│   ├── App.jsx         # Main app component
│   ├── main.jsx        # Entry point
│   └── index.css       # Global styles
├── .env                # Environment variables
├── index.html          # HTML template
├── vite.config.js      # Vite configuration
└── package.json        # Dependencies
```

## 🎯 Available Pages

### Current
- ✅ **Home Page** - Modern landing page with:
  - Hero section with call-to-action
  - Features showcase
  - Popular dishes carousel
  - Special offers
  - Customer testimonials
  - Footer with contact info

### Coming Soon
- 🚧 **Login Page** - User authentication
- 🚧 **Sign Up Page** - User registration
- 🚧 **Menu Page** - Browse full menu
- 🚧 **Order Page** - Place orders
- 🚧 **Reservations** - Book tables
- 🚧 **Profile Page** - User dashboard
- 🚧 **Admin Dashboard** - Restaurant management

## 🎨 Design System

### Colors
- **Primary**: #FF6B35 (Vibrant Orange)
- **Secondary**: #2C3E50 (Dark Blue-Grey)
- **Success**: #4CAF50 (Green)
- **Background**: #F5F5F5 (Light Grey)

### Typography
- **Headings**: Playfair Display (Serif)
- **Body**: Roboto (Sans-serif)

## 🔌 API Integration

The frontend connects to the backend API:

**Base URL**: `http://localhost:5001/api`

Configure in `.env`:
```env
VITE_API_URL=http://localhost:5001/api
```

## 📝 Scripts

```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🌐 Deployment

### Build for Production
```bash
npm run build
```

This creates an optimized build in the `dist/` directory.

### Deploy to Vercel/Netlify
1. Connect your repository
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variables

## 🎨 Customization

### Update Theme
Edit `src/theme.js` to customize colors, typography, and component styles.

### Add New Pages
1. Create page component in `src/pages/`
2. Add route in `src/App.jsx`
3. Update navigation in `src/components/Navbar.jsx`

## 🐛 Troubleshooting

### Port Already in Use
Change port in `vite.config.js`:
```javascript
server: {
  port: 3001, // Change to desired port
}
```

### API Connection Issues
- Verify backend is running on http://localhost:5001
- Check `.env` file has correct `VITE_API_URL`
- Check CORS settings in backend

## 📱 Responsive Breakpoints

- **xs**: 0px - 600px (Mobile)
- **sm**: 600px - 960px (Tablet)
- **md**: 960px - 1280px (Desktop)
- **lg**: 1280px - 1920px (Large Desktop)
- **xl**: 1920px+ (Extra Large)

## ✨ Features Showcase

### Home Page Sections

1. **Hero Section**
   - Eye-catching gradient background
   - Clear call-to-action buttons
   - Statistics showcase
   - Responsive layout

2. **Features Grid**
   - Icon-based feature cards
   - Hover animations
   - Clean, modern design

3. **Popular Dishes**
   - Menu item cards with images
   - Ratings and prices
   - Category tags
   - Order buttons

4. **Special Offer Banner**
   - Promotional content
   - Coupon codes
   - Call-to-action

5. **Testimonials**
   - Customer reviews
   - Star ratings
   - Avatar displays

6. **Footer**
   - Quick links
   - Contact information
   - Operating hours
   - Copyright info

## 🔐 Security

- Environment variables for sensitive data
- HTTPS in production
- Input validation
- XSS protection

## 📄 License

ISC

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📞 Support

For issues or questions, please contact the development team.

---

**Happy Coding! 🚀**
# DineFesto-Frontend
