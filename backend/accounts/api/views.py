from accounts.models import User, Notification
from django.db import models
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.generics import (
    CreateAPIView,
    ListAPIView,
    RetrieveAPIView,
    UpdateAPIView,
)
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.permissions import AllowAny, IsAdminUser
from accounts.permissions import IsAuthenticatedReadOnlyForDemo

from .serializers import MyTokenObtainPairSerializer, SignupSerializer, UserSerializer, NotificationSerializer


def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)

    return {
        "refresh": str(refresh),
        "access": str(refresh.access_token),
    }


class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer


class SignupAPIView(CreateAPIView):
    model = User
    serializer_class = SignupSerializer
    permission_classes = []
    authentication_classes = []

    def perform_create(self, serializer):
        # I overode this method because its doesn't return the instance created by
        # the serializer by default, it only calls the save method of the serializer
        return serializer.save()

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        # Need the instance to get the tokens
        instance = self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        response = serializer.data
        response["tokens"] = get_tokens_for_user(instance)
        return Response(response, status=status.HTTP_201_CREATED, headers=headers)


class UserDetailAPIView(RetrieveAPIView):
    model = User
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

    def get_object(self):
        pk = self.kwargs.get("id")
        if pk is None:
            pk = self.request.user.id
        user = get_object_or_404(self.model, id=pk)
        self.check_object_permissions(self.request, user)
        return user

    def retrieve(self, request, *args, **kwargs):
        if "id" not in self.kwargs and not request.user.is_authenticated:
            return Response(
                {"detail": "Authentication credentials were not provided."},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        data = serializer.data
        id = self.kwargs.get("id", None)
        if id and request.user.is_authenticated:
            data["is_following"] = request.user.following.filter(id=id).exists()
        elif id:
            data["is_following"] = False
        return Response(data)


class FollowingListAPIView(ListAPIView):
    serializer_class = UserSerializer

    def get_queryset(self):
        user_id = self.kwargs.get("id")
        user = User.objects.get(id=user_id)
        return user.following.all()


class FollowerListAPIView(ListAPIView):
    serializer_class = UserSerializer

    def get_queryset(self):
        user_id = self.kwargs.get("id")
        user = User.objects.get(id=user_id)
        return user.followers.all()


class FollowUnfollowUserAPIView(APIView):
    allow_read_only_user = True

    def post(self, request, pk):
        user = request.user
        other_user = get_object_or_404(User, pk=pk)
        followed = False
        if user == other_user:
            return Response(
                {"message": "Cannot follow yourself"}, status=status.HTTP_403_FORBIDDEN
            )
        user_following = user.following
        other_user_followers = other_user.followers
        if user_following.filter(id=other_user.id).exists():
            user_following.remove(other_user)
            other_user_followers.remove(user)
        else:
            followed = True
            user_following.add(other_user)
            other_user_followers.add(user)
            if other_user != user:
                Notification.objects.create(
                    user=other_user,
                    actor=user,
                    type="follow",
                    message=f"{user.username} подписался на вас",
                    target_type="user",
                    target_id=user.id,
                )
        data = SignupSerializer(user).data
        data["followed"] = followed
        data["followers"] = user_following.count()
        return Response(data)


class ProfileUpdateAPIView(UpdateAPIView):
    model = User
    serializer_class = UserSerializer

    def get_object(self):
        return get_object_or_404(self.model, id=self.request.user.id)

    def perform_update(self, serializer):
        serializer.save()
        user = self.get_object()
        clear_profile = str(self.request.data.get("clear_profile_pic", "")).strip().lower() in ("1", "true")
        clear_cover = str(self.request.data.get("clear_cover_pic", "")).strip().lower() in ("1", "true")
        if clear_profile:
            user.profile_pic = None
        if clear_cover:
            user.cover_pic = None
        if clear_profile or clear_cover:
            user.save(update_fields=["profile_pic", "cover_pic"])


class PilotListAPIView(ListAPIView):
    """Список пилотов с фильтрацией по типу"""
    serializer_class = UserSerializer
    permission_classes = [AllowAny]
    authentication_classes = []
    
    def get_queryset(self):
        queryset = User.objects.all()
        pilot_type = self.request.query_params.get('pilot_type', None)
        query = self.request.query_params.get('q', None)
        
        if pilot_type:
            if pilot_type == 'virtual':
                queryset = queryset.filter(pilot_type__in=['virtual', 'both'])
            elif pilot_type == 'real':
                queryset = queryset.filter(pilot_type__in=['real', 'both'])
            elif pilot_type == 'both':
                queryset = queryset.filter(pilot_type='both')

        if query:
            queryset = queryset.filter(
                models.Q(username__icontains=query)
                | models.Q(bio__icontains=query)
                | models.Q(aircraft_types__icontains=query)
                | models.Q(license_number__icontains=query)
            )
        
        # Сортировка по часам налета (по убыванию)
        order_by = self.request.query_params.get('order_by', '-flight_hours')
        if order_by in ['flight_hours', '-flight_hours', 'username', '-username']:
            queryset = queryset.order_by(order_by)
        
        return queryset


class NotificationListAPIView(ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticatedReadOnlyForDemo]

    def get_queryset(self):
        queryset = Notification.objects.filter(user=self.request.user).order_by("-created")
        unread_only = self.request.query_params.get("unread")
        if unread_only in {"1", "true", "True"}:
            queryset = queryset.filter(is_read=False)
        return queryset


class NotificationReadAPIView(APIView):
    permission_classes = [IsAuthenticatedReadOnlyForDemo]
    allow_read_only_user = True

    def post(self, request, pk):
        notification = get_object_or_404(Notification, pk=pk, user=request.user)
        notification.is_read = True
        notification.save(update_fields=["is_read"])
        return Response({"status": "ok"})


class NotificationReadAllAPIView(APIView):
    permission_classes = [IsAuthenticatedReadOnlyForDemo]
    allow_read_only_user = True

    def post(self, request):
        Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
        return Response({"status": "ok"})


class NotificationUnreadCountAPIView(APIView):
    permission_classes = [IsAuthenticatedReadOnlyForDemo]

    def get(self, request):
        count = Notification.objects.filter(user=request.user, is_read=False).count()
        return Response({"unread_count": count})


class BanUnbanUserAPIView(APIView):
    """API endpoint для администраторов для бана/разбана пользователей"""
    permission_classes = [IsAuthenticatedReadOnlyForDemo, IsAdminUser]

    def post(self, request, pk):
        user_to_ban = get_object_or_404(User, pk=pk)
        
        # Администратор не может забанить сам себя
        if user_to_ban.id == request.user.id:
            return Response(
                {"error": "Вы не можете забанить сами себя"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Переключаем статус is_active
        user_to_ban.is_active = not user_to_ban.is_active
        user_to_ban.save()
        
        action = "забанен" if not user_to_ban.is_active else "разбанен"
        serializer = UserSerializer(user_to_ban)
        
        return Response({
            "message": f"Пользователь {action}",
            "user": serializer.data,
            "is_banned": not user_to_ban.is_active
        })