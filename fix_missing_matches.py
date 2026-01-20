
import urllib.request
import json
import ssl
from datetime import datetime

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

def fetch_all(endpoint):
    results = []
    limit = 1000
    offset = 0
    while True:
        req = urllib.request.Request(f"{URL}{endpoint}&limit={limit}&offset={offset}", headers=headers)
        try:
            with urllib.request.urlopen(req, context=ctx) as response:
                data = json.loads(response.read())
                if not data:
                    break
                results.extend(data)
                if len(data) < limit:
                    break
                offset += limit
        except Exception as e:
            print(f"Error fetching {endpoint}: {e}")
            break
    return results

def post(endpoint, data):
    req = urllib.request.Request(f"{URL}{endpoint}", headers=headers, data=json.dumps(data).encode(), method='POST')
    try:
        with urllib.request.urlopen(req, context=ctx) as response:
            return response.read()
    except Exception as e:
        print(f"Error posting to {endpoint}: {e}")
        return None

print("Fetching all likes...")
# Only get swiper_id and swiped_id to save memory/bandwidth
likes = fetch_all("/rest/v1/bot_swipes?action=in.(like,superlike)&select=swiper_id,swiped_id")
print(f"Found {len(likes)} likes.")

print("Fetching existing matches...")
matches = fetch_all("/rest/v1/bot_matches?select=user1_id,user2_id")
print(f"Found {len(matches)} matches.")

# Build a set of existing match pairs (normalized as min, max)
existing_match_pairs = set()
for m in matches:
    u1, u2 = sorted([m['user1_id'], m['user2_id']])
    existing_match_pairs.add((u1, u2))

# Build a map of who liked whom
who_liked_whom = {} # swiper -> set of swiped
for l in likes:
    swiper = l['swiper_id']
    swiped = l['swiped_id']
    if swiper not in who_liked_whom:
        who_liked_whom[swiper] = set()
    who_liked_whom[swiper].add(swiped)

# Find mutual likes that aren't matches
missing_matches = []
# Iterate through likes to find pairs
for l in likes:
    u1 = l['swiper_id']
    u2 = l['swiped_id']
    
    # Check if u2 also liked u1
    if u2 in who_liked_whom and u1 in who_liked_whom[u2]:
        pair = tuple(sorted([u1, u2]))
        if pair not in existing_match_pairs:
            missing_matches.append(pair)
            existing_match_pairs.add(pair) # Avoid duplicates

print(f"Found {len(missing_matches)} missing matches.")

for u1, u2 in missing_matches:
    print(f"Fixing mutual like between {u1} and {u2}...")
    # In a real scenario, we'd also award XP and send notifications, 
    # but for now let's just create the match records.
    match_data = {
        "user1_id": u1,
        "user2_id": u2,
        "matched_at": datetime.now().isoformat(),
        "is_active": True
    }
    # post("/rest/v1/bot_matches", match_data) # Commeneted out until confirmed
    print(f"Planned match: {u1} <-> {u2}")

if missing_matches:
    print("\nTo actually create these matches, uncomment the 'post' line in the script.")
