import streamlit as st
from api import get_history, get_prices

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
        st.dataframe(data, use_container_width=True)
    else:
        st.info("No data available")

except Exception:
    st.error("Backend not reachable")
