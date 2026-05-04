from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Price, PriceBudgetUser, PointLedger
from .serializers import PriceSerializer, PriceBudgetUserSerializer, AwardPointsSerializer
from .services import get_product_history, get_prediction, get_all_products


@api_view(['POST'])
def add_price(request):
    serializer = PriceSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=201)
    return Response({
        "error": "Invalid price data",
        "details": serializer.errors,
    }, status=400)


@api_view(['GET'])
def get_prices(request):
    products = get_all_products()
    if not products:
        return Response([])

    data = []
    for product in products:
        latest = Price.objects.filter(
            product=product).order_by('-date').first()
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
    serializer = PriceSerializer(prices, many=True)
    return Response(serializer.data)


@api_view(['PATCH'])
def update_price(request, price_id):
    price = Price.objects.filter(pk=price_id).first()
    if not price:
        return Response({"error": "Price not found"}, status=404)

    serializer = PriceSerializer(price, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)

    return Response({
        "error": "Invalid price update",
        "details": serializer.errors,
    }, status=400)


@api_view(['PATCH'])
def confirm_price(request, price_id):
    price = Price.objects.filter(pk=price_id).first()
    if not price:
        return Response({"error": "Price not found"}, status=404)

    confirmations = request.data.get('confirmations', price.confirmations + 1)
    try:
        confirmations = int(confirmations)
    except (TypeError, ValueError):
        return Response({"error": "Confirmations must be an integer"}, status=400)

    price.confirmations = max(1, confirmations)
    price.save(update_fields=['confirmations'])
    return Response(PriceSerializer(price).data)


@api_view(['GET'])
def get_prediction_view(request, product):
    result = get_prediction(product)
    return Response(result)


@api_view(['GET', 'POST'])
def users_view(request):
    if request.method == 'GET':
        users = PriceBudgetUser.objects.all().order_by('-points', 'name')
        return Response(PriceBudgetUserSerializer(users, many=True).data)

    email = request.data.get('email')
    existing = PriceBudgetUser.objects.filter(
        email=email).first() if email else None
    if existing:
        serializer = PriceBudgetUserSerializer(
            existing, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response({
            "error": "Invalid user data",
            "details": serializer.errors,
        }, status=400)

    serializer = PriceBudgetUserSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=201)

    return Response({
        "error": "Invalid user data",
        "details": serializer.errors,
    }, status=400)


@api_view(['POST'])
def award_points(request, user_id):
    payload = AwardPointsSerializer(data=request.data)
    if not payload.is_valid():
        return Response({
            "error": "Invalid points payload",
            "details": payload.errors,
        }, status=400)

    user = PriceBudgetUser.objects.filter(pk=user_id, is_active=True).first()
    if not user:
        return Response({"error": "User not found"}, status=404)

    delta = payload.validated_data['points']
    user.points += delta
    user.save(update_fields=['points', 'updated_at'])
    PointLedger.objects.create(
        user=user,
        points_delta=delta,
        event_type=PointLedger.EVENT_MANUAL_AWARD,
        note="Awarded via API",
    )

    return Response(PriceBudgetUserSerializer(user).data)
