# FoodFinder v1.11

Topbar menu ကို padding ပါသော အရောင်နု pill ပုံစံ ပြင်ထားသည်။ Active သည် sage အရောင်နု၊ hover သည် peach အရောင်နု ဖြစ်သည်။ Mobile icon buttons ဆက်ပါသည်။

ဆိုင်ပုံကို object-fit:contain ဖြင့် မဖြတ်ဘဲ အပြည့်ပြသည်။ ပုံအချိုးမတူလျှင် ဘေး/အပေါ်အောက် နေရာလွတ်ရှိနိုင်သည်။ အရင် image rotation ကိုလည်း ဖြုတ်ထားသည်။

Website ပုံချိတ်ထားမှုကို ဆိုင် 7 ဆိုင် (OSM IDs 8 ခု) အထိတိုးထားသည်: Hurricane Mo’s, Bad Bean, Black Pelican, Capt’n Franks, Art’s Place, Barefoot Bernie’s, Chilli Peppers။ `public/data/venue-photos.json` တွင် မူရင်း source links ပါသည်။ ထို့ပြင် OSM record ၏ image URL ပါလျှင်လည်း result card တွင် ပြနိုင်သည်။ Bundled starter records 16 ခုတွင် image URL ပါရှိသည်။ Admin cover uploads ကိုလည်း ဆက်ပြသည်။

ပုံသုံးပုံကန့်သတ်ထားခြင်း မရှိပါ။ သို့သော် ဆိုင်စာရင်းတိုင်းမှာ ပုံလင့်ခ်မပါသောကြောင့် ဆိုင်အားလုံးမှာ actual photo ရမည်ဟု မဆိုလိုပါ။ မရသောပုံ/မပါသောပုံမှာ illustration ပြန်ပြသည်။ မူရင်း website URL များကို တိုက်ရိုက်သုံးပြီး ပုံဖိုင်မကူးထားပါ။ Source links ကိုကတ်မှာပြသည်။ ဆိုင်ပုံမမှန်သော stock ပုံများဖြင့် မဖြည့်ထားပါ။

```sh
firebase deploy --only hosting --project foodfinder-mm
```

Live deploy မလုပ်ထားပါ။ တင်ပြီး hard refresh လုပ်ပါ။
