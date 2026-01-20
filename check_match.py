
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

# Get the SuperLike again to get internal IDs
swipes = fetch("/rest/v1/bot_swipes?action=eq.superlike&select=*&order=swiped_at.desc&limit=1")

if swipes:
    swipe = swipes[0]
    u1 = swipe['swiper_id']
    u2 = swipe['swiped_id']
    print(f"Checking match between User {u1} and User {u2}...")

    # Matches are stored with user1_id < user2_id usually, or just check both combinations
    # The models.py says: user1_id, user2_id.
    # We should search where (user1=u1 AND user2=u2) OR (user1=u2 AND user2=u1)
    
    # Supabase PostgREST syntax for OR is a bit complex: ?or=(user1_id.eq.U1,user2_id.eq.U2),...
    # Easier to just try both specific queries.
    
    match1 = fetch(f"/rest/v1/bot_matches?user1_id=eq.{u1}&user2_id=eq.{u2}&select=*")
    match2 = fetch(f"/rest/v1/bot_matches?user1_id=eq.{u2}&user2_id=eq.{u1}&select=*")
    
    matches = (match1 or []) + (match2 or [])
    
    if matches:
        print("✅ MATCH FOUND!")
        for m in matches:
            print(f"Match ID: {m.get('id')}, Active: {m.get('is_active')}, Date: {m.get('matched_at')}")
    else:
        print("❌ No match found (yet). The other user hasn't liked back.")
else:
    print("No SuperLike found to check.")
