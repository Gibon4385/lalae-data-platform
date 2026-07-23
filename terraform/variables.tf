variable "project_id" {
  type        = string
  description = "GCP Project ID (e.g. lalae-data-platform)"
}

variable "region" {
  type        = string
  description = "GCP Deployment Region"
  default     = "asia-east1"
}

variable "cloud_run_url" {
  type        = string
  description = "The deployed Cloud Run Web API URL (e.g. https://lalae-web-302883063343.asia-east1.run.app)"
}

variable "task_runner_secret" {
  type        = string
  description = "Secret key for authenticating Cloud Tasks / Cloud Scheduler HTTP Webhooks"
  sensitive   = true
  default     = "lalae-secret-key-change-me"
}

variable "periodic_sync_cron" {
  type        = string
  description = "Cron expression for Cloud Scheduler periodic sync job"
  default     = "* * * * *"
}

variable "container_image" {
  type        = string
  description = "Docker image for Cloud Run Web API"
  default     = "gcr.io/google-samples/hello-app:1.0"
}

