import re

with open("components/ai-bot/TryPragyaChat.tsx", "r") as f:
    content = f.read()

# 1. Add state for suggestions
content = content.replace('const [inputMessage, setInputMessage] = useState("")', 'const [inputMessage, setInputMessage] = useState("")\n  const [suggestions, setSuggestions] = useState<string[]>([])')

# 2. Clear suggestions on send
content = content.replace('setIsLoading(true)', 'setIsLoading(true)\n    setSuggestions([])')

# 3. Handle suggestions from API
content = content.replace('const data = await res.json() as { reply?: string; currentCount?: number; plan?: string; error?: string }', 'const data = await res.json() as { reply?: string; currentCount?: number; plan?: string; error?: string; suggestions?: string[] }')

content = content.replace('setBotExpression(getBotExpression(reply))', 'setBotExpression(getBotExpression(reply))\n      if (data.suggestions && Array.isArray(data.suggestions)) {\n        setSuggestions(data.suggestions)\n      }')

content = content.replace('setHasStarted(false)\n    setSelectedMode("direct")', 'setHasStarted(false)\n    setSelectedMode("direct")\n    setSuggestions([])')

# 4. Render suggestions above input
suggestions_ui = """                  <div className="max-w-4xl mx-auto relative">
                    {suggestions.length > 0 && !isLoading && (
                      <div className="absolute bottom-full mb-3 left-0 right-0 flex gap-2 px-2 overflow-x-auto no-scrollbar pb-1 z-20">
                        {suggestions.map((s, i) => (
                          <button 
                            key={i} 
                            type="button"
                            onClick={() => setInputMessage(s)}
                            className="whitespace-nowrap px-4 py-2 bg-white border border-orange-200 text-orange-600 rounded-full text-[13px] font-medium shadow-[0_2px_8px_rgba(249,107,19,0.15)] hover:bg-orange-50 hover:-translate-y-0.5 transition-all"
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    )}
                    <div className="flex justify-between items-center mb-2 px-2 md:hidden">"""

content = content.replace('                  <div className="max-w-4xl mx-auto">\n                    <div className="flex justify-between items-center mb-2 px-2 md:hidden">', suggestions_ui)

with open("components/ai-bot/TryPragyaChat.tsx", "w") as f:
    f.write(content)

