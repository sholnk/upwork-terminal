# Inbox API

MVP email inbox integration for UpWork notifications.

## Endpoints

### 1. POST /api/inbox/ingest

Webhook endpoint for receiving email messages from external service (e.g., Postmark inbound webhook).

**Headers:**
```
x-inbox-token: <INBOX_WEBHOOK_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
  "from": "notifications@upwork.com",
  "subject": "New job: React Developer Needed",
  "snippet": "A client is looking for a React developer...",
  "rawBodyText": "Dear freelancer,\n\nA client has posted a new job...\n\nCheck it out: https://www.upwork.com/jobs/123456789-react-developer",
  "receivedAt": "2026-01-06T10:30:00Z",
  "provider": "forwarded_email"
}
```

**Response:**
```json
{
  "id": "clxxxxxxxxxxxx",
  "status": "created",
  "extractsCount": 2
}
```

---

### 2. GET /api/inbox/messages

List inbox messages with optional filtering.

**Query Parameters:**
- `status` - Filter by status: `new`, `processed`, `ignored` (optional)
- `q` - Search in subject and from (optional)
- `limit` - Max results (1-100, default 20)
- `offset` - Pagination offset (default 0)

**Example:**
```
GET /api/inbox/messages?status=new&limit=20&offset=0
```

**Response:**
```json
{
  "messages": [
    {
      "id": "clxxxxxxxxxxxx",
      "from": "notifications@upwork.com",
      "subject": "New job: React Developer Needed",
      "snippet": "A client is looking for a React developer...",
      "status": "new",
      "receivedAt": "2026-01-06T10:30:00Z",
      "createdJobId": null,
      "extractsCount": 2,
      "createdAt": "2026-01-06T10:30:00Z"
    }
  ],
  "total": 1,
  "limit": 20,
  "offset": 0
}
```

---

### 3. GET /api/inbox/messages/:id

Get detailed inbox message with all extracts.

**Example:**
```
GET /api/inbox/messages/clxxxxxxxxxxxx
```

**Response:**
```json
{
  "id": "clxxxxxxxxxxxx",
  "from": "notifications@upwork.com",
  "subject": "New job: React Developer Needed",
  "snippet": "A client is looking for a React developer...",
  "rawBodyText": "Dear freelancer,\n\nA client has posted a new job...\n\nCheck it out: https://www.upwork.com/jobs/123456789-react-developer",
  "status": "new",
  "receivedAt": "2026-01-06T10:30:00Z",
  "createdJobId": null,
  "extracts": [
    {
      "id": "clxxxxxxxxxxxx",
      "type": "job_link",
      "payloadJson": {
        "url": "https://www.upwork.com/jobs/123456789-react-developer"
      }
    },
    {
      "id": "clxxxxxxxxxxxx",
      "type": "text_extract",
      "payloadJson": {
        "text": "A client is looking for a React developer..."
      }
    }
  ],
  "createdAt": "2026-01-06T10:30:00Z",
  "updatedAt": "2026-01-06T10:30:00Z"
}
```

---

### 4. PATCH /api/inbox/messages/:id/status

Update message status.

**Request Body:**
```json
{
  "status": "processed"
}
```

**Response:**
```json
{
  "id": "clxxxxxxxxxxxx",
  "status": "processed",
  "updatedAt": "2026-01-06T10:35:00Z"
}
```

---

### 5. POST /api/inbox/messages/:id/create-job

Create a Job record from an Inbox message.

**Request Body:**
```json
{
  "jobUrl": "https://www.upwork.com/jobs/123456789-react-developer",
  "titleOverride": "Optional custom title"
}
```

**Response:**
```json
{
  "jobId": "clxxxxxxxxxxxx",
  "status": "created"
}
```

## Setup

1. **Generate webhook token:**
   ```bash
   openssl rand -base64 32
   ```

2. **Set environment variables:**
   ```bash
   INBOX_WEBHOOK_TOKEN=<generated_token>
   SINGLE_USER_ID=<your_user_id>
   ```

3. **Configure webhook in external service (e.g., Postmark):**
   - URL: `https://your-app.com/api/inbox/ingest`
   - Header: `x-inbox-token: <INBOX_WEBHOOK_TOKEN>`
   - Only forward UpWork notifications to reduce payload size

## MVP Principles

- No authentication required (uses SINGLE_USER_ID)
- Simple webhook token protection
- Auto-extracts URLs and keywords
- Converts job links to Job records
- Stores full email text for reference
