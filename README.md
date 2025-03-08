# WORKWISE AI - Freelance Marketplace

An AI-powered freelance marketplace that connects skilled freelancers with exciting projects.

In the project settings:
Framework Preset: Next.js
Build Command: next build
Output Directory: .next
Install Command: npm install
Development Command: next dev

NEXT_PUBLIC_SUPABASE_URL=https://hzaoxrubaprshvidnzig.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh6YW94cnViYXByc2h2aWRuemlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEzNjU1MzMsImV4cCI6MjA1Njk0MTUzM30.0eVbnOXItbc6BM5RVRks31shR3WsuTSgRAzBp4LIiKo
NEXT_PUBLIC_APP_URL=[your-vercel-url] # You'll get this after deployment
SUPABASE_SERVICE_ROLE_KEY=[your-service-role-key]
## Features

- AI-powered matching system
- User authentication with Supabase
- Real-time messaging
- Project management tools
- Secure payment integration
- Modern, responsive UI

## Tech Stack

- Next.js 14
- TypeScript
- Tailwind CSS
- Supabase
- Vercel Analytics

## Getting Started

1. Clone the repository:
```bash
git clone <your-repo-url>
cd HustleHubAI
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory with the following variables:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Application
NEXT_PUBLIC_APP_URL=your_app_url

# Optional - for production
NEXT_PUBLIC_VERCEL_ENV=production
NEXT_PUBLIC_VERCEL_URL=${NEXT_PUBLIC_APP_URL}
```

4. Run the development server:
```bash
npm run dev
```

## Deployment

### Deploy on Vercel (Recommended)

The easiest way to deploy this app is to use the [Vercel Platform](https://vercel.com/new).

1. Push your code to a GitHub repository
2. Import your repository on Vercel
3. Add your environment variables in the Vercel project settings
4. Deploy!

Vercel will automatically detect that you're using Next.js and will enable the correct settings for your deployment.

## Environment Variables

Make sure to set up these environment variables in your Vercel project settings:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_APP_URL`

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details
