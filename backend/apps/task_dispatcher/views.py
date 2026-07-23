import json
import logging
import os
from django.conf import settings
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny

logger = logging.getLogger(__name__)

TASK_RUNNER_SECRET = getattr(
    settings,
    "TASK_RUNNER_SECRET",
    os.getenv("TASK_RUNNER_SECRET", "lalae-secret-key-change-me")
)


def _validate_secret(request):
    """
    驗證來自 Cloud Tasks / Cloud Scheduler 的 Header 祕密，防止未授權的外部請求觸發任務
    """
    received_secret = request.headers.get("X-Task-Runner-Secret") or request.headers.get("X-Cloud-Scheduler-Secret")
    
    # 也支援 GCP Cloud Tasks 內建的 Header 特徵
    is_gcp_internal = bool(request.headers.get("X-AppEngine-QueueName") or request.headers.get("X-CloudTasks-QueueName"))
    
    if received_secret == TASK_RUNNER_SECRET or is_gcp_internal:
        return True
        
    logger.warning("Unauthorized task runner webhook attempt: missing or invalid secret header.")
    return False


@csrf_exempt
@api_view(["POST"])
@permission_classes([AllowAny])
def sync_connection_webhook(request):
    """
    Cloud Tasks Webhook：執行資料連線同步任務
    """
    if not _validate_secret(request):
        return JsonResponse({"error": "Unauthorized"}, status=403)

    try:
        data = json.loads(request.body.decode("utf-8")) if request.body else request.data
        connection_id = data.get("connection_id")
        user_id = data.get("user_id")
        execution_id = data.get("execution_id")

        if not connection_id:
            return JsonResponse({"error": "connection_id is required"}, status=400)

        logger.info(f"[Cloud Tasks Webhook] Starting sync for connection_id: {connection_id}")
        
        # 直接執行同步邏輯 (重用 existing task 功能)
        from apps.connections.tasks import sync_connection_data_task
        # 使用 .apply() 或同步執行 task 函式
        result = sync_connection_data_task(connection_id, user_id=user_id, execution_id=execution_id)
        
        return JsonResponse({"status": "success", "connection_id": connection_id, "result": str(result)})
    except Exception as e:
        logger.error(f"[Cloud Tasks Webhook Error] sync_connection: {str(e)}", exc_info=True)
        return JsonResponse({"status": "error", "message": str(e)}, status=500)


@csrf_exempt
@api_view(["POST"])
@permission_classes([AllowAny])
def run_query_webhook(request):
    """
    Cloud Tasks Webhook：執行 BigQuery SQL 查詢與導出任務
    """
    if not _validate_secret(request):
        return JsonResponse({"error": "Unauthorized"}, status=403)

    try:
        data = json.loads(request.body.decode("utf-8")) if request.body else request.data
        execution_id = data.get("execution_id")

        if not execution_id:
            return JsonResponse({"error": "execution_id is required"}, status=400)

        logger.info(f"[Cloud Tasks Webhook] Starting SQL query for execution_id: {execution_id}")

        from apps.queries.tasks import run_bigquery_query_task
        result = run_bigquery_query_task(execution_id)

        return JsonResponse({"status": "success", "execution_id": execution_id, "result": str(result)})
    except Exception as e:
        logger.error(f"[Cloud Tasks Webhook Error] run_query: {str(e)}", exc_info=True)
        return JsonResponse({"status": "error", "message": str(e)}, status=500)


@csrf_exempt
@api_view(["POST"])
@permission_classes([AllowAny])
def create_client_dataset_webhook(request):
    """
    Cloud Tasks Webhook：建立 Client BigQuery Dataset 與預設資料表
    """
    if not _validate_secret(request):
        return JsonResponse({"error": "Unauthorized"}, status=403)

    try:
        data = json.loads(request.body.decode("utf-8")) if request.body else request.data
        dataset_id = data.get("dataset_id")
        user_id = data.get("user_id")

        if not dataset_id:
            return JsonResponse({"error": "dataset_id is required"}, status=400)

        logger.info(f"[Cloud Tasks Webhook] Creating BigQuery dataset: {dataset_id}")

        from apps.clients.tasks import create_bigquery_dataset_and_tables_task
        result = create_bigquery_dataset_and_tables_task(dataset_id, user_id)

        return JsonResponse({"status": "success", "dataset_id": dataset_id, "result": str(result)})
    except Exception as e:
        logger.error(f"[Cloud Tasks Webhook Error] create_client_dataset: {str(e)}", exc_info=True)
        return JsonResponse({"status": "error", "message": str(e)}, status=500)


@csrf_exempt
@api_view(["GET", "POST"])
@permission_classes([AllowAny])
def periodic_sync_webhook(request):
    """
    Cloud Scheduler Webhook：定時檢查並發起同步任務（替代 Celery Beat）
    """
    if not _validate_secret(request):
        return JsonResponse({"error": "Unauthorized"}, status=403)

    try:
        logger.info("[Cloud Scheduler Webhook] Running periodic sync scheduler...")

        from apps.connections.tasks import schedule_periodic_syncs_task
        result = schedule_periodic_syncs_task()

        return JsonResponse({"status": "success", "result": str(result)})
    except Exception as e:
        logger.error(f"[Cloud Scheduler Webhook Error] periodic_sync: {str(e)}", exc_info=True)
        return JsonResponse({"status": "error", "message": str(e)}, status=500)
