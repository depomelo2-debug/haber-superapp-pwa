"use client";

import { useState, useEffect } from "react";
import { 
  Moon, Sun, Book, Heart, Clock, BookOpen, Fingerprint, RefreshCcw, RefreshCw, ArrowLeft, ChevronLeft
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// --- SABİT VERİLER (ESMALAR VE DUALAR AYNI KALIYOR) ---
const ESMALAR = [
  { ad: "Allah", anlam: "Eşi benzeri olmayan, bütün noksan sıfatlardan münezzeh tek ilah." },
  { ad: "Er-Rahman", anlam: "Dünyada bütün mahlükata merhamet eden." },
  { ad: "Er-Rahim", anlam: "Ahirette, müminlere sonsuz merhamet edecek olan." },
  { ad: "El-Melik", anlam: "Mülkün sahibi." },
  { ad: "El-Kuddüs", anlam: "Her türlü eksiklikten uzak." },
  { ad: "El-Selam", anlam: "Esenlik veren." },
  { ad: "El-Mü'min", anlam: "Güven veren." },
  { ad: "El-Müheymin", anlam: "Gözetip koruyan." },
  { ad: "El-Aziz", anlam: "İzzet sahibi." },
  { ad: "El-Cebbar", anlam: "Kudret sahibi." },
  // ... (Liste uzatılabilir)
];

const DUALAR = [
  { 
    kategori: "Namaz Duaları",
    baslik: "Sübhaneke", 
    arapca: "سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ...", 
    okunus: "Sübhaneke Allahümme ve bihamdik...", 
    meal: "Allah'ım! Sen eksik sıfatlardan pak ve uzaksın..." 
  },
  // ... (Diğer dualar buraya gelecek)
];

export default function DiniPage() {
  const [activeTab, setActiveTab] = useState<"vakit" | "kuran" | "zikir" | "dua">("vakit");
  const [loading, setLoading] = useState(true);
  
  // VERİLER
  const [prayerTimes, setPrayerTimes] = useState<any>(null);
  const [imsakiye, setImsakiye] = useState<any[]>([]);
  const [surahs, setSurahs] = useState<any[]>([]);
  
  // OKUMA MODU
  const [selectedSurah, setSelectedSurah] = useState<any>(null);
  const [surahContent, setSurahContent] = useState<any[]>([]); // Diyanet verisi buraya gelecek
  const [readingLoading, setReadingLoading] = useState(false);
  const [zikirCount, setZikirCount] = useState(0);

  // KONUM
  const lat = 40.59;
  const lon = 36.95;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // İmsakiye (Aladhan - Takvim için en iyisi bu)
        const date = new Date();
        const prayerRes = await fetch(`https://api.aladhan.com/v1/calendar/${date.getFullYear()}/${date.getMonth() + 1}?latitude=${lat}&longitude=${lon}&method=13`);
        const prayerData = await prayerRes.json();
        const todayStr = date.getDate().toString().padStart(2, '0');
        const todayData = prayerData.data.find((d: any) => d.date.gregorian.day === todayStr);

        setPrayerTimes(todayData);
        setImsakiye(prayerData.data);

        // Sure Listesi (Al Quran Cloud - Sadece liste için kullanıyoruz, hızlıdır)
        const quranRes = await fetch("https://api.alquran.cloud/v1/surah");
        const quranData = await quranRes.json();
        setSurahs(quranData.data);

      } catch (error) { console.error("Hata:", error); } 
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  // --- DİYANET API'SİNDEN SURE ÇEKME ---
  const openSurah = async (sure: any) => {
    setReadingLoading(true);
    setSelectedSurah(sure);
    setSurahContent([]); // Önceki içeriği temizle

    try {
      // BİZİM KURDUĞUMUZ TÜNEL (PROXY) ÜZERİNDEN İSTEK ATIYORUZ
      const res = await fetch(`/api/diyanet?sure=${sure.number}`);
      
      if (!res.ok) throw new Error("Diyanet verisi alınamadı");
      
      const data = await res.json();
      console.log("Diyanet API Yanıtı:", data); // Konsola basar, yapıya bakabilirsin

      // NOT: Diyanet API'nin veri yapısı 'data' veya 'data.verses' içinde olabilir.
      // Gelen veriyi güvenli şekilde işlemeye çalışıyoruz.
      let verses = [];
      if (data.data && Array.isArray(data.data.verses)) {
        verses = data.data.verses;
      } else if (data.data && Array.isArray(data.data.ayahs)) {
        verses = data.data.ayahs;
      } else if (Array.isArray(data.verses)) {
        verses = data.verses;
      } else {
        // Eğer Diyanet yapısı farklıysa, konsolda hatayı görmek için boş dizi dönüyoruz
        console.warn("Diyanet veri yapısı beklenenden farklı:", data);
      }

      // Veriyi formatla
      const cleanContent = verses.map((v: any) => ({
        number: v.verse_number || v.numberInSurah || v.id, // Ayet no
        arabicText: v.text_original || v.text || v.content, // Arapça
        // Diyanet genelde 'transcription' veya 'latin' alanında okunuşu verir.
        // Eğer API'de bu alan yoksa boş gelir, biz uydurmayız.
        readingText: v.transcription || v.transliteration || v.latin || "", 
        turkishText: v.translation?.text || v.translation || v.meal || "Meal yükleniyor..." // Meal
      }));

      setSurahContent(cleanContent);

    } catch (e) {
      console.error("Diyanet çekme hatası:", e);
      alert("Diyanet sunucusuna şu an ulaşılamıyor. Lütfen daha sonra tekrar deneyin.");
    } finally {
      setReadingLoading(false);
    }
  };

  const closeSurah = () => {
    setSelectedSurah(null);
    setSurahContent([]);
  };

  return (
    <div className="flex flex-col h-screen bg-emerald-50 overflow-hidden">
      
      {/* HEADER */}
      <header className="bg-emerald-600 text-white p-4 flex items-center justify-between shadow-lg sticky top-0 z-20">
        <div className="flex items-center gap-3">
          {selectedSurah ? (
             <Button variant="ghost" size="icon" onClick={closeSurah} className="text-white hover:bg-emerald-700"><ArrowLeft /></Button>
          ) : (
            <Link href="/"><Button variant="ghost" size="icon" className="text-white hover:bg-emerald-700"><ChevronLeft /></Button></Link>
          )}
          <div>
            <h1 className="text-xl font-bold tracking-tight">{selectedSurah ? selectedSurah.name : "İslami Hayat"}</h1>
            <p className="text-xs text-emerald-100 flex items-center gap-1">
               {selectedSurah ? "Diyanet Kaynaklı" : "Tokat, Niksar"}
               {selectedSurah && <RefreshCw size={10} className={readingLoading ? "animate-spin" : ""} />}
            </p>
          </div>
        </div>
      </header>

      {/* MENÜ */}
      {!selectedSurah && (
        <div className="bg-white p-2 flex justify-around shadow-sm border-b overflow-x-auto shrink-0">
          {[
            { id: "vakit", label: "Vakitler", icon: Clock },
            { id: "kuran", label: "Kuran", icon: BookOpen },
            { id: "zikir", label: "Zikirmatik", icon: Fingerprint },
            { id: "dua", label: "Dualar", icon: Heart },
          ].map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex flex-col items-center gap-1 p-2 min-w-[70px] rounded-lg transition-all ${activeTab === tab.id ? "bg-emerald-100 text-emerald-700 font-bold scale-105" : "text-gray-400 hover:bg-gray-50"}`}>
              <tab.icon size={20} /><span className="text-[10px]">{tab.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* İÇERİK */}
      <main className="flex-1 overflow-y-auto p-4 pb-20 scroll-smooth">
        
        {loading ? (
          <div className="flex justify-center items-center h-full text-emerald-600"><RefreshCcw className="animate-spin mr-2"/> Sistem Yükleniyor...</div>
        ) : (
          <>
            {/* --- VAKİTLER --- */}
            {activeTab === "vakit" && prayerTimes && !selectedSurah && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-gradient-to-br from-emerald-600 to-teal-500 rounded-2xl p-6 text-white text-center shadow-xl relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-4 opacity-10"><Moon size={100} /></div>
                   <p className="text-sm opacity-90 mb-1">{prayerTimes.date.gregorian.date} • {prayerTimes.date.hijri.date}</p>
                   <h2 className="text-6xl font-bold my-4">{prayerTimes.timings.Maghrib}</h2>
                   <p className="text-lg font-medium bg-white/20 inline-block px-4 py-1 rounded-full">İftara Kalan Süre</p>
                   <div className="mt-4 flex justify-center gap-4 text-xs opacity-80">
                      <span>İmsak: {prayerTimes.timings.Fajr}</span>
                      <span>Yatsı: {prayerTimes.timings.Isha}</span>
                   </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-emerald-50 text-emerald-800"><tr><th className="p-3">Gün</th><th className="p-3">İmsak</th><th className="p-3">Akşam</th></tr></thead>
                    <tbody>
                      {imsakiye.slice(0, 7).map((gun: any, i) => (
                         <tr key={i} className={`border-t ${gun.date.gregorian.day === prayerTimes.date.gregorian.day ? 'bg-emerald-50 border-emerald-200 font-bold' : 'even:bg-gray-50'}`}>
                           <td className="p-3">{gun.date.gregorian.day} {gun.date.gregorian.month.en}</td>
                           <td className="p-3">{gun.timings.Fajr}</td>
                           <td className="p-3 text-emerald-600">{gun.timings.Maghrib}</td>
                         </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* --- KURAN LİSTESİ --- */}
            {activeTab === "kuran" && !selectedSurah && (
               <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="bg-emerald-100 p-3 rounded-lg text-emerald-800 text-xs border border-emerald-200">
                     <strong>Bilgi:</strong> Sureler Diyanet İşleri Başkanlığı sunucularından anlık olarak çekilmektedir.
                  </div>
                  {surahs.map((sure: any) => (
                    <div key={sure.number} onClick={() => openSurah(sure)} className="bg-white p-4 rounded-xl shadow-sm border flex items-center justify-between hover:bg-emerald-50 hover:border-emerald-300 transition-all cursor-pointer active:scale-95">
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-bold text-sm">{sure.number}</div>
                          <div><h4 className="font-bold text-gray-800">{sure.englishName}</h4><p className="text-xs text-gray-500">{sure.englishNameTranslation} • {sure.numberOfAyahs} Ayet</p></div>
                       </div>
                       <span className="text-xl font-serif text-emerald-800">{sure.name}</span>
                    </div>
                  ))}
               </div>
            )}

            {/* --- KURAN OKUMA (DİYANET VERİSİ) --- */}
            {selectedSurah && (
               <div className="animate-in slide-in-from-right duration-300">
                  {readingLoading ? (
                     <div className="flex flex-col items-center justify-center py-20 text-emerald-600 gap-2"><RefreshCw className="animate-spin" size={32} /><p>Diyanet'ten Veri Çekiliyor...</p></div>
                  ) : surahContent.length === 0 ? (
                     <div className="p-10 text-center text-gray-500">
                        <p>Veri görüntülenemedi.</p>
                        <p className="text-xs mt-2">Diyanet API yanıt vermiyor veya anahtar süresi dolmuş olabilir.</p>
                     </div>
                  ) : (
                     <div className="space-y-6">
                        <div className="bg-emerald-50 p-6 rounded-2xl text-center border border-emerald-100"><p className="text-3xl font-serif text-emerald-900">بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّح۪يمِ</p></div>
                        {surahContent.map((ayet: any) => (
                           <div key={ayet.number} className="bg-white p-5 rounded-xl border shadow-sm space-y-4">
                              <div className="flex justify-between items-start gap-4">
                                 <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center text-xs font-bold shrink-0">{ayet.number}</div>
                                 <p className="text-2xl font-serif text-right text-gray-900 leading-loose" dir="rtl">{ayet.arabicText}</p>
                              </div>
                              
                              {/* OKUNUŞ: Eğer Diyanet gönderdiyse gösteririz, yoksa boş kalır */}
                              {ayet.readingText && (
                                <div className="p-3 bg-emerald-50 rounded-lg"><p className="text-sm font-semibold text-emerald-800 italic">{ayet.readingText}</p></div>
                              )}

                              <div className="pt-2 border-t border-gray-100"><p className="text-gray-700 leading-relaxed font-medium">{ayet.turkishText}</p></div>
                           </div>
                        ))}
                        <div className="h-10"></div>
                     </div>
                  )}
               </div>
            )}

            {/* --- ZİKİRMATİK --- */}
            {activeTab === "zikir" && !selectedSurah && (
              <div className="flex flex-col items-center justify-center h-[70vh] animate-in zoom-in duration-500">
                 <div className="relative">
                   <div className="w-64 h-64 rounded-full bg-gradient-to-b from-emerald-500 to-emerald-700 shadow-2xl flex items-center justify-center border-8 border-emerald-200">
                      <div className="text-center text-white"><span className="block text-xs uppercase opacity-70 mb-2">Toplam</span><span className="text-7xl font-mono font-bold tracking-tighter">{zikirCount}</span></div>
                   </div>
                   <button onClick={() => setZikirCount(prev => prev + 1)} className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 w-24 h-24 bg-white rounded-full border-4 border-emerald-500 shadow-xl flex items-center justify-center active:scale-90 transition-transform hover:bg-gray-50"><span className="text-emerald-700 font-bold text-xl select-none">+1</span></button>
                 </div>
                 <Button variant="outline" onClick={() => setZikirCount(0)} className="mt-20 border-red-200 text-red-500 hover:bg-red-50">Sıfırla</Button>
              </div>
            )}

            {/* --- DUALAR --- */}
            {activeTab === "dua" && !selectedSurah && (
               <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div>
                    <h3 className="font-bold text-emerald-800 mb-3 flex items-center gap-2"><Sun size={18}/> Esmaül Hüsna</h3>
                    <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1 custom-scrollbar">
                       {ESMALAR.map((esma, i) => (
                         <div key={i} className="bg-white p-3 rounded-xl border shadow-sm border-l-4 border-l-emerald-500">
                            <h4 className="font-bold text-lg text-emerald-700">{esma.ad}</h4>
                            <p className="text-xs text-gray-600 leading-snug mt-1">{esma.anlam}</p>
                         </div>
                       ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-emerald-800 mb-3 flex items-center gap-2"><Book size={18}/> Dualar</h3>
                    <div className="space-y-4">
                       {DUALAR.map((dua, i) => (
                         <div key={i} className="bg-white p-4 rounded-xl border shadow-sm hover:border-emerald-300 transition-colors">
                            <h4 className="font-bold text-gray-800 mb-2 border-b pb-2">{dua.baslik}</h4>
                            <p className="text-right text-xl font-serif text-emerald-800 mb-3 leading-loose" dir="rtl">{dua.arapca}</p>
                            <div className="bg-emerald-50 p-2 rounded mb-2"><p className="text-xs font-semibold text-emerald-900 italic">Okunuş: "{dua.okunus}"</p></div>
                            <p className="text-sm text-gray-600">"{dua.meal}"</p>
                         </div>
                       ))}
                    </div>
                  </div>
               </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}