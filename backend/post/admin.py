from django.contrib import admin
from .models import Post, Comment, FlightRoute


# Register your models here.

admin.site.register(Post)
admin.site.register(Comment)


@admin.register(FlightRoute)
class FlightRouteAdmin(admin.ModelAdmin):
    list_display = ('title', 'pilot', 'departure', 'destination', 'flight_date', 'is_public', 'created')
    list_filter = ('is_public', 'flight_date', 'created')
    search_fields = ('title', 'departure', 'destination', 'pilot__username')
    readonly_fields = ('created', 'updated')
