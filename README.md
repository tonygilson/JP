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
## 📁 Project url:https://roomwisestudent.vercel.app/index.html
