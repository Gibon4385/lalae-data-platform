# GCP Cloud Scheduler Job (替代 Celery Beat 定時觸發排程檢查)
resource "google_cloud_scheduler_job" "periodic_sync_scheduler" {
  name             = "lalae-periodic-sync-job"
  description      = "Triggers LaLaE periodic connection sync check via HTTP Webhook (replaces Celery Beat)"
  schedule         = var.periodic_sync_cron
  time_zone        = "Asia/Taipei"
  attempt_deadline = "180s"

  retry_config {
    retry_count = 3
  }

  http_target {
    http_method = "POST"
    uri         = "${google_cloud_run_v2_service.web_api.uri}/task-runner/periodic-sync/"
    
    headers = {
      "Content-Type"           = "application/json"
      "X-Task-Runner-Secret"   = var.task_runner_secret
      "X-Cloud-Scheduler-Secret" = var.task_runner_secret
    }

    body = base64encode(jsonencode({
      trigger_source = "cloud_scheduler"
    }))
  }
}
