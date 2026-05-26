# Phase 3 — Environment Variables

Set all variables in the Vercel dashboard under **Settings** → **Environment Variables**.

---

## Staging (Preview environment)

```env
NEXT_PUBLIC_API_URL=https://api-staging.sunbites.com.ph/api/v1
```

## Production

```env
NEXT_PUBLIC_API_URL=https://api.sunbites.com.ph/api/v1
```

---

## Key Differences

| Variable              | Staging                                          | Production                              |
|-----------------------|--------------------------------------------------|-----------------------------------------|
| `NEXT_PUBLIC_API_URL` | `https://api-staging.sunbites.com.ph/api/v1`     | `https://api.sunbites.com.ph/api/v1`    |

---

## Local Development

```bash
cp .env.example .env.local
# Set NEXT_PUBLIC_API_URL=http://api.sunbites.test/api/v1
```

---

## Phase 3 Checklist

- [ ] Staging `NEXT_PUBLIC_API_URL` set under **Preview** environment
- [ ] Production `NEXT_PUBLIC_API_URL` set under **Production** environment

---

**Next:** [04-cicd.md](04-cicd.md)
