import streamlit as st


def price_card(item):
    with st.container():
        st.markdown(f"### {item['product']}")
        st.write(f"📍 {item.get('location', '')}")
        st.write(f"💰 {item['price']} ETB")
        st.write(f"📈 Trend: {item.get('trend', 'unknown')}")

        if item["action"] == "buy_now":
            st.success("BUY NOW")
        else:
            st.error("WAIT")

        st.divider()
