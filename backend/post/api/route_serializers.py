from rest_framework import serializers
from post.models import FlightRoute
from accounts.api.serializers import UserSerializer
from django.contrib.humanize.templatetags.humanize import naturalday


class FlightRouteSerializer(serializers.ModelSerializer):
    pilot = UserSerializer(read_only=True)
    pilot_id = serializers.IntegerField(write_only=True, required=False)
    is_liked = serializers.SerializerMethodField()
    is_saved = serializers.SerializerMethodField()
    likes_count = serializers.SerializerMethodField()
    saves_count = serializers.SerializerMethodField()
    created_display = serializers.SerializerMethodField()
    flight_date_display = serializers.SerializerMethodField()

    class Meta:
        model = FlightRoute
        fields = [
            'id',
            'pilot',
            'pilot_id',
            'title',
            'departure',
            'destination',
            'departure_lat',
            'departure_lng',
            'destination_lat',
            'destination_lng',
            'description',
            'flight_date',
            'flight_date_display',
            'flight_duration',
            'distance',
            'aircraft_type',
            'route_file',
            'is_public',
            'created',
            'created_display',
            'updated',
            'is_liked',
            'is_saved',
            'likes_count',
            'saves_count',
        ]
        read_only_fields = ['pilot', 'created', 'updated']

    def get_is_liked(self, route):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return route.likes.filter(id=request.user.id).exists()
        return False

    def get_is_saved(self, route):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return route.saves.filter(id=request.user.id).exists()
        return False

    def get_likes_count(self, route):
        return route.likes.count()

    def get_saves_count(self, route):
        return route.saves.count()

    def get_created_display(self, route):
        return naturalday(route.created)

    def get_flight_date_display(self, route):
        if route.flight_date:
            return naturalday(route.flight_date)
        return None

    def create(self, validated_data):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            validated_data['pilot'] = request.user
        return super().create(validated_data)

