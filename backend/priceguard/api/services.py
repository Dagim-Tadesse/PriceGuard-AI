from .models import Price

def get_product_history(product_name):
    return Price.objects.filter(product=product_name).order_by('-date')

def get_all_products():
    return list(Price.objects.values_list('product', flat=True).distinct())

def get_prediction(product_name):
    # Dummy prediction logic, can be replaced with real AI logic later
    return {
        "trend": "stable",
        "action": "wait"
    }