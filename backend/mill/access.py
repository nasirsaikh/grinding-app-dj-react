from functools import wraps
from django.contrib.auth.decorators import login_required
from django.core.exceptions import PermissionDenied

OWNER='Chakki Owner'; MANAGER='Chakki Manager'; OPERATOR='Chakki Operator'; ACCOUNTANT='Accountant'; CUSTOMER='Customer'

def has_role(user,*roles):
    return user.is_authenticated and (user.is_superuser or user.groups.filter(name__in=roles).exists())

def roles_required(*roles):
    def decorator(view):
        @login_required
        @wraps(view)
        def wrapped(request,*args,**kwargs):
            if not has_role(request.user,*roles): raise PermissionDenied
            return view(request,*args,**kwargs)
        return wrapped
    return decorator
