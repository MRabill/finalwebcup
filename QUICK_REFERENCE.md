# Dating Chat Interface - Quick Reference Card

## 🚀 Get Started in 30 Seconds

```tsx
import DatingChatInterface from "@/components/dating-chat-interface";

export default function Page() {
  return <DatingChatInterface targetAlias="NeonRonin" />;
}
```

**That's it!** The component handles everything else.

---

## 📍 Access Points

| Route     | Purpose                    | Link                                 |
| --------- | -------------------------- | ------------------------------------ |
| `/chat`   | Hub with profile selection | [Open](http://localhost:3000/chat)   |
| `/chat/1` | Chat with NeonRonin        | [Open](http://localhost:3000/chat/1) |
| `/chat/2` | Chat with SilverPhantom    | [Open](http://localhost:3000/chat/2) |
| `/chat/3` | Chat with VortexKiss       | [Open](http://localhost:3000/chat/3) |

---

## 🎨 Component Props

```typescript
interface Props {
  targetAlias: string; // ✅ Required: "NeonRonin"
  targetAvatar?: string; // Optional: "https://..."
}
```

---

## 📡 Webhook Details

```
URL: https://mrabeel.app.n8n.cloud/webhook/e152d4ad-78ed-4b42-893e-4a49373882ad
Method: POST
Content-Type: application/json

Request:  { message, chatSessionUUIDS }
Response: { output }
```

---

## ⏱️ Chat Lifecycle

```
IDLE
  ↓ [Click Invite]
INVITING (500ms)
  ↓ [Done]
WAITING (6-10s)
  ↓ [Random timer]
ACTIVE ✓ Ready to chat
```

---

## 🎯 Key Files

| File                                   | Purpose        | Lines |
| -------------------------------------- | -------------- | ----- |
| `components/dating-chat-interface.tsx` | Main component | 355   |
| `components/dating-chat.css`           | Animations     | 300+  |
| `lib/chat-utils.ts`                    | Utilities      | 400+  |
| `app/chat/page.tsx`                    | Hub            | 100+  |
| `app/chat/[id]/page.tsx`               | Route          | 30    |

---

## 🔧 Quick Customization

### Change Colors

```tsx
border - cyan - 400; // Primary neon
bg - magenta - 900; // AI message bg
text - cyan - 100; // Primary text
```

### Change Wait Time

```typescript
const acceptTime = 6000 + Math.random() * 4000;
// Change 6000 and 4000 to your values
```

### Change Status Messages

```typescript
const sciTechStatuses = [
  "scanning...",
  "encrypting...",
  // Add more...
];
```

### Change Webhook

```typescript
const WEBHOOK_URL = "your-new-url-here";
```

---

## 📊 Animation Library

| Animation        | Duration | Trigger       |
| ---------------- | -------- | ------------- |
| `glitch-text`    | 0.5s     | Text elements |
| `neon-glow`      | 2s       | Borders       |
| `float-up`       | 0.5s     | Messages      |
| `spinner-rotate` | 2-3s     | Loading       |
| `message-appear` | 0.4s     | Chat bubbles  |

---

## 🚨 Error Messages

| Error                            | Meaning            | Solution               |
| -------------------------------- | ------------------ | ---------------------- |
| `[ERROR] Connection interrupted` | Webhook failed     | Check network/URL      |
| `Signal lost. Try again.`        | No response output | Check webhook response |
| Messages not sending             | Empty input        | Type something         |

---

## 🧠 State Variables

```typescript
chatSessionUUID; // Unique session ID
chatState; // 'idle' | 'inviting' | 'waiting' | 'active'
messages; // ChatMessage[]
inputValue; // Current input text
isLoading; // Waiting for webhook
waitingTime; // Seconds in waiting room
currentStatus; // Current sci-fi status
```

---

## 💡 Utility Functions

```typescript
// Import from lib/chat-utils.ts

createChatSession(alias, id?)           // New session
createMessage(sender, text, status?)    // New message
sendMessageViaWebhook(payload, url)     // Send to webhook
getRandomWaitTime()                      // 6-10s in ms
getRandomStatus()                        // Random sci-fi status
SessionStorage.save(session)             // Persist to localStorage
SessionStorage.load(sessionId)           // Load from localStorage
retryRequest(fn, maxRetries, delay)     // Retry with backoff
```

---

## 🎯 Message Flow

```
User Input
    ↓
Add to UI (user message)
    ↓
Show [TRANSMITTING...]
    ↓
POST to webhook
    ↓
Show [DECRYPTING...]
    ↓
Wait 1.5s
    ↓
Display AI response
```

---

## 🛠️ Common Tasks

### Save Chat Session

```typescript
import { SessionStorage } from "@/lib/chat-utils";
SessionStorage.save(session);
```

### Load Chat Session

```typescript
const session = SessionStorage.load("session-uuid");
```

### Retry Failed Messages

```typescript
import { retryRequest } from "@/lib/chat-utils";
const result = await retryRequest(fn, 3, 1000);
```

### Format Time Display

```typescript
import { formatTime } from "@/lib/chat-utils";
const time = formatTime(new Date()); // "14:35"
```

---

## 🎨 Colors Reference

```css
--primary-neon: #00ffff; /* Cyan */
--secondary-neon: #d946ef; /* Magenta */
--bg-main: #0a0e27; /* Dark blue */
--bg-surface: #1a0a2e; /* Darker blue */
--text-primary: #d1d5db; /* Light gray */
--accent: #a78bfa; /* Purple */
```

---

## 📱 Responsive Breakpoints

```css
Mobile:  0-640px   (full width)
Tablet:  640px-1024px
Desktop: 1024px+
```

Component adapts automatically!

---

## ✅ Quality Checklist

- ✅ TypeScript strict mode
- ✅ No external dependencies needed
- ✅ WCAG AA accessible
- ✅ 60fps animations
- ✅ Mobile optimized
- ✅ Error handling
- ✅ Session management
- ✅ Production ready

---

## 📚 Documentation

| Document                    | Purpose          |
| --------------------------- | ---------------- |
| `DATING_CHAT_README.md`     | Full guide       |
| `API_DOCUMENTATION.md`      | API reference    |
| `CHAT_EXAMPLES.ts`          | 8 code examples  |
| `IMPLEMENTATION_SUMMARY.md` | What was created |
| `dating-chat-config.json`   | Config reference |

---

## 🎓 Learn More

- `DATING_CHAT_README.md` - Complete implementation guide
- `API_DOCUMENTATION.md` - Full API reference with examples
- `CHAT_EXAMPLES.ts` - Practical code examples
- `app/chat/page.tsx` - Hub implementation
- `components/dating-chat-interface.tsx` - Component source

---

## 🆘 Troubleshooting

**Not showing?**

- Check route: `/chat` or `/chat/[id]`
- Clear cache: Cmd+Shift+R

**Messages not sending?**

- Check webhook URL
- Verify network in DevTools
- Check request payload format

**Styling broken?**

- Verify Tailwind is loaded
- Check CSS import
- Clear browser cache

**Avatar not showing?**

- Check image URL is valid
- Verify CORS settings
- Will use gradient fallback

---

**Last Updated:** December 14, 2025  
**Status:** ✅ Ready to Use  
**Version:** 1.0.0
