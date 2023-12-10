from django.contrib import admin
from django.urls import include, path
from rest_framework import routers

from cellars.views import cellar_views
from wines.views import GrapeMasterViewSet, WineRegionViewSet, WineTagViewSet, WineViewSet

router = routers.DefaultRouter()
router.register(r"cellars", cellar_views.CellarViewSet)
router.register(r"wines", WineViewSet)
router.register(r"wine_tags", WineTagViewSet)
router.register(r"wine_regions", WineRegionViewSet)
router.register(r"grape_masters", GrapeMasterViewSet)

urlpatterns = [
    path("api/", include(router.urls)),
    path("user/", include("users.urls")),
    path("admin/", admin.site.urls),
    # path("login", index_view, name="index"),
]
