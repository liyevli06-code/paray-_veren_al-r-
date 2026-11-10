/* ══════════════ DİL (AZ / TR / EN) — data-i18n, data-i18n-ph, data-i18n-html ══════════════ */
let currentLang=storeGet('htb_lang','az');
const I18N={
az:{
 authTitle:'HeroicTeamBattle',authSub:'Qeydiyyatdan keç, nəticələrini izlə',authLogin:'Giriş',authRegister:'Qeydiyyat',authUsernameLabel:'İstifadəçi adı',authUsernamePh:'İstifadəçi adın...',authEmailLabel:'E-mail (Gmail)',authPasswordLabel:'Şifrə',authGoogle:'Google ilə davam et',authOr:'və ya',
 errUserEmpty:'İstifadəçi adı boş ola bilməz.',errPwShort:'Şifrə ən az 4 simvol olmalıdır.',errUserExists:'Bu istifadəçi adı artıq mövcuddur.',errUserNotFound:'İstifadəçi tapılmadı.',errPwWrong:'Şifrə yanlışdır.',
 welcome:'Xoş gəldin, {n}! 🎮',loggedOut:'Hesabdan çıxıldı.',dailyBonus:'🗓️ Gündəlik bonus: +20 🪙',saved:'Yadda saxlandı ✓',
 navPlay:'Oyna',navCollection:'Kolleksiya',navShop:'Mağaza',navProfile:'Profil',
 modeBlindShort:'Gizli qiymət yaz',blindWaiting:'Təsdiqləndi — rəqib gözlənilir…',
 modeBlindTitle:'GİZLİ TƏKLİF',modeBlindSub:'Hər lota gizli qiymət yaz, ən yüksək qalib olur — blef və psixologiya',tagBlind:'YENİ',blindHint:'Gizli təklif ver',blindYours:'Gizli təklifin',blindLock:'TƏSDİQLƏ',blindRule:'Ən yüksək gizli təklif qalib olur və öz təklifini ödəyir. Bərabərlikdə qəhrəman satılmır.',blindTie:'Bərabər təklif — qəhrəman satılmadı',
 demoNote:'Demo rejim: Firebase qoşulmayıb, hesab yalnız bu cihazdadır.',authOr:'və ya',authGoogle:'Google ilə',authApple:'Apple ilə',navRank:'Reytinq',title_rank:'REYTİNQ',lbTitle:'REYTİNQ',lbQuickOnly:'YALNIZ TEZ OYUN',lbPlayer:'Oyunçu',lbWins:'Qələbə',lbGames:'Oyun',lbLeagues:'Liqalar',lbEmpty:'Hələ heç kim Tez Oyun oynamayıb. İlk sən ol!',lbError:'Reytinq yüklənmədi.',lbLocalNote:'Yerli reytinq (yalnız bu cihaz). Ümumi reytinq üçün Firebase qoş.',lbNext:'{l} liqasına {n} qələbə qalıb',lbMax:'Ən yüksək liqadasan! 👑',league_bronze:'Bürünc',league_silver:'Gümüş',league_gold:'Qızıl',league_diamond:'Almaz',league_legend:'Əfsanə',leagueUp:'🏆 Yeni liqa: {n}!',streakBonus:'🔥 {n} qələbə seriyası! +{c} 🪙',dailyStreak:'🗓️ {n}-ci gün giriş seriyası! +{c} 🪙',loginStreak:'Giriş seriyası',
 title_lobby:'LOBBY',title_draft:'DRAFT',title_wheel:'ÇARX',title_arena:'ARENA',title_end:'NƏTİCƏ',title_collection:'KOLLEKSİYA',title_store:'MAĞAZA',title_profile:'PROFİL',title_wait:'GÖZLƏ',
 dualFaction:'İKİ FRAKSİYA ARENASI',playHeroTitle:'KAHRAMAN<br>SAVAŞI',playHeroSub:'Rejim seç, kahramanları topla, zəfər qur',statRoster:'KAHRAMAN',statModes:'REJİM',
 modeLocalTitle:'EYNİ CİHAZ',modeLocalSub:'İki oyuncu eyni ekranda növbə ilə oynayır',modeMatchTitle:'TEZ OYUN',modeMatchSub:'Sistem sənə avtomatik rəqib tapsın',modeCreateTitle:'OTAQ YARAT',modeCreateSub:'Sən Oyuncu 1 olursan, 4 rəqəmli kod yaradıb göndər',modeJoinTitle:'OTAĞA QOŞUL',modeJoinSub:'Sənə göndərilən 4 rəqəmli koddan qoşul',modeBotTitle:'BOTA QARŞI',modeBotSub:'Tək oyna, rəqibi süni intellekt idarə etsin',
 tagInstant:'ANİ',tagHost:'HOST',tagCode:'KOD',copy:'Kopyala',copied:'Kopyalandı!',back:'‹ Geri',joinCodeLabel:'Otaq kodu (4 rəqəm)',joinBtn:'QOŞUL',joinPh:'4 rəqəmli kod',enterCode:'Kod daxil edin',enter4:'4 rəqəmli kod daxil edin',joining:'Qoşulur...',joined:'Qoşuldun',joinFail:'Otağa qoşulmaq mümkün olmadı — kodu yoxlayın',roomNotFound:'Bu koda uyğun otaq tapılmadı',errPrefix:'Xəta: ',
 matchmakingText:'Rəqib axtarılır...',matchmakingSub:'Zəhmət olmasa gözlə, tapan kimi qoşulacaqsan',cancelMatch:'‹ İmtina et',oppFound:'Rəqib tapıldı!',noNet:'Online rejim üçün internet (PeerJS) lazımdır',
 roomCreating:'Otaq yaradılır...',roomReady:'Otaq hazır — kodu Oyuncu 2-yə göndər: {c}',p2Joined:'Oyuncu 2 qoşuldu!',youAreP1:'Sən Oyuncu 1-sən',youAreP2:'Sən Oyuncu 2-sən',waitText:'Otaq sahibinin oyunu qurmasını gözləyin...',hostPreparing:'Otaq sahibi yeni oyun hazırlayır...',connLost:'Bağlantı kəsildi',p2NotJoined:'Oyuncu 2 hələ qoşulmayıb.',
 configTitle:'Oyun Tənzimləmələri',gameMode:'Oyun rejimi',modeAuction:'ARTIRMA',modeAuctionSub:'Büdcə ilə təklif ver',modeWheel:'ÇARX',modeWheelSub:'Çarxı fırlat',startBudget:'Başlanğıc büdcə',bidStep:'Təklif artım addımı',heroesPerPlayer:'Oyuncu başına kahraman',startGameBtn:'OYUNA BAŞLA',
 botLevel:'Bot səviyyəsi',lvlEasy:'ASAN',lvlEasySub:'Səhvlər edir',lvlNormal:'NORMAL',lvlNormalSub:'Planlı oynayır',lvlHard:'ÇƏTİN',lvlHardSub:'Hesablayır',botThinking:'BOT düşünür',
 player1:'OYUNCU 1',player2:'OYUNCU 2',you:'SƏN',budget:'BÜDCƏ',drafted:'seçildi',
 phaseAuction:'MƏRHƏLƏ 02 // CANLI KAHRAMAN MÜZAYİDƏSİ',phaseWheel:'MƏRHƏLƏ 02 // KAHRAMAN ÇARXI',designation:'KAHRAMAN',curPriceLabel:'Hazırkı qiymət',bidBtn:'Təklif',passBtn:'Pas keç',startAuctionMsg:'Müzayidəyə başlamaq üçün təklif verin',leadBy:'öndə: {n}',
 bidLog:'Müzayidə jurnalı',logBid:'təklif verdi',logPass:'pas verdi',logSold:'satıldı →',logUnsold:'satılmadı',noBidsYet:'Hələ təklif yoxdur',sold:'SATILDI!',unsold:'SATILMADI',noOneBid:'Heç kim təklif vermədi',noHeroYet:'Hələ kahraman alınmayıb',
 tier_mythic:'Mifik',tier_legendary:'Əfsanəvi',tier_epic:'Epik',tier_rare:'Nadir',tierWord:'TİER',
 spinBtn:'ÇEVİR',watchingOpp:'Rəqib fırladır...',turnOf:'{n} növbəsi',wheelProgress:'{a} / {b} kahraman bölüşdürüldü',
 liveCombat:'CANLI DÖYÜŞ',arenaName:'KAHRAMAN KOLİZEYİ',series:'ÇEMPİONAT SERİYASI',round:'RAUND',abilityClash:'QABİLİYYƏT TOQQUŞMASI',clashIdle:'Döyüşə hazır',telemetry:'DÖYÜŞ JURNALI',speed:'SÜRƏT',music:'MUSİQİ',startFightBtn:'DÖYÜŞÜ BAŞLAT',
 ally:'DOST',enemy:'DÜŞMƏN',readyNext:'Növbəti döyüşə hazır',fighting:'Döyüşür...',fightBang:'DÖYÜŞ!',crit:'KRİTİK',critStrike:'KRİTİK ZƏRBƏ',exchange:'ZƏRBƏ MÜBADİLƏSİ',triggers:'işlətdi',on:'→',draw:'BƏRABƏRƏ!',bothDown:'İkisi də yıxıldı',winsFight:'{n} QALİB GƏLDİ!',
 fx_energy:'ENERJİ PARTLAYIŞI',fx_lightning:'İLDIRIM',fx_fire:'ATƏŞ DALĞASI',fx_ice:'BUZ ZƏRBƏSİ',fx_water:'SU TSUNAMİSİ',fx_magic:'SEHR',fx_shadow:'KÖLGƏ',fx_tech:'LAZER',fx_slash:'KƏSİCİ ZƏRBƏ',fx_impact:'AĞIR ZƏRBƏ',fx_arrow:'OXLAR',
 championLabel:'Meydanın Qalibi',p1Wins:'OYUNCU 1 QALİB GƏLDİ!',p1WinsSub:'Oyuncu 1-in komandası üstünlük əldə etdi!',p2Wins:'OYUNCU 2 QALİB GƏLDİ!',p2WinsSub:'Oyuncu 2-nin komandası döyüşü qazandı!',tie:'BƏRABƏRLİK!',tieSub:'Hər iki tərəf cəsarətlə döyüşdü!',
 resultsBtn:'NƏTİCƏLƏRƏ BAX',results:'NƏTİCƏLƏR',matchOver:'OYUN BİTDİ',survivors:'Sağ qalanlar: {a} : {b}',rewardToast:'🏆 +{n} 🪙 qazandın!',rewardEnd:'Qalibiyyətə görə {n} coin qazandın!',restart:'YENİDƏN OYNA',backToLobby:'Lobbyə Qayıt',leaveConfirm:'Oyundan çıxmaq istəyirsən? Gedişat itəcək.',
 collectionTitle:'KOLLEKSİYAM',discover:'Kəşf et',shopTitle:'SİLAH ANBARI',frames:'Çərçivələr',titles:'Başlıqlar',effects:'Effektlər',shopHeroesTab:'Qəhrəmanlar',shopHeroesNote:'Qəhrəmanları coin ilə al. Aldığın qəhrəmanlar kolleksiyanda görünər.',
 cat_frame:'ÇƏRÇİVƏ',cat_title:'BAŞLIQ',cat_effect:'EFFEKT',equip:'Gey',equipped:'Taxıldı!',equippedTag:'✓ TAXILIB',owned:'VAR',notEnough:'Kifayət qədər coin yoxdur 😢',bought:'{n} alındı! 🎉',heroAdded:'{n} kolleksiyaya əlavə edildi! 🦸',alreadyHave:'Bu kahraman artıq var',
 wins:'Qalibiyyət',games:'Oyun',coins:'Coin',heroes:'Kahraman',profileEdit:'Düzənlə',profileInventory:'İnventory',settings:'Ayarlar',usernameLabel:'İstifadəçi adı',avatarLabel:'Avatar seç',save:'Yadda saxla',language:'Dil',sfxVol:'Səs effektləri',musicVol:'Musiqi',logoutBtn:'Hesabdan çıx',
 chatTitle:'Söhbət',chatPh:'Mesaj yaz...'},
tr:{
 authTitle:'HeroicTeamBattle',authSub:'Kayıt ol, sonuçlarını takip et',authLogin:'Giriş',authRegister:'Kayıt',authUsernameLabel:'Kullanıcı adı',authUsernamePh:'Kullanıcı adın...',authEmailLabel:'E-posta (Gmail)',authPasswordLabel:'Şifre',authGoogle:'Google ile devam et',authOr:'veya',
 errUserEmpty:'Kullanıcı adı boş olamaz.',errPwShort:'Şifre en az 4 karakter olmalı.',errUserExists:'Bu kullanıcı adı zaten var.',errUserNotFound:'Kullanıcı bulunamadı.',errPwWrong:'Şifre yanlış.',
 welcome:'Hoş geldin, {n}! 🎮',loggedOut:'Çıkış yapıldı.',dailyBonus:'🗓️ Günlük bonus: +20 🪙',saved:'Kaydedildi ✓',
 navPlay:'Oyna',navCollection:'Koleksiyon',navShop:'Mağaza',navProfile:'Profil',
 modeBlindShort:'Gizli fiyat yaz',blindWaiting:'Onaylandı — rakip bekleniyor…',
 modeBlindTitle:'GİZLİ TEKLİF',modeBlindSub:'Her loda gizli fiyat yaz, en yüksek kazanır — blöf ve psikoloji',tagBlind:'YENİ',blindHint:'Gizli teklif ver',blindYours:'Gizli teklifin',blindLock:'ONAYLA',blindRule:'En yüksek gizli teklif kazanır ve kendi teklifini öder. Beraberlikte kahraman satılmaz.',blindTie:'Eşit teklif — kahraman satılmadı',
 demoNote:'Demo mod: Firebase bağlı değil, hesap sadece bu cihazda.',authOr:'veya',authGoogle:'Google ile',authApple:'Apple ile',navRank:'Sıralama',title_rank:'SIRALAMA',lbTitle:'SIRALAMA',lbQuickOnly:'SADECE HIZLI OYUN',lbPlayer:'Oyuncu',lbWins:'Galibiyet',lbGames:'Oyun',lbLeagues:'Ligler',lbEmpty:'Henüz kimse Hızlı Oyun oynamadı. İlk sen ol!',lbError:'Sıralama yüklenemedi.',lbLocalNote:'Yerel sıralama (sadece bu cihaz). Genel sıralama için Firebase bağla.',lbNext:'{l} ligine {n} galibiyet kaldı',lbMax:'En üst ligdesin! 👑',league_bronze:'Bronz',league_silver:'Gümüş',league_gold:'Altın',league_diamond:'Elmas',league_legend:'Efsane',leagueUp:'🏆 Yeni lig: {n}!',streakBonus:'🔥 {n} galibiyet serisi! +{c} 🪙',dailyStreak:'🗓️ {n}. gün giriş serisi! +{c} 🪙',loginStreak:'Giriş serisi',
 title_lobby:'LOBİ',title_draft:'DRAFT',title_wheel:'ÇARK',title_arena:'ARENA',title_end:'SONUÇ',title_collection:'KOLEKSİYON',title_store:'MAĞAZA',title_profile:'PROFİL',title_wait:'BEKLE',
 dualFaction:'İKİ FRAKSİYON ARENASI',playHeroTitle:'KAHRAMAN<br>SAVAŞI',playHeroSub:'Mod seç, kahramanları topla, zafer kazan',statRoster:'KAHRAMAN',statModes:'MOD',
 modeLocalTitle:'AYNI CİHAZ',modeLocalSub:'İki oyuncu aynı ekranda sırayla oynar',modeMatchTitle:'HIZLI OYUN',modeMatchSub:'Sistem sana otomatik rakip bulsun',modeCreateTitle:'ODA OLUŞTUR',modeCreateSub:'Sen Oyuncu 1 olursun, 4 haneli kodu gönder',modeJoinTitle:'ODAYA KATIL',modeJoinSub:'Sana gönderilen 4 haneli koddan katıl',modeBotTitle:'BOTA KARŞI',modeBotSub:'Tek oyna, rakibi yapay zeka yönetsin',
 tagInstant:'ANINDA',tagHost:'HOST',tagCode:'KOD',copy:'Kopyala',copied:'Kopyalandı!',back:'‹ Geri',joinCodeLabel:'Oda kodu (4 hane)',joinBtn:'KATIL',joinPh:'4 haneli kod',enterCode:'Kodu girin',enter4:'4 haneli kod girin',joining:'Katılıyor...',joined:'Katıldın',joinFail:'Odaya katılınamadı — kodu kontrol et',roomNotFound:'Bu koda ait oda bulunamadı',errPrefix:'Hata: ',
 matchmakingText:'Rakip aranıyor...',matchmakingSub:'Lütfen bekle, bulunca otomatik katılacaksın',cancelMatch:'‹ Vazgeç',oppFound:'Rakip bulundu!',noNet:'Online mod için internet (PeerJS) gerekli',
 roomCreating:'Oda oluşturuluyor...',roomReady:'Oda hazır — kodu Oyuncu 2\'ye gönder: {c}',p2Joined:'Oyuncu 2 katıldı!',youAreP1:'Sen Oyuncu 1\'sin',youAreP2:'Sen Oyuncu 2\'sin',waitText:'Oda sahibinin oyunu kurmasını bekleyin...',hostPreparing:'Oda sahibi yeni oyun hazırlıyor...',connLost:'Bağlantı koptu',p2NotJoined:'Oyuncu 2 henüz katılmadı.',
 configTitle:'Oyun Ayarları',gameMode:'Oyun modu',modeAuction:'AÇIK ARTIRMA',modeAuctionSub:'Bütçe ile teklif ver',modeWheel:'ÇARK',modeWheelSub:'Çarkı çevir',startBudget:'Başlangıç bütçesi',bidStep:'Teklif artış adımı',heroesPerPlayer:'Oyuncu başına kahraman',startGameBtn:'OYUNA BAŞLA',
 botLevel:'Bot seviyesi',lvlEasy:'KOLAY',lvlEasySub:'Hata yapar',lvlNormal:'NORMAL',lvlNormalSub:'Planlı oynar',lvlHard:'ZOR',lvlHardSub:'Hesaplar',botThinking:'BOT düşünüyor',
 player1:'OYUNCU 1',player2:'OYUNCU 2',you:'SEN',budget:'BÜTÇE',drafted:'seçildi',
 phaseAuction:'AŞAMA 02 // CANLI KAHRAMAN AÇIK ARTIRMASI',phaseWheel:'AŞAMA 02 // KAHRAMAN ÇARKI',designation:'KAHRAMAN',curPriceLabel:'Güncel fiyat',bidBtn:'Teklif',passBtn:'Pas geç',startAuctionMsg:'Açık artırmayı başlatmak için teklif ver',leadBy:'önde: {n}',
 bidLog:'Artırma günlüğü',logBid:'teklif verdi',logPass:'pas geçti',logSold:'satıldı →',logUnsold:'satılmadı',noBidsYet:'Henüz teklif yok',sold:'SATILDI!',unsold:'SATILMADI',noOneBid:'Kimse teklif vermedi',noHeroYet:'Henüz kahraman alınmadı',
 tier_mythic:'Mitik',tier_legendary:'Efsanevi',tier_epic:'Epik',tier_rare:'Nadir',tierWord:'TİER',
 spinBtn:'ÇEVİR',watchingOpp:'Rakip çeviriyor...',turnOf:'{n} sırası',wheelProgress:'{a} / {b} kahraman dağıtıldı',
 liveCombat:'CANLI DÖVÜŞ',arenaName:'KAHRAMAN KOLEZYUMU',series:'ŞAMPİYONA SERİSİ',round:'RAUNT',abilityClash:'YETENEK ÇARPIŞMASI',clashIdle:'Dövüşe hazır',telemetry:'DÖVÜŞ GÜNLÜĞÜ',speed:'HIZ',music:'MÜZİK',startFightBtn:'DÖVÜŞÜ BAŞLAT',
 ally:'DOST',enemy:'DÜŞMAN',readyNext:'Sıradaki dövüşe hazır',fighting:'Dövüşüyor...',fightBang:'DÖVÜŞ!',crit:'KRİTİK',critStrike:'KRİTİK VURUŞ',exchange:'VURUŞ TAKASI',triggers:'kullandı',on:'→',draw:'BERABERE!',bothDown:'İkisi de yere düştü',winsFight:'{n} KAZANDI!',
 fx_energy:'ENERJİ PATLAMASI',fx_lightning:'YILDIRIM',fx_fire:'ATEŞ DALGASI',fx_ice:'BUZ VURUŞU',fx_water:'SU TSUNAMİSİ',fx_magic:'BÜYÜ',fx_shadow:'GÖLGE',fx_tech:'LAZER',fx_slash:'KESİCİ VURUŞ',fx_impact:'AĞIR VURUŞ',fx_arrow:'OKLAR',
 championLabel:'Meydanın Galibi',p1Wins:'OYUNCU 1 KAZANDI!',p1WinsSub:'Oyuncu 1\'in takımı üstünlük sağladı!',p2Wins:'OYUNCU 2 KAZANDI!',p2WinsSub:'Oyuncu 2\'nin takımı dövüşü kazandı!',tie:'BERABERLİK!',tieSub:'İki taraf da cesurca dövüştü!',
 resultsBtn:'SONUÇLARA BAK',results:'SONUÇLAR',matchOver:'OYUN BİTTİ',survivors:'Hayatta kalanlar: {a} : {b}',rewardToast:'🏆 +{n} 🪙 kazandın!',rewardEnd:'Galibiyet için {n} coin kazandın!',restart:'YENİDEN OYNA',backToLobby:'Lobiye Dön',leaveConfirm:'Oyundan çıkmak istiyor musun? İlerleme kaybolur.',
 collectionTitle:'KOLEKSİYONUM',discover:'Keşfet',shopTitle:'SİLAHHANE',frames:'Çerçeveler',titles:'Unvanlar',effects:'Efektler',shopHeroesTab:'Kahramanlar',shopHeroesNote:'Kahramanları coin ile al. Aldıkların koleksiyonunda görünür.',
 cat_frame:'ÇERÇEVE',cat_title:'UNVAN',cat_effect:'EFEKT',equip:'Tak',equipped:'Takıldı!',equippedTag:'✓ TAKILI',owned:'VAR',notEnough:'Yeterli coin yok 😢',bought:'{n} alındı! 🎉',heroAdded:'{n} koleksiyona eklendi! 🦸',alreadyHave:'Bu kahraman zaten var',
 wins:'Galibiyet',games:'Oyun',coins:'Coin',heroes:'Kahraman',profileEdit:'Düzenle',profileInventory:'Envanter',settings:'Ayarlar',usernameLabel:'Kullanıcı adı',avatarLabel:'Avatar seç',save:'Kaydet',language:'Dil',sfxVol:'Ses efektleri',musicVol:'Müzik',logoutBtn:'Hesaptan çık',
 chatTitle:'Sohbet',chatPh:'Mesaj yaz...'},
en:{
 authTitle:'HeroicTeamBattle',authSub:'Sign up and track your results',authLogin:'Log In',authRegister:'Register',authUsernameLabel:'Username',authUsernamePh:'Your username...',authEmailLabel:'Email (Gmail)',authPasswordLabel:'Password',authGoogle:'Continue with Google',authOr:'or',
 errUserEmpty:'Username cannot be empty.',errPwShort:'Password must be at least 4 characters.',errUserExists:'This username already exists.',errUserNotFound:'User not found.',errPwWrong:'Wrong password.',
 welcome:'Welcome, {n}! 🎮',loggedOut:'Logged out.',dailyBonus:'🗓️ Daily bonus: +20 🪙',saved:'Saved ✓',
 navPlay:'Play',navCollection:'Collection',navShop:'Shop',navProfile:'Profile',
 modeBlindShort:'Write a secret price',blindWaiting:'Locked in — waiting for opponent…',
 modeBlindTitle:'BLIND BID',modeBlindSub:'Write a secret price for each lot, the highest wins — bluff and psychology',tagBlind:'NEW',blindHint:'Place a secret bid',blindYours:'Your secret bid',blindLock:'LOCK IN',blindRule:'The highest secret bid wins and pays its own price. On a tie the hero goes unsold.',blindTie:'Tied bids — hero unsold',
 demoNote:'Demo mode: Firebase not connected, account is local to this device.',authOr:'or',authGoogle:'Continue with Google',authApple:'Continue with Apple',navRank:'Ranking',title_rank:'RANKING',lbTitle:'LEADERBOARD',lbQuickOnly:'QUICK PLAY ONLY',lbPlayer:'Player',lbWins:'Wins',lbGames:'Games',lbLeagues:'Leagues',lbEmpty:'Nobody has played Quick Play yet. Be the first!',lbError:'Could not load leaderboard.',lbLocalNote:'Local ranking (this device only). Connect Firebase for a global one.',lbNext:'{n} wins to {l} league',lbMax:'You are in the top league! 👑',league_bronze:'Bronze',league_silver:'Silver',league_gold:'Gold',league_diamond:'Diamond',league_legend:'Legend',leagueUp:'🏆 New league: {n}!',streakBonus:'🔥 {n}-win streak! +{c} 🪙',dailyStreak:'🗓️ Day {n} login streak! +{c} 🪙',loginStreak:'Login streak',
 title_lobby:'LOBBY',title_draft:'DRAFT',title_wheel:'WHEEL',title_arena:'ARENA',title_end:'RESULT',title_collection:'COLLECTION',title_store:'STORE',title_profile:'PROFILE',title_wait:'WAITING',
 dualFaction:'DUAL FACTION ARENA',playHeroTitle:'HERO<br>BATTLE',playHeroSub:'Pick a mode, collect heroes, claim victory',statRoster:'HEROES',statModes:'MODES',
 modeLocalTitle:'SAME DEVICE',modeLocalSub:'Two players take turns on the same screen',modeMatchTitle:'QUICK PLAY',modeMatchSub:'Let the system find you an opponent',modeCreateTitle:'CREATE ROOM',modeCreateSub:'You become Player 1 — share the 4-digit code',modeJoinTitle:'JOIN ROOM',modeJoinSub:'Join with a 4-digit code sent to you',modeBotTitle:'VS BOT',modeBotSub:'Play solo, the AI controls your opponent',
 tagInstant:'INSTANT',tagHost:'HOST',tagCode:'CODE',copy:'Copy',copied:'Copied!',back:'‹ Back',joinCodeLabel:'Room code (4 digits)',joinBtn:'JOIN',joinPh:'4-digit code',enterCode:'Enter code',enter4:'Enter a 4-digit code',joining:'Joining...',joined:'JOINED',joinFail:'Could not join the room — check the code',roomNotFound:'No room found for this code',errPrefix:'Error: ',
 matchmakingText:'Finding an opponent...',matchmakingSub:'Please wait, you will join automatically once found',cancelMatch:'‹ Cancel',oppFound:'Opponent found!',noNet:'Online mode needs internet (PeerJS)',
 roomCreating:'Creating room...',roomReady:'Room ready — send this code to Player 2: {c}',p2Joined:'Player 2 joined!',youAreP1:'You are Player 1',youAreP2:'You are Player 2',waitText:'Waiting for the host to set up the game...',hostPreparing:'Host is preparing a new game...',connLost:'Connection lost',p2NotJoined:'Player 2 has not joined yet.',
 configTitle:'Game Settings',gameMode:'Game mode',modeAuction:'AUCTION',modeAuctionSub:'Bid with a budget',modeWheel:'WHEEL',modeWheelSub:'Spin the wheel',startBudget:'Starting budget',bidStep:'Bid increment',heroesPerPlayer:'Heroes per player',startGameBtn:'START GAME',
 botLevel:'Bot level',lvlEasy:'EASY',lvlEasySub:'Makes mistakes',lvlNormal:'NORMAL',lvlNormalSub:'Plays with a plan',lvlHard:'HARD',lvlHardSub:'Calculates',botThinking:'BOT is thinking',
 player1:'PLAYER 1',player2:'PLAYER 2',you:'YOU',budget:'BUDGET',drafted:'drafted',
 phaseAuction:'PHASE 02 // LIVE HERO AUCTION',phaseWheel:'PHASE 02 // HERO WHEEL DRAFT',designation:'DESIGNATION',curPriceLabel:'Current lead bid',bidBtn:'Bid',passBtn:'Pass',startAuctionMsg:'Place a bid to start the auction',leadBy:'led by {n}',
 bidLog:'Auction telemetry log',logBid:'bid',logPass:'passed',logSold:'sold to',logUnsold:'went unsold',noBidsYet:'No bids yet',sold:'SOLD!',unsold:'UNSOLD',noOneBid:'Nobody bid',noHeroYet:'No heroes yet',
 tier_mythic:'Mythic',tier_legendary:'Legendary',tier_epic:'Epic',tier_rare:'Rare',tierWord:'TIER',
 spinBtn:'SPIN',watchingOpp:'Opponent spinning...',turnOf:"{n}'s turn",wheelProgress:'{a} / {b} heroes assigned',
 liveCombat:'LIVE COMBAT',arenaName:'HERO COLOSSEUM',series:'CHAMPIONSHIP SERIES',round:'ROUND',abilityClash:'ABILITY CLASH',clashIdle:'Ready for combat',telemetry:'TELEMETRY FEED',speed:'SPEED',music:'MUSIC',startFightBtn:'ENGAGE NEXT STRIKE',
 ally:'ALLY',enemy:'ENEMY',readyNext:'Ready for the next fight',fighting:'Fighting...',fightBang:'FIGHT!',crit:'CRIT',critStrike:'CRITICAL STRIKE',exchange:'EXCHANGE',triggers:'unleashes',on:'on',draw:'DRAW!',bothDown:'Both fighters down',winsFight:'{n} WINS!',
 fx_energy:'ENERGY BURST',fx_lightning:'LIGHTNING',fx_fire:'FIRE WAVE',fx_ice:'ICE SHATTER',fx_water:'TIDAL SURGE',fx_magic:'ARCANE BLAST',fx_shadow:'SHADOW STRIKE',fx_tech:'LASER STORM',fx_slash:'BLADE SLASH',fx_impact:'HEAVY IMPACT',fx_arrow:'ARROW VOLLEY',
 championLabel:'Champion of the Arena',p1Wins:'PLAYER 1 WINS!',p1WinsSub:"Player 1's team took the victory!",p2Wins:'PLAYER 2 WINS!',p2WinsSub:"Player 2's team won the battle!",tie:"IT'S A TIE!",tieSub:'Both sides fought bravely!',
 resultsBtn:'VIEW RESULTS',results:'RESULTS',matchOver:'MATCH COMPLETE',survivors:'Survivors: {a} : {b}',rewardToast:'🏆 You won +{n} 🪙!',rewardEnd:'You earned {n} coins for the win!',restart:'PLAY AGAIN',backToLobby:'Back to Lobby',leaveConfirm:'Leave the game? Progress will be lost.',
 collectionTitle:'MY COLLECTION',discover:'Discover',shopTitle:'ARMORY STORE',frames:'Frames',titles:'Titles',effects:'Effects',shopHeroesTab:'Heroes',shopHeroesNote:'Buy heroes with coins. Purchased heroes appear in your collection.',
 cat_frame:'FRAME',cat_title:'TITLE',cat_effect:'EFFECT',equip:'Equip',equipped:'Equipped!',equippedTag:'✓ EQUIPPED',owned:'OWNED',notEnough:'Not enough coins 😢',bought:'{n} purchased! 🎉',heroAdded:'{n} added to your collection! 🦸',alreadyHave:'You already own this hero',
 wins:'Wins',games:'Games',coins:'Coins',heroes:'Heroes',profileEdit:'Edit',profileInventory:'Inventory',settings:'Settings',usernameLabel:'Username',avatarLabel:'Choose avatar',save:'Save',language:'Language',sfxVol:'Sound effects',musicVol:'Music',logoutBtn:'Log out',
 chatTitle:'Chat',chatPh:'Type a message...'}
};
function t(key,vars){
  let s=(I18N[currentLang]&&I18N[currentLang][key])||I18N.az[key]||key;
  if(vars)for(const k in vars)s=s.split('{'+k+'}').join(vars[k]);
  return s;
}
function applyLang(lang){
  if(lang&&I18N[lang]){currentLang=lang;storeSet('htb_lang',lang);}
  document.documentElement.lang=currentLang;
  $$('[data-i18n]').forEach(e=>{e.textContent=t(e.dataset.i18n);});
  $$('[data-i18n-html]').forEach(e=>{e.innerHTML=t(e.dataset.i18nHtml);});
  $$('[data-i18n-ph]').forEach(e=>{e.placeholder=t(e.dataset.i18nPh);});
  $('#langBtn').textContent=currentLang.toUpperCase();
  $$('.seg-btn[data-act="setLang"]').forEach(b=>b.classList.toggle('active',b.dataset.arg===currentLang));
  if(typeof authMode!=='undefined')$('#authSubmit').textContent=(authMode==='login'?t('authLogin'):t('authRegister')).toUpperCase();
  if(typeof refreshScreenTitle==='function')refreshScreenTitle();
  if(typeof currentUser!=='undefined'&&currentUser){
    const a=$('.screen.active');
    if(a&&a.id==='profileScreen')renderProfile();else if(a&&a.id==='storeScreen')renderShop();else if(a&&a.id==='collectionScreen')renderCollection();
    else if(a&&a.id==='draftScreen'&&state)renderAuction();
  }
}
ACT.setLang=l=>applyLang(l);
ACT.cycleLang=()=>{const o=['az','tr','en'];applyLang(o[(o.indexOf(currentLang)+1)%3]);};
