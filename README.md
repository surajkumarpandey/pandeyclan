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
  rotate the token (step below) and everyone's old password stops working.
- "Who made this edit" in the changelog is the name the editor typed in, not a
  verified identity. Good enough for a family site; not a cryptographic proof.

**Steps:**

1. On GitHub: **Settings → Developer settings → Personal access tokens →
   Fine-grained tokens → Generate new token**. Scope it to this one repository
   only, and grant only **Contents: Read and write**. Nothing else. Copy the
   token somewhere safe temporarily.
2. Open `setup.html` on your live site (it's not linked in the nav on purpose —
   just type the URL). Paste the token, pick a name and password for the first
   editor (yourself, to start), and click **Generate access entry**.
3. Copy the JSON it gives you into `data/access.json`, inside the `editors`
   array, and commit that file.
4. Repeat step 2 for each family member you want to give edit access, each with
   their own password. They all unlock the same underlying token — the
   passwords are separate, the write access is shared.
5. To remove someone's access or reset a password: delete their entry from
   `access.json` and (if you're worried the token itself leaked) generate a new
   token on GitHub, revoke the old one, and re-run `setup.html` for everyone.

Editors then just go to `admin.html`, sign in with their name and password, pick
a person, and edit — no GitHub account, no git commands.

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
memory. One official resource worth trying for anyone who held land there:

- **bhulekh.uk.gov.in** — Uttarakhand's official land records portal (Bhulekh /
  Devbhoomi), covering all 13 districts including Almora, free to use.
- It's not searchable by a name across the whole state — you select **district →
  tehsil → village** first, then search within that village's *khatauni* (record
  of rights), by owner name (usually needed in Hindi/Devanagari) or by *khasra*
  (plot) number if you already have one.
- It tends to surface an **earlier generation's name**, not necessarily a living
  relative's — an ancestor's name may still be the registered holder of record.
  That's actually useful here: search for the earliest ancestor you're fairly
  confident held land in Bairati (Sukhdev, or one of his sons), and work forward
  from whatever khata you find.
- There's a companion map view (**bhunaksha.uk.gov.in**) for seeing plot
  boundaries once you have a khasra number.
- This has no bulk API and involves a CAPTCHA, so it's a manual research aid, not
  something this site automates. Worth doing once, by hand, and adding whatever
  you find into people's `bio` or `pastLocations` fields afterward.

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
  "currentLocation": null,
  "pastLocations": [{ "place": "", "year": "" }],
  "photos": ["uploads/filename.jpg"],
  "bio": "",
  "occupation": null
}
```

Edits made this way don't get logged to the changelog automatically (that only
happens through `admin.html`) — GitHub's own commit history covers direct edits
like these.
