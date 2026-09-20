#!/bin/bash
set -e

PORT="${PORT:-8080}"

# Setup nginx config with correct port
cp /etc/nginx/nginx.conf.template /etc/nginx/nginx.conf
sed -i "s/NGINX_PORT/$PORT/g" /etc/nginx/nginx.conf

# Create storage directories if missing
mkdir -p storage/framework/sessions
mkdir -p storage/framework/views
mkdir -p storage/framework/cache
mkdir -p storage/logs
mkdir -p bootstrap/cache

# Set permissions
chown -R www-data:www-data storage bootstrap/cache
chmod -R 775 storage bootstrap/cache

# Generate app key if not set
if [ -z "$APP_KEY" ] || [ "$APP_KEY" = "" ]; then
    php artisan key:generate --force
fi

# Cache configuration
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Run migrations
php artisan migrate --force

# Create storage link
php artisan storage:link --force 2>/dev/null || true

echo "=== Starting application on port $PORT ==="

# Start supervisord
exec /usr/bin/supervisord -c /etc/supervisord.conf
