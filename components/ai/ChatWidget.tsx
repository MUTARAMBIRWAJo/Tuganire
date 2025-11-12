"use client"

import { useEffect, useMemo, useRef, useState } from "react"

interface ChatItem {
  role: "user" | "assistant"
  content: string
}

const STORAGE_KEY = "tuganire_chat_history_v1"
const RECENT_KEY = "tuganire_chat_recent_v1"

export default function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState<ChatItem[]>([])
  const [tts, setTts] = useState(false)
  const endRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [unread, setUnread] = useState(0)

  // Load history and recent queries
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setMessages(JSON.parse(raw))
    } catch {}
  }, [])

  // Persist history
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
    } catch {}
  }, [messages])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, open, collapsed])

  useEffect(() => {
    if (open && !collapsed) {
      inputRef.current?.focus()
    }
  }, [open, collapsed])

  // Clear unread when opening or maximizing
  useEffect(() => {
    if (open && !collapsed && unread > 0) {
      setUnread(0)
    }
  }, [open, collapsed, unread])

  const canSend = useMemo(() => input.trim().length > 0 && !loading, [input, loading])

  const speak = (text: string) => {
    if (!tts) return
    if (typeof window === "undefined") return
    const synth = window.speechSynthesis
    if (!synth) return
    const utter = new SpeechSynthesisUtterance(text)
    utter.rate = 1
    utter.pitch = 1
    utter.lang = "en-US"
    synth.cancel()
    synth.speak(utter)
  }

  const pushRecent = (q: string) => {
    try {
      const raw = localStorage.getItem(RECENT_KEY)
      const arr: string[] = raw ? JSON.parse(raw) : []
      const next = [q, ...arr.filter((x) => x !== q)].slice(0, 5)
      localStorage.setItem(RECENT_KEY, JSON.stringify(next))
    } catch {}
  }

  const getRecent = (): string[] => {
    try {
      const raw = localStorage.getItem(RECENT_KEY)
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  }

  const onSend = async () => {
    if (!canSend) return
    const q = input.trim()
    setInput("")
    setMessages((m) => [...m, { role: "user", content: q }])
    pushRecent(q)
    setLoading(true)

    try {
      const res = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: q }),
      })
      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()
      let text: string
      if (data?.error) {
        text = "I had trouble fetching news just now. Please try again or try a different topic."
      } else if (Array.isArray(data?.items) && data.items.length > 0) {
        text = data.items
          .map((it: any, i: number) => `${i + 1}. ${it.title}\n${it.summary || ""}${it.url ? `\n${it.url}` : ""}`)
          .join("\n\n")
      } else if (data?.note) {
        text = String(data.note)
      } else {
        text = "I couldn't find matching stories. Try broader terms like 'technology', 'sports', or 'Rwanda'."
      }

      setMessages((m) => {
        const next: ChatItem[] = [...m, { role: "assistant", content: text } as ChatItem]
        // If user won't see it immediately, increment unread
        if (!open || collapsed) setUnread((u) => u + 1)
        return next
      })
      speak(text)
    } catch (e: any) {
      const msg = e?.message || "Failed to get response."
      setMessages((m) => [...m, { role: "assistant", content: msg }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="fixed bottom-4 right-4 z-50">
        {open && (
          <div className="mb-3 w-[min(94vw,380px)] rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900">
            {/* Header with controls */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-slate-200 dark:border-slate-700">
              <div className="text-sm font-semibold">AI News Assistant</div>
              <div className="flex items-center gap-2">
                <label className="hidden sm:flex items-center gap-2 text-xs">
                  <input type="checkbox" checked={tts} onChange={(e) => setTts(e.target.checked)} />
                  TTS
                </label>
                <button
                  aria-label={collapsed ? "Maximize" : "Minimize"}
                  onClick={() => setCollapsed((v) => !v)}
                  className="text-slate-600 hover:text-slate-900 dark:text-slate-300"
                  title={collapsed ? "Maximize" : "Minimize"}
                >
                  {collapsed ? <span>▢</span> : <span>—</span>}
                </button>
                <button
                  aria-label="Close"
                  onClick={() => setOpen(false)}
                  className="text-slate-600 hover:text-slate-900 dark:text-slate-300"
                  title="Close"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Collapsed bar (optional preview) */}
            {collapsed ? (
              <div className="px-3 py-2 text-xs text-slate-600 dark:text-slate-300">
                {messages.length > 0 ? (
                  <span className="line-clamp-1">{messages[messages.length - 1].content}</span>
                ) : (
                  <span>Ask for headlines, topics, or summaries…</span>
                )}
              </div>
            ) : (
              <>
                <div className="max-h-80 overflow-y-auto px-3 py-2 space-y-2">
                  {messages.map((m, i) => (
                    <div key={i} className={`text-sm whitespace-pre-wrap ${m.role === "user" ? "text-slate-900" : "text-slate-700 dark:text-slate-300"}`}>
                      {m.role === "user" ? "You:" : "Assistant:"} {m.content}
                    </div>
                  ))}
                  <div ref={endRef} />
                </div>
                <div className="px-3 pb-2">
                  <div className="flex gap-2">
                    <input
                      ref={inputRef}
                      className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800"
                      placeholder="Ask for headlines, topics, summaries..."
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") onSend()
                      }}
                      disabled={loading}
                    />
                    <button
                      onClick={onSend}
                      disabled={!canSend}
                      className={`rounded-md px-3 text-sm font-medium text-white ${canSend ? "bg-blue-600 hover:bg-blue-700" : "bg-blue-300"}`}
                    >
                      Send
                    </button>
                  </div>
                  {/* Recent queries */}
                  <div className="mt-2 flex flex-wrap gap-2">
                    {getRecent().map((q, i) => (
                      <button
                        key={i}
                        onClick={() => setInput(q)}
                        className="text-xs rounded-full border border-slate-300 px-2 py-1 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                        title="Tap to reuse"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
        <button
          onClick={() => {
            setOpen((v) => {
              const nv = !v
              if (nv) {
                // Opening clears unread when expanded; if will open collapsed, leave badge until expanded
                if (!collapsed) setUnread(0)
              }
              return nv
            })
          }}
          className="relative h-12 w-12 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 flex items-center justify-center"
          aria-label="Open AI Assistant"
        >
          {open ? (
            <span className="text-xl">×</span>
          ) : (
            <span className="text-xl">💬</span>
          )}
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-600 text-[10px] leading-[18px] text-white text-center">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </button>
      </div>
    </>
  )
}
