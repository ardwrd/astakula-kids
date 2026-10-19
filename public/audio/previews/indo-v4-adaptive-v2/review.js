(function () {
  const root = document.getElementById('adaptive-voice-list');
  if (!root) return;
  const script = document.currentScript;
  const base = new URL('.', script ? script.src : location.href);
  const make = (tag, value, className) => {
    const element = document.createElement(tag);
    if (value !== undefined) element.textContent = value;
    if (className) element.className = className;
    return element;
  };
  const css = document.createElement('style');
  css.textContent = '.adaptive-group{display:flex;gap:7px;flex-wrap:wrap;margin:14px 0}.adaptive-group button{min-height:40px}.adaptive-group button.selected{background:#265c51;color:#fff}.adaptive-item{padding:14px;border:1px solid #dce7de;background:#fff;border-radius:12px;margin:10px 0}.adaptive-item h3{font-size:16px;margin:0 0 5px}.adaptive-players{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.adaptive-players>div{background:#f5f9f6;padding:10px;border-radius:8px;min-width:0}.adaptive-players strong{display:block;font-size:12px;margin-bottom:8px}.adaptive-players audio{width:100%;display:block;height:43px}.adaptive-cue{font-size:13px;margin:8px 0;color:#4c6266}.adaptive-empty{padding:14px;border-radius:9px;background:#fff8e9;color:#7c5a26;font-size:13px}@media(max-width:620px){.adaptive-players{grid-template-columns:1fr}}';
  document.head.append(css);
  Promise.all([
    fetch(new URL('catalog.json',base)).then(r=>{if(!r.ok)throw Error('katalog tidak ditemukan');return r.json()}),
    fetch(new URL('manifest.json',base)).then(r=>r.ok?r.json():{entries:{},generated_count:0,required_count:104})
  ]).then(([catalog,manifest])=>{
    const available = catalog.clips.filter(x=>Boolean(manifest.entries && manifest.entries[x.key]));
    root.replaceChildren();
    root.append(make('p',available.length+' / '+catalog.clips.length+' kandidat audio tersedia untuk uji dengar. Rekaman aktif tidak berubah.','muted'));
    const tabs = make('div',undefined,'adaptive-group');
    const list = make('div');
    root.append(tabs,list);
    const roles=[['all','Semua'],['instruction','Instruksi'],['question','Pertanyaan'],['praise','Pujian'],['retry','Dukungan'],['welcome','Sambutan'],['intro','Pengantar'],['short','Huruf & angka']];
    let filter='all';
    function draw(){
      tabs.replaceChildren();
      for(const [id,label] of roles){
        const tab=make('button',label+(id==='all'?' ('+available.length+')':' ('+available.filter(x=>x.role===id).length+')'),filter===id?'selected':'');
        tab.type='button';tab.setAttribute('aria-pressed',String(filter===id));
        tab.addEventListener('click',()=>{filter=id;draw()});
        tabs.append(tab);
      }
      list.replaceChildren();
      const selection=available.filter(item=>filter==='all'||item.role===filter);
      if(!selection.length){
        list.append(make('div','Belum ada kandidat pada kategori ini. Batch berikutnya bisa dibuat melalui GitHub Actions.','adaptive-empty'));
        return;
      }
      for(const item of selection){
        const card=make('article',undefined,'adaptive-item');
        card.append(make('h3',item.label),make('p',item.delivery+' · '+item.key,'adaptive-cue'));
        const players=make('div',undefined,'adaptive-players');
        for(const [label,src] of [
          ['Audio aktif sekarang',new URL(item.original,base)],
          ['Kandidat ritme adaptif (1×)',new URL(item.key+'.mp3',base)]
        ]){
          const panel=make('div');
          panel.append(make('strong',label));
          const audio=document.createElement('audio');
          audio.controls=true;audio.preload='none';audio.src=src.href;
          panel.append(audio);players.append(panel);
        }
        card.append(players,make('p','Naskah: '+item.text,'adaptive-cue'));
        list.append(card);
      }
    }
    draw();
    document.addEventListener('play',event=>{
      if(!(event.target instanceof HTMLAudioElement))return;
      document.querySelectorAll('audio').forEach(other=>{if(other!==event.target&&!other.paused)other.pause()});
    },true);
  }).catch(e=>{root.textContent='Gagal memuat batch narator: '+e.message});
})();
