import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sureId = searchParams.get('sure');

  if (!sureId) {
    return NextResponse.json({ error: "Sure ID gerekli" }, { status: 400 });
  }

  // SENİN VERDİĞİN API ANAHTARI
  const API_KEY = "342|ZZvj3D8VCwj79MFbOKTx5c9sxdcAA627ILqIpw230209821c";
  
  // Diyanet Açık Kaynak API Adresi
  // Not: Dev ortamı olduğu için endpoint yapısı değişebilir, standart yapıyı deniyoruz.
  const baseUrl = `https://acikkaynakkuran-dev.diyanet.gov.tr/api/v1/surah/${sureId}`;

  try {
    const res = await fetch(baseUrl, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0' // Bazı sunucular bunu ister
      },
      cache: 'no-store'
    });

    if (!res.ok) {
      // Eğer Diyanet hata verirse loglayalım
      console.error(`Diyanet API Hatası: ${res.status}`);
      return NextResponse.json({ error: "Diyanet sunucusuna ulaşılamadı" }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error("Proxy Hatası:", error);
    return NextResponse.json({ error: "Veri çekme hatası" }, { status: 500 });
  }
}