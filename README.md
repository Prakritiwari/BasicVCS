# BasicVCS

A small version control tool built from scratch:

- Local commits in `.hidGit` (`init`, `add`, `commit`, `revert`)
- Remote sync to your own AWS S3 bucket (`push`, `pull`)
- React dashboard for repositories, commit history, issues and profiles
- Express API with JWT auth and presigned S3 uploads/downloads

## Structure

```
backend/
├── app.js                 # Express app (used by Vercel and local server)
├── server.js              # local server + Socket.IO
├── api/index.js           # Vercel serverless entry
├── db.js                  # cached MongoDB connection
├── routes/ controllers/ middleware/ model/
├── config/aws-config.js
└── cli/                   # standalone npm CLI (basicvcs-cli)

frontend-main/             # Vite + React client
```

## How the bridge works

```
CLI (.hidGit) ──POST presign──▶ API ──signs URLs──▶ S3
      └──────────PUT file──────────────────────────▶ S3
      └──────────GET history/download─────────────▶ API ──▶ S3
```

- Each website repository owns a prefix: `repos/<repoId>/commits/<commitId>/…`
- The CLI never stores AWS credentials. The API issues 15-minute presigned URLs for the repository owner.
- The repo page’s **History** tab reads commits from S3 through `GET /repo/:id/commits`.
- The CLI stores a 30-day token in `~/.basicvcs/config.json`; the web keeps its 1-hour JWT in `localStorage`.

## Local development

### Backend

```bash
cd backend
npm install
cp .env.example .env   # fill in Mongo + AWS values
npm start              # node server.js
```

API: `http://localhost:3000`.

### Frontend

```bash
cd frontend-main
npm install
npm run dev
```

Frontend: `http://localhost:5173`. It reads `VITE_API_URL` from `.env`.

### CLI (local)

```bash
cd backend
npm link               # links the backend bin shim
# or: cd backend/cli && npm link

basicvcs login --api http://localhost:3000
basicvcs link http://localhost:5173/repo/<repoId>
basicvcs init
basicvcs add index.html
basicvcs commit "first commit"
basicvcs push
```

`link` accepts a full repo URL or a raw 24-character id. It writes
`.hidGit/config.json`:

```json
{
  "repoId": "...",
  "repoName": "mywebsite",
  "s3Prefix": "repos/<repoId>/",
  "apiUrl": "http://localhost:3000"
}
```

Run CLI commands from your project folder, not `backend/`.

## Publishing the CLI

The CLI is its own package in `backend/cli`:

```bash
cd backend/cli
npm install
npm publish
```

Users install and configure:

```bash
npm i -g basicvcs-cli
basicvcs config set api https://your-api.vercel.app
basicvcs login
basicvcs link https://your-frontend.vercel.app/repo/<repoId>
```

GitHub-based installs work only if the CLI is its own repository at the package
root; npm is the recommended distribution.

## Deploying to Vercel (two projects)

### 1. Backend project

Root directory: `backend`

Environment variables:

```dotenv
MONGODB_URI=...
JWT_SECRET_KEY=...
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=ap-south-1
S3_BUCKET=basicvcsbucket
CORS_ORIGIN=https://your-frontend.vercel.app
```

- `vercel.json` rewrites all paths to `api/index.js`.
- Do **not** set `PORT`; Vercel manages it.
- Socket.IO is local-only (`server.js`); the deployed API is stateless.
- Mongo connections are cached across invocations in `db.js`.
- Add Vercel’s egress to the Atlas network allowlist (`0.0.0.0/0` for a demo).

### 2. Frontend project

Root directory: `frontend-main`

```dotenv
VITE_API_URL=https://your-api.vercel.app
```

`vercel.json` provides the SPA fallback. Set the same production URL in the CLI:

```bash
basicvcs config set api https://your-api.vercel.app
```

### AWS permissions

The backend IAM user/role needs:

```json
{
  "Effect": "Allow",
  "Action": ["s3:ListBucket"],
  "Resource": "arn:aws:s3:::basicvcsbucket",
  "Condition": { "StringLike": { "s3:prefix": ["repos/*"] } }
},
{
  "Effect": "Allow",
  "Action": ["s3:GetObject", "s3:PutObject"],
  "Resource": "arn:aws:s3:::basicvcsbucket/repos/*"
}
```

Keep the bucket private. CORS is not needed for CLI uploads because files go
directly from Node to the presigned URL.

## API surface

Public reads (private repositories require a token):

```
GET  /repo/all
GET  /repo/:id
GET  /repo/:id/commits
GET  /repo/:id/commits/download
GET  /userProfile/:id
```

Authenticated / owner-only:

```
POST /repo/create
PUT  /repo/update/:id
DELETE /repo/delete/:id
PATCH /repo/toggle/:id
POST /repo/:id/commits/presign
POST /issue/create
PUT  /issue/update/:id
DELETE /issue/delete/:id
GET  /issue/all?repository=:id
```

Auth: `POST /signup`, `POST /login` (1-hour web JWT), `POST /cli/login`
(30-day CLI token).

## Scripts

Backend:

```bash
npm start      # local server
npm run dev    # watch mode
npm run cli    # CLI via backend
```

Frontend:

```bash
npm run dev
npm run build
npm run lint
npm test
```

## Notes

- `aws-sdk` v2 is end-of-support; migrate to v3 when convenient.
- `add` currently flattens file names into staging (nested paths collide).
- Deleting a repository record does not remove its S3 objects.
- Old commits pushed before the per-repo prefix change live under `commits/` and
  will not appear in the new History tab; re-link and push them again.
