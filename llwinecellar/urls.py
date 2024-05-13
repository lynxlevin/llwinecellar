import os

from django.urls import include, path
from rest_framework import routers

from cellars.views import cellar_views
from wine_memos.views import WineMemoViewSet
from wines.views import GrapeMasterViewSet, WineRegionViewSet, WineTagViewSet, WineViewSet

router = routers.DefaultRouter()
router.register(r"cellars", cellar_views.CellarViewSet, basename="cellar")
router.register(r"wines", WineViewSet, basename="wine")
router.register(r"wine_tags", WineTagViewSet, basename="wine_tag")
router.register(r"wine_regions", WineRegionViewSet, basename="wine_region")
router.register(r"grape_masters", GrapeMasterViewSet, basename="grape_master")
router.register(r"wine_memos", WineMemoViewSet, basename="wine_memo")

urlpatterns = [
    path("api/", include(router.urls)),
    path("user/", include("users.urls")),
    # path("login", index_view, name="index"),
]

env = os.getenv("DJANGO_ENV")
if env == "local":
    from django.contrib.staticfiles.urls import staticfiles_urlpatterns

    urlpatterns += [path("silk/", include("silk.urls", namespace="silk"))]
    urlpatterns += staticfiles_urlpatterns()
