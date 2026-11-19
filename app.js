'use strict';

/* ============================================================
   Hisaab — a simple shop ledger
   Plain browser JS. Data stays in localStorage.
   ============================================================ */

const STORAGE_KEY = 'hisaab.v2';
const DEFAULT_UPI = 'shop@upi';
const TESSERACT_URL = 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';

const appEl = document.getElementById('app');
const shopNameEl = document.getElementById('shopName');
const langSelect = document.getElementById('langSelect');
const toastEl = document.getElementById('toast');
const lightboxEl = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');

const WA_ICON =
  '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="currentColor">' +
  '<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.148-.669-1.611-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.876 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>' +
  '</svg>';

/* ---------------- translations ---------------- */

const STRINGS = {
  en: {
    totalOutstanding: 'Total outstanding',
    totalAmount: 'Total amount',
    paidAmount: 'Paid amount',
    pendingAmount: 'Pending amount',
    totalCredit: 'Total credit',
    paidLabel: 'Paid',
    pendingLabel: 'Pending',
    heroSub: '{pending} of {total} customers have a pending balance',
    emptyHero: 'Add your first customer below, or import a shop file.',
    addCustomer: 'Add customer',
    name: 'Name',
    namePlaceholder: 'e.g. Ravi Kumar',
    phone: 'Phone',
    phonePlaceholder: '10-digit number',
    add: 'Add customer',
    customers: 'Customers',
    searchPlaceholder: 'Search by name or phone',
    noCustomers: 'No customers yet. Add one above, or import a shop JSON below.',
    noMatches: 'No customer matches that search.',
    overdue: 'Overdue',
    overdueHint: 'Sorted by days since the last payment',
    daysSince: '{n} days since last payment',
    noPaymentYet: 'No payment received yet',
    remind: 'Remind',
    importTitle: 'Import shop data',
    importHint: 'Paste the shop JSON below, or choose a JSON file. Importing replaces the data on this phone.',
    importPlaceholder: 'Paste shop JSON here…',
    importButton: 'Import',
    chooseFile: 'Choose a JSON file',
    exportCsv: 'Download CSV',
    settings: 'Shop settings',
    shopNameLabel: 'Shop name',
    upiLabel: 'UPI ID (for the pay link)',
    upiHint: 'Customers can pay you directly from the reminder. Ask your UPI app or bank for your ID.',
    save: 'Save',
    saved: 'Saved.',
    entries: 'Entries',
    addEntry: 'Add entry',
    credit: 'Credit — goods given',
    payment: 'Payment — money received',
    amount: 'Amount (₹)',
    date: 'Date',
    note: 'Note',
    optional: '(optional)',
    notePlaceholder: 'e.g. groceries, paid on UPI',
    screenshot: 'Payment screenshot',
    screenshotHint: 'Only used for payments. We try to read the amount from it.',
    addEntryBtn: 'Add entry',
    balance: 'Balance',
    back: 'All customers',
    whatsapp: 'WhatsApp reminder',
    noEntries: 'No entries yet. Add the first credit or payment above.',
    edit: 'Edit',
    delete: 'Delete',
    saveChanges: 'Save changes',
    cancel: 'Cancel',
    deleteConfirm: 'Delete this entry?',
    confirmDeleteBtn: 'Yes, delete',
    editEntry: 'Edit entry',
    noShopData: 'No shop data yet.',
    statusImported: 'Imported {customers} customers and {entries} entries.',
    statusSkipped: ' {n} invalid entries were skipped.',
    statusImportErrorJson: 'That text is not valid JSON.',
    statusImportErrorShape: 'This does not look like Hisaab data. It needs a "customers" list.',
    statusImportErrorEmpty: 'No customers found. Each needs a name and a 10-digit phone number.',
    errName: 'Please enter the customer’s name.',
    errPhone: 'Please enter a valid 10-digit phone number.',
    errDuplicate: 'A customer with this phone number already exists.',
    errAmount: 'Please enter an amount greater than zero.',
    errDate: 'Please choose a valid date.',
    scanStatus: 'Reading the amount from the screenshot…',
    scanDetected: 'Amount read from the screenshot: ₹{amount}',
    scanFailed: 'Could not read the amount — please type it.',
    entryAddedCredit: 'Credit added.',
    entryAddedPayment: 'Payment added.',
    entryUpdated: 'Entry updated.',
    entryDeleted: 'Entry deleted.',
    customerAdded: '{name} added.',
    storageFull: 'Could not save. Browser storage is full.',
    imageTooBig: 'Screenshot was too large to save. The entry was saved without it.',
    searchNone: 'No matches',
    creditShort: 'Credit',
    paymentShort: 'Payment'
  },
  hi: {
    totalOutstanding: 'कुल बकाया',
    totalAmount: 'कुल रकम',
    paidAmount: 'जमा रकम',
    pendingAmount: 'बकाया रकम',
    totalCredit: 'कुल उधार',
    paidLabel: 'जमा',
    pendingLabel: 'बकाया',
    heroSub: '{total} में से {pending} ग्राहकों का बकाया है',
    emptyHero: 'नीचे पहला ग्राहक जोड़ें, या दुकान की फ़ाइल इंपोर्ट करें।',
    addCustomer: 'ग्राहक जोड़ें',
    name: 'नाम',
    namePlaceholder: 'जैसे रवि कुमार',
    phone: 'फ़ोन',
    phonePlaceholder: '10 अंकों का नंबर',
    add: 'ग्राहक जोड़ें',
    customers: 'ग्राहक',
    searchPlaceholder: 'नाम या फ़ोन से खोजें',
    noCustomers: 'अभी कोई ग्राहक नहीं है। ऊपर ग्राहक जोड़ें या नीचे दुकान की JSON इंपोर्ट करें।',
    noMatches: 'इस खोज से कोई ग्राहक नहीं मिला।',
    overdue: 'बकाया वाले ग्राहक',
    overdueHint: 'पिछले भुगतान के दिनों के हिसाब से',
    daysSince: 'पिछले भुगतान से {n} दिन',
    noPaymentYet: 'अभी कोई भुगतान नहीं मिला',
    remind: 'याद दिलाएँ',
    importTitle: 'दुकान का डेटा इंपोर्ट करें',
    importHint: 'नीचे दुकान की JSON पेस्ट करें, या JSON फ़ाइल चुनें। इंपोर्ट करने पर इस फ़ोन का डेटा बदल जाएगा।',
    importPlaceholder: 'यहाँ JSON पेस्ट करें…',
    importButton: 'इंपोर्ट करें',
    chooseFile: 'JSON फ़ाइल चुनें',
    exportCsv: 'CSV डाउनलोड करें',
    settings: 'दुकान की सेटिंग',
    shopNameLabel: 'दुकान का नाम',
    upiLabel: 'UPI आईडी (भुगतान लिंक के लिए)',
    upiHint: 'ग्राहक रिमाइंडर से सीधे भुगतान कर सकें, इसके लिए अपनी दुकान की UPI आईडी डालें।',
    save: 'सहेजें',
    saved: 'सहेज दिया।',
    entries: 'एंट्री',
    addEntry: 'एंट्री जोड़ें',
    credit: 'उधार — सामान दिया',
    payment: 'भुगतान — पैसे मिले',
    amount: 'रकम (₹)',
    date: 'तारीख़',
    note: 'नोट',
    optional: '(वैकल्पिक)',
    notePlaceholder: 'जैसे किराना, UPI से भुगतान',
    screenshot: 'भुगतान का स्क्रीनशॉट',
    screenshotHint: 'सिर्फ़ भुगतान के लिए। हम इसमें से रकम पढ़ने की कोशिश करते हैं।',
    addEntryBtn: 'एंट्री जोड़ें',
    balance: 'बकाया',
    back: 'सभी ग्राहक',
    whatsapp: 'व्हाट्सऐप रिमाइंडर',
    noEntries: 'अभी कोई एंट्री नहीं। ऊपर पहली उधार या भुगतान जोड़ें।',
    edit: 'बदलें',
    delete: 'हटाएँ',
    saveChanges: 'सहेजें',
    cancel: 'रद्द करें',
    deleteConfirm: 'यह एंट्री हटाएँ?',
    confirmDeleteBtn: 'हाँ, हटाएँ',
    editEntry: 'एंट्री बदलें',
    noShopData: 'अभी दुकान का डेटा नहीं है।',
    statusImported: '{customers} ग्राहक और {entries} एंट्री इंपोर्ट हुईं।',
    statusSkipped: ' {n} गलत एंट्री छोड़ दी गईं।',
    statusImportErrorJson: 'यह मान्य JSON नहीं है।',
    statusImportErrorShape: 'यह Hisaab का डेटा नहीं लगता। इसमें "customers" सूची होनी चाहिए।',
    statusImportErrorEmpty: 'कोई ग्राहक नहीं मिला। हर ग्राहक के लिए नाम और 10 अंकों का फ़ोन चाहिए।',
    errName: 'कृपया ग्राहक का नाम लिखें।',
    errPhone: 'कृपया सही 10 अंकों का फ़ोन नंबर लिखें।',
    errDuplicate: 'इस फ़ोन नंबर का ग्राहक पहले से है।',
    errAmount: 'कृपया शून्य से बड़ी रकम लिखें।',
    errDate: 'कृपया सही तारीख़ चुनें।',
    scanStatus: 'स्क्रीनशॉट से रकम पढ़ी जा रही है…',
    scanDetected: 'स्क्रीनशॉट से रकम: ₹{amount}',
    scanFailed: 'रकम नहीं पढ़ी जा सकी — कृपया खुद लिखें।',
    entryAddedCredit: 'उधार जोड़ी गई।',
    entryAddedPayment: 'भुगतान जोड़ा गया।',
    entryUpdated: 'एंट्री बदल दी गई।',
    entryDeleted: 'एंट्री हटा दी गई।',
    customerAdded: '{name} जोड़ा गया।',
    storageFull: 'सहेजा नहीं जा सका। ब्राउज़र स्टोरेज भरी है।',
    imageTooBig: 'स्क्रीनशॉट बहुत बड़ा था, बिना स्क्रीनशॉट के एंट्री सहेजी गई।',
    searchNone: 'कोई नहीं मिला',
    creditShort: 'उधार',
    paymentShort: 'भुगतान'
  },
  te: {
    totalOutstanding: 'మొత్తం బాకీ',
    totalAmount: 'మొత్తం డబ్బు',
    paidAmount: 'చెల్లించిన మొత్తం',
    pendingAmount: 'బాకీ మొత్తం',
    totalCredit: 'మొత్తం అప్పు',
    paidLabel: 'చెల్లించినది',
    pendingLabel: 'బాకీ',
    heroSub: '{total} కస్టమర్లలో {pending} మందికి బాకీ ఉంది',
    emptyHero: 'క్రింద మొదటి కస్టమర్ను జోడించండి, లేదా షాప్ ఫైల్ను ఇంపోర్ట్ చేయండి.',
    addCustomer: 'కస్టమర్ జోడించండి',
    name: 'పేరు',
    namePlaceholder: 'ఉదా. రవి కుమార్',
    phone: 'ఫోన్',
    phonePlaceholder: '10 అంకెల నంబర్',
    add: 'కస్టమర్ జోడించండి',
    customers: 'కస్టమర్లు',
    searchPlaceholder: 'పేరు లేదా ఫోన్ ద్వారా వెతకండి',
    noCustomers: 'ఇంకా కస్టమర్లు లేరు. పైన జోడించండి లేదా క్రింద JSON ఇంపోర్ట్ చేయండి.',
    noMatches: 'ఈ శోధనకు కస్టమర్ కనబడలేదు.',
    overdue: 'బాకీ ఉన్నవారు',
    overdueHint: 'చివరి చెల్లింపు నుంచి రోజుల ప్రకారం',
    daysSince: 'చివరి చెల్లింపు నుంచి {n} రోజులు',
    noPaymentYet: 'ఇంకా చెల్లింపు రాలేదు',
    remind: 'గుర్తు చేయండి',
    importTitle: 'షాప్ డేటా ఇంపోర్ట్',
    importHint: 'క్రింద షాప్ JSON పేస్ట్ చేయండి, లేదా JSON ఫైల్ ఎంచుకోండి. ఇంపోర్ట్ చేస్తే ఈ ఫోన్‌లోని డేటా మారిపోతుంది.',
    importPlaceholder: 'ఇక్కడ JSON పేస్ట్ చేయండి…',
    importButton: 'ఇంపోర్ట్',
    chooseFile: 'JSON ఫైల్ ఎంచుకోండి',
    exportCsv: 'CSV డౌన్‌లోడ్',
    settings: 'షాప్ సెట్టింగ్స్',
    shopNameLabel: 'షాప్ పేరు',
    upiLabel: 'UPI ఐడీ (పే లింక్ కోసం)',
    upiHint: 'కస్టమర్లు రిమైండర్ నుంచే చెల్లించడానికి మీ షాప్ UPI ఐడీ ఇవ్వండి.',
    save: 'సేవ్ చేయండి',
    saved: 'సేవ్ అయింది.',
    entries: 'ఎంట్రీలు',
    addEntry: 'ఎంట్రీ జోడించండి',
    credit: 'అప్పు — సరుకు ఇచ్చారు',
    payment: 'చెల్లింపు — డబ్బు అందింది',
    amount: 'మొత్తం (₹)',
    date: 'తేదీ',
    note: 'నోట్',
    optional: '(ఐచ్ఛికం)',
    notePlaceholder: 'ఉదా. కిరాణా, UPI చెల్లింపు',
    screenshot: 'చెల్లింపు స్క్రీన్‌షాట్',
    screenshotHint: 'చెల్లింపులకు మాత్రమే. దాని నుంచి మొత్తాన్ని చదవడానికి ప్రయత్నిస్తాం.',
    addEntryBtn: 'ఎంట్రీ జోడించండి',
    balance: 'బాకీ',
    back: 'అందరు కస్టమర్లు',
    whatsapp: 'వాట్సాప్ రిమైండర్',
    noEntries: 'ఇంకా ఎంట్రీలు లేవు. పైన మొదటి అప్పు లేదా చెల్లింపు జోడించండి.',
    edit: 'మార్చండి',
    delete: 'తొలగించండి',
    saveChanges: 'సేవ్ చేయండి',
    cancel: 'రద్దు',
    deleteConfirm: 'ఈ ఎంట్రీని తొలగించాలా?',
    confirmDeleteBtn: 'అవును, తొలగించండి',
    editEntry: 'ఎంట్రీ మార్చండి',
    noShopData: 'ఇంకా షాప్ డేటా లేదు.',
    statusImported: '{customers} కస్టమర్లు, {entries} ఎంట్రీలు ఇంపోర్ట్ అయ్యాయి.',
    statusSkipped: ' {n} తప్పు ఎంట్రీలు వదిలేశాం.',
    statusImportErrorJson: 'ఇది సరైన JSON కాదు.',
    statusImportErrorShape: 'ఇది Hisaab డేటాలా లేదు. దీనిలో "customers" జాబితా ఉండాలి.',
    statusImportErrorEmpty: 'కస్టమర్లు కనబడలేదు. ప్రతి ఒక్కరికి పేరు, 10 అంకెల ఫోన్ కావాలి.',
    errName: 'దయచేసి కస్టమర్ పేరు రాయండి.',
    errPhone: 'దయచేసి సరైన 10 అంకెల ఫోన్ నంబర్ రాయండి.',
    errDuplicate: 'ఈ ఫోన్ నంబర్‌తో కస్టమర్ ఇప్పటికే ఉన్నారు.',
    errAmount: 'దయచేసి సున్నా కంటే ఎక్కువ మొత్తం రాయండి.',
    errDate: 'దయచేసి సరైన తేదీ ఎంచుకోండి.',
    scanStatus: 'స్క్రీన్‌షాట్ నుంచి మొత్తం చదువుతోంది…',
    scanDetected: 'స్క్రీన్‌షాట్ నుంచి మొత్తం: ₹{amount}',
    scanFailed: 'మొత్తం చదవలేకపోయాం — దయచేసి టైప్ చేయండి.',
    entryAddedCredit: 'అప్పు జోడించబడింది.',
    entryAddedPayment: 'చెల్లింపు జోడించబడింది.',
    entryUpdated: 'ఎంట్రీ మార్చబడింది.',
    entryDeleted: 'ఎంట్రీ తొలగించబడింది.',
    customerAdded: '{name} జోడించబడ్డారు.',
    storageFull: 'సేవ్ చేయలేకపోయాం. బ్రౌజర్ స్టోరేజ్ నిండింది.',
    imageTooBig: 'స్క్రీన్‌షాట్ సేవ్ కాలేదు. ఎంట్రీ దాని లేకుండా సేవ్ అయింది.',
    searchNone: 'ఏమీ లేవు',
    creditShort: 'అప్పు',
    paymentShort: 'చెల్లింపు'
  }
};

function t(key, vars) {
  const table = STRINGS[state && state.lang] || STRINGS.en;
  let text = table[key] || STRINGS.en[key] || key;
  if (vars) {
    Object.keys(vars).forEach(function (name) {
      text = text.replace(new RegExp('\\{' + name + '\\}', 'g'), String(vars[name]));
    });
  }
  return text;
}

/* ---------------- small helpers ---------------- */

function uid() {
  if (window.crypto && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  return 'e' + Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

function round2(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function normalizePhone(value) {
  const digits = String(value == null ? '' : value).replace(/\D/g, '');
  if (!digits) return '';
  return digits.length > 10 ? digits.slice(-10) : digits;
}

function normalizeDate(value) {
  const raw = String(value == null ? '' : value).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  const parsed = new Date(raw);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.getFullYear() + '-' +
      String(parsed.getMonth() + 1).padStart(2, '0') + '-' +
      String(parsed.getDate()).padStart(2, '0');
  }
  return todayISO();
}

function todayISO() {
  try {
    const param = new URLSearchParams(location.search).get('today');
    if (param && /^\d{4}-\d{2}-\d{2}$/.test(param)) return param;
  } catch (error) { /* ignore */ }
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

function daysBetween(fromISO, toISO) {
  const from = Date.parse(fromISO + 'T00:00:00Z');
  const to = Date.parse(toISO + 'T00:00:00Z');
  if (Number.isNaN(from) || Number.isNaN(to)) return 0;
  return Math.max(0, Math.round((to - from) / 86400000));
}

function esc(value) {
  return String(value).replace(/[&<>"']/g, function (ch) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch];
  });
}

function initials(name) {
  return String(name).trim().split(/\s+/).slice(0, 2)
    .map(function (word) { return word.charAt(0).toUpperCase(); }).join('');
}

const numberFmt = new Intl.NumberFormat('en-IN', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2
});

function money(value) {
  const rounded = round2(value);
  const sign = rounded < 0 ? '\u2212' : '';
  return sign + '\u20B9' + numberFmt.format(Math.abs(rounded));
}

function plainAmount(value) {
  const rounded = round2(value);
  return (Math.round(rounded * 100) % 100 === 0 ? String(Math.round(rounded)) : rounded.toFixed(2));
}

function formatDate(iso) {
  const parts = String(iso).split('-');
  const y = Number(parts[0]);
  const m = Number(parts[1]);
  const d = Number(parts[2]);
  if (!y || !m || !d) return iso;
  return new Date(y, m - 1, d).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric'
  });
}

function formatPhone(phone) {
  return '+91 ' + phone.slice(0, 5) + ' ' + phone.slice(5);
}

/* ---------------- state ---------------- */

let state = loadState();
let pendingScreenshot = null;
let editingId = null;
let pendingDeleteId = null;

function normalizeState(raw, keepMeta) {
  const shop = typeof raw?.shop === 'string' && raw.shop.trim() ? raw.shop.trim() : 'My shop';
  const upi = typeof raw?.upi === 'string' ? raw.upi.trim() : '';
  const lang = ['en', 'hi', 'te'].indexOf(raw?.lang) >= 0 ? raw.lang : 'en';

  const customers = [];
  const seen = new Set();
  for (const item of Array.isArray(raw?.customers) ? raw.customers : []) {
    const phone = normalizePhone(item?.phone);
    const name = String(item?.name == null ? '' : item.name).trim();
    if (phone.length !== 10 || !name || seen.has(phone)) continue;
    seen.add(phone);
    customers.push({ name: name, phone: phone });
  }

  const entries = [];
  for (const item of Array.isArray(raw?.entries) ? raw.entries : []) {
    const phone = normalizePhone(item?.phone);
    if (!seen.has(phone)) continue;
    const type = String(item?.type == null ? '' : item.type).trim().toLowerCase();
    if (type !== 'credit' && type !== 'payment') continue;
    const amount = Number(item?.amount);
    if (!Number.isFinite(amount) || amount <= 0) continue;
    const entry = {
      id: keepMeta && item?.id ? String(item.id) : uid(),
      phone: phone,
      type: type,
      amount: round2(amount),
      date: normalizeDate(item?.date),
      note: String(item?.note == null ? '' : item.note).trim(),
      createdAt: keepMeta && Number.isFinite(Number(item?.createdAt))
        ? Number(item.createdAt) : Date.now()
    };
    if (type === 'payment' && typeof item?.image === 'string' && item.image.startsWith('data:image/')) {
      entry.image = item.image;
    }
    entries.push(entry);
  }

  return { shop: shop, upi: upi, lang: lang, customers: customers, entries: entries };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { shop: 'My shop', upi: DEFAULT_UPI, lang: 'en', customers: [], entries: [] };
    const data = normalizeState(JSON.parse(raw), true);
    if (!data.upi) data.upi = DEFAULT_UPI;
    return data;
  } catch (error) {
    return { shop: 'My shop', upi: DEFAULT_UPI, lang: 'en', customers: [], entries: [] };
  }
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch (error) {
    return false;
  }
}

/* ---------------- money maths ---------------- */

function balanceFor(phone) {
  let total = 0;
  for (const entry of state.entries) {
    if (entry.phone !== phone) continue;
    total += entry.type === 'credit' ? entry.amount : -entry.amount;
  }
  return round2(total);
}

function totalOutstanding() {
  let total = 0;
  for (const customer of state.customers) total += balanceFor(customer.phone);
  return round2(total);
}

function creditTotal() {
  let total = 0;
  for (const entry of state.entries) if (entry.type === 'credit') total += entry.amount;
  return round2(total);
}

function paidTotal() {
  let total = 0;
  for (const entry of state.entries) if (entry.type === 'payment') total += entry.amount;
  return round2(total);
}

function customerTotals(phone) {
  let credit = 0;
  let paid = 0;
  for (const entry of state.entries) {
    if (entry.phone !== phone) continue;
    if (entry.type === 'credit') credit += entry.amount;
    else paid += entry.amount;
  }
  return { credit: round2(credit), paid: round2(paid) };
}

function customersWithBalance() {
  return state.customers.filter(function (customer) { return balanceFor(customer.phone) > 0; }).length;
}

function sortedCustomers() {
  return state.customers.slice().sort(function (a, b) {
    return a.name.localeCompare(b.name, 'en-IN');
  });
}

function sortedEntries(phone) {
  return state.entries
    .filter(function (entry) { return entry.phone === phone; })
    .sort(function (a, b) {
      if (a.date !== b.date) return a.date < b.date ? 1 : -1;
      return (b.createdAt || 0) - (a.createdAt || 0);
    });
}

function lastPaymentDate(phone) {
  let last = '';
  for (const entry of state.entries) {
    if (entry.phone !== phone || entry.type !== 'payment') continue;
    if (!last || entry.date > last) last = entry.date;
  }
  return last;
}

function firstEntryDate(phone) {
  let first = '';
  for (const entry of state.entries) {
    if (entry.phone !== phone) continue;
    if (!first || entry.date < first) first = entry.date;
  }
  return first;
}

function overdueList() {
  const today = todayISO();
  const rows = [];
  for (const customer of state.customers) {
    const balance = balanceFor(customer.phone);
    if (balance <= 0) continue;
    const last = lastPaymentDate(customer.phone);
    const base = last || firstEntryDate(customer.phone) || today;
    rows.push({
      customer: customer,
      balance: balance,
      lastPayment: last,
      days: daysBetween(base, today)
    });
  }
  return rows.sort(function (a, b) {
    return b.days - a.days || b.balance - a.balance;
  });
}

/* ---------------- WhatsApp / UPI ---------------- */

function upiLink(amount) {
  const vpa = String(state.upi || DEFAULT_UPI).trim() || DEFAULT_UPI;
  return 'upi://pay?pa=' + encodeURIComponent(vpa) +
    '&pn=' + encodeURIComponent(state.shop) +
    '&am=' + amount.toFixed(2) + '&cu=INR';
}

function waLink(customer) {
  const balance = balanceFor(customer.phone);
  let line;
  if (balance > 0) {
    line = 'your balance is ' + money(balance) + '. ' +
      'Pay via UPI: ' + upiLink(balance) + ' ';
  } else if (balance < 0) {
    line = 'you have an advance of ' + money(Math.abs(balance)) + ' with us. ';
  } else {
    line = 'your balance is ' + money(0) + ' — all settled. ';
  }
  const message = 'Namaste ' + customer.name + ', a gentle reminder from ' + state.shop + ': ' +
    line + 'Kindly pay at your convenience. Thank you.';
  return 'https://wa.me/91' + customer.phone + '?text=' + encodeURIComponent(message);
}

/* ---------------- shared UI ---------------- */

let toastTimer = null;

function toast(message) {
  toastEl.textContent = message;
  toastEl.hidden = false;
  requestAnimationFrame(function () { toastEl.classList.add('show'); });
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function () {
    toastEl.classList.remove('show');
    setTimeout(function () { toastEl.hidden = true; }, 220);
  }, 3200);
}

function openLightbox(src) {
  lightboxImg.src = src;
  lightboxEl.hidden = false;
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  lightboxEl.hidden = true;
  lightboxImg.removeAttribute('src');
  document.body.style.overflow = '';
}

lightboxEl.addEventListener('click', function (event) {
  if (event.target === lightboxEl || event.target.id === 'lightboxClose') closeLightbox();
});

document.addEventListener('keydown', function (event) {
  if (event.key === 'Escape' && !lightboxEl.hidden) closeLightbox();
});

function compressImage(file, maxSize, quality) {
  return new Promise(function (resolve, reject) {
    const reader = new FileReader();
    reader.onerror = function () { reject(new Error('read')); };
    reader.onload = function () {
      const image = new Image();
      image.onerror = function () { reject(new Error('image')); };
      image.onload = function () {
        const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
        const width = Math.max(1, Math.round(image.width * scale));
        const height = Math.max(1, Math.round(image.height * scale));
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(image, 0, 0, width, height);
        try {
          resolve(canvas.toDataURL('image/jpeg', quality));
        } catch (error) { reject(error); }
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

/* ---------------- screenshot amount reading (optional) ---------------- */

let tesseractPromise = null;

function loadTesseract() {
  if (window.Tesseract) return Promise.resolve(window.Tesseract);
  if (!tesseractPromise) {
    tesseractPromise = new Promise(function (resolve, reject) {
      const script = document.createElement('script');
      script.src = TESSERACT_URL;
      script.async = true;
      script.onload = function () { resolve(window.Tesseract); };
      script.onerror = function () { reject(new Error('tesseract')); };
      document.head.appendChild(script);
    });
  }
  return tesseractPromise;
}

function parseAmountFromText(text) {
  const cleaned = String(text || '').replace(/\s+/g, ' ');
  const withSymbol = [];
  const symbolRegex = /(?:₹|rs\.?|inr)\s*([0-9][0-9,]*(?:\.[0-9]{1,2})?)/gi;
  let match;
  while ((match = symbolRegex.exec(cleaned))) {
    const value = Number(match[1].replace(/,/g, ''));
    if (Number.isFinite(value) && value > 0) withSymbol.push(value);
  }
  if (withSymbol.length) return withSymbol[0];

  const all = [];
  const numberRegex = /\b([0-9][0-9,]*(?:\.[0-9]{1,2})?)\b/g;
  while ((match = numberRegex.exec(cleaned))) {
    const value = Number(match[1].replace(/,/g, ''));
    if (Number.isFinite(value) && value >= 1 && value <= 1000000) all.push(value);
  }
  if (!all.length) return null;
  return Math.max.apply(null, all);
}

function scanScreenshot(dataUrl) {
  const status = document.getElementById('ocr-status');
  const amountInput = document.getElementById('entryAmount');
  if (!status) return;
  status.hidden = false;
  status.classList.remove('error');
  status.textContent = t('scanStatus');

  loadTesseract().then(function (Tesseract) {
    return Tesseract.recognize(dataUrl, 'eng', {
      logger: function (message) {
        if (message.status === 'recognizing text' && typeof message.progress === 'number') {
          const el = document.getElementById('ocr-status');
          if (el) el.textContent = t('scanStatus') + ' ' + Math.round(message.progress * 100) + '%';
        }
      }
    });
  }).then(function (result) {
    const text = result?.data?.text || '';
    const amount = parseAmountFromText(text);
    const current = document.getElementById('ocr-status');
    const input = document.getElementById('entryAmount');
    if (!current) return;
    if (amount === null) {
      current.textContent = t('scanFailed');
      current.classList.add('error');
      return;
    }
    current.textContent = t('scanDetected', { amount: numberFmt.format(amount) });
    if (input && !input.value) input.value = String(amount);
  }).catch(function () {
    const current = document.getElementById('ocr-status');
    if (!current) return;
    current.textContent = t('scanFailed');
    current.classList.add('error');
  });
}

/* ---------------- routing ---------------- */

function render() {
  shopNameEl.textContent = state.shop;
  if (langSelect) langSelect.value = state.lang;

  const hash = location.hash || '#/';
  const match = hash.match(/^#\/customer\/(\d{10})$/);
  if (match) {
    const customer = state.customers.find(function (item) { return item.phone === match[1]; });
    if (customer) {
      renderCustomer(customer);
      return;
    }
    location.hash = '#/';
  }
  renderDashboard();
}

function setImportStatus(message, isError) {
  const el = document.getElementById('import-status');
  if (!el) return;
  el.textContent = message;
  el.classList.toggle('error', Boolean(isError));
}

/* ---------------- dashboard ---------------- */

function renderDashboard() {
  const customers = sortedCustomers();
  const total = totalOutstanding();
  const credit = creditTotal();
  const paid = paidTotal();
  const pendingCount = customersWithBalance();

  const heroSub = customers.length
    ? t('heroSub', { pending: pendingCount, total: customers.length })
    : t('emptyHero');

  const rows = customers.map(function (customer) {
    const balance = balanceFor(customer.phone);
    const cls = balance > 0 ? 'due' : balance < 0 ? 'advance' : 'zero';
    return (
      '<div class="row" data-customer="' + customer.phone + '" ' +
        'data-name="' + esc(customer.name.toLowerCase()) + '" data-phone="' + customer.phone + '">' +
        '<a class="row-main" href="#/customer/' + customer.phone + '">' +
          '<span class="avatar" aria-hidden="true">' + esc(initials(customer.name)) + '</span>' +
          '<span class="row-text">' +
            '<span class="row-name">' + esc(customer.name) + '</span>' +
            '<span class="row-phone">' + formatPhone(customer.phone) + '</span>' +
          '</span>' +
        '</a>' +
        '<a class="row-balance ' + cls + '" href="#/customer/' + customer.phone + '" ' +
          'data-balance="' + balance + '" aria-label="' + esc(t('balance') + ': ' + money(balance)) + '">' +
          money(balance) +
        '</a>' +
        '<a class="wa-btn" data-remind="' + customer.phone + '" href="' + esc(waLink(customer)) + '" ' +
          'target="_blank" rel="noopener" ' +
          'aria-label="' + esc(t('remind') + ': ' + customer.name) + '">' +
          WA_ICON + '<span>' + t('remind') + '</span>' +
        '</a>' +
      '</div>'
    );
  }).join('');

  const overdue = overdueList();
  const overdueRows = overdue.map(function (item) {
    return (
      '<div class="row overdue-row">' +
        '<a class="row-main" href="#/customer/' + item.customer.phone + '">' +
          '<span class="avatar warm" aria-hidden="true">' + esc(initials(item.customer.name)) + '</span>' +
          '<span class="row-text">' +
            '<span class="row-name">' + esc(item.customer.name) + '</span>' +
            '<span class="row-phone">' +
              (item.lastPayment ? t('daysSince', { n: item.days }) : t('noPaymentYet')) +
            '</span>' +
          '</span>' +
        '</a>' +
        '<a class="row-balance due" href="#/customer/' + item.customer.phone + '">' +
          money(item.balance) +
        '</a>' +
        '<a class="wa-btn" href="' + esc(waLink(item.customer)) + '" target="_blank" rel="noopener">' +
          WA_ICON + '<span>' + t('remind') + '</span>' +
        '</a>' +
      '</div>'
    );
  }).join('');

  appEl.innerHTML =
    '<section class="card hero">' +
      '<p class="eyebrow">' + t('totalOutstanding') + '</p>' +
      '<p class="hero-total" id="total-outstanding">' + money(total) +
        '<span class="sr-only"> (' + plainAmount(total) + ')</span></p>' +
      '<p class="hero-sub">' + esc(heroSub) + '</p>' +
    '</section>' +

    '<section class="card stats" aria-label="' + esc(t('totalOutstanding')) + '">' +
      '<div class="stat">' +
        '<span class="stat-label">' + t('totalAmount') + '</span>' +
        '<span class="stat-value" id="total-amount">' + money(credit) + '</span>' +
      '</div>' +
      '<div class="stat">' +
        '<span class="stat-label">' + t('paidAmount') + '</span>' +
        '<span class="stat-value paid" id="paid-amount">' + money(paid) + '</span>' +
      '</div>' +
      '<div class="stat">' +
        '<span class="stat-label">' + t('pendingAmount') + '</span>' +
        '<span class="stat-value due" id="pending-amount">' + money(total) + '</span>' +
      '</div>' +
    '</section>' +

    '<section class="card list-card">' +
      '<div class="list-head">' +
        '<h2>' + t('customers') + ' <span class="count-pill">' + customers.length + '</span></h2>' +
        '<button type="button" class="btn ghost small" id="export-csv">' + t('exportCsv') + '</button>' +
      '</div>' +
      '<div class="search-row">' +
        '<input type="search" id="search" class="search-input" placeholder="' + esc(t('searchPlaceholder')) + '" ' +
          'aria-label="' + esc(t('searchPlaceholder')) + '">' +
      '</div>' +
      (customers.length
        ? '<div class="rows" id="customer-rows">' + rows + '</div>' +
          '<p class="empty" id="no-matches" hidden>' + t('noMatches') + '</p>'
        : '<p class="empty">' + t('noCustomers') + '</p>') +
    '</section>' +

    (overdue.length
      ? '<section class="card overdue-card">' +
          '<div class="list-head"><h2>' + t('overdue') + '</h2>' +
            '<span class="muted small-text">' + t('overdueHint') + '</span></div>' +
          '<div class="rows">' + overdueRows + '</div>' +
        '</section>'
      : '') +

    '<section class="card">' +
      '<h2>' + t('addCustomer') + '</h2>' +
      '<form id="addCustomerForm" class="inline-form" novalidate>' +
        '<div class="field">' +
          '<label for="custName">' + t('name') + '</label>' +
          '<input id="custName" name="name" type="text" autocomplete="off" maxlength="60" ' +
            'placeholder="' + esc(t('namePlaceholder')) + '" required>' +
        '</div>' +
        '<div class="field">' +
          '<label for="custPhone">' + t('phone') + '</label>' +
          '<input id="custPhone" name="phone" type="tel" inputmode="numeric" autocomplete="off" ' +
            'maxlength="10" pattern="[0-9]{10}" placeholder="' + esc(t('phonePlaceholder')) + '" required>' +
        '</div>' +
        '<button class="btn primary" type="submit">' + t('add') + '</button>' +
      '</form>' +
      '<p class="form-error" id="customerError" role="alert" hidden></p>' +
    '</section>' +

    '<details class="card settings-card">' +
      '<summary>' + t('settings') + '</summary>' +
      '<form id="settingsForm" class="settings-form" novalidate>' +
        '<div class="field">' +
          '<label for="shopNameInput">' + t('shopNameLabel') + '</label>' +
          '<input id="shopNameInput" name="shop" type="text" maxlength="80" value="' + esc(state.shop) + '">' +
        '</div>' +
        '<div class="field">' +
          '<label for="upiInput">' + t('upiLabel') + '</label>' +
          '<input id="upiInput" name="upi" type="text" maxlength="80" value="' + esc(state.upi) + '" ' +
            'placeholder="shopname@bank">' +
          '<p class="hint">' + esc(t('upiHint')) + '</p>' +
        '</div>' +
        '<button class="btn primary" type="submit">' + t('save') + '</button>' +
      '</form>' +
    '</details>' +

    '<section class="card import-card">' +
      '<h2>' + t('importTitle') + '</h2>' +
      '<p class="hint">' + esc(t('importHint')) + '</p>' +
      '<textarea id="import-box" rows="6" spellcheck="false" ' +
        'placeholder="' + esc(t('importPlaceholder')) + '"></textarea>' +
      '<div class="import-actions">' +
        '<button type="button" class="btn primary" id="import-go">' + t('importButton') + '</button>' +
        '<label class="file-btn">' + t('chooseFile') +
          '<input type="file" id="importFile" accept=".json,application/json">' +
        '</label>' +
      '</div>' +
      '<p class="status" id="import-status" role="status"></p>' +
    '</section>';

  const form = document.getElementById('addCustomerForm');
  form.addEventListener('submit', function (event) {
    event.preventDefault();
    addCustomer(form);
  });

  const phoneInput = document.getElementById('custPhone');
  phoneInput.addEventListener('input', function () {
    const digits = phoneInput.value.replace(/\D/g, '').slice(0, 10);
    if (phoneInput.value !== digits) phoneInput.value = digits;
  });

  const search = document.getElementById('search');
  if (search) {
    search.addEventListener('input', function () {
      const query = search.value.trim().toLowerCase();
      const digits = query.replace(/\D/g, '');
      let visible = 0;
      document.querySelectorAll('#customer-rows .row').forEach(function (row) {
        const name = row.getAttribute('data-name') || '';
        const phone = row.getAttribute('data-phone') || '';
        const show = !query ||
          name.indexOf(query) >= 0 ||
          (digits.length > 0 && phone.indexOf(digits) >= 0);
        row.hidden = !show;
        if (show) visible += 1;
      });
      const noMatches = document.getElementById('no-matches');
      if (noMatches) noMatches.hidden = visible !== 0;
    });
  }

  document.getElementById('import-go').addEventListener('click', function () {
    const box = document.getElementById('import-box');
    importText(box.value, '');
  });

  document.getElementById('importFile').addEventListener('change', function (event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onerror = function () { setImportStatus(t('statusImportErrorJson'), true); };
    reader.onload = function () {
      importText(String(reader.result), file.name);
      event.target.value = '';
    };
    reader.readAsText(file);
  });

  document.getElementById('export-csv').addEventListener('click', exportCsv);

  const settingsForm = document.getElementById('settingsForm');
  settingsForm.addEventListener('submit', function (event) {
    event.preventDefault();
    const shop = settingsForm.elements.shop.value.trim();
    const upi = settingsForm.elements.upi.value.trim();
    if (shop) state.shop = shop;
    state.upi = upi || DEFAULT_UPI;
    if (!persist()) toast(t('storageFull'));
    render();
    toast(t('saved'));
  });
}

function addCustomer(form) {
  const errorEl = document.getElementById('customerError');
  const name = form.elements.name.value.trim().replace(/\s+/g, ' ');
  const phone = form.elements.phone.value.replace(/\D/g, '');

  function fail(message) {
    errorEl.textContent = message;
    errorEl.hidden = false;
  }

  if (!name) return fail(t('errName'));
  if (phone.length !== 10) return fail(t('errPhone'));
  if (state.customers.some(function (item) { return item.phone === phone; })) {
    return fail(t('errDuplicate'));
  }

  state.customers.push({ name: name, phone: phone });
  if (!persist()) toast(t('storageFull'));
  render();
  toast(t('customerAdded', { name: name }));
}

/* ---------------- import ---------------- */

function importText(text, fileName) {
  if (!text || !text.trim()) {
    setImportStatus(t('statusImportErrorJson'), true);
    return;
  }
  let raw;
  try {
    raw = JSON.parse(text);
  } catch (error) {
    setImportStatus(t('statusImportErrorJson'), true);
    return;
  }
  if (!raw || typeof raw !== 'object' || !Array.isArray(raw.customers)) {
    setImportStatus(t('statusImportErrorShape'), true);
    return;
  }

  const imported = normalizeState(raw, false);
  if (!imported.customers.length) {
    setImportStatus(t('statusImportErrorEmpty'), true);
    return;
  }

  imported.lang = state.lang;
  if (!imported.upi) imported.upi = state.upi || DEFAULT_UPI;

  state = imported;
  pendingScreenshot = null;
  editingId = null;
  pendingDeleteId = null;

  if (location.hash && location.hash !== '#/') {
    location.hash = '#/';
  }

  if (!persist()) toast(t('storageFull'));
  render();

  const rawCount = Array.isArray(raw.entries) ? raw.entries.length : 0;
  const skipped = rawCount - imported.entries.length;
  let message = t('statusImported', {
    customers: imported.customers.length,
    entries: imported.entries.length
  });
  if (skipped > 0) message += t('statusSkipped', { n: skipped });
  if (fileName) message += ' (' + fileName + ')';
  setImportStatus(message, false);
  toast(imported.shop);
}

/* ---------------- CSV ---------------- */

function csvCell(value) {
  const text = String(value == null ? '' : value);
  if (/[",\r\n]/.test(text)) return '"' + text.replace(/"/g, '""') + '"';
  return text;
}

function exportCsv() {
  const customersByPhone = {};
  state.customers.forEach(function (customer) { customersByPhone[customer.phone] = customer; });

  const rows = state.entries.slice().sort(function (a, b) {
    if (a.date !== b.date) return a.date < b.date ? -1 : 1;
    return (a.createdAt || 0) - (b.createdAt || 0);
  }).map(function (entry) {
    const customer = customersByPhone[entry.phone] || { name: '', phone: entry.phone };
    return [
      customer.name,
      entry.phone,
      entry.type,
      entry.amount,
      entry.date,
      entry.note
    ];
  });

  const lines = [['Customer', 'Phone', 'Type', 'Amount', 'Date', 'Note']].concat(rows);
  const csv = '\uFEFF' + lines.map(function (row) {
    return row.map(csvCell).join(',');
  }).join('\r\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const slug = state.shop.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'shop';
  link.href = url;
  link.download = slug + '-hisaab-' + todayISO() + '.csv';
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
}

/* ---------------- customer page ---------------- */

function entryActions(entry) {
  if (pendingDeleteId === entry.id) {
    return (
      '<div class="entry-actions confirm-actions">' +
        '<span class="confirm-text">' + t('deleteConfirm') + '</span>' +
        '<button type="button" class="link-btn danger" data-delete-confirm="' + esc(entry.id) + '">' +
          t('confirmDeleteBtn') + '</button>' +
        '<button type="button" class="link-btn" data-cancel-delete="1">' + t('cancel') + '</button>' +
      '</div>'
    );
  }
  return (
    '<div class="entry-actions">' +
      '<button type="button" class="link-btn" data-edit="' + esc(entry.id) + '">' + t('edit') + '</button>' +
      '<button type="button" class="link-btn danger" data-delete="' + esc(entry.id) + '">' + t('delete') + '</button>' +
    '</div>'
  );
}

function entryHtml(entry) {
  if (editingId === entry.id) {
    return (
      '<article class="entry editing">' +
        '<form class="edit-form" data-edit-form="' + esc(entry.id) + '" novalidate>' +
          '<p class="edit-title">' + t('editEntry') + '</p>' +
          '<div class="seg" role="radiogroup" aria-label="' + esc(t('editEntry')) + '">' +
            '<label class="seg-opt">' +
              '<input type="radio" name="editType" value="credit"' + (entry.type === 'credit' ? ' checked' : '') + '>' +
              '<span class="credit">' + t('credit') + '</span>' +
            '</label>' +
            '<label class="seg-opt">' +
              '<input type="radio" name="editType" value="payment"' + (entry.type === 'payment' ? ' checked' : '') + '>' +
              '<span class="payment">' + t('payment') + '</span>' +
            '</label>' +
          '</div>' +
          '<div class="grid2">' +
            '<div class="field">' +
              '<label>Amount (₹)</label>' +
              '<input name="amount" type="number" inputmode="decimal" min="1" step="0.01" ' +
                'value="' + esc(entry.amount) + '" required>' +
            '</div>' +
            '<div class="field">' +
              '<label>' + t('date') + '</label>' +
              '<input name="date" type="date" value="' + esc(entry.date) + '" required>' +
            '</div>' +
          '</div>' +
          '<div class="field" style="margin-top:12px">' +
            '<label>' + t('note') + ' <span class="optional">' + t('optional') + '</span></label>' +
            '<input name="note" type="text" maxlength="140" value="' + esc(entry.note) + '">' +
          '</div>' +
          '<p class="form-error" role="alert" hidden></p>' +
          '<div class="btn-row">' +
            '<button class="btn primary" type="submit">' + t('saveChanges') + '</button>' +
            '<button class="btn ghost" type="button" data-cancel-edit="1">' + t('cancel') + '</button>' +
          '</div>' +
        '</form>' +
      '</article>'
    );
  }

  const isCredit = entry.type === 'credit';
  const label = isCredit ? t('creditShort') : t('paymentShort');
  const meta = formatDate(entry.date) +
    (entry.note ? '<span class="dot">&middot;</span>' + esc(entry.note) : '');
  const shot = entry.image
    ? '<button type="button" class="shot-btn" data-shot="' + esc(entry.id) + '" ' +
        'aria-label="' + esc(t('screenshot')) + '">' +
        '<img data-shot="' + esc(entry.id) + '" src="' + entry.image + '" alt="' + esc(t('screenshot')) + '">' +
      '</button>'
    : '';

  return (
    '<article class="entry">' +
      '<div class="entry-top">' +
        '<span class="badge ' + entry.type + '">' + label + '</span>' +
        '<span class="entry-amount ' + entry.type + '">' + money(entry.amount) + '</span>' +
      '</div>' +
      '<p class="entry-meta">' + meta + '</p>' +
      shot +
      entryActions(entry) +
    '</article>'
  );
}

function renderCustomer(customer) {
  const balance = balanceFor(customer.phone);
  const balanceCls = balance > 0 ? 'due' : balance < 0 ? 'advance' : 'zero';
  const totals = customerTotals(customer.phone);
  const entries = sortedEntries(customer.phone);

  appEl.innerHTML =
    '<a class="back" href="#/">' + t('back') + '</a>' +

    '<section class="card cust-head">' +
      '<div class="cust-id">' +
        '<span class="avatar big" aria-hidden="true">' + esc(initials(customer.name)) + '</span>' +
        '<div class="cust-name">' +
          '<h1>' + esc(customer.name) + '</h1>' +
          '<p class="muted">' + formatPhone(customer.phone) + '</p>' +
        '</div>' +
      '</div>' +
      '<div class="cust-balance">' +
        '<span class="eyebrow">' + t('balance') + '</span>' +
        '<strong class="' + balanceCls + '">' + money(balance) + '</strong>' +
      '</div>' +
      '<a class="wa-btn solid" href="' + esc(waLink(customer)) + '" target="_blank" rel="noopener">' +
        WA_ICON + '<span>' + t('whatsapp') + '</span>' +
      '</a>' +
      '<div class="cust-stats">' +
        '<div class="cust-stat">' +
          '<span>' + t('totalCredit') + '</span>' +
          '<strong>' + money(totals.credit) + '</strong>' +
        '</div>' +
        '<div class="cust-stat">' +
          '<span>' + t('paidLabel') + '</span>' +
          '<strong class="advance">' + money(totals.paid) + '</strong>' +
        '</div>' +
        '<div class="cust-stat">' +
          '<span>' + t('pendingLabel') + '</span>' +
          '<strong class="' + balanceCls + '">' + money(balance) + '</strong>' +
        '</div>' +
      '</div>' +
    '</section>' +

    '<section class="card">' +
      '<h2>' + t('addEntry') + '</h2>' +
      '<form id="entryForm" novalidate>' +
        '<div class="seg" role="radiogroup" aria-label="' + esc(t('addEntry')) + '">' +
          '<label class="seg-opt">' +
            '<input type="radio" name="type" value="credit" checked>' +
            '<span class="credit">' + t('credit') + '</span>' +
          '</label>' +
          '<label class="seg-opt">' +
            '<input type="radio" name="type" value="payment">' +
            '<span class="payment">' + t('payment') + '</span>' +
          '</label>' +
        '</div>' +
        '<div class="grid2">' +
          '<div class="field">' +
            '<label for="entryAmount">' + t('amount') + '</label>' +
            '<input id="entryAmount" name="amount" type="number" inputmode="decimal" min="1" step="0.01" ' +
              'placeholder="0" required>' +
          '</div>' +
          '<div class="field">' +
            '<label for="entryDate">' + t('date') + '</label>' +
            '<input id="entryDate" name="date" type="date" value="' + todayISO() + '" required>' +
          '</div>' +
        '</div>' +
        '<div class="field" style="margin-top:12px">' +
          '<label for="entryNote">' + t('note') + ' <span class="optional">' + t('optional') + '</span></label>' +
          '<input id="entryNote" name="note" type="text" maxlength="140" ' +
            'placeholder="' + esc(t('notePlaceholder')) + '">' +
        '</div>' +
        '<div class="field" style="margin-top:12px">' +
          '<label for="shot-input">' + t('screenshot') + ' <span class="optional">' + t('optional') + '</span></label>' +
          '<input id="shot-input" name="screenshot" type="file" accept="image/*">' +
          '<p class="hint">' + esc(t('screenshotHint')) + '</p>' +
          '<img class="shot-preview" id="shot-preview" alt="' + esc(t('screenshot')) + '" hidden>' +
          '<p class="status" id="ocr-status" role="status" hidden></p>' +
        '</div>' +
        '<p class="form-error" id="entryError" role="alert" hidden></p>' +
        '<button class="btn primary wide" type="submit">' + t('addEntryBtn') + '</button>' +
      '</form>' +
    '</section>' +

    '<section class="card">' +
      '<div class="list-head"><h2>' + t('entries') + ' <span class="count-pill">' + entries.length + '</span></h2></div>' +
      (entries.length
        ? '<div class="entries">' + entries.map(entryHtml).join('') + '</div>'
        : '<p class="empty">' + t('noEntries') + '</p>') +
    '</section>';

  const form = document.getElementById('entryForm');
  const screenshotInput = document.getElementById('shot-input');
  const preview = document.getElementById('shot-preview');
  pendingScreenshot = null;

  screenshotInput.addEventListener('change', function () {
    const file = screenshotInput.files && screenshotInput.files[0];
    if (!file) {
      pendingScreenshot = null;
      preview.hidden = true;
      return;
    }
    if (!file.type.startsWith('image/')) {
      screenshotInput.value = '';
      toast(t('scanFailed'));
      return;
    }
    compressImage(file, 720, 0.74).then(function (dataUrl) {
      pendingScreenshot = dataUrl;
      preview.src = dataUrl;
      preview.hidden = false;
      if (form.querySelector('input[name="type"]:checked').value === 'payment') {
        scanScreenshot(dataUrl);
      }
    }).catch(function () {
      pendingScreenshot = null;
      screenshotInput.value = '';
      preview.hidden = true;
      toast(t('scanFailed'));
    });
  });

  form.querySelectorAll('input[name="type"]').forEach(function (radio) {
    radio.addEventListener('change', function () {
      const isPayment = form.querySelector('input[name="type"]:checked').value === 'payment';
      if (isPayment && pendingScreenshot) scanScreenshot(pendingScreenshot);
    });
  });

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    addEntry(form, customer);
  });

  const editForm = document.querySelector('[data-edit-form]');
  if (editForm) {
    editForm.addEventListener('submit', function (event) {
      event.preventDefault();
      saveEdit(editForm);
    });
  }
}

function addEntry(form, customer) {
  const errorEl = document.getElementById('entryError');
  const type = form.querySelector('input[name="type"]:checked').value;
  const amount = Number(form.elements.amount.value);
  const date = form.elements.date.value || todayISO();
  const note = form.elements.note.value.trim();

  function fail(message) {
    errorEl.textContent = message;
    errorEl.hidden = false;
  }

  if (!Number.isFinite(amount) || amount <= 0) return fail(t('errAmount'));
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return fail(t('errDate'));

  const entry = {
    id: uid(),
    phone: customer.phone,
    type: type,
    amount: round2(amount),
    date: date,
    note: note,
    createdAt: Date.now()
  };
  if (type === 'payment' && pendingScreenshot) entry.image = pendingScreenshot;

  state.entries.push(entry);

  if (!persist()) {
    if (entry.image) {
      delete entry.image;
      if (persist()) {
        toast(t('imageTooBig'));
        pendingScreenshot = null;
        render();
        return;
      }
    }
    state.entries.pop();
    return fail(t('storageFull'));
  }

  pendingScreenshot = null;
  render();
  toast(type === 'credit' ? t('entryAddedCredit') : t('entryAddedPayment'));
}

function saveEdit(form) {
  const id = form.getAttribute('data-edit-form');
  const entry = state.entries.find(function (item) { return item.id === id; });
  if (!entry) return;

  const errorEl = form.querySelector('.form-error');
  const type = form.querySelector('input[name="editType"]:checked').value;
  const amount = Number(form.elements.amount.value);
  const date = form.elements.date.value;
  const note = form.elements.note.value.trim();

  function fail(message) {
    errorEl.textContent = message;
    errorEl.hidden = false;
  }

  if (!Number.isFinite(amount) || amount <= 0) return fail(t('errAmount'));
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return fail(t('errDate'));

  entry.type = type;
  entry.amount = round2(amount);
  entry.date = date;
  entry.note = note;
  if (type === 'credit') delete entry.image;

  if (!persist()) toast(t('storageFull'));
  editingId = null;
  render();
  toast(t('entryUpdated'));
}

/* ---------------- one-time events ---------------- */

appEl.addEventListener('click', function (event) {
  const shot = event.target.closest('[data-shot]');
  if (shot) {
    const entry = state.entries.find(function (item) { return item.id === shot.getAttribute('data-shot'); });
    if (entry && entry.image) openLightbox(entry.image);
    return;
  }

  const edit = event.target.closest('[data-edit]');
  if (edit) {
    editingId = edit.getAttribute('data-edit');
    pendingDeleteId = null;
    render();
    return;
  }

  const del = event.target.closest('[data-delete]');
  if (del) {
    pendingDeleteId = del.getAttribute('data-delete');
    editingId = null;
    render();
    return;
  }

  const delConfirm = event.target.closest('[data-delete-confirm]');
  if (delConfirm) {
    const id = delConfirm.getAttribute('data-delete-confirm');
    state.entries = state.entries.filter(function (item) { return item.id !== id; });
    pendingDeleteId = null;
    editingId = null;
    if (!persist()) toast(t('storageFull'));
    render();
    toast(t('entryDeleted'));
    return;
  }

  if (event.target.closest('[data-cancel-delete]')) {
    pendingDeleteId = null;
    render();
    return;
  }

  if (event.target.closest('[data-cancel-edit]')) {
    editingId = null;
    render();
  }
});

langSelect.addEventListener('change', function () {
  state.lang = ['en', 'hi', 'te'].indexOf(langSelect.value) >= 0 ? langSelect.value : 'en';
  if (!persist()) toast(t('storageFull'));
  render();
});

window.addEventListener('hashchange', function () {
  editingId = null;
  pendingDeleteId = null;
  pendingScreenshot = null;
  render();
});

render();
