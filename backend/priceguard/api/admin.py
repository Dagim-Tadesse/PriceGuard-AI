from django.contrib import admin
from .models import Price, PriceBudgetUser, PointLedger


@admin.register(PriceBudgetUser)
class PriceBudgetUserAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "email", "role",
                    "points", "is_active", "created_at")
    list_filter = ("role", "is_active")
    search_fields = ("name", "email")


@admin.register(Price)
class PriceAdmin(admin.ModelAdmin):
    list_display = ("id", "product", "price", "location",
                    "source", "submitted_by", "confirmations", "date")
    list_filter = ("source", "location")
    search_fields = ("product", "location")


@admin.register(PointLedger)
class PointLedgerAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "points_delta", "event_type", "created_at")
    list_filter = ("event_type",)
    search_fields = ("user__name", "user__email", "note")
