# 服務帳號：用於 Cloud Tasks 與 Cloud Scheduler 的安全呼叫
resource "google_service_account" "task_invoker_sa" {
  account_id   = "lalae-task-invoker-sa"
  display_name = "LaLaE Task Invoker Service Account"
  description  = "Service Account for Cloud Tasks & Cloud Scheduler to trigger Cloud Run webhooks"
}

# 賦予對應角色
resource "google_project_iam_member" "cloud_tasks_enqueuer" {
  project = var.project_id
  role    = "roles/cloudtasks.enqueuer"
  member  = "serviceAccount:${google_service_account.task_invoker_sa.email}"
}

resource "google_project_iam_member" "cloud_tasks_viewer" {
  project = var.project_id
  role    = "roles/cloudtasks.viewer"
  member  = "serviceAccount:${google_service_account.task_invoker_sa.email}"
}
