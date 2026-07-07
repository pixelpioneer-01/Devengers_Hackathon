// ==========================================
// CivicAI — Supabase Opinions Database Proxy
// ==========================================

export default async function handler(req, res) {
  // Add CORS headers
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || req.body?.supabaseUrl;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || req.body?.supabaseKey;

  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ error: "Supabase not configured." });
  }

  const cleanUrl = supabaseUrl.endsWith('/') ? supabaseUrl.slice(0, -1) : supabaseUrl;

  try {
    if (req.method === "GET") {
      // Fetch latest 30 opinions sorted by created_at descending
      const response = await fetch(`${cleanUrl}/rest/v1/opinions?order=created_at.desc&limit=30`, {
        method: "GET",
        headers: {
          "apikey": supabaseKey,
          "Authorization": `Bearer ${supabaseKey}`,
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error("Failed to fetch opinions from database");
      }

      const data = await response.json();
      return res.status(200).json(data);

    } else if (req.method === "POST") {
      const { text, author, votes, comments } = req.body;

      if (!text || !author) {
        return res.status(400).json({ error: "Missing text or author fields" });
      }

      // Insert new opinion
      const response = await fetch(`${cleanUrl}/rest/v1/opinions`, {
        method: "POST",
        headers: {
          "apikey": supabaseKey,
          "Authorization": `Bearer ${supabaseKey}`,
          "Content-Type": "application/json",
          "Prefer": "return=representation"
        },
        body: JSON.stringify({
          text,
          author,
          votes_up: votes?.up || 0,
          votes_down: votes?.down || 0,
          comments: comments || []
        })
      });

      if (!response.ok) {
        const errorMsg = await response.text();
        throw new Error(`Failed to save opinion: ${errorMsg}`);
      }

      const data = await response.json();
      return res.status(201).json(data[0]);

    } else if (req.method === "PUT") {
      // Handle voting or adding replies
      const { id, votes_up, votes_down, comments } = req.body;

      if (!id) {
        return res.status(400).json({ error: "Missing opinion id" });
      }

      const updateData = {};
      if (votes_up !== undefined) updateData.votes_up = votes_up;
      if (votes_down !== undefined) updateData.votes_down = votes_down;
      if (comments !== undefined) updateData.comments = comments;

      const response = await fetch(`${cleanUrl}/rest/v1/opinions?id=eq.${id}`, {
        method: "PATCH",
        headers: {
          "apikey": supabaseKey,
          "Authorization": `Bearer ${supabaseKey}`,
          "Content-Type": "application/json",
          "Prefer": "return=representation"
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        throw new Error("Failed to update opinion");
      }

      const data = await response.json();
      return res.status(200).json(data[0]);

    } else {
      return res.status(405).json({ error: "Method Not Allowed" });
    }
  } catch (error) {
    console.error("Supabase API error:", error);
    return res.status(500).json({ error: error.message || "Internal Server Error" });
  }
}
