from django.urls import path
from .views import *

urlpatterns = [
    path('prices/', get_prices),
    path('prices/add/', add_price),
    path('prices/<str:product>/', get_price_history),
    path('prediction/<str:product>/', get_prediction_view),
]

