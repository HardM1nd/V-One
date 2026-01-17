from rest_framework import status
from rest_framework.generics import (
    ListAPIView,
    CreateAPIView,
    RetrieveAPIView,
    UpdateAPIView,
    DestroyAPIView,
)
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.shortcuts import get_object_or_404
from django.db import models
from post.models import FlightRoute
from accounts.models import Notification
from .route_serializers import FlightRouteSerializer


def apply_route_filters(queryset, request):
    pilot_id = request.query_params.get('pilot', None)
    if pilot_id:
        queryset = queryset.filter(pilot_id=pilot_id)

    aircraft_type = request.query_params.get('aircraft_type', None)
    if aircraft_type:
        queryset = queryset.filter(aircraft_type__icontains=aircraft_type)

    query = request.query_params.get('q', None)
    if query:
        queryset = queryset.filter(
            models.Q(title__icontains=query)
            | models.Q(departure__icontains=query)
            | models.Q(destination__icontains=query)
            | models.Q(pilot__username__icontains=query)
        )

    distance_min = request.query_params.get('distance_min', None)
    if distance_min:
        try:
            queryset = queryset.filter(distance__gte=float(distance_min))
        except ValueError:
            pass

    distance_max = request.query_params.get('distance_max', None)
    if distance_max:
        try:
            queryset = queryset.filter(distance__lte=float(distance_max))
        except ValueError:
            pass

    order_by = request.query_params.get('order_by', '-created')
    if order_by in ['created', '-created', 'flight_date', '-flight_date', 'distance', '-distance']:
        queryset = queryset.order_by(order_by)

    return queryset


def apply_visibility_filter(queryset, user):
    if user and user.is_authenticated:
        following_ids = user.following.values_list("id", flat=True)
        return queryset.filter(
            models.Q(pilot=user)
            | models.Q(visibility="public")
            | models.Q(visibility="followers", pilot_id__in=following_ids)
            | models.Q(visibility__isnull=True, is_public=True)
        )
    return queryset.filter(
        models.Q(visibility="public")
        | models.Q(visibility__isnull=True, is_public=True)
    )


class FlightRouteListAPIView(ListAPIView):
    """Список маршрутов полетов"""
    serializer_class = FlightRouteSerializer
    permission_classes = [AllowAny]
    authentication_classes = []

    def get_queryset(self):
        queryset = apply_visibility_filter(FlightRoute.objects.all(), self.request.user)
        return apply_route_filters(queryset, self.request)


class FlightRouteCreateAPIView(CreateAPIView):
    """Создание маршрута полета"""
    serializer_class = FlightRouteSerializer
    permission_classes = [IsAuthenticated]


class FlightRouteRetrieveAPIView(RetrieveAPIView):
    """Детали маршрута"""
    serializer_class = FlightRouteSerializer
    queryset = FlightRoute.objects.all()
    permission_classes = [AllowAny]
    authentication_classes = []

    def get_queryset(self):
        return apply_visibility_filter(FlightRoute.objects.all(), self.request.user)


class FlightRouteUpdateAPIView(UpdateAPIView):
    """Обновление маршрута"""
    serializer_class = FlightRouteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Только свои маршруты
        return FlightRoute.objects.filter(pilot=self.request.user)


class FlightRouteDeleteAPIView(DestroyAPIView):
    """Удаление маршрута"""
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Только свои маршруты
        return FlightRoute.objects.filter(pilot=self.request.user)


class FlightRouteLikeAPIView(APIView):
    """Лайк/анлайк маршрута"""
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        queryset = apply_visibility_filter(FlightRoute.objects.all(), request.user)
        route = get_object_or_404(queryset, pk=pk)
        user = request.user
        
        if route.likes.filter(id=user.id).exists():
            route.likes.remove(user)
            liked = False
        else:
            route.likes.add(user)
            liked = True
            if route.pilot_id != user.id:
                Notification.objects.create(
                    user=route.pilot,
                    actor=user,
                    type="route_like",
                    message=f"{user.username} поставил лайк вашему маршруту",
                    target_type="route",
                    target_id=route.id,
                )
        
        return Response({
            'liked': liked,
            'likes_count': route.likes.count()
        })


class FlightRouteSaveAPIView(APIView):
    """Сохранение/удаление из сохраненных маршрутов"""
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        queryset = apply_visibility_filter(FlightRoute.objects.all(), request.user)
        route = get_object_or_404(queryset, pk=pk)
        user = request.user
        
        if route.saves.filter(id=user.id).exists():
            route.saves.remove(user)
            saved = False
        else:
            route.saves.add(user)
            saved = True
            if route.pilot_id != user.id:
                Notification.objects.create(
                    user=route.pilot,
                    actor=user,
                    type="route_save",
                    message=f"{user.username} сохранил ваш маршрут",
                    target_type="route",
                    target_id=route.id,
                )
        
        return Response({
            'saved': saved,
            'saves_count': route.saves.count()
        })


class MyFlightRoutesAPIView(ListAPIView):
    """Мои маршруты (включая приватные)"""
    serializer_class = FlightRouteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = FlightRoute.objects.filter(pilot=self.request.user)
        return apply_route_filters(queryset, self.request)


class SavedFlightRoutesAPIView(ListAPIView):
    """Сохраненные маршруты"""
    serializer_class = FlightRouteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = apply_visibility_filter(self.request.user.saved_routes.all(), self.request.user)
        return apply_route_filters(queryset, self.request)


class FollowingFlightRoutesAPIView(ListAPIView):
    """Маршруты пилотов, на которых подписан пользователь"""
    serializer_class = FlightRouteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        following_ids = self.request.user.following.values_list("id", flat=True)
        queryset = FlightRoute.objects.filter(
            models.Q(pilot_id__in=following_ids) | models.Q(pilot=self.request.user),
        )
        queryset = apply_visibility_filter(queryset, self.request.user)
        return apply_route_filters(queryset, self.request)


                )
        
        return Response({
            'liked': liked,
            'likes_count': route.likes.count()
        })


class FlightRouteSaveAPIView(APIView):
    """Сохранение/удаление из сохраненных маршрутов"""
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        queryset = apply_visibility_filter(FlightRoute.objects.all(), request.user)
        route = get_object_or_404(queryset, pk=pk)
        user = request.user
        
        if route.saves.filter(id=user.id).exists():
            route.saves.remove(user)
            saved = False
        else:
            route.saves.add(user)
            saved = True
            if route.pilot_id != user.id:
                Notification.objects.create(
                    user=route.pilot,
                    actor=user,
                    type="route_save",
                    message=f"{user.username} сохранил ваш маршрут",
                    target_type="route",
                    target_id=route.id,
                )
        
        return Response({
            'saved': saved,
            'saves_count': route.saves.count()
        })


class MyFlightRoutesAPIView(ListAPIView):
    """Мои маршруты (включая приватные)"""
    serializer_class = FlightRouteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = FlightRoute.objects.filter(pilot=self.request.user)
        return apply_route_filters(queryset, self.request)


class SavedFlightRoutesAPIView(ListAPIView):
    """Сохраненные маршруты"""
    serializer_class = FlightRouteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = apply_visibility_filter(self.request.user.saved_routes.all(), self.request.user)
        return apply_route_filters(queryset, self.request)


class FollowingFlightRoutesAPIView(ListAPIView):
    """Маршруты пилотов, на которых подписан пользователь"""
    serializer_class = FlightRouteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        following_ids = self.request.user.following.values_list("id", flat=True)
        queryset = FlightRoute.objects.filter(
            models.Q(pilot_id__in=following_ids) | models.Q(pilot=self.request.user),
        )
        queryset = apply_visibility_filter(queryset, self.request.user)
        return apply_route_filters(queryset, self.request)
