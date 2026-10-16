(function () {
  const container = document.getElementById('kid-tempo-samples');
  if (!container) return;
  const current = document.currentScript;
  const root = new URL('.', current ? current.src : location.href);
  const expressive = new URL('../indo-v4-kids-prosody-02/', root);
  const make = (tag, text, className) => {
    const element = document.createElement(tag);
    if (text !== undefined) element.textContent = text;
    if (className) element.className = className;
    return element;
  };
  const style = document.createElement('style');
  style.textContent = '.tempo-card{background:#fff;border:1px solid #dbe7de;border-radius:15px;margin:13px 0;padding:15px}.tempo-card h3{margin:0 0 5px;font-size:18px}.tempo-card p{margin:0 0 10px;color:#4d6570;font-size:14px}.tempo-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}.tempo-player{background:#f5f8f5;padding:12px;border-radius:11px;min-width:0}.tempo-player strong{display:block;font-size:13px;min-height:35px;margin-bottom:8px}.tempo-player audio{display:block;width:100%;height:44px}.tempo-script{font-size:13px;background:#f5f8f5;padding:10px;border-radius:9px;margin-top:10px;overflow-wrap:anywhere}.tempo-meta{font-size:12px;color:#566969}@media(max-width:670px){.tempo-grid{grid-template-columns:1fr}.tempo-player strong{min-height:0}}';
  document.head.append(style);
  Promise.all([
    fetch(new URL('samples.json', root)).then(r => {if(!r.ok) throw Error('katalog lama tidak ditemukan'); return r.json()}),
    fetch(new URL('manifest.json', root)).then(r => r.ok ? r.json() : {entries:{}}),
    fetch(new URL('samples.json', expressive)).then(r => {if(!r.ok) throw Error('katalog baru tidak ditemukan'); return r.json()}),
    fetch(new URL('manifest.json', expressive)).then(r => r.ok ? r.json() : {entries:{}})
  ]).then(([old, oldManifest, fresh, freshManifest]) => {
    container.replaceChildren();
    const ready = fresh.samples.filter(s => freshManifest.entries && freshManifest.entries[s.id]).length;
    container.append(make('p', ready + ' dari 3 kandidat ritme natural sudah siap. Semuanya diputar pada 1×.', 'tempo-meta'));
    for (const item of fresh.samples) {
      const prior = old.samples.find(s => s.id === item.id);
      if (!prior) continue;
      const card = make('article', undefined, 'tempo-card');
      card.append(make('h3', item.title), make('p', item.purpose || 'Bandingkan tiga cara narator mengucapkannya.'));
      const grid = make('div', undefined, 'tempo-grid');
      const choices = [
        { name: 'Audio aktif sekarang', source: new URL(prior.original, root) },
        { name: 'Percobaan terlalu pelan', source: oldManifest.entries && oldManifest.entries[item.id] ? new URL(item.id + '.mp3', root) : null },
        { name: 'Baru: intonasi & ritme natural', source: freshManifest.entries && freshManifest.entries[item.id] ? new URL(item.id + '.mp3', expressive) : null }
      ];
      for (const choice of choices) {
        const panel = make('div', undefined, 'tempo-player');
        panel.append(make('strong', choice.name));
        if (choice.source) {
          const audio = document.createElement('audio');
          audio.controls = true;
          audio.preload = 'none';
          audio.src = choice.source.href;
          panel.append(audio);
        } else {
          panel.append(make('p', 'Audio sedang diproses. Coba muat ulang nanti.', 'tempo-meta'));
        }
        grid.append(panel);
      }
      card.append(grid, make('div', 'Arahan ucapan baru: ' + item.text, 'tempo-script'));
      container.append(card);
    }
    document.addEventListener('play', event => {
      if (!(event.target instanceof HTMLAudioElement)) return;
      document.querySelectorAll('audio').forEach(a => {
        if (a !== event.target && !a.paused) a.pause();
      });
    }, true);
  }).catch(error => {
    container.textContent = 'Gagal memuat perbandingan audio: ' + error.message;
  });
})();
