import streamlit as st
from api import add_price
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
            res = add_price(payload)

            if res.status_code == 200:
                st.success("Added successfully")
            else:
                st.error("Failed")

        except:
            st.error("Backend not reachable")