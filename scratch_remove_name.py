import re

with open("components/ai-bot/TryPragyaChat.tsx", "r") as f:
    content = f.read()

# 1. Remove preferredName state
content = content.replace('const [inputMessage, setInputMessage] = useState("")\n  const [suggestions, setSuggestions] = useState<string[]>([])\n  const [preferredName, setPreferredName] = useState("")', 'const [inputMessage, setInputMessage] = useState("")\n  const [suggestions, setSuggestions] = useState<string[]>([])')

# 2. Remove the input field in the UI
# We need to find the block
import textwrap
input_block = """                <div className="mb-8">
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
content = content.replace(input_block, "")

# 3. Revert API call to NOT pass preferred_name
content = content.replace('body: JSON.stringify({ session_id: sessionId, message: userMsg, preferred_name: preferredName }),', 'body: JSON.stringify({ session_id: sessionId, message: userMsg }),')

with open("components/ai-bot/TryPragyaChat.tsx", "w") as f:
    f.write(content)

