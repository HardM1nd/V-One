from django.urls import path
from .route_views import (
    FlightRouteListAPIView,
    FlightRouteCreateAPIView,
    FlightRouteRetrieveAPIView,
    FlightRouteUpdateAPIView,
    FlightRouteDeleteAPIView,
    FlightRouteLikeAPIView,
    FlightRouteSaveAPIView,
    MyFlightRoutesAPIView,
    SavedFlightRoutesAPIView,
)

urlpatterns = [
    path('routes/', FlightRouteListAPIView.as_view(), name='route_list'),
    path('routes/create/', FlightRouteCreateAPIView.as_view(), name='route_create'),
    path('routes/<int:pk>/', FlightRouteRetrieveAPIView.as_view(), name='route_detail'),
    path('routes/<int:pk>/update/', FlightRouteUpdateAPIView.as_view(), name='route_update'),
    path('routes/<int:pk>/delete/', FlightRouteDeleteAPIView.as_view(), name='route_delete'),
    path('routes/<int:pk>/like/', FlightRouteLikeAPIView.as_view(), name='route_like'),
    path('routes/<int:pk>/save/', FlightRouteSaveAPIView.as_view(), name='route_save'),
    path('routes/my/', MyFlightRoutesAPIView.as_view(), name='my_routes'),
    path('routes/saved/', SavedFlightRoutesAPIView.as_view(), name='saved_routes'),
]

