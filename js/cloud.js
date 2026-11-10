/* ══════════════ Firebase: Google/Apple girişi + ortaq reytinq ══════════════ */
const CLOUD={ready:false,auth:null,db:null};
(function(){
  try{
    if(typeof firebase==='undefined'||!FIREBASE_CONFIG.apiKey||!FIREBASE_CONFIG.projectId)return;
    firebase.initializeApp(FIREBASE_CONFIG);
    CLOUD.auth=firebase.auth();CLOUD.db=firebase.firestore();CLOUD.ready=true;
  }catch(e){console.warn('Firebase init failed',e);}
})();

/* provider: 'google' | 'apple' → {uid,name,photo} */
async function cloudSignIn(provider){
  const p=provider==='apple'?new firebase.auth.OAuthProvider('apple.com'):new firebase.auth.GoogleAuthProvider();
  if(provider==='apple'){p.addScope('name');p.addScope('email');}
  const r=await CLOUD.auth.signInWithPopup(p);
  const u=r.user;
  return{uid:u.uid,name:(u.displayName||(u.email||'Hero').split('@')[0]).slice(0,24),email:u.email||''};
}
function cloudSignOut(){try{CLOUD.ready&&CLOUD.auth.signOut();}catch(e){}}

/* öz statistikanı reytinq cədvəlinə yaz */
function cloudPush(u){
  if(!CLOUD.ready||!u||!u.uid||!CLOUD.auth.currentUser)return;
  CLOUD.db.collection('players').doc(u.uid).set({
    name:u.username,avatar:u.avatar||'👤',qpWins:u.qpWins||0,qpGames:u.qpGames||0,
    bestStreak:u.bestStreak||0,updated:firebase.firestore.FieldValue.serverTimestamp()
  },{merge:true}).catch(e=>console.warn('cloudPush',e));
}
async function cloudTop(n=50){
  const snap=await CLOUD.db.collection('players').orderBy('qpWins','desc').limit(n).get();
  return snap.docs.map(d=>({id:d.id,...d.data()}));
}
