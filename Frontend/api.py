import requests
from urllib.parse import quote

BASE_URL = "http://127.0.0.1:8000/api"


def get_prices():
    res = requests.get(f"{BASE_URL}/prices/")
    res.raise_for_status()
    return res.json()


def add_price(data):
    # Caller checks status_code to display success/failure.
    return requests.post(f"{BASE_URL}/prices/add/", json=data)


def get_history(product: str):
    res = requests.get(f"{BASE_URL}/prices/{quote(product)}/")
    res.raise_for_status()
    return res.json()


def get_prediction(product: str):
    res = requests.get(f"{BASE_URL}/prediction/{quote(product)}/")
    res.raise_for_status()
    return res.json()
