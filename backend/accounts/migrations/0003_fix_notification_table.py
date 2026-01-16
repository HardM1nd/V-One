from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ("accounts", "0002_notification"),
    ]

    operations = [
        migrations.RunSQL(
            """
            CREATE TABLE IF NOT EXISTS accounts_notification (
                id BIGSERIAL PRIMARY KEY,
                user_id BIGINT NOT NULL REFERENCES accounts_user(id) ON DELETE CASCADE,
                actor_id BIGINT NULL REFERENCES accounts_user(id) ON DELETE SET NULL,
                type VARCHAR(30) NOT NULL,
                message VARCHAR(255) NOT NULL DEFAULT '',
                target_type VARCHAR(30) NOT NULL DEFAULT '',
                target_id INTEGER NULL,
                is_read BOOLEAN NOT NULL DEFAULT FALSE,
                created TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );
            CREATE INDEX IF NOT EXISTS accounts_notification_user_id_idx
                ON accounts_notification(user_id);
            CREATE INDEX IF NOT EXISTS accounts_notification_actor_id_idx
                ON accounts_notification(actor_id);
            """,
            reverse_sql="DROP TABLE IF EXISTS accounts_notification;",
        ),
    ]



