# Phase 4 — GitHub Actions CI/CD

| Workflow   | File                               | Trigger                      | Target      |
|------------|------------------------------------|------------------------------|-------------|
| Staging    | `.github/workflows/staging.yml`    | Push to `staging` branch     | Preview     |
| Production | `.github/workflows/production.yml` | Manual `workflow_dispatch`   | Production  |

---

## 4.1 Required GitHub Secrets

| Secret              | Value                                               |
|---------------------|-----------------------------------------------------|
| `VERCEL_TOKEN`      | Same token as `sunbites-pos`                        |
| `VERCEL_ORG_ID`     | Same org ID as `sunbites-pos`                       |
| `VERCEL_PROJECT_ID` | Portal-specific project ID from Vercel dashboard    |

---

## 4.2 Branch Strategy

```
main ─────────────────────────────────── Production (manual deploy)
  │
  └── staging ──────────────────────────── Staging (auto-deploy on push)
        │
        └── feat/your-feature ─────────── Development (no deploy)
```

---

## 4.3 Verify

After first push to `staging`:
1. Quality checks pass (type-check, lint, tests)
2. `https://portal-staging.sunbites.com.ph` loads and API calls reach `api-staging.sunbites.com.ph`

For production:
1. GitHub → Actions → **Deploy to Production** → **Run workflow** → type `DEPLOY`
2. Approve the environment gate
3. Confirm `https://portal.sunbites.com.ph` is live

---

## Phase 4 Checklist

- [ ] `VERCEL_TOKEN` added to GitHub secrets
- [ ] `VERCEL_ORG_ID` added to GitHub secrets
- [ ] `VERCEL_PROJECT_ID` added to GitHub secrets
- [ ] Staging workflow triggered and succeeded
- [ ] Production workflow tested
