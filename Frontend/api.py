import requests

BASE_URL = "http://127.0.0.1:8000"

def get_prices():
    return requests.get(f"{BASE_URL}/prices").json()

def add_price(data):
    return requests.post(f"{BASE_URL}/add-price", json=data)

def get_history():
    return requests.get(f"{BASE_URL}/history").json()