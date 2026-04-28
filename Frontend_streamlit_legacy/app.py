import streamlit as st
from api import get_history, get_prices
from utils.ui import price_card

st.set_page_config(page_title="PriceGuard AI", layout="wide")

DEMO_ACCOUNTS = {
    "Buyer Demo": {"password": "priceguard", "role": "Buyer"},
    "Seller Demo": {"password": "priceguard", "role": "Seller"},
    "Admin Demo": {"password": "priceguard", "role": "Admin"},
}

if "watchlist" not in st.session_state:
    st.session_state.watchlist = []

if "accessibility_mode" not in st.session_state:
    st.session_state.accessibility_mode = False

if "dashboard_role" not in st.session_state:
    st.session_state.dashboard_role = "Buyer"

if "logged_in" not in st.session_state:
    st.session_state.logged_in = False

if "demo_user" not in st.session_state:
    st.session_state.demo_user = ""

st.sidebar.title("Demo Login")

if not st.session_state.logged_in:
    with st.sidebar.form("demo_login_form"):
        account = st.selectbox("Account", list(DEMO_ACCOUNTS.keys()))
        password = st.text_input("Password", type="password")
        submitted = st.form_submit_button("Sign in")

    if submitted:
        expected_password = DEMO_ACCOUNTS[account]["password"]
        if password == expected_password:
            st.session_state.logged_in = True
            st.session_state.demo_user = account
            st.session_state.dashboard_role = DEMO_ACCOUNTS[account]["role"]
            st.rerun()
        st.sidebar.error("Invalid demo credentials.")

    st.sidebar.caption("Use any demo account with password `priceguard`.")
    st.info("Sign in with a demo account to continue.")
    st.stop()

st.sidebar.success(f"Signed in as {st.session_state.demo_user}")
if st.sidebar.button("Sign out"):
    st.session_state.logged_in = False
    st.session_state.demo_user = ""
    st.rerun()

st.sidebar.divider()
st.sidebar.checkbox(
    "Accessibility mode",
    value=st.session_state.accessibility_mode,
    help="Use larger text and stronger contrast for easier reading.",
    key="accessibility_mode",
)

st.sidebar.selectbox(
    "Role view",
    ["Buyer", "Seller", "Admin"],
    index=["Buyer", "Seller", "Admin"].index(st.session_state.dashboard_role),
    help="Switch the dashboard lens for the current audience.",
    key="dashboard_role",
)

accessibility_css = """
        .priceguard-hero {
            padding: 1.5rem 1.45rem;
            border-radius: 1.25rem;
            background: linear-gradient(135deg, rgba(15,23,42,0.98), rgba(7,89,133,0.92));
            color: white;
            margin-bottom: 1rem;
            border: 2px solid rgba(255,255,255,0.2);
            box-shadow: 0 18px 45px rgba(15, 23, 42, 0.28);
        }
        .priceguard-hero h1 {
            margin: 0;
            font-size: 2.2rem;
            line-height: 1.05;
        }
        .priceguard-hero p {
            margin: 0.55rem 0 0;
            font-size: 1.05rem;
            opacity: 0.98;
        }
        .priceguard-subtle {
            color: #0f172a;
            margin-top: 0.35rem;
            font-weight: 600;
        }
    """ if st.session_state.accessibility_mode else """
        .priceguard-hero {
            padding: 1.35rem 1.4rem;
            border-radius: 1.2rem;
            background: linear-gradient(135deg, rgba(17,24,39,0.96), rgba(15,118,110,0.85));
            color: white;
            margin-bottom: 1rem;
            border: 1px solid rgba(255,255,255,0.12);
            box-shadow: 0 18px 45px rgba(15, 23, 42, 0.2);
        }
        .priceguard-hero h1 {
            margin: 0;
            font-size: 2rem;
            line-height: 1.1;
        }
        .priceguard-hero p {
            margin: 0.5rem 0 0;
            font-size: 1rem;
            opacity: 0.92;
        }
        .priceguard-subtle {
            color: #475569;
            margin-top: 0.35rem;
        }
    """

st.markdown(
    f"""
    <style>
        {accessibility_css}
    </style>
    <div class="priceguard-hero">
        <h1>PriceGuard AI</h1>
        <p>Know when to buy, when to wait, and where prices are moving.</p>
    </div>
    """,
    unsafe_allow_html=True,
)

try:
    data = get_prices()

    if not data:
        st.info(
            "No price data yet. Add a product to see live trends and recommendations.")
    else:
        role = st.session_state.dashboard_role

        if role == "Buyer":
            st.success(
                "Buyer view: focus on buy-now signals, price drops, and comparison across locations.")
        elif role == "Seller":
            st.warning(
                "Seller view: watch for rising prices, demand pressure, and products that need attention.")
        else:
            st.info(
                "Admin view: monitor overall coverage, trend balance, and high-risk price changes.")

        if st.session_state.watchlist:
            st.sidebar.write(
                f"Pinned products: {len(st.session_state.watchlist)}")
            for product in st.session_state.watchlist:
                st.sidebar.markdown(f"- {product}")
            if st.sidebar.button("Clear watchlist"):
                st.session_state.watchlist = []
                st.rerun()
        else:
            st.sidebar.info("Pin products here to track them during the demo.")

        all_products = sorted({item.get("product")
                              for item in data if item.get("product")})
        all_locations = sorted({item.get("location")
                               for item in data if item.get("location")})

        filter_cols = st.columns([2, 2, 1])
        search_term = filter_cols[0].text_input(
            "Search product", placeholder="Type a product name")
        selected_location = filter_cols[1].selectbox(
            "Location", ["All locations", *all_locations])
        trend_filter = filter_cols[2].selectbox(
            "Trend", ["All", "increasing", "stable", "decreasing"])

        filtered_data = data
        if search_term:
            term = search_term.lower().strip()
            filtered_data = [
                item for item in filtered_data if term in item.get("product", "").lower()]
        if selected_location != "All locations":
            filtered_data = [item for item in filtered_data if item.get(
                "location") == selected_location]
        if trend_filter != "All":
            filtered_data = [item for item in filtered_data if item.get(
                "trend") == trend_filter]

        alerts = []
        for item in data:
            product = item.get("product")
            if not product:
                continue
            try:
                history = list(reversed(get_history(product)))
                if len(history) >= 2:
                    previous_price = float(history[-2].get("price", 0) or 0)
                    current_price = float(history[-1].get("price", 0) or 0)
                    if previous_price and current_price > previous_price * 1.08:
                        alerts.append(
                            (product, current_price - previous_price, item.get("location", "")))
            except Exception:
                continue

        product_count = len(data)
        increasing_count = sum(
            1 for item in data if item.get("trend") == "increasing")
        buy_now_count = sum(
            1 for item in data if item.get("action") == "buy_now")
        location_count = len(all_locations)

        if role == "Admin":
            summary_cols = st.columns(4)
            summary_cols[0].metric("Tracked Products", product_count)
            summary_cols[1].metric("Increasing Trends", increasing_count)
            summary_cols[2].metric("Buy Now Signals", buy_now_count)
            summary_cols[3].metric("Locations Covered", location_count)
        elif role == "Seller":
            summary_cols = st.columns(3)
            summary_cols[0].metric("Tracked Products", product_count)
            summary_cols[1].metric("Rising Trends", increasing_count)
            summary_cols[2].metric("Priority Alerts", len(alerts))
        else:
            summary_cols = st.columns(3)
            summary_cols[0].metric("Tracked Products", product_count)
            summary_cols[1].metric("Increasing Trends", increasing_count)
            summary_cols[2].metric("Buy Now Signals", buy_now_count)

        st.divider()
        st.subheader("Live Recommendations")
        st.caption(
            f"Showing {len(filtered_data)} of {len(data)} tracked products")

        if alerts:
            st.subheader("Price Alerts")
            for product, delta, location in alerts[:3]:
                st.warning(
                    f"{product} at {location} jumped by {delta:.2f} ETB recently.")

        if not filtered_data:
            st.info("No products match the current filters.")
            st.stop()

        cols = st.columns(2)

        for i, item in enumerate(filtered_data):
            with cols[i % 2]:
                watched = item["product"] in st.session_state.watchlist
                price_card(item, watched=watched)

                button_label = "Remove from watchlist" if watched else "Add to watchlist"
                if st.button(button_label, key=f"watch-{item['product']}"):
                    if watched:
                        st.session_state.watchlist = [
                            product for product in st.session_state.watchlist if product != item["product"]
                        ]
                    else:
                        st.session_state.watchlist = sorted(
                            set(st.session_state.watchlist + [item["product"]])
                        )
                    st.rerun()

except Exception:
    st.error("Backend not reachable")
