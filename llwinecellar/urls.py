import os

from django.contrib import admin
from django.urls import include, path
from rest_framework import routers

from cellars.views import cellar_views
from wine_memos.views import WineMemoViewSet
from wines.views import (GrapeMasterViewSet, WineRegionViewSet, WineTagViewSet,
                         WineViewSet)

router = routers.DefaultRouter()
router.register(r"cellars", cellar_views.CellarViewSet)
router.register(r"wines", WineViewSet)
router.register(r"wine_tags", WineTagViewSet)
router.register(r"wine_regions", WineRegionViewSet)
router.register(r"grape_masters", GrapeMasterViewSet)
router.register(r"wine_memos", WineMemoViewSet)

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
