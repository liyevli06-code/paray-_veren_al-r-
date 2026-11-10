# Firebase qurulumu (pulsuz, ~5 dəqiqə)

1. https://console.firebase.google.com → **Add project** (Analytics lazım deyil).
2. **Build → Authentication → Get started → Sign-in method**: **Google**-u aktiv et. (Apple üçün aşağıya bax.)
3. **Authentication → Settings → Authorized domains**: saytın domenini əlavə et (məs. `liyevli06-code.github.io`).
4. **Build → Firestore Database → Create database** (production mode). Sonra **Rules** tabına `firestore.rules` faylının məzmununu yapışdırıb **Publish** et.
5. **Project settings → Your apps → Web (`</>`)** → app yarat → çıxan `firebaseConfig` dəyərlərini (`apiKey, authDomain, projectId, appId`) `js/firebase-config.js` faylına yapışdır.
6. Commit/push et. Giriş və ümumi reytinq işləyəcək.

## Apple girişi
Apple ilə giriş **ücretli Apple Developer hesabı** (99$/il) tələb edir: Services ID + key yaradıb Firebase → Authentication → Apple bölməsinə daxil et. Olmasa, Apple düyməsi xəta verər; Google tək başına işləyir.

## Qeydlər
- Reytinqə yalnız **Tez Oyun (matchmaking)** nəticələri sayılır.
- Statistika müştəri tərəfindən göndərilir — qaydalar sadə yoxlama edir, amma qərəzli istifadəçi saxtalaşdıra bilər. Ciddi reytinq üçün server (Cloud Functions) lazımdır.
- Coin və kolleksiya hələ də yalnız cihazdadır.
