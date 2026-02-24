# Guest Confirmation Email Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Send a confirmation email to the guest after submitting the RSVP form, in their language (ca/es/en).

**Architecture:** Pass `locale` from `RSVPForm` to the API. Add `sendGuestConfirmation(rsvp, locale)` in the existing API route alongside `sendRsvpNotification`. Two email variants: attending (with event summary + practical info) and not attending (brief thank-you). All copy inline as a trilingüe object.

**Tech Stack:** Resend (already installed), Next.js API Route (`src/app/api/rsvp/route.ts`), React TSX

---

### Task 1: Pass locale from RSVPForm to the API

**Files:**
- Modify: `src/components/rsvp/RSVPForm.tsx:23`

**Step 1: Destructure `locale` from props (it's already in the Props type but unused)**

In `RSVPForm.tsx`, change line 23:
```tsx
export function RSVPForm({ dict }: Props) {
```
to:
```tsx
export function RSVPForm({ dict, locale }: Props) {
```

**Step 2: Add `locale` to the fetch body**

In the `JSON.stringify({...})` block (around line 72), add after `comments`:
```tsx
locale,
```

**Step 3: Verify it builds**

```bash
npx tsc --noEmit
```
Expected: no errors

**Step 4: Commit**
```bash
git add src/components/rsvp/RSVPForm.tsx
git commit -m "feat: pass locale to RSVP API"
```

---

### Task 2: Add `locale` to the API schema and type

**Files:**
- Modify: `src/app/api/rsvp/route.ts:9-19`

**Step 1: Add locale to the zod schema**

Add after line 18 (`comments: z.string()...`):
```ts
locale: z.enum(['ca', 'es', 'en']).default('es'),
```

**Step 2: Verify it builds**
```bash
npx tsc --noEmit
```
Expected: no errors

**Step 3: Commit**
```bash
git add src/app/api/rsvp/route.ts
git commit -m "feat: add locale field to RSVP schema"
```

---

### Task 3: Add `sendGuestConfirmation` function to the API

**Files:**
- Modify: `src/app/api/rsvp/route.ts`

**Step 1: Add the trilingüe copy object and the function**

Insert this block right after the closing `}` of `sendRsvpNotification` (before `export async function POST`):

```ts
const guestEmailCopy = {
    es: {
        subject_yes: 'Confirmación recibida · Oriol & Paula · 19 septiembre',
        subject_no: 'Gracias por avisarnos · Oriol & Paula',
        greeting_yes: '¡Muchas gracias por confirmar tu asistencia!',
        greeting_no: 'Gracias por avisarnos',
        body_no: 'Lamentamos que no puedas acompañarnos, ¡te echaremos de menos! Si algo cambia antes del 31 de agosto, no dudes en escribirnos.',
        summary_title: 'Tu confirmación',
        adults: 'Adultos',
        kids: 'Niños',
        dietary: 'Restricciones alimentarias',
        staying: 'Te quedas hasta el final (22:00)',
        staying_yes: 'Sí',
        staying_no: 'Me voy antes',
        none: 'Ninguna',
        info_title: 'El día',
        date: 'Sábado 19 de septiembre de 2026 · 12:00–22:00',
        location: 'Mas Corbella, Alcover, Tarragona',
        maps_label: 'Abrir en Google Maps',
        maps_url: 'https://maps.app.goo.gl/mVVaFuXkNsY3vTh96',
        parking: 'Os enviaremos la información de parking y acceso una semana antes del evento.',
        footer: 'Con cariño, Paula & Oriol',
    },
    ca: {
        subject_yes: 'Confirmació rebuda · Oriol & Paula · 19 setembre',
        subject_no: 'Gràcies per avisar-nos · Oriol & Paula',
        greeting_yes: 'Moltes gràcies per confirmar la teva assistència!',
        greeting_no: 'Gràcies per avisar-nos',
        body_no: 'Llàstima que no puguis acompanyar-nos, t\'enyorarem! Si res canvia abans del 31 d\'agost, escriu-nos.',
        summary_title: 'La teva confirmació',
        adults: 'Adults',
        kids: 'Nens',
        dietary: 'Restriccions alimentàries',
        staying: 'Et quedes fins al final (22:00)',
        staying_yes: 'Sí',
        staying_no: 'Me\'n vaig abans',
        none: 'Cap',
        info_title: 'El dia',
        date: 'Dissabte 19 de setembre de 2026 · 12:00–22:00',
        location: 'Mas Corbella, Alcover, Tarragona',
        maps_label: 'Obrir a Google Maps',
        maps_url: 'https://maps.app.goo.gl/mVVaFuXkNsY3vTh96',
        parking: 'Us enviarem la informació d\'aparcament i accés una setmana abans de l\'esdeveniment.',
        footer: 'Amb afecte, Paula & Oriol',
    },
    en: {
        subject_yes: 'RSVP confirmed · Oriol & Paula · September 19th',
        subject_no: 'Thanks for letting us know · Oriol & Paula',
        greeting_yes: 'Thank you so much for confirming your attendance!',
        greeting_no: 'Thanks for letting us know',
        body_no: 'We\'re sorry you can\'t make it — we\'ll miss you! If anything changes before August 31st, feel free to reach out.',
        summary_title: 'Your RSVP',
        adults: 'Adults',
        kids: 'Kids',
        dietary: 'Dietary restrictions',
        staying: 'Staying until the end (22:00)',
        staying_yes: 'Yes',
        staying_no: 'Leaving earlier',
        none: 'None',
        info_title: 'The day',
        date: 'Saturday, September 19, 2026 · 12:00–22:00',
        location: 'Mas Corbella, Alcover, Tarragona',
        maps_label: 'Open in Google Maps',
        maps_url: 'https://maps.app.goo.gl/mVVaFuXkNsY3vTh96',
        parking: 'We\'ll send you parking and access details one week before the event.',
        footer: 'With love, Paula & Oriol',
    },
}

async function sendGuestConfirmation(rsvp: z.infer<typeof schema>) {
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) return

    const resend = new Resend(apiKey)
    const fromEmail = process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev'
    const locale = rsvp.locale ?? 'es'
    const t = guestEmailCopy[locale]

    let html: string

    if (rsvp.attending) {
        const summaryRows = [
            `<tr><td style="padding:8px 16px;color:#6b7280;font-size:14px;">${t.adults}</td><td style="padding:8px 16px;font-size:14px;font-weight:600;">${rsvp.adults_count}</td></tr>`,
            rsvp.kids_count > 0
                ? `<tr style="background:#f9f7f3;"><td style="padding:8px 16px;color:#6b7280;font-size:14px;">${t.kids}</td><td style="padding:8px 16px;font-size:14px;font-weight:600;">${rsvp.kids_count}</td></tr>`
                : '',
            rsvp.dietary_restrictions
                ? `<tr><td style="padding:8px 16px;color:#6b7280;font-size:14px;">${t.dietary}</td><td style="padding:8px 16px;font-size:14px;font-weight:600;">${rsvp.dietary_restrictions}</td></tr>`
                : `<tr><td style="padding:8px 16px;color:#6b7280;font-size:14px;">${t.dietary}</td><td style="padding:8px 16px;font-size:14px;color:#9ca3af;">${t.none}</td></tr>`,
            rsvp.staying_until_night !== null && rsvp.staying_until_night !== undefined
                ? `<tr style="background:#f9f7f3;"><td style="padding:8px 16px;color:#6b7280;font-size:14px;">${t.staying}</td><td style="padding:8px 16px;font-size:14px;font-weight:600;">${rsvp.staying_until_night ? t.staying_yes : t.staying_no}</td></tr>`
                : '',
        ].join('')

        html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="font-family:Georgia,serif;background:#F6F2EC;margin:0;padding:24px;">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
    <div style="background:#5E6B3C;padding:24px 32px;">
      <h1 style="color:#fff;margin:0;font-size:22px;">Paula &amp; Oriol · 19.09.2026</h1>
    </div>
    <div style="padding:28px 32px;">
      <p style="font-size:17px;color:#374151;margin:0 0 8px;">Hola ${rsvp.name},</p>
      <p style="font-size:15px;color:#5E6B3C;font-weight:600;margin:0 0 24px;">✅ ${t.greeting_yes}</p>

      <h2 style="color:#5E6B3C;font-size:15px;margin:0 0 12px;">${t.summary_title}</h2>
      <table style="width:100%;border-collapse:collapse;border-radius:8px;overflow:hidden;background:#fff;border:1px solid #e5e7eb;">
        <tbody>${summaryRows}</tbody>
      </table>

      <hr style="border:none;border-top:1px solid #e5e7eb;margin:28px 0;">

      <h2 style="color:#5E6B3C;font-size:15px;margin:0 0 12px;">📅 ${t.info_title}</h2>
      <p style="font-size:14px;color:#374151;margin:0 0 4px;">${t.date}</p>
      <p style="font-size:14px;color:#374151;margin:0 0 12px;">📍 ${t.location}</p>
      <p style="margin:0 0 16px;">
        <a href="${t.maps_url}" style="color:#5E6B3C;font-size:14px;">${t.maps_label}</a>
      </p>
      <p style="font-size:13px;color:#9ca3af;background:#f9f7f3;padding:12px 16px;border-radius:8px;margin:0 0 24px;">${t.parking}</p>

      <p style="font-size:14px;color:#6b7280;margin:0;">${t.footer}</p>
    </div>
    <div style="background:#f0ede6;padding:12px 32px;text-align:center;">
      <p style="color:#9ca3af;font-size:12px;margin:0;">Mas Corbella · Alcover · Tarragona</p>
    </div>
  </div>
</body></html>`
    } else {
        html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="font-family:Georgia,serif;background:#F6F2EC;margin:0;padding:24px;">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
    <div style="background:#5E6B3C;padding:24px 32px;">
      <h1 style="color:#fff;margin:0;font-size:22px;">Paula &amp; Oriol · 19.09.2026</h1>
    </div>
    <div style="padding:28px 32px;">
      <p style="font-size:17px;color:#374151;margin:0 0 8px;">Hola ${rsvp.name},</p>
      <p style="font-size:15px;color:#C4714A;font-weight:600;margin:0 0 16px;">🙏 ${t.greeting_no}</p>
      <p style="font-size:14px;color:#6b7280;margin:0 0 24px;">${t.body_no}</p>
      <p style="font-size:14px;color:#6b7280;margin:0;">${t.footer}</p>
    </div>
    <div style="background:#f0ede6;padding:12px 32px;text-align:center;">
      <p style="color:#9ca3af;font-size:12px;margin:0;">Mas Corbella · Alcover · Tarragona</p>
    </div>
  </div>
</body></html>`
    }

    await resend.emails.send({
        from: fromEmail,
        to: [rsvp.email],
        subject: rsvp.attending ? t.subject_yes : t.subject_no,
        html,
    })
}
```

**Step 2: Verify it builds**
```bash
npx tsc --noEmit
```
Expected: no errors

**Step 3: Commit**
```bash
git add src/app/api/rsvp/route.ts
git commit -m "feat: add sendGuestConfirmation with trilingüe copy"
```

---

### Task 4: Call `sendGuestConfirmation` in the POST handler

**Files:**
- Modify: `src/app/api/rsvp/route.ts` — the POST handler (around line 202-205)

**Step 1: Add the non-blocking call alongside `sendRsvpNotification`**

After the existing `sendRsvpNotification(parsed.data).catch(...)` line, add:
```ts
sendGuestConfirmation(parsed.data).catch(err =>
    console.error('Guest confirmation email error:', err)
)
```

**Step 2: Verify it builds**
```bash
npx tsc --noEmit
```
Expected: no errors

**Step 3: Commit**
```bash
git add src/app/api/rsvp/route.ts
git commit -m "feat: send guest confirmation email on RSVP submit"
```

---

### Task 5: Manual smoke test

**Step 1:** Run the dev server
```bash
npm run dev
```

**Step 2:** Submit a test RSVP at `http://localhost:3000/es` with a real email address and `attending: yes`

**Step 3:** Check that the guest receives a confirmation email with:
- Correct language (es/ca/en matches the URL locale)
- Name, adults, kids, dietary, staying fields
- Date, location, maps link, parking note

**Step 4:** Repeat with `attending: no` — verify the short thank-you email arrives

**Step 5:** Commit any copy fixes if needed
