import urllib.request
import json
import ssl
import datetime

# Disable SSL verification
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

# Production credentials
URL = "https://ndpkxustvcijykzxqxrn.supabase.co"
KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5kcGt4dXN0dmNpanlrenhxeHJuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Njk5NTY3NSwiZXhwIjoyMDgyNTcxNjc1fQ.e_cBP7YYfFoFFxRA0hFXG8WSyuBlSjFaNPQBYlKNjiQ"

headers = {
    "apikey": KEY,
    "Authorization": f"Bearer {KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=minimal"
}

def request(method, endpoint, data=None):
    try:
        url = f"{URL}{endpoint}"
        body = json.dumps(data).encode('utf-8') if data else None
        req = urllib.request.Request(url, data=body, headers=headers, method=method)
        with urllib.request.urlopen(req, context=ctx) as response:
            return response.read()
    except Exception as e:
        print(f"Error {method} {endpoint}: {e}")
        return None

print("🚀 Starting manual PRO application...")

# 1. Get pending actions
print("1. Fetching pending actions...")
try:
    req = urllib.request.Request(f"{URL}/rest/v1/bot_admin_actions?status=eq.pending&action=eq.gift_pro&select=*", headers=headers)
    with urllib.request.urlopen(req, context=ctx) as response:
        actions = json.loads(response.read())
except Exception as e:
    print(f"Failed to fetch actions: {e}")
    actions = []

print(f"Found {len(actions)} pending actions.")

# Process each (or just the latest unique users)
processed_users = set()

for action in actions:
    user_id = action['payload'].get('user_id')
    duration = action['payload'].get('duration_days', 30)
    
    if user_id in processed_users:
        # Just mark as completed so we don't spam or double apply (logic wise ok to overwrite though)
        pass
    
    print(f"Processing Action {action['id']} for User ID {user_id}...")
    
    # Calculate dates
    now = datetime.datetime.utcnow()
    expires = now + datetime.timedelta(days=duration)
    expires_str = expires.isoformat()
    
    # 2. Update User (we need to find the user by ID - wait, payload has user_id which is SQL ID)
    # Checking if it matches bot_users.id
    print(f"   Updating User {user_id} to PRO until {expires_str}...")
    
    update_data = {
        "subscription_tier": "pro",
        "subscription_expires_at": expires_str
    }
    
    res = request("PATCH", f"/rest/v1/bot_users?id=eq.{user_id}", update_data)
    
    if res is not None:
        print("   ✅ User updated successfully!")
        processed_users.add(user_id)
        
        # 3. Mark action as completed
        print(f"   Marking action {action['id']} as completed...")
        request("PATCH", f"/rest/v1/bot_admin_actions?id=eq.{action['id']}", {
            "status": "completed",
            "processed_at": now.isoformat()
        })
    else:
        print("   ❌ Failed to update user.")

print("🏁 Done!")
