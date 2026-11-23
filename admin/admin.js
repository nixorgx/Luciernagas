/* Luciérnagas · panel de coordinación
 * Seguridad: Supabase Auth + Postgres RLS, no confiar en ocultar esta ruta.
 * No se registran contraseñas ni se renderiza contenido externo como HTML.
 */
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const $=id=>document.getElementById(id);
const config=window.LUCIERNAGAS_BACKEND||{};
const ready=/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/i.test(config.url||'')&&typeof config.anonKey==='string'&&config.anonKey.length>15;
const states={nueva:'Nueva',contactada:'Contactada',en_coordinacion:'En coordinación',completada:'Completada',archivada:'Archivada'};
const types={materiales:'Libros y materiales',tutorias:'Tutorías',talleres:'Talleres',alianzas:'Alianzas',otros:'Otra propuesta'};
const date=new Intl.DateTimeFormat('es-BO',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit',timeZone:'America/La_Paz'});
const supabase=ready?createClient(config.url,config.anonKey,{
  auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}
}):null;
let records=[],selected=null,loading=false;

function show(view){for(const key of ['setup','login-view','dashboard'])$(key).hidden=(key!==view);}
function announce(id,msg,isError=false){const el=$(id);if(!el)return;el.textContent=msg;el.dataset.error=String(isError);}
function fmt(v){const t=Date.parse(v);return Number.isFinite(t)?date.format(new Date(t)):'—';}
function text(el,value){el.textContent=String(value??'');return el;}
function create(tag,name='',value=''){const el=document.createElement(tag);if(name)el.className=name;el.textContent=value;return el;}

async function isCoordinator(){
  if(!supabase)return false;
  const {data,error}=await supabase.rpc('es_coordinador');
  if(error)throw error;
  return data===true;
}
async function load(){
  if(loading)return;
  loading=true; $('reload').disabled=true;
  announce('list-status','Actualizando solicitudes...');
  try{
    const {data,error}=await supabase.from('solicitudes').select('id,tipo,nombre,correo,telefono,ciudad,descripcion,estado,nota_interna,created_at,updated_at').order('created_at',{ascending:false}).limit(500);
    if(error)throw error;
    records=Array.isArray(data)?data:[];
    render();
    if(selected){selected=records.find(x=>x.id===selected.id)||null;renderDetail();}
    announce('list-status',records.length===500?'Mostrando las 500 solicitudes más recientes. Se recomienda paginar cuando aumente el volumen.':'Bandeja actualizada.');
  }catch(error){
    records=[];render();selected=null;renderDetail();
    announce('list-status','No pudimos cargar las solicitudes. Revisa tus permisos o la conexión.',true);
  }finally{loading=false;$('reload').disabled=false;}
}
function visible(){
  const q=$('search').value.trim().toLocaleLowerCase('es');
  const state=$('filter-status').value,type=$('filter-type').value;
  return records.filter(x=>(!state||x.estado===state)&&(!type||x.tipo===type)&&(!q||[x.nombre,x.ciudad,x.descripcion,x.correo,x.tipo].join(' ').toLocaleLowerCase('es').includes(q)));
}
function render(){
  $('stat-new').textContent=records.filter(x=>x.estado==='nueva').length;
  $('stat-progress').textContent=records.filter(x=>x.estado==='contactada'||x.estado==='en_coordinacion').length;
  $('stat-done').textContent=records.filter(x=>x.estado==='completada').length;
  $('stat-all').textContent=records.length;
  const items=visible(),tbody=$('records');tbody.replaceChildren();
  $('visible-count').textContent=items.length+' resultados';
  $('empty').hidden=items.length>0;
  items.forEach(x=>{
    const tr=create('tr');tr.tabIndex=0;tr.dataset.selected=String(selected?.id===x.id);
    tr.setAttribute('aria-label','Abrir propuesta de '+x.nombre);
    tr.append(create('td','',x.nombre),create('td','',types[x.tipo]||x.tipo),create('td','',x.ciudad||'—'),create('td','',fmt(x.created_at)));
    const td=create('td'),badge=create('span','state '+x.estado,states[x.estado]||x.estado);td.append(badge);tr.append(td);
    const open=()=>{selected=x;render();renderDetail();if(innerWidth<1100)$('detail').scrollIntoView({behavior:'smooth',block:'start'});};
    tr.addEventListener('click',open);
    tr.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open();}});
    tbody.append(tr);
  });
}
function renderDetail(){
  $('detail-empty').hidden=Boolean(selected);
  $('detail-body').hidden=!selected;
  if(!selected)return;
  const x=selected;
  text($('detail-name'),x.nombre);
  text($('detail-type'),types[x.tipo]||'Colaboración');
  text($('detail-city'),x.ciudad||'No indicada');
  text($('detail-date'),fmt(x.created_at));
  text($('detail-code'),'#'+String(x.id).slice(0,8));
  text($('detail-description'),x.descripcion);
  $('detail-status').value=x.estado;
  $('detail-note').value=x.nota_interna||'';
  announce('detail-result','');
  const mail=$('detail-mail');mail.hidden=!x.correo;
  mail.href=x.correo?'mailto:'+encodeURIComponent(x.correo):'#';
  const phone=$('detail-phone');
  const digits=String(x.telefono||'').replace(/[^0-9]/g,'');
  phone.hidden=digits.length<8||digits.length>15;
  phone.href=phone.hidden?'#':'https://wa.me/'+digits;
}
async function save(event){
  event.preventDefault();
  if(!selected)return;
  const state=$('detail-status').value,notes=$('detail-note').value.trim();
  if(!(state in states)||notes.length>3000)return announce('detail-result','Datos de seguimiento inválidos.',true);
  const btn=$('save-detail');btn.disabled=true;
  try{
    const {data,error}=await supabase.from('solicitudes').update({estado:state,nota_interna:notes,updated_at:new Date().toISOString()}).eq('id',selected.id).select('id').single();
    if(error||!data)throw error||new Error('No se actualizó el registro');
    selected={...selected,estado:state,nota_interna:notes,updated_at:new Date().toISOString()};
    const index=records.findIndex(x=>x.id===selected.id);
    if(index!==-1)records[index]=selected;
    render();renderDetail();announce('detail-result','Seguimiento guardado correctamente.');
  }catch(_){announce('detail-result','No se pudo guardar. Comprueba la conexión y tus permisos.',true);}
  finally{btn.disabled=false;}
}
function exportCsv(){
  const rows=visible();
  if(!rows.length)return announce('list-status','No hay filas que exportar.',true);
  const cols=['id','tipo','nombre','correo','telefono','ciudad','descripcion','estado','nota_interna','created_at','updated_at'];
  const escape=value=>{
    let txt=String(value??'');
    // Evita ejecución de fórmulas al importar CSV en hojas de cálculo.
    if(/^\s*[=+\-@]/.test(txt))txt="'"+txt;
    return '"'+txt.replace(/"/g,'""')+'"';
  };
  const content='\ufeff'+[cols.join(','),...rows.map(x=>cols.map(key=>escape(x[key])).join(','))].join('\r\n');
  const url=URL.createObjectURL(new Blob([content],{type:'text/csv;charset=utf-8'}));
  const a=document.createElement('a');a.href=url;a.download='luciernagas-propuestas-'+new Date().toISOString().slice(0,10)+'.csv';
  document.body.appendChild(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1500);
  announce('list-status','CSV descargado. Protégelo porque incluye datos personales.');
}
async function onLogin(event){
  event.preventDefault();
  const button=$('login-button');button.disabled=true;announce('login-status','Verificando acceso...');
  const email=$('login-email').value.trim(),password=$('login-password').value;
  try{
    const {data,error}=await supabase.auth.signInWithPassword({email,password});
    if(error||!data.user)throw error||new Error('Acceso no disponible');
    if(!await isCoordinator()){
      await supabase.auth.signOut();
      throw new Error('not-coordinator');
    }
    $('login-password').value='';
    await startDashboard(data.user);
  }catch(error){
    announce('login-status',error.message==='not-coordinator'?'La cuenta no tiene permisos de coordinación.':'No se pudo iniciar sesión. Comprueba tus credenciales y los permisos.',true);
  }finally{button.disabled=false;}
}
async function startDashboard(user){
  text($('account-name'),user.email||'Equipo autorizado');
  $('account').hidden=false;show('dashboard');await load();
}
async function bootstrap(){
  if(!ready){show('setup');return;}
  show('login-view');
  try{
    const {data,error}=await supabase.auth.getUser();
    if(!error&&data.user&&await isCoordinator()){await startDashboard(data.user);}
    else if(data.user){await supabase.auth.signOut();}
  }catch(_){show('login-view');}
}
$('login-form').addEventListener('submit',onLogin);
$('logout').addEventListener('click',async()=>{await supabase?.auth.signOut();records=[];selected=null;$('account').hidden=true;show('login-view');announce('login-status','Sesión cerrada.');});
$('reload').addEventListener('click',load);
$('export').addEventListener('click',exportCsv);
$('detail-form').addEventListener('submit',save);
for(const id of ['search','filter-status','filter-type'])$(id).addEventListener(id==='search'?'input':'change',render);
bootstrap();
