# JoshImg — private-admin image hosting

Frontend: Cloudflare Pages. Backend: Pages Functions (Workers runtime). Storage: R2. Metadata: D1.

## Features
- Admin-only login for uploads, listing, and deletion.
- Public viewer links at `/i/<id>`.
- Public direct image links at `/img/<id>`.
- Random IDs, MIME allowlist, size limit, basic security headers.
- No third-party image hosting.

## 1. Create new Cloudflare resources
Use a NEW project; this does not touch existing projects.

1. In Cloudflare Dashboard → R2, create bucket: `joshimg-images`.
2. In Workers & Pages → D1, create database: `joshimg-db`.
3. Open D1 Console and run `schema.sql` from this folder.
4. Create a NEW Pages project named `joshimg` (connect a new Git repo containing these files, or use Wrangler deploy steps below).

## 2. Bindings
In Pages project → Settings → Functions:
- R2 bucket binding: variable `IMAGES`, bucket `joshimg-images`
- D1 database binding: variable `DB`, database `joshimg-db`

## 3. Secrets / variables
Pages project → Settings → Variables and Secrets:
- Secret `ADMIN_PASSWORD`: choose a long, unique password.
- Secret `SESSION_SECRET`: use a random string at least 32 characters long.
- Variable `MAX_UPLOAD_MB`: `10` (optional; defaults to 10).

Do not put these secrets in HTML or commit them to Git.

## 4. Deploy
Deploy the project with Cloudflare Pages. Build command can be blank; output directory is `public`.
If deploying with Wrangler, install Node.js and run:
```bash
npm install
npx wrangler pages deploy public --project-name joshimg
```
Ensure the `functions/` folder is in the same project root as `public/` so Pages Functions are deployed. For Git-based deployment, commit the whole project folder and set build output directory to `public`; no build command is needed.

For Wrangler, create `wrangler.toml` and bind the resources before deploying, or configure bindings in the dashboard. `wrangler.toml.example` is provided as a starting point.

## 5. First use
Open `https://joshimg.pages.dev/admin` (actual subdomain may differ if taken), sign in using `ADMIN_PASSWORD`, upload a test image, and test both generated links in a private/incognito window.

## Routes
- `/admin` — admin interface
- `/api/login`, `/api/logout`, `/api/me`
- `/api/images` — admin list
- `/api/upload` — admin upload
- `/api/delete/<id>` — admin delete
- `/i/<id>` — public viewer
- `/img/<id>` — direct image response

## Notes
- This starter uses password-based admin authentication with signed HttpOnly cookies. Use a strong unique password and SESSION_SECRET.
- Public links are intentionally public: anyone with a link can view the image. Do not upload sensitive/private images.
- Deleting removes the object and metadata, so the links stop working.
- Basic per-request checks are included, but this is not a full anti-abuse platform. If opening public access widely, consider Cloudflare Turnstile, rate limiting, quotas, and abuse reporting.
