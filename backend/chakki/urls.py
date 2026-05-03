from django.urls import path, include, re_path
from django.views.static import serve
from django.conf import settings
from django.contrib import admin
from .views import *

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("backend.mill.urls")),
    path("api/ui-translations/", ui_translations),
    re_path(r"^assets/(?P<path>.*)$",serve,{"document_root": settings.BASE_DIR / "frontend" / "dist" / "assets"},),
    re_path(r"^(?!api/|admin/|assets/).*$", react_app),
]