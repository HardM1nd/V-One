from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ("post", "0004_flightroute_visibility"),
    ]

    operations = [
        migrations.RunSQL(
            """
            ALTER TABLE post_flightroute
            ADD COLUMN IF NOT EXISTS visibility VARCHAR(20) NOT NULL DEFAULT 'public';
            """,
            reverse_sql="""
            ALTER TABLE post_flightroute
            DROP COLUMN IF EXISTS visibility;
            """,
        ),
    ]







class Migration(migrations.Migration):
    dependencies = [
        ("post", "0004_flightroute_visibility"),
    ]

    operations = [
        migrations.RunSQL(
            """
            ALTER TABLE post_flightroute
            ADD COLUMN IF NOT EXISTS visibility VARCHAR(20) NOT NULL DEFAULT 'public';
            """,
            reverse_sql="""
            ALTER TABLE post_flightroute
            DROP COLUMN IF EXISTS visibility;
            """,
        ),
    ]




