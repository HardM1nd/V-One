from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("post", "0006_postimage"),
    ]

    operations = [
        migrations.AddIndex(
            model_name="comment",
            index=models.Index(
                fields=["post", "created"],
                name="comment_post_created_idx",
            ),
        ),
        migrations.AddIndex(
            model_name="comment",
            index=models.Index(
                fields=["creator", "created"],
                name="comment_creator_created_idx",
            ),
        ),
        migrations.AddIndex(
            model_name="post",
            index=models.Index(fields=["created"], name="post_created_idx"),
        ),
        migrations.AddIndex(
            model_name="post",
            index=models.Index(
                fields=["creator", "created"],
                name="post_creator_created_idx",
            ),
        ),
        migrations.AddIndex(
            model_name="flightroute",
            index=models.Index(fields=["created"], name="route_created_idx"),
        ),
        migrations.AddIndex(
            model_name="flightroute",
            index=models.Index(
                fields=["pilot", "created"],
                name="route_pilot_created_idx",
            ),
        ),
        migrations.AddIndex(
            model_name="flightroute",
            index=models.Index(
                fields=["flight_date"],
                name="route_flight_date_idx",
            ),
        ),
        migrations.AddIndex(
            model_name="flightroute",
            index=models.Index(fields=["distance"], name="route_distance_idx"),
        ),
    ]
