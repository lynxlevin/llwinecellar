from django.contrib import admin
from django.urls import include, path
from rest_framework import routers

from cellars.views import cellar_views
from wines.views import wine_region_views, wine_tag_views, wine_views

router = routers.DefaultRouter()
router.register(r"cellars", cellar_views.CellarViewSet)
router.register(r"wines", wine_views.WineViewSet)
router.register(r"wine_tags", wine_tag_views.WineTagViewSet)
router.register(r"wine_regions", wine_region_views.WineRegionViewSet)

urlpatterns = [
    path("api/", include(router.urls)),
    path("user/", include("users.urls")),
    path("admin/", admin.site.urls),
    # path("login", index_view, name="index"),
]
