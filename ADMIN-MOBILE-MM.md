# FoodFinder v1.9 — Mobile navbar နှင့် admin

Mobile navbar တွင် Saved places စာအစား အသဲ icon၊ Share a place စာအစား share icon ကို အလယ်ညီညီထားသည်။ Screen-reader labels ဆက်ပါသည်။ Desktop တွင် စာသားဆက်ပြသည်။ Hero ထဲက Use my location / Choose a town ခလုတ်များ ဖယ်ထားသည်။ အောက်ရှိ Near me နှင့် မိုင် dropdown ဆက်အလုပ်လုပ်သည်။ တည်နေရာခွင့်မရလျှင် empty state ထဲက Choose a town ကိုသုံးနိုင်သည်။

## Admin access denied

Google sign-in အောင်မြင်ခြင်းနှင့် Firestore admin access သည် အဆင့်နှစ်ခုဖြစ်သည်။ Screenshot တွင် sign-in ဝင်ပြီး access စစ်ဆေးမှု၌ ငြင်းထားသည်။ ပါဝင်သော rules သည် အတည်ပြုပြီး Google sign-in account `minmaung0307@gmail.com` နှင့် `panna07@gmail.com` နှစ်ခုသာ admin အဖြစ် ခွင့်ပြုသည်။ Local emulator ဖြင့် နှစ်ခုလုံးနှင့် unauthorized account rejection ကို စမ်းသပ်ထားသည်။ Live project ၏ လက်ရှိ deployed rules နှင့် live account token ကို မစစ်ထားသဖြင့် အကြောင်းရင်းအတိအကျ အတည်မပြုနိုင်ပါ။

အရင် hosting-only deploy သည် Firestore rules မတင်ပါ။ ယခု ZIP ရဲ့ project folder မှာ:

```sh
firebase deploy --only hosting,firestore:rules --project foodfinder-mm
```

Deploy အောင်မြင်ပြီး browser hard refresh လုပ်ပါ။ Admin → Sign out → approved Google account ဖြင့် ပြန်ဝင်ပါ။ Signed-in email ကိုပြထားသည်။ Rules တင်ပြီး **Check access again** ကိုနှိပ်နိုင်သည်။ မှားသော Google account ဖြစ်လျှင် **Switch Google account** ကိုသုံးပါ။ Database/inbox loading error ကို admin authorization failure နှင့် ခွဲပြထားသည်။

ဆက်ငြင်းနေပါက deployment output တွင် project foodfinder-mm နှင့် rules release အောင်မြင်မှုကိုစစ်ပါ။ Config, Firebase project, Google sign-in provider နှင့် verified email ကိုစစ်ပါ။ Rules ကို public read/write allow လုပ်၍ မဖြေရှင်းပါနှင့်။ Password/private key မပို့ပါနှင့်။ Live deploy ကို ဒီအလုပ်တွင် မလုပ်ထားပါ။

## Contact / corrections

ဆိုင်အသစ်ထည့်ပေးရန် သို့မဟုတ် ဆိုင်လိပ်စာ၊ ဖုန်း၊ website၊ အခြားအချက်အလက် ပြင်ပေးရန် အကြံပြုချက် ပို့နိုင်သည်။ အသုံးပြုသူက public listing ကို တိုက်ရိုက်မပြင်နိုင်ပါ။ Sign in လုပ်ပြီးပို့သော note သည် **Admin private inbox** ထဲရောက်သည်၊ admin email နှစ်ခုဆီ notification email ပို့ခြင်းမဟုတ်ပါ။ Admin က အချက်အလက်စစ်ပြီး community listing ကိုပြင်/ထည့်ပေးရသည်။ OpenStreetMap မူရင်း data ကိုတော့ ဒီ form က တိုက်ရိုက်မပြင်ပါ။ Mark reviewed သည် note ကိုစစ်ပြီးဟုသာ မှတ်ခြင်းဖြစ်ပြီး ဆိုင်စာရင်းကို အလိုအလျောက် မပြင်ပါ။

ဆိုင်မှာ website မရှိလည်း အကြံပြုနိုင်သည်။ Public business information သာပို့ပြီး password သို့မဟုတ် ကိုယ်ရေးလျှို့ဝှက်ချက် မပို့ပါနှင့်။
