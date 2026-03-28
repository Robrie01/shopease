const V=(()=>{
  const email=v=>/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test((v||'').trim());
  const phone=v=>/^(\+44|0)[0-9]{9,10}$/.test((v||'').replace(/[\s\-()]/g,''));
  const postcode=v=>/^[A-Z]{1,2}[0-9][0-9A-Z]?\s?[0-9][A-Z]{2}$/i.test((v||'').trim());
  const req=v=>(v||'').trim().length>0;
  function luhn(n){const d=(n||'').replace(/\s/g,'').split('').reverse();if(d.length<13)return false;let s=0;d.forEach((c,i)=>{let x=+c;if(i%2!==0){x*=2;if(x>9)x-=9;}s+=x;});return s%10===0;}
  function cardType(n){const c=(n||'').replace(/\s/g,'');if(/^4/.test(c))return'visa';if(/^5[1-5]|^2[2-7]/.test(c))return'mc';if(/^3[47]/.test(c))return'amex';return'';}
  function expiry(v){const cl=(v||'').replace(/[\s\/]/g,'');if(cl.length<4)return false;const m=parseInt(cl.slice(0,2)),y=parseInt('20'+cl.slice(2,4)),now=new Date();return m>=1&&m<=12&&(y>now.getFullYear()||(y===now.getFullYear()&&m>=now.getMonth()+1));}
  function cvv(v,t){const l=t==='amex'?4:3;return/^\d+$/.test(v||'')&&(v||'').length===l;}
  function pwStr(v){let s=0;if((v||'').length>=8)s++;if(/[A-Z]/.test(v))s++;if(/[0-9]/.test(v))s++;if(/[^A-Za-z0-9]/.test(v))s++;return s;}
  function sf(id,ok){const el=document.getElementById(id);if(!el)return;el.classList.toggle('ok',ok===true);el.classList.toggle('bad',ok===false);}
  function se(id,show){const el=document.getElementById(id);if(el)el.classList.toggle('on',show);}
  function sok(id,show){const el=document.getElementById(id);if(el)el.classList.toggle('on',show);}
  function vf(inId,errId,okId,fn){const el=document.getElementById(inId);if(!el)return false;const v=el.value,ok=fn(v),has=v.trim().length>0;sf(inId,has?ok:null);if(errId)se(errId,has&&!ok);if(okId)sok(okId,has&&ok);return ok&&has;}
  function pwBars(inputId,pfx){const el=document.getElementById(inputId);const v=el?el.value:'';const s=pwStr(v);const cls=['','w','f','g','s'],lbs=['','Weak','Fair','Good','Strong'];[0,1,2,3].forEach(i=>{const b=document.getElementById(pfx+'_b'+i);if(b)b.className='pwbar'+(i<s?' '+cls[s]:'');});const lb=document.getElementById(pfx+'_l');if(lb)lb.textContent=v?lbs[s]+' password':'';return v.length>=8;}
  function fmtCard(id){const el=document.getElementById(id);if(!el)return'';let v=el.value.replace(/\D/g,'').slice(0,16);v=v.match(/.{1,4}/g)?.join(' ')||v;el.value=v;return cardType(v);}
  function fmtExp(id){const el=document.getElementById(id);if(!el)return;let v=el.value.replace(/\D/g,'').slice(0,4);if(v.length>=3)v=v.slice(0,2)+' / '+v.slice(2);el.value=v;}
  return{email,phone,postcode,req,luhn,cardType,expiry,cvv,pwStr,sf,se,sok,vf,pwBars,fmtCard,fmtExp};
})();
