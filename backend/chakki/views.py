from django.shortcuts import render
from backend.mill.models import UITranslation
from django.http import JsonResponse
from django.utils.translation import get_language

def react_app(request):
    return render(request, "index.html")


def ui_translations(request):
    lang = request.GET.get("lang") or get_language() or "en"

    data = {}

    for item in UITranslation.objects.all():
        if lang.startswith("hi") and item.hindi_text:
            data[item.key] = item.hindi_text
        else:
            data[item.key] = item.english_text

    return JsonResponse(data)