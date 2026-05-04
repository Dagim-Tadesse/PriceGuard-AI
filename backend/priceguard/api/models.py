from django.db import models


class PriceBudgetUser(models.Model):
    ROLE_BUYER = "buyer"
    ROLE_SELLER = "seller"
    ROLE_ADMIN = "admin"
    ROLE_CHOICES = [
        (ROLE_BUYER, "Buyer"),
        (ROLE_SELLER, "Seller"),
        (ROLE_ADMIN, "Admin"),
    ]

    name = models.CharField(max_length=120)
    email = models.EmailField(unique=True)
    role = models.CharField(
        max_length=12, choices=ROLE_CHOICES, default=ROLE_BUYER)
    points = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "pricebudget_users"
        indexes = [
            models.Index(fields=["email"]),
            models.Index(fields=["role"]),
        ]

    def __str__(self):
        return f"{self.name} ({self.role})"


class PointLedger(models.Model):
    EVENT_DAILY_BONUS = "daily_bonus"
    EVENT_ADD_PRICE = "add_price"
    EVENT_CONFIRM_PRICE = "confirm_price"
    EVENT_MANUAL_AWARD = "manual_award"
    EVENT_CHOICES = [
        (EVENT_DAILY_BONUS, "Daily Bonus"),
        (EVENT_ADD_PRICE, "Add Price"),
        (EVENT_CONFIRM_PRICE, "Confirm Price"),
        (EVENT_MANUAL_AWARD, "Manual Award"),
    ]

    user = models.ForeignKey(
        PriceBudgetUser,
        on_delete=models.CASCADE,
        related_name="point_ledger_entries",
    )
    points_delta = models.IntegerField()
    event_type = models.CharField(max_length=40, choices=EVENT_CHOICES)
    note = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "pricebudget_points_ledger"
        indexes = [
            models.Index(fields=["user", "created_at"]),
        ]

    def __str__(self):
        return f"{self.user_id}: {self.points_delta} ({self.event_type})"


class Price(models.Model):
    SOURCE_USER = "user"
    SOURCE_DEMO = "demo"
    SOURCE_CHOICES = [
        (SOURCE_USER, "User Submitted Data"),
        (SOURCE_DEMO, "Simulated Demo Data"),
    ]

    product = models.CharField(max_length=100, db_index=True)
    price = models.FloatField()
    location = models.CharField(max_length=100)
    source = models.CharField(
        max_length=10, choices=SOURCE_CHOICES, default=SOURCE_DEMO)
    submitted_by = models.ForeignKey(
        PriceBudgetUser,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="price_entries",
    )
    confirmations = models.PositiveIntegerField(default=1)
    date = models.DateTimeField(
        auto_now_add=False, auto_now=False, null=True, blank=True)

    class Meta:
        db_table = "pricebudget_prices"
        indexes = [
            models.Index(fields=["product", "date"]),
        ]

    def __str__(self):
        return f"{self.product} - {self.price}"
