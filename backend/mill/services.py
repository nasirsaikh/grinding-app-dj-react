from decimal import Decimal
from django.db import transaction
from django.utils import timezone
from .models import LedgerEntry, GrindingTransaction
@transaction.atomic
def post_customer_payment(customer,amount,reference='',notes='',grinding=None):
    amount=Decimal(str(amount or 0))
    if amount<=0:return None
    return LedgerEntry.objects.create(customer=customer,entry_type=LedgerEntry.EntryType.DEBIT,amount=amount,reference=reference,notes=notes,grinding_transaction=grinding)
@transaction.atomic
def post_udhaar(customer,amount,reference='',notes='',grinding=None):
    amount=Decimal(str(amount or 0))
    if amount<=0:return None
    return LedgerEntry.objects.create(customer=customer,entry_type=LedgerEntry.EntryType.CREDIT,amount=amount,reference=reference,notes=notes,grinding_transaction=grinding)
def mark_done(obj,final_weight=None):
    obj.status=GrindingTransaction.WorkStatus.GRINDING_DONE;obj.grinding_done_at=timezone.now();obj.final_weight_kg=final_weight or obj.initial_weight_kg;obj.save();return obj
