// =============================================================
// Sincronización GitHub — v18
// - Logger en vivo: cada operación (conexión, listar, subir, bajar,
//   actualizar, eliminar) queda registrada con timestamp y nivel.
// - Almacenamiento POR REPARACIÓN: cada reparación se guarda en su
//   propio archivo `<base>/repairs/<id>.json` con sus fotos, audio y
//   datos. Así nada se mezcla con otras reparaciones.
// - Un archivo `<base>/index.json` guarda ajustes, transacciones,
//   contadores y la lista de IDs.
// - Mantiene compatibilidad: si encuentra un archivo único legado
//   (con `repairs:[...]`) lo importa y a partir de ahí trabaja con el
//   formato nuevo.
// =============================================================

const GitLog = (() => {
  const MAX = 300;
  const entries = [];
  const subs = new Set();
  function emit(){ subs.forEach(fn => { try{ fn(entries); }catch(e){} }); }
  function add(level, tag, msg){
    const e = { t: Date.now(), level, tag, msg: String(msg||'') };
    entries.push(e);
    if(entries.length > MAX) entries.splice(0, entries.length - MAX);
    // eslint-disable-next-line no-console
    try{ console[level==='err'?'error':level==='warn'?'warn':'log'](`[gh:${tag}]`, e.msg); }catch(_){}
    emit();
    return e;
  }
  return {
    info: (tag,msg)=>add('info',tag,msg),
    ok:   (tag,msg)=>add('ok',tag,msg),
    warn: (tag,msg)=>add('warn',tag,msg),
    err:  (tag,msg)=>add('err',tag,msg),
    net:  (tag,msg)=>add('net',tag,msg),
    all:  ()=> entries.slice(),
    clear(){ entries.length = 0; emit(); },
    subscribe(fn){ subs.add(fn); fn(entries); return ()=>subs.delete(fn); }
  };
})();
window.GitLog = GitLog;

const GitSync = (() => {
  let pushTimer = null;
  let busy = false;
  let lastHashes = {}; // id -> hash de su JSON (para detectar cambios)
  let knownDeleted = new Set();
  // Tombstones de transacciones (las transacciones viven dentro de index.json,
  // así que necesitamos recordar localmente cuáles borramos para que no
  // reaparezcan si otro dispositivo sube un index.json antiguo antes que
  // nosotros podamos subir el nuestro.)
  let knownDeletedTx = new Set();

  // ---------- Configuración ----------
  function g(){ return DB.settings.github; }
  function cfgOk(){
    const c = g();
    return !!(c.enabled && c.token && c.user && c.repo);
  }
  function basePath(){
    // Acepta tanto rutas tipo "carpeta" como rutas con .json (legado).
    const raw = (g().path || 'taller-data').trim().replace(/^\/+|\/+$/g,'');
    if(/\.json$/i.test(raw)){
      // Legado: usamos la carpeta padre + nombre sin extensión como base
      const noExt = raw.replace(/\.json$/i,'');
      return noExt || 'taller-data';
    }
    return raw || 'taller-data';
  }
  function indexFile(){ return basePath() + '/index.json'; }
  function repairFile(id){ return basePath() + '/repairs/' + id + '.json'; }
  function repairsDir(){ return basePath() + '/repairs'; }

  // ---------- Util base64 unicode-safe ----------
  function b64encode(str){
    const bytes = new TextEncoder().encode(str);
    let bin = '';
    for(const b of bytes) bin += String.fromCharCode(b);
    return btoa(bin);
  }
  function b64decode(b64){
    const bin = atob((b64||'').replace(/\n/g,''));
    const bytes = new Uint8Array(bin.length);
    for(let i=0;i<bin.length;i++) bytes[i] = bin.charCodeAt(i);
    return new TextDecoder().decode(bytes);
  }

  async function sha256(str){
    const buf = new TextEncoder().encode(str);
    const h = await crypto.subtle.digest('SHA-256', buf);
    return Array.from(new Uint8Array(h)).map(b=>b.toString(16).padStart(2,'0')).join('');
  }

  // ---------- HTTP base ----------
  async function api(path, init={}){
    const c = g();
    const url = `https://api.github.com${path}`;
    const method = (init.method || 'GET').toUpperCase();
    GitLog.net(method, path);
    let resp;
    try{
      resp = await fetch(url, {
        ...init,
        headers: {
          'Accept':'application/vnd.github+json',
          'Authorization': `token ${c.token}`,
          'Content-Type':'application/json',
          'X-GitHub-Api-Version':'2022-11-28',
          ...(init.headers||{})
        }
      });
    }catch(netErr){
      GitLog.err('red', 'Sin conexión: '+netErr.message);
      throw netErr;
    }
    if(!resp.ok && resp.status !== 404){
      let txt = ''; try{ txt = (await resp.text()).slice(0,200); }catch(_){}
      GitLog.err(String(resp.status), `${method} ${path} → ${resp.status} ${txt}`);
    }
    return resp;
  }

  // ---------- Operaciones primitivas ----------
  async function getFile(path){
    const c = g();
    const r = await api(`/repos/${c.user}/${c.repo}/contents/${encodeURI(path)}?ref=${encodeURIComponent(c.branch||'main')}`);
    if(r.status === 404) return { sha:null, content:null };
    if(!r.ok) throw new Error('GET '+path+' '+r.status);
    const j = await r.json();
    return { sha:j.sha, content: b64decode(j.content||'') };
  }
  async function putFile(path, content, sha, msg){
    const c = g();
    const body = {
      message: msg || `taller: ${path}`,
      content: b64encode(content),
      branch: c.branch || 'main'
    };
    if(sha) body.sha = sha;
    const r = await api(`/repos/${c.user}/${c.repo}/contents/${encodeURI(path)}`, {
      method:'PUT', body: JSON.stringify(body)
    });
    if(!r.ok){
      const t = await r.text();
      throw new Error('PUT '+path+' '+r.status+' '+t.slice(0,160));
    }
    const j = await r.json();
    return j.content.sha;
  }
  async function deleteFile(path, sha){
    const c = g();
    const body = {
      message: `taller: borrar ${path}`,
      sha, branch: c.branch || 'main'
    };
    const r = await api(`/repos/${c.user}/${c.repo}/contents/${encodeURI(path)}`, {
      method:'DELETE', body: JSON.stringify(body)
    });
    if(!r.ok && r.status !== 404){
      const t = await r.text();
      throw new Error('DELETE '+path+' '+r.status+' '+t.slice(0,160));
    }
  }
  async function listDir(path){
    const c = g();
    const r = await api(`/repos/${c.user}/${c.repo}/contents/${encodeURI(path)}?ref=${encodeURIComponent(c.branch||'main')}`);
    if(r.status === 404) return [];
    if(!r.ok) throw new Error('LIST '+path+' '+r.status);
    const j = await r.json();
    return Array.isArray(j) ? j : [];
  }
  async function getRepo(){
    const c = g();
    const r = await api(`/repos/${c.user}/${c.repo}`);
    if(!r.ok) throw new Error('Repo '+r.status);
    return r.json();
  }
  async function getUser(){
    const r = await api(`/user`);
    if(!r.ok) throw new Error('Usuario '+r.status);
    return r.json();
  }

  // ---------- Hashes y deltas ----------
  function repairHashKey(id){ return 'taller_gh_hash_'+id; }
  function loadHashCache(){
    try{ lastHashes = JSON.parse(localStorage.getItem('taller_gh_hashes')||'{}'); }
    catch(_){ lastHashes = {}; }
  }
  function saveHashCache(){
    try{ localStorage.setItem('taller_gh_hashes', JSON.stringify(lastHashes)); }catch(_){}
  }
  function loadDeleted(){
    try{ knownDeleted = new Set(JSON.parse(localStorage.getItem('taller_gh_deleted')||'[]')); }
    catch(_){ knownDeleted = new Set(); }
    try{ knownDeletedTx = new Set(JSON.parse(localStorage.getItem('taller_gh_deleted_tx')||'[]')); }
    catch(_){ knownDeletedTx = new Set(); }
  }
  function saveDeleted(){
    try{ localStorage.setItem('taller_gh_deleted', JSON.stringify([...knownDeleted])); }catch(_){}
    try{ localStorage.setItem('taller_gh_deleted_tx', JSON.stringify([...knownDeletedTx])); }catch(_){}
  }
  function markDeleted(id){
    knownDeleted.add(id);
    saveDeleted();
    GitLog.info('marca', `Reparación ${id} pendiente de eliminar en GitHub`);
    schedulePush();
  }
  function markDeletedTx(id){
    knownDeletedTx.add(id);
    saveDeleted();
    GitLog.info('marca', `Transacción ${id} pendiente de eliminar en GitHub`);
    schedulePush();
  }

  loadHashCache();
  loadDeleted();

  // ---------- Payloads ----------
  function buildRepairPayload(r){
    return JSON.stringify({
      kind:'repair', schema: 1, savedAt: Date.now(),
      repair: r
    }, null, 2);
  }
  function buildIndexPayload(){
    const d = DB.all;
    const ids = (d.repairs||[]).map(r=>r.id);
    return JSON.stringify({
      kind:'index', schema: 1, savedAt: Date.now(),
      schemaVersion: d.schemaVersion,
      counter: d.counter, txCounter: d.txCounter,
      settings: {
        // Excluimos token por seguridad: nunca subimos el token al repo.
        ...d.settings,
        github: { ...d.settings.github, token: '' }
      },
      transactions: d.transactions || [],
      repairIds: ids
    }, null, 2);
  }


  // ---------- Detección de cambios (deltas) ----------
  async function getPendingPush(){
    // No requiere red: solo compara hashes locales con el caché de la última subida.
    const repairs = DB.repairs.slice();
    const modified = [];
    for(const r of repairs){
      const txt = buildRepairPayload(r);
      const h = await sha256(txt);
      if(lastHashes['r:'+r.id] !== h) modified.push(r.id);
    }
    const idxTxt = buildIndexPayload();
    const idxH = await sha256(idxTxt);
    const indexChanged = lastHashes['idx'] !== idxH;
    return {
      modified,
      deleted: [...knownDeleted],
      deletedTx: [...knownDeletedTx],
      indexChanged,
      total: modified.length + knownDeleted.size + knownDeletedTx.size + (indexChanged?1:0)
    };
  }

  async function getPendingPull(){
    // Consulta GitHub solo para listar y comparar SHAs (no descarga contenidos).
    if(!cfgOk()) throw new Error('Configuración incompleta');
    const out = { changed: [], created: [], removed: [], indexChanged: false, total: 0 };
    // index
    const idxRemote = await getFile(indexFile());
    if(idxRemote.sha && idxRemote.sha !== lastHashes['idxRemoteSha']) out.indexChanged = true;
    if(!idxRemote.sha) out.indexChanged = false;
    // repairs/
    const files = await listDir(repairsDir());
    const jsonFiles = files.filter(f => f.type==='file' && /\.json$/i.test(f.name));
    const localIds = new Set(DB.repairs.map(r=>r.id));
    const remoteIds = new Set();
    for(const f of jsonFiles){
      const id = f.name.replace(/\.json$/i,'');
      remoteIds.add(id);
      const cachedSha = lastHashes['sha:'+id];
      if(!localIds.has(id)) out.created.push(id);
      else if(cachedSha !== f.sha) out.changed.push(id);
    }
    for(const id of localIds){
      if(!remoteIds.has(id)) out.removed.push(id);
    }
    out.total = out.changed.length + out.created.length + out.removed.length + (out.indexChanged?1:0);
    // Nota: "removed" son reparaciones locales que no existen en GitHub todavía
    // (pendientes de subir). NO deben disparar un pull; solo se incluyen en
    // el total para diagnóstico. El autoPullTick solo actúa si hay cambios remotos.
    const remotePendingTotal = out.changed.length + out.created.length + (out.indexChanged?1:0);
    out.remotePendingTotal = remotePendingTotal;
    return out;
  }

  // ---------- Operaciones de alto nivel ----------
  async function testConnection(){
    if(!cfgOk()) throw new Error('Completa usuario, repositorio y token');
    GitLog.info('test', 'Probando conexión…');
    const u = await getUser();
    GitLog.ok('user', `Autenticado como ${u.login}`);
    const r = await getRepo();
    GitLog.ok('repo', `Repo accesible: ${r.full_name} · rama por defecto: ${r.default_branch}`);
    GitLog.info('ruta', `Base de datos: ${basePath()}/  (index.json + repairs/Rxxxx.json)`);
    return true;
  }

  async function pushAll(opts={}){
    if(!cfgOk()) throw new Error('Configuración incompleta');
    if(busy) { GitLog.warn('cola','Operación en curso, omitida'); return; }
    busy = true;
    const onProgress = opts.onProgress || (()=>{});
    try{
      const repairs = DB.repairs.slice();
      let pending = [];
      for(const r of repairs){
        const txt = buildRepairPayload(r);
        const h = await sha256(txt);
        if(lastHashes['r:'+r.id] !== h) pending.push({ r, txt, h });
      }
      const deletes = [...knownDeleted];
      const total = pending.length + deletes.length + 1; // +1 index
      let done = 0;
      const tick = (msg)=>{ done++; onProgress(done,total,msg); };

      GitLog.info('plan', `${pending.length} reparación(es) modificadas · ${deletes.length} a eliminar`);

      // 1) Subir cada reparación cambiada
      let reallyPushed = 0, skippedSame = 0;
      for(const it of pending){
        const path = repairFile(it.r.id);
        const remote = await getFile(path);
        // Comprobación remota: si el contenido en GitHub ya es idéntico
        // a lo que íbamos a subir, NO lo volvemos a subir. Solo
        // actualizamos el caché local para no volver a comprobarlo.
        if(remote.content){
          const remoteH = await sha256(remote.content);
          if(remoteH === it.h){
            lastHashes['r:'+it.r.id] = it.h;
            lastHashes['sha:'+it.r.id] = remote.sha;
            saveHashCache();
            GitLog.info('skip', `${it.r.id} ya está actualizado en GitHub`);
            skippedSame++;
            tick(it.r.id);
            continue;
          }
        }
        const newSha = await putFile(path, it.txt, remote.sha,
          remote.sha ? `taller: actualizar ${it.r.id}` : `taller: crear ${it.r.id}`);
        lastHashes['r:'+it.r.id] = it.h;
        lastHashes['sha:'+it.r.id] = newSha;
        saveHashCache();
        GitLog.ok(remote.sha?'update':'create', `${it.r.id} → ${path}`);
        reallyPushed++;
        tick(it.r.id);
      }
      if(skippedSame) GitLog.info('delta', `${skippedSame} reparación(es) ya estaban iguales en GitHub, omitidas`);

      // 2) Borrar los marcados como eliminados
      for(const id of deletes){
        try{
          const path = repairFile(id);
          const remote = await getFile(path);
          if(remote.sha){
            await deleteFile(path, remote.sha);
            GitLog.ok('delete', `${id} eliminado en GitHub`);
          }else{
            GitLog.info('skip', `${id} ya no existía en GitHub`);
          }
          delete lastHashes['r:'+id];
          delete lastHashes['sha:'+id];
          saveHashCache();
          knownDeleted.delete(id);
          saveDeleted();
        }catch(e){
          GitLog.err('delete', `${id}: ${e.message}`);
        }
        tick(id);
      }

      // 3) Subir el índice
      const idxTxt = buildIndexPayload();
      const idxPath = indexFile();
      const idxRemote = await getFile(idxPath);
      let idxSha = idxRemote.sha;
      const idxH = await sha256(idxTxt);
      const remoteIdxH = idxRemote.content ? await sha256(idxRemote.content) : null;
      if(remoteIdxH === idxH){
        // Remoto ya idéntico: no subimos nada, solo refrescamos caché.
        lastHashes['idx'] = idxH;
        lastHashes['idxRemoteSha'] = idxRemote.sha;
        saveHashCache();
        GitLog.info('index', 'index.json ya está idéntico en GitHub, omitido');
      } else if(lastHashes['idx'] !== idxH){
        idxSha = await putFile(idxPath, idxTxt, idxRemote.sha, 'taller: actualizar index.json');
        lastHashes['idx'] = idxH;
        lastHashes['idxRemoteSha'] = idxSha;
        saveHashCache();
        GitLog.ok('index', 'index.json subido');
      } else {
        GitLog.info('index', 'index.json sin cambios, omitido');
      }
      DB.updateGithub({ lastSha: idxSha, lastSyncAt: Date.now() });
      tick('index');

      // 4) Tombstones de transacciones: si el index remoto resultante ya no
      // contiene una transacción borrada, podemos olvidarla con seguridad.
      // (Las transacciones viven dentro de index.json, así que en el momento
      // en que subimos un índice sin esos IDs, la eliminación está propagada.)
      if(knownDeletedTx.size){
        try{
          const parsed = JSON.parse(idxTxt);
          const remainIds = new Set((parsed.transactions||[]).map(t=>t.id));
          let cleared = 0;
          for(const id of [...knownDeletedTx]){
            if(!remainIds.has(id)){ knownDeletedTx.delete(id); cleared++; }
          }
          if(cleared){ saveDeleted(); GitLog.info('tx-tomb', `${cleared} tombstone(s) de transacción liberada(s)`); }
        }catch(_){}
      }

      GitLog.ok('done', `Sincronización completa: ${pending.length} subida(s), ${deletes.length} eliminada(s)`);
      return { pushed: pending.length, deleted: deletes.length };
    } finally {
      busy = false;
    }
  }

  async function pullAll(opts={}){
    if(!cfgOk()) throw new Error('Configuración incompleta');
    if(busy) { GitLog.warn('cola','Operación en curso, omitida'); return; }
    busy = true;
    const onProgress = opts.onProgress || (()=>{});
    try{
      GitLog.info('pull', 'Descargando datos desde GitHub…');

      // 1) Intentar índice
      let idxData = null;
      const idxRemote = await getFile(indexFile());
      if(idxRemote.content){
        try{ idxData = JSON.parse(idxRemote.content); }
        catch(e){ GitLog.warn('index','index.json corrupto, se reconstruirá'); }
      } else {
        GitLog.info('index', 'No hay index.json todavía');
      }

      // 1b) Compatibilidad: si la ruta antigua era un archivo .json único
      if(!idxData){
        const legacyPath = (g().path||'').trim();
        if(legacyPath && /\.json$/i.test(legacyPath)){
          const legacy = await getFile(legacyPath);
          if(legacy.content){
            try{
              const parsed = JSON.parse(legacy.content);
              if(parsed && Array.isArray(parsed.repairs)){
                GitLog.warn('legado','Archivo único detectado, migrando a formato por reparación');
                // Importar todo y luego forzar pushAll
                DB.replaceAll(parsed);
                lastHashes = {}; saveHashCache();
                knownDeleted.clear(); saveDeleted();
                DB.updateGithub({ lastSyncAt: Date.now() });
                GitLog.ok('migrar','Datos legados cargados. Pulsa "Subir todo" para reorganizar.');
                return { pulled: parsed.repairs.length, migrated:true };
              }
            }catch(e){ GitLog.err('legado', e.message); }
          }
        }
      }

      // 2) Listar repairs/
      const files = await listDir(repairsDir());
      const jsonFiles = files.filter(f => f.type==='file' && /\.json$/i.test(f.name));
      GitLog.info('lista', `${jsonFiles.length} reparación(es) en el repositorio`);

      const total = jsonFiles.length + 1;
      let done = 0;
      const tick = (msg)=>{ done++; onProgress(done,total,msg); };

      const remoteRepairs = [];
      const localById = new Map(DB.repairs.map(r=>[r.id, r]));
      let skipped = 0, fetched = 0;
      for(const f of jsonFiles){
        const id = f.name.replace(/\.json$/i,'');
        const cachedSha = lastHashes['sha:'+id];
        if(cachedSha === f.sha && localById.has(id)){
          // Sin cambios remotos: reutilizamos la copia local.
          remoteRepairs.push({ raw: localById.get(id), sha: f.sha, body: null });
          skipped++;
          tick(f.name);
          continue;
        }
        const remote = await getFile(basePath()+'/repairs/'+f.name);
        if(!remote.content){ tick(f.name); continue; }
        try{
          const parsed = JSON.parse(remote.content);
          if(parsed && parsed.repair){
            remoteRepairs.push({ raw: parsed.repair, sha: f.sha, body: remote.content });
            fetched++;
            GitLog.ok('get', `${parsed.repair.id}  (${(remote.content.length/1024).toFixed(1)} KB)`);
          }
        }catch(e){ GitLog.err('parse', f.name+': '+e.message); }
        tick(f.name);
      }
      GitLog.info('delta', `Descargadas ${fetched} reparación(es) nuevas/cambiadas, ${skipped} omitida(s) sin cambios`);

      // 3) Componer dataset final
      let pulledRepairs = remoteRepairs.map(x=>x.raw);
      let pulledTx = idxData ? (idxData.transactions || []) : [];

      // --- Preservar transacciones locales no subidas ---
      // Las transacciones viven en index.json. Si hay transacciones locales nuevas
      // que aún no se subieron, el index.json remoto no las tiene. Las fusionamos.
      if(pulledTx.length > 0 || DB.transactions.length > 0){
        const remoteTxIds = new Set(pulledTx.map(t=>t.id));
        for(const t of DB.transactions){
          if(!remoteTxIds.has(t.id) && !knownDeletedTx.has(t.id)){
            pulledTx.push(t);
          }
        }
      } else {
        pulledTx = DB.transactions.filter(t => !knownDeletedTx.has(t.id));
      }

      // --- Protección contra "datos eliminados que reaparecen" ---
      // Si tenemos tombstones locales (cosas borradas en este dispositivo
      // pero que el otro dispositivo aún no ha visto), las filtramos del
      // dataset que vamos a aplicar y dejamos que el siguiente push las
      // limpie en GitHub. NO borramos los tombstones aquí — eso solo se
      // hace cuando confirmamos que la eliminación se subió.
      let filteredOut = 0;
      if(knownDeleted.size){
        const before = pulledRepairs.length;
        pulledRepairs = pulledRepairs.filter(r => !knownDeleted.has(r.id));
        filteredOut += before - pulledRepairs.length;
      }
      if(knownDeletedTx.size){
        const before = pulledTx.length;
        pulledTx = pulledTx.filter(t => !knownDeletedTx.has(t.id));
        filteredOut += before - pulledTx.length;
      }
      if(filteredOut > 0){
        GitLog.warn('tombstone', `Ignorando ${filteredOut} elemento(s) borrado(s) localmente que aún existen en GitHub. Se subirá su borrado.`);
      }

      // --- Protección contra "ediciones locales pisadas por el pull" ---
      // Si una reparación local tiene cambios sin subir (updatedAt mayor que
      // el de la versión remota), conservamos la versión local.
      // (Nota: ya existe `localById` arriba, pero al haber hecho
      // potencialmente DB.replaceAll en otra ruta, lo reconstruimos.)
      const localByIdNow = new Map(DB.repairs.map(r=>[r.id, r]));
      let keptLocal = 0;
      pulledRepairs = pulledRepairs.map(r => {
        const loc = localByIdNow.get(r.id);
        if(loc && (loc.updatedAt||0) > (r.updatedAt||0)){
          keptLocal++;
          return loc;
        }
        return r;
      });
      if(keptLocal > 0){
        GitLog.warn('local-edit', `Conservando ${keptLocal} reparación(es) con ediciones locales más nuevas que el remoto.`);
      }

      // --- Protección contra "reparaciones nuevas locales perdidas en el pull" ---
      // Las reparaciones que existen localmente pero NO en GitHub (aún no subidas)
      // deben mantenerse en el dataset final. Sin esto, un pull automático al
      // detectar conexión borraría la reparación recién registrada en este dispositivo.
      const remoteIds = new Set(remoteRepairs.map(x=>x.raw.id));
      let addedLocal = 0;
      for(const [id, loc] of localByIdNow){
        if(!remoteIds.has(id) && !knownDeleted.has(id)){
          pulledRepairs.push(loc);
          addedLocal++;
        }
      }
      if(addedLocal > 0){
        GitLog.warn('local-new', `Conservando ${addedLocal} reparación(es) local(es) aún no subida(s) a GitHub.`);
      }

      const base = idxData ? {
        schemaVersion: idxData.schemaVersion,
        settings: idxData.settings || {},
        transactions: pulledTx,
        // Usar el mayor entre remoto y local para no perder IDs de reparaciones
        // nuevas registradas localmente que aún no se han subido al índice.
        counter: Math.max(idxData.counter || 1, DB.all.counter || 1),
        txCounter: Math.max(idxData.txCounter || 1, DB.all.txCounter || 1),
        repairs: pulledRepairs
      } : {
        counter: DB.all.counter || 1,
        txCounter: DB.all.txCounter || 1,
        repairs: pulledRepairs
      };
      // Preservar token local (nunca viene del repo)
      const localToken = DB.settings.github.token;
      DB.replaceAll(base);
      DB.updateGithub({ token: localToken, lastSyncAt: Date.now(), lastSha: idxRemote.sha });

      // Recalcular hashes
      // IMPORTANTE: para reparaciones que conservamos en versión local (keptLocal o addedLocal),
      // usamos la reparación tal como quedó en DB (la local), NO la remota.
      // Así el siguiente getPendingPush() las detecta como "modificadas" y las sube.
      lastHashes = {};
      // Índice remoto
      lastHashes['idxRemoteSha'] = idxRemote.sha || null;
      if(idxRemote.content){ try{ lastHashes['idx'] = await sha256(idxRemote.content); }catch(_){} }
      // Primero volcar los SHAs remotos conocidos (para las que sí bajamos igual)
      for(const it of remoteRepairs){
        lastHashes['sha:'+it.raw.id] = it.sha;
      }
      // Recalcular hash de contenido desde DB (que puede ser local para keptLocal/addedLocal)
      for(const r of DB.repairs){
        const txt = buildRepairPayload(r);
        lastHashes['r:'+r.id] = await sha256(txt);
        // sha: del remoto ya fue puesto arriba; si no existe (addedLocal) se deja vacío
        // para que el push lo detecte como nuevo
      }
      saveHashCache();
      // IMPORTANTE: NO borramos los tombstones aquí. Solo se eliminan tras
      // confirmarse el borrado en GitHub dentro de pushAll(). De lo
      // contrario, una eliminación local podría perderse si el autoPull
      // se ejecuta antes que el autoPush.
      if(filteredOut > 0 || keptLocal > 0 || addedLocal > 0){
        try{ schedulePush(); }catch(_){}
      }
      tick('index');

      GitLog.ok('done', `Descargadas ${remoteRepairs.length} reparación(es)`);
      return { pulled: remoteRepairs.length };
    } finally {
      busy = false;
    }
  }

  // ---------- Auto-sync ----------
  function toast(msg){
    try{ if(window.UI && UI.toast) UI.toast(msg); }catch(_){}
  }
  function schedulePush(){
    if(!cfgOk()){
      GitLog.warn('auto','Configuración de GitHub incompleta — los cambios NO se subirán');
      return;
    }
    if(!g().autoSync){
      GitLog.warn('auto','Sincronización automática desactivada — los cambios NO se subirán');
      return;
    }
    clearTimeout(pushTimer);
    pushTimer = setTimeout(async ()=>{
      try{
        toast('Subiendo cambios a la nube…');
        const res = await pushAll();
        if(res && (res.pushed>0 || res.deleted>0)){
          toast(`✓ Cambios subidos a la nube (${res.pushed} subida(s), ${res.deleted} borrada(s))`);
        }else{
          toast('✓ Todo sincronizado con la nube');
        }
      }catch(e){
        GitLog.err('auto', e.message);
        toast('⚠ Error subiendo a la nube: '+(e.message||e));
      }
    }, 1800);
  }

  // ---------- Auto-pull (polling de cambios remotos) ----------
  let pullTimer = null;
  let pullInFlight = false;
  let pullListenersBound = false;
  const PULL_INTERVAL_MS = 12000; // cada 12s comprueba cambios remotos
  async function autoPullTick(){
    if(pullInFlight) return;
    if(!cfgOk() || !g().autoSync) return;
    if(busy) return;
    if(typeof document !== 'undefined' && document.hidden) return;
    pullInFlight = true;
    try{
      const pending = await getPendingPull();
      if(pending && pending.remotePendingTotal > 0){
        GitLog.info('auto-pull', `Cambios remotos detectados: ${pending.remotePendingTotal}. Descargando…`);
        toast('Bajando cambios desde la nube…');
        await pullAll();
        try{ if(window.App && typeof App.refresh === 'function') App.refresh(); }catch(_){}
        toast(`✓ ${pending.remotePendingTotal} cambio(s) recibido(s) desde la nube`);
      }
    }catch(e){
      GitLog.warn('auto-pull', e.message || String(e));
    }finally{
      pullInFlight = false;
    }
  }
  function startAutoPull(){
    stopAutoPull();
    // Al iniciar: primero bajamos cambios remotos, luego subimos los locales pendientes.
    setTimeout(async ()=>{
      await autoPullTick();
      try{
        if(cfgOk() && g().autoSync){
          const pend = await getPendingPush();
          if(pend && pend.total > 0){
            GitLog.info('auto-push-init', `Pendientes locales: ${pend.total}. Subiendo…`);
            schedulePush();
          }
        }
      }catch(_){}
    }, 1500);
    pullTimer = setInterval(autoPullTick, PULL_INTERVAL_MS);
    if(!pullListenersBound){
      pullListenersBound = true;
      document.addEventListener('visibilitychange', ()=>{ if(!document.hidden) autoPullTick(); });
      window.addEventListener('online', ()=> { autoPullTick(); if(cfgOk()&&g().autoSync) schedulePush(); });
      window.addEventListener('focus', ()=> autoPullTick());
    }
  }
  function stopAutoPull(){
    if(pullTimer){ clearInterval(pullTimer); pullTimer = null; }
  }

  return {
    cfgOk, basePath, isBusy: ()=>busy,
    test: testConnection,
    push: pushAll, pull: pullAll, schedulePush,
    getPendingPush, getPendingPull,
    markDeleted, markDeletedTx,
    startAutoPull, stopAutoPull, autoPullNow: autoPullTick,
    // Compatibilidad con código viejo:
    pushLegacy: pushAll
  };
})();
window.GitSync = GitSync;

// =============================================================
// File System Access — guardar JSON en una ubicación local
// =============================================================
const LocalFile = (() => {
  const DB_NAME = 'taller_handles';
  const STORE = 'kv';
  let cachedHandle = null;
  let writeTimer = null;

  function idb(){
    return new Promise((res, rej)=>{
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = ()=> req.result.createObjectStore(STORE);
      req.onsuccess = ()=> res(req.result);
      req.onerror = ()=> rej(req.error);
    });
  }
  async function setHandle(h){
    cachedHandle = h;
    const db = await idb();
    await new Promise((r,j)=>{
      const tx = db.transaction(STORE,'readwrite');
      tx.objectStore(STORE).put(h, 'fileHandle');
      tx.oncomplete = r; tx.onerror = ()=>j(tx.error);
    });
  }
  async function loadHandle(){
    if(cachedHandle) return cachedHandle;
    try{
      const db = await idb();
      cachedHandle = await new Promise((r,j)=>{
        const tx = db.transaction(STORE,'readonly');
        const req = tx.objectStore(STORE).get('fileHandle');
        req.onsuccess = ()=> r(req.result||null);
        req.onerror = ()=> j(req.error);
      });
    }catch(e){ cachedHandle = null; }
    return cachedHandle;
  }
  async function clearHandle(){
    cachedHandle = null;
    try{
      const db = await idb();
      await new Promise((r,j)=>{
        const tx = db.transaction(STORE,'readwrite');
        tx.objectStore(STORE).delete('fileHandle');
        tx.oncomplete = r; tx.onerror = ()=>j(tx.error);
      });
    }catch(e){}
  }
  function isSupported(){ return 'showSaveFilePicker' in window; }
  function hasHandle(){ return !!cachedHandle; }
  async function pickLocation(){
    if(!isSupported()) throw new Error('Tu navegador no soporta elegir ubicación. Usa exportar manual.');
    const h = await window.showSaveFilePicker({
      suggestedName: 'taller-data.json',
      types: [{ description:'JSON', accept:{ 'application/json':['.json'] } }]
    });
    await setHandle(h);
    await write();
    return h;
  }
  async function ensurePermission(h){
    const opts = { mode:'readwrite' };
    if((await h.queryPermission(opts)) === 'granted') return true;
    return (await h.requestPermission(opts)) === 'granted';
  }
  async function write(){
    if(!cachedHandle) return false;
    try{
      if(!(await ensurePermission(cachedHandle))) return false;
      const w = await cachedHandle.createWritable();
      await w.write(new Blob([JSON.stringify(DB.all,null,2)],{type:'application/json'}));
      await w.close();
      return true;
    }catch(e){ console.warn('LocalFile write', e); return false; }
  }
  function scheduleWrite(){
    clearTimeout(writeTimer);
    writeTimer = setTimeout(()=>{ write(); }, 800);
  }
  async function readText(){
    if(!cachedHandle) return null;
    if(!(await ensurePermission(cachedHandle))) return null;
    const f = await cachedHandle.getFile();
    return await f.text();
  }
  async function loadFromFile(){
    const text = await readText();
    if(text==null) return false;
    return DB.importJson(text);
  }
  loadHandle();
  return { isSupported, hasHandle, pickLocation, clearHandle, write, scheduleWrite, loadFromFile, readText, loadHandle };

})();
window.LocalFile = LocalFile;
