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
    role = models.CharField(max_length=12, choices=ROLE_CHOICES, default=ROLE_BUYER)
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
    source = models.CharField(max_length=10, choices=SOURCE_CHOICES, default=SOURCE_DEMO)
    submitted_by = models.ForeignKey(
        PriceBudgetUser,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="price_entries",
    )
    confirmations = models.PositiveIntegerField(default=1)
    date = models.DateTimeField(auto_now_add=False, auto_now=False, null=True, blank=True)

    class Meta:
        db_table = "pricebudget_prices"
        indexes = [
            models.Index(fields=["product", "date"]),
        ]

    def __str__(self):
        return f"{self.product} - {self.price}"