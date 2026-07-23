# Cloud Run Web API Service 部署資源
resource "google_cloud_run_v2_service" "web_api" {
  name     = "lalae-web"
  location = var.region
  ingress  = "INGRESS_TRAFFIC_ALL"

  template {
    scaling {
      min_instance_count = 0
      max_instance_count = 10
    }

    containers {
      image = var.container_image

      ports {
        container_port = 8080
      }

      resources {
        limits = {
          cpu    = "1000m"
          memory = "512Mi"
        }
      }

      env {
        name  = "GOOGLE_CLOUD_PROJECT_ID"
        value = var.project_id
      }
      env {
        name  = "TASK_RUNNER_SECRET"
        value = var.task_runner_secret
      }
      env {
        name  = "ENABLE_CLOUD_TASKS"
        value = "true"
      }
      env {
        name  = "SUPABASE_DATABASE_PASSWORD"
        value = var.supabase_database_password
      }
    }
  }
}

# 允許公開/無障礙訪問 Cloud Run Web API（若需驗證可透過應用程式層或 IAM）
resource "google_cloud_run_v2_service_iam_member" "public_invoker" {
  location = google_cloud_run_v2_service.web_api.location
  name     = google_cloud_run_v2_service.web_api.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}
