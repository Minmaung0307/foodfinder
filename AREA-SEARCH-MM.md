# FoodFinder v1.3 — နေရာအရင်ရွေး၊ ဆိုင်စာရင်းထဲမှာ ထပ်ရှာ

## အသုံးပြုနည်း

1. **Use my location / Near me** ကိုနှိပ်ပြီး တည်နေရာခွင့်ပြုပါ။ မပေးလိုလျှင် **Choose a town** မှ Nashville, KDH, Kitty Hawk စသည် ရွေးပါ။ NC ဆိုလျှင် ပြည်နယ်အတွင်း မြို့ကိုဆက်ရွေးပါ။ မြို့ရွေးထားလျှင် အကွာအဝေးကို မြို့လယ်မှ တိုင်းသည်။
2. **3 / 5 / 10 / 20 / 50 / 100 miles** ရွေးပါ။ တည်နေရာ သို့မဟုတ် မိုင်ပြောင်းသည့်အခါ ဆိုင်စာရင်းယူသည်။ **Load places in this area** ဖြင့်လည်း ပြန်ယူနိုင်သည်။ သိမ်းထားသော collection ရှိလျှင် 24 နာရီအတွင်း ပြန်သုံးသည်။
3. ဆိုင်စာရင်းရပြီးမှ အစားအသောက်နာမည် **pizza၊ မုန့်တီ၊ မုန့်ဟင်းခါး၊ ဒန်ပေါက်၊ ကော်ဖီ** သို့မဟုတ် **ဆိုင်နာမည်** ရိုက်ပါ။ ရိုက်သည့်အတိုင်း ထိုစာရင်းထဲတွင် ချက်ချင်းစစ်ထုတ်သည်။ **Filter places** ကိုလည်းနှိပ်နိုင်သည်။ နာမည်ပြောင်းတိုင်း API ထပ်မခေါ်ပါ။
4. လိုလျှင် **Cuisine** မှ Indian, Chinese, Thai, Burmese, Italian, Japanese, American, Mexican, Vietnamese, Korean ရွေးပါ။ Cuisine မဖော်ပြထားသောဆိုင်များအတွက် **Cuisine not listed** ရှိသည်။ Category, cuisine, food/name စစ်ထုတ်မှုများ ပေါင်းလုပ်သည်။
5. **Reset filters** သည် food/category/cuisine filters ဖယ်ပေးပြီး ရွေးထားသောနေရာကို မပြောင်းပါ။ **View details / Get directions** ဖြင့် ဆိုင်နှင့်လမ်းညွှန်ကိုကြည့်ပါ။

ဥပမာ Nashville မှာ pizza ရှာမည်ဆို **Choose a town → Nashville, Tennessee → စာရင်းတင်ပြီးသည်အထိစောင့် → pizza** ဟုရိုက်ပါ။ Search box သည် food/name filter ဖြစ်ပြီး မြို့ရှာရန် dedicated town picker ကိုသုံးပါ။

## ရလဒ်နှင့် ကန့်သတ်ချက်

**Loaded places** သည် လက်ရှိရရှိထားသောဆိုင်စာရင်းအရေအတွက်၊ **match your filters** သည် အဲဒီစာရင်းထဲမှ လက်ရှိကိုက်ညီသည့်အရေအတွက် ဖြစ်သည်။ အနီးဆုံးမှစီသည်၊ အကွာအဝေးသည် မျဉ်းဖြောင့်ဖြစ်ပြီး ကားမောင်းအကွာအဝေးမဟုတ်ပါ။

OpenStreetMap တွင် ဆိုင်အားလုံးနှင့် မီနူးအားလုံးမရှိပါ။ **Related cuisine** ဆိုလျှင် ရှာသောဟင်း ရမရ မေးကြည့်ရန်သာ ဖြစ်သည်။ အစားအသောက်ရရှိမှုကို မတီထွင်ထားပါ။ Admin က မီနူးအမည်နှင့် menu link ကို ထည့်နိုင်သည်။

Public service မရ၍ စာရင်းမရသည့်အခါ **The area list could not load** ဟုပြသည်။ “ဆိုင်မရှိ” ဟု မဆိုလိုပါ။ Starter/cache ရှိလျှင် ဆက်ပြပေးသည်။ Google Maps လင့်ခ်ဖြင့်လည်း ပြင်ပဝန်ဆောင်မှုတွင်ဆက်ရှာနိုင်သည်။ Public API အခမဲ့ဖြစ်သော်လည်း အချိန်တိုင်းရရှိမည်ဟု အာမမခံနိုင်ပါ။ ဒီပြင်ဆင်မှုသည် filter workflow ကိုပြောင်းခြင်းဖြစ်ပြီး public API outage ကို လုံးဝပျောက်စေခြင်းမဟုတ်ပါ။

မိုင် 50 / 100 အပါအဝင် area request တစ်ခုလျှင် အများဆုံး **2,000 mapped records** သာယူသည်။ ကန့်သတ်ချက်ထိလျှင် **partial collection** ဟုပြသည်။ ဤ 2,000 သည် အနီးဆုံး 2,000 ဟု အာမမခံပါ၊ ရရှိသောရလဒ်ကိုသာ အကွာအဝေးဖြင့်စီသည်။ ပိုတိကျချင်လျှင် မိုင်လျှော့ပါ။ ဒေသကြီးလေ အချက်အလက်များပြီး timeout ဖြစ်နိုင်လေဖြစ်သည်။

## Update တင်ရန်

ZIP ကို folder အသစ်ဖြည်၍ project folder ကို VS Code ဖြင့်ဖွင့်ပါ။ User ပေးထားသော foodfinder-mm config ပါပြီးဖြစ်သည်။

```sh
firebase deploy --only hosting,firestore:rules --project foodfinder-mm
```

v1.2 မှတက်လျှင် rules မပြောင်းပါ။ အရင် version က menu fields rules မတင်ရသေးလျှင် အထက်က command က အတူတင်ပေးမည်။ Database records မဖျက်ပါ။ တင်ပြီး browser hard refresh လုပ်ပါ။ Live website ကို ဤအလုပ်တွင် deploy မလုပ်ထားပါ။

Google Places paid API မသုံးပါ။ Firebase Spark quota အတွင်း အသုံးပြုနိုင်သည်။ Cache/cooldown ရှိပြီး food/name/cuisine filtering အတွက် ထပ်မံ request မသုံးပါ။ မူရင်း admin၊ private inbox၊ footer support links၊ privacy၊ terms နှင့် saved places များ ဆက်ပါဝင်သည်။
