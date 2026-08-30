from django.core.management.base import BaseCommand
from django.contrib.auth.models import Group,Permission
ROLES={'Chakki Owner':None,'Chakki Manager':['view_','add_','change_'],'Chakki Operator':['view_customer','add_customer','change_customer','view_grindingtransaction','add_grindingtransaction','change_grindingtransaction','view_ratecard'],'Accountant':['view_customer','view_ledgerentry','add_ledgerentry','view_expense','add_expense','change_expense','view_income','add_income','change_income','view_stockitem','view_stockmovement'],'Customer':[]}
class Command(BaseCommand):
    help='Create Chakki360 role groups and permissions'
    def handle(self,*args,**opts):
        mill=Permission.objects.filter(content_type__app_label='mill')
        for name,rules in ROLES.items():
            g,_=Group.objects.get_or_create(name=name); g.permissions.clear()
            if rules is None: g.permissions.set(mill)
            else:
                selected=[p for p in mill if any(p.codename.startswith(r) if r.endswith('_') else p.codename==r for r in rules)]; g.permissions.set(selected)
            self.stdout.write(self.style.SUCCESS(f'{name}: {g.permissions.count()} permissions'))
