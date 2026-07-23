# 1. 賦予 Service Account 管理與執行 BigQuery 的全域權限 (Data Editor & Job User)
resource "google_project_iam_member" "bigquery_admin" {
  project = var.project_id
  role    = "roles/bigquery.admin"
  member  = "serviceAccount:${google_service_account.task_invoker_sa.email}"
}

# 2. (可選) 系統預設的全域 BigQuery 日誌與系統資料集
resource "google_bigquery_dataset" "system_dataset" {
  dataset_id                  = "lalae_system_logs"
  friendly_name               = "LaLaE System Logs & Audit Dataset"
  description                 = "System-wide audit logs and monitoring dataset for LaLaE Data Platform"
  location                    = var.region
  default_table_expiration_ms = 7776000000 # 90 天自動清理舊 Log

  labels = {
    env     = "production"
    managed = "terraform"
  }
}
