"use client";

import { Menu, Home, BookOpen, Sun, Cloud, CloudRain, Snowflake, MapPin, CloudLightning, TrendingUp, DollarSign, Euro, Newspaper, Coins, RefreshCw, CloudFog, CloudDrizzle, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from "@/components/ui/sheet";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

// --- AYARLAR ---
const LOCATIONS: Record<string, { name: string; lat: number; lon: number }> = {
  niksar: { name: "Tokat, Niksar", lat: 40.59, lon: 36.95 },
  burhaniye: { name: "Balıkesir, Burhaniye", lat: 39.50, lon: 26.97 },
  korfez: { name: "Kocaeli, Körfez", lat: 40.75, lon: 29.78 }
};

const WMO_CODES: Record<number, { label: string; icon: any; color: string }> = {
  0: { label: "Açık", icon: Sun, color: "text-yellow-500" },
  1: { label: "Az Bulutlu", icon: Sun, color: "text-yellow-400" },
  2: { label: "Parçalı Bulutlu", icon: Cloud, color: "text-gray-400" },
  3: { label: "Kapalı", icon: Cloud, color: "text-gray-600" },
  45: { label: "Sisli", icon: CloudFog, color: "text-gray-500" },
  51: { label: "Çiseleme", icon: CloudDrizzle, color: "text-blue-300" },
  61: { label: "Yağmurlu", icon: CloudRain, color: "text-blue-500" },
  71: { label: "Kar Yağışlı", icon: Snowflake, color: "text-white" },
  80: { label: "Sağanak", icon: CloudRain, color: "text-blue-600" },
  95: { label: "Fırtına", icon: CloudLightning, color: "text-purple-500" },
};

// --- HASSAS FİYAT KUTUSU ---
const LivePriceCard = ({ label, value, icon: Icon, colorClass }: any) => {
  const [displayValue, setDisplayValue] = useState(value);
  const [trend, setTrend] = useState<"steady" | "up" | "down">("steady");

  useEffect(() => {
    // Değer değişti mi kontrol et
    if (value !== "--" && value !== displayValue) {
      const parse = (v: string) => parseFloat(v.replace(/\./g, '').replace(',', '.'));
      const curr = parse(value);
      const prev = parse(displayValue);

      if (!isNaN(curr) && !isNaN(prev)) {
        if (curr > prev) {
          setTrend("up");
        } else if (curr < prev) {
          setTrend("down");
        }
        
        const timer = setTimeout(() => setTrend("steady"), 1000);
        setDisplayValue(value);
        return () => clearTimeout(timer);
      }
      // İlk açılış
      setDisplayValue(value);
    } else if (value !== "--" && displayValue === "--") {
       setDisplayValue(value);
    }
  }, [value]);

  let containerClass = "bg-white border-gray-100";
  let iconBgClass = colorClass;
  let TrendIcon = null;

  if (trend === "up") {
    containerClass = "bg-green-50 border-green-200 ring-1 ring-green-300 transition-all duration-300";
    iconBgClass = "bg-green-200 text-green-700";
    TrendIcon = <ArrowUp size={14} className="text-green-600 animate-bounce" />;
  } 
  else if (trend === "down") {
    containerClass = "bg-red-50 border-red-200 ring-1 ring-red-300 transition-all duration-300";
    iconBgClass = "bg-red-200 text-red-700";
    TrendIcon = <ArrowDown size={14} className="text-red-600 animate-bounce" />;
  }

  return (
    <div className={`${containerClass} p-3 rounded-xl border shadow-sm flex items-center gap-3 transition-all duration-500`}>
      <div className={`${iconBgClass} p-2 rounded-full shrink-0 transition-colors`}>
        <Icon size={18} />
      </div>
      <div className="overflow-hidden flex-1">
        <div className="flex justify-between items-center h-5">
          <p className="text-[10px] text-gray-500 font-bold uppercase truncate tracking-wider">{label}</p>
          {TrendIcon}
        </div>
        <p className={`text-sm font-bold ${trend === 'up' ? 'text-green-700' : trend === 'down' ? 'text-red-700' : 'text-gray-800'}`}>
          {displayValue}
        </p>
      </div>
    </div>
  );
};

export default function HomePage() {
  const searchParams = useSearchParams();
  const cityParam = searchParams.get('sehir');
  const selectedKey = (cityParam && LOCATIONS[cityParam]) ? cityParam : 'niksar';
  const activeLocation = LOCATIONS[selectedKey];

  // STATE
  const [weather, setWeather] = useState<any>(null);
  const [prayer, setPrayer] = useState<any>(null);
  const [finance, setFinance] = useState({ dolar: "--", euro: "--", gram: "--", ceyrek: "--" });
  const [news, setNews] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);

  // --- İNCE AYARLI CANLILIK SİMÜLASYONU ---
  const simulateLiveMarket = (realData: any) => {
    const randomize = (val: string) => {
      if (!val || val === "--") return val;
      const num = parseFloat(val.replace(/\./g, '').replace(',', '.'));
      
      // DEĞİŞİKLİK BURADA: Yüzde değil, sabit kuruş oynuyoruz.
      // Sadece 0.01 TL ile 0.02 TL arası oynasın.
      const fixedChange = (Math.random() * 0.02); 
      
      // %50 şansla yukarı, %50 şansla aşağı
      const direction = Math.random() > 0.5 ? 1 : -1;
      
      const newVal = num + (fixedChange * direction);
      
      return newVal.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    return {
      dolar: randomize(realData.dolar),
      euro: randomize(realData.euro),
      gram: randomize(realData.gram),
      ceyrek: randomize(realData.ceyrek)
    };
  };

  const fetchAllData = async () => {
    try {
      // 1. Kendi API'miz
      const res = await fetch('/api/data');
      if (res.ok) {
        const data = await res.json();
        // Veriyi simülasyona sokuyoruz (çok minik oynasın diye)
        setFinance(prev => simulateLiveMarket(data.finance));
        if (data.news.length > 0) setNews(data.news);
      }
    } catch (e) { console.error("Veri hatası", e); }

    try {
      // 2. Hava & Namaz
      const wRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${activeLocation.lat}&longitude=${activeLocation.lon}&current=temperature_2m,weather_code&timezone=auto`);
      const wData = await wRes.json();
      setWeather(wData);

      const todayStr = new Date().toLocaleDateString("en-GB", { timeZone: "Europe/Istanbul" }).split('/').join('-');
      const pRes = await fetch(`https://api.aladhan.com/v1/timings/${todayStr}?latitude=${activeLocation.lat}&longitude=${activeLocation.lon}&method=13`);
      const pData = await pRes.json();
      setPrayer(pData);
    } catch (e) { console.error("Konum hatası", e); }
  };

  useEffect(() => {
    setMounted(true);
    fetchAllData();
    // 3 saniyede bir güncelle
    const interval = setInterval(fetchAllData, 3000);
    return () => clearInterval(interval);
  }, [activeLocation]);

  const currentTemp = weather?.current?.temperature_2m || "--";
  const wmoCode = weather?.current?.weather_code as number;
  const weatherInfo = WMO_CODES[wmoCode] || { label: "Bulutlu", icon: Cloud, color: "text-gray-500" };
  const WeatherIcon = weatherInfo.icon;
  const timings = prayer?.data?.timings;

  if (!mounted) return <div className="flex justify-center items-center h-screen animate-pulse">Yükleniyor...</div>;

  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
      
      {/* HEADER */}
      <header className="bg-white border-b p-4 flex justify-between items-center sticky top-0 z-10 shadow-sm">
        <h1 className="text-xl font-bold text-red-600 tracking-tighter">ŞEFO<span className="text-black">60</span></h1>
        <div className="flex items-center gap-2">
           <div className="flex items-center gap-1 bg-green-50 px-2 py-1 rounded-full border border-green-100">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-[10px] text-green-700 font-bold">CANLI</span>
           </div>
           <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon"><Menu className="h-6 w-6 text-gray-700" /></Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px]">
              <SheetHeader><SheetTitle>Şehir Seç</SheetTitle></SheetHeader>
              <div className="flex flex-col gap-3 mt-6">
                {Object.keys(LOCATIONS).map((key) => (
                  <Link key={key} href={`/?sehir=${key}`} 
                    className={`flex items-center gap-2 p-3 rounded-lg transition-colors ${selectedKey === key ? 'bg-red-50 text-red-600 font-medium' : 'hover:bg-gray-100'}`}>
                    <MapPin size={18} /> {LOCATIONS[key].name}
                  </Link>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* İÇERİK */}
      <main className="flex-1 overflow-y-auto p-4 pb-24 space-y-4">
        
        {/* HAVA & NAMAZ */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white p-5 rounded-2xl shadow-lg relative overflow-hidden">
          <div className="flex justify-between items-start z-10 relative">
            <div>
              <div className="flex items-center gap-1 opacity-90 text-sm mb-1"><MapPin size={14}/> {activeLocation.name}</div>
              <h2 className="text-4xl font-bold">{currentTemp}°</h2>
              <p className="text-sm font-medium mt-1">{weatherInfo.label}</p>
            </div>
            <div className="text-right">
              <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                <p className="text-[10px] uppercase tracking-wide opacity-80">Akşam</p>
                <p className="text-xl font-bold">{timings?.Maghrib || "--:--"}</p>
              </div>
              <p className="text-xs mt-2 opacity-80">Yatsı: {timings?.Isha}</p>
            </div>
          </div>
          <div className={`absolute -bottom-2 -right-2 opacity-20 scale-150 transform rotate-12 ${weatherInfo.color}`}>
            <WeatherIcon className="h-24 w-24" />
          </div>
        </div>

        {/* PİYASA (YEŞİL/KIRMIZI YANIP SÖNEN) */}
        <div className="grid grid-cols-2 gap-3">
          <LivePriceCard label="Dolar" value={finance.dolar} icon={DollarSign} colorClass="bg-green-100 text-green-600" />
          <LivePriceCard label="Euro" value={finance.euro} icon={Euro} colorClass="bg-blue-100 text-blue-600" />
          <LivePriceCard label="Gram Altın" value={finance.gram} icon={Coins} colorClass="bg-yellow-100 text-yellow-600" />
          <LivePriceCard label="Çeyrek" value={finance.ceyrek} icon={Coins} colorClass="bg-orange-100 text-orange-600" />
        </div>

        {/* HABERLER */}
        <div className="flex justify-between items-end mt-4">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <Newspaper size={18} className="text-red-600"/> Gündemden
            </h3>
            <span className="text-[10px] text-gray-400 flex items-center gap-1">
               <RefreshCw size={10} className="animate-spin"/> Güncelleniyor
            </span>
        </div>
        
        <div className="space-y-3 mt-2">
            {news.length > 0 ? news.map((item, index) => (
                <Link key={index} href={item.link || '#'} target="_blank" className="block">
                  <div className="bg-white p-3 rounded-xl border shadow-sm flex gap-3 active:bg-gray-50 transition-colors">
                     {item.thumbnail ? (
                        <img src={item.thumbnail} className="w-16 h-16 rounded-lg object-cover bg-gray-100 shrink-0" alt="Haber" />
                     ) : (
                        <div className="w-16 h-16 bg-red-50 rounded-lg flex-shrink-0 flex items-center justify-center text-red-500">
                            <Newspaper size={24}/>
                        </div>
                     )}
                    <div className="flex flex-col justify-between py-1 flex-1">
                      <h4 className="font-semibold text-sm line-clamp-2 leading-snug text-gray-900">
                        {item.title}
                      </h4>
                      <div className="flex justify-between items-center mt-1">
                          <span className="text-[10px] text-gray-400 font-medium">
                             {item.pubDate ? new Date(item.pubDate).toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'}) : ""}
                          </span>
                          <span className="text-[9px] bg-gray-100 text-gray-500 px-1 rounded truncate max-w-[80px]">
                             {item.author || "Haber"}
                          </span>
                      </div>
                    </div>
                  </div>
                </Link>
            )) : (
              <div className="text-center py-8 text-gray-400 text-sm">Haber akışı yükleniyor...</div>
            )}
        </div>
      </main>

      {/* FOOTER */}
      <nav className="bg-white border-t fixed bottom-0 w-full flex justify-around p-2 z-20 pb-6 shadow-2xl">
        <div className="flex flex-col items-center gap-1 p-2 text-red-600">
          <Home size={22} /><span className="text-[10px] font-medium">Anasayfa</span>
        </div>
        <div className="flex flex-col items-center gap-1 p-2 text-gray-400">
          <TrendingUp size={22} /><span className="text-[10px] font-medium">Piyasa</span>
        </div>
        <div className="flex flex-col items-center gap-1 p-2 text-gray-400">
          <BookOpen size={22} /><span className="text-[10px] font-medium">Dini</span>
        </div>
      </nav>
    </div>
  );
}