# Stratos DefenseTech Map — Live (Airtable-driven)

An interactive ecosystem map of the Israeli DefenseTech landscape, branded for
Stratos Ventures. Companies, categories, websites, statuses **and logos** are
pulled **live from Airtable** every time the page loads — so the map always
reflects exactly what's in your base, and logos are always the ones you curated
there. Edit Airtable, refresh the page, done.

## How it works

```
index.html  ──fetch──►  /api/companies  ──Airtable REST API──►  Airtable base
 (browser)              (Vercel function,                       (Company Directory)
                         token stays server-side)
```

The browser never sees your Airtable token. It lives only in a Vercel
environment variable that the serverless function reads.

## One-time setup (≈3 minutes)

### 1. Create an Airtable read token
1. Go to **https://airtable.com/create/tokens**
2. Click **Create new token**, name it e.g. `stratos-map-read`.
3. Under **Scopes**, add: `data.records:read`
4. Under **Access**, add the base **Company Directory**.
5. Click **Create token** and **copy** the token (starts with `pat...`). You
   won't be able to see it again.

### 2. Deploy to Vercel
- Push this `stratos-live-map` folder to GitHub (or drag-drop into Vercel), and
  import it as a new Vercel project. No build step is required.

### 3. Add the token in Vercel
In your Vercel project → **Settings → Environment Variables**, add:

| Name             | Value                          |
|------------------|--------------------------------|
| `AIRTABLE_TOKEN` | the `pat...` token from step 1 |

(Optional — only if you move the data later)

| Name                | Value (defaults shown)        |
|---------------------|-------------------------------|
| `AIRTABLE_BASE_ID`  | `appcP80PevSpf5WY1`           |
| `AIRTABLE_TABLE_ID` | `tblvwLdeNdeQXz35u`           |

Then **redeploy** (Deployments → ⋯ → Redeploy) so the variable takes effect.

That's it. Visit your Vercel URL and the map loads live from Airtable.

## Notes
- If you see "Couldn't load the live data", the `AIRTABLE_TOKEN` isn't set yet
  (or needs a redeploy after being added).
- The map groups companies by the **Industry (Select)** field. Any new category
  you add in Airtable will appear automatically; to give it a custom colour or
  ordering, edit the `COLORS` / `ORDER` maps near the top of the `<script>` in
  `index.html`.
- Hovering a logo shows the company name + domain; clicking opens its website.
- Company **Status** (Active / Prospect / Inactive) shows as a small dot in the
  top-right of each logo (Active = no dot).
