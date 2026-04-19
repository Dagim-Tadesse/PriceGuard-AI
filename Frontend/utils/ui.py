import streamlit as st
st.set_page_config(layout="wide")
def price_card(item):
    with st.container():
        st.markdown(f"### {item['product']}")
        st.write(f"💰 {item['price']} ETB")
        st.write(f"📊 {item['prediction']}")

        if item["action"] == "buy_now":
            st.success("BUY NOW")
        else:
            st.error("WAIT")

        st.divider()