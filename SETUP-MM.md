> **v1.3 update:** လက်ရှိ နေရာအရင်ရွေးပြီး local filter သုံးနည်းကို [AREA-SEARCH-MM.md](AREA-SEARCH-MM.md) တွင်ဖတ်ပါ။ အောက်ပါ v1.2 food-query flow ကို အစားထိုးထားပါသည်။

# FoodFinder v1.2 — စတင်အသုံးပြုရန်


**လက်ရှိ အစားအသောက်အနီးဆုံးရှာဖွေနည်း: [NEARBY-FOOD-MM.md](NEARBY-FOOD-MM.md)**

## v1.1 — USA / OBX ရှာဖွေမှု ပြင်ဆင်ချက်

အရင် version ၏ cities15000 စာရင်းတွင် လူဦးရေနည်းသော Kitty Hawk / Kill Devil Hills မပါခဲ့ပါ။ ထို့အပြင် food search box က location ကို မရှာပေးခဲ့ပါ။ ယခု နှစ်ခုလုံးပြင်ထားပါသည်။

- **KDH / K.D.H. / Kill Devil Hills** → Kill Devil Hills, NC
- **Kitty Hawk / Kittyhawk / Kitty Hawk NC** → Kitty Hawk, NC
- **OBX / Outer Banks / OBX NC** → Outer Banks collection
- **NC / N.C. / North Carolina** → North Carolina မြို့များ၊ လိုချင်သောမြို့ကို ဆက်ရွေးပါ။ ပြည်နယ်တစ်ခုလုံးကို 3 km စက်ဝိုင်းတစ်ခုဖြင့် ရှာခြင်းမဟုတ်ပါ။
- **Food search box** မှာလည်း နေရာနာမည်ကို ရိုက်နိုင်သည်။ တိုက်ရိုက်သိသောနာမည်ဆို Find nearby / Enter ဖြင့်ဖွင့်နိုင်ပြီး အခြား matching locations များကို အောက်တွင်နှိပ်ရွေးနိုင်သည်။
- **Choose your city → USA** သည် default ဖြစ်သည်။ နိုင်ငံခြားမြို့လိုပါက **Worldwide** ရွေးပါ။ နိုင်ငံစုံရှာခြင်းကို မဖယ်ထားပါ။
- Outer Banks မြို့ ၉ ခုမှ မတူညီသော OSM place 173 ခုကို အရင်တင်ထားသည်။ မြို့လယ်နှင့်အနီးဝန်းကျင် sample ဖြစ်ပြီး OBX မြို့/ဆိုင်အားလုံး မဟုတ်ပါ။ OBX view မှ မြို့တစ်ခုကို ရွေးပြီး **Find nearby** နှိပ်လျှင် live search လုပ်သည်။
- Cloud admin/config/footer/payment links မပြောင်းပါ။ ရှိပြီးသား Firestore listings နှင့် notes မဖျက်ပါ။

### အရင် version တင်ပြီးသူအတွက်

ZIP အသစ်တစ်ခုလုံးကို folder အသစ်ဖြည်ပြီး `foodfinder-mm` အတွက်:

```sh
firebase deploy --only hosting,firestore:rules --project foodfinder-mm
```

v1.2 menu fields အတွက် Firestore rules ကိုပါ ထပ်တင်ရပါမည်။ Indexes မပြောင်းပါ။ မလုပ်ရသေးလျှင် အထက်ရှိ full setup အတိုင်း လုပ်ပါ။ တင်ပြီးနောက် browser ကို reload လုပ်ပါ။ ချက်ချင်းအသစ်မပေါ်လျှင် hard refresh လုပ်ပါ။ Live deploy ကို ဤပြင်ဆင်မှုအတွင်း မလုပ်ထားပါ။


## အဆင်သင့်ပါဝင်တာများ

- USA မြို့/မြို့ငယ် ၂၁,၇၈၅ အပါအဝင် နေရာ ၅၂,၅၃၀ကို မြို့/နိုင်ငံနာမည်ဖြင့် ရွေးနိုင်သည်။ မြို့အချို့ကို ဒေသအမည်နှင့် ခွဲခြားပြသည်။ မြို့ငယ်အားလုံးတော့ မပါပါ။
- Outer Banks မြို့ ၉ ခုနှင့် ရန်ကုန်၊ မန္တလေး၊ ဘန်ကောက်၊ စင်ကာပူ၊ တိုကျို၊ လန်ဒန်၊ နယူးယောက်၊ ဆစ်ဒနီမှ ဆိုင်စာရင်း entry ၂,၈၃၁ ခုကို စတင်ကြည့်နိုင်သည်။ ဤအချက်အလက်သည် 2026-10-06 တွင် ရယူထားသော OpenStreetMap snapshot ဖြစ်ပြီး မြို့တစ်မြို့လုံး၏ ဆိုင်အားလုံး မဟုတ်ပါ။
- Restaurants / Cafés & tea / Quick bites / Bakeries & sweets အုပ်စုများ၊ နာမည်နှင့် cuisine ရှာခြင်း၊ နှလုံးပုံဖြင့် save၊ မြေပုံနှင့် လမ်းညွှန် ပါသည်။
- Coffee $5 / Burger $10 / Big meal $15 / Donation–charity Stripe links၊ Made by MM ♥ နှင့် အလိုအလျောက်နှစ်၊ English Privacy / Terms ပါသည်။
- Admin က website မရှိသောဆိုင်ကိုလည်း လိပ်စာနှင့် coordinates ဖြင့် ထည့်နိုင်သည်။ ဓာတ်ပုံ၊ ဖုန်း၊ ဖွင့်ချိန်၊ description ထည့်နိုင်သည်။
- Google Places paid API၊ Cloud Functions၊ Firebase Storage၊ Google Analytics မသုံးပါ။

## ၁။ မှန်ကန်သော Firebase project

ဒီ version သည် **foodfinder-mm** အတွက် ဖြစ်သည်။ သင်ပေးသော Firebase Web config ကို `public/config.json` တွင် ချိတ်ထားပြီး `.firebaserc` ကိုလည်း ပြောင်းထားသည်။ ZIP အဟောင်းထဲက `foodfinder-bf2dc` ကို deploy မလုပ်ပါနှင့်။

ZIP ဖြည်ပြီး **foodfinder-free** folder တစ်ခုလုံးကို VS Code → Open Folder ဖြင့် ဖွင့်ပါ။ `firebase.json` နဲ့ `public` folder ရှိတဲ့နေရာက project root ပါ။ ဖိုင်အနည်းငယ်ကိုသာ ZIP အဟောင်းပေါ် ထပ်ကူးခြင်းထက် folder အသစ်အတိုင်း သုံးပါ။

## ၂။ Console မှာ တစ်ကြိမ်လုပ်ရန်

[Firebase Console](https://console.firebase.google.com/) → **foodfinder-mm** ကို ရွေးပါ။

1. **Authentication → Sign-in method → Google → Enable** လုပ်ပါ။
2. Authorized domains မှာ `foodfinder-mm.web.app`၊ `foodfinder-mm.firebaseapp.com` ပါကြောင်း စစ်ပါ။ ကိုယ်ပိုင် domain သုံးလျှင် ထပ်ထည့်ပါ။ Local Google sign-in စမ်းမည်ဆိုလျှင် `localhost` ကို သီးခြားထည့်ရနိုင်သည်။
3. **Firestore Database → Create database → Standard edition → Production mode** ဖြင့် `(default)` database ဖန်တီးပါ။ Database ရှိပြီးသားဆို ပြန်မဖန်တီးပါနှင့်။
4. Billing plan ကို **Spark** အတိုင်းထားပါ။ Storage bucket / Cloud Functions / Blaze upgrade မလိုပါ။
5. Google sign-in consent screen မှာ public support email တောင်းလျှင် public အတွက် သီးသန့်လိပ်စာသုံးပါ။ ကိုယ်ပိုင် admin email မပေါ်စေချင်ရင် OAuth branding/support settings ကိုလည်း စစ်ရပါမယ်။ ဆိုက် code က အဲဒီ Google settings ကို အလိုအလျောက်ပြင်မပေးနိုင်ပါ။

Console settings၊ အကောင့်ပိုင်ရှင်ဖြစ်ကြောင်း၊ production Google login တို့ကို ဤ ZIP ပြင်ဆင်စဉ် ပြောင်းလဲ/ဝင်ရောက်စမ်းသပ်ထားခြင်း မရှိပါ။

## ၃။ Deploy

Node.js 24 LTS နှင့် Firebase CLI ရှိလျှင် VS Code terminal မှာ:

```sh
firebase login
firebase use foodfinder-mm
firebase deploy --only firestore:rules,firestore:indexes,hosting --project foodfinder-mm
```

CLI မရှိသေးလျှင်:

```sh
npm install -g firebase-tools
```

`firebase init` ပြန်လုပ်စရာမလိုပါ။ ပါပြီးသား rules/config ကို overwrite မလုပ်ပါနှင့်။ Static site ဖြစ်သဖြင့် `npm run build` မလိုပါ။ Deploy ပြီးရင် [FoodFinder](https://foodfinder-mm.web.app/) ကို ဖွင့်နိုင်ပါမယ်။ Firestore index build မပြီးသေးလျှင် မိနစ်အနည်းငယ်စောင့်ပြီး reload လုပ်ပါ။

Deploy လုပ်ခြင်းသည် ဤ project ရဲ့ hosting နှင့် Firestore rules ကို အစားထိုးမည်ဖြစ်သည်။ တခြား app က ဒီ Firebase project ကို မျှဝေသုံးနေပါက ထို app collections အတွက် rule များကို အရင်ပေါင်းစပ်ပါ။ ပါသော rules သည် `ff_*` collections အပြင်ဘက်အားလုံးကို ပိတ်ထားသည်။

## ၄။ သာမန်အသုံးပြုသူအတွက်

- စဖွင့်သည်နှင့် Outer Banks starter စာရင်းပေါ်မည်။ အောက်က မြို့ shortcut များကို နှိပ်နိုင်သည်။
- **Choose your city** → မြို့/နိုင်ငံကို ရိုက် → ရွေးပါ။ စတင်စာရင်းမရှိသောမြို့ဆို အခမဲ့ OpenStreetMap/Overpass မှ ရှာပေးသည်။
- **Find nearby** မှာ KDH / Kitty Hawk / OBX လို နေရာနာမည်ကိုလည်း ရှာနိုင်သည်။ NC ရိုက်လျှင် North Carolina မြို့ရွေးစရာပြမည်။ ရိုက်နေချိန်တွင် လက်ရှိစာရင်းကို filter လုပ်ပြီး Find nearby နှိပ်ချိန်တွင် အစားအသောက်အမည်၊ English/မြန်မာ aliases နှင့် ဆက်စပ် cuisine များကို အနီးပတ်ဝန်းကျင်တွင် live ရှာသည်။ ဆိုင်တိုင်းမှာ menu/dish tags မပါသဖြင့် မုန့်အမည်တစ်ခု ရှာလို့ မတွေ့ခြင်းသည် ထိုမြို့မှာ မရှိဟု မဆိုလိုပါ။
- **Find nearby** → ရွေးထားသောတည်နေရာမှ 5 / 10 / 25 km ပတ်ဝန်းကျင် mapped places အများဆုံး 300 ကို ပြန်ရှာသည်။ မြို့တစ်မြို့လုံး မဟုတ်ပါ။ ဆိုင်များသောနေရာ၌ result cap ကို ဖော်ပြသည်။
- **Near me** → location ခွင့်ပြုမှ အနီးတဝိုက်ကို ရှာမည်။ Search center coordinates ကို Overpass သို့ ပို့မည်။ မပေးလိုလျှင် မြို့ရွေးပါ။
- **♡** → ဒီ browser ပေါ်တွင် အများဆုံး 100 ဆိုင် သိမ်းထားနိုင်သည်။ အခြားစက်သို့ မကူးပါ။ 100 ကျော်လျှင် အဟောင်းဆုံးကို အစားထိုးသည်။
- **View details** → လိပ်စာ/ဖုန်း/website/ဖွင့်ချိန်/source; **Get directions** → Google Maps ပုံမှန်လင့်ခ်ဖြင့် လမ်းညွှန်။ Google Maps API key/billing မလိုပါ။
- **Map** ကို နှိပ်မှ map tiles စတင်တင်သည်။ Filtered places အများဆုံး 100 ကို map ပေါ်ပြသည်။
- Source ရှိသမျှသာပြသည်။ Live “open now”၊ မသေချာသော rating/စျေးနှုန်း/menu ကို မတီထွင်ထားပါ။ သွားမစားမီ venue ကို အတည်ပြုပါ။
- Search cache 24 နာရီအသုံးပြုသည်။ ပျက်ကွက်သော live refresh တွင် ရှိပြီးသား cache ကို အဟောင်းဖြစ်ကြောင်း အသိပေးပြီး ပြသည်။ တစ်ခါမှမဖွင့်ဖူးသောမြို့ကို internet မရှိဘဲ အပြည့်အစုံရှာလို့မရပါ။ Offline install/PWA မဟုတ်ပါ။

## ၅။ Admin

Footer → **Admin** → **Sign in with Google**။ အောက်ပါ အတည်ပြုပြီး Google account နှစ်ခုသာ server rules က ခွင့်ပြုသည်:

- `minmaung0307@gmail.com`
- `panna07@gmail.com`

Email ကို သိရုံ၊ form ထဲရိုက်ရုံဖြင့် admin မဖြစ်နိုင်ပါ။ Google အကောင့်တကယ်ဝင်နိုင်မှ ဖြစ်သည်။ Google account နှစ်ခုလုံးတွင် **2-Step Verification / passkey** ဖွင့်ပါ။ Password အစား email allowlist ထည့်ထားတာဟာ Google account ခိုးခံရမှုကို ကိုယ်တိုင်မတားနိုင်ပါ။

- **New place** → name/category/city/address/latitude/longitude ဖြည့်ပါ။ ဆိုင်တည်နေရာအစစ်ကို သုံးပါ။ City-center coordinates ကို ဆိုင်တည်နေရာအဖြစ် မသုံးပါနှင့်။
- Website မရှိလျှင် blank ထားနိုင်သည်။ ဖုန်း/လိပ်စာ/ဓာတ်ပုံ/description နဲ့ public listing ဖြစ်နိုင်သည်။
- ဓာတ်ပုံ PNG/JPG/JPEG/WebP/TIFF/plain SVG/GIF/BMP/AVIF (browser support အလိုက်) 12MB အောက် တင်နိုင်သည်။ Website သို့ပို့မတိုင်မီ WebP ~120KB အောက်သို့ စက်ပေါ်တွင် ပြောင်းသည်။ GIF သည် static cover ဖြစ်သည်။ SVG script/external content မလက်ခံပါ။
- **Draft** = admin သာ; **Published** = ရွေးထားသောမြို့တွင် public; **Archived** = public မှဖျောက်ထားသည်။ အလိုအလျောက် expiry မရှိပါ။
- Published ပြောင်းပြီးရင် visitor က reload/မြို့ပြန်ရွေးမှ တွေ့မည်။ မြို့တစ်မြို့အတွက် community listing အများဆုံး 200 ကို တင်ပေးသည်။ ပိုများလာရင် pagination/quotas ကို နောက်တစ်ဆင့်ချဲ့ပါ။
- Admin list ကို 50 စီ **Load more** ဖြင့်ကြည့်နိုင်သည်။ အခြား tab မှ ပြင်ပြီးသား entry ကို မတော်တဆ overwrite မဖြစ်အောင် revision check ပါသည်။
- 15 မိနစ်မသုံးလျှင် sign out လုပ်မည်။ Login 15 မိနစ်ကျော်သွားပြီး edit/save permission denied ဖြစ်လျှင် Sign out → Sign in ပြန်လုပ်ပါ။ Server သည် recent login ကို စစ်သည်။
- Private owner email များသည် public HTML/JS တွင် မပါပါ။ `firestore.rules` ဖိုင်ထဲမှာရှိသောကြောင့် Git repository ကို private ထားပါ။ Google OAuth screen က support email ပြခြင်းကို သီးခြားထိန်းရသည်။

## ၆။ Share a place / Contact

Visitor → Google sign-in → note → **Send for review**။ Download လုပ်ပြီး email ပို့စရာမလိုပါ။ Admin email လိပ်စာကို သိစရာမလိုပါ။

- **Admin → Private inbox → Refresh** မှာ ရောက်မည်။ **Email မပို့ပါ**။ အခမဲ့ no-server architecture ဖြစ်သောကြောင့် background email notification မပါပါ။
- Admin စစ်ဆေးပြီး New place form ဖြင့် ထည့်/Publish လုပ်ရသည်။ Suggestion က အလိုအလျောက် public မဖြစ်ပါ။
- Visitor → **My submission status** ဖြင့် pending/reviewed ကြည့်နိုင်သည်။ **Delete my note** ဖြင့် ရုပ်သိမ်းနိုင်သည်။ တစ်အကောင့် pending note တစ်ခုသာထားနိုင်သည်။
- ပြီးဆုံးသော note/privacy requests များကို manual ဖျက်ပါ။ Policy တွင် 90 ရက်အတွင်း resolved notes ရှင်းရန် ရည်ရွယ်ချက်ဖော်ပြထားပြီး automatic scheduler မပါပါ။
- Privacy request မှ user account data deletion တောင်းလျှင် သက်ဆိုင်ရာ note/listing အပြင် Firebase Authentication user record ကို Console တွင်လည်း လိုအပ်သလို ဖျက်ရသည်။
- Pending message 100 ကျော်လျှင် နောက်ဆုံး 100 ပြမည်။ ဖြေရှင်းပြီးဟောင်းများဖျက်မှ အဟောင်းများမြင်နိုင်သည်။

## ၇။ အခမဲ့သုံးရန် နှင့် ကန့်သတ်ချက်

Google Places paid API မသုံးပါ။ Firebase **Spark** quota အတွင်း ကတ်/billing မဖွင့်ဘဲ အသုံးပြုနိုင်သည်။ Public Overpass/OSM services များမှာ shared service ဖြစ်၍ အချိန်တိုင်း ရနိုင်မည်၊ unlimited ဖြစ်မည်ဟု အာမမခံနိုင်ပါ။ Browser search cooldown နှင့် cache ပါသည်။ အသုံးပြုသူများလာလျှင် provider policy နှင့် Firebase usage ကို စောင့်ကြည့်ပါ။

- [Firebase pricing](https://firebase.google.com/pricing)
- [Firestore free quota](https://firebase.google.com/docs/firestore/quotas)
- [OpenStreetMap tile usage policy](https://operations.osmfoundation.org/policies/tiles/)
- [Overpass public service information](https://wiki.openstreetmap.org/wiki/Overpass_API)

Quota ကျော်သွားလျှင် Spark မှာ ဝန်ဆောင်မှုခဏရပ်နိုင်သည်။ Blaze သို့ upgrade လုပ်ခြင်းက ငွေကုန်နိုင်သဖြင့် zero-cost ရည်ရွယ်ချက်အတွက် Spark မှာနေပါ။ Stripe donations/payment processing သည် website search cost နဲ့ မတူဘဲ merchant/provider fees ရှိနိုင်သည်။

## ၈။ Error ဖြစ်လျှင်

- **Unauthorized domain** → Google Authentication authorized domains စစ်ပါ။
- **Operation not allowed** → Google provider Enable လုပ်ပါ။
- **Permission denied** → ပါသော Firestore rules deploy ပြီးကြောင်း၊ correct admin account၊ fresh login စစ်ပါ။
- **Index setup** → `firebase deploy --only firestore:indexes --project foodfinder-mm`; build ပြီးသည်အထိစောင့်ပါ။
- **Live search busy / timeout** → starter/cache ဆက်ကြည့်၊ နောက်မှပြန်ရှာပါ။ `public/config.json` တွင် `overpassEndpoints` စာရင်းကို သင့်အသုံးပြုမှုလက်ခံသော HTTPS Overpass provider သို့ ပြောင်းနိုင်သည်။ `liveSearchEnabled:false` ဖြင့် ယာယီရပ်နိုင်သည်။
- **Cloud setup မပြီးသေး** → `cloudEnabled:false` ဖြင့် directory သီးသန့်ထားနိုင်သည်။ Contact က unavailable ဟု ရှင်းပြပြီး fake success မပြပါ။ Setup ပြီးရင် true ပြန်ထားပါ။
- **Send/save timeout** → စာမပျောက်ပါ။ Request က server တွင်နောက်ကျပြီး commit ဖြစ်နိုင်သဖြင့် status/list ကို refresh လုပ်ပြီးမှ ထပ်ပို့ပါ။

## ၉။ စစ်ဆေးမှုများ

Local browser responsive/search/map/save tests၊ mock cloud form tests၊ Firestore emulator security tests ပါသည်။ Production login၊ email notifications၊ payment transaction သို့ live deploy ကို မလုပ်ထားပါ။ အသေးစိတ် `TEST-REPORT.md` တွင်ရှိသည်။

```sh
npm install
npm test
npm run test:rules
```

Rules tests အတွက် Java 21+ လိုသည်။ `npm start` ဖြင့် local preview `http://localhost:8080` ဖွင့်နိုင်သည်။ Browser test files တွေကို run ရန် Playwright နှင့် Chrome/Chromium လိုသည်။

## ၁၀။ ဖိုင်တွေ

- `public/` — deploy လုပ်မည့်ဆိုက်
- `firestore.rules` / `firestore.indexes.json` — လုံခြုံရေးနှင့် database indexes
- `public/config.json` — public web config/provider settings; admin password မဟုတ်ပါ
- `.firebaserc` / `firebase.json` — correct Firebase project နှင့် hosting
- `data-sources/` — original open-data extracts; public မတင်ပါ
- `legacy/original-public/` — အရင် app ကို reference အဖြစ်သာ ထိန်းထားသည်။ Paid Maps script ပါသောကြောင့် ဒီ folder ကို hosting မလုပ်ပါနှင့်
- `DATA-LICENSE.md` — attribution၊ license၊ snapshot date
- `.gitignore` — dependencies/cache/logs/private credential files မတင်ရန်; ရှိပြီးသား Git-tracked file ကို အလိုအလျောက်မဖယ်ပါ
