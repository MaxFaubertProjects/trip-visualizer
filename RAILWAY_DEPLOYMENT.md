# Railway Deployment Guide

This guide will help you deploy your Trip Visualizer app to Railway.

## Prerequisites

1. Make sure you have a Railway account
2. Install Railway CLI (optional but recommended):
   ```bash
   npm install -g @railway/cli
   ```

## Deployment Steps

### Option 1: Deploy via Railway Dashboard (Recommended)

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Fix Railway deployment - add missing dependencies"
   git push origin main
   ```

2. **Connect to Railway**
   - Go to [railway.app](https://railway.app)
   - Sign in with your GitHub account
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

3. **Configure the deployment**
   - Railway will automatically detect this is a Node.js app
   - The build process will use the `package.json` and `package-lock.json` files
   - The start command is configured in `railway.json` as `npm start`

4. **Deploy**
   - Railway will automatically build and deploy your app
   - You can monitor the build process in the Railway dashboard
   - Once deployed, Railway will provide you with a URL

### Option 2: Deploy via Railway CLI

1. **Login to Railway**
   ```bash
   railway login
   ```

2. **Initialize Railway project**
   ```bash
   railway init
   ```

3. **Deploy**
   ```bash
   railway up
   ```

## Configuration Files

The following files are configured for Railway deployment:

- `package.json` - Contains all necessary dependencies and scripts
- `package-lock.json` - Locked dependency versions for consistent builds
- `railway.json` - Railway-specific configuration
- `Procfile` - Alternative start command specification

## Troubleshooting

### Common Issues

1. **Build fails with dependency errors**
   - Make sure `package-lock.json` is committed to your repository
   - Try running `npm install` locally to regenerate the lock file

2. **App doesn't start**
   - Check that the `start` script in `package.json` is correct
   - Verify that `railway.json` has the correct `startCommand`

3. **Port issues**
   - Railway automatically sets the `PORT` environment variable
   - React apps should use `process.env.PORT` (which they do by default)

### Environment Variables

Railway automatically provides:
- `PORT` - The port your app should listen on
- `NODE_ENV` - Set to "production"

## Monitoring

- Use the Railway dashboard to monitor your app's performance
- Check logs for any runtime errors
- Set up alerts for downtime

## Custom Domain

After deployment, you can:
1. Go to your project in Railway dashboard
2. Navigate to the "Settings" tab
3. Add a custom domain under "Domains"

## Support

If you encounter issues:
1. Check the Railway documentation: https://docs.railway.app
2. Review the build logs in the Railway dashboard
3. Ensure all dependencies are properly listed in `package.json` 