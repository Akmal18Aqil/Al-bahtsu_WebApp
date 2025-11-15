
# Deployment

This document provides instructions on how to deploy the application.

## Recommended Hosting

We recommend using [Vercel](https://vercel.com) for deploying this application. Vercel is a cloud platform for static sites and Serverless Functions that fits perfectly with Next.js.

### Deploying to Vercel

1.  **Sign up for a Vercel account**: If you don't have one, sign up for a free account at [vercel.com](https://vercel.com).
2.  **Import your project**: Import your Git repository into Vercel.
3.  **Configure your project**: Vercel will automatically detect that you are using Next.js and will configure the project for you. You will need to add your environment variables to the Vercel project settings.
4.  **Deploy**: Click the "Deploy" button to deploy your application.

## Other Hosting Options

You can also deploy this application to other hosting providers that support Node.js. You will need to configure the build and start commands for your specific hosting provider.

### Build Command

```bash
npm run build
```

### Start Command

```bash
npm run start
```
