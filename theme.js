/* ===== ایپ بنانے والے کے لیے ڈیزائن کی ترتیبات / CREATOR DESIGN SETTINGS =====
   صرف اس فائل کو بدل کر ایپ کا رنگ، نام، فونٹ اور ٹیبز تبدیل کریں۔
   Edit only this file to change colours, names, fonts, corner radius and which tabs appear. */
window.APP_THEME = {
  nameUr: 'میرا دینی روزنامچہ',
  nameEn: 'My Islamic Daily Diary',
  defaultTheme: 'emerald',          // نیچے themes میں سے کوئی نام
  fontFamily: '"Noto Naskh Arabic","Noto Sans Arabic","Droid Arabic Naskh",system-ui,sans-serif',
  radius: '18px',                   // کارڈز کے کونے
  headerPattern: true,              // ہیڈر پر اسلامی نقش
  allowUserThemePicker: true,       // صارف تھیم بدل سکے؟
  tabs: ['home','ibadat','adhkar','duas','qibla','more'],  // نچلی پٹی
  themes: {
    emerald:  {n:'زمرد|Emerald',   p:'#0a7a58', p2:'#0d5c44', a:'#e0b942', bg:'#f3f8f5', card:'#ffffff', tx:'#17251f', mu:'#6b7d74'},
    midnight: {n:'رات|Midnight',   p:'#2b3a67', p2:'#1b2545', a:'#f2c14e', bg:'#eef0f7', card:'#ffffff', tx:'#171c2e', mu:'#6c7390'},
    teal:     {n:'فیروزی|Teal',    p:'#0e7c86', p2:'#0a5961', a:'#f4a259', bg:'#f0f8f8', card:'#ffffff', tx:'#122426', mu:'#668082'},
    rose:     {n:'گلابی|Rose',     p:'#a63d5d', p2:'#7b2742', a:'#e8b04a', bg:'#fbf3f5', card:'#ffffff', tx:'#2a1820', mu:'#86707a'},
    dark:     {n:'گہرا|Dark',      p:'#11a77a', p2:'#0b2b22', a:'#e0b942', bg:'#0e1714', card:'#16221d', tx:'#e6f1ec', mu:'#93a8a0'}
  }
};
