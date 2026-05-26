# Phase 1 — Project Setup on Vercel

---

## 1.1 Create the Vercel Project

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **Import Git Repository** → select `sunbites-portal`
3. **Framework Preset**: Next.js (auto-detected)
4. **Root Directory**: `/`
5. **Build Command**: `npm run build`
6. **Install Command**: `npm ci`
7. Under **Environment Variables**, add:
   - Key: `NEXT_PUBLIC_API_URL` | Value: `https://api.sunbites.com.ph/api/v1` | Environment: **Production**
   - Key: `NEXT_PUBLIC_API_URL` | Value: `https://api-staging.sunbites.com.ph/api/v1` | Environment: **Preview**
8. Click **Deploy**

---

## 1.2 Collect Project Identifiers

```bash
# In the sunbites-portal directory
npx vercel link
cat .vercel/project.json
# → { "orgId": "team_xxx", "projectId": "prj_xxx" }
```

If the file is not created, get the values from the Vercel dashboard:
- **`VERCEL_PROJECT_ID`** → Project → Settings → General → Project ID
- **`VERCEL_ORG_ID`** → Team Settings → General → Team ID

---

## 1.3 Add GitHub Secrets

Go to `sunbites-portal` GitHub repo → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

| Secret              | Value                                    |
|---------------------|------------------------------------------|
| `VERCEL_TOKEN`      | Same token used for `sunbites-pos`       |
| `VERCEL_ORG_ID`     | Same org ID used for `sunbites-pos`      |
| `VERCEL_PROJECT_ID` | Project ID specific to `sunbites-portal` |

> `VERCEL_TOKEN` and `VERCEL_ORG_ID` are the same as `sunbites-pos` — only `VERCEL_PROJECT_ID` differs.

---

## 1.4 Create GitHub Environments

Go to `sunbites-portal` GitHub repo → **Settings** → **Environments**:

- **`staging`** — restrict to `staging` branch, no reviewers
- **`production`** — restrict to `main` branch, add required reviewer

---

## Phase 1 Checklist

- [ ] Vercel project created and named `sunbites-portal`
- [ ] First deployment succeeded
- [ ] `VERCEL_TOKEN` added to GitHub secrets
- [ ] `VERCEL_ORG_ID` added to GitHub secrets
- [ ] `VERCEL_PROJECT_ID` added to GitHub secrets
- [ ] GitHub `staging` environment created
- [ ] GitHub `production` environment created with required reviewers

---

**Next:** [02-environments.md](02-environments.md)
