# Webhooks & HTTP API

## Webhook Management

**Purpose**: Register HTTP endpoints or scripts that are triggered when email events occur (new mail, sync complete, etc.).

**When to use**: When the agent needs to react to incoming emails in real-time, trigger automated workflows on email events, or integrate with external services.

**Best practices**:
- Use `--events` to subscribe only to relevant event types — avoid catching everything.
- Use `webhook test` to verify delivery before relying on it in production.
- Use `--secret` for HMAC signature verification if the webhook endpoint is exposed.

### Event Types

| Event | Description |
|-------|-------------|
| `email:received` | New email arrived |
| `email:sent` | Email was sent |
| `email:read` | Email marked as read |
| `email:deleted` | Email deleted |
| `email:starred` | Email starred |
| `email:flagged` | Email flagged |
| `sync:completed` | Sync operation finished |
| `sync:error` | Sync operation failed |

### Commands

```bash
# Register a webhook
mail-cli webhook add <url> --events "email:received,email:sent"
mail-cli webhook add https://example.com/hook --events "email:received" --secret "my-secret"

# List configured webhooks
mail-cli webhook list

# Test a webhook (sends a test event)
mail-cli webhook test <webhook-id>

# Remove a webhook
mail-cli webhook remove <webhook-id>
```

### Webhook Payload

When an event fires, the registered URL receives an HTTP POST with a JSON body:

```json
{
  "type": "email:received",
  "timestamp": "2025-01-15T10:30:00.000Z",
  "data": {
    "emailId": 42,
    "from": "sender@example.com",
    "subject": "New proposal"
  },
  "accountId": "1"
}
```

## HTTP API Server

**Purpose**: Start a local REST API server that provides programmatic access to all email operations.

**When to use**: When the agent prefers HTTP requests over CLI commands, needs to integrate with web-based tools, or wants to discover available operations via OpenAPI documentation.

**Best practices**:
- The server binds to `127.0.0.1` by default (localhost only) for security.
- Only use `--allow-remote` if you explicitly need external access and understand the security implications.
- Use the Swagger UI at `/api/docs` to explore available endpoints interactively.
- Use the OpenAPI spec at `/api/openapi.json` for automated client generation.

### Starting the Server

```bash
mail-cli serve                          # Default: http://127.0.0.1:3000
mail-cli serve --port 8080              # Custom port
mail-cli serve --host 0.0.0.0           # Bind to all interfaces
mail-cli serve --allow-remote           # Allow non-localhost connections
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/api/docs` | Swagger UI (interactive API docs) |
| GET | `/api/openapi.json` | OpenAPI specification |
| GET | `/api/emails` | List emails (supports query params for filtering) |
| GET | `/api/emails/:id` | Get email details |
| POST | `/api/emails` | Send an email |
| POST | `/api/emails/:id/mark-read` | Mark email as read |
| POST | `/api/emails/:id/star` | Star an email |
| GET | `/api/accounts` | List accounts |
| POST | `/api/accounts` | Add an account |
| POST | `/api/sync` | Trigger sync |
| GET | `/api/sync/status` | Get sync status |

### Example: Agent Using HTTP API

```python
import requests

BASE = "http://localhost:3000"

# List unread emails
emails = requests.get(f"{BASE}/api/emails", params={"unread": True}).json()

# Read a specific email
email = requests.get(f"{BASE}/api/emails/42").json()

# Send an email
requests.post(f"{BASE}/api/emails", json={
    "to": "user@example.com",
    "subject": "Status update",
    "body": "All tasks completed."
})

# Trigger sync
requests.post(f"{BASE}/api/sync")
```
