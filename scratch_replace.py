import re

with open("components/ai-bot/TryPragyaChat.tsx", "r") as f:
    content = f.read()

# 1. Add preferredName state
content = content.replace('const [hasStarted, setHasStarted] = useState(false)', 'const [hasStarted, setHasStarted] = useState(false)\n  const [preferredName, setPreferredName] = useState("")')

# 2. Add input field to setup screen
input_field = """                <div className="mb-8">
                  <label className="block text-[15px] font-bold text-gray-700 mb-2 ml-1">What should I call you?</label>
                  <input
                    type="text"
                    value={preferredName}
                    onChange={(e) => setPreferredName(e.target.value)}
                    placeholder="Enter your preferred name..."
                    className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all bg-gray-50/50 text-[15px]"
                  />
                </div>
"""
content = content.replace('<div className="space-y-4">', input_field + '\n                <div className="space-y-4">')

# 3. Add preferred_name to API payload
content = content.replace('body: JSON.stringify({ session_id: sessionId, message: userMsg }),', 'body: JSON.stringify({ session_id: sessionId, message: userMsg, preferred_name: preferredName }),')

with open("components/ai-bot/TryPragyaChat.tsx", "w") as f:
    f.write(content)

