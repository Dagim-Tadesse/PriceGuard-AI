import streamlit as st
from api import ApiError, add_price
st.set_page_config(layout="wide")
st.title("➕ Add Price")

with st.form("add_form"):
    product = st.text_input("Product Name")
    price = st.number_input("Price", min_value=0)
    location = st.text_input("Location")

    submitted = st.form_submit_button("Submit")

    if submitted:
        payload = {
            "product": product,
            "price": price,
            "location": location
        }

        try:
            add_price(payload)
            st.success("Added successfully")
            st.rerun()

        except ApiError as exc:
            st.error(str(exc))
        except Exception:
            st.error("Backend not reachable")
