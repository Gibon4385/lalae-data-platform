# LaLaE 行銷資料自動化平台 (LaLaE Data Platform)

[English](./README.md) | [繁體中文](./README_ZH.md) | [日本語](./README_JA.md)

[![Live Demo](https://img.shields.io/badge/Live_Demo-Vercel-orange?style=for-the-badge&logo=vercel)](https://v0-data-platform-test.vercel.app/)
[![GCP Architecture](https://img.shields.io/badge/GCP-Serverless-blue?style=for-the-badge&logo=googlecloud)](https://cloud.google.com/)

> **專為行銷與數據團隊打造的一站式 ETL 資料流水線平台**  
> 自動串接多渠道廣告 API、彈性自訂擷取欄位、運用 BigQuery SQL 清理與轉換資料，並自動排程輸出至 Google Sheets，達成數據運營全自動化。

---

## 🌟 核心功能與價值 (Key Features & Business Value)

* 🔗 **跨渠道 API 自動串接**：支援 **Google Ads**、**Facebook Ads** 與 **Google Sheets** 資料源授權與自動同步。
* 🎯 **彈性自訂資料指標**：使用者可依需求自由勾選分析層級 (Insights Level) 以及所需的欄位 (Fields)、指標 (Metrics) 與拆分項目 (Breakdowns)。
* ⚡ **SQL 資料清洗與轉換**：內建線上 SQL 編輯器，能在 BigQuery 巨量資料倉儲中直接執行 SQL 清理、過濾與跨平台資料合併。
* 🔄 **排程自動輸出至 Google Sheet**：支援設定 Cron 定時排程，自動將經過 SQL 清洗後的最新數據覆寫或附加寫入指定的 Google Sheet。

---

## ☁️ 雲端架構與技術亮點 (Cloud Infrastructure & Tech Stack)

本專案採用現代化 **全無伺服器 (100% Serverless)** 與 **基礎設施即程式碼 (IaC)** 架構，極大幅度降低運營維護成本與維護負擔：

```
[ 行銷 API / 表單 ] ──> [ GCP Cloud Run (Web API) ] ──> [ BigQuery (資料倉儲 & SQL 清洗) ] ──> [ Google Sheets ]
                              ▲              │
                     (Cron)   │              ▼  (Async Queue)
                     [ GCP Cloud Scheduler ]   [ GCP Cloud Tasks ]
```

* **雲端原生服務 (GCP)**：
  * **GCP Cloud Run**：自動縮放的 Serverless 容器服務，託管 Django 後端 API。
  * **GCP Cloud Tasks & Cloud Scheduler**：取代傳統 Celery/Redis 架構，達成雲端原生排程與非同步佇列處理。
  * **Google BigQuery**：作為巨量資料倉儲 (Data Warehouse) 與 SQL 計算引擎。
* **基礎設施即程式碼 (IaC)**：
  * **Terraform**：全自動化開闢並管理 GCP 佇列、排程任務與 IAM 權限。
* **全棧技術**：
  * **前端**：Next.js 14, React 18, TypeScript, Tailwind CSS, Ace SQL Editor (託管於 Vercel)
  * **後端**：Python 3.11, Django 5, Django REST Framework, JWT Authentication

---

## 🚀 30 秒快速體驗 Demo (Quick Local Demo Guide)

專案內建 **全功能 Mock 模式 (Zero Backend Dependency)**，**無需安裝 Python、Django 或設定 GCP/資料庫**，下載後即可直接體驗完整 UI 互動與 ETL 流水線設定！

### 快速啟動步驟

```bash
# 1. 複製 GitHub 專案
git clone https://github.com/Gibon4385/lalae-data-platform.git
cd lalae-data-platform/frontend

# 2. 複製 Mock 環境變數範本
cp .env.example .env

# 3. 安裝前端套件並啟動開發伺服器
npm install
npm run dev
```

### 🎯 體驗方式
1. 開啟瀏覽器造訪 `http://localhost:3000`。
2. 在登入頁面**輸入任意 Email 與密碼**即可直接通過驗證登入。
3. 進入平台即可體驗：
   * **客戶與資料連線管理**：新增 Google Ads / Facebook Ads 連線並體驗欄位與層級設定。
   * **SQL 查詢編輯與執行**：體驗線上 SQL 編輯器與歷史執行紀錄。

> ⚠️ **Demo 模式說明與限制 (Demo Mode Limitations)**  
> 預設的本地 Demo 模式 (`NEXT_PUBLIC_USE_MOCK=true`) 旨在提供快速完整的 UI 介面與設定流程展示。由於未運行本地後端服務且未配置實際金鑰與環境變數，此模式下**無法發送真實 API 請求至第三方平台（如 Google Ads API、Meta API 或 BigQuery）與執行資料寫入**。若需測試真實資料傳輸，請參閱部署手冊配置正式環境與後端 API。

---

## 🛠️ 正式雲端部署概述 (Production Deployment Overview)

若欲發佈至真實雲端環境（連線真實 Google Ads / Facebook API / Supabase / BigQuery），請參考以下步驟：

### 1. 🗄️ 資料庫設定 (Supabase / PostgreSQL)
* 新使用者**無需依賴任何歷史資料庫備份檔**。只需在 [Supabase](https://supabase.com) 創建新的 PostgreSQL 資料庫，取得連線密碼後寫入 `backend/.env`。
* 執行 Django Migration 指令，系統會自動在全新資料庫中開闢所有所需資料表與結構：
  ```bash
  python manage.py migrate
  python manage.py createsuperuser
  ```

### 2. ☁️ GCP 專案與基礎設施 (GCP & Terraform)
* 建立 GCP Project，啟用 Cloud Run、Cloud Tasks、Cloud Scheduler 與 BigQuery API。
* 切換至 `terraform/` 目錄，配置 `terraform.tfvars` 後執行：
  ```bash
  terraform init
  terraform apply
  ```
  *(一鍵自動建立 Cloud Run 服務、3 個 Cloud Tasks 佇列、Cloud Scheduler 觸發器與 IAM 存取權限)*

### 3. 🚀 後端與前端上線
* **後端打包**：使用 GCP Cloud Build 打包 Docker 映像檔並部署至 Cloud Run。
* **前端發佈**：在前端 `.env` 中設定 `NEXT_PUBLIC_USE_MOCK=false` 並將 `NEXT_PUBLIC_API_URL` 指向 Cloud Run 服務網址，推播至 Vercel 即可完成全自動化生產環境上線！
