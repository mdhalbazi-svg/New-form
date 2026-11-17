window.ICONS={
home:'<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>',
ibadat:'<path d="M4 21V12a8 8 0 0 1 16 0v9"/><path d="M12 4V2"/><path d="M9 21v-4a3 3 0 0 1 6 0v4"/>',
adhkar:'<circle cx="12" cy="4.5" r="2"/><circle cx="18.5" cy="8.5" r="2"/><circle cx="18.5" cy="15.5" r="2"/><circle cx="12" cy="19.5" r="2"/><circle cx="5.5" cy="15.5" r="2"/><circle cx="5.5" cy="8.5" r="2"/>',
duas:'<path d="M12 6c-2-2-5-2-9-1v14c4-1 7-1 9 1 2-2 5-2 9-1V5c-4-1-7-1-9 1z"/><path d="M12 6v14"/>',
qibla:'<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>',
more:'<circle cx="5" cy="12" r="1.7"/><circle cx="12" cy="12" r="1.7"/><circle cx="19" cy="12" r="1.7"/>',
muh:'<path d="M6 3h12v18H6z"/><path d="M9 8h6M9 12h6M9 16h4"/>',
notes:'<path d="M4 20l4-1 11-11-3-3L5 16z"/>',
reports:'<path d="M5 20V10M12 20V4M19 20v-7"/>',
theme:'<circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/>',
plus:'<path d="M12 5v14M5 12h14"/>',trash:'<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',edit:'<path d="M4 20l4-1 11-11-3-3L5 16z"/>',reset:'<path d="M4 12a8 8 0 1 0 3-6.2M4 4v4h4"/>',check:'<path d="M5 12l5 5 9-10"/>',gps:'<circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="8"/><path d="M12 1v3M12 20v3M1 12h3M20 12h3"/>'
};
window.ic=function(n,s){s=s||22;return '<svg class="ic" width="'+s+'" height="'+s+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">'+(ICONS[n]||'')+'</svg>';};
