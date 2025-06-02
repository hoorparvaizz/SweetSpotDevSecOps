# 🍰 SweetSpot Artisan Dessert Marketplace

A full-stack MERN application connecting artisan dessert vendors with customers, featuring real-time inventory management, order processing, and seamless user experiences.

[![CI/CD Pipeline](https://github.com/hoorparvaizz/SweetSpotDevSecOps/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/hoorparvaizz/SweetSpotDevSecOps/actions/workflows/ci-cd.yml)
[![Deploy to Heroku](https://github.com/hoorparvaizz/SweetSpotDevSecOps/actions/workflows/deploy-heroku.yml/badge.svg)](https://github.com/hoorparvaizz/SweetSpotDevSecOps/actions/workflows/deploy-heroku.yml)

## 🌟 Features

### For Customers
- 🛒 **Product Catalog** - Browse artisan desserts with advanced filtering
- 🔍 **Smart Search** - Find products by name, category, dietary restrictions
- ❤️ **Favorites** - Save products for later purchase
- 🛍️ **Shopping Cart** - Add items with special requests
- 📱 **Order Management** - Track order status and history
- ⭐ **Reviews & Ratings** - Share feedback on purchased items

### For Vendors
- 📊 **Dashboard Analytics** - Real-time sales and performance metrics
- 📦 **Product Management** - Add, edit, and manage inventory
- 📋 **Order Processing** - Update order status and manage fulfillment
- 👤 **Profile Management** - Update business information and settings
- 💰 **Revenue Tracking** - Monitor sales and customer metrics

### System Features
- 🔐 **JWT Authentication** - Secure user authentication with role-based access
- 📱 **Responsive Design** - Mobile-first UI with Tailwind CSS
- 🎨 **Modern UI/UX** - Clean, intuitive interface with dark/light themes
- 🚀 **Real-time Updates** - Live inventory and order status updates
- 🔒 **Data Security** - Encrypted passwords and secure API endpoints

## 🛠️ Tech Stack

### Frontend
- **React 18** - Component-based UI library
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **React Query** - Server state management
- **Wouter** - Minimalist routing

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Token authentication
- **Multer** - File upload handling
- **bcryptjs** - Password hashing

### DevOps & CI/CD
- **GitHub Actions** - Automated testing and deployment
- **Jest** - JavaScript testing framework
- **ESLint** - Code linting and formatting
- **Docker** - Containerization (optional)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB 6+
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/hoorparvaizz/SweetSpotDevSecOps.git
cd SweetSpotDevSecOps
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Setup**
Create a `.env` file in the root directory:
```env
# Database
MONGODB_URI=mongodb://localhost:27017/sweetspot

# Authentication
JWT_SECRET=your-super-secret-jwt-key

# Server
PORT=3001
NODE_ENV=development

# Frontend (for production builds)
VITE_API_URL=http://localhost:3001
```

4. **Start MongoDB**
```bash
# Using MongoDB service
sudo systemctl start mongod

# Or using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

5. **Run the application**
```bash
# Development mode (runs both frontend and backend)
npm run dev

# Production build
npm run build
npm start
```

6. **Access the application**
- Frontend: http://localhost:5174
- Backend API: http://localhost:3001
- Health Check: http://localhost:3001/api/health

## 📁 Project Structure

```
SweetSpotMarketplace/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Route components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utilities and API client
│   │   └── contexts/       # React contexts
├── server/                 # Express backend
│   ├── models/             # Mongoose schemas
│   ├── middleware/         # Custom middleware
│   ├── routes.js           # API routes
│   └── index.js            # Server entry point
├── shared/                 # Shared utilities
├── .github/workflows/      # CI/CD pipelines
└── uploads/                # File uploads storage
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/user` - Get current user

### Products
- `GET /api/products` - Get all active products (customers)
- `GET /api/vendor/products` - Get vendor's products
- `POST /api/products` - Create new product (vendors)
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Cart & Orders
- `GET /api/cart` - Get user's cart
- `POST /api/cart` - Add item to cart
- `GET /api/orders` - Get user's orders
- `POST /api/orders` - Create new order

### Health Check
- `GET /api/health` - System health status

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## 🚀 Deployment

### GitHub Actions Workflows

1. **CI/CD Pipeline** (`.github/workflows/ci-cd.yml`)
   - Runs tests on Node.js 18.x and 20.x
   - Builds application
   - Security scanning
   - Code quality checks
   - Automated deployment

2. **Heroku Deployment** (`.github/workflows/deploy-heroku.yml`)
   - Deploys to Heroku on main branch pushes
   - Includes health check validation

3. **Vercel Deployment** (`.github/workflows/deploy-vercel.yml`)
   - Frontend deployment to Vercel
   - Preview deployments for PRs

### Environment Variables for Deployment

Set these secrets in your GitHub repository:

**For Heroku:**
- `HEROKU_API_KEY`
- `HEROKU_APP_NAME`
- `HEROKU_EMAIL`

**For Vercel:**
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`
- `VITE_API_URL`

## 🔒 Security Features

- Password hashing with bcryptjs
- JWT token authentication
- Input validation and sanitization
- CORS configuration
- File upload restrictions
- Environment variable protection

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Standards
- Follow ESLint configuration
- Write tests for new features
- Update documentation
- Follow conventional commit messages

## 📋 Roadmap

- [ ] Payment integration (Stripe/PayPal)
- [ ] Email notifications
- [ ] Advanced analytics dashboard
- [ ] Mobile app development
- [ ] Multi-vendor marketplace features
- [ ] Inventory management automation
- [ ] Customer loyalty program

## 🐛 Issue Reporting

Found a bug? Please create an issue with:
- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Screenshots (if applicable)
- Environment details

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Lead Developer**: [Hoor Parvaiz](https://github.com/hoorparvaizz)

## 🙏 Acknowledgments

- React team for the amazing framework
- MongoDB team for the robust database
- All contributors who helped improve this project

---

**Made with ❤️ for artisan dessert vendors and sweet tooth customers** 