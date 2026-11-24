# RepairTrack API

Base URL: `http://localhost:4000/api/v1` · JSON in and out · protected routes need `Authorization: Bearer <accessToken>`.

Errors always look like:

```json
{ "error": { "code": "BAD_REQUEST", "message": "Please check the highlighted fields.", "details": { "fields": { "email": "Enter a valid email address." } } } }
```

| Code | HTTP | Meaning |
| --- | --- | --- |
| BAD_REQUEST | 400 | Validation failed; `details.fields` lists each field |
| UNAUTHORIZED | 401 | Missing, expired or invalid token, or wrong login |
| FORBIDDEN | 403 | Signed in but not allowed (role or shop) |
| NOT_FOUND | 404 | No such record or route |
| CONFLICT | 409 | Duplicate (for example, same shop registered twice) |
| TOO_MANY_REQUESTS | 429 | Rate limit hit |

## Health

`GET /health` → `{ "status": "ok", "database": "up" }`

## Auth (milestone 1)

| Method | Path | Body | Returns |
| --- | --- | --- | --- |
| POST | `/auth/login` | `{ email, password, shopId? }` | `{ accessToken, refreshToken, user, memberships, activeShop }` |
| POST | `/auth/refresh` | `{ refreshToken, shopId? }` | New session (old refresh token is revoked) |
| POST | `/auth/logout` | `{ refreshToken }` | 204 |
| GET | `/auth/me` | (none) | `{ user, memberships, activeShop }` |

- Access token: JWT, 15 minutes. Holds the user id and the active shop id.
- Refresh token: random string, 7 days, stored only as a SHA-256 hash, rotated on every refresh.
- Login is rate-limited to 20 attempts per 15 minutes per IP.

## Coming next

| Milestone | Endpoints |
| --- | --- |
| 20% | `POST /shops/register`, `GET/PATCH /shops/me`, `GET/POST /staff`, `PATCH /staff/:id` |
| 30% | `/customers`, `/tickets` (create, list, search, get, edit, cancel), `/tickets/:id/photos`, `/tickets/:id/qr` |
| 40% | `/tickets/:id/status`, `/tickets/:id/assign`, `/tickets/:id/notes`, `/tickets/:id/guest-link`, `GET /track/:token` |
