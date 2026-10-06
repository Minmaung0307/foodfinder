# FoodFinder v1.10 — Navigation နှင့် ဆိုင်ပုံများ

All places / Saved နှင့် topbar menu တွင် active၊ hover နှင့် keyboard focus ပုံစံ ထည့်ထားသည်။ Saved → Explore ပြန်နှိပ်လျှင် nearby list ပြန်ပြသည်။ URL နှင့် browser Back/Forward ကိုပါ တူညီသော state ဖြင့် ကိုင်တွယ်ထားသည်။ All places က Saved view ကို ထွက်ပေးသည်။

## Result card ပုံများ

Admin တင်ထားသော community listing cover ကို result card မှာပါ ပြသည်။ ယခင်က detail ထဲတွင်သာ ပြခဲ့သည်။ ပုံမရှိ/တင်မရလျှင် illustration ပြန်ပြသည်။

အောက်ပါ official websites မှ ပုံ URL များကို source link နှင့် ချိတ်ထားသည် (2026-10-06 စစ်ဆေးထားသည်):

- Hurricane Mo’s — https://www.hurricanemosbeachsidebarandgrill.com/
- Bad Bean Baja Grill — https://www.badbeanobx.com/
- Black Pelican — https://www.blackpelican.com/

ပုံဖိုင်များကို ZIP ထဲကူးထည့်ထားခြင်းမဟုတ်ဘဲ source host မှ တိုက်ရိုက်တင်ပြသည်။ ပုံ၏မူပိုင်ခွင့်မှာ မူရင်းပိုင်ရှင်ထံတွင် ရှိသည်။ ပုံအကြောင်းအရာ/ရရှိနိုင်မှုသည် host ပေါ်မူတည်ပြီး ယနေ့ရိုက်ထားသောပုံဟု မဆိုလိုပါ။ ကမ္ဘာတစ်ဝန်း ဆိုင်တိုင်း၏ website ကို အလိုအလျောက် scrape လုပ်ထားခြင်းမဟုတ်ပါ။ Website ပုံ မရသောဆိုင်များမှာ illustration ဆက်ရှိမည်။

အခြားဆိုင်၏ အသုံးပြုခွင့်ရှိသောပုံ ထည့်ရန် Admin listing ကိုဖွင့်ပြီး cover upload လုပ်ပါ။ Verified website source URL များကို `public/data/venue-photos.json` တွင် OSM ID အလိုက် ထပ်ဖြည့်နိုင်သည်။ ပုံသည် ထိုဆိုင်၏ပုံမှန်ကန်ကြောင်း စစ်ဆေးပြီး source link ထည့်ပါ။ API key/billing အသစ် မလိုပါ။

## Deploy

```sh
firebase deploy --only hosting --project foodfinder-mm
```

v1.9 admin rules မတင်ရသေးလျှင် hosting,firestore:rules နှစ်ခုလုံး deploy လုပ်ပါ။ ဒီ version မှာ rules မပြောင်းပါ။ Live deploy မလုပ်ထားပါ။ တင်ပြီး hard refresh လုပ်ပါ။
