# Generated manually for read-only demo user

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0004_alter_notification_options_alter_notification_actor_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='is_read_only',
            field=models.BooleanField(
                default=False,
                help_text='Запрет постов, комментариев, редактирования профиля и т.п.',
                verbose_name='Только чтение (демо)',
            ),
        ),
    ]
