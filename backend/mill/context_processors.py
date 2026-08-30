from .models_extra import AppSetting

def app_context(request):
    return {'app_setting':AppSetting.objects.first()}
