// Stratos DefenseTech Map — live Airtable data proxy
// Fetches all company records from Airtable and returns clean JSON with
// fresh (non-expiring-per-load) logo URLs. The Airtable token lives ONLY in
// a Vercel environment variable and is never exposed to the browser.

const BASE_ID  = process.env.AIRTABLE_BASE_ID  || "appcP80PevSpf5WY1";
const TABLE_ID = process.env.AIRTABLE_TABLE_ID || "tblvwLdeNdeQXz35u";

// Field IDs (robust against field renames / trailing spaces in field names)
const F = {
  name:    "fldjLIyY0kTU7XvGE", // Company Name
  logo:    "fldcYlA25lCVDCUTP", // Logo (attachment)
  website: "fld48GBLxbbFdQpYc", // Website Link
  industry:"fldPLMiWokOga6Y2s", // Industry (Select)
  blurb:   "fldpfF3HOngS774J5", // Blurb
  status:  "fldT7q137Aztsrlhy", // Company Status
};

module.exports = async (req, res) => {
  const token = process.env.AIRTABLE_TOKEN || process.env.AIRTABLE_API_KEY;
  if (!token) {
    res.status(500).json({
      error: "missing_token",
      message: "Set the AIRTABLE_TOKEN environment variable in Vercel (see README).",
    });
    return;
  }

  try {
    const records = [];
    let offset = null;
    do {
      const url = new URL(`https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}`);
      url.searchParams.set("pageSize", "100");
      url.searchParams.set("returnFieldsByFieldId", "true");
      if (offset) url.searchParams.set("offset", offset);

      const r = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (!r.ok) {
        const body = await r.text();
        res.status(r.status).json({ error: "airtable_error", status: r.status, body });
        return;
      }
      const data = await r.json();
      records.push(...data.records);
      offset = data.offset || null;
    } while (offset);

    const companies = records.map((rec) => {
      const f = rec.fields || {};
      const att = Array.isArray(f[F.logo]) && f[F.logo].length ? f[F.logo][0] : null;
      const logo = att
        ? (att.thumbnails?.large?.url || att.thumbnails?.full?.url || att.url)
        : null;
      const ind = f[F.industry];
      const st  = f[F.status];
      return {
        name:     f[F.name] || "",
        website:  f[F.website] || "",
        category: ind ? (typeof ind === "object" ? ind.name : ind) : null,
        status:   st  ? (typeof st  === "object" ? st.name  : st ) : null,
        blurb:    f[F.blurb] || "",
        logo,
      };
    }).filter((c) => c.name);

    // Browsers cache for 5 min; CDN serves stale-while-revalidate so loads stay fast
    res.setHeader("Cache-Control", "public, max-age=300, s-maxage=300, stale-while-revalidate=600");
    res.status(200).json({ count: companies.length, companies });
  } catch (e) {
    res.status(500).json({ error: "server_error", message: String(e) });
  }
};
