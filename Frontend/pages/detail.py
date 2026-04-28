import pandas as pd
import streamlit as st

from api import ApiError, get_prediction, get_prices, get_history


st.set_page_config(page_title="PriceGuard AI - Detail", layout="wide")
st.title("🔎 Product Detail")
st.caption("All the signals for one product in one place.")


def best_time_to_buy(prediction):
    trend = prediction.get("trend", "unknown")
    action = prediction.get("action", "wait")
    confidence = float(prediction.get("confidence", 0) or 0)

    if action == "buy_now" and trend == "increasing":
        return "Buy now today if possible."
    if trend == "decreasing":
        return "Wait for a lower price if you can."
    if confidence >= 0.7:
        return "Buy within the next 1-2 days before the trend shifts."
    return "Monitor for another day before deciding."


try:
    prices = get_prices()
    products = sorted({item.get("product")
                      for item in prices if item.get("product")})

    if not products:
        st.info("No products available yet.")
        st.stop()

    product = st.selectbox("Product", products)
    history = get_history(product)

    if not history:
        st.info("No history available for this product yet.")
        st.stop()

    prediction = get_prediction(product)
    df = pd.DataFrame(history).sort_values("date")

    top_cols = st.columns(4)
    top_cols[0].metric("Trend", prediction.get("trend", "unknown"))
    top_cols[1].metric("Predicted Price",
                       prediction.get("predicted_price", "n/a"))
    top_cols[2].metric("Action", prediction.get("action", "wait"))
    top_cols[3].metric(
        "Confidence", f"{prediction.get('confidence', 0) * 100:.0f}%")

    st.info(best_time_to_buy(prediction))
    st.write(prediction.get("reason", ""))

    st.subheader("Price History")
    st.line_chart(df.set_index("date")["price"])

    st.dataframe(df[["date", "location", "price"]],
                 use_container_width=True, hide_index=True)

    export_cols = st.columns(2)
    csv_data = df[["date", "location", "price"]].to_csv(
        index=False).encode("utf-8")
    export_cols[0].download_button(
        "Download CSV",
        data=csv_data,
        file_name=f"{product}-history.csv",
        mime="text/csv",
    )

    share_text = (
        f"PriceGuard AI: {product} | Trend: {prediction.get('trend')} | "
        f"Action: {prediction.get('action')} | Predicted: {prediction.get('predicted_price')}"
    )
    export_cols[1].code(share_text, language="text")

except ApiError as exc:
    st.warning(str(exc))
except Exception:
    st.error("Backend not reachable")
