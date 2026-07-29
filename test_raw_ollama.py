import urllib.request
import json
import os

url = "http://localhost:8080/v1/chat/completions"
model_name = "mistralai/Mistral-7B-Instruct-v0.3:latest"

# Build payload exactly like app.py on second turn
# System instruction incorporates constraints
system_prompt = (
    "You are a supportive, empathetic mental wellness companion named Pragya. "
    "Respond in JSON format with a schema like: {\"reply\": \"response text\", \"expression\": \"EMPATHETIC\"}.\n"
    "PREVIOUS REPLY: 'That\\\'s frustrating, especially when your sleep is so important. Are you feeling any particular worries or concerns?'.\n"
    "CONSTRAINT: Do NOT repeat this phrasing."
)

messages = [
    {"role": "system", "content": system_prompt},
    {"role": "user", "content": "I barely slept last night because I kept thinking about all the things that could go wrong."},
    {"role": "assistant", "content": "That's frustrating, especially when your sleep is so important. Are you feeling any particular worries or concerns?"},
    {"role": "user", "content": "I barely slept last night because I kept thinking about all the things that could go wrong."}
]

payload = {
    "model": model_name,
    "messages": messages,
    "temperature": 0.7,
    "max_tokens": 450,
}

req = urllib.request.Request(
    url,
    data=json.dumps(payload).encode(),
    headers={"Content-Type": "application/json"}
)

try:
    with urllib.request.urlopen(req, timeout=30) as resp:
        res = json.loads(resp.read().decode())
        print("RAW RESPONSE FROM OLLAMA:")
        print(json.dumps(res, indent=2))
except urllib.error.HTTPError as e:
    print(f"HTTP Error querying Ollama: {e.code} {e.reason}")
    try:
        print(e.read().decode())
    except Exception:
        pass
except Exception as e:
    print(f"Error querying Ollama: {e}")
