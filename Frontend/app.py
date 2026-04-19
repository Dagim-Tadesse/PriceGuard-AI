import streamlit as st
from api import get_prices
from utils.ui import price_card
st.set_page_config(layout="wide")
st.markdown("### 🔍 Market Overview")
st.caption("Live price trends and AI recommendations")
st.set_page_config(page_title="PriceGuard AI", layout="wide")

st.title("📊 PriceGuard AI Dashboard")

try:
    data = get_prices()

    if not data:
        st.info("No data available")
    else:
        cols = st.columns(3)

        for i, item in enumerate(data):
            with cols[i % 3]:
                price_card(item)

except:
    st.error("Backend not reachable")