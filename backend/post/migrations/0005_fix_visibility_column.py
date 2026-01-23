from django.db import migrations


class Migration(migrations.Migration):
    """
    Пустая миграция вместо сырой SQL под PostgreSQL.
    Для SQLite поле visibility создаётся обычными миграциями.
    """

    dependencies = [
        ("post", "0004_flightroute_visibility"),
    ]

    operations = []






