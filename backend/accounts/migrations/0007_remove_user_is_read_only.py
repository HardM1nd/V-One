from django.db import migrations


def deactivate_demo_user(apps, schema_editor):
    user_model = apps.get_model("accounts", "User")
    user_model.objects.filter(username="DemoUser").update(is_active=False)


class Migration(migrations.Migration):

    dependencies = [
        ("accounts", "0006_set_demo_user_read_only"),
    ]

    operations = [
        migrations.RunPython(deactivate_demo_user, migrations.RunPython.noop),
        migrations.RemoveField(
            model_name="user",
            name="is_read_only",
        ),
    ]
