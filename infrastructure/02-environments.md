# Phase 2 — Environments

| Our Environment | Vercel Environment | Trigger                    | Domain                                   |
|-----------------|--------------------|----------------------------|------------------------------------------|
| Staging         | Preview            | Push to `staging` branch   | `portal-staging.sunbites.com.ph`         |
| Production      | Production         | Manual `workflow_dispatch` | `portal.sunbites.com.ph`                 |

---

## 2.1 Set Up the Staging Domain

1. Vercel Dashboard → `sunbites-portal` → **Settings** → **Domains** → **Add Existing**
2. Enter `portal-staging.sunbites.com.ph`
3. Set **Git Branch** to `staging`
4. Add the CNAME record Vercel provides to GoDaddy DNS:
   - **Type**: CNAME
   - **Name**: `portal-staging`
   - **Value**: `cname.vercel-dns.com`

---

## 2.2 Set Up the Production Domain

1. Vercel Dashboard → `sunbites-portal` → **Settings** → **Domains** → **Add Existing**
2. Enter `portal.sunbites.com.ph`
3. Add the CNAME record to GoDaddy DNS:
   - **Type**: CNAME
   - **Name**: `portal`
   - **Value**: `cname.vercel-dns.com`

---

## 2.3 Update Laravel API CORS

After the staging domain is live, add it to the Laravel staging API's `CORS_ALLOWED_ORIGINS`:

```
CORS_ALLOWED_ORIGINS=https://pos-staging.sunbites.com.ph,https://portal-staging.sunbites.com.ph
```

For production:

```
CORS_ALLOWED_ORIGINS=https://pos.sunbites.com.ph,https://portal.sunbites.com.ph
```

---

## Phase 2 Checklist

- [ ] `portal-staging.sunbites.com.ph` added to Vercel and linked to `staging` branch
- [ ] `portal.sunbites.com.ph` added to Vercel
- [ ] CNAME records added in GoDaddy for both domains
- [ ] `CORS_ALLOWED_ORIGINS` updated on the Laravel staging API

---

**Next:** [03-environment-variables.md](03-environment-variables.md)
