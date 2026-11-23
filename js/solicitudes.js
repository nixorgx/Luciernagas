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
    announce('Tu propuesta se enviará al equipo de Luciérnagas para su revisión.');
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

/* Recorrido accesible en tres pasos. Mantiene los datos hasta el envío confirmado. */
(() => {
  'use strict';
  const form=document.getElementById('intake-form');
  if(!form)return;
  const steps=[...form.querySelectorAll('.intake-step[data-step]')];
  const markers=[...form.querySelectorAll('.intake-progress-item')];
  const status=document.getElementById('intake-status');
  const description=document.getElementById('intake-details');
  const counter=document.getElementById('intake-count');
  const helper=document.getElementById('intake-type-help');
  const summary=document.getElementById('intake-summary');
  const presets={
    materiales:{label:'Libros y materiales',hint:'Puedes ofrecernos libros o útiles en buen estado. Nos pondremos en contacto para coordinar.',placeholder:'Ej.: Tengo 15 libros infantiles y 10 cuadernos nuevos disponibles en Cochabamba. ¿Cuándo podemos entregarlos?'},
    tutorias:{label:'Tutorías gratuitas',hint:'Cuéntanos qué materia puedes enseñar y qué horarios tienes disponibles.',placeholder:'Ej.: Puedo enseñar matemáticas a estudiantes de primaria los sábados, de forma presencial o virtual.'},
    talleres:{label:'Talleres y clases',hint:'Puedes proponer actividades gratuitas de arte, ciencia, programación, música u otras habilidades.',placeholder:'Ej.: Puedo impartir un taller de lectura creativa para 12 estudiantes, una tarde al mes.'},
    alianzas:{label:'Alianza o colaboración',hint:'Cuéntanos qué puede aportar tu organización o cómo podemos trabajar juntos.',placeholder:'Ej.: Somos una biblioteca y nos gustaría organizar una campaña de recolección de libros.'},
    otros:{label:'Otra propuesta',hint:'También puedes compartir ideas que no estén en las categorías anteriores.',placeholder:'Ej.: Quiero apoyar con transporte voluntario para entregar material escolar en comunidades.'}
  };
  let stage=1;

  const announce=(message)=>{
    status.textContent=message;
    status.dataset.state='error';
  };
  const getType=()=>form.querySelector('input[name="tipo"]:checked')?.value||'materiales';
  function updatePreset(){
    const current=presets[getType()];
    helper.textContent=current.hint;
    description.placeholder=current.placeholder;
    const place=document.getElementById('intake-city').value.trim();
    summary.textContent=current.label+(place?' · '+place:' · Bolivia');
  }
  function changeStage(n,focus=true){
    stage=Math.min(3,Math.max(1,n));
    for(const step of steps)step.hidden=Number(step.dataset.step)!==stage;
    for(const marker of markers){
      const number=Number(marker.dataset.stepMarker);
      marker.classList.toggle('is-current',number===stage);
      marker.classList.toggle('is-completed',number<stage);
      if(number===stage)marker.setAttribute('aria-current','step');
      else marker.removeAttribute('aria-current');
    }
    if(stage===3)updatePreset();
    if(focus){
      const title=form.querySelector('.intake-step[data-step="'+stage+'"] h4');
      title?.focus({preventScroll:true});
      title?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'center'});
    }
  }
  function validContact(){
    const name=document.getElementById('intake-name');
    const email=document.getElementById('intake-email');
    const phone=document.getElementById('intake-phone');
    const city=document.getElementById('intake-city');
    if(name.value.trim().length<3){announce('Escribe tu nombre completo para continuar.');name.focus();return false;}
    if(!email.value.trim()&&!phone.value.trim()){announce('Añade un correo o un número de contacto.');email.focus();return false;}
    if(email.value.trim()&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())){announce('El correo electrónico no tiene un formato válido.');email.focus();return false;}
    if(phone.value.trim()&&!/^[+()\d\s.-]{7,25}$/.test(phone.value.trim())){announce('Revisa el teléfono o WhatsApp.');phone.focus();return false;}
    if(!city.value.trim()){announce('Indica tu ciudad o municipio.');city.focus();return false;}
    return true;
  }
  document.getElementById('intake-next-1')?.addEventListener('click',()=>changeStage(2));
  document.getElementById('intake-next-2')?.addEventListener('click',()=>{
    if(validContact())changeStage(3);
  });
  form.querySelectorAll('[data-back-step]').forEach(button=>{
    button.addEventListener('click',()=>changeStage(Number(button.dataset.backStep)));
  });
  form.querySelectorAll('input[name="tipo"]').forEach(radio=>{
    radio.addEventListener('change',updatePreset);
  });
  document.getElementById('intake-city')?.addEventListener('input',updatePreset);
  description.addEventListener('input',()=>{
    counter.textContent=description.value.length+' / 1600';
    counter.dataset.limit=String(description.value.length>1500);
  });
  form.addEventListener('reset',()=>{
    queueMicrotask(()=>{
      changeStage(1,false);
      updatePreset();
      counter.textContent='0 / 1600';
    });
  });
  document.querySelectorAll('a[href="#sumate"]').forEach(a=>a.addEventListener('click',()=>{
    const selected=form.querySelector('input[name="tipo"]:checked');
    if(selected)selected.dispatchEvent(new Event('change',{bubbles:true}));
    changeStage(1,false);
  }));
  updatePreset();
  changeStage(1,false);
})();
