import requests
from urllib.parse import quote

BASE_URL = "http://127.0.0.1:8000/api"


class ApiError(Exception):
    pass


def _error_message(response):
    try:
        payload = response.json()
    except Exception:
        payload = response.text.strip()

    if isinstance(payload, dict):
        if "error" in payload:
            details = payload.get("details")
            if details:
                return f"{payload['error']}: {details}"
            return str(payload["error"])
        if "detail" in payload:
            return str(payload["detail"])

    if payload:
        return str(payload)

    return f"Request failed with status {response.status_code}"


def _request(method, path, **kwargs):
    try:
        res = requests.request(method, f"{BASE_URL}{path}", **kwargs)
    except requests.RequestException:
        raise ApiError(
            "Backend not reachable. Start the backend server first.")

    if res.ok:
        return res
    raise ApiError(_error_message(res))


def get_prices():
    res = _request("GET", "/prices/")
    return res.json()


def add_price(data):
    res = _request("POST", "/prices/add/", json=data)
    return res.json()


def get_history(product: str):
    res = _request("GET", f"/prices/{quote(product)}/")
    return res.json()


def get_prediction(product: str):
    res = _request("GET", f"/prediction/{quote(product)}/")
    return res.json()


def get_product_bundle(product: str):
    return {
        "history": get_history(product),
        "prediction": get_prediction(product),
    }
