# LaLaE Data Platform - Terraform 基礎設施部署指南

本目錄包含使用 Terraform 自動化部署 GCP Cloud Tasks 與 GCP Cloud Scheduler 的 Infrastructure as Code (IaC) 設定。

---

## 包含的 GCP 資源

1. **GCP Cloud Run Service** (`cloud_run.tf`):
   - `lalae-web`: 部署 Web API 容器服務，設定 CPU/Memory 資源上限、自動擴展範圍與環境變數。
2. **GCP Cloud Tasks Queues** (`cloud_tasks.tf`):
   - `connection-sync-queue`: 處理廣告與表單連線的非同步同步任務。
   - `query-execution-queue`: 處理 BigQuery SQL 查詢與 Google Sheets 導出任務。
   - `client-dataset-queue`: 處理新 Client 的 BigQuery Dataset 自動開闢任務。
3. **GCP Cloud Scheduler Job** (`cloud_scheduler.tf`):
   - `lalae-periodic-sync-job`: 替代 Celery Beat，按 Cron 時間（預設每分鐘）向 Cloud Run 發送 HTTP Webhook，檢查並觸發排程同步。
4. **GCP Service Account & IAM** (`iam.tf`):
   - 建立安全的服務帳號 `lalae-task-invoker-sa`。
5. **GCP BigQuery Infrastructure** (`bigquery.tf`):
   - 授予 Service Account 對於全域 BigQuery 的 `roles/bigquery.admin` 操作權限。
   - (可選) 部署全域系統審計日誌資料集 `lalae_system_logs`（設定 90 天自動清理舊 Log）。

---

## 使用步驟

### 1. 準備 Terraform 設定檔
複製範例檔並填入您的 GCP Project ID 與 Cloud Run 網址：

```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars
```

編輯 `terraform.tfvars`：
```hcl
project_id          = "lalae-data-platform"
region              = "asia-east1"
cloud_run_url       = "https://lalae-web-302883063343.asia-east1.run.app"
task_runner_secret  = "your-custom-secure-secret-key"
periodic_sync_cron  = "* * * * *"
```

### 2. 初始化並佈署
```bash
terraform init
terraform plan
terraform apply
```

---

## 如何切換 Celery 與 GCP Cloud Tasks 模式？

本專案採用**完全無損、雙軌並存**設計，原本的 Celery 代碼與檔案一律保留：

1. **若要切換為 GCP Cloud Tasks / Scheduler 模式**：
   在 Django 後端 `.env` 中設定：
   ```env
   ENABLE_CLOUD_TASKS=true
   TASK_RUNNER_SECRET=your-custom-secure-secret-key
   ```
   此時呼叫 `dispatch_connection_sync()` 將會優先向 GCP Cloud Tasks 派發任務。

2. **若要維持/回退至 Celery 模式**：
   在 `.env` 中將 `ENABLE_CLOUD_TASKS` 設為 `false`（或不設定），系統會自動回退至 Celery `.delay()` 的運作機制。
