import os
import json
import urllib.request
import urllib.error

# Read env variables from .env.local
env_path = 'd:\\Mini OS\\cerebro\\.env.local'
api_key = None

if os.path.exists(env_path):
    with open(env_path, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith('#'):
                continue
            if '=' in line:
                key, val = line.split('=', 1)
                key = key.strip()
                val = val.strip()
                if val.startswith('"') and val.endswith('"'):
                    val = val[1:-1]
                if key == 'GEMINI_API_KEY':
                    api_key = val
                    break

print("GEMINI_API_KEY extracted:", api_key is not None)

if not api_key:
    print("Error: GEMINI_API_KEY not found in .env.local")
    exit(1)

models_to_test = [
    'gemini-2.5-flash',
    'gemini-2.0-flash',
    'gemini-1.5-flash'
]

for model in models_to_test:
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
    headers = {"Content-Type": "application/json"}
    data = {
        "contents": [{
            "parts": [{
                "text": "Hello! What is your name?"
            }]
        }]
    }
    
    print(f"\nTesting model: {model}...")
    req = urllib.request.Request(url, data=json.dumps(data).encode('utf-8'), headers=headers, method='POST')
    
    try:
        with urllib.request.urlopen(req) as response:
            res_data = json.loads(response.read().decode('utf-8'))
            text = res_data['candidates'][0]['content']['parts'][0]['text']
            print(f"Success! Response: {text}")
    except urllib.error.HTTPError as e:
        print(f"HTTP Error {e.code}: {e.reason}")
        try:
            err_body = e.read().decode('utf-8')
            print(f"Error Details: {err_body}")
        except Exception:
            pass
    except Exception as e:
        print(f"General Error: {e}")
