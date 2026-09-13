# फेफना 360 — Facebook Live Poll

यह package Facebook पर सीधे image के अंदर clickable voting नहीं बनाता। Facebook पोस्ट में एक image के pixels interactive नहीं होते। इसके बजाय यह एक mobile-friendly web poll है:

1. Supabase में free project बनाइए.
2. SQL Editor में `supabase.sql` पूरा SQL चलाइए.
3. Authentication में Anonymous Sign-ins enable कीजिए.
4. Project Settings → API से Project URL और anon/public key लेकर `app.js` में डालिए.
5. पूरे folder को GitHub Pages, Netlify या Cloudflare Pages पर host कीजिए.
6. मिलने वाले public URL को Facebook पोस्ट में डालिए. QR code भी उसी URL का बनेगा.
7. हर visitor candidate पर tap कर सकता है और aggregate percentage live दिखेगा.

## Candidate list
The candidate names/details in the page are transcribed from the text supplied with the source image. Verify spellings, descriptions and party labels before publishing. This is an independent community poll, not an official election result.

## Important limitation
The setup uses anonymous authentication and one vote per anonymous account/browser session. It is not a legally audited election system and can be manipulated by determined attackers. For a public Facebook opinion poll, use the displayed results as an informal survey only.
