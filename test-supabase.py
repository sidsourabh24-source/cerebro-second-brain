import os
import json
import urllib.request
import urllib.error

# Read env variables from .env.local
env_path = 'd:\\Mini OS\\cerebro\\.env.local'
supabase_url = None
supabase_key = None

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
                if key == 'NEXT_PUBLIC_SUPABASE_URL':
                    supabase_url = val
                elif key == 'NEXT_PUBLIC_SUPABASE_ANON_KEY':
                    supabase_key = val

print("Supabase URL extracted:", supabase_url)
print("Supabase Anon Key extracted:", supabase_key is not None)

if not supabase_url or not supabase_key:
    print("Error: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY not found in .env.local")
    exit(1)

# Test REST connection to Supabase
# We try to query the "conversations" or "tasks" or "memories" tables.
# Let's try querying "conversations" since that's a key table.
url = f"{supabase_url}/rest/v1/conversations?select=id&limit=1"
headers = {
    "apikey": supabase_key,
    "Authorization": f"Bearer {supabase_key}"
}

print(f"\nTesting REST connection to Supabase table 'conversations'...")
req = urllib.request.Request(url, headers=headers, method='GET')

try:
    with urllib.request.urlopen(req) as response:
        res_data = json.loads(response.read().decode('utf-8'))
        print("✅ Successfully connected to Supabase!")
        print(f"✅ Response from 'conversations': {res_data}")
except urllib.error.HTTPError as e:
    print(f"❌ HTTP Error {e.code}: {e.reason}")
    try:
        err_body = e.read().decode('utf-8')
        print(f"Error Details: {err_body}")
    except Exception:
        pass
except Exception as e:
    print(f"❌ General Error: {e}")
