from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include([
        path('', include('apps.users.urls')),
        path('fields/', include('apps.fields.urls')),
        path('plants/', include('apps.plants.urls')),
        path('dashboard/', include('apps.dashboard.urls')),
    ])),
]
