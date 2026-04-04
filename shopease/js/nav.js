const Nav=(()=>{
  function toast(msg,type='i'){
    let c=document.getElementById('toasts');
    if(!c){c=document.createElement('div');c.id='toasts';document.body.appendChild(c);}
    const t=document.createElement('div');t.className='toast '+type;t.textContent=msg;c.appendChild(t);
    setTimeout(()=>{t.style.opacity='0';t.style.transition='opacity .3s';setTimeout(()=>t.remove(),300);},3000);
  }
  const MODS={
    privacy:{title:'Privacy Policy',body:'<h4>1. Who We Are</h4><p>ShopEase Ltd, Northern Ireland. UK GDPR & DPA 2018 compliant.</p><h4>2. What We Collect</h4><p>Name, email, delivery address, phone, order history. Card data is <strong>never stored</strong> on our servers — processed by PCI DSS Level 1 provider.</p><h4>3. Your Rights (UK GDPR)</h4><p>Access (Art.15), Rectification (Art.16), Erasure (Art.17), Portability (Art.20), Objection (Art.21). Email: privacy@shopease.com</p><h4>4. Retention</h4><p>Order data: 7 years. Account data: deleted within 30 days of erasure request.</p><h4>5. Contact</h4><p>DPO: privacy@shopease.com · ICO: ZA000000</p>'},
    cookies:{title:'Cookie Preferences',body:'<h4>Essential (Always Active)</h4><p>Session, cart, auth. Cannot be disabled.</p><h4>Analytics</h4><p>Anonymised usage data to improve the platform.</p><h4>Marketing</h4><p>Requires explicit consent (UK GDPR Art.7).</p><div style="display:flex;gap:7px;margin-top:14px;"><button class="btn btn-g btn-sm" onclick="Nav.setCookies(\'essential\');Nav.closeModal()">Essential Only</button><button class="btn btn-p btn-sm" onclick="Nav.setCookies(\'all\');Nav.closeModal()">Accept All</button></div>'},
    terms:{title:'Terms & Conditions',body:'<h4>Orders</h4><p>Subject to availability. Confirmation email on placement.</p><h4>Pricing</h4><p>GBP including 20% VAT. Delivery shown at checkout.</p><h4>Returns</h4><p>30 days unused items (Consumer Rights Act 2015).</p><h4>Governing Law</h4><p>Northern Ireland, UK.</p>'}
  };
  let amod=null;
  function showModal(name){closeModal();const c=MODS[name];if(!c)return;const ov=document.createElement('div');ov.className='mov';ov.id='amod';ov.innerHTML='<div class="modal" onclick="event.stopPropagation()"><div class="mhdr"><h3>'+c.title+'</h3><button class="mclose" onclick="Nav.closeModal()">&#x2715;</button></div><div class="mbody">'+c.body+'</div><div class="mfoot"><button class="btn btn-d btn-sm" onclick="Nav.closeModal()">Close</button></div></div>';ov.addEventListener('click',closeModal);document.body.appendChild(ov);amod=ov;}
  function closeModal(){if(amod){amod.remove();amod=null;}const e=document.getElementById('amod');if(e)e.remove();}
  function setCookies(lv){State.setCookies(lv);const b=document.getElementById('ckbanner');if(b)b.remove();State.track('cookie_consent',{level:lv});toast('Cookie preference saved.','s');}
  function injectBanner(){
    if(State.getCookies())return;
    const b=document.createElement('div');b.id='ckbanner';
    b.innerHTML='<p>We use cookies to improve your experience and remember your cart. By continuing you agree to our <a onclick="Nav.showModal(\'privacy\')" style="cursor:pointer;">Privacy Policy</a> and <a onclick="Nav.showModal(\'cookies\')" style="cursor:pointer;">Cookie Policy</a>. Processed under <strong>UK GDPR</strong>.</p><div class="ck-btns"><button class="btn btn-g btn-sm" onclick="Nav.setCookies(\'essential\')">Essential Only</button><button class="btn btn-d btn-sm" onclick="Nav.showModal(\'cookies\')">Manage</button><button class="btn btn-p btn-sm" onclick="Nav.setCookies(\'all\')">Accept All</button></div>';
    document.body.appendChild(b);
  }
  function toggleSidebar(){
    const sb=document.getElementById('sidebar'),ov=document.getElementById('sb-ov');
    if(sb)sb.classList.toggle('open');
    if(ov)ov.classList.toggle('open');
  }
  function injectNav(user){
    const adm=State.isAdminArea();
    const isAdmin=user&&user.role==='admin',isGuest=!user||user.role==='guest';
    const cc=State.cartCount();
    let nav=document.getElementById('topnav');
    if(!nav){nav=document.createElement('div');nav.id='topnav';document.body.prepend(nav);}
    nav.innerHTML='<button class="sb-tog" onclick="Nav.toggleSidebar()" aria-label="Menu">&#9776;</button><a class="nav-logo" href="'+(adm?'../shop.html':'shop.html')+'"><div class="nav-mark">SE</div>ShopEase</a>'+(isAdmin?'<div class="nav-sep"></div><span class="nav-ctx">Admin Console</span>':'')+'<div class="nav-right">'+((!isAdmin)?'<a href="'+(adm?'../cart.html':'cart.html')+'" class="btn btn-g btn-sm">Cart'+(cc>0?' <span style="background:var(--red);color:#fff;font-size:.6rem;padding:1px 5px;border-radius:7px;">'+cc+'</span>':'')+'</a>':'')+'<div class="nav-user nav-user-hide"><span>'+(user?(isGuest?'Guest':user.name||user.email):'')+'</span>'+(isAdmin?'<span class="bdg bdg-b">Admin</span>':'')+'</div><button class="btn btn-g btn-sm" onclick="State.logout()">Sign Out</button></div>';
    if(!document.getElementById('sb-ov')){const ov=document.createElement('div');ov.id='sb-ov';ov.onclick=toggleSidebar;document.body.appendChild(ov);}
  }
  const CN=[
    {g:'Shop',l:[{h:'shop.html',ic:'▦',lb:'Catalogue',id:'shop'},{h:'recommendations.html',ic:'◈',lb:'Recommendations',id:'recs'},{h:'wishlist.html',ic:'♡',lb:'Wishlist',id:'wishlist'}]},
    {g:'Order',l:[{h:'cart.html',ic:'⊞',lb:'Cart',id:'cart',bdg:'cart'},{h:'checkout.html',ic:'≡',lb:'Checkout',id:'checkout'},{h:'orders.html',ic:'📋',lb:'My Orders',id:'orders'}]},
    {g:'Account',l:[{h:'settings.html',ic:'⚙',lb:'Settings',id:'settings'}]},
    {g:'Help',l:[{h:'support.html',ic:'?',lb:'Support',id:'support'},{h:'contact.html',ic:'✉',lb:'Contact Us',id:'contact'}]},
  ];
  const AN=[
    {g:'Management',l:[{h:'stock.html',ic:'▦',lb:'Inventory',id:'stock'},{h:'analytics.html',ic:'◈',lb:'Analytics',id:'analytics'}]},
    {g:'Store',l:[{h:'../shop.html',ic:'⊞',lb:'View Store',id:'store'}]},
  ];
  function injectSidebar(page,user){
    let sb=document.getElementById('sidebar');
    if(!sb){sb=document.createElement('div');sb.id='sidebar';}
    const isAdmin=user&&user.role==='admin',adm=State.isAdminArea();
    const rawLinks=isAdmin?AN:CN;
    const links=(!isAdmin||adm)?rawLinks:rawLinks.map(sec=>({...sec,l:sec.l.map(l=>({...l,h:l.h.startsWith('../')?l.h.slice(3):'admin/'+l.h}))}));
    sb.innerHTML=links.map(sec=>'<div class="sb-grp">'+sec.g+'</div>'+sec.l.map(l=>{const bv=l.bdg==='cart'?State.cartCount():0;return'<a href="'+l.h+'" class="sb-a '+(page===l.id?'on':'')+'"><span class="sb-ic">'+l.ic+'</span>'+l.lb+(bv>0?'<span class="sb-bdg">'+bv+'</span>':'')+'</a>';}).join('')).join('')+'<div class="sb-div"></div><button class="sb-a sb-out" onclick="State.logout()"><span class="sb-ic">&#x23FB;</span>Sign Out</button>';
    const wrap=document.querySelector('.wrap');
    if(wrap)wrap.prepend(sb);else document.body.insertBefore(sb,document.querySelector('.main'));
  }
  function init({page='',adminOnly=false}={}){
    const user=State.requireAuth(adminOnly);if(!user)return;
    injectNav(user);injectSidebar(page,user);injectBanner();
    State.track('page_view',{page});return user;
  }
  return{init,toast,showModal,closeModal,setCookies,toggleSidebar};
})();
