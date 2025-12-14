# Dating Chat Interface - API Documentation

## Table of Contents

1. [Component API](#component-api)
2. [Utilities API](#utilities-api)
3. [Webhook API](#webhook-api)
4. [TypeScript Interfaces](#typescript-interfaces)
5. [State Management](#state-management)
6. [Error Handling](#error-handling)

---

## Component API

### DatingChatInterface

Main component for rendering the cyberpunk dating chat interface.

**Location:** `components/dating-chat-interface.tsx`

**Props:**

```typescript
interface DatingChatInterfaceProps {
  targetAlias: string; // Name/alias of the person being chatted with (required)
  targetAvatar?: string; // URL to avatar image (optional)
}
```

**Usage:**

```tsx
import DatingChatInterface from "@/components/dating-chat-interface";

export default function ChatPage() {
  return (
    <DatingChatInterface
      targetAlias="NeonRonin"
      targetAvatar="https://example.com/avatar.jpg"
    />
  );
}
```

**Internal States:**

- `'idle'` - Initial state, waiting for user to send invite
- `'inviting'` - User clicked invite, showing loading (500ms)
- `'waiting'` - Invite sent, waiting for acceptance (6-10s)
- `'active'` - Chat is active, ready to send/receive messages
- `'error'` - Error state (optional)

**Features:**

| Feature             | Details                                       |
| ------------------- | --------------------------------------------- |
| Session Tracking    | Automatic UUID generation per conversation    |
| Message Persistence | State-based only (no localStorage by default) |
| Auto-scroll         | Automatically scrolls to latest message       |
| Keyboard Support    | Enter key sends message                       |
| Responsive          | Mobile and desktop support                    |
| Animations          | Cyberpunk glitch effects and neon glows       |

---

## Utilities API

### Import

```typescript
import {
  createChatSession,
  createMessage,
  sendMessageViaWebhook,
  SessionStorage,
  getRandomStatus,
  getRandomWaitTime,
  formatTime,
  formatTimestamp,
  formatMessageDisplay,
  isSystemMessage,
  getStatusMessage,
  retryRequest,
  debounce,
  throttle,
} from "@/lib/chat-utils";
```

### Functions

#### `createChatSession(targetAlias: string, targetId?: string): ChatSession`

Creates a new chat session object.

```typescript
const session = createChatSession("NeonRonin", "profile-123");
// Returns: {
//   sessionId: 'uuid-string',
//   targetAlias: 'NeonRonin',
//   targetId: 'profile-123',
//   createdAt: Date,
//   messages: []
// }
```

#### `createMessage(sender: 'user' | 'ai' | 'system', message: string, status?: string): ChatMessage`

Creates a new message object.

```typescript
const userMsg = createMessage("user", "Hello!");
const aiMsg = createMessage("ai", response.output);
const sysMsg = createMessage("system", "[CONNECTED]");
```

#### `sendMessageViaWebhook(payload: WebhookPayload, webhookUrl: string): Promise<WebhookResponse>`

Sends a message to the webhook and returns AI response.

```typescript
const response = await sendMessageViaWebhook(
  {
    message: "Hello how are you?",
    chatSessionUUIDS: "697e363a-7590-4b98-981b-83358f2f87ca",
  },
  "https://mrabeel.app.n8n.cloud/webhook/..."
);

console.log(response.output); // AI response
```

**Error Handling:**

```typescript
try {
  const response = await sendMessageViaWebhook(payload, url);
} catch (error) {
  console.error("Webhook failed:", error);
  // Error includes: HTTP status, network errors, JSON parse errors
}
```

#### `getRandomStatus(): string`

Returns a random sci-fi status message for loading UI.

```typescript
const status = getRandomStatus();
// Returns one of:
// 'scanning...', 'encrypting...', 'decrypting...', 'transmitting...',
// 'handshaking...', 'synchronizing...', 'buffering...', 'quantum-linking...'
// + 7 more advanced statuses
```

#### `getRandomWaitTime(): number`

Returns random wait time in milliseconds (6000-10000ms).

```typescript
const waitMs = getRandomWaitTime(); // 6000-10000
const waitSeconds = waitMs / 1000; // 6-10
```

#### `formatTime(date: Date): string`

Formats time for chat display (HH:MM).

```typescript
formatTime(new Date()); // "14:35"
```

#### `formatTimestamp(date: Date): string`

Formats full timestamp with date.

```typescript
formatTimestamp(new Date()); // "2025-12-14 14:35:42"
```

#### `getStatusMessage(type: 'transmitting' | 'decrypting' | 'connecting' | 'accepted'): string`

Returns formatted status message.

```typescript
getStatusMessage("transmitting"); // "[TRANSMITTING...]"
getStatusMessage("decrypting"); // "[DECRYPTING...]"
getStatusMessage("connecting"); // "[INITIALIZING CONTACT PROTOCOL]"
getStatusMessage("accepted"); // "[TRANSMISSION ACCEPTED]"
```

#### `isSystemMessage(message: string): boolean`

Checks if a message is a system message.

```typescript
isSystemMessage("[TRANSMITTING...]"); // true
isSystemMessage("Hello"); // false
```

#### `retryRequest<T>(fn: () => Promise<T>, maxRetries?: number, delay?: number): Promise<T>`

Retries a failed request up to maxRetries times with exponential backoff.

```typescript
const response = await retryRequest(
  () => sendMessageViaWebhook(payload, url),
  3, // max retries
  1000 // initial delay in ms
);
```

#### `debounce<T>(func: T, wait: number): (...args) => void`

Debounces function execution.

```typescript
const debouncedSearch = debounce((query: string) => {
  console.log("Searching for:", query);
}, 300);

input.addEventListener("input", (e) => debouncedSearch(e.target.value));
```

#### `throttle<T>(func: T, limit: number): (...args) => void`

Throttles function execution.

```typescript
const throttledScroll = throttle(() => {
  console.log("Scroll event");
}, 200);

window.addEventListener("scroll", throttledScroll);
```

### SessionStorage Object

Persistent storage for chat sessions using localStorage.

```typescript
// Save session
SessionStorage.save(session);

// Load session
const session = SessionStorage.load("session-id");

// Delete session
SessionStorage.delete("session-id");

// Get all sessions
const allSessions = SessionStorage.getAll();

// Clear all sessions
SessionStorage.clearAll();
```

### Constants

#### `SCI_FI_STATUSES`

Array of sci-fi status messages for loading UI:

```typescript
const SCI_FI_STATUSES = [
  "scanning...",
  "encrypting...",
  "decrypting...",
  "transmitting...",
  "handshaking...",
  "synchronizing...",
  "buffering...",
  "quantum-linking...",
  "initializing quantum entanglement...",
  "calibrating neural link...",
  "bypassing firewall...",
  "patching security protocol...",
  "hacking defense systems...",
  "loading consciousness...",
  "merging data streams...",
];
```

---

## Webhook API

### Endpoint

```
POST https://mrabeel.app.n8n.cloud/webhook/e152d4ad-78ed-4b42-893e-4a49373882ad
```

### Request Format

```json
{
  "message": "User's message text",
  "chatSessionUUIDS": "unique-session-uuid"
}
```

**Fields:**

| Field              | Type   | Description                               |
| ------------------ | ------ | ----------------------------------------- |
| `message`          | string | The user's message (required)             |
| `chatSessionUUIDS` | string | UUID for conversation tracking (required) |

**Example:**

```bash
curl -X POST "https://mrabeel.app.n8n.cloud/webhook/..." \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello how are you?",
    "chatSessionUUIDS": "697e363a-7590-4b98-981b-83358f2f87ca"
  }'
```

### Response Format

```json
{
  "output": "AI response message",
  "additional_field": "optional"
}
```

**Fields:**

| Field    | Type   | Description                                         |
| -------- | ------ | --------------------------------------------------- |
| `output` | string | The AI's response message (required)                |
| Other    | any    | Additional fields from webhook (ignored by default) |

**Example Response:**

```json
{
  "output": "Ah, greetings, fleshy traveler. I am Klyrra of the Vynthari collective. My bio-sensors report a steady pulse—energy levels balancing in low gravity. How fares your spirit in this vast cosmic web?"
}
```

### Response Codes

| Code | Status       | Meaning                               |
| ---- | ------------ | ------------------------------------- |
| 200  | OK           | Request successful, response received |
| 400  | Bad Request  | Invalid request format                |
| 401  | Unauthorized | Authentication failed                 |
| 404  | Not Found    | Webhook URL not found                 |
| 500  | Server Error | Webhook processing error              |

### Error Handling

The component automatically handles:

- Network errors
- Timeout errors (default 30s)
- Invalid response format
- Missing `output` field

When error occurs, displays:

```
[ERROR]

Connection interrupted. Quantum link compromised.
```

---

## TypeScript Interfaces

### ChatMessage

```typescript
interface ChatMessage {
  id: string; // Unique message ID (UUID)
  sender: "user" | "ai" | "system"; // Message sender type
  message: string; // Message content
  timestamp: Date; // When message was created
  status?: "sent" | "delivered" | "read" | "pending"; // Optional delivery status
}
```

### ChatSession

```typescript
interface ChatSession {
  sessionId: string; // Unique session ID (UUID)
  targetAlias: string; // Name of the person being chatted with
  targetId?: string; // Optional profile ID
  createdAt: Date; // When session was created
  messages: ChatMessage[]; // Array of all messages in session
}
```

### WebhookPayload

```typescript
interface WebhookPayload {
  message: string; // User's message
  chatSessionUUIDS: string; // Conversation UUID (note: UUIDS not UUID)
}
```

### WebhookResponse

```typescript
interface WebhookResponse {
  output: string; // AI response message
  [key: string]: any; // Additional optional fields
}
```

### DatingChatInterfaceProps

```typescript
interface DatingChatInterfaceProps {
  targetAlias: string; // Name of chat partner (required)
  targetAvatar?: string; // Avatar URL (optional)
}
```

---

## State Management

### Component State Variables

| Variable          | Type          | Purpose                              |
| ----------------- | ------------- | ------------------------------------ |
| `chatSessionUUID` | string        | Unique session identifier            |
| `chatState`       | ChatState     | Current lifecycle state              |
| `messages`        | ChatMessage[] | All messages in conversation         |
| `inputValue`      | string        | Current text input value             |
| `isLoading`       | boolean       | Whether waiting for webhook response |
| `waitingTime`     | number        | Seconds elapsed in waiting room      |
| `currentStatus`   | string        | Current sci-fi status message        |
| `statusIndex`     | number        | Index in status message rotation     |

### State Flow

```
IDLE
  ↓ [User clicks Invite]
INVITING (500ms animation)
  ↓ [Timer completes]
WAITING (6-10s random)
  ↓ [Random timer completes]
ACTIVE
  ↓ [User sends message]
  [Add user message + transmitting status]
  [Send webhook request]
  [Add decrypting status]
  [Display AI response]
```

---

## Error Handling

### Webhook Errors

**Caught Automatically:**

```typescript
try {
  const response = await fetch(WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, chatSessionUUIDS }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
} catch (error) {
  // Display error message to user
  setMessages((prev) => [
    ...prev,
    {
      id: uuidv4(),
      sender: "ai",
      message: "[ERROR]\n\nConnection interrupted. Quantum link compromised.",
      timestamp: new Date(),
    },
  ]);
}
```

### Network Errors

Handled by fetch API:

- Connection refused
- Timeout
- CORS errors
- DNS errors

### Data Validation

- Message must be non-empty string
- UUID validation not strict (accepts any string)
- Output field checked for existence
- Responses must be valid JSON

### User Feedback

Error states show:

```
[ERROR]

Connection interrupted. Quantum link compromised.
```

Allows user to retry without losing conversation history.

---

## Examples

### Example 1: Send Message and Handle Response

```typescript
const sendMessage = async (text: string) => {
  // Add user message to display
  const userMsg = createMessage("user", text);
  setMessages((prev) => [...prev, userMsg]);

  // Show transmitting status
  setMessages((prev) => [
    ...prev,
    createMessage("system", "[TRANSMITTING...]"),
  ]);

  try {
    // Send to webhook
    const response = await sendMessageViaWebhook(
      {
        message: text,
        chatSessionUUIDS: sessionId,
      },
      WEBHOOK_URL
    );

    // Remove transmitting, show decrypting
    setMessages((prev) =>
      prev.filter((m) => m.message !== "[TRANSMITTING...]")
    );
    setMessages((prev) => [
      ...prev,
      createMessage("system", "[DECRYPTING...]"),
    ]);

    // Wait 1.5s then show response
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setMessages((prev) => prev.filter((m) => m.message !== "[DECRYPTING...]"));

    const aiMsg = createMessage("ai", response.output);
    setMessages((prev) => [...prev, aiMsg]);
  } catch (error) {
    console.error("Error:", error);
    setMessages((prev) => [
      ...prev,
      createMessage(
        "system",
        "[ERROR]\n\nConnection interrupted. Quantum link compromised."
      ),
    ]);
  }
};
```

### Example 2: Persist Sessions

```typescript
// Save session after each message
const addMessage = (msg: ChatMessage) => {
  const updatedSession = {
    ...session,
    messages: [...session.messages, msg],
  };
  SessionStorage.save(updatedSession);
  setSession(updatedSession);
};

// Load session on page load
useEffect(() => {
  const saved = SessionStorage.load(sessionId);
  if (saved) {
    setSession(saved);
  }
}, [sessionId]);
```

### Example 3: Retry Failed Requests

```typescript
const sendWithRetry = async (text: string) => {
  try {
    const response = await retryRequest(
      () =>
        sendMessageViaWebhook(
          {
            message: text,
            chatSessionUUIDS: sessionId,
          },
          WEBHOOK_URL
        ),
      3, // Retry up to 3 times
      1000 // Start with 1s delay
    );

    // Handle success...
  } catch (error) {
    // All retries failed
    console.error("All retries failed:", error);
  }
};
```

---

**Last Updated:** December 14, 2025  
**Version:** 1.0.0  
**Status:** Production Ready
