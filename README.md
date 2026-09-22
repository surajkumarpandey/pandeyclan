# The Pandey Clan of Bairati

A family tree site for the descendants of Sukhdev, traced through to today, rooted in
Bairati village, Almora district, Uttarakhand. Static site, hosted free on GitHub
Pages, edited by trusted family members through a password-gated panel, with every
change logged.

## What's in here

```
index.html      landing page
tree.html       interactive, searchable family tree
map.html        Bairati + everywhere the family has lived, on a map
admin.html      password-gated editing (add photos, locations, bios)
audit.html      changelog — every edit, who made it, when
setup.html      one-time tool for you (the admin) to issue editor passwords
css/style.css   shared design
js/             crypto.js, github.js, common.js — see "How editing works" below
data/
  people.json     the family tree data — 105 people, 14 generations
  audit-log.json  starts empty; fills in as people edit
  access.json     starts empty; you add editor entries via setup.html
uploads/        photos land here once uploaded
```

## 1. Put this on GitHub Pages

1. Create a new **public** GitHub repository (public repos get free Pages hosting
   and free Actions minutes; a private repo would need a paid plan for Pages).
   Suggested name: `pandey-clan-of-bairati`.
2. Upload everything in this folder to that repo (drag-and-drop on github.com works
   fine, or `git push` if you're comfortable with it).
3. In the repo, go to **Settings → Pages**, set the source to the `main` branch,
   root folder. GitHub will give you a URL like
   `https://<your-username>.github.io/pandey-clan-of-bairati/`.
4. Open `js/github.js` and set `owner` and `repo` at the top to your GitHub
   username and the repo name. Commit that change.

That's the whole hosting side — free, and it stays free as long as the repo is
public.

## 2. Set up editing (password-based, no GitHub account needed for editors)

This is the part worth understanding before you turn it on, because it's a
deliberate trade-off:

- A static site can't safely check a password and write to GitHub unless
  *something* holds a credential that can write to the repo. Since we're keeping
  this entirely inside GitHub (no Netlify, no Cloudflare, no other service), that
  credential is a **GitHub personal access token**, scoped as narrowly as
  possible.
- The token is never stored in plain text. It's encrypted once per editor, with
  that editor's own password, using your browser's built-in encryption (AES-GCM).
  Without the right password, the token in `data/access.json` is just noise.
- This is good, sensible security for a family project — not bank-grade. Someone
  who has both a valid password and enough technical skill to open browser dev
  tools during their own logged-in session could extract the decrypted token. In
  practice that person already had edit access anyway; if it ever worries you,
  generate a fresh token on GitHub, revoke the old one, and redo step 1 below —
  every existing password stops working at once.
- "Who made this edit" in the changelog is the name the editor typed in, not a
  verified identity. Good enough for a family site; not a cryptographic proof.

**You (the superuser) only touch a token once.** After that, you manage
everyone else's password from inside the Edit page itself — no more copying
tokens around.

1. On GitHub: **Settings → Developer settings → Personal access tokens →
   Fine-grained tokens → Generate new token**. Scope it to this one repository
   only, and grant only **Contents: Read and write**. Nothing else.
2. Open `setup.html` on your live site (it's not linked in the nav on purpose —
   just type the URL). Paste the token, your name, and a password only you'll
   know, then click **Generate superuser entry**.
3. Copy the JSON it gives you into `data/access.json`, inside the `editors`
   array, and commit that file.
4. Go to `admin.html` and sign in with that password. You'll see a
   **Manage editors** tab — that's it, no more setup.html, no more tokens.
   From there, type a family member's name and a password for them, click
   **Add editor**, and tell them the password. To revoke someone, click
   **Remove** next to their name in that same list.

Editors then just go to `admin.html`, sign in with their name and password, pick
a person, and edit — no GitHub account, no git commands, no tokens.

## 3. The changelog

Every save writes to `data/audit-log.json` alongside the data change, in the same
step — who, what field, old value, new value, when. `audit.html` reads that file
and renders a searchable table. This is separate from (and friendlier than)
GitHub's own commit history, though that's still there too if you ever need it.

## 4. Photos

When an editor uploads a photo, it's resized to a max of 1600px and compressed
before it's committed to `uploads/`, to keep the repo light. GitHub repos handle
this kind of casual photo library fine into the hundreds of megabytes; if the
family ends up with a lot of high-resolution scans, consider a `git-lfs` setup
later, but you won't need to think about that for a long while.

## 5. Filling in more history — Uttarakhand land records

Bairati itself doesn't show up in indexed web history — it's a hamlet, not a
town — so the best source for anything beyond the chart is the family's own
memory. One official resource worth trying for anyone who held land there —
full walkthrough, with Bairati's exact district/tehsil/village values, is on
the site's own **Bairati Village** page (`village.html`). Short version:

- **bhulekh.uk.gov.in** — जनपद अल्मोड़ा, तहसील चौखुटिया, ग्राम बैरती.
- Search by *khatedar ka naam* (owner's name), ideally in Hindi — try the
  earliest ancestor first (Sukhdev Ji or one of his sons), since land records
  often still list an earlier generation as the registered holder.
- **bhunaksha.uk.gov.in** shows plot boundaries once you have a khasra number.
- This is CAPTCHA-gated with no public API, so it's a manual visit, not
  something this site automates. I tried fetching it directly and it blocks
  automated access on purpose. Whatever you find is worth adding to the
  relevant person's `bio` or `locations` field afterward.

## 6. Editing the data directly

For bulk changes (adding a whole branch at once, fixing many records), it's often
faster to edit `data/people.json` directly on GitHub.com and commit, rather than
going person-by-person in the admin panel. The schema for each person:

```json
{
  "id": "unique-slug",
  "name": "Full Name",
  "gender": "M | F | unknown",
  "parentId": "id-of-father-or-null",
  "generation": 1,
  "unnamedPlaceholder": false,
  "birthYear": null,
  "deathYear": null,
  "locations": [
    { "place": "Bairati, Almora", "type": "origin", "year": null, "note": null },
    { "place": "Haldwani", "type": "current", "year": null, "note": null },
    { "place": "Delhi", "type": "visited", "year": null, "note": null }
  ],
  "photos": ["uploads/filename.jpg"],
  "bio": "",
  "occupation": null
}
```

`locations[].type` is one of `origin` (Bairati, usually), `current` (where
they live now), `lived` (a place they were based for a stretch), or `visited`
(everywhere else). The Journeys Map (`map.html`) reads this to draw both the
whole family's footprint and any one person's individual path.

Edits made this way don't get logged to the changelog automatically (that only
happens through `admin.html`) — GitHub's own commit history covers direct edits
like these.
