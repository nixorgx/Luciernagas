/* Luciérnagas · registro público de propuestas.
 * El formulario nunca afirma que envió una propuesta si no hay respuesta del servidor.
 */
(() => {
  'use strict';
  const form=document.getElementById('intake-form');
  if(!form)return;
  const status=document.getElementById('intake-status');
  const button=document.getElementById('intake-submit');
  const config=window.LUCIERNAGAS_BACKEND||{};
  const ready=typeof config.url==='string' && /^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/i.test(config.url) && typeof config.anonKey==='string' && config.anonKey.length>15;
  const types=Object.freeze({materiales:'Donación de libros o material escolar',tutorias:'Tutorías gratuitas',talleres:'Talleres o clases extracurriculares',alianzas:'Alianza o colaboración institucional',otros:'Otra propuesta'});
  let busy=false;
  const started=Date.now();
  const lastKey='luciernagas-intake-last-attempt';

  function announce(message,state='note'){
    status.textContent=message;
    status.dataset.state=state;
  }
  function payload(){
    const fd=new FormData(form);
    const type=String(fd.get('tipo')||'materiales');
    return {
      tipo:type,
      nombre:String(fd.get('nombre')||'').trim(),
      correo:String(fd.get('correo')||'').trim(),
      telefono:String(fd.get('telefono')||'').trim(),
      ciudad:String(fd.get('ciudad')||'').trim(),
      descripcion:String(fd.get('descripcion')||'').trim(),
      autorizacion:fd.get('autorizacion')!==null,
      trampa:String(fd.get('sitio_web')||'')
    };
  }
  function verify(p){
    if(!(p.tipo in types))return 'Selecciona cómo quieres ayudar.';
    if(p.nombre.length<3||p.nombre.length>90)return 'Escribe tu nombre completo.';
    if(!p.correo&&!p.telefono)return 'Indica al menos un correo o teléfono para responderte.';
    if(p.correo&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.correo))return 'Revisa el formato de tu correo electrónico.';
    if(p.telefono&&!/^[+()\d\s.-]{7,25}$/.test(p.telefono))return 'Revisa el formato de tu teléfono o WhatsApp.';
    if(!p.ciudad||p.ciudad.length>100)return 'Indica la ciudad o municipio.';
    if(p.descripcion.length<12||p.descripcion.length>1600)return 'Describe tu propuesta en al menos 12 caracteres.';
    if(!p.autorizacion)return 'Debes aceptar el aviso sobre el uso de tus datos para continuar.';
    return '';
  }
  function compose(p){
    const contact=[p.correo&&('Correo: '+p.correo),p.telefono&&('Teléfono: '+p.telefono)].filter(Boolean).join('\n');
    return ['PROPUESTA PARA LUCIÉRNAGAS — LUZ PARA SU MAÑANA',
      'Tipo: '+types[p.tipo],
      'Nombre: '+p.nombre,
      'Ciudad/municipio: '+p.ciudad,contact,
      'Propuesta:\n'+p.descripcion,
      'La persona autoriza el contacto para coordinar su propuesta.'
    ].filter(Boolean).join('\n');
  }
  async function copy(text){
    if(navigator.clipboard&&window.isSecureContext){
      await navigator.clipboard.writeText(text);
      return true;
    }
    const field=document.createElement('textarea');
    field.value=text;field.style.cssText='position:fixed;left:-9999px;top:0';
    document.body.appendChild(field);field.focus();field.select();
    const ok=document.execCommand('copy');field.remove();return ok;
  }

  if(ready){
    button.firstChild.textContent='Enviar mi propuesta ';
    announce('Tu propuesta se enviará al equipo de Luciérnagas y podrá gestionarse desde un panel privado.');
  } else {
    button.firstChild.textContent='Copiar mi propuesta ';
    announce('El sistema de recepción está en preparación. Este botón solo copiará tu propuesta; no se enviará automáticamente.');
  }
  document.querySelectorAll('a[href="#sumate"]').forEach(link=>{
    link.addEventListener('click',()=>{
      const text=(link.textContent||'').toLowerCase();
      const choice=text.includes('tutor')?'tutorias':text.includes('taller')?'talleres':text.includes('alianza')?'alianzas':text.includes('material')||text.includes('libro')?'materiales':null;
      if(choice){const radio=form.querySelector('input[name="tipo"][value="'+choice+'"]');if(radio)radio.checked=true;}
    });
  });

  form.addEventListener('submit',async event=>{
    event.preventDefault();
    if(busy)return;
    const p=payload();
    if(p.trampa)return;
    const error=verify(p);
    if(error)return announce(error,'error');
    if(!ready){
      try{
        const ok=await copy(compose(p));
        announce(ok?'Propuesta copiada. Todavía no se ha enviado: compártela por un canal oficial cuando se anuncie.':'No pudimos copiarla. Intenta seleccionar el texto manualmente.','note');
      }catch(_){announce('No se pudo copiar automáticamente. Intenta nuevamente.','error');}
      return;
    }
    if(Date.now()-started<3000)return announce('Revisa tu propuesta y vuelve a enviarla en unos segundos.','error');
    try {
      const last=Number(localStorage.getItem(lastKey)||0);
      if(Date.now()-last<45000)return announce('Aguarda un momento antes de intentar enviar otra propuesta.','error');
    }catch(_){}
    busy=true;button.disabled=true;
    const oldLabel=button.firstChild.textContent;
    button.firstChild.textContent='Enviando... ';
    announce('Enviando tu propuesta de forma segura...','pending');
    try{
      const endpoint=config.url.replace(/\/$/,'')+'/rest/v1/solicitudes';
      const res=await fetch(endpoint,{
        method:'POST',
        headers:{
          'Content-Type':'application/json',
          apikey:config.anonKey,
          ...(config.anonKey.startsWith('eyJ')?{Authorization:'Bearer '+config.anonKey}:{}),
          Prefer:'return=minimal'
        },
        body:JSON.stringify({
          tipo:p.tipo,nombre:p.nombre,correo:p.correo||null,
          telefono:p.telefono||null,ciudad:p.ciudad,
          descripcion:p.descripcion,autorizacion:true
        })
      });
      if(!res.ok) {
        const detail=await res.json().catch(()=>({}));
        const msg=String(detail.message||'');
        if(res.status===429||msg.includes('RECEPCION_TEMPORALMENTE_LIMITADA'))throw Error('too_many');
        if(msg.includes('CONTACTO_TEMPORALMENTE_LIMITADO'))throw Error('contact_limit');
        throw Error('backend_'+res.status);
      }
      try{localStorage.setItem(lastKey,String(Date.now()));}catch(_){}
      announce('¡Recibimos tu propuesta! Quedó registrada para que el equipo de Luciérnagas pueda revisarla y contactarte.','success');
      form.reset();
    }catch(err){
      announce(err.message==='too_many'?'Alcanzamos el límite diario de propuestas. Inténtalo mañana.':err.message==='contact_limit'?'Este contacto ya alcanzó su límite de propuestas de hoy. Podrás enviar otra en 24 horas.':'No se pudo confirmar el registro. Comprueba tu conexión e inténtalo más tarde. No damos por recibida tu propuesta.','error');
    }finally{busy=false;button.disabled=false;button.firstChild.textContent=oldLabel;}
  });
})();