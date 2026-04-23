from django.contrib import admin
from django.urls import path, include
from django.http import HttpResponse

def root_ping(request):
    html = """
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Smart Season API</title>
        <style>
            body { font-family: system-ui, -apple-system, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background-color: #f8fafc; color: #0f172a; }
            .card { text-align: center; padding: 2rem; background: white; border-radius: 1rem; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); border: 1px solid #e2e8f0; }
            h1 { color: #16a34a; margin-top: 0; }
            p { color: #64748b; margin-bottom: 0; }
        </style>
    </head>
    <body>
        <div class="card">
            <h1>🌱 Server is up and running!</h1>
            <p>The Smart Season Backend API is globally active and listening.</p>
        </div>
    </body>
    </html>
    """
    return HttpResponse(html)

urlpatterns = [
    path('', root_ping, name='root-ping'),
    path('admin/', admin.site.urls),
    path('api/', include([
        path('', include('apps.users.urls')),
        path('fields/', include('apps.fields.urls')),
        path('plants/', include('apps.plants.urls')),
        path('dashboard/', include('apps.dashboard.urls')),
    ])),
]
