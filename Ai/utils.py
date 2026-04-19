"""
PriceGuard AI - Helper Functions
"""

def calculate_percentage_change(old_price, new_price):
    """Calculate percentage change between two prices"""
    if old_price == 0:
        return 0
    return round(((new_price - old_price) / old_price) * 100, 2)


def moving_average(prices, window=3):
    """Calculate moving average of prices"""
    if len(prices) < window:
        return sum(prices) / len(prices) if prices else 0
    
    recent_prices = prices[-window:]
    return sum(recent_prices) / len(recent_prices)


def detect_outliers(prices):
    """Simple outlier detection (prevents bad predictions)"""
    if len(prices) < 4:
        return False
    
    avg = sum(prices) / len(prices)
    max_price = max(prices)
    min_price = min(prices)
    
    # If any price is 50% above average, it might be an outlier
    if max_price > avg * 1.5 or min_price < avg * 0.5:
        return True
    return False


def get_price_volatility(prices):
    """Calculate price volatility (standard deviation / mean)"""
    if len(prices) < 2:
        return 0
    
    avg = sum(prices) / len(prices)
    if avg == 0:
        return 0
    
    variance = sum((p - avg) ** 2 for p in prices) / len(prices)
    std_dev = variance ** 0.5
    
    return std_dev / avg
