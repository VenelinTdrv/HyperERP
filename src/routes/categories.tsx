import { createFileRoute } from '@tanstack/react-router';
import { useState, type FormEvent } from 'react';
import { Check, ChevronDown, ChevronRight, ChevronsDownUp, ChevronsUpDown, Eye, Folder, FolderOpen, MoreVertical, Pencil, Plus, Search, ShieldCheck, Trash2, X } from 'lucide-react';
import { WorkspaceShell } from '@/components/workspace-shell';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export const Route = createFileRoute('/categories')({
 head:()=>({meta:[{title:'HyperERP · Категории'},{name:'description',content:'Управление на категории и подкатегории в каталога на HyperERP.'},{property:'og:title',content:'HyperERP · Категории'},{property:'og:description',content:'Йерархичен каталог със създаване, преглед и редакция на категории.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}]}),
 component:Categories,
});
type Category = { id:number; name:string; parentId:number|null };
const initialCategories:Category[] = [
 {id:1,name:'LEGO',parentId:null}, {id:2,name:'Козметика',parentId:null},
 {id:3,name:'Дезодоранти',parentId:2}, {id:4,name:'Парфюми',parentId:2},
 {id:5,name:'Техника',parentId:null}, {id:6,name:'Телевизори',parentId:5},
];
function descendantIds(rows:Category[], id:number):number[] {
 return rows.filter(row=>row.parentId===id).flatMap(row=>[row.id,...descendantIds(rows,row.id)]);
}
function categoryPath(rows:Category[], id:number):string {
 const row=rows.find(item=>item.id===id);
 if(!row)return '';
 return row.parentId===null?row.name:`${categoryPath(rows,row.parentId)} › ${row.name}`;
}
function Categories() {
 const [rows,setRows]=useState(initialCategories);
 const [expanded,setExpanded]=useState<number[]>([2,5]);
 const [search,setSearch]=useState('');
 const [editor,setEditor]=useState(false);
 const [editing,setEditing]=useState<Category|null>(null);
 const [name,setName]=useState('');
 const [parent,setParent]=useState('');
 const [error,setError]=useState('');
 const [selected,setSelected]=useState<Category|null>(null);
 const [deleting,setDeleting]=useState<Category|null>(null);
 const [announcement,setAnnouncement]=useState('');
 const query=search.trim().toLocaleLowerCase('bg-BG');
 const matches=rows.filter(row=>row.name.toLocaleLowerCase('bg-BG').includes(query));
 const shownIds=new Set(matches.flatMap(row=>{
  const ancestors:number[]=[row.id];let parentId=row.parentId;
  while(parentId!==null){ancestors.push(parentId);parentId=rows.find(item=>item.id===parentId)?.parentId??null;}
  return ancestors;
 }));
 const forbidden=editing?[editing.id,...descendantIds(rows,editing.id)]:[];
 const parentOptions=rows.filter(row=>!forbidden.includes(row.id));
 const startNew=(parentId:number|null=null)=>{setEditing(null);setName('');setParent(parentId===null?'':String(parentId));setError('');setEditor(true);};
 const startEdit=(row:Category)=>{setSelected(null);setEditing(row);setName(row.name);setParent(row.parentId===null?'':String(row.parentId));setError('');setEditor(true);};
 const save=(event:FormEvent)=>{
  event.preventDefault();const trimmed=name.trim();const parentId=parent?Number(parent):null;
  if(!trimmed){setError('Въведете име на категорията.');document.getElementById('category-name')?.focus();return;}
  if(parentId!==null&&!parentOptions.some(row=>row.id===parentId)){setError('Изберете валидна родителска категория.');return;}
  if(rows.some(row=>row.id!==editing?.id&&row.parentId===parentId&&row.name.toLocaleLowerCase('bg-BG')===trimmed.toLocaleLowerCase('bg-BG'))){setError('Вече съществува категория с това име на същото ниво.');return;}
  if(editing)setRows(prev=>prev.map(row=>row.id===editing.id?{...row,name:trimmed,parentId}:row));
  else setRows(prev=>[...prev,{id:Math.max(0,...prev.map(row=>row.id))+1,name:trimmed,parentId}]);
  if(parentId!==null)setExpanded(prev=>[...new Set([...prev,parentId,...rows.filter(row=>categoryPath(rows,parentId).startsWith(categoryPath(rows,row.id)+' › ')).map(row=>row.id)])]);
  setSearch('');setEditor(false);setAnnouncement(`${trimmed} · ${editing?'Промените са приложени':'Категорията е добавена'} само в демонстрацията.`);
 };
 const renderBranch=(parentId:number|null):React.ReactNode=>{
  const children=rows.filter(row=>row.parentId===parentId&&(!query||shownIds.has(row.id)));
  return <ul className="category-tree-level">{children.map(row=>{
   const childCount=rows.filter(item=>item.parentId===row.id).length;
   const open=Boolean(query)||expanded.includes(row.id);
   return <li key={row.id}><div className="category-tree-row">
    {childCount?<Button variant="ghost" size="icon" className="category-tree-toggle" aria-label={`${open?'Свий':'Разгъни'} ${row.name}`} aria-expanded={open} aria-controls={`category-children-${row.id}`} disabled={Boolean(query)} onClick={()=>setExpanded(prev=>open?prev.filter(id=>id!==row.id):[...prev,row.id])}>{open?<ChevronDown/>:<ChevronRight/>}</Button>:<span className="category-tree-spacer"/>}
    {childCount&&open?<FolderOpen className="category-tree-icon" size={18}/>:<Folder className="category-tree-icon" size={18}/>}
    <Button variant="ghost" className="category-tree-name" onClick={()=>setSelected(row)}>{row.name}</Button>
    {childCount>0&&<span className="category-tree-count">{childCount}</span>}
    <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="category-tree-menu" aria-label={`Действия ${row.name}`} title={`Действия за ${row.name}`}><MoreVertical/></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onSelect={()=>setSelected(row)}><Eye/>Детайли</DropdownMenuItem><DropdownMenuItem onSelect={()=>startNew(row.id)}><Plus/>Добави подкатегория</DropdownMenuItem><DropdownMenuItem onSelect={()=>startEdit(row)}><Pencil/>Редактирай</DropdownMenuItem><DropdownMenuSeparator/><DropdownMenuItem className="text-destructive focus:text-destructive" onSelect={()=>setDeleting(row)}><Trash2/>Изтрий</DropdownMenuItem></DropdownMenuContent></DropdownMenu>
   </div>{childCount>0&&open&&<div id={`category-children-${row.id}`}>{renderBranch(row.id)}</div>}</li>;
  })}</ul>;
 };
 const deleteChildren=deleting?rows.filter(row=>row.parentId===deleting.id):[];
 return <WorkspaceShell active="Категории"><div className="page-content deliveries-content">
  <div className="page-heading"><div><h1>Категории</h1><p>Категории и подкатегории на каталога</p></div><Button className="delivery-add" onClick={()=>startNew()}><Plus/>Добави категория</Button></div>
  <div className="categories-search"><div className="search-box"><Search/><input className="search-input" aria-label="Търси категория" placeholder="Търсене по име…" value={search} onChange={e=>setSearch(e.target.value)}/></div><Button variant="outline" size="icon" aria-label="Изчисти търсенето" title="Изчисти търсенето" disabled={!search} onClick={()=>setSearch('')}><X/></Button></div>
  {announcement&&<div className="delivery-notice" role="status"><Check size={16}/><span>{announcement}</span><Button variant="ghost" size="icon" aria-label="Затвори съобщението" onClick={()=>setAnnouncement('')}><X/></Button></div>}
  <section className="category-tree" aria-label="Списък с категории"><div className="category-tree-toolbar"><h2>Всички категории <span>{rows.length}</span></h2><div><Button variant="ghost" size="sm" disabled={Boolean(query)||!rows.some(row=>row.parentId!==null)} onClick={()=>setExpanded(rows.map(row=>row.id))}><ChevronsUpDown/>Разгъни всички</Button><Button variant="ghost" size="sm" disabled={Boolean(query)||!expanded.length} onClick={()=>setExpanded([])}><ChevronsDownUp/>Свий всички</Button></div></div>
  {matches.length?renderBranch(null):<div className="delivery-empty"><Folder size={32}/><h3>{rows.length?'Няма намерени категории':'Все още няма категории'}</h3>{rows.length?<><p>Няма резултати за „{search.trim()}“.</p><Button variant="outline" onClick={()=>setSearch('')}><X/>Изчисти търсенето</Button></>:<Button className="mt-4" onClick={()=>startNew()}><Plus/>Добави категория</Button>}</div>}
  <div className="category-tree-footer">{query?`${matches.length} намерени категории`:`${rows.filter(row=>row.parentId===null).length} основни категории · ${rows.filter(row=>row.parentId!==null).length} подкатегории`}</div></section>
  <div className="demo-caption mt-4"><ShieldCheck size={13}/>Примерни категории · без реално записване или промяна на артикули</div>
 </div>
 <Dialog open={editor} onOpenChange={setEditor}><DialogContent className="max-w-lg max-h-[90dvh] overflow-y-auto"><DialogHeader><DialogTitle className="article-dialog-title">{editing?'Редактирай категория':'Добави категория'}</DialogTitle><DialogDescription>Примерни данни · без реално записване</DialogDescription></DialogHeader><form className="delivery-editor" onSubmit={save} noValidate><div className="field"><label htmlFor="category-parent">Родителска категория</label><select id="category-parent" value={parent} onChange={e=>{setParent(e.target.value);setError('');}}><option value="">Няма (основна категория)</option>{parentOptions.map(row=><option key={row.id} value={row.id}>{categoryPath(rows,row.id)}</option>)}</select></div><div className="field"><label htmlFor="category-name">Име<span className="required">*</span></label><input id="category-name" value={name} required maxLength={120} placeholder="Име на категорията" aria-invalid={Boolean(error)} aria-describedby={error?'category-error':undefined} onChange={e=>{setName(e.target.value);setError('');}}/>{error&&<p id="category-error" className="text-xs text-destructive" role="alert">{error}</p>}</div><div className="flex justify-end gap-2 pt-2"><Button variant="outline" type="button" onClick={()=>setEditor(false)}>Отказ</Button><Button type="submit"><Check/>Запази</Button></div></form></DialogContent></Dialog>
 <Dialog open={selected!==null} onOpenChange={open=>{if(!open)setSelected(null);}}><DialogContent><DialogHeader><DialogTitle className="article-dialog-title">{selected?.name}</DialogTitle><DialogDescription>Детайли за категорията · примерни данни</DialogDescription></DialogHeader>{selected&&<><dl className="delivery-details"><div><dt>Родителска категория</dt><dd>{selected.parentId===null?'Няма (основна категория)':categoryPath(rows,selected.parentId)}</dd></div><div><dt>Подкатегории</dt><dd>{rows.filter(row=>row.parentId===selected.id).length}</dd></div><div className="col-span-2"><dt>Пълен път</dt><dd className="break-words">{categoryPath(rows,selected.id)}</dd></div></dl><div className="flex justify-end gap-2"><Button variant="outline" onClick={()=>setSelected(null)}>Затвори</Button><Button onClick={()=>startEdit(selected)}><Pencil/>Редактирай</Button></div></>}</DialogContent></Dialog>
 <Dialog open={deleting!==null} onOpenChange={open=>{if(!open)setDeleting(null);}}><DialogContent><DialogHeader><DialogTitle className="article-dialog-title">{deleteChildren.length?'Категорията има подкатегории':'Изтриване на категория?'}</DialogTitle><DialogDescription>{deleteChildren.length?`„${deleting?.name}“ съдържа ${deleteChildren.length} подкатегории. Преместете или изтрийте подкатегориите, преди да премахнете тази категория.`:`„${deleting?.name}“ ще бъде премахната само от демонстрационния списък. Артикулите няма да се променят.`}</DialogDescription></DialogHeader><div className="flex justify-end gap-2"><Button variant="outline" onClick={()=>setDeleting(null)}>{deleteChildren.length?'Затвори':'Отказ'}</Button>{!deleteChildren.length&&<Button variant="destructive" onClick={()=>{if(!deleting)return;setRows(prev=>prev.filter(row=>row.id!==deleting.id));setExpanded(prev=>prev.filter(id=>id!==deleting.id));setAnnouncement(`${deleting.name} · Категорията е изтрита само в демонстрацията.`);setDeleting(null);}}><Trash2/>Изтрий категорията</Button>}</div></DialogContent></Dialog>
 </WorkspaceShell>;
}