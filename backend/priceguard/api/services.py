import logging
from Ai.model import predict_price
from .models import Price

logger = logging.getLogger(__name__)


def get_product_history(product_name):
    return Price.objects.filter(product__iexact=product_name).order_by('-date')


def get_all_products():
    return list(Price.objects.values_list('product', flat=True).distinct())


def get_prediction(product):
    logger.debug(f"[AI] product received: {product!r}")

    data = Price.objects.filter(product__iexact=product).order_by('date')
    count = data.count()
    logger.debug(f"[AI] DB rows fetched: {count}")

    if count == 0:
        logger.warning(f"[AI] No data found for product: {product!r}")
        return {
            "trend": "unknown",
            "action": "wait",
            "confidence": 0.0,
            "reason": f"No price history found for '{product}'",
            "predicted_price": None,
        }

    formatted = [{"price": float(p.price)} for p in data]
    logger.debug(f"[AI] formatted input: {formatted}")

    if len(formatted) < 2:
        return {
            "trend": "unknown",
            "action": "wait",
            "confidence": 0.1,
            "reason": f"Only {len(formatted)} data point(s) — need at least 2 for a prediction.",
            "predicted_price": formatted[0]["price"] if formatted else None,
        }

    result = predict_price(formatted)
    logger.debug(f"[AI] result: {result}")

    return result
