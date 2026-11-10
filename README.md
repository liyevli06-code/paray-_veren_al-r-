# HeroicTeamBattle — Kahraman Savaşı

Kahraman toplama (artırma və ya çarx) + komanda döyüşü oyunu. Heç bir build lazım deyil — `index.html`-i açmaq kifayətdir (GitHub Pages ilə də işləyir).

## Struktur
- `index.html` — səhifə quruluşu
- `css/style.css` — "Cyber-Graphic HUD" dizayn sistemi
- `js/data.js` — kahramanlar, bio-lar, mağaza kataloqu, hücum üslubları
- `js/audio.js` — səs effektləri və fon musiqisi (Web Audio ilə sintez, fayl lazım deyil)
- `js/fx.js` — partikul və hücum effektləri (proyektil, ildırım, alov, buz…)
- `js/portrait.js` — kahraman şəkli (yerli → link → avtomatik portret)
- `js/bot.js` — bot (asan / normal / çətin)
- `js/game.js` — artırma, çarx, döyüş, online sinxronizasiya
- `js/store.js`, `js/net.js`, `js/i18n.js`, `js/main.js`

## Kahraman şəkilləri
Şəkli `assets/heroes/` qovluğuna at və `js/data.js`-də `HERO_LOCAL` obyektinə yaz:
`HERO_LOCAL['superman']='assets/heroes/superman.webp';`
Şəkil tapılmasa orijinal `img` linki, o da açılmasa avtomatik HUD portreti göstərilir.

## Giriş, reytinq, liqalar
- Google/Apple girişi və ümumi reytinq üçün `FIREBASE_SETUP.md`-ni izlə. Konfiqurasiya boşdursa oyun yerli demo rejimdə işləyir.
- Reytinq yalnız Tez Oyun qələbələrini (qələbə / oyun / WR%) sayır.
- Saxlama: liqalar (Bürünc→Əfsanə), qələbə seriyası bonusu, gündəlik giriş seriyası bonusu.
