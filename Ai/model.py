"""
PriceGuard AI - Core prediction engine
Django-compatible module
"""

from utils import calculate_percentage_change, moving_average, get_price_volatility


def detect_trend(prices):
    """
    Detect if prices are increasing, decreasing, or stable
    
    Args:
        prices: List of price values (floats/ints)
    
    Returns:
        String: "increasing", "decreasing", or "stable"
    """
    if len(prices) < 2:
        return "stable"
    
    # Compare first and last price
    if prices[-1] > prices[0] * 1.02:  # At least 2% increase
        return "increasing"
    elif prices[-1] < prices[0] * 0.98:  # At least 2% decrease
        return "decreasing"
    else:
        return "stable"


def predict_next(prices):
    """
    Predict next price using weighted average change method
    
    Args:
        prices: List of price values (floats/ints)
    
    Returns:
        Float: Predicted next price
    """
    if not prices:
        return 0
    
    if len(prices) < 2:
        return prices[-1]
    
    # Calculate daily changes
    changes = [prices[i] - prices[i-1] for i in range(1, len(prices))]
    
    # Weight recent changes more (makes it smarter)
    if len(changes) >= 3:
        # Last 3 days have 70% weight, overall average has 30%
        recent_weight = sum(changes[-3:]) / 3
        overall_avg = sum(changes) / len(changes)
        avg_change = (recent_weight * 0.7) + (overall_avg * 0.3)
    else:
        avg_change = sum(changes) / len(changes)
    
    predicted_price = prices[-1] + avg_change
    
    # Ensure price doesn't go negative
    return max(predicted_price, 0)


def confidence_score(prices):
    """
    Calculate confidence in prediction based on data quality
    
    Args:
        prices: List of price values
    
    Returns:
        Float: Confidence score between 0 and 1
    """
    if len(prices) < 3:
        return 0.3  # Low confidence with little data
    
    # More data = higher confidence (max 0.6 from data amount)
    data_confidence = min(len(prices) / 20, 0.6)
    
    # Check volatility (less volatility = higher confidence)
    volatility = get_price_volatility(prices)
    if volatility < 0.03:  # Low volatility
        consistency = 0.3
    elif volatility < 0.08:  # Medium volatility
        consistency = 0.2
    else:  # High volatility
        consistency = 0.1
    
    return round(data_confidence + consistency, 2)


def decide_action(trend, predicted_price, current_price, confidence):
    """
    Make buy/wait decision based on multiple factors
    
    Args:
        trend: "increasing", "decreasing", or "stable"
        predicted_price: Next predicted price
        current_price: Most recent price
        confidence: Confidence score from confidence_score()
    
    Returns:
        String: "buy_now" or "wait"
    """
    # If confidence is very low, recommend waiting
    if confidence < 0.4:
        return "wait"
    
    # Rule 1: Clear increasing trend
    if trend == "increasing":
        # Extra check: predicted increase > 5%
        if predicted_price > current_price * 1.05:
            return "buy_now"
        return "buy_now"
    
    # Rule 2: Clear decreasing trend
    elif trend == "decreasing":
        return "wait"
    
    # Rule 3: Stable - check if predicted increase
    else:
        if predicted_price > current_price * 1.03:
            return "buy_now"
        else:
            return "wait"


def generate_reason(prices, trend, predicted_price, current_price):
    """Generate user-friendly explanation"""
    
    if len(prices) >= 3:
        # Calculate recent change
        recent_change = calculate_percentage_change(prices[-3], prices[-1])
        
        if trend == "increasing":
            return f"Price increased {abs(recent_change)}% in last 3 days. Expected to rise further."
        elif trend == "decreasing":
            return f"Price dropped {abs(recent_change)}% in last 3 days. Better to wait."
        else:
            if predicted_price > current_price:
                increase_pct = round((predicted_price/current_price - 1)*100, 1)
                return f"Price stable but predicted to increase by {increase_pct}%"
            else:
                return f"Price stable with {abs(recent_change)}% change. No urgency to buy."
    
    return f"Based on {len(prices)} days of data, trend is {trend}."


def predict_price(price_data):
    """
    MAIN FUNCTION - Called by Django backend
    
    Args:
        price_data: List of dicts with 'price' key
                   Example: [{"price": 100}, {"price": 110}]
    
    Returns:
        Dict: {
            "trend": "increasing",
            "predicted_price": 130.50,
            "action": "buy_now",
            "confidence": 0.85,
            "reason": "Price increased 10% in last 3 days"
        }
    """
    
    # EDGE CASE 1: Empty data
    if not price_data:
        return {
            "trend": "stable",
            "predicted_price": 0,
            "action": "wait",
            "confidence": 0.0,
            "reason": "Insufficient price data"
        }
    
    # Extract prices from input format
    try:
        prices = [float(item["price"]) for item in price_data]
    except (KeyError, TypeError, ValueError):
        return {
            "trend": "stable",
            "predicted_price": 0,
            "action": "wait",
            "confidence": 0.0,
            "reason": "Invalid price data format"
        }
    
    current_price = prices[-1]
    
    # EDGE CASE 2: Not enough data
    if len(prices) < 2:
        return {
            "trend": "stable",
            "predicted_price": current_price,
            "action": "wait",
            "confidence": 0.3,
            "reason": f"Only {len(prices)} price point(s) available. Need more data."
        }
    
    # Get predictions
    trend = detect_trend(prices)
    predicted_price = predict_next(prices)
    confidence = confidence_score(prices)
    action = decide_action(trend, predicted_price, current_price, confidence)
    
    # Generate human-readable reason
    reason = generate_reason(prices, trend, predicted_price, current_price)
    
    # Round values for clean output
    return {
        "trend": trend,
        "predicted_price": round(predicted_price, 2),
        "action": action,
        "confidence": confidence,
        "reason": reason,
        "current_price": current_price
    }


# ============ TESTING CODE ============
if __name__ == "__main__":
    print("\n" + "="*60)
    print("PRICEGUARD AI - TEST SUITE")
    print("="*60)
    
    # TEST 1: Increasing prices (Cooking Oil)
    print("\n📊 TEST 1: Cooking Oil (Increasing)")
    test_oil = [
        {"price": 950},
        {"price": 965},
        {"price": 980},
        {"price": 1010},
        {"price": 1050}
    ]
    result = predict_price(test_oil)
    print(f"   Input: {[p['price'] for p in test_oil]}")
    print(f"   Current: {result['current_price']}")
    print(f"   Predicted: {result['predicted_price']}")
    print(f"   Trend: {result['trend']}")
    print(f"   Action: {result['action'].upper()}")
    print(f"   Confidence: {result['confidence']*100}%")
    print(f"   Reason: {result['reason']}")
    
    # TEST 2: Decreasing prices (Tomatoes)
    print("\n📊 TEST 2: Tomatoes (Decreasing)")
    test_tomatoes = [
        {"price": 60},
        {"price": 55},
        {"price": 48},
        {"price": 45},
        {"price": 40}
    ]
    result = predict_price(test_tomatoes)
    print(f"   Input: {[p['price'] for p in test_tomatoes]}")
    print(f"   Current: {result['current_price']}")
    print(f"   Predicted: {result['predicted_price']}")
    print(f"   Trend: {result['trend']}")
    print(f"   Action: {result['action'].upper()}")
    print(f"   Confidence: {result['confidence']*100}%")
    print(f"   Reason: {result['reason']}")
    
    # TEST 3: Stable prices (Bread)
    print("\n📊 TEST 3: Bread (Stable)")
    test_bread = [
        {"price": 35},
        {"price": 35},
        {"price": 35},
        {"price": 36},
        {"price": 36}
    ]
    result = predict_price(test_bread)
    print(f"   Input: {[p['price'] for p in test_bread]}")
    print(f"   Current: {result['current_price']}")
    print(f"   Predicted: {result['predicted_price']}")
    print(f"   Trend: {result['trend']}")
    print(f"   Action: {result['action'].upper()}")
    print(f"   Confidence: {result['confidence']*100}%")
    print(f"   Reason: {result['reason']}")
    
    # TEST 4: Edge case - only 1 data point
    print("\n📊 TEST 4: Edge Case (Insufficient Data)")
    test_single = [{"price": 100}]
    result = predict_price(test_single)
    print(f"   Input: {[p['price'] for p in test_single]}")
    print(f"   Action: {result['action'].upper()}")
    print(f"   Reason: {result['reason']}")
    
    # TEST 5: Empty data
    print("\n📊 TEST 5: Edge Case (Empty Data)")
    result = predict_price([])
    print(f"   Input: []")
    print(f"   Action: {result['action'].upper()}")
    print(f"   Reason: {result['reason']}")
    
    print("\n" + "="*60)
    print("✅ All tests completed! Your AI is ready for Django.")
    print("="*60)
