from django.core.files.storage import default_storage
from django.core.management.base import BaseCommand

from post.models import Post


class Command(BaseCommand):
    help = "Clear Post.image when the file is missing on disk/storage."

    def add_arguments(self, parser):
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Only report missing files without modifying posts.",
        )

    def handle(self, *args, **options):
        dry_run = options["dry_run"]
        total = 0
        fixed = 0

        for post in Post.objects.exclude(image=""):
            total += 1
            image_name = post.image.name
            if not image_name:
                continue
            if not default_storage.exists(image_name):
                if dry_run:
                    self.stdout.write(f"[MISSING] Post {post.id}: {image_name}")
                else:
                    post.image = ""
                    post.save(update_fields=["image"])
                    fixed += 1

        if dry_run:
            self.stdout.write(self.style.WARNING(f"Checked {total} posts."))
        else:
            self.stdout.write(self.style.SUCCESS(f"Fixed {fixed} of {total} posts."))





from django.core.management.base import BaseCommand

from post.models import Post


class Command(BaseCommand):
    help = "Clear Post.image when the file is missing on disk/storage."

    def add_arguments(self, parser):
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Only report missing files without modifying posts.",
        )

    def handle(self, *args, **options):
        dry_run = options["dry_run"]
        total = 0
        fixed = 0

        for post in Post.objects.exclude(image=""):
            total += 1
            image_name = post.image.name
            if not image_name:
                continue
            if not default_storage.exists(image_name):
                if dry_run:
                    self.stdout.write(f"[MISSING] Post {post.id}: {image_name}")
                else:
                    post.image = ""
                    post.save(update_fields=["image"])
                    fixed += 1

        if dry_run:
            self.stdout.write(self.style.WARNING(f"Checked {total} posts."))
        else:
            self.stdout.write(self.style.SUCCESS(f"Fixed {fixed} of {total} posts."))




