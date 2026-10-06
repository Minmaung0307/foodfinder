# FoodFinder v1.4 — ရှင်းလင်းထားသော ရှာဖွေမှု

1. မိုင် 3 / 5 / 10 / 20 / 50 / 100 ရွေးပြီး **Near me** နှိပ်ပါ။ Browser ၏ တည်နေရာခွင့်ပြုချက်ကို ခွင့်ပြုပါ။ တည်နေရာမပေးလိုလျှင် **Choose a town** ကိုသုံးနိုင်သည်။
2. ဆိုင်စာရင်းရလာလျှင် **Cuisine** ဖြင့် စစ်ထုတ်နိုင်သည်။
3. **ဆိုင်နာမည် သို့မဟုတ် အစားအသောက်နာမည်** ရိုက်၍ အဲဒီစာရင်းထဲမှာ ထပ်ရှာနိုင်သည်။ နာမည်ပြောင်းတိုင်း အွန်လိုင်း request ထပ်မတောင်းပါ။

အရင် “Outer Banks · US” သည် လက်ရှိတည်နေရာကို အလိုအလျောက်သိခြင်း မဟုတ်ပါ။ စတင်ပြသရန် ထည့်ထားသောနေရာဖြစ်ပြီး ယခုဖြုတ်ထားသည်။ ဆိုက်စဖွင့်ချိန်တွင် နေရာမရွေးထားပါ။ အစားအသောက် chips၊ မြို့ shortcut များ၊ category ကတ်များ၊ အပေါ်ကနေရာနာမည် badge နှင့် Near me ရဲ့ အကွက်နောက်ခံ/ဘော်ဒါကို ဖယ်ထားသည်။

`hotpot / hot pot`, `briyani / biryani`, `ထမင်း / rice` အမည်ကွဲများကို ချိတ်ထားသည်။ ဆိုင်မီနူးအားလုံး မရှိသဖြင့် related cuisine ကို ဟင်းရရှိမှုအတည်ပြုချက်အဖြစ် မသုံးပါ။ ဆိုင်ကို အတည်ပြုပြီးမှ သွားပါ။

မိုင် 100 ရွေးရုံဖြင့် public search ဝန်ဆောင်မှု ပျက်ကွက်မှု သို့မဟုတ် မီနူးအချက်အလက်မရှိမှုကို မဖြေရှင်းနိုင်ပါ။ Area တစ်ခုလျှင် mapped records အများဆုံး 2,000 ယူသည်၊ စာရင်းအပြည့်/အနီးဆုံး 2,000 ဟု အာမမခံပါ။ စာရင်းယူမရလျှင် “The area list could not load” ပြပြီး Google Maps လင့်ခ်မှ ဆက်ရှာနိုင်သည်။ သက်ဆိုင်ရာတည်နေရာအနီးရှိ starter/cache အချက်အလက်ကိုသာ fallback အဖြစ် ဆက်သုံးနိုင်သည်။

## Update

ZIP ဖြည်ထားသော project folder မှာ:

```sh
firebase deploy --only hosting --project foodfinder-mm
```

v1.2/v1.3 menu fields rules မတင်ရသေးလျှင်:

```sh
firebase deploy --only hosting,firestore:rules --project foodfinder-mm
```

ဒီ version မှာ database rules မပြောင်းပါ၊ လက်ရှိ database records မဖျက်ပါ။ တင်ပြီး browser hard refresh လုပ်ပါ။ Live deployment ကို ဤအလုပ်တွင် မလုပ်ထားပါ။ Admin၊ private inbox၊ saved places၊ directions၊ support links၊ privacy နှင့် terms ဆက်ပါဝင်သည်။
