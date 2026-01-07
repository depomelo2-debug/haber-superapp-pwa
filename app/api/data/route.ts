import { NextResponse } from "next/server";

// YEDEK VERİLER (Eğer API limitin dolarsa bunlar görünür)
const FALLBACK_FINANCE = {
  dolar: "34.20",
  euro: "37.15",
  gram: "2980.50",
  ceyrek: "4900.00"
};

const FALLBACK_NEWS = [
  { title: "Haber akışı güncelleniyor...", pubDate: new Date().toISOString(), author: "Sistem", thumbnail: null, link: "#" }
];

export async function GET() {
  let financeData = { ...FALLBACK_FINANCE };
  let newsData = [];

  // ----------------------------------------------------------------
  // 1. MODÜL: FİNANS VERİSİ (Genelpara / Truncgil)
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
    console.error("Finans API Hatası:", e);
  }

  // ----------------------------------------------------------------
  // 2. MODÜL: HABERLER (SENİN NEWSAPI ANAHTARIN İLE)
  // ----------------------------------------------------------------
  try {
    // Senin verdiğin özel API Anahtarı
    const apiKey = "743ace52381a4d0e9e7ac3642c5596c5";
    
    // Türkiye gündemi (tr), Genel kategori
    const newsUrl = `https://newsapi.org/v2/top-headlines?country=tr&category=general&pageSize=10&apiKey=${apiKey}`;
    
    const newsRes = await fetch(newsUrl, { next: { revalidate: 300 } }); // 5 dakikada bir yenile
    
    if (newsRes.ok) {
      const json = await newsRes.json();
      if (json.articles && json.articles.length > 0) {
        newsData = json.articles.map((item: any) => ({
          title: item.title,
          link: item.url,
          pubDate: item.publishedAt,
          author: item.source.name || "Haber",
          // NewsAPI bazen resim vermezse TRT logosu veya boş ikon kullanacağız (Frontend halleder)
          thumbnail: item.urlToImage
        }));
      }
    } else {
      console.error("NewsAPI Hatası:", newsRes.status);
    }
  } catch (e) { 
    console.error("Haber API Bağlantı Hatası:", e); 
  }

  // Eğer NewsAPI kotası dolarsa veya hata verirse TRT RSS'i yedek olarak kullan
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
          const img = item.match(/url="([^"]+)"/)?.[1] || item.match(/src="([^"]+)"/)?.[1] || null;
          return { title, link, pubDate, author: "TRT Haber", thumbnail: img };
        });
      }
    } catch (e) { console.error("Yedek RSS hatası", e); }
  }

  // Eğer her şey patlarsa demo göster
  if (newsData.length === 0) newsData = FALLBACK_NEWS;

  // SONUÇLARI DÖNDÜR
  return NextResponse.json({
    finance: financeData,
    news: newsData,
    lastUpdate: new Date().toLocaleTimeString('tr-TR')
  }, { 
    headers: { 
      'Cache-Control': 'no-store, max-age=0',
      'Access-Control-Allow-Origin': '*' // CORS izni
    } 
  });
}