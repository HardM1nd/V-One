from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import Complaint, NavigationItem, SiteSettings, UserActionLog
from accounts.api.serializers import UserSerializer


User = get_user_model()


class AdminMeSerializer(UserSerializer):
    is_admin = serializers.SerializerMethodField()

    class Meta(UserSerializer.Meta):
        fields = list(UserSerializer.Meta.fields) + ["is_admin"]

    def get_is_admin(self, obj: User) -> bool:
        return bool(getattr(obj, "is_staff", False))


class ComplaintSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    handled_by = UserSerializer(read_only=True)

    class Meta:
        model = Complaint
        fields = [
            "id",
            "user",
            "created",
            "updated",
            "category",
            "text",
            "status",
            "handled_by",
            "internal_comment",
        ]
        read_only_fields = ["id", "created", "updated", "user", "handled_by"]


class ComplaintUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Complaint
        fields = ["status", "internal_comment"]


class UserActionLogSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = UserActionLog
        fields = ["id", "user", "action", "path", "ip_address", "extra", "created"]


class NavigationItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = NavigationItem
        fields = [
            "id",
            "key",
            "label",
            "location",
            "is_visible_for_users",
            "is_enabled",
            "order",
        ]


class SiteSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteSettings
        fields = ["is_closed_for_public", "maintenance_message", "updated"]
        read_only_fields = ["updated"]

