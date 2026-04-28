import streamlit as st
from api import ApiError, get_history, get_prediction, get_prices

st.set_page_config(layout="wide")
st.title("📊 Price History")

try:
    prices = get_prices()
    products = sorted({item.get("product")
                      for item in prices if item.get("product")})

    if not products:
        st.info("No products available")
        st.stop()

    product = st.selectbox("Product", products)
    data = get_history(product)

    if data:
        st.subheader("Trend Chart")
        ordered = list(reversed(data))
        st.line_chart([row.get("price", 0) for row in ordered])

        try:
            prediction = get_prediction(product)
            st.subheader("Prediction")

            prediction_cols = st.columns(4)
            prediction_cols[0].metric(
                "Trend", prediction.get("trend", "unknown"))
            prediction_cols[1].metric(
                "Predicted Price", prediction.get("predicted_price", "n/a"))
            prediction_cols[2].metric(
                "Action", prediction.get("action", "wait"))
            prediction_cols[3].metric(
                "Confidence", f"{prediction.get('confidence', 0) * 100:.0f}%")

            st.info(prediction.get("reason", ""))
        except ApiError as exc:
            st.warning(str(exc))

    if data:
        st.dataframe(data, use_container_width=True)
    else:
        st.info("No history yet for this product")

except ApiError as exc:
    st.warning(str(exc))
except Exception:
    st.error("Backend not reachable")
