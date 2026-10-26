import React, { useState, useRef, useEffect } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { processUserMessage } from './engine'
import { STARTER_SUGGESTIONS } from './intents'
import { simulate } from '@/store/simulate'
import {
  X,
  Send,
  Bot,
  ArrowRight,
  Terminal,
  Maximize2,
} from 'lucide-react'
import { Link } from 'react-router-dom'

export const ChatWidget: React.FC = () => {
  const {
    isChatOpen,
    toggleChat,
    setChatOpen,
    chatMessages,
    addChatMessage,
    currentRole,
  } = useAppStore()

  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [currentToolChip, setCurrentToolChip] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (isChatOpen) {
      scrollToBottom()
    }
  }, [chatMessages, isChatOpen, isTyping, currentToolChip])

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim()
    if (!text || isTyping) return

    setInputValue('')
    // Add user message
    addChatMessage({
      sender: 'user',
      role: currentRole,
      text,
    })

    setIsTyping(true)
    setCurrentToolChip(null)

    // Simulate typing delay 600-1200ms
    await simulate(800)

    try {
      const result = await processUserMessage(text, currentRole)

      if (result.toolChip) {
        setCurrentToolChip(result.toolChip)
        await simulate(400)
      }

      addChatMessage({
        sender: 'assistant',
        text: result.text,
        toolChip: result.toolChip,
        actionLink: result.actionLink,
      })
    } finally {
      setIsTyping(false)
      setCurrentToolChip(null)
    }
  }

  const suggestions = STARTER_SUGGESTIONS[currentRole] || []

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {/* Floating Toggle Button */}
      {!isChatOpen && (
        <button
          onClick={toggleChat}
          className="group flex items-center gap-2.5 bg-blue-600 hover:bg-blue-700 text-white pl-4 pr-5 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 cursor-pointer"
        >
          <div className="relative">
            <Bot className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 border-2 border-white rounded-full animate-pulse" />
          </div>
          <span className="text-sm font-semibold tracking-wide">Assistant</span>
        </button>
      )}

      {/* Expanded Chat Drawer */}
      {isChatOpen && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-[400px] h-[580px] flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="px-4 py-3 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
                AI
              </div>
              <div>
                <div className="text-sm font-semibold flex items-center gap-1.5 leading-none">
                  IPPCOP Assistant
                  <span className="text-[10px] bg-blue-500/20 text-blue-300 border border-blue-400/30 px-1.5 py-0.2 rounded font-mono">
                    Scripted
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Active role: <span className="text-white font-medium capitalize">{currentRole.replace('_', ' ')}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Link
                to="/chat"
                onClick={() => setChatOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-md hover:bg-slate-800 transition-colors"
                title="Expand to Full Page"
              >
                <Maximize2 className="w-4 h-4" />
              </Link>
              <button
                onClick={toggleChat}
                className="p-1.5 text-slate-400 hover:text-white rounded-md hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/60">
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.sender === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`max-w-[88%] rounded-2xl p-3 text-xs leading-relaxed shadow-2xs ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-br-xs'
                      : 'bg-white border border-slate-200 text-slate-800 rounded-bl-xs'
                  }`}
                >
                  {/* Tool Call Chip */}
                  {msg.toolChip && (
                    <div className="mb-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-900 text-emerald-400 text-[10px] font-mono border border-slate-800">
                      <Terminal className="w-3 h-3 text-emerald-400" />
                      <span>{msg.toolChip}</span>
                    </div>
                  )}

                  <p className="whitespace-pre-line">{msg.text}</p>

                  {/* Action Link button */}
                  {msg.actionLink && (
                    <div className="mt-2.5 pt-2 border-t border-slate-100">
                      <Link
                        to={msg.actionLink.path}
                        onClick={() => setChatOpen(false)}
                        className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-blue-600 hover:text-blue-800 hover:underline bg-blue-50 px-2 py-1 rounded"
                      >
                        <span>{msg.actionLink.label}</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  )}
                </div>
                <span className="text-[10px] text-slate-400 mt-1 px-1">
                  {msg.timestamp}
                </span>
              </div>
            ))}

            {/* In-flight tool chip */}
            {currentToolChip && (
              <div className="flex items-center gap-1.5 p-2 rounded-lg bg-slate-900 text-emerald-400 text-[11px] font-mono animate-pulse border border-slate-800 w-fit">
                <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                <span>Invoking {currentToolChip}...</span>
              </div>
            )}

            {/* Typing indicator */}
            {isTyping && !currentToolChip && (
              <div className="flex items-center gap-1 text-slate-400 p-2 bg-white rounded-xl border border-slate-200 w-fit">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" />
                <div className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.2s]" />
                <div className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.4s]" />
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Starter suggestion chips */}
          <div className="px-3 py-2 bg-white border-t border-slate-100 overflow-x-auto whitespace-nowrap flex gap-1.5 no-scrollbar">
            {suggestions.slice(0, 3).map((suggestion, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSend(suggestion)}
                className="text-[11px] px-2.5 py-1 rounded-full bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 font-medium shrink-0 border border-slate-200 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>

          {/* Input Footer */}
          <div className="p-3 bg-white border-t border-slate-200">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSend()
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                placeholder={`Ask as ${currentRole}...`}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={isTyping}
                className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isTyping}
                className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl disabled:opacity-40 transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
