from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("admin_api", "0001_initial"),
    ]

    operations = [
        migrations.AddIndex(
            model_name="useractionlog",
            index=models.Index(fields=["created"], name="action_created_idx"),
        ),
        migrations.AddIndex(
            model_name="useractionlog",
            index=models.Index(
                fields=["user", "created"],
                name="action_user_created_idx",
            ),
        ),
    ]
