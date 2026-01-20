
import urllib.request
import json
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

URL = "https://ndpkxustvcijykzxqxrn.supabase.co"
KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5kcGt4dXN0dmNpanlrenhxeHJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5OTU2NzUsImV4cCI6MjA4MjU3MTY3NX0.D9jdEgX8qjSqNvmXpu-uCSFDw6SCd7UG8pQNSOvgrKE"

headers = {
    "apikey": KEY,
    "Authorization": f"Bearer {KEY}",
    "Content-Type": "application/json"
}

def fetch(endpoint):
    req = urllib.request.Request(f"{URL}{endpoint}", headers=headers)
    try:
        with urllib.request.urlopen(req, context=ctx) as response:
            return json.loads(response.read())
    except Exception as e:
        print(f"Error fetching {endpoint}: {e}")
        return None

# Get count of each action
# Supabase REST doesn't support GROUP BY directly easily via GET /rest/v1/...
# We can use RPC or just fetch and count if small, but let's try to get counts by filtering
actions = ['like', 'skip', 'superlike']
for action in actions:
    # Use Prefer: count=exact to get count without full data
    req = urllib.request.Request(f"{URL}/rest/v1/bot_swipes?action=eq.{action}&select=id", headers={**headers, "Prefer": "count=exact"})
    try:
        with urllib.request.urlopen(req, context=ctx) as response:
            count = response.getheader('Content-Range').split('/')[-1]
            print(f"{action}: {count}")
    except Exception as e:
        print(f"Error getting count for {action}: {e}")
