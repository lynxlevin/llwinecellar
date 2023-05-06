from django.contrib import admin
from django.urls import include, path
from rest_framework import routers
from cellars.views import cellar_views


router = routers.DefaultRouter()
router.register(r"cellars", cellar_views.CellarViewSet)

urlpatterns = [
    path("api/", include(router.urls)),
    path("user/", include("users.urls")),
    path("admin/", admin.site.urls),
    # path("login", index_view, name="index"),
]
