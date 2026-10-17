import { useEffect, useState, type FormEvent } from 'react';
import { Check, Plus, Star, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export type ClientAddress={id:number;city:string;kind:'street'|'place';street:string;number:string;place:string};
export type ClientFormData={first:string;last:string;phone:string;notes:string;addresses:ClientAddress[];primary:number};

const cities=['София','Пловдив','Варна','Бургас','Ямбол','Стара Загора','Русе'];
const blankAddr=(id:number):ClientAddress=>({id,city:'',kind:'street',street:'',number:'',place:''});

export function ClientEditorDialog({open,onOpenChange,editing,phones,onSave}:{open:boolean;onOpenChange:(open:boolean)=>void;editing:ClientFormData|null;phones:string[];onSave:(data:ClientFormData)=>void;}){
 const [form,setForm]=useState<ClientFormData>({first:'',last:'',phone:'',notes:'',addresses:[blankAddr(1)],primary:1});
 const [errors,setErrors]=useState<Record<string,string>>({});
 useEffect(()=>{if(!open)return;setForm(editing?{first:editing.first,last:editing.last,phone:editing.phone,notes:editing.notes,addresses:editing.addresses.map(a=>({...a})),primary:editing.primary}:{first:'',last:'',phone:'',notes:'',addresses:[blankAddr(1)],primary:1});setErrors({});},[open,editing]);
 const setA=(id:number,patch:Partial<ClientAddress>)=>{setForm(f=>({...f,addresses:f.addresses.map(a=>a.id===id?{...a,...patch}:a)}));setErrors({});};
 const save=(e:FormEvent)=>{
  e.preventDefault();const er:Record<string,string>={};
  if(!form.first.trim())er['first']='Въведете име';
  if(!form.last.trim())er['last']='Въведете фамилия';
  const ph=form.phone.replace(/[\s-]/g,'');
  if(!ph)er['phone']='Въведете телефон';else if(!/^(\+359|0)\d{8,9}$/.test(ph))er['phone']='Невалиден телефон (напр. 0888123456)';
  else if(phones.some(p=>p===ph))er['phone']='Вече има клиент с този телефон';
  form.addresses.forEach(a=>{if(!a.city)er[`city-${a.id}`]='Изберете населено място';if(a.kind==='street'){if(!a.street.trim())er[`street-${a.id}`]='Въведете улица';if(!a.number.trim())er[`number-${a.id}`]='Въведете номер';}else if(!a.place.trim())er[`place-${a.id}`]='Въведете местоназначение';});
  setErrors(er);
  if(Object.keys(er).length){document.getElementById(`client-${Object.keys(er)[0]}`)?.focus();return;}
  const data={first:form.first.trim(),last:form.last.trim(),phone:ph,notes:form.notes.trim(),addresses:form.addresses,primary:form.addresses.some(a=>a.id===form.primary)?form.primary:form.addresses[0]!.id};
  onSave(data);onOpenChange(false);
 };
 const err=(k:string)=>errors[k]&&<p id={`client-${k}-error`} className="text-xs text-destructive" role="alert">{errors[k]}</p>;
 const inv=(k:string)=>({'aria-invalid':Boolean(errors[k]),'aria-describedby':errors[k]?`client-${k}-error`:undefined});
 return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="max-w-xl max-h-[90dvh] overflow-y-auto"><DialogHeader><DialogTitle className="article-dialog-title">{editing?'Редактиране на клиент':'Добавяне на клиент'}</DialogTitle><DialogDescription>Примерни данни · без реално записване</DialogDescription></DialogHeader>
  <form className="delivery-editor" onSubmit={save} noValidate>
   <div className="delivery-editor-grid"><div className="field"><label htmlFor="client-first">Име<span className="required">*</span></label><input id="client-first" autoComplete="given-name" maxLength={60} value={form.first} {...inv('first')} onChange={e=>{setForm(f=>({...f,first:e.target.value}));setErrors({});}}/>{err('first')}</div>
   <div className="field"><label htmlFor="client-last">Фамилия<span className="required">*</span></label><input id="client-last" autoComplete="family-name" maxLength={60} value={form.last} {...inv('last')} onChange={e=>{setForm(f=>({...f,last:e.target.value}));setErrors({});}}/>{err('last')}</div></div>
   <div className="field"><label htmlFor="client-phone">Телефон<span className="required">*</span></label><input id="client-phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="0888 123 456" value={form.phone} {...inv('phone')} onChange={e=>{setForm(f=>({...f,phone:e.target.value}));setErrors({});}}/>{err('phone')}</div>
   <div className="field"><label htmlFor="client-notes">Бележки <span className="text-muted-foreground font-normal">({form.notes.length}/500)</span></label><textarea id="client-notes" rows={2} maxLength={500} value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))}/></div>
   <fieldset className="client-addresses"><legend>Адреси</legend>{form.addresses.map((a,i)=><div key={a.id} className="client-address">
    <div className="client-address-head"><label className="client-primary"><input type="radio" name="primary" checked={form.primary===a.id} onChange={()=>setForm(f=>({...f,primary:a.id}))}/>{form.primary===a.id?<><Star size={13}/>Основен адрес</>:`Адрес ${i+1} · направи основен`}</label><Button type="button" variant="ghost" size="icon" aria-label={`Премахни адрес ${i+1}`} disabled={form.addresses.length===1} title={form.addresses.length===1?'Клиентът трябва да има поне един адрес':undefined} onClick={()=>setForm(f=>{const list=f.addresses.filter(x=>x.id!==a.id);return {...f,addresses:list,primary:f.primary===a.id?list[0]!.id:f.primary};})}><Trash2/></Button></div>
    <div className="field"><label htmlFor={`client-city-${a.id}`}>Населено място<span className="required">*</span></label><select id={`client-city-${a.id}`} value={a.city} {...inv(`city-${a.id}`)} onChange={e=>setA(a.id,{city:e.target.value})}><option value="">Изберете населено място</option>{cities.map(c=><option key={c}>{c}</option>)}</select>{err(`city-${a.id}`)}</div>
    <div className="segmented" role="group" aria-label="Вид адрес"><Button type="button" variant="ghost" className="segment" aria-pressed={a.kind==='street'} onClick={()=>setA(a.id,{kind:'street'})}>{a.kind==='street'&&<Check size={13}/>}Улица и номер</Button><Button type="button" variant="ghost" className="segment" aria-pressed={a.kind==='place'} onClick={()=>setA(a.id,{kind:'place'})}>{a.kind==='place'&&<Check size={13}/>}Местоназначение</Button></div>
    {a.kind==='street'?<div className="client-street"><div className="field"><label htmlFor={`client-street-${a.id}`}>Улица<span className="required">*</span></label><input id={`client-street-${a.id}`} value={a.street} {...inv(`street-${a.id}`)} onChange={e=>setA(a.id,{street:e.target.value})}/>{err(`street-${a.id}`)}</div><div className="field"><label htmlFor={`client-number-${a.id}`}>Номер<span className="required">*</span></label><input id={`client-number-${a.id}`} value={a.number} {...inv(`number-${a.id}`)} onChange={e=>setA(a.id,{number:e.target.value})}/>{err(`number-${a.id}`)}</div></div>
    :<div className="field"><label htmlFor={`client-place-${a.id}`}>Местоназначение<span className="required">*</span></label><input id={`client-place-${a.id}`} placeholder="Жк, квартал, бизнес сграда…" value={a.place} {...inv(`place-${a.id}`)} onChange={e=>setA(a.id,{place:e.target.value})}/>{err(`place-${a.id}`)}</div>}
   </div>)}
   <Button type="button" variant="ghost" className="self-start text-primary" disabled={form.addresses.length>=5} onClick={()=>setForm(f=>({...f,addresses:[...f.addresses,blankAddr(Math.max(...f.addresses.map(x=>x.id))+1)]}))}><Plus/>Добави адрес</Button></fieldset>
   <div className="flex justify-end gap-2 pt-2"><Button variant="outline" type="button" onClick={()=>onOpenChange(false)}>Отказ</Button><Button type="submit"><Check/>Запази</Button></div>
  </form></DialogContent></Dialog>;
}
