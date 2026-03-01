# Deploy to Google Cloud Platform (Cloud Run)

## Prerequisites

```bash
# Install gcloud CLI
# https://cloud.google.com/sdk/docs/install

# Login
gcloud auth login

# Set project
gcloud config set project YOUR_PROJECT_ID
```

## Build and Deploy

```bash
# From the api directory
cd /home/iano/workspace/two-rivers/api

# Deploy to Cloud Run (one command!)
gcloud run deploy doba-api \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars ADMIN_API_KEY=your-production-key-here,NODE_ENV=production \
  --max-instances 10 \
  --memory 512Mi \
  --cpu 1
```

## Custom Domain

```bash
# Map custom domain
gcloud run domain-mappings create \
  --service doba-api \
  --domain api.dobamusic.com \
  --region us-central1

# Get verification record (add to your DNS)
gcloud run domain-mappings describe \
  --domain api.dobamusic.com \
  --region us-central1
```

## Update Environment Variables

```bash
gcloud run services update doba-api \
  --update-env-vars ADMIN_API_KEY=new-key \
  --region us-central1
```

## View Logs

```bash
gcloud run services logs read doba-api --region us-central1
```

## Pricing Estimate

- **Free tier**: 2 million requests/month
- **After free tier**: $0.40 per million requests
- **Memory**: $0.0000025 per GB-second
- **CPU**: $0.00002400 per vCPU-second

**Monthly cost for 100k requests**: ~$0 (within free tier)

## Service URL

After deployment:
```
https://doba-api-RANDOM.a.run.app
```

Update your smart contract base URI to:
```
https://doba-api-RANDOM.a.run.app/metadata/
```

Or with custom domain:
```
https://api.dobamusic.com/metadata/
```
