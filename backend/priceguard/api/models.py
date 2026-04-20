from django.db import models

class Price(models.Model):
    product = models.CharField(max_length=100, db_index=True)
    price = models.FloatField()
    location = models.CharField(max_length=100)
    date = models.DateTimeField(auto_now_add=False, auto_now=False, null=True, blank=True)

    def __str__(self):
        return f"{self.product} - {self.price}"