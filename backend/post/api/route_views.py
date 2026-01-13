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
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.db import models
from post.models import FlightRoute
from .route_serializers import FlightRouteSerializer


class FlightRouteListAPIView(ListAPIView):
    """Список маршрутов полетов"""
    serializer_class = FlightRouteSerializer

    def get_queryset(self):
        queryset = FlightRoute.objects.filter(is_public=True)
        
        # Фильтр по пилоту
        pilot_id = self.request.query_params.get('pilot', None)
        if pilot_id:
            queryset = queryset.filter(pilot_id=pilot_id)
        
        # Фильтр по типу самолета
        aircraft_type = self.request.query_params.get('aircraft_type', None)
        if aircraft_type:
            queryset = queryset.filter(aircraft_type__icontains=aircraft_type)
        
        # Сортировка
        order_by = self.request.query_params.get('order_by', '-created')
        if order_by in ['created', '-created', 'flight_date', '-flight_date', 'distance', '-distance']:
            queryset = queryset.order_by(order_by)
        
        return queryset


class FlightRouteCreateAPIView(CreateAPIView):
    """Создание маршрута полета"""
    serializer_class = FlightRouteSerializer
    permission_classes = [IsAuthenticated]


class FlightRouteRetrieveAPIView(RetrieveAPIView):
    """Детали маршрута"""
    serializer_class = FlightRouteSerializer
    queryset = FlightRoute.objects.all()

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated:
            # Показываем публичные или свои маршруты
            return FlightRoute.objects.filter(
                models.Q(is_public=True) | models.Q(pilot=user)
            )
        return FlightRoute.objects.filter(is_public=True)


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
        route = get_object_or_404(FlightRoute, pk=pk, is_public=True)
        user = request.user
        
        if route.likes.filter(id=user.id).exists():
            route.likes.remove(user)
            liked = False
        else:
            route.likes.add(user)
            liked = True
        
        return Response({
            'liked': liked,
            'likes_count': route.likes.count()
        })


class FlightRouteSaveAPIView(APIView):
    """Сохранение/удаление из сохраненных маршрутов"""
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        route = get_object_or_404(FlightRoute, pk=pk, is_public=True)
        user = request.user
        
        if route.saves.filter(id=user.id).exists():
            route.saves.remove(user)
            saved = False
        else:
            route.saves.add(user)
            saved = True
        
        return Response({
            'saved': saved,
            'saves_count': route.saves.count()
        })


class MyFlightRoutesAPIView(ListAPIView):
    """Мои маршруты (включая приватные)"""
    serializer_class = FlightRouteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return FlightRoute.objects.filter(pilot=self.request.user)


class SavedFlightRoutesAPIView(ListAPIView):
    """Сохраненные маршруты"""
    serializer_class = FlightRouteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return self.request.user.saved_routes.all()

