// ============================
// CivicAI — Wikipedia API Helper
// ============================

/**
 * Fetch a summary from Wikipedia for a given topic
 * @param {string} topic - search topic
 * @returns {string} extracted summary text
 */
export async function getWikipediaSummary(topic) {
  if (!topic) return '';
  
  // Clean up the topic string for Wikipedia
  let cleanTopic = topic.trim()
    .replace(/^the\s+/i, '')
    .split(/[.,]/)[0];
    
  // Strategy: Try Summary API, if 404, try Search API to find correct title, then Summary API again
  try {
    const fetchSummary = async (t) => {
      const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(t)}`);
      return res.ok ? await res.json() : null;
    };

    let data = await fetchSummary(cleanTopic);
    
    if (!data && cleanTopic !== topic) {
      data = await fetchSummary(topic.trim());
    }

    // Fallback: Use Search API to find the best title Match
    if (!data) {
      console.log('Searching Wikipedia for:', cleanTopic);
      const searchRes = await fetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(cleanTopic)}&format=json&origin=*`);
      const searchData = await searchRes.json();
      
      if (searchData.query?.search?.length > 0) {
        const bestTitle = searchData.query.search[0].title;
        console.log('Found best title:', bestTitle);
        data = await fetchSummary(bestTitle);
      }
    }

    return data?.extract || '';
  } catch (err) {
    console.warn('Wikipedia API error:', err);
    return '';
  }
}
