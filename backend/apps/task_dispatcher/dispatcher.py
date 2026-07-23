import json
import logging
import os
from django.conf import settings

logger = logging.getLogger(__name__)

# 判斷是否使用 GCP Cloud Tasks (預設可透過 .env 控制：ENABLE_CLOUD_TASKS=true)
ENABLE_CLOUD_TASKS = getattr(settings, "ENABLE_CLOUD_TASKS", os.getenv("ENABLE_CLOUD_TASKS", "false").lower() == "true")
TASK_RUNNER_SECRET = getattr(settings, "TASK_RUNNER_SECRET", os.getenv("TASK_RUNNER_SECRET", "lalae-secret-key-change-me"))
BACKEND_BASE_URL = getattr(settings, "BACKEND_BASE_URL", os.getenv("BACKEND_BASE_URL", "https://lalae-web-302883063343.asia-east1.run.app"))
GCP_LOCATION = getattr(settings, "GCP_LOCATION", os.getenv("GCP_LOCATION", "asia-east1"))
GCP_PROJECT = getattr(settings, "GOOGLE_CLOUD_PROJECT_ID", os.getenv("GOOGLE_CLOUD_PROJECT_ID", ""))


def _create_gcp_cloud_task(queue_name: str, endpoint_path: str, payload: dict):
    """
    使用 google-cloud-tasks Python SDK 將任務派發至 GCP Cloud Tasks
    """
    try:
        from google.cloud import tasks_v2
    except ImportError:
        logger.error("google-cloud-tasks is not installed. Fallback to Celery.")
        return False

    if not GCP_PROJECT:
        logger.warning("GOOGLE_CLOUD_PROJECT_ID not set. Cannot dispatch Cloud Task.")
        return False

    client = tasks_v2.CloudTasksClient()
    parent = client.queue_path(GCP_PROJECT, GCP_LOCATION, queue_name)

    url = f"{BACKEND_BASE_URL.rstrip('/')}{endpoint_path}"
    
    body = json.dumps(payload).encode("utf-8")
    
    task = {
        "http_request": {
            "http_method": tasks_v2.HttpMethod.POST,
            "url": url,
            "headers": {
                "Content-Type": "application/json",
                "X-Task-Runner-Secret": TASK_RUNNER_SECRET,
            },
            "body": body,
        }
    }

    response = client.create_task(request={"parent": parent, "task": task})
    logger.info(f"Successfully created Cloud Task: {response.name} for endpoint: {endpoint_path}")
    return True


def dispatch_connection_sync(connection_id: int, user_id: int = None, execution_id: int = None):
    """
    派發連線同步任務：若開啟 ENABLE_CLOUD_TASKS 則使用 GCP Cloud Tasks，否則回退使用 Celery .delay()
    """
    payload = {
        "connection_id": connection_id,
        "user_id": user_id,
        "execution_id": execution_id,
    }

    if ENABLE_CLOUD_TASKS:
        success = _create_gcp_cloud_task(
            queue_name="connection-sync-queue",
            endpoint_path="/task-runner/sync-connection/",
            payload=payload
        )
        if success:
            return

    # Fallback 至 Celery
    from apps.connections.tasks import sync_connection_data_task
    sync_connection_data_task.delay(connection_id, user_id=user_id, execution_id=execution_id)


def dispatch_query_execution(execution_id: int):
    """
    派發 BigQuery SQL 執行任務
    """
    payload = {"execution_id": execution_id}

    if ENABLE_CLOUD_TASKS:
        success = _create_gcp_cloud_task(
            queue_name="query-execution-queue",
            endpoint_path="/task-runner/run-query/",
            payload=payload
        )
        if success:
            return

    # Fallback 至 Celery
    from apps.queries.tasks import run_bigquery_query_task
    run_bigquery_query_task.delay(execution_id)


def dispatch_client_dataset_creation(dataset_id: str, user_id: int):
    """
    派發 Client BigQuery 資料集建立任務
    """
    payload = {"dataset_id": dataset_id, "user_id": user_id}

    if ENABLE_CLOUD_TASKS:
        success = _create_gcp_cloud_task(
            queue_name="client-dataset-queue",
            endpoint_path="/task-runner/create-client-dataset/",
            payload=payload
        )
        if success:
            return

    # Fallback 至 Celery
    from apps.clients.tasks import create_bigquery_dataset_and_tables_task
    create_bigquery_dataset_and_tables_task.delay(dataset_id, user_id)
