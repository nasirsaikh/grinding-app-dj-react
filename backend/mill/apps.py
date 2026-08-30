from django.apps import AppConfig
class MillConfig(AppConfig):
    default_auto_field='django.db.models.BigAutoField'
    name='backend.mill'
    def ready(self):
        from . import admin_extra
