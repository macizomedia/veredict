# Production Readiness Checklist

## ✅ Security & Environment Variables

- [x] Database URLs moved from hardcoded to environment variables
- [x] `.env` file included in `.gitignore`
- [x] Environment variables properly validated in `src/env.js`
- [x] `.env.example` provided for team members

## 🔧 Configuration for Production

### Environment Variables Required

Set these in your production environment (Vercel, Railway, etc.):

```bash
# Database (replace with your production DB URLs)
DATABASE_URL="postgresql://user:password@host:port/database?pgbouncer=true&connect_timeout=15"
DIRECT_URL="postgresql://user:password@host:port/database"

# NextAuth (generate new secret for production)
AUTH_SECRET="generate_with_openssl_rand_base64_32"
NEXTAUTH_URL="https://yourdomain.com"

# Google OAuth (production app credentials)
AUTH_GOOGLE_ID="your_production_google_client_id.apps.googleusercontent.com"
AUTH_GOOGLE_SECRET="your_production_google_client_secret"
```

### Database Setup for Production

1. **Create Production Database**
   - Use a managed service (Supabase, PlanetScale, Railway DB, etc.)
   - Ensure it has proper backups and monitoring

2. **Run Migrations**
   ```bash
   npx prisma migrate deploy
   ```

3. **Generate Prisma Client**
   ```bash
   npx prisma generate
   ```

### Deployment Platform Setup

#### For Vercel:
1. Connect your GitHub repository
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main

#### For Railway:
1. Connect repository
2. Add environment variables in Railway dashboard
3. Deploy with automatic builds

#### For Other Platforms:
1. Build command: `pnpm build`
2. Start command: `pnpm start`
3. Node.js version: 18+

## 🔒 Security Considerations

### Google OAuth Setup
1. Create a new Google Cloud project for production
2. Configure OAuth consent screen
3. Add your production domain to authorized origins
4. Set authorized redirect URIs to: `https://yourdomain.com/api/auth/callback/google`

### Database Security
1. Use connection pooling for better performance
2. Enable SSL connections
3. Use read replicas if needed
4. Set up proper user permissions

### General Security
1. Enable HTTPS (automatic on Vercel/Railway)
2. Use secure session secrets
3. Keep dependencies updated
4. Monitor for security vulnerabilities

## 📊 Performance & Monitoring

### Recommendations
1. Enable database query logging in production
2. Set up error monitoring (Sentry, LogRocket, etc.)
3. Use analytics (PostHog, Google Analytics, etc.)
4. Monitor database performance
5. Set up uptime monitoring

### Build Optimization
- Next.js automatic optimizations are enabled
- Static generation where possible
- Image optimization ready (replace `<img>` with `<Image>`)

## 🚀 Deployment Commands

```bash
# Local development
pnpm dev

# Production build (test locally)
pnpm build
pnpm start

# Database operations
npx prisma migrate deploy  # Apply migrations in production
npx prisma generate        # Generate client
npx prisma studio         # View data (development only)
```

## ⚠️ Important Notes

1. **Never commit `.env` files** - they contain sensitive information
2. **Use different secrets for production** - generate new `AUTH_SECRET`
3. **Test build locally** before deploying with `pnpm build`
4. **Database migrations** should be run before deployment
5. **Monitor logs** after deployment for any issues

## 🔧 Troubleshooting

### Common Issues:
1. **Database connection issues**: Check DATABASE_URL format
2. **OAuth not working**: Verify redirect URIs and credentials
3. **Build failures**: Check TypeScript errors and dependencies
4. **Environment variables not loaded**: Ensure proper naming and format

### Debug Steps:
1. Check deployment logs
2. Verify environment variables are set
3. Test database connection
4. Verify OAuth configuration
5. Check Next.js build output
