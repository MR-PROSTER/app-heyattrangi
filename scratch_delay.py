import re

with open("components/ai-bot/TryPragyaChat.tsx", "r") as f:
    content = f.read()

content = content.replace('const [suggestions, setSuggestions] = useState<string[]>([])', 'const [suggestions, setSuggestions] = useState<string[]>([])\n  const [showSuggestions, setShowSuggestions] = useState(false)')

content = content.replace('setSuggestions([])', 'setSuggestions([])\n    setShowSuggestions(false)')

replace_code = """      if (data.suggestions && Array.isArray(data.suggestions)) {
        setSuggestions(data.suggestions)
        setTimeout(() => setShowSuggestions(true), 5000)
      }"""
content = content.replace('      if (data.suggestions && Array.isArray(data.suggestions)) {\n        setSuggestions(data.suggestions)\n      }', replace_code)

content = content.replace('{suggestions.length > 0 && !isLoading && (', '{suggestions.length > 0 && showSuggestions && !isLoading && (')

with open("components/ai-bot/TryPragyaChat.tsx", "w") as f:
    f.write(content)

