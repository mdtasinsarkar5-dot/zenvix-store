# ZENVIX Store — Shared Orders & Delivery Settings

## Setup

1. Extract this ZIP and open the folder in VS Code.
2. In Supabase Dashboard → SQL Editor, run `SUPABASE_SETUP.sql`.
3. In Supabase Dashboard → Authentication → Users, create an admin email/password account.
4. Copy that account's UUID, then run the final `INSERT` example at the bottom of `SUPABASE_SETUP.sql` with the real UUID.
5. Run `index.html` using VS Code Live Server (or `python -m http.server 5500`). Avoid opening pages directly as `file://` URLs.
6. Open `admin.html`, sign in, then use **Delivery Settings** to set your courier label, origin district, local rate, Dhaka city rate, other-district rate, and optional area overrides.

## Pages

- `index.html` — home page
- `products.html` — product listing
- `product.html` — product details and image gallery
- `cart.html` — shopping cart
- `checkout.html` — checkout and automatic delivery calculation
- `admin.html` — admin login and dashboard

## Shared data and access

- Products continue to load from the existing Supabase `products` and `product_images` tables.
- Customer orders are inserted into `zenvix_orders` in Supabase. Admin users granted in `zenvix_admin_users` can view orders and update their status.
- Delivery settings are stored in `zenvix_delivery_settings`; checkout on other devices reads the same shared settings.
- Admin login uses Supabase Auth. Creating an Auth user alone does not grant admin permissions; its UUID must be added to `zenvix_admin_users`.
- `SUPABASE_SETUP.sql` creates the new tables and Row Level Security policies. Run it before testing this version.
- Never put a Supabase service-role key in browser JavaScript. Use only the public/publishable key in the frontend.
- Before public launch, add server-side order validation and abuse prevention (such as CAPTCHA/rate limiting), test RLS carefully, and replace demo catalog information with accurate supplier/product data.

## Delivery rules

Exact area overrides use one rule per line in this format:

`District | Area | Charge`

Checkout applies an exact area override first, then the Dhaka city rate, then the same-district/local rate, then the other-district rate. Applied delivery charge and the final total are saved with each order.
