const State=(()=>{
  const K={user:'se_u',cart:'se_c',wl:'se_w',prods:'se_p',recent:'se_r',cookies:'se_ck',evts:'se_e'};
  const ACCS=[
    {email:'user@shopease.com',pw:'password123',name:'Alex Thompson',role:'customer',mkt:true},
    {email:'admin@shopease.com',pw:'admin2025',name:'Admin',role:'admin',mkt:false}
  ];
  const DP=[
    {id:1,name:'Wireless Earbuds',emoji:'🎧',price:49.99,cat:'Electronics',stars:4.4,reviews:1284,stock:24},
    {id:2,name:'Running Shoes',emoji:'👟',price:84.99,cat:'Fashion',stars:4.8,reviews:893,stock:8},
    {id:3,name:'Coffee Maker',emoji:'☕',price:34.99,cat:'Home',stars:4.3,reviews:542,stock:0},
    {id:4,name:'Yoga Mat',emoji:'🧘',price:22.99,cat:'Fitness',stars:4.5,reviews:327,stock:45},
    {id:5,name:'Laptop Stand',emoji:'💻',price:29.99,cat:'Electronics',stars:4.7,reviews:2103,stock:3},
    {id:6,name:'Water Bottle',emoji:'💧',price:14.99,cat:'Fitness',stars:4.4,reviews:672,stock:60},
    {id:7,name:'Desk Lamp',emoji:'💡',price:39.99,cat:'Home',stars:4.2,reviews:435,stock:0},
    {id:8,name:'Backpack',emoji:'🎒',price:59.99,cat:'Fashion',stars:4.6,reviews:1820,stock:15},
    {id:9,name:'Smart Watch',emoji:'⌚',price:129.99,cat:'Electronics',stars:4.5,reviews:3421,stock:10},
    {id:10,name:'Resistance Bands',emoji:'🏋',price:18.99,cat:'Fitness',stars:4.3,reviews:290,stock:30},
    {id:11,name:'Candle Set',emoji:'🕯',price:24.99,cat:'Home',stars:4.7,reviews:762,stock:20},
    {id:12,name:'Sunglasses',emoji:'🕶',price:45.99,cat:'Fashion',stars:4.2,reviews:510,stock:5},
    {id:13,name:'Intel Core i5-14400',emoji:'🔩',price:189.99,cat:'Electronics',stars:4.6,reviews:312,stock:15},
    {id:14,name:'Nvidia RTX 4060',emoji:'🎮',price:299.99,cat:'Electronics',stars:4.7,reviews:528,stock:8},
    {id:15,name:'16GB DDR5 RAM Kit',emoji:'🧠',price:59.99,cat:'Electronics',stars:4.5,reviews:203,stock:30},
    {id:16,name:'1TB NVMe SSD',emoji:'💾',price:74.99,cat:'Electronics',stars:4.8,reviews:874,stock:25},
    {id:17,name:'ATX B760 Motherboard',emoji:'🔧',price:129.99,cat:'Electronics',stars:4.4,reviews:167,stock:10},
    {id:18,name:'650W Modular PSU',emoji:'🔋',price:79.99,cat:'Electronics',stars:4.6,reviews:441,stock:20},
    {id:19,name:'Mid Tower PC Case',emoji:'📦',price:69.99,cat:'Electronics',stars:4.3,reviews:289,stock:12},
    {id:20,name:'120mm CPU Air Cooler',emoji:'💨',price:34.99,cat:'Electronics',stars:4.5,reviews:156,stock:18}
  ];
  function g(k,fb=null){try{const v=localStorage.getItem(k);return v?JSON.parse(v):fb;}catch{return fb;}}
  function s(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch{}}
  function getUser(){return g(K.user);}
  function setUser(u){s(K.user,u);}
  function clearUser(){localStorage.removeItem(K.user);}
  function isAdminArea(){return window.location.pathname.includes('/admin/');}
  function idxPath(){return isAdminArea()?'../index.html':'index.html';}
  function requireAuth(adminOnly=false){
    const u=getUser();
    if(!u){window.location.href=idxPath();return null;}
    if(adminOnly&&u.role!=='admin'){window.location.href='../shop.html';return null;}
    return u;
  }
  function login(email,pw){const a=ACCS.find(x=>x.email===email&&x.pw===pw);if(!a)return null;const u={email:a.email,name:a.name,role:a.role,mkt:a.mkt};setUser(u);return u;}
  function guestLogin(){const u={email:null,name:'Guest',role:'guest',mkt:false};setUser(u);return u;}
  function logout(){clearUser();window.location.href=idxPath();}
  function addAccount(email,pw,name){ACCS.push({email,pw,name,role:'customer',mkt:false});setUser({email,name,role:'customer',mkt:false});}
  function changePw(email,old,nw){const a=ACCS.find(x=>x.email===email);if(!a||a.pw!==old)return false;a.pw=nw;return true;}
  function deleteAccount(email){const i=ACCS.findIndex(x=>x.email===email);if(i>-1)ACCS.splice(i,1);clearUser();s(K.cart,[]);s(K.wl,[]);s(K.recent,[]);}
  function downloadData(u){const d={account:u,cart:getCart(),wishlist:getWL(),recent:getRecent(),exported:new Date().toISOString(),note:'UK GDPR Art.15'};const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(d,null,2)],{type:'application/json'}));a.download='shopease-data.json';a.click();}
  function getProds(){return g(K.prods)||JSON.parse(JSON.stringify(DP));}
  function setProds(p){s(K.prods,p);}
  function getCart(){return g(K.cart,[]);}
  function setCart(c){s(K.cart,c);}
  function cartCount(){return getCart().reduce((a,i)=>a+i.qty,0);}
  function cartSub(){return getCart().reduce((a,i)=>a+i.price*i.qty,0);}
  function addToCart(p,qty=1){
    const cart=getCart(),prods=getProds(),pp=prods.find(x=>x.id===p.id);
    if(pp&&pp.stock===0)return false;
    const ex=cart.find(i=>i.id===p.id);
    if(ex){if(pp&&ex.qty>=pp.stock)return false;ex.qty+=qty;}
    else{const item={id:p.id,name:p.name,emoji:p.emoji,price:p.price,cat:p.cat,qty};if(p.image)item.image=p.image;cart.push(item);}
    setCart(cart);track('add_to_cart',{name:p.name,price:p.price});return true;
  }
  function clearCart(){s(K.cart,[]);}
  function getWL(){return g(K.wl,[]);}
  function setWL(w){s(K.wl,w);}
  function toggleWL(id,name){const wl=getWL(),i=wl.indexOf(id);if(i>-1){wl.splice(i,1);setWL(wl);return false;}wl.push(id);setWL(wl);track('wl_add',{name});return true;}
  function getRecent(){return g(K.recent,[]);}
  function addRecent(id){let r=getRecent().filter(x=>x!==id);r.unshift(id);if(r.length>8)r=r.slice(0,8);s(K.recent,r);}
  function getCookies(){return g(K.cookies);}
  function setCookies(lv){s(K.cookies,lv);}
  function getEvts(){return g(K.evts,[]);}
  function track(type,data={}){const e=getEvts();e.push({type,data,ts:Date.now()});if(e.length>2000)e.splice(0,e.length-2000);s(K.evts,e);}
  function clearEvts(){s(K.evts,[]);}
  return{getUser,setUser,clearUser,requireAuth,login,guestLogin,logout,addAccount,changePw,deleteAccount,downloadData,
    getProds,setProds,getCart,setCart,cartCount,cartSub,addToCart,clearCart,
    getWL,setWL,toggleWL,getRecent,addRecent,getCookies,setCookies,getEvts,track,clearEvts,isAdminArea,idxPath};
})();
