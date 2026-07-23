# 1. Connection Sync Cloud Tasks Queue (連線同步任務佇列)
resource "google_cloud_tasks_queue" "connection_sync_queue" {
  name     = "connection-sync-queue"
  location = var.region

  rate_limits {
    max_dispatches_per_second = 10
    max_concurrent_dispatches = 20
  }

  retry_config {
    max_attempts       = 5
    min_backoff        = "5s"
    max_backoff        = "300s"
    max_doublings      = 3
  }
}

# 2. Query Execution Cloud Tasks Queue (BigQuery SQL 查詢與導出佇列)
resource "google_cloud_tasks_queue" "query_execution_queue" {
  name     = "query-execution-queue"
  location = var.region

  rate_limits {
    max_dispatches_per_second = 5
    max_concurrent_dispatches = 10
  }

  retry_config {
    max_attempts       = 3
    min_backoff        = "10s"
    max_backoff        = "600s"
    max_doublings      = 3
  }
}

# 3. Client Dataset Creation Queue (Client Dataset 開闢佇列)
resource "google_cloud_tasks_queue" "client_dataset_queue" {
  name     = "client-dataset-queue"
  location = var.region

  rate_limits {
    max_dispatches_per_second = 5
    max_concurrent_dispatches = 5
  }

  retry_config {
    max_attempts       = 3
    min_backoff        = "5s"
    max_backoff        = "60s"
  }
}
