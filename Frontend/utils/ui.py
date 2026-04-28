import streamlit as st


def price_card(item, watched=False):
    with st.container(border=True):
        action = item.get("action", "wait")
        status_label = "BUY NOW" if action == "buy_now" else "WAIT"
        status_class = "success" if action == "buy_now" else "warning"

        title = f"⭐ {item['product']}" if watched else item['product']
        st.markdown(f"#### {title}")
        st.caption(
            f"{item.get('location', '')} • Trend: {item.get('trend', 'unknown')}")
        st.metric("Current Price", f"{item['price']} ETB")

        if status_class == "success":
            st.success(status_label)
        else:
            st.warning(status_label)
