import pandas as pd
import streamlit as st

from api import ApiError, get_history, get_prices


def infer_region(location: str) -> str:
    location_lower = location.lower()

    region_keywords = [
        ("bole", "Addis Ababa - East"),
        ("kazanchis", "Addis Ababa - Central"),
        ("piassa", "Addis Ababa - Central"),
        ("merkato", "Addis Ababa - West"),
        ("lideta", "Addis Ababa - West"),
        ("megenagna", "Addis Ababa - North"),
        ("cmc", "Addis Ababa - North-East"),
        ("adama", "Oromia Corridor"),
        ("bishoftu", "Oromia Corridor"),
        ("hawassa", "Southern Corridor"),
        ("bahir dar", "Northern Corridor"),
        ("mekelle", "Northern Corridor"),
        ("gondar", "Northern Corridor"),
    ]

    for keyword, region in region_keywords:
        if keyword in location_lower:
            return region

    return "Unmapped"


st.set_page_config(page_title="PriceGuard AI - Compare", layout="wide")
st.title("📍 Compare Prices Across Locations")
st.caption("See where the same product is cheapest right now.")


try:
    prices = get_prices()
    products = sorted({item.get("product")
                      for item in prices if item.get("product")})

    if not products:
        st.info("No products available to compare yet.")
        st.stop()

    product = st.selectbox("Product", products)
    history = get_history(product)

    if not history:
        st.info("No history available for this product yet.")
        st.stop()

    df = pd.DataFrame(history)
    if df.empty:
        st.info("No data available for comparison.")
        st.stop()

    latest_by_location = (
        df.sort_values("date")
        .groupby("location", as_index=False)
        .tail(1)
        .sort_values("price")
        .reset_index(drop=True)
    )
    latest_by_location["region"] = latest_by_location["location"].apply(
        infer_region)

    cheapest = latest_by_location.iloc[0]
    priciest = latest_by_location.iloc[-1]

    summary_cols = st.columns(3)
    summary_cols[0].metric("Locations Tracked", len(latest_by_location))
    summary_cols[1].metric("Cheapest Location", str(cheapest["location"]))
    summary_cols[2].metric(
        "Price Gap", f"{priciest['price'] - cheapest['price']:.2f} ETB")

    st.success(
        f"Best place to buy now: {cheapest['location']} at {cheapest['price']} ETB"
    )

    chart_df = latest_by_location.set_index("location")["price"]
    st.bar_chart(chart_df)

    st.subheader("Region Overview")
    region_summary = (
        latest_by_location.groupby("region", as_index=False)
        .agg(
            locations_tracked=("location", "count"),
            average_price=("price", "mean"),
            min_price=("price", "min"),
            max_price=("price", "max"),
        )
        .sort_values("average_price")
    )

    region_cols = st.columns(3)
    region_cols[0].metric("Regions Covered", len(region_summary))
    region_cols[1].metric("Lowest Avg Region",
                          region_summary.iloc[0]["region"])
    region_cols[2].metric(
        "Highest Avg Region", region_summary.iloc[-1]["region"])

    st.bar_chart(region_summary.set_index("region")["average_price"])

    st.dataframe(
        latest_by_location[["location", "price", "date"]],
        use_container_width=True,
        hide_index=True,
    )

    st.dataframe(
        region_summary,
        use_container_width=True,
        hide_index=True,
    )

except ApiError as exc:
    st.warning(str(exc))
except Exception:
    st.error("Backend not reachable")
