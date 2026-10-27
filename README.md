# 🏫 Roomwise

**Find a free room in seconds.** Roomwise is a campus room-booking app. Students search for vacant labs and classrooms and send a request, and faculty approve or reject it. No paper registers and no double bookings.

Built with plain HTML, CSS and JavaScript on top of [Supabase](https://supabase.com). There is no build step and no framework.

---

## ✨ Features

### For students
- Search rooms by **date, time, minimum seats and room type**. Only rooms with no approved booking in that slot appear.
- **Quick length** buttons (1, 2 or 3 hours) to fill in the end time.
- Send a request with a purpose, and **cancel it** while it is still pending.
- Track every request under **All / Pending / Approved / Rejected**, with the faculty's note.
- Live stats and a header link showing how many requests are pending.

### For faculty
- **Request inbox** with status tabs and search across students, rooms, departments and purposes.
- Approve or reject with an optional message to the student.
- **Today's schedule** timeline and live **room occupancy** (Free / Booked later / Busy), refreshed every minute.
- Dashboard stats: pending, approved, today's sessions, rooms in use now.

### For everyone
- Email and password sign-up and login. The role (student or faculty) is chosen at sign-up.
- Delete your own account and all your requests.
- Animated, responsive UI that works on phones and respects reduced-motion settings.

---

## 🧱 Tech stack

| Layer | Choice |
|---|---|
| Front end | HTML, CSS, vanilla JavaScript |
| Backend | Supabase (Postgres, Auth, Row Level Security) |
| Client library | `@supabase/supabase-js` v2 (loaded from a CDN) |
| Fonts | Bricolage Grotesque and Figtree (Google Fonts) |

---

## 📁 Project structure

```
roomwise/
├── index.html      # Login / sign-up
├── student.html    # Student dashboard
├── faculty.html    # Faculty dashboard
├── app.js          # Supabase client, shared helpers, auth guard, header behaviour
├── style.css       # All styling and animations
├── supabase.sql    # Database schema, security policies, seed rooms
└── README.md
```

---

## 🚀 Getting started

### 1. Create a Supabase project
Create a free project at [supabase.com](https://supabase.com).

### 2. Set up the database
Open **SQL Editor → New query**, paste the whole of `supabase.sql` and click **Run**. This creates the tables, the no-overlap rule, the security policies, the helper functions and six sample rooms.

### 3. Turn off email confirmation (recommended for testing)
Go to **Authentication → Providers → Email** and disable **Confirm email**. Sign-up then works instantly and you avoid the "email rate limit exceeded" error.

### 4. Add your keys
In **Project Settings → API**, copy the **Project URL** and the **anon public key**, then paste them at the top of `app.js`:

```js
const SUPABASE_URL = "https://YOUR-PROJECT.supabase.co";
const SUPABASE_KEY = "YOUR-ANON-PUBLIC-KEY";
```

### 5. Run it
Open `index.html` in a browser, or serve the folder to avoid any file-path quirks:

```bash
npx serve .
# or
python3 -m http.server 5500
```

Create one **Faculty** account and one **Student** account to try the full flow.

---

## 🔄 How it works

```
Student                         Faculty
───────                         ───────
Search free rooms
Send request (pending)  ─────▶  Sees it in the inbox
                                Approves or rejects, with a note
Sees the decision       ◀─────  
```

- **Pending** requests do not block a room.
- **Approved** bookings do. When faculty approve, the database refuses any overlap with another approved booking in the same room.

---

## 🗄️ Database

| Table | Purpose |
|---|---|
| `profiles` | One row per user: `full_name`, `role` (`student` or `faculty`), `department` |
| `rooms` | `name`, `type` (Lab, Classroom, Seminar hall), `capacity`, `equipment[]`, `is_active` |
| `bookings` | `room_id`, `requested_by`, `start_time`, `end_time`, `purpose`, `status`, `reviewed_by`, `reason` |

Helper functions:

| Function | What it does |
|---|---|
| `handle_new_user()` | Trigger that creates a profile when someone signs up |
| `is_faculty()` | Used by security policies |
| `available_rooms(start, end, min_cap, type)` | Returns vacant rooms for a time window |
| `delete_own_account()` | Lets a signed-in user delete themselves and their bookings |

### Add or change rooms

```sql
insert into rooms (name, type, capacity, equipment)
values ('Physics Lab', 'Lab', 45, '{Projector,Whiteboard}');

-- hide a room without deleting it
update rooms set is_active = false where name = 'Room 204';
```

---

## 🔐 Security notes

- The **anon key is meant to be public**. Access is controlled by Row Level Security: students see only their own bookings, faculty see all, and only faculty can approve or reject.
- ⚠️ **Anyone can pick "Faculty" at sign-up.** That is fine for a demo or hackathon. For real use, remove the role choice from sign-up and let an admin promote users:
  ```sql
  update profiles set role = 'faculty' where id = '<user-id>';
  ```
  Also change `handle_new_user()` so new accounts are always `student`.
- Never put the `service_role` key in front-end code.

---

## 🎨 Customising

- **Colours:** change the variables at the top of `style.css` (`--ink`, `--vac`, `--warn`, `--bad`, `--ok`).
- **Room types:** edit the `check` constraint in `supabase.sql` and the dropdown in `student.html`.
- **Branding:** change the "Roomwise" text in the three HTML files. The logo icon is pure CSS (`.logo::before`).

---

## 🛠️ Troubleshooting

| Problem | Fix |
|---|---|
| "Email rate limit exceeded" | Disable **Confirm email** (step 3) or wait about an hour |
| "Account not confirmed" | Click the link in the email, or disable email confirmation |
| Page bounces back to login | You are signed out, or your profile row is missing. Sign up again |
| "Room already approved for an overlapping time" | Another approved booking exists in that slot. Reject this request or ask for a different time |
| Rooms list is empty | The seed rows did not run. Re-run the `insert into rooms` part of `supabase.sql` |
| Nothing loads | Check the URL and key in `app.js` and the browser console |

---

## 📌 Roadmap ideas

- Calendar view of all bookings
- Email notifications on approval or rejection
- Recurring bookings (weekly lab slots)
- Admin page to manage rooms and users

---

Made with ☕ by Tony.
