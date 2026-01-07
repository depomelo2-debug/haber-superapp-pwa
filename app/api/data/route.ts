import { NextResponse } from "next/server";

// YEDEK VERİLER (İnternet tamamen koparsa bunlar görünür)
const DEMO_FINANCE = {
  dolar: "34.20",
  euro: "37.15",
  gram: "2980.50",
  ceyrek: "4900.00"
};

const DEMO_NEWS = [
  { title: "Sistem Mesajı: Güncel haberlere şu an ulaşılamıyor (Demo Mod)", pubDate: new Date().toISOString(), author: "Sistem", thumbnail: null, link: "#" },
  { title: "İstanbul'da beklenen yağış başladı", pubDate: new Date().toISOString(), author: "Hava Durumu", thumbnail: null, link: "#" },
  { title: "Teknoloji dünyasında yeni gelişmeler", pubDate: new Date().toISOString(), author: "Teknoloji", thumbnail: null, link: "#" }
];

export async function GET() {
  let financeData = { ...DEMO_FINANCE };
  let newsData = [];

  // ----------------------------------------------------------------
  // 1. MODÜL: FİNANS VERİSİ
  // ----------------------------------------------------------------
  try {
    const financeRes = await fetch('https://finans.truncgil.com/today.json', {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      next: { revalidate: 0 } // Cache yok, hep taze
    });

    if (financeRes.ok) {
      const data = await financeRes.json();
      
      const find = (keywords: string[]) => {
        const cleanKeyMap: Record<string, string> = {};
        Object.keys(data).forEach(k => {
           const clean = k.toLowerCase().replace(/[^a-z0-9]/g, '');
           cleanKeyMap[clean] = k;
        });
        for (const word of keywords) {
          const match = Object.keys(cleanKeyMap).find(k => k.includes(word));
          if (match) return data[cleanKeyMap[match]].Satış;
        }
        return null;
      };

      const d = find(["abd", "usd"]);
      const e = find(["eur", "euro"]);
      const g = find(["gramaltin", "gram"]);
      const c = find(["ceyrek", "cyrek"]);

      if (d) financeData.dolar = d;
      if (e) financeData.euro = e;
      if (g) financeData.gram = g;
      if (c) financeData.ceyrek = c;
    }
  } catch (e) {
    console.error("Finans API Hatası (Yedek kullanılıyor):", e);
  }

  // ----------------------------------------------------------------
  // 2. MODÜL: HABERLER (3 AŞAMALI GÜVENLİK)
  // ----------------------------------------------------------------
  
  // PLAN A: Senin NewsAPI Key'in
  try {
    const apiKey = "743ace52381a4d0e9e7ac3642c5596c5";
    const newsRes = await fetch(`https://newsapi.org/v2/top-headlines?country=tr&apiKey=${apiKey}&pageSize=10`, { next: { revalidate: 120 } });
    
    if (newsRes.ok) {
      const json = await newsRes.json();
      if (json.articles && json.articles.length > 0) {
        newsData = json.articles.map((item: any) => ({
          title: item.title,
          link: item.url,
          pubDate: item.publishedAt,
          author: item.source.name || "NewsAPI",
          thumbnail: item.urlToImage
        }));
      }
    }
  } catch (e) { console.error("Plan A (NewsAPI) başarısız:", e); }

  // PLAN B: Eğer Plan A çalışmazsa -> TRT RSS (Manuel Parse)
  if (newsData.length === 0) {
    try {
      const trtRes = await fetch('https://www.trthaber.com/xml/sondakika.rss', { cache: 'no-store' });
      if (trtRes.ok) {
        const text = await trtRes.text();
        const items = text.match(/<item>([\s\S]*?)<\/item>/g)?.slice(0, 10) || [];
        
        newsData = items.map(item => {
          const title = item.match(/<title>(.*?)<\/title>/)?.[1]?.replace('<![CDATA[', '').replace(']]>', '') || "Haber";
          const link = item.match(/<link>(.*?)<\/link>/)?.[1] || "#";
          const pubDate = item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || "";
          // TRT resim bulma
          const img = item.match(/url="([^"]+)"/)?.[1] || item.match(/src="([^"]+)"/)?.[1] || null;

          return { title, link, pubDate, author: "TRT Haber", thumbnail: img };
        });
      }
    } catch (e) { console.error("Plan B (TRT) başarısız:", e); }
  }

  // PLAN C: Eğer o da çalışmazsa -> DEMO VERİLER
  if (newsData.length === 0) {
    newsData = DEMO_NEWS;
  }

  // SONUÇ:
  return NextResponse.json({
    finance: financeData,
    news: newsData,
    lastUpdate: new Date().toLocaleTimeString('tr-TR')
  }, { headers: { 'Cache-Control': 'no-store' } });
}