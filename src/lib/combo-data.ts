export const comboProducts = [
 {id:1,name:'Парфюм 1',sku:'123456',perfume:true},
 {id:2,name:'Парфюм 2',sku:'234567',perfume:true},
 {id:3,name:'Парфюм 3',sku:'345678',perfume:true},
 {id:4,name:'Дезодорант 1',sku:'45678',perfume:false},
 {id:5,name:'Дезодорант 2',sku:'56789',perfume:false},
 {id:6,name:'Дезодорант 3',sku:'6789',perfume:false},
 {id:7,name:'LEGO 1',sku:'78791',perfume:false},
 {id:8,name:'LEGO 2',sku:'12345678',perfume:false},
 {id:9,name:'LEGO 3',sku:'78913',perfume:false},
];
export const influencers = ['Виктория Григорова','Елена Петрова','Мария Иванова'];
export type ComboItem = {productId:number;quantity:number};
export type ComboForm = {name:string;influencer:string;description:string;items:ComboItem[]};
export type Combo = ComboForm & {id:number;created:string;createdBy:string;edited:string;editedBy:string};
export const initialCombos:Combo[] = [
 {id:1,name:'Комбо 1',influencer:influencers[0]??'',description:'Селекция от три парфюма.',items:[{productId:1,quantity:2},{productId:2,quantity:1},{productId:3,quantity:3}],created:'2026-10-14T11:06',createdBy:'Венелин Тодоров',edited:'',editedBy:''},
 {id:2,name:'Zlatno',influencer:influencers[0]??'',description:'Подаръчен комплект.',items:[{productId:1,quantity:1},{productId:8,quantity:2}],created:'2026-10-14T11:18',createdBy:'Виктория Григорова',edited:'2026-10-14T14:30',editedBy:'Венелин Тодоров'},
 {id:3,name:'Тест',influencer:influencers[0]??'',description:'Парфюм и ежедневна грижа.',items:[{productId:1,quantity:1},{productId:5,quantity:3}],created:'2026-10-14T12:06',createdBy:'Виктория Григорова',edited:'',editedBy:''},
];
export const comboDate = (value:string)=>value?new Date(value).toLocaleString('bg-BG',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'}):'—';