"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"

interface ChatContact {
   id: string
   name: string
   lastMsg: string
   time: string
   avatar: string
   online?: boolean
}

interface Message {
   id: string
   text?: string
   file?: { name: string; type: "xls" | "pdf" }
   sender: "user" | "other"
   senderName: string
   timestamp: string
   avatar: string
}

const CONTACTS: ChatContact[] = [
   { id: "1", name: "William Price", lastMsg: "What do you think about the", time: "1 hour ago", avatar: "https://i.pravatar.cc/150?u=william" },
   { id: "2", name: "Satoru Gojo", lastMsg: "Start collecting better.", time: "1 hour ago", avatar: "https://i.pravatar.cc/150?u=gojo" },
   { id: "3", name: "Michael Phelps", lastMsg: "Start collecting better.", time: "2 hour ago", avatar: "https://i.pravatar.cc/150?u=phelps" },
   { id: "4", name: "Mariane March", lastMsg: "Start collecting better.", time: "2 hour ago", avatar: "https://i.pravatar.cc/150?u=mariane" },
   { id: "5", name: "Sam Fischer", lastMsg: "Start collecting better.", time: "3 hour ago", avatar: "https://i.pravatar.cc/150?u=sam" },
]

export default function PatientMessagesPage() {
   const [selectedContact, setSelectedContact] = useState(CONTACTS[0])
   const [messages, setMessages] = useState<Message[]>([
      {
         id: "1",
         sender: "other",
         senderName: "Kathy Robin",
         text: "Goodmorning, I have an appointment with Dr. Clark",
         timestamp: "1m ago",
         avatar: "https://i.pravatar.cc/150?u=kathy",
      },
      {
         id: "2",
         sender: "user",
         senderName: "Harold Jones",
         text: "Integrate all of your apps",
         timestamp: "1m ago",
         avatar: "https://i.pravatar.cc/150?u=harold",
      },
      {
         id: "3",
         sender: "other",
         senderName: "Kathy Robin",
         file: { name: "App Policy 2024.xls", type: "xls" },
         timestamp: "1m ago",
         avatar: "https://i.pravatar.cc/150?u=kathy",
      },
      {
         id: "4",
         sender: "user",
         senderName: "Harold Jones",
         text: "Apps have been integrated",
         timestamp: "1m ago",
         avatar: "https://i.pravatar.cc/150?u=harold",
      },
   ])

   return (
      <div className="flex h-screen bg-white overflow-hidden font-sans text-[#1a1a1a]">

         {/* 1. Left Sidebar: Contacts List */}
         <aside className="w-[320px] border-r border-gray-100 flex flex-col shrink-0">
            <div className="p-8 pt-14 md:pt-8 flex items-center justify-between">
               <h1 className="text-2xl font-bold tracking-tight pl-10 md:pl-0">Messages</h1>
               <button className="text-gray-400 hover:text-gray-600">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" /></svg>
               </button>
            </div>

            <div className="px-8 mb-6">
               <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">All Messages</h2>
               <div className="space-y-2">
                  {CONTACTS.map((contact) => (
                     <button
                        key={contact.id}
                        onClick={() => setSelectedContact(contact)}
                        className={`w-full flex items-center gap-4 p-3 rounded-2xl transition-all ${selectedContact.id === contact.id ? "bg-gray-50 shadow-sm" : "hover:bg-gray-50/50"}`}
                     >
                        <div className="relative shrink-0">
                           <img src={contact.avatar} className="w-12 h-12 rounded-2xl object-cover border border-gray-100 shadow-sm" alt={contact.name} />
                        </div>
                        <div className="flex-1 text-left overflow-hidden">
                           <div className="flex justify-between items-center mb-0.5">
                              <p className="font-bold text-[15px] truncate">{contact.name}</p>
                              <span className="text-[10px] font-bold text-gray-400 whitespace-nowrap ml-2">{contact.time}</span>
                           </div>
                           <p className="text-[12px] font-medium text-gray-500 truncate">{contact.lastMsg}</p>
                        </div>
                     </button>
                  ))}
               </div>
            </div>
         </aside>

         {/* 2. Main Chat Area */}
         <main className="flex-1 flex flex-col min-w-0 bg-white">

            {/* Chat Header */}
            <header className="px-8 py-6 border-b border-gray-50 flex items-center justify-between">
               <div className="flex items-center gap-4">
                  <button className="text-gray-400">
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" /></svg>
                  </button>
                  <div className="flex items-center gap-3">
                     <h2 className="text-xl font-extrabold tracking-tight">Conference Meeting</h2>
                     <span className="px-3 py-1 bg-gray-100 text-[10px] font-bold text-gray-500 rounded-full">4h left</span>
                  </div>
               </div>

               <div className="flex items-center gap-6">
                  <div className="flex -space-x-3 items-center">
                     <img src="https://i.pravatar.cc/150?u=a1" className="w-8 h-8 rounded-full border-2 border-white" />
                     <img src="https://i.pravatar.cc/150?u=a2" className="w-8 h-8 rounded-full border-2 border-white" />
                     <img src="https://i.pravatar.cc/150?u=a3" className="w-8 h-8 rounded-full border-2 border-white" />
                     <div className="w-8 h-8 rounded-full bg-gray-50 border-2 border-white flex items-center justify-center text-[10px] font-bold text-gray-400">+8</div>
                  </div>
                  <button className="text-gray-300 hover:text-gray-500">
                     <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" /></svg>
                  </button>
               </div>
            </header>

            {/* Message Viewport */}
            <div className="flex-1 overflow-y-auto p-12 space-y-10">

               {/* Event Block */}
               <div className="flex flex-col items-center mb-16">
                  <div className="flex items-center gap-8 text-[44px] font-extrabold tracking-tighter text-gray-900">
                     <span>7:00</span>
                     <span className="text-gray-200">→</span>
                     <span>8:00</span>
                  </div>
                  <div className="flex gap-16 text-[14px] font-bold text-gray-400 mt-2 tracking-wide uppercase">
                     <span>Sat, Feb 12</span>
                     <span>Sat, Feb 12</span>
                  </div>
               </div>

               {/* Messages */}
               {messages.map((msg) => (
                  <div key={msg.id} className={`flex items-start gap-4 ${msg.sender === "user" ? "flex-row-reverse" : "flex-row"}`}>
                     <img src={msg.avatar} className="w-10 h-10 rounded-2xl object-cover shrink-0 mt-1 shadow-sm" alt={msg.senderName} />
                     <div className={`max-w-[500px] flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}>
                        <div className="flex items-center gap-3 mb-2 px-1">
                           <span className="text-[13px] font-bold text-gray-800">{msg.senderName}</span>
                           <span className="text-[11px] font-bold text-gray-300">{msg.timestamp}</span>
                        </div>

                        {msg.text && (
                           <div className={`p-4 rounded-2xl text-[15px] font-medium leading-relaxed shadow-sm ${msg.sender === "user"
                                 ? "bg-[#0b4627] text-white rounded-tr-sm"
                                 : "bg-[#f3f4f6] text-[#333] rounded-tl-sm"
                              }`}>
                              {msg.text}
                           </div>
                        )}

                        {msg.file && (
                           <div className="p-4 rounded-2xl bg-[#f3f4f6] border border-gray-100 shadow-sm flex items-center gap-4 min-w-[280px]">
                              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                                 <svg className="w-6 h-6 text-emerald-600" fill="currentColor" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zM6 4h7v5h5v11H6V4zm2 8v2h8v-2H8zm0 4v2h5v-2H8z" /></svg>
                              </div>
                              <div className="flex-1">
                                 <p className="text-[14px] font-bold text-gray-800">{msg.file.name}</p>
                              </div>
                           </div>
                        )}
                     </div>
                  </div>
               ))}

               {/* Today Divider */}
               <div className="flex justify-center my-12">
                  <span className="px-4 py-1.5 bg-gray-50 text-[11px] font-bold text-gray-400 rounded-md uppercase tracking-widest">Today</span>
               </div>

               {/* Typing Indicator Mockup */}
               <div className="flex items-start gap-4">
                  <img src="https://i.pravatar.cc/150?u=kathy" className="w-10 h-10 rounded-2xl object-cover shrink-0 mt-1 shadow-sm opacity-50" />
                  <div className="flex gap-1.5 mt-4">
                     <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" />
                     <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:0.2s]" />
                     <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
               </div>
            </div>

            {/* Input Bar */}
            <div className="p-8">
               <div className="bg-[#f3f4f6] rounded-[24px] p-2 flex flex-col gap-4">
                  <div className="px-6 pt-4 pb-2">
                     <textarea
                        placeholder="Message to conference meeting"
                        className="w-full bg-transparent border-none focus:ring-0 text-[14px] font-medium placeholder:text-gray-400 resize-none h-12"
                     />
                  </div>
                  <div className="flex items-center justify-between px-4 pb-4">
                     <div className="flex items-center gap-2">
                        <button className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-gray-400 hover:bg-gray-100 shadow-sm">
                           <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" /></svg>
                        </button>
                        <button className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-600">
                           <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" /></svg>
                        </button>
                        <button className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-600">
                           <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.414a4 4 0 00-5.656-5.656l-6.415 6.414a6 6 0 108.486 8.486L20.5 13" /></svg>
                        </button>
                     </div>
                     <button className="bg-[#131316] text-white px-6 py-2.5 rounded-[12px] text-[13px] font-bold shadow-lg hover:scale-[1.02] transition-transform">
                        Send Now
                     </button>
                  </div>
               </div>
            </div>
         </main>

      </div>
   )
}
