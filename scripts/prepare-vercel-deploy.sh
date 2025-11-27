#!/bin/bash

echo "Preparing files for Vercel deployment..."

# Build all clients first
echo "Building all clients..."
npm run build
if [ $? -ne 0 ]; then
    echo "ERROR: Build failed"
    exit 1
fi

# Create public directories
mkdir -p public/driver
mkdir -p public/admin

# Copy driver client from dist
echo "Copying driver client from dist..."
if [ -d "apps/baliku-driver-client/dist" ]; then
    cp -r apps/baliku-driver-client/dist/* public/driver/
else
    echo "WARNING: dist folder not found, copying from source..."
    cp -r apps/baliku-driver-client/* public/driver/
fi

# Copy admin client from dist
echo "Copying admin client from dist..."
if [ -d "apps/baliku-admin-client/dist" ]; then
    cp -r apps/baliku-admin-client/dist/* public/admin/
else
    echo "WARNING: dist folder not found, copying from source..."
    cp -r apps/baliku-admin-client/* public/admin/
fi

# Update API_BASE in driver client
echo "Updating API_BASE in driver client..."
sed -i.bak "s|const API_BASE = (location.hostname === 'localhost' \|\| location.hostname === '127.0.0.1') ? 'http://localhost:4000' : '';|const API_BASE = (location.hostname === 'localhost' || location.hostname === '127.0.0.1') ? 'http://localhost:4000' : '/api';|g" public/driver/scripts/app.js
rm -f public/driver/scripts/app.js.bak

# Update API_BASE in admin client
echo "Updating API_BASE in admin client..."
sed -i.bak "s|const API_BASE = (location.hostname === 'localhost' \|\| location.hostname === '127.0.0.1') ? 'http://localhost:4000' : '';|const API_BASE = (location.hostname === 'localhost' || location.hostname === '127.0.0.1') ? 'http://localhost:4000' : '/api';|g" public/admin/scripts/app.js
rm -f public/admin/scripts/app.js.bak

echo ""
echo "Done! Files are ready for Vercel deployment."
echo ""
echo "Next steps:"
echo "1. Setup environment variables in Vercel Dashboard"
echo "2. Run: vercel --prod"
echo ""

