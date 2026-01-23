from django.db import migrations


class Migration(migrations.Migration):
    """
    Пустая миграция вместо сырой SQL под PostgreSQL.
    Таблица Notification создаётся обычной Django-моделью.
    """

    dependencies = [
        ("accounts", "0002_notification"),
    ]

    operations = []






