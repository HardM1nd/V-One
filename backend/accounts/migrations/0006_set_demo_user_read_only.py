# Data migration: set DemoUser to read-only

from django.db import migrations


def set_demo_user_read_only(apps, schema_editor):
    User = apps.get_model('accounts', 'User')
    User.objects.filter(username='DemoUser').update(is_read_only=True)


def unset_demo_user_read_only(apps, schema_editor):
    User = apps.get_model('accounts', 'User')
    User.objects.filter(username='DemoUser').update(is_read_only=False)


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0005_add_user_is_read_only'),
    ]

    operations = [
        migrations.RunPython(set_demo_user_read_only, unset_demo_user_read_only),
    ]
