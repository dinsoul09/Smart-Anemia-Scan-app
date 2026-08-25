# ProofPilot Venture Validation — Smart Anemia Scan

**Run:** mode `coach` · stage `validate` · domains `web2 + ai_app + data_ml` · venture_type `startup` (assumed) · program_context `none` · sensitivity `public`
**Lenses applied:** `startup`, `web2`, `ai_app`
**Date of research:** 2026-08-25

---

## 1. Idea, restated

A mobile app (Expo/React Native, own `.NET`-style REST backend at `api-anemiascan.ru`) that lets a user photograph their eye/lower eyelid with the phone camera or gallery, sends the image to a proprietary ML model, and returns an anemia prediction — positioned as a needle-free alternative to a blood test.

**Assumptions I'm making because they weren't stated and I didn't ask:** target market is Kazakhstan/CIS (Russian-domain backend, your location), venture type is an independent startup (not a class project or hackathon entry), and there's no accelerator/grant deadline driving this. Flag if any of that's wrong — it changes the plan.

## 2. Customer hypothesis (unverified)

Implied customer: someone who suspects iron-deficiency anemia (commonly women of reproductive age, parents of young children, or people already told by a doctor to "watch their hemoglobin") and wants a faster/cheaper/less unpleasant check than a clinic blood draw.

**This hypothesis has zero direct evidence behind it right now.** Nothing in the repo (no analytics, no interview notes, no waitlist) shows anyone has confirmed this job-to-be-done, this urgency, or this willingness-to-use with a real user. That's the first gap to close, not the last.

## 3. Alternatives and competitors

### Direct competitors (same wedge: phone photo → AI → anemia signal, no blood draw)

- **Monere / "NiADA" (Monere for Public Health)** — Lehi, Utah. Photographs the **lower inner eyelid** (identical body site to your app), AI-estimates hemoglobin in seconds, explicitly targets women of reproductive age, parents of infants, and seniors — i.e. your exact hypothesized customer. Backed by a real-world implementation study published in *PNAS* (2026). This is the closest one-to-one competitor I found. [Monere for Public Health – Google Play](https://play.google.com/store/apps/details?id=ai.monere.niada&hl=en_US), [PNAS real-world implementation study](https://www.pnas.org/doi/10.1073/pnas.2424677122)
- **Sanguina / AnemoCheck** — Atlanta, GA. The best-funded player in this space ($2.8M Series A, 2023). Started in 2020 as a free camera-only app analyzing a **fingernail** photo (AnemoCheck Mobile). By 2024 the company shipped **AnemoCheck Home**, which is FDA-cleared — but it is a **fingerstick blood + color-card kit**, not a camera-only prediction. That pivot is itself evidence: the market leader with the most capital and the most clinical validation moved *away* from pure computer-vision diagnosis toward an invasive-but-cleared method to get regulatory clearance and clinical-grade accuracy. Their app-only product still explicitly markets as "screening," not diagnosis. [Sanguina raises $2.8M Series A](https://www.businesswire.com/news/home/20230725980200/en/Sanguina-Raises-%242.8M-in-Series-A-Funding-to-Drive-Innovation-in-Home-Based-Testing-and-Wellness-Management), [FDA clearance announcement — AnemoCheck Home](https://sanguina.com/blogs/news/fda-anemocheckhome-clearance), [Fast Company on AnemoCheck Mobile](https://www.fastcompany.com/90587816/do-i-have-anemia-anemocheck-app)
- **AnemoScan** (ID Tech Solutions, Dhaka) — near-identical pitch to yours: photograph the eye, AI classification, confidence score, estimated hemoglobin. Useful as a cautionary comp, not a threat: **1.2★ over 11 reviews**, ~1,000 downloads, users reporting inconsistent results. This is what "ship the model with no differentiation, no calibration story, no credibility signal" looks like in the market today. [AnemoScan – Google Play](https://play.google.com/store/apps/details?id=com.shihab.anemiapp&hl=en_US)
- **HemoQR** and **Hemosense** — additional camera-based hemoglobin-estimate apps on Google Play/App Store. I confirmed they exist and are positioned in the same space; I could not pull their method or traction details (one fetch was rate-limited) — treat as **not fully checked**, not as absent.

### Academic prototypes validating the core technical idea (not shipped products, but proof the approach is a known research area, not a novel insight)

HemaApp (University of Washington), and at least five 2023–2025 peer-reviewed papers specifically on **conjunctiva-image** anemia classification (PLOS One, ScienceDirect, IEEE, *Scientific Reports* ViT model). This is good news and bad news at once: the underlying computer-vision approach is scientifically legitimate, but it also means you're entering a crowded research niche with no single dominant, commercially proven method yet — the field itself hasn't converged on "this works reliably enough to ship."

### Substitutes

- **Hardware non-invasive hemoglobinometers**: Masimo Pronto/Rad-67 (pulse CO-oximetry, hospital-grade, expensive, requires a finger probe — not a phone), TrueHb (India, dedicated home device, not phone-camera-only), Biosense ToucHb. These generally beat camera-only accuracy but require the user to buy a separate device.
- **Do nothing / status quo**: a standard CBC blood test at a clinic or lab. In most CIS healthcare systems this is inexpensive and routine, especially for the pregnant-women and young-children segments where anemia screening is already part of standard care. This is the alternative your app has to beat on convenience, not just on avoiding a needle.

## 4. Evidence map — does the core technical claim hold up?

This is the evidence that most changes the decision, so it's not buried:

| Claim | Evidence | Source | Type | Stance |
|---|---|---|---|---|
| Real-time conjunctiva-photo anemia prediction reaches ~75% overall accuracy, but sensitivity for mild/moderate anemia (the bulk of real cases) is only ~25–58% | n=426, prospective smartphone conjunctiva study, 2026 | [PLOS One, real-time conjunctival prediction](https://journals.plos.org/plosone/article?id=10.1371%2Fjournal.pone.0302883) | primary_current | contradicts easy "go" |
| The same study hits 94–96% specificity and AUC 0.90–0.92 **only** for severe anemia (<7–9 g/dL) — i.e. it's good at flagging emergencies, weak at catching the common mild cases people would actually use the app for | same study | same | primary_current | contradicts |
| Best published fingernail-photo method (uncalibrated, the science behind Sanguina) hits sensitivity 97% / specificity 76%, AUC 0.88, n=337 across studies | Nature Communications 2018 | [Nature Communications, patient-sourced photos](https://www.nature.com/articles/s41467-018-07262-2) | primary_current | mixed — supports feasibility as a *screening* tool, contradicts feasibility as a *diagnostic* tool |
| The best-funded direct competitor needed a fingerstick component to reach FDA clearance; their camera-only product remains non-diagnostic | Sanguina FDA announcement + company history | [sanguina.com](https://sanguina.com/blogs/news/fda-anemocheckhome-clearance) | primary_current | contradicts "camera alone is enough" |
| Anemia software/apps that output a health claim from a photo generally fall under FDA "device software function" oversight in the US; low-risk wellness apps stay exempt only by disclaiming diagnosis | FDA policy page | [FDA — Device Software Functions](https://www.fda.gov/medical-devices/digital-health-center-excellence/device-software-functions-including-mobile-medical-applications) | primary_current | neutral, but sets the regulatory floor |
| Kazakhstan has an active, paid medical-device/software registration regime that multiple local consultancies specialize in | Multiple KZ registration-service sites | e.g. [med-consult.kz](https://med-consult.kz/), [blitzmed.com](https://blitzmed.com/registraciya-medicinskih-izdeliy-v-kazahstane/) | primary_current | neutral — confirms a real regulatory path exists, cost/timeline not yet checked |
| A near-identical shipped competitor (AnemoScan) scores 1.2★ with users reporting inconsistent results | Google Play listing | [AnemoScan – Google Play](https://play.google.com/store/apps/details?id=com.shihab.anemiapp&hl=en_US) | primary_current | contradicts — market has already tried "just ship it" and users rejected it |

**Not checked / unavailable:** your model's own accuracy numbers (not present in the code I reviewed — `anemiaApi.ts` just posts an image and returns whatever the backend sends, no validation metrics anywhere in the repo), your business model or pricing (nothing in the app suggests one), Kazakhstan-specific anemia prevalence figures with a number I could confidently cite (I found the topic is actively researched in KZ literature but didn't pull a verified statistic — do not let me or anyone hand you a made-up percentage here), and HemoQR/Hemosense's exact methods (rate-limited).

**What I will not do:** treat "no discovered competitor doing exactly your feature list" as evidence of an open market — it isn't, and it's also not true here; Monere is close to a direct clone of the concept.

## 5. Riskiest assumptions, ranked

1. **Your model's accuracy is unproven to you, let alone to a user.** The published literature on this exact technique (conjunctiva photo → hemoglobin) tops out around 75% overall accuracy with weak sensitivity for the common mild/moderate cases. If your model hasn't been validated against lab-drawn hemoglobin on a real sample, you don't know if you're shipping something better or worse than that ceiling — and the app currently has no way to show a user its confidence or its limitations.
2. **A funded, published, identically-positioned competitor (Monere) already exists** targeting your exact customer and your exact body site. "Nobody else does eyelid scanning" is not available to you as a differentiation claim.
3. **The cheap failure mode has already played out publicly**: AnemoScan shipped the same idea with no differentiation and got a 1.2-star rating. That's not hypothetical risk, that's a comp.
4. **No stated regulatory position.** Every serious competitor explicitly frames itself as "not a diagnosis" / wellness screening to stay out of formal medical-device regulation, or goes through FDA clearance (which required them to stop being camera-only). Kazakhstan has its own device-registration regime. If this app makes or implies a diagnostic claim without picking one of these two paths deliberately, that's a legal exposure, not just a positioning nuance.
5. **No visible business model or distribution plan** in the current build — no pricing screen, no clinic/pharmacy partnership hooks, no acquisition channel defined.

## 6. Smallest test that would change the decision

Do not build more scan/UI polish next. Before writing another screen:

- **Validate the model, not the app.** Get 50–100 photos with paired lab hemoglobin values (partner with one clinic/lab in your target city — this is a data-access problem, not an engineering problem) and compute real sensitivity/specificity against WHO thresholds. Compare against the 75%/AUC-0.76 conjunctiva benchmark above. If you can't clear that bar, the product doesn't have a claim to make yet.
- **Run 10–15 structured problem interviews** with your hypothesized customer segment (pregnant women, parents of young children, or people already flagged as anemic by a clinic) in your target city. Ask what they currently do, how often, what it costs, and whether a phone-based screen would change their behavior — not whether they like the idea.
- **Decide your regulatory lane on purpose**: either position explicitly as a non-diagnostic wellness screening tool (like Monere/AnemoScan do) and say so in the app, or start the Kazakhstan device-registration conversation now, before more engineering investment.

**Threshold:** if the clinic-validated sensitivity for mild/moderate anemia (the common case) comes in materially below the ~58% ceiling seen in the best published conjunctiva study, or if interviews show people already get free/cheap CBC screening through routine prenatal or pediatric care in your target market, that's a kill signal for the current wedge, not a reason to add more features.

## 7. Verdict: **pivot**

Not "stop" — the underlying job (avoid a needle to get a rough anemia read) is real and evidenced by a genuine, active research field and one funded competitor with real traction. But "go" isn't supported either: you already have working camera/upload/backend plumbing, so the risk isn't "can we build this," it's that you're currently building an undifferentiated clone of a niche two funded/published teams already occupy, with no evidence your model clears the accuracy bar the field's best public results barely clear, and a public example of the exact same idea failing on user trust when shipped without differentiation.

**Concretely: pivot on the wedge, not the technology.** Keep the computer-vision core, but before more feature work, pick one of: (a) a specific underserved population or distribution channel in Kazakhstan/CIS that Monere and Sanguina aren't serving (neither is localized for this market or partnered with local clinics/pharmacies), (b) a personalization/calibration loop like the Nature Communications study shows meaningfully improves accuracy (±0.92 g/dL vs ±2.4 g/dL uncalibrated) — repeat users, not one-shot strangers, or (c) integration into an existing care pathway (antenatal clinics, school health checks) rather than a standalone consumer app competing for App Store attention against a 1.2-star cautionary tale.

What would move this to `go`: real clinic-validated accuracy numbers at or above the published ceiling for mild/moderate anemia, a named distribution channel with a warm intro already in motion, and an explicit decision on regulatory framing.

---

### Sources checked
[Monere for Public Health – Google Play](https://play.google.com/store/apps/details?id=ai.monere.niada&hl=en_US) · [PNAS real-world implementation](https://www.pnas.org/doi/10.1073/pnas.2424677122) · [Sanguina $2.8M Series A](https://www.businesswire.com/news/home/20230725980200/en/Sanguina-Raises-%242.8M-in-Series-A-Funding-to-Drive-Innovation-in-Home-Based-Testing-and-Wellness-Management) · [Sanguina FDA clearance — AnemoCheck Home](https://sanguina.com/blogs/news/fda-anemocheckhome-clearance) · [Fast Company on AnemoCheck Mobile](https://www.fastcompany.com/90587816/do-i-have-anemia-anemocheck-app) · [AnemoScan – Google Play](https://play.google.com/store/apps/details?id=com.shihab.anemiapp&hl=en_US) · [PLOS One real-time conjunctival prediction](https://journals.plos.org/plosone/article?id=10.1371%2Fjournal.pone.0302883) · [Nature Communications, patient-sourced photos](https://www.nature.com/articles/s41467-018-07262-2) · [FDA — Device Software Functions](https://www.fda.gov/medical-devices/digital-health-center-excellence/device-software-functions-including-mobile-medical-applications) · [med-consult.kz — KZ device registration](https://med-consult.kz/) · [blitzmed.com — KZ device registration](https://blitzmed.com/registraciya-medicinskih-izdeliy-v-kazahstane/)

### Sources not checked / unavailable
HemoQR and Hemosense app details (rate-limited fetch); your backend model's own validation metrics (not present in the repo); a sourced, current Kazakhstan anemia-prevalence percentage (search surfaced relevant KZ academic literature but I did not extract a verified figure — don't let this get filled in with an invented number later).

---
*Analysis produced using the routing and evidence rules from the [ProofPilot](https://github.com/Marakaya/proofpilot) skill (venture-validation workflow), applied ad hoc since the skill isn't installed in this environment.*
