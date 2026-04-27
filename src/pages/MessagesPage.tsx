import { useState, useEffect, useRef } from 'react'
import { useMessages } from '@/hooks/useMessages'
import { useAuth } from '@/context/AuthContext'
import { Send, MessageSquare } from 'lucide-react'

function formatTime(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const isToday = d.toDateString() === now.toDateString()
  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)
  const isYesterday = d.toDateString() === yesterday.toDateString()
  const label = isToday ? 'Today' : isYesterday ? 'Yesterday' : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined })
  return { label, time: d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) }
}

export default function MessagesPage() {
  const { user } = useAuth()
  const { messages, loading, sending, hasMore, loadOlder, sendMessage } = useMessages()
  const [draft, setDraft] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const prevLengthRef = useRef(0)

  useEffect(() => {
    if (messages.length > prevLengthRef.current) {
      const prevLen = prevLengthRef.current
      prevLengthRef.current = messages.length
      if (prevLen === 0 || messages[messages.length - 1].senderId === user?.id) {
        bottomRef.current?.scrollIntoView({ behavior: prevLen === 0 ? 'instant' : 'smooth' })
      }
    }
  }, [messages, user?.id])

  async function handleSend() {
    const text = draft.trim()
    if (!text || sending) return
    setDraft('')
    await sendMessage(text)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Group messages by day
  const grouped: { dateLabel: string; msgs: typeof messages }[] = []
  for (const msg of messages) {
    const { label } = formatTime(msg.createdAt)
    const last = grouped[grouped.length - 1]
    if (last?.dateLabel === label) {
      last.msgs.push(msg)
    } else {
      grouped.push({ dateLabel: label, msgs: [msg] })
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-zinc-800 shrink-0">
        <MessageSquare size={18} className="text-stone-400" strokeWidth={1.5} />
        <div>
          <h2 className="text-white font-semibold">Team Messages</h2>
          <p className="text-zinc-500 text-xs">Org-wide channel</p>
        </div>
      </div>

      {/* Message list */}
      <div ref={listRef} className="flex-1 overflow-y-auto py-4 space-y-1 min-h-0">
        {loading ? (
          <p className="text-zinc-500 text-sm text-center py-8">Loading…</p>
        ) : (
          <>
            {hasMore && (
              <div className="flex justify-center pb-2">
                <button onClick={loadOlder}
                  className="text-xs text-zinc-500 hover:text-zinc-300 border border-zinc-700 rounded-full px-4 py-1.5 transition-colors">
                  Load older messages
                </button>
              </div>
            )}
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-center pt-16">
                <MessageSquare size={36} className="text-zinc-700" strokeWidth={1.5} />
                <p className="text-zinc-500 text-sm">No messages yet.<br />Say something to your team.</p>
              </div>
            )}
            {grouped.map(({ dateLabel, msgs }) => (
              <div key={dateLabel} className="space-y-1">
                <div className="flex items-center gap-3 py-2">
                  <div className="flex-1 h-px bg-zinc-800" />
                  <span className="text-zinc-600 text-xs shrink-0">{dateLabel}</span>
                  <div className="flex-1 h-px bg-zinc-800" />
                </div>
                {msgs.map((msg, i) => {
                  const isMine = msg.senderId === user?.id
                  const prev = i > 0 ? msgs[i - 1] : null
                  const showSender = !isMine && (!prev || prev.senderId !== msg.senderId)
                  const { time } = formatTime(msg.createdAt)
                  return (
                    <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'} px-1`}>
                      <div className={`max-w-[75%] ${isMine ? 'items-end' : 'items-start'} flex flex-col`}>
                        {showSender && (
                          <p className="text-zinc-500 text-xs ml-1 mb-0.5">{msg.senderName}</p>
                        )}
                        <div className={`group relative px-3.5 py-2 rounded-2xl text-sm leading-relaxed ${
                          isMine
                            ? 'bg-stone-600 text-white rounded-br-sm'
                            : 'bg-zinc-800 text-zinc-100 rounded-bl-sm'
                        }`}>
                          {msg.content}
                          <span className="absolute bottom-full mb-1 opacity-0 group-hover:opacity-100 transition-opacity text-zinc-600 text-[10px] whitespace-nowrap px-1">
                            {time}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ))}
            <div ref={bottomRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="pt-3 border-t border-zinc-800 shrink-0">
        <div className="flex items-end gap-2 bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 focus-within:border-stone-500 transition-colors">
          <textarea
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder="Message your team… (Enter to send, Shift+Enter for new line)"
            className="flex-1 bg-transparent text-white text-sm placeholder:text-zinc-600 resize-none focus:outline-none max-h-32"
            style={{ fieldSizing: 'content' } as React.CSSProperties}
          />
          <button
            onClick={handleSend}
            disabled={!draft.trim() || sending}
            className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-stone-500 hover:bg-stone-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={14} className="text-white" />
          </button>
        </div>
        <p className="text-zinc-700 text-xs mt-1.5 px-1">Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  )
}
