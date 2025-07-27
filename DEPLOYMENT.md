# Production Deployment Guide

## Environment Variables Setup

For production deployment, you need to set the following environment variables securely:

### Required Environment Variables

1. **Database Configuration**
   ```bash
   DATABASE_URL="postgresql://user:password@host:port/database?pgbouncer=true&connect_timeout=15"
   DIRECT_URL="postgresql://user:password@host:port/database"
   ```

2. **Authentication**
   ```bash
   AUTH_SECRET="your_secure_random_secret_here"
   NEXTAUTH_URL="https://yourdomain.com"
   ```

3. **Google OAuth**
   ```bash
   AUTH_GOOGLE_ID="your_google_client_id.apps.googleusercontent.com"
   AUTH_GOOGLE_SECRET="your_google_client_secret"
   ```

### Security Best Practices

1. **Never commit `.env` files** - They're already in `.gitignore`
2. **Use secure random secrets** - Generate with: `openssl rand -base64 32`
3. **Use environment variables** in your deployment platform (Vercel, Railway, etc.)
4. **Keep `.env.example` updated** for new team members

### Deployment Platforms

#### Vercel
1. Add environment variables in your Vercel dashboard
2. Set `NEXTAUTH_URL` to your production domain
3. Vercel automatically uses `VERCEL_URL` if `NEXTAUTH_URL` is not set

#### Railway/Render/Other
1. Add environment variables in your platform's dashboard
2. Ensure database URLs point to your production database
3. Update `NEXTAUTH_URL` to match your production domain

### Database Migration

For production deployments:

```bash
# Apply migrations
npx prisma migrate deploy

# Generate client
npx prisma generate
```

### Security Checklist

- [ ] All sensitive data is in environment variables
- [ ] `.env` files are not committed to git
- [ ] Production database has proper access controls
- [ ] OAuth redirects are configured for production domain
- [ ] HTTPS is enabled for production site

## Local Development

Use the `.env.example` file as a template:

```bash
cp .env.example .env
# Then fill in your actual values
```
