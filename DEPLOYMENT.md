# 🚀 SweetSpot Marketplace - Heroku Deployment Guide

## Quick Deployment Commands

### 1. Create Heroku App
```bash
heroku create your-sweetspot-app-name
```

### 2. Set Environment Variables
```bash
heroku config:set MONGODB_URI="mongodb+srv://username:password@cluster.mongodb.net/sweetspot" -a your-app-name
heroku config:set JWT_SECRET="your-super-secret-jwt-key" -a your-app-name
heroku config:set NODE_ENV="production" -a your-app-name
heroku config:set PORT="3001" -a your-app-name
```

### 3. Add MongoDB Atlas (Recommended)
- Sign up at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- Create a free cluster
- Create a database user
- Whitelist all IP addresses (0.0.0.0/0) for Heroku
- Copy connection string and use in MONGODB_URI above

### 4. Deploy
```bash
git add .
git commit -m "Deploy to Heroku"
git push heroku main
```

### 5. Check Deployment
```bash
heroku logs --tail -a your-app-name
heroku open -a your-app-name
```

## GitHub Actions Auto-Deployment

### Required GitHub Secrets
Go to GitHub Repository → Settings → Secrets and variables → Actions:

- `HEROKU_API_KEY`: Get with `heroku auth:token`
- `HEROKU_APP_NAME`: Your Heroku app name
- `HEROKU_EMAIL`: Your Heroku account email

### How it Works
- Push to `main` branch triggers auto-deployment
- Runs tests first, then deploys if tests pass
- Includes health check after deployment

## Environment Variables

### Required for Heroku
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/sweetspot
JWT_SECRET=your-super-secret-jwt-key
NODE_ENV=production
PORT=3001
```

### Optional
```env
CLIENT_ORIGIN=https://your-app-name.herokuapp.com
```

## MongoDB Setup Options

### Option 1: MongoDB Atlas (Recommended)
1. Free tier available
2. Automatic backups
3. Global clusters
4. Easy scaling

### Option 2: Heroku Add-on
```bash
heroku addons:create mongolab:sandbox -a your-app-name
```

## Troubleshooting

### Common Issues

**Build Fails:**
```bash
heroku logs --tail -a your-app-name
# Check for missing dependencies or build errors
```

**Database Connection Issues:**
```bash
heroku config -a your-app-name
# Verify MONGODB_URI is set correctly
```

**App Crashes:**
```bash
heroku ps -a your-app-name
heroku restart -a your-app-name
```

### Useful Commands
```bash
# View config vars
heroku config -a your-app-name

# View logs
heroku logs --tail -a your-app-name

# Scale dynos
heroku ps:scale web=1 -a your-app-name

# Open app
heroku open -a your-app-name

# Run commands on Heroku
heroku run node -a your-app-name
```

## File Structure for Deployment

```
Project Root/
├── Procfile                 # Tells Heroku how to start the app
├── package.json            # Dependencies and scripts
├── server/
│   ├── index.js           # Main server file
│   └── routes.js          # API routes
├── dist/                  # Built frontend (created by npm run build)
├── .github/workflows/     # Auto-deployment configuration
└── uploads/               # File uploads (created automatically)
```

## Security Checklist

- ✅ JWT_SECRET is secure and unique
- ✅ Database credentials are not in code
- ✅ CORS is properly configured
- ✅ Environment variables are set in Heroku
- ✅ MongoDB Atlas IP whitelist is configured

## Performance Tips

1. **Enable Compression:**
   - Already handled by Heroku's routing layer

2. **Static File Caching:**
   - Heroku automatically handles static file caching

3. **Database Indexing:**
   - Ensure MongoDB has proper indexes for queries

4. **Monitor Performance:**
   ```bash
   heroku addons:create papertrail -a your-app-name
   ```

## Next Steps After Deployment

1. Set up custom domain (optional)
2. Configure SSL certificate (automatic with Heroku)
3. Set up monitoring and alerts
4. Configure backups for MongoDB
5. Set up staging environment 