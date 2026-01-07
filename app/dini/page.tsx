"use client";

import { useState, useEffect } from "react";
import { 
  Moon, Sun, Book, Heart, Clock, BookOpen, Fingerprint, RefreshCcw, RefreshCw, ArrowLeft, ChevronLeft
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// --- DİYANET USULÜ OKUNUŞ FİLTRESİ ---
// Gelen uluslararası okunuşu (Alhamdu) alıp Diyanet usulüne (Elhamdü) çevirir.
const diyanetOkunusYap = (text: string) => {
  if (!text) return "";
  return text
    // Uzatmalar
    .replace(/aa/g, 'â').replace(/ii/g, 'î').replace(/uu/g, 'û')
    // Harf Dönüşümleri
    .replace(/sh/g, 'ş').replace(/Sh/g, 'Ş')
    .replace(/gh/g, 'ğ').replace(/Gh/g, 'Ğ')
    .replace(/kh/g, 'h').replace(/Kh/g, 'H') // Hırıltılı H -> H
    .replace(/dh/g, 'z').replace(/Dh/g, 'Z') // Peltek Z -> Z (Genel kabul)
    .replace(/th/g, 's').replace(/Th/g, 'S') // Peltek S -> S
    .replace(/j/g, 'c').replace(/J/g, 'C')
    .replace(/ch/g, 'ç').replace(/Ch/g, 'Ç')
    // Başlangıç El takıları (Al- -> El-)
    .replace(/\bAl-/g, 'El-').replace(/\bAl /g, 'El ')
    // Diyanet stili ince ayarlar
    .replace(/Rabbil/g, "Rabbi'l").replace(/rabbil/g, "rabbi'l")
    .replace(/Rahmanir/g, "Rahmâni'r").replace(/Rahim/g, "Rahîm")
    .replace(/dheen/g, 'dîn').replace(/deen/g, 'dîn')
    .replace(/'/g, '’'); // Kesme işareti düzeltmesi
};

// --- 1. ESMAÜL HÜSNA (99 İSİM - TAM LİSTE) ---
const ESMALAR = [
  { ad: "Allah", anlam: "Eşi benzeri olmayan, bütün noksan sıfatlardan münezzeh tek ilah." },
  { ad: "Er-Rahman", anlam: "Dünyada bütün mahlükata merhamet eden, şefkat gösteren." },
  { ad: "Er-Rahim", anlam: "Ahirette, sadece müminlere sonsuz merhamet edecek olan." },
  { ad: "El-Melik", anlam: "Mülkün, kainatın sahibi, mülk ve saltanatı devamlı olan." },
  { ad: "El-Kuddüs", anlam: "Her noksanlıktan uzak ve her türlü takdise layık olan." },
  { ad: "El-Selam", anlam: "Her türlü tehlikelerden selamete erdiren." },
  { ad: "El-Mü'min", anlam: "Güven veren, emin kılan, koruyan." },
  { ad: "El-Müheymin", anlam: "Her şeyi görüp gözeten." },
  { ad: "El-Aziz", anlam: "İzzet sahibi, her şeye galip olan." },
  { ad: "El-Cebbar", anlam: "Azamet ve kudret sahibi. Dilediğini yapan ve yaptıran." },
  { ad: "El-Mütekebbir", anlam: "Büyüklükte eşi, benzeri olmayan." },
  { ad: "El-Halık", anlam: "Yaratan, yoktan var eden." },
  { ad: "El-Bari", anlam: "Her şeyi kusursuz ve uyumlu yaratan." },
  { ad: "El-Musavvir", anlam: "Varlıklara şekil veren." },
  { ad: "El-Gaffar", anlam: "Günahları örten ve çok mağfiret eden." },
  { ad: "El-Kahhar", anlam: "Her şeye, her istediğini yapacak surette galip ve hakim olan." },
  { ad: "El-Vehhab", anlam: "Karşılıksız hibeler veren, çok fazla ihsan eden." },
  { ad: "Er-Rezzak", anlam: "Bütün mahlukatın rızkını veren ve ihtiyacını karşılayan." },
  { ad: "El-Fettah", anlam: "Her türlü müşkülleri açan ve kolaylaştıran." },
  { ad: "El-Alim", anlam: "Her şeyi en ince noktasına kadar bilen." },
  { ad: "El-Kabid", anlam: "Dilediğine darlık veren, sıkan, daraltan." },
  { ad: "El-Basit", anlam: "Dilediğine bolluk veren, açan, genişleten." },
  { ad: "El-Hafid", anlam: "Dereceleri alçaltan." },
  { ad: "Er-Rafi", anlam: "Şeref verip yükselten." },
  { ad: "El-Muizz", anlam: "Dilediğini aziz eden, izzet veren." },
  { ad: "El-Muzil", anlam: "Dilediğini zillete düşüren." },
  { ad: "Es-Semi", anlam: "Her şeyi en iyi işiten." },
  { ad: "El-Basir", anlam: "Her şeyi en iyi gören." },
  { ad: "El-Hakem", anlam: "Mutlak hakim, hakkı batıldan ayıran." },
  { ad: "El-Adl", anlam: "Mutlak adil, çok adaletli." },
  { ad: "El-Latif", anlam: "Lütuf ve ihsan sahibi olan." },
  { ad: "El-Habir", anlam: "Olmuş olacak her şeyden haberdar." },
  { ad: "El-Halim", anlam: "Acele etmeyen, yumuşak davranan." },
  { ad: "El-Azim", anlam: "Büyüklükte benzeri yok, pek yüce." },
  { ad: "El-Gafur", anlam: "Affı, mağfireti bol." },
  { ad: "Eş-Şekur", anlam: "Az amele, çok sevap veren." },
  { ad: "El-Aliyy", anlam: "Yüceler yücesi, çok yüce." },
  { ad: "El-Kebir", anlam: "Büyüklükte benzeri yok, pek büyük." },
  { ad: "El-Hafiz", anlam: "Her şeyi koruyucu olan." },
  { ad: "El-Mukit", anlam: "Her yaratılmışın rızkını, gıdasını veren, tayin eden." },
  { ad: "El-Hasib", anlam: "Kulların hesabını en iyi gören." },
  { ad: "El-Celil", anlam: "Celal ve azamet sahibi." },
  { ad: "El-Kerim", anlam: "Keremi, lütfu bol olan." },
  { ad: "Er-Rakib", anlam: "Her varlığı, her işi her an görüp, gözeten, kontrolü altında tutan." },
  { ad: "El-Mucib", anlam: "Duaları, istekleri kabul eden." },
  { ad: "El-Vasi", anlam: "Rahmet, kudret ve ilmi ile her şeyi ihata eden." },
  { ad: "El-Hakim", anlam: "Her işi hikmetli, her şeyi hikmetle yaratan." },
  { ad: "El-Vedud", anlam: "Kullarını en çok seven, sevilmeye en layık olan." },
  { ad: "El-Mecid", anlam: "Her türlü övgüye layık bulunan." },
  { ad: "El-Bais", anlam: "Ölüleri dirilten." },
  { ad: "Eş-Şehid", anlam: "Her zaman her yerde hazır ve nazır olan." },
  { ad: "El-Hakk", anlam: "Varlığı hiç değişmeden duran. Var olan, hakkı ortaya çıkaran." },
  { ad: "El-Vekil", anlam: "Kendisine tevekkül edenlerin işlerini en iyi neticeye ulaştıran." },
  { ad: "El-Kaviyy", anlam: "Kudreti en üstün ve hiç azalmaz." },
  { ad: "El-Matin", anlam: "Kuvvet ve kudret kaynağı, pek güçlü." },
  { ad: "El-Veliyy", anlam: "İnananların dostu, onları sevip yardım eden." },
  { ad: "El-Hamid", anlam: "Her türlü hamd ve senaya layık olan." },
  { ad: "El-Muhsi", anlam: "Yarattığı ve yaratacağı bütün varlıkların sayısını bilen." },
  { ad: "El-Mubdi", anlam: "Maddesiz, örneksiz yaratan." },
  { ad: "El-Muid", anlam: "Yarattıklarını yok edip, sonra tekrar diriltecek olan." },
  { ad: "El-Muhyi", anlam: "İhya eden, dirilten, can veren." },
  { ad: "El-Mumit", anlam: "Her canlıya ölümü tattıran." },
  { ad: "El-Hayy", anlam: "Ezeli ve ebedi hayat ile diri olan." },
  { ad: "El-Kayyum", anlam: "Varlıkları diri tutan, zatı ile kaim olan." },
  { ad: "El-Vacid", anlam: "Kendisinden hiçbir şey gizli kalmayan, dilediğini dilediği vakit bulan." },
  { ad: "El-Macid", anlam: "Kadri ve şanı büyük, keremi, ihsanı bol olan." },
  { ad: "El-Vahid", anlam: "Zat, sıfat ve fiillerinde benzeri ve ortağı olmayan, tek olan." },
  { ad: "Es-Samed", anlam: "Hiçbir şeye ihtiyacı olmayan, herkesin muhtaç olduğu." },
  { ad: "El-Kadir", anlam: "Dilediğini dilediği gibi yaratmaya muktedir olan." },
  { ad: "El-Muktedir", anlam: "Dilediği gibi tasarruf eden, her şeyi kolayca yaratan kudret sahibi." },
  { ad: "El-Mukaddim", anlam: "Dilediğini, öne alan, yükselten." },
  { ad: "El-Muahhir", anlam: "Dilediğini sona alan, erteleyen, alçaltan." },
  { ad: "El-Evvel", anlam: "Ezeli olan, varlığının başlangıcı olmayan." },
  { ad: "El-Ahir", anlam: "Ebedi olan, varlığının sonu olmayan." },
  { ad: "El-Zahir", anlam: "Varlığı açık, aşikar olan, kesin delillerle bilinen." },
  { ad: "El-Batın", anlam: "Akıl ve duyularla hakkıyla bilinemeyen." },
  { ad: "El-Vali", anlam: "Bütün kâinatı idare eden." },
  { ad: "El-Müteali", anlam: "Son derece yüce olan." },
  { ad: "El-Berr", anlam: "İyilik ve ihsanı bol, iyilik ve güzellik kaynağı." },
  { ad: "Et-Tevvab", anlam: "Tövbeleri kabul edip, günahları bağışlayan." },
  { ad: "El-Müntekim", anlam: "Zalimlerin cezasını veren, intikam alan." },
  { ad: "El-Afüvv", anlam: "Affı çok olan, günahları affetmeyi seven." },
  { ad: "Er-Rauf", anlam: "Çok merhametli, pek şefkatli." },
  { ad: "Malik-ül Mülk", anlam: "Mülkün, her varlığın sahibi." },
  { ad: "Zül-Celali vel İkram", anlam: "Celal, azamet ve pek büyük ikram sahibi." },
  { ad: "El-Muksit", anlam: "Her işi birbirine uygun yapan." },
  { ad: "El-Cami", anlam: "Mahşerde her mahlükatı bir araya toplayan." },
  { ad: "El-Ganiyy", anlam: "Her türlü zenginlik sahibi, ihtiyacı olmayan." },
  { ad: "El-Mugni", anlam: "Müstağni kılan, ihtiyaç gideren, zengin eden." },
  { ad: "El-Mani", anlam: "Dilemediği şeye mani olan, engelleyen." },
  { ad: "Ed-Darr", anlam: "Elem, zarar verenleri yaratan." },
  { ad: "En-Nafi", anlam: "Fayda veren şeyleri yaratan." },
  { ad: "En-Nur", anlam: "Alemleri nurlandıran, dilediğine nur veren." },
  { ad: "El-Hadi", anlam: "Hidayet veren." },
  { ad: "El-Bedi", anlam: "Eşi ve benzeri olmayan güzellikler yaratan." },
  { ad: "El-Baki", anlam: "Varlığının sonu olmayan, ebedi olan." },
  { ad: "El-Varis", anlam: "Her şeyin asıl sahibi olan." },
  { ad: "Er-Reşid", anlam: "İrşada muhtaç olmayan, doğru yolu gösteren." },
  { ad: "Es-Sabur", anlam: "Ceza vermede acele etmeyen." }
];

// --- 2. DUALAR VE SURELER (TAM METİN & ZENGİN ARŞİV) ---
const DUALAR = [
  // --- NAMAZ DUALARI ---
  { 
    kategori: "Namaz Duaları",
    baslik: "Sübhaneke", 
    arapca: "سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ وَتَبَارَكَ اسْمُكَ وَتَعَالَى جَدُّكَ وَلاَ إِلَهَ غَيْرُكَ", 
    okunus: "Sübhaneke Allahümme ve bihamdik. Ve tebârekesmük. Ve teâlâ ceddük. (Ve celle senâük)* Ve lâ ilâhe ğayrük.", 
    not: "*Parantez içi cenaze namazında okunur.",
    meal: "Allah'ım! Sen eksik sıfatlardan pak ve uzaksın. Seni daima böyle tenzih eder ve överim. Senin adın mübarektir. Varlığın her şeyden üstündür. Senden başka ilah yoktur." 
  },
  { 
    kategori: "Namaz Duaları",
    baslik: "Ettehiyyâtü", 
    arapca: "التَّحِيَّاتُ لِلَّهِ وَالصَّلَوَاتُ وَالطَّيِّبَاتُ السَّلَامُ عَلَيْكَ أَيُّهَا النَّبِيُّ وَرَحْمَةُ اللَّهِ وَبَرَكَاتُهُ السَّلَامُ عَلَيْنَا وَعَلَى عِبَادِ اللَّهِ الصَّالِحِينَ أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللَّهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ", 
    okunus: "Ettehiyyâtü lillâhi vessalevâtü vettayibât. Esselâmü aleyke eyyühen-Nebiyyü ve rahmetullâhi ve berakâtüh. Esselâmü aleynâ ve alâ ibâdillâhis-sâlihîn. Eşhedü en lâ ilâhe illallâh ve eşhedü enne Muhammeden abdühû ve Resûlüh.", 
    meal: "Dil, beden ve mal ile yapılan bütün ibadetler Allah'adır. Ey Peygamber! Allah'ın selamı, rahmet ve bereketleri senin üzerine olsun. Selam bizim üzerimize ve Allah'ın salih kulları üzerine olsun. Şahitlik ederim ki Allah'tan başka ilah yoktur. Yine şahitlik ederim ki Muhammed, O'nun kulu ve elçisidir." 
  },
  {
    kategori: "Namaz Duaları",
    baslik: "Rabbena Atina",
    arapca: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ",
    okunus: "Rabbenâ âtinâ fi'd-dünyâ haseneten ve fi'l-âhireti haseneten ve kınâ azâbe'n-nâr.",
    meal: "Rabbimiz! Bize dünyada da iyilik ver, ahirette de iyilik ver ve bizi ateş azabından koru."
  },
  {
    kategori: "Namaz Duaları",
    baslik: "Allahümme Salli",
    arapca: "اللّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ كَمَا صَلَّيْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ إِنَّكَ حَمِيدٌ مَجِيدٌ",
    okunus: "Allâhümme salli alâ Muhammedin ve alâ âli Muhammed. Kemâ salleyte alâ İbrâhîme ve alâ âli İbrâhîm. İnneke hamîdün mecîd.",
    meal: "Allah'ım! Muhammed'e ve Muhammed'in ümmetine rahmet eyle; İbrahim'e ve İbrahim'in ümmetine rahmet ettiğin gibi. Şüphesiz övülmeye layık yalnız sensin, şan ve şeref sahibi de sensin."
  },
  {
    kategori: "Namaz Duaları",
    baslik: "Allahümme Barik",
    arapca: "اللّهُمَّ بَارِكْ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ كَمَا بَارَكْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ إِنَّكَ حَمِيدٌ مَجِيدٌ",
    okunus: "Allâhümme bârik alâ Muhammedin ve alâ âli Muhammed. Kemâ bârekte alâ İbrâhîme ve alâ âli İbrâhîm. İnneke hamîdün mecîd.",
    meal: "Allah'ım! Muhammed'e ve Muhammed'in ümmetine hayır ve bereket ver; İbrahim'e ve İbrahim'in ümmetine verdiğin gibi. Şüphesiz övülmeye layık yalnız sensin, şan ve şeref sahibi de sensin."
  },

  // --- MADDİ & MANEVİ DUALAR ---
  {
    kategori: "Borç ve Sıkıntı",
    baslik: "Borçtan Kurtulma Duası",
    arapca: "اللَّهُمَّ اكْفِنِي بِحَلَالِكَ عَنْ حَرَامِكَ وَأَغْنِنِي بِفَضْلِكَ عَمَّنْ سِوَاكَ",
    okunus: "Allâhummekfinî bi-helâlike an harâmike ve ağninî bi-fadlike ammen sivâk.",
    meal: "Allah'ım! Bana helâl rızık nasip ederek haramlardan koru! Lütfunla beni Senden başkasına muhtaç etme!"
  },
  {
    kategori: "Borç ve Sıkıntı",
    baslik: "Sıkıntı Anında (Hz. Yunus)",
    arapca: "لَا إِلَهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ",
    okunus: "Lâ ilâhe illâ ente subhâneke innî küntü minez-zâlimîn.",
    meal: "Senden başka ilah yoktur. Seni tenzih ederim. Muhakkak ki ben zalimlerden oldum."
  },
  {
    kategori: "Borç ve Sıkıntı",
    baslik: "Sabır Duası",
    arapca: "رَبَّنَا أَفْرِغْ عَلَيْنَا صَبْرًا وَثَبِّتْ أَقْدَامَنَا وَانصُرْنَا عَلَى الْقَوْمِ الْكَافِرِينَ",
    okunus: "Rabbenâ efriğ aleynâ sabran ve sebbit ekdâmenâ vensurnâ alel-kavmil-kâfirîn.",
    meal: "Ey Rabbimiz! Üzerimize sabır yağdır, ayaklarımızı sağlam bastır ve şu kâfir kavme karşı bize yardım et."
  },
  
  // --- GÜNLÜK YAŞAM ---
  { 
    kategori: "Günlük Dualar",
    baslik: "Nazar Duası (Kalem Suresi)", 
    arapca: "وَإِن يَكَادُ الَّذِينَ كَفَرُوا لَيُزْلِقُونَكَ بِأَبْصَارِهِمْ لَمَّا سَمِعُوا الذِّكْرَ وَيَقُولُونَ إِنَّهُ لَمَجْنُونٌ وَمَا هُوَ إِلَّا ذِكْرٌ لِّلْعَالَمِينَ", 
    okunus: "Ve in yekâdullezîne keferû leyuzlikûneke bi ebsârihim lemmâ semiûz zikra ve yekûlûne innehu le mecnûn. Ve mâ huve illâ zikrun lil âlemîn.", 
    meal: "Şüphesiz inkar edenler Zikr'i (Kur'an'ı) duydukları zaman neredeyse seni gözleriyle devireceklerdi. Ve 'O, gerçekten bir delidir' diyorlar. Oysa o (Kur'an), âlemler için bir öğüttür." 
  },
  {
     kategori: "Günlük Dualar",
     baslik: "Bereket (Karınca) Duası",
     arapca: "اللّهُمَّ يَا رَبِّ، يَا رَبِّ، يَا حَيُّ يَا قَيُّومُ، يَا ذَا الْجَلاَلِ وَالْإِكْرَامِ. أَسْأَلُكَ يَا رَبَّ الْعَرْشِ الْعَظِيمِ أَنْ تَرْزُقَنِي رِزْقًا حَلاَلاً طَيِّبًا بِرَحْمَتِكَ يَا أَرْحَمَ الرَّاحِمِينَ",
     okunus: "Allâhümme yâ Rabbi yâ Rabbi yâ Hayyü yâ Kayyûmü yâ Zel-celâli vel-ikrâm. Es'elüke yâ Rabbel-arşil-azîmi en terzükanî rizkan halâlen tayyiben bi-rahmetike yâ erhamer-râhimîn.",
     meal: "Allah'ım! Ey Rab, ey Rab! Ey Hayy ve Kayyum! Ey Celal ve İkram sahibi! Ey Büyük Arşın Sahibi! Senden, merhametinle bana helal ve temiz bir rızık vermeni istiyorum, ey merhametlilerin en merhametlisi."
  },
  { 
    kategori: "Günlük Dualar",
    baslik: "Yemek Duası", 
    arapca: "الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنَا وَسَقَانَا وَجَعَلَنَا مُسْلِمِينَ", 
    okunus: "Elhamdülillahi ellezi etamenâ ve sekânâ ve cealenâ müslimîn.", 
    meal: "Bizi yediren, içiren ve bizi Müslümanlardan kılan Allah'a hamdolsun." 
  },
  { 
    kategori: "Günlük Dualar",
    baslik: "Şifa Duası", 
    arapca: "أَذْهِبِ الْبَأسَ رَبَّ النَّاسِ ، اشْفِ أَنْتَ الشَّافِي ، لا شِفَاءَ إِلا شِفَاؤُكَ ، شِفَاءً لا يُغَادِرُ سَقَمًا", 
    okunus: "Ezhibil be'se rabbin nasi, işfi ente'ş-şafi, la şifae illa şifauke, şifaen la yugadiru sekamen.", 
    meal: "Bu hastalığı gider ey insanların Rabbi! Şifa ver, çünkü şifa verici sensin. Senin vereceğin şifadan başka şifa yoktur. Öyle bir şifa ver ki hiç bir hastalık bırakmasın." 
  },
  {
    kategori: "Günlük Dualar",
    baslik: "Tövbe (Seyyidül İstiğfar)",
    arapca: "اللَّهُمَّ أَنْتَ رَبِّي لاَ إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ",
    okunus: "Allâhümme ente Rabbî lâ ilâhe illâ ente halaktenî ve ene abdüke ve ene alâ ahdike ve va’dike mesteta’tü. Eûzü bike min şerri mâ sana’tü...",
    meal: "Allah'ım! Sen benim Rabbimsin. Senden başka ilâh yoktur. Beni Sen yarattın ve ben Senin kulunum. Gücüm yettiğince Sana verdiğim söz üzerindeyim. Yaptıklarımın şerrinden Sana sığınırım."
  },
  {
    kategori: "Günlük Dualar",
    baslik: "Zihin Açıklığı (Sınav)",
    arapca: "رَبِّ اشْرَحْ لِي صَدْرِي وَيَسِّرْ لِي أَمْرِي وَاحْلُلْ عُقْدَةً مِّن لِّسَانِي يَفْقَهُوا قَوْلِي",
    okunus: "Rabbişrah lî sadrî. Ve yessir lî emrî. Vahlul ukdeten min lisânî. Yefkahû kavlî.",
    meal: "Rabbim! Göğsümü genişlet, işimi kolaylaştır. Dilimdeki düğümü çöz ki sözümü anlasınlar. (Taha Suresi, 25-28)"
  },
  { 
    kategori: "Özel Dualar",
    baslik: "Ayetel Kürsi (Tam Metin)", 
    arapca: "اللّهُ لاَ إِلَـهَ إِلاَّ هُوَ الْحَيُّ الْقَيُّومُ لاَ تَأْخُذُهُ سِنَةٌ وَلاَ نَوْمٌ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الأَرْضِ مَن ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلاَّ بِإِذْنِهِ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ وَلاَ يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلاَّ بِمَا شَاء وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالأَرْضَ وَلاَ يَؤُودُهُ حِفْظُهُمَا وَهُوَ الْعَلِيُّ الْعَظِيمُ", 
    okunus: "Allâhü lâ ilâhe illâ hüvel hayyül kayyûm, lâ te'huzühu sinetün velâ nevm, lehu mâ fissemâvâti ve ma fil'ard, men zellezi yeşfeu indehu illâ bi'iznih, ya'lemü mâ beyne eydiyhim vemâ halfehüm, velâ yühîtûne bi'şey'im min ilmihî illâ bimâ şâe, vesia kürsiyyühüssemâvâti vel'ard, velâ yeûdühû hıfzuhümâ ve hüvel aliyyül azîm.", 
    meal: "Allah, O'ndan başka ilah yoktur; O, hayydır, kayyûmdur. Kendisine ne uyku gelir ne de uyuklama. Göklerde ve yerdekilerin hepsi O'nundur. İzni olmadan O'nun katında kim şefaat edebilir? O, kullarının yaptıklarını ve yapacaklarını bilir. (Onlar ise) O'nun dilediği kadarından başka ilminden hiçbir şey kavrayamazlar. O'nun kürsüsü gökleri ve yeri kaplamıştır. Onları koruyup gözetmek O'na ağır gelmez. O, yücedir, büyüktür." 
  }
];

export default function DiniPage() {
  const [activeTab, setActiveTab] = useState<"vakit" | "kuran" | "zikir" | "dua">("vakit");
  const [loading, setLoading] = useState(true);
  
  // VERİLER
  const [prayerTimes, setPrayerTimes] = useState<any>(null);
  const [imsakiye, setImsakiye] = useState<any[]>([]);
  const [surahs, setSurahs] = useState<any[]>([]);
  const [selectedSurah, setSelectedSurah] = useState<any>(null);
  const [surahContent, setSurahContent] = useState<any[]>([]);
  const [readingLoading, setReadingLoading] = useState(false);
  const [zikirCount, setZikirCount] = useState(0);

  // KONUM
  const lat = 40.59;
  const lon = 36.95;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // İmsakiye
        const date = new Date();
        const prayerRes = await fetch(`https://api.aladhan.com/v1/calendar/${date.getFullYear()}/${date.getMonth() + 1}?latitude=${lat}&longitude=${lon}&method=13`);
        const prayerData = await prayerRes.json();
        const todayStr = date.getDate().toString().padStart(2, '0');
        const todayData = prayerData.data.find((d: any) => d.date.gregorian.day === todayStr);

        setPrayerTimes(todayData);
        setImsakiye(prayerData.data);

        // Sure Listesi
        const quranRes = await fetch("https://api.alquran.cloud/v1/surah");
        const quranData = await quranRes.json();
        setSurahs(quranData.data);
      } catch (error) { console.error(error); } 
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  // KURAN OKUMA
  const openSurah = async (sure: any) => {
    setReadingLoading(true);
    setSelectedSurah(sure);
    try {
      // Arapça + Meal + Transliteration (Okunuş için ham veri)
      const res = await fetch(`https://api.alquran.cloud/v1/surah/${sure.number}/editions/quran-uthmani,tr.diyanet,en.transliteration`);
      const data = await res.json();
      
      const arabic = data.data[0].ayahs;
      const turkish = data.data[1].ayahs;
      const rawReading = data.data[2].ayahs;
      
      const mergedContent = arabic.map((ayah: any, index: number) => ({
        number: ayah.numberInSurah,
        arabicText: ayah.text,
        turkishText: turkish[index].text,
        readingText: diyanetOkunusYap(rawReading[index].text) // DİYANET FİLTRESİ
      }));

      setSurahContent(mergedContent);
    } catch (e) { console.error(e); } 
    finally { setReadingLoading(false); }
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
            <p className="text-xs text-emerald-100">{selectedSurah ? `${selectedSurah.englishName}` : "Tokat, Niksar"}</p>
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
          <div className="flex justify-center items-center h-full text-emerald-600"><RefreshCcw className="animate-spin mr-2"/> Yükleniyor...</div>
        ) : (
          <>
            {/* --- VAKİTLER --- */}
            {activeTab === "vakit" && prayerTimes && !selectedSurah && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-gradient-to-br from-emerald-600 to-teal-500 rounded-2xl p-6 text-white text-center shadow-xl relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-4 opacity-10"><Moon size={100} /></div>
                   <p className="text-sm opacity-90 mb-1">{prayerTimes.date.gregorian.date}</p>
                   <h2 className="text-6xl font-bold my-4">{prayerTimes.timings.Maghrib}</h2>
                   <p className="text-lg font-medium bg-white/20 inline-block px-4 py-1 rounded-full">İftara Kalan Süre</p>
                   <div className="mt-4 flex justify-center gap-4 text-xs opacity-80">
                      <span>İmsak: {prayerTimes.timings.Fajr}</span>
                      <span>Öğle: {prayerTimes.timings.Dhuhr}</span>
                      <span>İkindi: {prayerTimes.timings.Asr}</span>
                      <span>Yatsı: {prayerTimes.timings.Isha}</span>
                   </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-emerald-50 text-emerald-800"><tr><th className="p-3">Gün</th><th className="p-3">İmsak</th><th className="p-3">Akşam</th></tr></thead>
                    <tbody>
                      {imsakiye.map((gun: any, i) => (
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
                  {surahs.map((sure: any) => (
                    <div key={sure.number} onClick={() => openSurah(sure)} className="bg-white p-4 rounded-xl shadow-sm border flex items-center justify-between hover:bg-emerald-50 transition-all cursor-pointer active:scale-95">
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-bold text-sm">{sure.number}</div>
                          <div><h4 className="font-bold text-gray-800">{sure.englishName}</h4><p className="text-xs text-gray-500">{sure.englishNameTranslation} • {sure.numberOfAyahs} Ayet</p></div>
                       </div>
                       <span className="text-xl font-serif text-emerald-800">{sure.name}</span>
                    </div>
                  ))}
               </div>
            )}

            {/* --- KURAN OKUMA --- */}
            {selectedSurah && (
               <div className="animate-in slide-in-from-right duration-300">
                  {readingLoading ? (
                     <div className="flex flex-col items-center justify-center py-20 text-emerald-600 gap-2"><RefreshCw className="animate-spin" size={32} /><p>Yükleniyor...</p></div>
                  ) : (
                     <div className="space-y-6">
                        <div className="bg-emerald-50 p-6 rounded-2xl text-center border border-emerald-100"><p className="text-3xl font-serif text-emerald-900">بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّح۪يمِ</p></div>
                        {surahContent.map((ayet: any) => (
                           <div key={ayet.number} className="bg-white p-5 rounded-xl border shadow-sm space-y-4">
                              <div className="flex justify-between items-start gap-4">
                                 <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center text-xs font-bold shrink-0">{ayet.number}</div>
                                 <p className="text-2xl font-serif text-right text-gray-900 leading-loose" dir="rtl">{ayet.arabicText}</p>
                              </div>
                              <div className="p-3 bg-emerald-50 rounded-lg"><p className="text-sm font-semibold text-emerald-800 italic">{ayet.readingText}</p></div>
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

            {/* --- DUALAR (DEV ARŞİV) --- */}
            {activeTab === "dua" && !selectedSurah && (
               <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div>
                    <h3 className="font-bold text-emerald-800 mb-3 flex items-center gap-2"><Sun size={18}/> Esmaül Hüsna (99 İsim)</h3>
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
                    <h3 className="font-bold text-emerald-800 mb-3 flex items-center gap-2"><Book size={18}/> Şifalı Dualar ve Sureler</h3>
                    <div className="space-y-4">
                       {DUALAR.map((dua, i) => (
                         <div key={i} className="bg-white p-4 rounded-xl border shadow-sm hover:border-emerald-300 transition-colors">
                            <div className="flex justify-between items-center mb-2 border-b pb-2">
                               <h4 className="font-bold text-gray-800">{dua.baslik}</h4>
                               <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">{dua.kategori}</span>
                            </div>
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