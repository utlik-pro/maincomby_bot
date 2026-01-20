
import urllib.request
import json
import ssl

# Config
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

URL = "https://ndpkxustvcijykzxqxrn.supabase.co"
KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5kcGt4dXN0dmNpanlrenhxeHJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5OTU2NzUsImV4cCI6MjA4MjU3MTY3NX0.D9jdEgX8qjSqNvmXpu-uCSFDw6SCd7UG8pQNSOvgrKE"
HEADERS = {
    "apikey": KEY,
    "Authorization": f"Bearer {KEY}",
    "Content-Type": "application/json"
}

USERNAME = "dmitryutlik"

def fetch(endpoint, headers_extra=None):
    h = HEADERS.copy()
    if headers_extra:
        h.update(headers_extra)
    
    req = urllib.request.Request(f"{URL}{endpoint}", headers=h)
    try:
        with urllib.request.urlopen(req, context=ctx) as r:
            if 'count=exact' in h.get('Prefer', ''):
                cr = r.getheader('Content-Range')
                return int(cr.split('/')[-1]) if cr else 0
            return json.loads(r.read())
    except Exception as e:
        print(f"Error fetching {endpoint}: {e}")
        return None

print(f"--- Analyzing data for user: {USERNAME} ---")

# 1. Get User
users = fetch(f"/rest/v1/bot_users?username=eq.{USERNAME}&select=id,tg_user_id,first_name,subscription_tier")
if not users:
    print("User not found!")
    exit()

me = users[0]
my_id = me['id']
print(f"User ID: {my_id}, Tier: {me.get('subscription_tier')}")

# 2. Get Raw Incoming Likes (All time)
# action is 'like' or 'superlike'
incoming_count = fetch(
    f"/rest/v1/bot_swipes?swiped_id=eq.{my_id}&action=in.(like,superlike)&select=id",
    {"Prefer": "count=exact"}
)
print(f"Total Incoming Likes (All Time): {incoming_count}")

if incoming_count == 0:
    print("Result: No one has liked you yet.")
    exit()

# 3. Get the IDs of people who liked me
likes_data = fetch(f"/rest/v1/bot_swipes?swiped_id=eq.{my_id}&action=in.(like,superlike)&select=swiper_id")
liker_ids = [r['swiper_id'] for r in likes_data] if likes_data else []

# 4. Check how many of these I have already swiped (action 'like', 'skip', 'superlike')
# We query swipes where swiper_id = me AND swiped_id IN (liker_ids)
# Since Supabase URL params limit length, if liker_ids is huge we might need batches, but for now specific check is fine.
# We'll just fetch ALL my swipes and cross-reference in python for simplicity and speed (assuming < 10k swipes)

my_swipes = fetch(f"/rest/v1/bot_swipes?swiper_id=eq.{my_id}&select=swiped_id,action")
my_swiped_ids = set([s['swiped_id'] for s in my_swipes]) if my_swipes else set()

print(f"You have swiped {len(my_swiped_ids)} profiles in total.")

# 5. Calculate Pending Likes
pending_likers = [uid for uid in liker_ids if uid not in my_swiped_ids]
print(f"Pending Likes (Unseen): {len(pending_likers)}")

if len(pending_likers) == 0:
    print("\nCONCLUSION: You have 0 pending likes because you have already processed (swiped) everyone who liked you.")
    print("The system only shows *new* interest.")
else:
    print(f"\nCONCLUSION: You should see {len(pending_likers)} likes in the 'Who Liked Me' info.")
    print(f"IDs of pending likers: {pending_likers}")

