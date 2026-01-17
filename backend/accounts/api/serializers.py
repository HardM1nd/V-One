from typing import Any

from accounts.models import User, Notification
from django.contrib.auth import update_session_auth_hash
from django.contrib.humanize.templatetags.humanize import naturalday
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer


class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["user_name"] = user.username
        try:
            token["profile_pic"] = user.profile_pic.url
        except:
            token["profile_pic"] = ""

        return token


class UserSerializer(serializers.ModelSerializer):
    followers = serializers.SerializerMethodField()
    following = serializers.SerializerMethodField()
    date_joined = serializers.SerializerMethodField()
    aircraft_types_list = serializers.SerializerMethodField()
    pilot_type_display = serializers.CharField(source='get_pilot_type_display', read_only=True)
    is_following = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "date_joined",
            "email",
            "profile_pic",
            "following",
            "followers",
            "cover_pic",
            "password",
            "pilot_type",
            "pilot_type_display",
            "flight_hours",
            "aircraft_types",
            "aircraft_types_list",
            "license_number",
            "bio",
            "is_following",
        ]
        extra_kwargs = {
            "date_joined": {
                "read_only": True,
            },
            "password": {
                "write_only": True,
            },
        }

    def get_followers(self, user):
        return user.followers.count()

    def get_following(self, user):
        return user.following.count()

    def get_date_joined(self, user):
        return naturalday(user.date_joined)
    
    def get_aircraft_types_list(self, user):
        return user.get_aircraft_types_list()

    def get_is_following(self, user):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return False
        if request.user.id == user.id:
            return False
        return request.user.following.filter(id=user.id).exists()

    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            if attr == "password":
                instance.set_password(value)
            else:
                setattr(instance, attr, value)

        instance.save()

        update_session_auth_hash(self.context.get("request"), instance)

        return instance


class SignupSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            "username",
            "email",
            "password",
        )
        extra_kwargs = {
            "password": {
                "write_only": True,
            }
        }

    def create(self, validated_data):
        password = validated_data.pop("password", None)
        instance = self.Meta.model(**validated_data)
        if password is not None:
            instance.set_password(password)
        instance.save()
        return instance


class NotificationActorSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "username", "profile_pic")


class NotificationSerializer(serializers.ModelSerializer):
    actor = NotificationActorSerializer(read_only=True)

    class Meta:
        model = Notification
        fields = (
            "id",
            "type",
            "message",
            "actor",
            "target_type",
            "target_id",
            "is_read",
            "created",
        )

    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            if attr == "password":
                instance.set_password(value)
            else:
                setattr(instance, attr, value)
        instance.save()
        return instance



class NotificationActorSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "username", "profile_pic")


class NotificationSerializer(serializers.ModelSerializer):
    actor = NotificationActorSerializer(read_only=True)

    class Meta:
        model = Notification
        fields = (
            "id",
            "type",
            "message",
            "actor",
            "target_type",
            "target_id",
            "is_read",
            "created",
        )

    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            if attr == "password":
                instance.set_password(value)
            else:
                setattr(instance, attr, value)
        instance.save()
        return instance