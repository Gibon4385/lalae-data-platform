from django.urls import path
from . import views

urlpatterns = [
    path("sync-connection/", views.sync_connection_webhook, name="cloud_task_sync_connection"),
    path("run-query/", views.run_query_webhook, name="cloud_task_run_query"),
    path("create-client-dataset/", views.create_client_dataset_webhook, name="cloud_task_create_client_dataset"),
    path("periodic-sync/", views.periodic_sync_webhook, name="cloud_scheduler_periodic_sync"),
]
