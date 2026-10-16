(function () {
  const target = document.getElementById('kid-tempo-samples');
  if (!target) return;
  const script = document.currentScript;
  const base = new URL('.', script ? script.src : location.href);
  const style = document.createElement('style');
  style.textContent = '.tempo-sample{background:#fff;border:1px solid #dbe7de;border-radius:15px;margin:12px 0;padding:15px}.tempo-sample h3{margin:0 0 5px;font-size:18px}.tempo-sample p{margin:0 0 10px;color:#4d6570;font-size:14px}.tempo-players{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.tempo-player{background:#f5f8f5;padding:12px;border-radius:11px;min-width:0}.tempo-player strong{display:block;font-size:13px;margin-bottom:8px}.tempo-player audio{display:block;width:100%;height:44px}.tempo-script{font-size:13px;background:#f5f8f5;padding:10px;border-radius:9px;margin-top:10px;overflow-wrap:anywhere}.tempo-meta{font-size:12px;color:#566969}@media(max-width:640px){.tempo-players{grid-template-columns:1fr}}';
  document.head.appendChild(style);
  const make = (tag, text, className) => {
    const element = document.createElement(tag);
    if (text !== undefined) element.textContent = text;
    if (className) element.className = className;
    return element;
  };
  Promise.all([
    fetch(new URL('samples.json',base)).then(r => {if(!r.ok) throw Error('katalog belum tersedia');return r.json()}),
    fetch(new URL('manifest.json',base)).then(r => r.ok ? r.json() : {entries:{},generated_count:0}),
  ]).then(([data, manifest]) => {
    target.replaceChildren();
    target.append(make('p', String(manifest.generated_count||0) + ' dari 3 sampel baru tersedia.', 'tempo-meta'));
    for (const item of data.samples) {
      const card = make('article',undefined,'tempo-sample');
      card.append(make('h3',item.title), make('p',item.context));
      const players = make('div',undefined,'tempo-players');
      const before = make('div',undefined,'tempo-player');
      before.append(make('strong','Rekaman aktif · Eleven v4 (1×)'));
      const beforeAudio = document.createElement('audio');
      beforeAudio.controls = true; beforeAudio.preload = 'none';
      beforeAudio.src = new URL(item.original,base).href;
      before.append(beforeAudio);
      const after = make('div',undefined,'tempo-player');
      after.append(make('strong','Kandidat lebih pelan · Eleven v4 (1×)'));
      if (manifest.entries && manifest.entries[item.id]) {
        const afterAudio = document.createElement('audio');
        afterAudio.controls = true; afterAudio.preload = 'none';
        afterAudio.src = new URL(item.id+'.mp3',base).href;
        after.append(afterAudio);
      } else {
        after.append(make('p','Sedang disiapkan. Coba lagi setelah generasi selesai.','tempo-meta'));
      }
      players.append(before,after);
      card.append(players,make('div','Naskah kandidat: '+item.text,'tempo-script'));
      target.append(card);
    }
    const audioElements=target.querySelectorAll('audio');
    audioElements.forEach(a=>a.addEventListener('play',()=>audioElements.forEach(b=>{if(b!==a)b.pause()})));
  }).catch(e=>{target.textContent='Gagal menampilkan sampel: '+e.message});
})();
