# BatchFlow Frontend

A polished Next.js frontend for the Flask batch image processing proof-of-work.

It demonstrates the product idea:

> One failed image should not invalidate an otherwise successful batch.

## Stack

- Next.js 16.3.4
- React 19.2.7
- TypeScript
- Plain CSS
- Flask REST API backend

No UI/component library is required.

---

## Run it

### 1. Start the Flask backend

Use the backend project created for this proof-of-work.

By default it should run at:

```text
http://127.0.0.1:5000
```

Check it with:

```bash
curl http://127.0.0.1:5000/health
```

### 2. Install frontend packages

```bash
cd pixoate_batch_frontend
npm install
```

### 3. Configure the Flask URL

Copy the example environment file:

macOS / Linux:

```bash
cp .env.example .env.local
```

Windows PowerShell:

```powershell
Copy-Item .env.example .env.local
```

Default value:

```env
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:5000
```

### 4. Start Next.js

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

# Best demo flow

1. Select 4–6 valid JPG/PNG/WEBP files.
2. Enable **Demo retry flow**.
3. Click **Process images**.
4. Watch the per-file status update.
5. The first image intentionally fails once.
6. The other images should complete normally.
7. Click **Retry** on that file or **Retry all failed**.
8. The failed image should now succeed.
9. Click **Download successful**.

That visually demonstrates:

- partial failure isolation,
- bounded backend processing,
- per-file observability,
- retry behavior,
- preservation of successful work.

---

# Frontend → backend API contract

The UI calls:

```text
POST /api/batches
GET  /api/batches/:batchId
POST /api/batches/:batchId/retry
POST /api/files/:fileId/retry
GET  /api/batches/:batchId/download
```

## Upload request

The frontend sends `multipart/form-data`:

```text
files=<image>
files=<image>
simulateFailure=true   # optional
```

## Polling

While the batch is `pending` or `processing`, the UI polls approximately every
900 ms.

Polling stops once the batch becomes:

```text
completed
partial_failure
failed
```

Retrying a failed item moves the batch back into a running state and polling
starts again.

---

# Important backend CORS setting

The backend already allows these origins by default:

```text
http://localhost:3000
http://127.0.0.1:3000
```

If you deploy the frontend elsewhere, set the backend environment variable:

```env
CORS_ORIGINS=https://your-frontend-domain.com
```

---

# Files

```text
pixoate_batch_frontend/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── BatchFileRow.tsx
│   ├── BatchResults.tsx
│   ├── BatchWorkspace.tsx
│   ├── UploadDropzone.tsx
│   └── icons.tsx
├── lib/
│   ├── api.ts
│   ├── format.ts
│   └── types.ts
├── .env.example
├── .gitignore
├── next-env.d.ts
├── next.config.ts
├── package.json
├── tsconfig.json
└── README.md
```

---

# Production evolution

For a real production deployment, I would next consider:

- signed/direct-to-object-storage uploads for large files,
- SSE or WebSocket updates instead of polling,
- authentication and per-user batch ownership,
- backend pagination for very large batches,
- accessible file previews,
- resumable uploads,
- retention/cleanup policies,
- analytics around failure causes and retry success rate.

Those are intentionally not included in this small proof-of-work.
