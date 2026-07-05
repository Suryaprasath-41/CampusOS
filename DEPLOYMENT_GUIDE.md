# CampusOS Control Center — Production & Cloud Deployment Guide

This guide provides comprehensive, step-by-step instructions for deploying **CampusOS Control Center** to production using **Docker**, integrating with **Supabase PostgreSQL**, and hosting on **Microsoft Azure** with your custom domain.

---

## Table of Contents
1. [Supabase Database Integration](#1-supabase-database-integration)
2. [Docker & Docker Compose Deployment](#2-docker--docker-compose-deployment)
3. [Azure Online Deployment (App Service & Container Apps)](#3-azure-online-deployment)
4. [Custom Domain & SSL/TLS Setup on Azure](#4-custom-domain--ssltls-setup)
5. [Production Checklist & Security Best Practices](#5-production-checklist)

---

## 1. Supabase Database Integration

CampusOS is built with **Prisma ORM**, making it effortless to transition from the local SQLite development database to a cloud-hosted **Supabase PostgreSQL** instance.

### Step 1: Create a Supabase Project
1. Go to [supabase.com](https://supabase.com) and sign in.
2. Click **New Project**, select your organization, choose a project name (e.g., `CampusOS-Prod`), and set a strong database password.
3. Select a region closest to your users and click **Create new project**.

### Step 2: Retrieve Connection Strings
1. In your Supabase Dashboard, navigate to **Project Settings** $\rightarrow$ **Database**.
2. Scroll down to **Connection string** and select the **URI** tab.
3. You will need two URLs:
   - **Transaction Pooled URL (`DATABASE_URL`)**: Uses port `6543` with `?pgbouncer=true`. Essential for serverless and Next.js connections.
   - **Direct URL (`DIRECT_URL`)**: Uses port `5432`. Required by Prisma for running schema migrations (`prisma db push` / `prisma migrate`).

### Step 3: Configure Prisma Schema
Open [`prisma/schema.prisma`](file:///d:/CampusOS/prisma/schema.prisma) and update the `datasource db` block:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

### Step 4: Update Environment Variables
In your `.env` (or cloud environment variables):

```env
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].compute.amazonaws.com:5432/postgres"
```

### Step 5: Push Schema and Seed Database
Run the following terminal commands to push the schema to Supabase and seed initial data:

```bash
npx prisma db push
npx prisma generate
```

---

## 2. Docker & Docker Compose Deployment

CampusOS includes a multi-stage production [`Dockerfile`](file:///d:/CampusOS/Dockerfile) optimized for Next.js standalone output and a [`docker-compose.yml`](file:///d:/CampusOS/docker-compose.yml) file.

### Prerequisites
- Docker Engine & Docker Compose installed on your server or machine.

### Option A: Using Docker Compose (Recommended for VMs / VPS)
1. Ensure your `.env` file is configured with production values (`NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `DATABASE_URL`).
2. Run the application in detached mode:

```bash
docker-compose up -d --build
```
3. Check container logs:
```bash
docker-compose logs -f campusos
```
4. Access the portal at `http://localhost:3000` (or your server IP).

### Option B: Using Standard Docker Commands
```bash
# Build the production image
docker build -t campusos:latest .

# Run the container
docker run -d -p 3000:3000 \
  -e NODE_ENV=production \
  -e NEXTAUTH_URL=https://yourdomain.com \
  -e NEXTAUTH_SECRET=your-secure-secret-key \
  -e DATABASE_URL="your-supabase-postgres-url" \
  --name campusos-app \
  campusos:latest
```

---

## 3. Azure Online Deployment

You can deploy CampusOS to Microsoft Azure using either **Azure App Service (Linux Container)** or **Azure Container Apps (Serverless)**.

### Method A: Azure App Service (Web App for Containers) — Easiest Setup
1. **Push your Docker Image to Azure Container Registry (ACR) or Docker Hub**:
   ```bash
   # Login to Azure
   az login

   # Create a Resource Group and ACR
   az group create --name CampusOS-RG --location eastus
   az acr create --resource-group CampusOS-RG --name campusosacr --sku Basic

   # Build and Push image to ACR
   az acr login --name campusosacr
   docker tag campusos:latest campusosacr.azurecr.io/campusos:latest
   docker push campusosacr.azurecr.io/campusos:latest
   ```

2. **Create the Web App in Azure Portal**:
   - Navigate to Azure Portal $\rightarrow$ **Create a resource** $\rightarrow$ **Web App**.
   - Select **Publish: Docker Container** and **Operating System: Linux**.
   - Choose your App Service Plan (Basic B1 or higher recommended for 1GB+ RAM).
   - In the **Docker** tab, select **Single Container** and choose your container registry (`campusosacr.azurecr.io/campusos:latest`).
   - Click **Review + Create**.

3. **Configure Application Settings (Environment Variables)**:
   - Go to your newly created App Service $\rightarrow$ **Settings** $\rightarrow$ **Environment variables** $\rightarrow$ **App settings**.
   - Add the following variables:
     - `NODE_ENV` = `production`
     - `PORT` = `3000`
     - `WEBSITES_PORT` = `3000` (Tells Azure App Service which port the container listens on)
     - `DATABASE_URL` = `your-supabase-url`
     - `NEXTAUTH_URL` = `https://<your-app-name>.azurewebsites.net` (Update to custom domain later)
     - `NEXTAUTH_SECRET` = `your-32-char-random-secret`
   - Click **Apply** and **Restart** the app.

---

## 4. Custom Domain & SSL/TLS Setup on Azure

To serve CampusOS from your own custom domain (e.g., `https://campusos.youruniversity.edu` or `https://yourdomain.com`):

### Step 1: Add DNS Records with your Domain Registrar
Log in to your domain registrar (GoDaddy, Namecheap, Cloudflare, Route53) and create the following DNS records pointing to your Azure app:

| Type | Name / Host | Value / Target | TTL |
| :--- | :--- | :--- | :--- |
| **CNAME** | `www` (or subdomain like `portal`) | `<your-app-name>.azurewebsites.net` | 3600 |
| **TXT** | `asuid.www` | `[Azure Custom Domain Verification ID]` | 3600 |
| **A** *(root domain only)* | `@` | `[Azure App Service Virtual IP Address]` | 3600 |

*(Note: You can find the Verification ID and Virtual IP in Azure Portal under **Custom domains**).*

### Step 2: Bind Domain in Azure Portal
1. In your App Service page, go to **Settings** $\rightarrow$ **Custom domains**.
2. Click **+ Add custom domain**.
3. Select **All other domain services**, enter your domain name (e.g., `www.yourdomain.com`), and click **Validate**.
4. Once DNS records are verified by Azure, click **Add**.

### Step 3: Enable Free Managed SSL/TLS Certificate
1. In **Custom domains**, select your added domain and click **Add binding**.
2. Under **TLS/SSL type**, choose **SNI SSL**.
3. Under **Certificate**, select **Create App Service Managed Certificate** (Free automatic SSL provided by Microsoft Azure).
4. Toggle **HTTPS Only** to **On** at the top of the Custom domains page.

### Step 4: Update Auth Configuration
Update your App Settings environment variable `NEXTAUTH_URL` to your new HTTPS custom domain:
```env
NEXTAUTH_URL="https://www.yourdomain.com"
```
Restart the app service for changes to take effect.

---

## 5. Production Checklist

Before going live to students and faculty, ensure the following steps are completed:
- [x] **Theme & Visibility**: Verified light/dark mode contrast across all admin, faculty, and student portals.
- [ ] **Database Migration**: Switched Prisma provider to `postgresql` and connected to Supabase production pool.
- [ ] **Authentication Secrets**: Set a cryptographically secure `NEXTAUTH_SECRET` (do not use default/test keys).
- [ ] **HTTPS Enforcement**: Enabled HTTPS-only in Azure / Cloud proxy settings.
- [ ] **CORS & Allowed Origins**: Updated `allowedDevOrigins` or domain restrictions in `next.config.ts` if embedding via iframe or mobile wrapper.
- [ ] **Backup Strategy**: Enabled automatic point-in-time backups in your Supabase project dashboard.
