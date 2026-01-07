import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sureId = searchParams.get('sure');

  if (!sureId) {
    return NextResponse.json({ error: "Sure ID gerekli" }, { status: 400 });
  }

  // SENİN VERDİĞİN API ANAHTARI
  const API_KEY = "342|ZZvj3D8VCwj79MFbOKTx5c9sxdcAA627ILqIpw230209821c";
  
  // Endpoint'i kontrol edelim. Bazen /v1/surah bazen /v1/quran olabilir.
  // Standart yapıyı kullanıyoruz.
  const baseUrl = `https://acikkaynakkuran-dev.diyanet.gov.tr/api/v1/surah/${sureId}`;

  console.log("Diyanet'e gidiliyor:", baseUrl); // Loglara basar

  try {
    const res = await fetch(baseUrl, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Accept': 'application/json'
      },
      cache: 'no-store'
    });

    if (!res.ok) {
      console.error(`Diyanet Hatası: ${res.status} ${res.statusText}`);
      // Eğer Diyanet 404 veriyorsa, biz de frontend'e bunu söyleyelim
      return NextResponse.json({ error: "Diyanet sunucusu bu sureyi bulamadı veya endpoint hatalı." }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error("Sunucu Hatası:", error);
    return NextResponse.json({ error: "Sunucu bağlantı hatası" }, { status: 500 });
  }
}