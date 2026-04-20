from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Price
from .serializers import PriceSerializer
from .services import get_product_history, get_prediction, get_all_products


@api_view(['POST'])
def add_price(request):
    serializer = PriceSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=400)


@api_view(['GET'])
def get_prices(request):
    products = get_all_products()
    if not products:
        return Response({"error": "No data found"}, status=404)

    data = []
    for product in products:
        latest = Price.objects.filter(product=product).order_by('-date').first()
        if not latest:
            continue
        prediction = get_prediction(product)
        data.append({
            "product": product,
            "price": latest.price,
            "location": latest.location,
            "trend": prediction.get("trend"),
            "action": prediction.get("action"),
        })

    return Response(data)


@api_view(['GET'])
def get_price_history(request, product):
    prices = get_product_history(product)
    if not prices.exists():
        return Response({"error": "No data found"}, status=404)
    serializer = PriceSerializer(prices, many=True)
    return Response(serializer.data)


@api_view(['GET'])
def get_prediction_view(request, product):
    result = get_prediction(product)
    return Response(result)
