<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1JS0wr1Wt3owZ1HA3Z150bO523ucOhpPv

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Deploy to Vercel

To deploy this application to Vercel professionally:

1. **Install Vercel CLI (Optional but recommended):**
   `npm i -g vercel`
2. **Login to Vercel:**
   `vercel login`
3. **Deploy:**
   Run `vercel` in the root of the project and follow the prompts.
4. **Environment Variables:**
   During deployment (or in the Vercel Dashboard), ensure you add the following environment variable:
   - `GEMINI_API_KEY`: Your Google Gemini API Key.

### Professional Configuration Included:
- **SPA Routing**: Configured in `vercel.json` to handle all routes correctly.
- **Optimized Upload**: `.vercelignore` ensures only necessary files are uploaded.
