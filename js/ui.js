const UI = (() => {
  const $ = sel => document.querySelector(sel);
  function toast(msg, ms=2400){
    const t = $('#toast');
    t.textContent = msg;
    t.classList.remove('hidden');
    clearTimeout(t._tm);
    t._tm = setTimeout(()=>t.classList.add('hidden'), ms);
  }
  function openModal(html){
    $('#modalBody').innerHTML = html;
    $('#modal').classList.remove('hidden');
  }
  function closeModal(){ $('#modal').classList.add('hidden'); $('#modalBody').innerHTML=''; }
  function escape(s){ return (s==null?'':String(s)).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
  function fmtDate(ts){
    if(!ts) return '—';
    const d = new Date(ts);
    return d.toLocaleDateString('es-ES', { day:'2-digit', month:'short', year:'numeric' });
  }
  function fmtDateTime(ts){
    if(!ts) return '—';
    return new Date(ts).toLocaleString('es-ES');
  }
  function fmtDateInput(ts){
    if(!ts) return '';
    const d = new Date(ts);
    return d.toISOString().slice(0,10);
  }
  function statusLabel(s){
    return ({
      pending:'Pendiente', in_progress:'En proceso',
      awaiting:'Esperando recogida', completed:'Completada', delivered:'Entregada'
    })[s] || s;
  }
  // Render del nombre del sistema con segunda palabra en marrón
  function renderBrand(name){
    const parts = String(name||'').trim().split(/\s+/);
    if(parts.length < 2) return escape(parts[0]||'');
    return `${escape(parts[0])} <span class="w2">${escape(parts.slice(1).join(' '))}</span>`;
  }
  // Limpia un número para tel:/sms:/wa.me
  function phoneClean(p){ return String(p||'').replace(/[^\d+]/g,''); }
  function phoneWa(p){ return String(p||'').replace(/\D/g,''); }
  function phoneSms(p){ return String(p||'').replace(/[^\d+]/g,''); }

  // Confirmación elegante (Promise<boolean>)
  function confirmDialog({title='¿Confirmar?', message='', okText='Aceptar', cancelText='Cancelar', danger=false}={}){
    return new Promise(resolve=>{
      const wrap = document.createElement('div');
      wrap.className = 'confirm-overlay';
      wrap.innerHTML = `
        <div class="confirm-card" role="dialog" aria-modal="true">
          <h3>${escape(title)}</h3>
          <p>${escape(message)}</p>
          <div class="btn-row">
            <button class="btn-secondary" data-act="cancel">${escape(cancelText)}</button>
            <button class="btn-primary ${danger?'btn-cancel':''}" data-act="ok">${escape(okText)}</button>
          </div>
        </div>`;
      document.body.appendChild(wrap);
      function close(v){ wrap.remove(); resolve(v); }
      wrap.addEventListener('click', e=>{
        if(e.target===wrap) close(false);
        const act = e.target.closest('[data-act]')?.dataset.act;
        if(act==='ok') close(true);
        if(act==='cancel') close(false);
      });
    });
  }

  function capitalizeWords(str){
    if(!str) return '';
    return str.replace(/(^|\s)([\p{L}])/gu, (_,sp,ch)=> sp + ch.toLocaleUpperCase('es'));
  }
  function attachAutoCapitalize(input){
    if(!input) return;
    input.setAttribute('autocapitalize','words');
    input.addEventListener('input', ()=>{
      const start = input.selectionStart;
      const newVal = capitalizeWords(input.value);
      if(newVal !== input.value){
        input.value = newVal;
        try{ input.setSelectionRange(start, start); }catch(e){}
      }
    });
  }
  // Estado global compartido del visor — evita que swipes posteriores
  // reutilicen las imágenes de un cliente anterior.
  const _viewerState = { srcs: [], i: 0, el: null, keyHandler: null };
  function openImageViewer(srcs, index=0){
    if(typeof srcs === 'string') srcs = [srcs];
    if(!srcs || !srcs.length) return;
    // Copia defensiva — si el llamador muta su array, no nos afecta
    _viewerState.srcs = srcs.slice();
    _viewerState.i = Math.max(0, Math.min(index, _viewerState.srcs.length-1));

    let el = _viewerState.el;
    if(!el){
      el = document.createElement('div');
      el.id = 'imgViewer';
      el.className = 'img-viewer';
      el.innerHTML = `
        <button class="iv-close" aria-label="Cerrar">&times;</button>
        <button class="iv-prev" aria-label="Anterior">&#10094;</button>
        <img class="iv-img" alt="">
        <button class="iv-next" aria-label="Siguiente">&#10095;</button>
        <div class="iv-count"></div>`;
      document.body.appendChild(el);
      _viewerState.el = el;
      el.addEventListener('click', e=>{
        if(e.target===el || e.target.classList.contains('iv-close')) closeViewer();
      });
      el.querySelector('.iv-prev').addEventListener('click', ()=> showAt(_viewerState.i-1));
      el.querySelector('.iv-next').addEventListener('click', ()=> showAt(_viewerState.i+1));
      // Soporte gestos táctiles para imágenes únicas: no navegar
      let tStartX = 0, tStartY = 0;
      el.addEventListener('touchstart', e=>{
        if(!e.touches[0]) return;
        tStartX = e.touches[0].clientX; tStartY = e.touches[0].clientY;
      }, {passive:true});
      el.addEventListener('touchend', e=>{
        if(_viewerState.srcs.length<=1) return;
        const t = e.changedTouches[0]; if(!t) return;
        const dx = t.clientX - tStartX, dy = t.clientY - tStartY;
        if(Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)){
          showAt(_viewerState.i + (dx<0 ? 1 : -1));
        }
      });
      _viewerState.keyHandler = e=>{
        if(!el.classList.contains('open')) return;
        if(e.key==='Escape') closeViewer();
        if(_viewerState.srcs.length<=1) return;
        if(e.key==='ArrowLeft') showAt(_viewerState.i-1);
        if(e.key==='ArrowRight') showAt(_viewerState.i+1);
      };
      document.addEventListener('keydown', _viewerState.keyHandler);
    }
    function showAt(n){
      const len = _viewerState.srcs.length;
      if(!len) return;
      _viewerState.i = (n + len) % len;
      el.querySelector('.iv-img').src = _viewerState.srcs[_viewerState.i];
      el.querySelector('.iv-count').textContent = len>1 ? `${_viewerState.i+1} / ${len}` : '';
      el.querySelector('.iv-prev').style.display = len>1 ? '' : 'none';
      el.querySelector('.iv-next').style.display = len>1 ? '' : 'none';
    }
    function closeViewer(){
      el.classList.remove('open');
      // Limpia para que no aparezcan fotos de otros clientes después
      _viewerState.srcs = [];
      _viewerState.i = 0;
      const img = el.querySelector('.iv-img'); if(img) img.src = '';
    }
    showAt(_viewerState.i);
    el.classList.add('open');
  }
  async function resizeImage(file, maxDim=900, quality=.72){
    return new Promise((resolve,reject)=>{
      const reader = new FileReader();
      reader.onload = e => {
        const img = new Image();
        img.onload = () => {
          let {width,height} = img;
          if(width>height && width>maxDim){ height = height*maxDim/width; width = maxDim; }
          else if(height>maxDim){ width = width*maxDim/height; height = maxDim; }
          const c = document.createElement('canvas');
          c.width=width; c.height=height;
          c.getContext('2d').drawImage(img,0,0,width,height);
          resolve(c.toDataURL('image/jpeg', quality));
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
  async function blobToDataUrl(blob){
    return new Promise((res,rej)=>{
      const r = new FileReader();
      r.onload = ()=> res(r.result);
      r.onerror = rej;
      r.readAsDataURL(blob);
    });
  }

  // Grabador de audio MEJORADO — sin cortes, alta calidad
  function pickAudioMime(){
    const types = [
      'audio/webm;codecs=opus',
      'audio/ogg;codecs=opus',
      'audio/mp4;codecs=mp4a.40.2',
      'audio/webm',
      'audio/mp4'
    ];
    if(!('MediaRecorder' in window)) return '';
    for(const t of types){
      try{ if(MediaRecorder.isTypeSupported(t)) return t; }catch(e){}
    }
    return '';
  }
  function createRecorder(){
    let mediaRec = null, chunks = [], stream = null, startedAt = 0, tickTimer = null;
    return {
      async start(onTick){
        // pedimos buena calidad y sin procesamiento agresivo que entrecorta voz
        stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            channelCount: 1,
            sampleRate: 48000,
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        });
        chunks = [];
        const mime = pickAudioMime();
        const opts = { audioBitsPerSecond: 128000 };
        if(mime) opts.mimeType = mime;
        try{
          mediaRec = new MediaRecorder(stream, opts);
        }catch(e){
          // fallback sin opciones
          mediaRec = new MediaRecorder(stream);
        }
        mediaRec.ondataavailable = e => { if(e.data && e.data.size) chunks.push(e.data); };
        // timeslice 1000ms = recoge datos cada segundo (evita pérdidas si algo interrumpe)
        mediaRec.start(1000);
        startedAt = Date.now();
        if(onTick){
          onTick(0);
          tickTimer = setInterval(()=> onTick(Math.floor((Date.now()-startedAt)/1000)), 500);
        }
      },
      async stop(){
        clearInterval(tickTimer);
        return new Promise((res,rej)=>{
          if(!mediaRec) return rej(new Error('No recorder'));
          mediaRec.onstop = async ()=>{
            try{
              const type = mediaRec.mimeType || 'audio/webm';
              const blob = new Blob(chunks, { type });
              if(stream) stream.getTracks().forEach(t=>t.stop());
              res(await blobToDataUrl(blob));
            }catch(e){ rej(e); }
          };
          // mediaRec.requestData() opcional, stop() emite el último chunk
          try{ mediaRec.stop(); }catch(e){ rej(e); }
        });
      },
      cancel(){
        clearInterval(tickTimer);
        try{ mediaRec && mediaRec.state!=='inactive' && mediaRec.stop(); }catch(e){}
        try{ stream && stream.getTracks().forEach(t=>t.stop()); }catch(e){}
      },
      isRecording(){ return mediaRec && mediaRec.state==='recording'; }
    };
  }
  return { $, toast, openModal, closeModal, escape, fmtDate, fmtDateTime, fmtDateInput, statusLabel, resizeImage, blobToDataUrl, createRecorder, capitalizeWords, attachAutoCapitalize, openImageViewer, renderBrand, phoneClean, phoneWa, phoneSms, confirmDialog };
})();
