// ============================
// CivicAI — Location & Leader Helper
// ============================

/**
 * Detect user's GPS coordinates via browser Geolocation API
 */
export function detectLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject('Geolocation is not supported by this browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => reject(err.message),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  });
}

/**
 * Reverse geocode coordinates to constituency/district using Nominatim (OpenStreetMap)
 */
export async function getConstituency(lat, lng) {
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`;
  const res = await fetch(url, { headers: { 'Accept-Language': 'en', 'User-Agent': 'CivicAI-Hackathon/1.0' } });
  if (!res.ok) throw new Error('Reverse geocoding failed');
  const data = await res.json();
  const a = data.address;
  return {
    district: a.county || a.city_district || a.suburb || '',
    city: a.city || a.town || a.village || '',
    state: a.state || '',
    postcode: a.postcode || '',
    displayName: data.display_name,
    constituency: `${a.county || a.city_district || a.city || ''}, ${a.state || ''}`,
  };
}

/**
 * Search Wikipedia for politicians/topics and return structured info for multiple results
 */
export async function searchLeaderOnWikipedia(searchTerm, limit = 1) {
  try {
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(searchTerm)}&format=json&origin=*&srlimit=${limit}`;
    const searchRes = await fetch(searchUrl);
    const searchData = await searchRes.json();
    const results = searchData?.query?.search || [];
    if (results.length === 0) return [];

    const leaders = await Promise.all(
      results.map(async (res) => {
        try {
          const summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(res.title)}`;
          const summaryRes = await fetch(summaryUrl);
          if (!summaryRes.ok) return null;
          const s = await summaryRes.json();
          return {
            name: s.title,
            summary: s.extract || '',
            thumbnail: s.thumbnail?.source || null,
            wikiUrl: s.content_urls?.desktop?.page || '',
          };
        } catch {
          return null;
        }
      })
    );

    return leaders.filter(Boolean);
  } catch {
    console.warn('Wikipedia leader search failed for:', searchTerm);
    return [];
  }
}
