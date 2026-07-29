# LaLaE Data Platform

[English](./README.md) | [繁體中文](./README_ZH.md) | [日本語](./README_JA.md)

[![Live Demo](https://img.shields.io/badge/Live_Demo-Vercel-orange?style=for-the-badge&logo=vercel)](https://v0-data-platform-test.vercel.app/)
[![GCP Architecture](https://img.shields.io/badge/GCP-Serverless-blue?style=for-the-badge&logo=googlecloud)](https://cloud.google.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](./LICENSE)

> **An All-in-One Automated ETL Data Pipeline Platform for Marketing & Data Teams**  
> Connect multi-channel ad APIs, customize requested fields and metrics, clean and transform data with BigQuery SQL, and automatically export scheduled results to Google Sheets.

---

## 🌟 Key Features & Business Value

* 🔗 **Automated Cross-Channel API Integration**: Securely connect and sync data from **Google Ads**, **Facebook Ads**, and **Google Sheets**.
* 🎯 **Flexible Metric & Field Selection**: Customize Insights Levels, Fields, Metrics, Breakdowns, and Action Breakdowns to pull exactly what you need.
* ⚡ **SQL Data Cleaning & Transformation**: Built-in SQL editor powered by Google BigQuery data warehouse for filtering, cleaning, and joining multi-platform data.
* 🔄 **Automated Export & Scheduling**: Schedule cron sync jobs to automatically overwrite or append clean SQL query results into specified Google Sheets.

---

## ☁️ Cloud Infrastructure & Tech Stack

Built on a modern **100% Serverless** architecture and managed via **Infrastructure as Code (IaC)** for minimum maintenance and operational costs:

```
[ Marketing APIs / Sheets ] ──> [ GCP Cloud Run (Web API) ] ──> [ BigQuery Warehouse & SQL ] ──> [ Google Sheets ]
                                       ▲              │
                              (Cron)   │              ▼  (Async Queue)
                              [ GCP Cloud Scheduler ]   [ GCP Cloud Tasks ]
```

* **GCP Serverless Infrastructure**:
  * **GCP Cloud Run**: Auto-scaling containerized API service.
  * **GCP Cloud Tasks & Cloud Scheduler**: Replaced legacy Celery/Redis for cloud-native queue processing and cron scheduling.
  * **Google BigQuery**: Enterprise data warehouse and SQL query engine.
* **Infrastructure as Code (IaC)**:
  * **Terraform**: Provisioning Cloud Tasks queues, Cloud Scheduler jobs, and IAM roles.
* **Full-Stack Technology**:
  * **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS, Ace SQL Editor (Hosted on Vercel)
  * **Backend**: Python 3.11, Django 5, Django REST Framework, JWT Authentication

---

## 🚀 30-Second Quick Local Demo Guide

The repository includes a **Zero-Backend-Dependency Mock Mode**. You don't need Python, Django, GCP credentials, or PostgreSQL setup to explore the entire UI and ETL workflow!

### Quick Start Steps

```bash
# 1. Clone GitHub Repository
git clone https://github.com/Gibon4385/lalae-data-platform.git
cd lalae-data-platform/frontend

# 2. Setup Mock Environment File
cp .env.example .env

# 3. Install Dependencies and Run Dev Server
npm install
npm run dev
```

### 🎯 Demo Instructions
1. Open your browser and navigate to `http://localhost:3000`.
2. On the login page, **enter any email and password** to log in automatically.
3. Explore the full platform:
   * **Client & Connection Wizard**: Create Google Ads / Facebook Ads connections and experience field/level selection.
   * **SQL Query Editor**: Test the live SQL editor, history logs, and export settings.

> ⚠️ **Demo Mode Limitations**  
> The default local demo mode (`NEXT_PUBLIC_USE_MOCK=true`) is designed for fast UI/UX demonstration. Without a running backend or cloud credentials, it **does not send live API requests to external platforms (Google Ads API, Meta API, or BigQuery)**. For production deployment details, see below.

---

## 🛠️ Production Deployment Overview

To deploy to production with real Google Ads / Facebook / BigQuery integrations:

### 1. 🗄️ Database Setup (Supabase / PostgreSQL)
* No historical database backup file is needed. Create a fresh PostgreSQL instance on [Supabase](https://supabase.com), copy credentials to `backend/.env`, and run:
  ```bash
  python manage.py migrate
  python manage.py createsuperuser
  ```

### 2. ☁️ GCP Setup (Terraform)
* Enable Cloud Run, Cloud Tasks, Cloud Scheduler, and BigQuery APIs.
* Configure `terraform/terraform.tfvars` and run:
  ```bash
  terraform init
  terraform apply
  ```

### 3. 🚀 Application Deployment
* **Backend**: Build and deploy container image to GCP Cloud Run via Cloud Build.
* **Frontend**: Set `NEXT_PUBLIC_USE_MOCK=false` and point `NEXT_PUBLIC_API_URL` to your Cloud Run URL, then deploy to Vercel.

### 4. 🔑 Third-Party API Credentials & OAuth Tokens Summary
When connecting to production APIs, configure the following in `backend/.env`:
* **Google Ads**: Requires `GOOGLE_ADS_DEVELOPER_TOKEN` and OAuth Client ID/Secret. Tokens (Access & Refresh) are managed automatically after user authorization.
* **Facebook Ads**: Requires `FACEBOOK_APP_ID` and `FACEBOOK_APP_SECRET` (Meta App Credentials) for OAuth account access.
* **Google Sheets**: Requires sharing the target Google Sheet with the designated GCP Service Account Email (as Editor) for SQL data reading and export.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.


