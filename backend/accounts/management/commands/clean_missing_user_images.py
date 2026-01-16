from django.core.files.storage import default_storage
from django.core.management.base import BaseCommand

from accounts.models import User


class Command(BaseCommand):
    help = "Clear missing profile/cover images for users."

    def add_arguments(self, parser):
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Only report missing files without modifying users.",
        )

    def handle(self, *args, **options):
        dry_run = options["dry_run"]
        total = 0
        fixed = 0

        for user in User.objects.all():
            total += 1
            updated = []

            profile_name = user.profile_pic.name if user.profile_pic else ""
            if profile_name and not default_storage.exists(profile_name):
                if dry_run:
                    self.stdout.write(f"[MISSING] profile_pic user {user.id}: {profile_name}")
                else:
                    user.profile_pic = None
                    updated.append("profile_pic")

            cover_name = user.cover_pic.name if user.cover_pic else ""
            if cover_name and not default_storage.exists(cover_name):
                if dry_run:
                    self.stdout.write(f"[MISSING] cover_pic user {user.id}: {cover_name}")
                else:
                    user.cover_pic = "images/cover/coverphoto.jpg"
                    updated.append("cover_pic")

            if updated and not dry_run:
                user.save(update_fields=updated)
                fixed += 1

        if dry_run:
            self.stdout.write(self.style.WARNING(f"Checked {total} users."))
        else:
            self.stdout.write(self.style.SUCCESS(f"Fixed {fixed} of {total} users."))



