output "connection_sync_queue_id" {
  value       = google_cloud_tasks_queue.connection_sync_queue.id
  description = "Resource ID of connection sync Cloud Tasks Queue"
}

output "query_execution_queue_id" {
  value       = google_cloud_tasks_queue.query_execution_queue.id
  description = "Resource ID of query execution Cloud Tasks Queue"
}

output "client_dataset_queue_id" {
  value       = google_cloud_tasks_queue.client_dataset_queue.id
  description = "Resource ID of client dataset creation Cloud Tasks Queue"
}

output "periodic_sync_scheduler_id" {
  value       = google_cloud_scheduler_job.periodic_sync_scheduler.id
  description = "Resource ID of Cloud Scheduler periodic sync job"
}

output "task_invoker_service_account_email" {
  value       = google_service_account.task_invoker_sa.email
  description = "Email of the task invoker service account"
}

output "cloud_run_service_uri" {
  value       = google_cloud_run_v2_service.web_api.uri
  description = "Deployed GCP Cloud Run Web API Service URL"
}

output "bigquery_system_dataset_id" {
  value       = google_bigquery_dataset.system_dataset.dataset_id
  description = "Dataset ID of the Terraform-managed system audit log dataset"
}

output "webhook_urls" {
  value = {
    sync_connection       = "${google_cloud_run_v2_service.web_api.uri}/task-runner/sync-connection/"
    run_query             = "${google_cloud_run_v2_service.web_api.uri}/task-runner/run-query/"
    create_client_dataset = "${google_cloud_run_v2_service.web_api.uri}/task-runner/create-client-dataset/"
    periodic_sync         = "${google_cloud_run_v2_service.web_api.uri}/task-runner/periodic-sync/"
  }
  description = "Configured Webhook URLs on Cloud Run"
}
