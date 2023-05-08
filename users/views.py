import json

from django.contrib.auth import authenticate, login, logout
from django.http import JsonResponse
from django.middleware.csrf import get_token
from django.views.decorators.http import require_POST


def get_csrf(request):
    response = JsonResponse({"detail": "CSRF cookie set"})
    response["X-CSRFToken"] = get_token(request)
    return response


@require_POST
def login_view(request):
    data = json.loads(request.body)
    email = data.get("email")
    password = data.get("password")

    if email is None or password is None:
        return JsonResponse({"detail": "Please provide email and password."}, status=400)

    user = authenticate(email=email, password=password)

    if user is None:
        return JsonResponse({"detail": "Wrong email or password"}, status=400)

    login(request, user)
    return JsonResponse({"status": "login successful"})


def logout_view(request):
    if not request.user.is_authenticated:
        return JsonResponse({"detail": "You're not logged in."}, status=400)

    logout(request)
    return JsonResponse({"detail": "Successfully logged out."})


def session_view(request):
    if not request.user.is_authenticated:
        return JsonResponse({"is_authenticated": False})

    default_page = request.user.usersetting.default_page
    return JsonResponse({"is_authenticated": True, "default_page": default_page})
