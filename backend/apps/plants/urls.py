from rest_framework.routers import DefaultRouter
from .views import PlantViewSet

router = DefaultRouter()
router.register('', PlantViewSet, basename='plants')

urlpatterns = router.urls
