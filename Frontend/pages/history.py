import streamlit as st
from api import get_history

st.set_page_config(layout="wide")
st.title("📊 Price History")

try:
    data = get_history()

    if data:
        st.dataframe(data, use_container_width=True)
    else:
        st.info("No data available")

except:
    st.error("Backend not reachable")