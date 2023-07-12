from django.contrib import admin
from django.urls import include, path
from rest_framework import routers

from cellars.views import cellar_views
from user_preferences.views import user_preference_views
from wines.views import wine_views

router = routers.DefaultRouter()
router.register(r"cellars", cellar_views.CellarViewSet)
router.register(r"wines", wine_views.WineViewSet)
router.register(r"user_preferences", user_preference_views.UserPreferenceViewSet)

urlpatterns = [
    path("api/", include(router.urls)),
    path("user/", include("users.urls")),
    path("admin/", admin.site.urls),
    # path("login", index_view, name="index"),
]
