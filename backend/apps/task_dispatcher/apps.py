from django.apps import AppConfig


class TaskDispatcherConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.task_dispatcher"
    verbose_name = "Task Dispatcher (GCP Cloud Tasks & Scheduler)"
