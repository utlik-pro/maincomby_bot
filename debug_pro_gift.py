import urllib.request
import json
import ssl
import sys

# Disable SSL verification for development/debugging 
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

# Production credentials from .env
URL = "https://ndpkxustvcijykzxqxrn.supabase.co"
KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5kcGt4dXN0dmNpanlrenhxeHJuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Njk5NTY3NSwiZXhwIjoyMDgyNTcxNjc1fQ.e_cBP7YYfFoFFxRA0hFXG8WSyuBlSjFaNPQBYlKNjiQ"

headers = {
    "apikey": KEY,
    "Authorization": f"Bearer {KEY}",
    "Content-Type": "application/json"
}

def fetch(endpoint):
    try:
        req = urllib.request.Request(f"{URL}{endpoint}", headers=headers)
        with urllib.request.urlopen(req, context=ctx) as response:
            return json.loads(response.read())
    except urllib.error.HTTPError as e:
        print(f"HTTP Error {e.code}: {e.read().decode()}")
        return None
    except Exception as e:
        print(f"Error fetching {endpoint}: {e}")
        return None

print(f"--- Checking Supabase: {URL} ---")

# 1. Check if table exists (fetched simple select)
print("\n[1] Checking 'bot_admin_actions' table...")
actions = fetch("/rest/v1/bot_admin_actions?select=*&limit=5&order=id.desc")

if actions is None:
    print("❌ Table 'bot_admin_actions' might not exist or permission denied.")
    print("   Please rerun the SQL migration!")
else:
    print(f"✅ Table exists. Found {len(actions)} recent actions.")
    for a in actions:
        print(f"   - ID: {a['id']}, Action: {a['action']}, Status: {a['status']}, Payload: {a['payload']}")

# 2. Check for 'gift_pro' specific actions
print("\n[2] Checking for pending 'gift_pro' actions...")
pending = fetch("/rest/v1/bot_admin_actions?action=eq.gift_pro&status=eq.pending&select=*")
if pending:
    print(f"✅ Found {len(pending)} PENDING 'gift_pro' actions.")
    print("   Bot has NOT processed them yet. Bot needs restart?")
else:
    print("ℹ️ No pending 'gift_pro' actions found.")

# 3. Check for failed actions
print("\n[3] Checking for failed actions...")
failed = fetch("/rest/v1/bot_admin_actions?status=eq.failed&select=*&limit=5")
if failed:
    print(f"⚠️ Found {len(failed)} FAILED actions.")
    for f in failed:
        print(f"   - Error: {f.get('error_message')}")

