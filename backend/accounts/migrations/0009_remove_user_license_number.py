from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("accounts", "0008_add_notification_indexes"),
    ]

    operations = [
        migrations.RemoveField(
            model_name="user",
            name="license_number",
        ),
    ]
