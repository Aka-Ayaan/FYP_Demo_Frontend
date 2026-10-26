import React, { useState, useRef, useEffect } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { processUserMessage } from './engine'
import { STARTER_SUGGESTIONS } from './intents'
import { simulate } from '@/store/simulate'
import {
  Send,
  Bot,
  Terminal,
  ArrowRight,
  Sparkles,
  FileText,
} from 'lucide-react'
import { Link } from 'react-router-dom'

export const ChatPage: React.FC = () => {
  const { chatMessages, addChatMessage, currentRole } = useAppStore()
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [currentToolChip, setCurrentToolChip] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [chatMessages, isTyping, currentToolChip])

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim()
    if (!text || isTyping) return

    setInputValue('')
    addChatMessage({
      sender: 'user',
      role: currentRole,
      text,
    })

    setIsTyping(true)
    setCurrentToolChip(null)

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
    <div className="h-[calc(100vh-140px)] flex gap-6">
      {/* Left Chat Main Stream */}
      <div className="flex-1 bg-white border border-slate-200 rounded-2xl shadow-xs flex flex-col overflow-hidden">
        {/* Chat Stream Header */}
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                IPPCOP Natural Language Planning Copilot
                <span className="text-xs font-mono font-normal bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                  Mock Engine
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Executes platform endpoints and answers questions based on your active role permissions.
              </p>
            </div>
          </div>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/40">
          {chatMessages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${
                msg.sender === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={`max-w-[75%] rounded-2xl p-4 text-sm leading-relaxed shadow-xs ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-br-xs'
                    : 'bg-white border border-slate-200 text-slate-800 rounded-bl-xs'
                }`}
              >
                {msg.toolChip && (
                  <div className="mb-2.5 inline-flex items-center gap-2 px-2.5 py-1 rounded bg-slate-950 text-emerald-400 text-xs font-mono border border-slate-800">
                    <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{msg.toolChip}</span>
                  </div>
                )}
                <p className="whitespace-pre-line">{msg.text}</p>
                {msg.actionLink && (
                  <div className="mt-3 pt-2.5 border-t border-slate-100">
                    <Link
                      to={msg.actionLink.path}
                      className="inline-flex items-center gap-2 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <span>{msg.actionLink.label}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                )}
              </div>
              <span className="text-xs text-slate-400 mt-1 px-1">{msg.timestamp}</span>
            </div>
          ))}

          {currentToolChip && (
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-900 text-emerald-400 text-xs font-mono animate-pulse border border-slate-800 w-fit">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span>Simulating endpoint {currentToolChip}...</span>
            </div>
          )}

          {isTyping && !currentToolChip && (
            <div className="flex items-center gap-1.5 text-slate-400 p-3 bg-white rounded-2xl border border-slate-200 w-fit">
              <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" />
              <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:0.2s]" />
              <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:0.4s]" />
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-white border-t border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSend()
            }}
            className="flex items-center gap-3"
          >
            <input
              type="text"
              placeholder={`Enter prompt or command as ${currentRole.replace('_', ' ')}...`}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isTyping}
              className="flex-1 px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isTyping}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl disabled:opacity-40 transition-colors flex items-center gap-2 text-sm"
            >
              <span>Send</span>
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Right Sidebar: Context & Prompts */}
      <div className="w-80 space-y-4">
        {/* Role Starter Chips */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase text-slate-500 tracking-wider mb-3">
            <Sparkles className="w-4 h-4 text-blue-500" />
            <span>Recommended for {currentRole.replace('_', ' ')}</span>
          </div>
          <div className="space-y-2">
            {suggestions.map((prompt, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSend(prompt)}
                className="w-full text-left p-2.5 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50 text-xs text-slate-700 font-medium transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span>{prompt}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition-colors shrink-0 ml-1" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Knowledge Sources */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-600">
          <div className="flex items-center gap-2 font-semibold text-slate-900 mb-2">
            <FileText className="w-4 h-4 text-slate-500" />
            <span>Connected Knowledge Documents</span>
          </div>
          <p className="text-[11px] text-slate-500 mb-3">
            In the full architecture, responses cite a vector database of factory documentation:
          </p>
          <ul className="space-y-1.5 text-[11px] text-slate-600">
            <li className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              IPPCOP System Requirements Specification v1.4
            </li>
            <li className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              DPL-2 Production Operations Manual
            </li>
            <li className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              MILP Mathematical Formulation & Constraints Guide
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
