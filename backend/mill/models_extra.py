from django.conf import settings
from django.db import models
from django.utils import timezone
from .models import Customer, TimeStampedModel

class AppSetting(models.Model):
    business_name=models.CharField(max_length=150,default='Chakki360')
    short_name=models.CharField(max_length=40,default='Chakki360')
    address=models.TextField(blank=True)
    phone=models.CharField(max_length=30,blank=True)
    currency_symbol=models.CharField(max_length=5,default='₹')
    def __str__(self): return self.business_name

class Income(TimeStampedModel):
    class Category(models.TextChoices):
        GRINDING='grinding','Grinding'; ATTA='atta','Atta Sale'; OIL='oil','Oil Sale'; BYPRODUCT='byproduct','By-product Sale'; OTHER='other','Other'
    category=models.CharField(max_length=30,choices=Category.choices,default=Category.OTHER)
    title=models.CharField(max_length=150)
    amount=models.DecimalField(max_digits=12,decimal_places=2)
    income_date=models.DateField(default=timezone.localdate)
    customer=models.ForeignKey(Customer,on_delete=models.SET_NULL,null=True,blank=True,related_name='income_entries')
    notes=models.TextField(blank=True)
    def __str__(self): return f'{self.title} - {self.amount}'

class CustomerProfile(models.Model):
    user=models.OneToOneField(settings.AUTH_USER_MODEL,on_delete=models.CASCADE,related_name='customer_profile')
    customer=models.OneToOneField(Customer,on_delete=models.CASCADE,related_name='login_profile')
    active=models.BooleanField(default=True)
    def __str__(self): return f'{self.user} → {self.customer}'
