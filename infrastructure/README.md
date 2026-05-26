# Sunbites Portal — Infrastructure

Next.js parent portal deployed to **Vercel** with two environments.

| Environment | Branch    | URL                                      | Deploy          |
|-------------|-----------|------------------------------------------|-----------------|
| Staging     | `staging` | `https://portal-staging.sunbites.com.ph` | Auto on push    |
| Production  | `main`    | `https://portal.sunbites.com.ph`         | Manual trigger  |

---

## Stack

| Layer            | Service                         |
|------------------|---------------------------------|
| Hosting          | Vercel                          |
| Framework        | Next.js (App Router)            |
| API              | Sunbites Laravel API (Sanctum)  |
| Auth             | Laravel Sanctum Bearer tokens   |
| CI/CD            | GitHub Actions                  |

---

## Docs

| File                                                       | What it covers                                     |
|------------------------------------------------------------|----------------------------------------------------|
| [01-project-setup.md](01-project-setup.md)                 | Creating the project on Vercel, connecting GitHub  |
| [02-environments.md](02-environments.md)                   | Staging and production environment configuration   |
| [03-environment-variables.md](03-environment-variables.md) | All env vars per environment                       |
| [04-cicd.md](04-cicd.md)                                   | GitHub Actions workflows                           |

---

## Naming Convention

| Resource                 | Name                                    |
|--------------------------|-----------------------------------------|
| Vercel Project           | `sunbites-portal`                       |
| Staging branch           | `staging`                               |
| Production branch        | `main`                                  |
| Staging domain           | `portal-staging.sunbites.com.ph`        |
| Production domain        | `portal.sunbites.com.ph`                |
