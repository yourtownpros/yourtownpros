
(function(){
var el=document.getElementById("ytp-lmap");if(!el||!window.L)return;
var dEl=document.getElementById("ytp-lmap-data");if(!dEl)return;
var d=null;try{d=JSON.parse(dEl.textContent)}catch(e){return}
function esc(s){return String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}
/* v5.10.1: CARTO Voyager tiles, and wheel zoom stays
off until the map is clicked (the category-map pattern),
so page scroll is never trapped by the listing map. */
var map=L.map(el,{scrollWheelZoom:false});
L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:19,attribution:"&copy; OpenStreetMap contributors"}).addTo(map);
el.addEventListener("click",function(){if(map.scrollWheelZoom&&!map.scrollWheelZoom.enabled())map.scrollWheelZoom.enable()});
if(d.mode==="pin"){map.setView([d.lat,d.lng],15);
L.marker([d.lat,d.lng]).addTo(map).bindPopup("<strong>"+esc(d.name)+"</strong><br>"+esc(d.addr));}
else{map.setView([d.lat,d.lng],12);
L.marker([d.lat,d.lng]).addTo(map).bindPopup(esc(d.city));}
})();


/* v5.1: Suggest an edit inserts one pending row into edit_suggestions (schema v10); nothing renders publicly from it, and the form never shows a success it did not get. */
ytpOnReady(function(A){
var form=document.querySelector(".sgform");
if(!form)return;
var slug=form.getAttribute("data-slug");
/* Nov 16, 2026: tapping a suggest row selects its type into the hidden sg_field, expands the details area, and swaps in that type's prompt. */
var sgRows=form.querySelectorAll(".sgx-row");
var sgField=form.querySelector('[name="sg_field"]');
var sgDetail=form.querySelector(".sgx-detail");
var sgTa=form.querySelector('[name="sg_details"]');
function sgSelect(row){
for(var i=0;i<sgRows.length;i++)sgRows[i].setAttribute("aria-checked",sgRows[i]===row?"true":"false");
if(sgField)sgField.value=row.getAttribute("data-type")||"";
if(sgTa&&row.getAttribute("data-ph"))sgTa.placeholder=row.getAttribute("data-ph");
if(sgDetail)sgDetail.hidden=false;
if(sgTa)sgTa.focus();
}
for(var si=0;si<sgRows.length;si++){(function(r){r.addEventListener("click",function(){sgSelect(r);});})(sgRows[si]);}
var sgRep=document.getElementById("sgx-report");
if(sgRep)sgRep.addEventListener("click",function(ev){
ev.preventDefault();
var o=form.querySelector('.sgx-row[data-type="other"]');
if(o){sgSelect(o);o.scrollIntoView({behavior:(window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches)?"auto":"smooth",block:"nearest"});}
});
form.addEventListener("submit",function(ev){
ev.preventDefault();
var msg=form.querySelector(".sgmsg");
function fail(){if(msg)msg.textContent="Could not send. Please try again later.";}
var hp=form.querySelector("input[name='company_website']");
if(hp&&hp.value)return;
function val(n){var el=form.querySelector('[name="'+n+'"]');return el?el.value.trim():"";}
if(sgField&&!sgField.value){if(msg)msg.textContent="Please tap the thing that should change first.";return;}
var name=val("sg_name"),details=val("sg_details");
if(!name||!details){if(msg)msg.textContent="Please add your name and a few details about what should change.";return;}
if(!A||!A.sb){fail();return;}
var row={business_slug:slug,field_hint:val("sg_field"),details:details,submitter_name:name,contact:val("sg_email"),status:"pending"};
if(A.user)row.user_id=A.user.id;
var tsT=(form.querySelector("input[name='cf-turnstile-response']")||{}).value||"";if(tsT)row.turnstile_token=tsT;
function sgSend(rw){return A.sb.from("edit_suggestions").insert(rw)}
function sgOk(){
form.reset();
for(var i=0;i<sgRows.length;i++)sgRows[i].setAttribute("aria-checked","false");
if(sgDetail)sgDetail.hidden=true;
if(msg)msg.textContent="Thanks. We check every suggestion before anything on this page changes.";
}
sgSend(row).then(function(r){
if(r.error){if(tsT&&/turnstile_token/.test(r.error.message||"")){delete row.turnstile_token;sgSend(row).then(function(r2){if(r2.error){fail();return;}sgOk()}).catch(fail);return;}fail();return;}
sgOk();
}).catch(fail);
});
});
/* v5.1: owner highlights render approved owner_highlights rows (schema v10) as chips in the mount; any error leaves the mount empty. */
ytpOnReady(function(A){
var mount=document.getElementById("ytp-highlights");
if(!mount||!A||!A.sb)return;
var slug=mount.getAttribute("data-slug");
A.sb.from("owner_highlights").select("highlight").eq("business_slug",slug).eq("status","approved").order("created_at",{ascending:true}).then(function(r){
if(!r||r.error||!r.data||!r.data.length)return;
var card=document.createElement("div");
card.className="card";
var h=document.createElement("h2");
h.textContent="Highlights";
card.appendChild(h);
var p=document.createElement("p");
p.className="listed";
p.textContent="Picked by the owner of this business. We check each pick before it appears here.";
card.appendChild(p);
var row=document.createElement("div");
row.className="hlchips";
r.data.forEach(function(x){
var s=document.createElement("span");
s.className="hlchip";
s.textContent=x.highlight;
row.appendChild(s);
});
card.appendChild(row);
mount.appendChild(card);
}).catch(function(){});
});

(function(){var b=document.querySelector(".share57");if(!b||!navigator.clipboard)return;b.addEventListener("click",function(){navigator.clipboard.writeText(location.href).then(function(){b.textContent="Link copied";setTimeout(function(){b.textContent="Share"},2500)},function(){})})})();

/* Item 20 (Nov 18, 2026): shared dropdown keyboard navigation: arrows open and move, Home and End jump, Escape closes and refocuses the button. */
function ytpKbNav(box,btn,getItems,open,close){box.addEventListener("keydown",function(e){var items=getItems();if(!items||!items.length)return;var idx=-1;for(var i=0;i<items.length;i++)if(items[i]===document.activeElement)idx=i;
if(e.key==="ArrowDown"){e.preventDefault();if(idx<0){open();items[0].focus()}else items[(idx+1)%items.length].focus()}
else if(e.key==="ArrowUp"){e.preventDefault();if(idx<0){open();items[items.length-1].focus()}else items[(idx-1+items.length)%items.length].focus()}
else if(e.key==="Home"){e.preventDefault();items[0].focus()}
else if(e.key==="End"){e.preventDefault();items[items.length-1].focus()}
else if(e.key==="Escape"){close();btn.focus()}})}

(function(){
var menus=document.querySelectorAll(".fbmenu,.cnav-item");
function setBtn(m,open){var b=m.querySelector("button");if(b)b.setAttribute("aria-expanded",open?"true":"false")}
function closeAll(except){for(var i=0;i<menus.length;i++){if(menus[i]!==except){menus[i].classList.remove("open");setBtn(menus[i],false)}}}
for(var j=0;j<menus.length;j++){(function(m){var b=m.querySelector("button");if(!b)return;
b.addEventListener("click",function(e){e.stopPropagation();var was=m.classList.contains("open");closeAll(m);if(!was){m.classList.add("open");setBtn(m,true);
/* v4.2: below 1200px the category nav is a scrollable row and its
dropdown is position:fixed (V42_CSS), so pin its top just under the
nav row; the scroll container cannot clip a fixed panel. */
if(m.classList.contains("cnav-item")&&window.innerWidth<1200){var d=m.querySelector(".cnav-drop");if(d){var nv=m.closest?m.closest(".catnav"):null;var nb=nv?nv.getBoundingClientRect().bottom:b.getBoundingClientRect().bottom;d.style.top=(nb+8)+"px"}}}});
m.addEventListener("focusout",function(e){if(!m.contains(e.relatedTarget)){m.classList.remove("open");setBtn(m,false)}});
ytpKbNav(m,b,function(){var d=m.querySelector(".fbdrop,.cnav-drop");return d?d.querySelectorAll("a,button"):[]},function(){closeAll(m);m.classList.add("open");setBtn(m,true);if(m.classList.contains("cnav-item")&&window.innerWidth<1200){var d=m.querySelector(".cnav-drop");if(d){var nv=m.closest?m.closest(".catnav"):null;var nb=nv?nv.getBoundingClientRect().bottom:b.getBoundingClientRect().bottom;d.style.top=(nb+8)+"px"}}},function(){m.classList.remove("open");setBtn(m,false)});
})(menus[j])}
var navs=document.querySelectorAll(".catnav");
for(var n=0;n<navs.length;n++){navs[n].addEventListener("scroll",function(){closeAll(null)})}
document.addEventListener("click",function(){closeAll(null)});
document.addEventListener("keydown",function(e){if(e.key==="Escape")closeAll(null)});
})();


/* SHIP 1 (spec 2.2): window.YTPLoad, the one shared loader: a URL is fetched at most once per page; some indexes persist in sessionStorage under versioned keys. */
window.YTPLoad = (function () {
  var BUILD = "v532-20261119-item65";
  var cache = {}, pending = {};
  var SESS = { "/typeahead.json": "ytp-ta-",
    "/cities-index.json": "ytp-ci-",
    "/zip-index.json": "ytp-zi-",
    "/category-index.json": "ytp-cat-" };
  var SHARD_CAP = 2500000;
  function sessGet(key) {
    try { var s = sessionStorage.getItem(key);
      return s ? JSON.parse(s) : null; } catch (e) { return null; }
  }
  function sessSet(key, val) {
    try { sessionStorage.setItem(key, JSON.stringify(val)); }
    catch (e) {}
  }
  function shardKey(url) { return "ytp-sh-" + BUILD + "-" + url; }
  function shardGet(url) { return sessGet(shardKey(url)); }
  function shardPut(url, data) {
    var raw; try { raw = JSON.stringify(data); } catch (e) { return; }
    var idx = sessGet("ytp-shidx-" + BUILD) || {};
    idx[url] = { b: raw.length, t: Date.now() };
    var total = 0, k;
    for (k in idx) total += idx[k].b;
    var keys = Object.keys(idx).sort(function (a, b) {
      return idx[a].t - idx[b].t; });
    while (total > SHARD_CAP && keys.length) {
      var drop = keys.shift();
      total -= idx[drop].b; delete idx[drop];
      try { sessionStorage.removeItem(shardKey(drop)); }
      catch (e) {}
    }
    sessSet("ytp-shidx-" + BUILD, idx);
    sessSet(shardKey(url), data);
  }
  function json(url) {
    if (cache[url]) return Promise.resolve(cache[url]);
    if (pending[url]) return pending[url];
    var pre = SESS[url], hit = null;
    if (pre) hit = sessGet(pre + BUILD);
    else if (url.indexOf("/search-shards/") === 0)
      hit = shardGet(url);
    if (hit) { cache[url] = hit; return Promise.resolve(hit); }
    pending[url] = fetch(url).then(function (r) {
      return r.json();
    }).then(function (d) {
      cache[url] = d; delete pending[url];
      if (pre) sessSet(pre + BUILD, d);
      else if (url.indexOf("/search-shards/") === 0)
        shardPut(url, d);
      return d;
    }).catch(function (e) {
      delete pending[url]; throw e;
    });
    return pending[url];
  }
  function cb(url, fn) {
    json(url).then(function (d) { fn(d); },
      function () { fn(null); });
  }
  return { json: json, cb: cb, BUILD: BUILD };
})();


/* v5.12 SHIP 1: header two-field search on YTPLoad; suggestions read typeahead.json only. v5.12.2: the where box is NEVER prefilled. */
(function(){
var form=document.getElementById("ytp-hform57");if(!form)return;
var f1=document.getElementById("ytp-q57"),f2=document.getElementById("ytp-w57"),
s1=document.getElementById("sug-q57"),s2=document.getElementById("sug-w57");
var TA=null,CT=null,CAT=null,ZIPD=null,pickB=null,pickV=null,pickC=null,pickCat=false,hi57=-1,s1Items=null,s1Fn=null,hiW57=-1,s2Items=null,s2Fn=null;
function esc(s){return String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}
/* WCAG F2: typeahead combobox semantics. The inputs own the listbox state, and aria-activedescendant follows the visual highlight. */
function setupCombo(input,box){input.setAttribute("role","combobox");input.setAttribute("aria-expanded","false");input.setAttribute("aria-controls",box.id);input.setAttribute("aria-autocomplete","list");input.setAttribute("aria-haspopup","listbox");box.setAttribute("role","listbox")}
setupCombo(f1,s1);setupCombo(f2,s2);
function syncCombo(box,input,hi){var open=box.style.display==="block";input.setAttribute("aria-expanded",open?"true":"false");var links=box.querySelectorAll("a");for(var i=0;i<links.length;i++)links[i].setAttribute("aria-selected",i===hi?"true":"false");if(open&&hi>=0&&links[hi])input.setAttribute("aria-activedescendant",links[hi].id);else input.removeAttribute("aria-activedescendant")}
function hideSug(box,input){box.style.display="none";syncCombo(box,input,-1)}
function loadTA(cb){if(TA){cb();return}window.YTPLoad.cb("/typeahead.json",function(d){TA=d||{cats:[],towns:[],names:[],shared:{}};if(TA.names&&TA.names.length&&Array.isArray(TA.names[0]))TA.names=TA.names.map(function(a){return{n:a[0],u:a[1],t:a[2],vs:String(a[1]).split("/")[1],c:a[3],s:a[4],v:a[5],la:a[6],lo:a[7],cl:(a[8]&1)?1:0,f:(a[8]&2)?1:0}});cb()})}
function loadCT(cb){if(CT){cb();return}window.YTPLoad.cb("/cities-index.json",function(d){CT=d||[];cb()})}
function loadCAT(cb){if(CAT){cb();return}window.YTPLoad.cb("/category-index.json",function(d){CAT=d||{};cb()})}
function loadZIP65(cb){if(ZIPD){cb();return}window.YTPLoad.cb("/zip-index.json",function(d){ZIPD=d||{};cb()})}
function ensure(cb){loadTA(function(){loadCT(function(){loadCAT(function(){loadZIP65(cb)})})})}
/* v5.32 item 65: search language helpers. STATES65 maps a bare
state name (or its abbreviation) in the where box to the state
hub slug; zipCity65 resolves a 5-digit ZIP through zip-index.json,
which is built only from our own listing addresses (majority city
per ZIP, towns we list only), never an external lookup. */
var STATES65={"alabama":["AL","alabama"],"alaska":["AK","alaska"],"arizona":["AZ","arizona"],"arkansas":["AR","arkansas"],"california":["CA","california"],"colorado":["CO","colorado"],"connecticut":["CT","connecticut"],"florida":["FL","florida"],"georgia":["GA","georgia"],"idaho":["ID","idaho"],"illinois":["IL","illinois"],"indiana":["IN","indiana"],"iowa":["IA","iowa"],"kansas":["KS","kansas"],"kentucky":["KY","kentucky"],"louisiana":["LA","louisiana"],"maryland":["MD","maryland"],"michigan":["MI","michigan"],"minnesota":["MN","minnesota"],"mississippi":["MS","mississippi"],"missouri":["MO","missouri"],"montana":["MT","montana"],"nebraska":["NE","nebraska"],"nevada":["NV","nevada"],"new mexico":["NM","new-mexico"],"new york":["NY","new-york"],"north carolina":["NC","north-carolina"],"north dakota":["ND","north-dakota"],"ohio":["OH","ohio"],"oklahoma":["OK","oklahoma"],"oregon":["OR","oregon"],"pennsylvania":["PA","pennsylvania"],"puerto rico":["PR","puerto-rico"],"rhode island":["RI","rhode-island"],"south dakota":["SD","south-dakota"],"tennessee":["TN","tennessee"],"texas":["TX","texas"],"utah":["UT","utah"],"virginia":["VA","virginia"],"washington":["WA","washington"],"wisconsin":["WI","wisconsin"],"wyoming":["WY","wyoming"]};
function stateOf65(tx){var low=String(tx||"").trim().toLowerCase().replace(/\s+/g," ");if(!low)return null;
var e=STATES65[low];if(e)return{abbr:e[0],sslug:e[1]};
for(var k in STATES65)if(STATES65[k][0].toLowerCase()===low)return{abbr:STATES65[k][0],sslug:STATES65[k][1]};
return null}
function zipCity65(tx){if(!ZIPD)return null;
var m=/^(\d{5})(?:-\d{4})?$/.exec(String(tx||"").trim());if(!m)return null;
var z=ZIPD[m[1]];if(!z)return null;
return resolveCityText(z[0]+", "+z[1])}
function normQ(q){return q.toLowerCase().replace(/[^a-z0-9 ]/g," ").replace(/\s+/g," ").trim()}
function havMi(aLa,aLo,bLa,bLo){var R=3959,p=Math.PI/180,dLa=(bLa-aLa)*p,dLo=(bLo-aLo)*p,h=Math.sin(dLa/2)*Math.sin(dLa/2)+Math.cos(aLa*p)*Math.cos(bLa*p)*Math.sin(dLo/2)*Math.sin(dLo/2);return 2*R*Math.asin(Math.sqrt(h))}
/* v5.17 search group helpers. */
function nearMe57(q){var near=false,place="";
var m=/^(.*?)\s+near\s+(.+)$/.exec(q);
if(m){near=true;q=m[1].trim();var p=m[2].trim();if(p!=="me")place=p}
else if(q.indexOf("near me ")===0){near=true;q=q.slice(8).trim()}
else if(q==="near me"){near=true;q=""}
return{q:q,near:near,place:place}}
function lev57(a,b){if(a===b)return 0;
var la=a.length,lb=b.length;
if(Math.abs(la-lb)>2)return 99;
var prev=[],cur=[],i,j;
for(j=0;j<=lb;j++)prev[j]=j;
for(i=1;i<=la;i++){cur[0]=i;
for(j=1;j<=lb;j++){var cost=a.charAt(i-1)===b.charAt(j-1)?0:1;
cur[j]=Math.min(prev[j]+1,cur[j-1]+1,prev[j-1]+cost)}
var tmp=prev;prev=cur;cur=tmp}
return prev[lb]}
function sing57(w){return w.length>3&&w.charAt(w.length-1)==="s"?w.slice(0,-1):w}
function resolveCityText(tx){if(!CT)return null;
var low=String(tx||"").trim().toLowerCase();if(!low)return null;
for(var i=0;i<CT.length;i++){if((CT[i].city+", "+CT[i].state).toLowerCase()===low)return CT[i]}
for(var i=0;i<CT.length;i++){if(CT[i].city.toLowerCase()===low)return CT[i]}
return null}
function savedCity57(){/* Item 28 saved-city leg, read-only: the legacy ytp-city key. */
var v=null;try{v=localStorage.getItem("ytp-city")}catch(e){}
if(!v)return null;
return resolveCityText(v)}
function storeCity28(c){/* Item 28 Part A writer (Nov 17, 2026): a submitted search records its resolved city in the legacy ytp-city key as "City, ST". Nothing guesses a city, and the write never prefills a box. */
try{localStorage.setItem("ytp-city",c.city+", "+c.state)}catch(e){}}
function searchURL57(raw,city,cityText){var u="/search/?q="+encodeURIComponent(raw);
if(city)u+="&city="+encodeURIComponent(city.city)+"&state="+city.state;
else if(cityText)u+="&city="+encodeURIComponent(cityText);
return u}
function catMatches(q){if(!TA)return[];
var qn=normQ(q);if(!qn)return[];
var bySlug={},i,c;
for(i=0;i<TA.cats.length;i++)bySlug[TA.cats[i].slug]=TA.cats[i];
var scored=[];
if(qn.length===1){var one=[];
for(i=0;i<TA.cats.length;i++){c=TA.cats[i];
if(c.label.toLowerCase().indexOf(qn)===0)one.push({slug:c.slug,label:c.label,st:1,src:"c"})}
one.sort(function(a,b){return a.label.localeCompare(b.label)});
return one.slice(0,5)}
/* Gemini Ship 2 (Nov 24, 2026): entries carry a src tag,
"c" for a category match and "k" for a shared service
keyword, so sugBiz can order categories ahead of service
keywords. Routing in go() reads only the slug and is
unchanged. */
function push(slug,st,src){if(!bySlug[slug])return;
for(var j=0;j<scored.length;j++)if(scored[j].slug===slug){if(st<scored[j].st)scored[j].st=st;return}
scored.push({slug:slug,label:bySlug[slug].label,st:st,src:src||"c"})}
for(i=0;i<TA.cats.length;i++){c=TA.cats[i];
var lab=c.label.toLowerCase(),syns=c.syn||[];
if(lab===qn||syns.indexOf(qn)>-1)push(c.slug,0,"c");
else if(lab.indexOf(qn)===0||syns.some(function(s){return s.indexOf(qn)===0||qn.indexOf(s)===0}))push(c.slug,1,"c");
else if(lab.indexOf(qn)>-1||syns.some(function(s){return s.indexOf(qn)>-1}))push(c.slug,2,"c")}
var shared=TA.shared||{};
for(var term in shared){var tl=term.toLowerCase();
var st2=tl===qn?0:(tl.indexOf(qn)===0||qn.indexOf(tl)===0?1:(tl.indexOf(qn)>-1?2:-1));
if(st2>-1)for(i=0;i<shared[term].length;i++)push(shared[term][i],st2,"k")}
/* Fuzzy stage: only when nothing matched above. A tie
between two categories resolves to nothing, never a guess. */
if(!scored.length&&qn.length>=4){
var fbest=null,fbd=99,ftie=false;
for(i=0;i<TA.cats.length;i++){c=TA.cats[i];
var cands=[c.label.toLowerCase()].concat(c.syn||[]),d=99;
for(var j=0;j<cands.length;j++){var dd=lev57(sing57(qn),sing57(cands[j]));if(dd<d)d=dd;
var ws=cands[j].split(" ");
for(var k=0;k<ws.length;k++){var dw=lev57(sing57(qn),sing57(ws[k]));if(dw<d)d=dw}}
var th=qn.length<=5?1:2;
if(d<=th){if(d<fbd){fbd=d;fbest=c.slug;ftie=false}else if(d===fbd)ftie=true}}
if(fbest&&!ftie)push(fbest,3,"c")}
scored.sort(function(a,b){return a.st-b.st||a.label.localeCompare(b.label)});
return scored.slice(0,3)}
function townLatLng(name){if(!name)return null;
var low=String(name).trim().toLowerCase(),i,e;
if(TA&&TA.towns)for(i=0;i<TA.towns.length;i++){e=TA.towns[i];
if((e.n+", "+e.s).toLowerCase()===low||e.n.toLowerCase()===low)return{lat:e.la,lng:e.lo,state:e.s}}
if(CT)for(i=0;i<CT.length;i++){e=CT[i];
if((e.city+", "+e.state).toLowerCase()===low||e.city.toLowerCase()===low)return{lat:e.lat,lng:e.lng,state:e.state}}
return null}
function activeLoc(){/* v5.12.2: the ranking center is the
town in the where box, and nothing else: no saved city, no
page location. An empty or unresolvable box means no
distance ranking (name order stands). */
return townLatLng(f2.value)}
function nameStr(e,qn){var n=e.n.toLowerCase();
if(n.indexOf(qn)===0)return 0;
var ws=n.split(/[^a-z0-9]+/);
for(var i=0;i<ws.length;i++)if(ws[i]&&ws[i].indexOf(qn)===0)return 1;
return 2}
function pri64(e){return (e.f?2:0)+(e.cl?1:0)}
/* Gemini Ship 2 (Nov 24, 2026): nameParts partitions
business matches into local (the active town's 50-mile
radius, then the active state, exactly the set the old
nameMatches returned) and remote (out-of-area matches
the old code dropped when a town was active). sugBiz
shows remote matches only when no local business
matches. With no active town there is no out of area:
every match is local. */
function nameParts(q){if(!TA)return{local:[],remote:[]};
var qn=normQ(q);if(qn.length<2)return{local:[],remote:[]};
var ms=TA.names.filter(function(e){return e.n.toLowerCase().indexOf(qn)>-1});
function srt(a,b){return nameStr(a,qn)-nameStr(b,qn)||pri64(b)-pri64(a)||(b.v||0)-(a.v||0)}
var loc=activeLoc();
if(!loc){ms.sort(srt);return{local:ms.slice(0,5),remote:[]}}
var near=[],far=[],rem=[];
for(var i=0;i<ms.length;i++){var e=ms[i];
if(typeof e.la==="number"){e._d=havMi(e.la,e.lo,loc.lat,loc.lng);
if(e._d<=50)near.push(e);else if(e.s===loc.state)far.push(e);else rem.push(e)}
else if(e.s===loc.state)far.push(e);else rem.push(e)}
near.sort(function(a,b){return nameStr(a,qn)-nameStr(b,qn)||pri64(b)-pri64(a)||a._d-b._d||(b.v||0)-(a.v||0)});
far.sort(srt);rem.sort(srt);
var local=near.slice(0,5);
if(near.length<2)local=near.concat(far).slice(0,5);
return{local:local,remote:rem.slice(0,5)}}
function show(box,items,fn){var input=box===s1?f1:f2;if(!items.length){box.innerHTML="";hideSug(box,input);return}
box.innerHTML=items.map(function(it,i){return '<a href="#" id="'+box.id+'-opt-'+i+'" role="option" aria-selected="false">'+it.html+"</a>"}).join("");
box.style.display="block";
var links=box.querySelectorAll("a");
for(var i=0;i<links.length;i++){(function(a,it){a.addEventListener("click",function(ev){ev.preventDefault();fn(it)})})(links[i],items[i])}
if(box===s1){s1Items=items;s1Fn=fn;hi57=-1}if(box===s2){s2Items=items;s2Fn=fn;hiW57=-1}syncCombo(box,input,-1)}
function sugBiz(){var q=f1.value.trim().toLowerCase();q=nearMe57(q).q;if(q.length<1||!TA){hideSug(s1,f1);return}
var cm=catMatches(q),cats=[],keys=[],i;
for(i=0;i<cm.length;i++)(cm[i].src==="k"?keys:cats).push(cm[i]);
function catItem(c){return{vslug:c.slug,cat:true,label:c.label,go:"/"+c.slug+"/",html:"<strong>"+esc(c.label)+"</strong><span>Category</span>"}}
function bizItem(e){return{go:e.u,vslug:e.vs,name:e.n,html:"<strong>"+esc(e.n)+"</strong><span>"+esc(e.t)+" \u00b7 "+esc(e.c)+", "+esc(e.s)+"</span>"}}
/* Gemini Ship 2 order: local businesses first, then
categories, then service keywords; out-of-area
businesses only when no local business matches. */
var np=nameParts(q);
var items=np.local.map(bizItem).concat(cats.map(catItem)).concat(keys.map(catItem));
if(!np.local.length)items=items.concat(np.remote.map(bizItem));
show(s1,items.slice(0,8),function(it){pickB=it.cat?null:it.go;pickV=it.vslug||null;pickCat=!!it.cat;f1.value=it.cat?(it.label||""):(it.name||"");hideSug(s1,f1);ensure(go)})}
/* Gemini Ship 2 (Nov 24, 2026): the empty-focus
dropdown. Recent searches live in localStorage under
ytp-recent-q57 (a different store from the recently
viewed strip, ytp-recent-v1); a submitted search
records its what text in go(). Focusing the empty
what box shows up to 3 recents, rendered synchronously
from localStorage, plus up to 5 top trades for the
active city ranked by review volume in the typeahead
data itself. No new network call: the trades read the
payload the focus handler already loads, and the
dropdown re-renders when it arrives. Rows go through
show(), so the F2 combobox state, keyboard navigation,
Escape and click-outside dismissal are the same as
typed suggestions. */
var RECQ="ytp-recent-q57";
function recentsQ(){try{var v=JSON.parse(localStorage.getItem(RECQ)||"[]");
return Array.isArray(v)?v.filter(function(x){return typeof x==="string"&&!!x}).slice(0,3):[]}catch(e){return[]}}
function pushRecentQ(t){t=String(t||"").trim();if(!t)return;
try{var v=JSON.parse(localStorage.getItem(RECQ)||"[]");if(!Array.isArray(v))v=[];
var low=t.toLowerCase();
v=v.filter(function(x){return typeof x==="string"&&x.toLowerCase()!==low});
v.unshift(t);localStorage.setItem(RECQ,JSON.stringify(v.slice(0,5)))}catch(e){}}
function tradeAgg57(city){var agg={},n=0,i,e;
for(i=0;i<TA.names.length;i++){e=TA.names[i];
if(city&&!(e.c===city.city&&e.s===city.state))continue;
agg[e.vs]=(agg[e.vs]||0)+(e.v||0);n++}
return n?agg:null}
function topTrades57(){if(!TA||!TA.names||!TA.cats)return[];
var city=resolveCity()||savedCity57();
var agg=tradeAgg57(city)||tradeAgg57(null);if(!agg)return[];
var bySlug={},i;
for(i=0;i<TA.cats.length;i++)bySlug[TA.cats[i].slug]=TA.cats[i];
return Object.keys(agg).sort(function(a,b){return agg[b]-agg[a]}).map(function(s){return bySlug[s]}).filter(Boolean).slice(0,5)}
function showEmpty57(){var rec=recentsQ(),items=[],i;
for(i=0;i<rec.length;i++)items.push({rec:rec[i],html:"<strong>"+esc(rec[i])+"</strong><span>Recent search</span>"});
if(TA){var tt=topTrades57();
for(i=0;i<tt.length;i++)items.push({vslug:tt[i].slug,cat:true,label:tt[i].label,go:"/"+tt[i].slug+"/",html:"<strong>"+esc(tt[i].label)+"</strong><span>Category</span>"})}
if(!items.length){hideSug(s1,f1);return}
show(s1,items,function(it){if(it.rec){pickB=null;pickV=null;pickCat=false;f1.value=it.rec;hideSug(s1,f1);ensure(go);return}
pickB=null;pickV=it.vslug||null;pickCat=true;f1.value=it.label||"";hideSug(s1,f1);ensure(go)})}
function sugWhat(){if(f1.value.trim()){loadTA(sugBiz);return}
showEmpty57();loadTA(showEmpty57)}
function cityMatches(q){var name=q,st="",ci=q.indexOf(",");
if(ci>-1){name=q.slice(0,ci).trim();st=q.slice(ci+1).trim()}
var pre=[],sub=[];
for(var i=0;i<CT.length;i++){var e=CT[i],nm=e.city.toLowerCase();
if(st&&e.state.toLowerCase().indexOf(st)!==0)continue;
if(!name||nm.indexOf(name)===0)pre.push(e);else if(nm.indexOf(name)>-1)sub.push(e)}
return pre.concat(sub)}
function sugCity(){if(!CT)return;
var q=f2.value.trim().toLowerCase();
var ms=cityMatches(q);
var zc=zipCity65(q);
if(zc)ms=[zc].concat(ms.filter(function(e){return e!==zc}));
ms=ms.slice(0,7);
show(s2,ms.map(function(e){return{city:e,html:"<strong>"+esc(e.city)+", "+esc(e.state)+"</strong><span>"+Number(e.count).toLocaleString("en-US")+" businesses</span>"}}),function(it){pickC=it.city;f2.value=it.city.city+", "+it.city.state;hideSug(s2,f2)})}
function resolveCity(){if(pickC)return pickC;
if(!CT)return null;
return resolveCityText(f2.value)||zipCity65(f2.value)}
function go(){var raw=f1.value.trim();
pushRecentQ(raw);
var nm=nearMe57(normQ(raw));
var city=resolveCity();
if(!city&&nm.place)city=resolveCityText(nm.place)||zipCity65(nm.place);
if(!city&&nm.near)city=savedCity57();
if(city&&city.city&&city.state)storeCity28(city);else if(!city&&f2&&!f2.value.trim()){try{localStorage.removeItem("ytp-city")}catch(e){}}
var q=nm.q;
/* v5.32 item 65: a bare state name in the where box routes to
that state: its hub when nothing was typed in the what box, or
a state-scoped search (the typed query is carried, never
dropped) when something was. */
var st65=!city?(stateOf65(f2.value)||(nm.place?stateOf65(nm.place):null)):null;
if(st65){var cms65=q?catMatches(q):[];
if(cms65.length){location.href="/search/?v="+cms65[0].slug+"&state="+st65.abbr;return}
if(q){location.href="/search/?q="+encodeURIComponent(raw)+"&state="+st65.abbr;return}
location.href="/"+st65.sslug+"/";return}
/* v5.17 search group (QA item 3): typed text never lands on a single listing or the home page; only an explicit suggestion click routes to a listing. */
if(pickB&&!nm.near){location.href=pickB;return}
if(city&&pickCat&&pickV){location.href="/search/?v="+pickV+"&city="+encodeURIComponent(city.city)+"&state="+city.state;return}
if(city&&q){var cms=catMatches(q);
if(cms.length){location.href="/search/?v="+cms[0].slug+"&city="+encodeURIComponent(city.city)+"&state="+city.state;return}
location.href=searchURL57(raw,city);return}
if(city){location.href=city.url;return}
if(q||nm.near){location.href=searchURL57(raw,null,f2.value.trim()||null);return}
location.href="/search/"}
form.addEventListener("submit",function(ev){ev.preventDefault();ensure(go)});
f1.addEventListener("input",function(){pickB=null;pickV=null;pickCat=false;sugWhat()});
f1.addEventListener("focus",function(){sugWhat()});
/* v5.18 (item 45): the header dropdown gains the hero
search keyboard navigation, and trades offer from the
first keystroke (sugBiz gate above). A category pick
fills the box with the clean trade label. */
function paint57(){var ls=s1.querySelectorAll("a");for(var i=0;i<ls.length;i++)ls[i].classList.toggle("active",i===hi57);syncCombo(s1,f1,hi57)}
f1.addEventListener("keydown",function(ev){if(s1.style.display!=="block"||!s1Items||!s1Items.length)return;
if(ev.key==="ArrowDown"||ev.key==="ArrowUp"){ev.preventDefault();hi57=ev.key==="ArrowDown"?(hi57+1)%s1Items.length:(hi57-1+s1Items.length)%s1Items.length;paint57()}
else if(ev.key==="Enter"&&hi57>=0){ev.preventDefault();var it=s1Items[hi57];if(it&&s1Fn)s1Fn(it)}
else if(ev.key==="Escape"){hideSug(s1,f1)}});
/* v5.31 item 64: the header where box gets the same keyboard navigation as the what box (ArrowDown/ArrowUp/Enter/Escape). */
function paintW57(){var ls=s2.querySelectorAll("a");for(var i=0;i<ls.length;i++)ls[i].classList.toggle("active",i===hiW57);syncCombo(s2,f2,hiW57)}
f2.addEventListener("keydown",function(ev){if(s2.style.display!=="block"||!s2Items||!s2Items.length)return;
if(ev.key==="ArrowDown"||ev.key==="ArrowUp"){ev.preventDefault();hiW57=ev.key==="ArrowDown"?(hiW57+1)%s2Items.length:(hiW57-1+s2Items.length)%s2Items.length;paintW57()}
else if(ev.key==="Enter"&&hiW57>=0){ev.preventDefault();var it=s2Items[hiW57];if(it&&s2Fn)s2Fn(it)}
else if(ev.key==="Escape"){hideSug(s2,f2)}});
f2.addEventListener("input",function(){pickC=null;loadCT(function(){loadZIP65(sugCity)})});
f2.addEventListener("focus",function(){loadCT(sugCity)});
document.addEventListener("click",function(ev){if(!s1.contains(ev.target)&&ev.target!==f1)hideSug(s1,f1);if(!s2.contains(ev.target)&&ev.target!==f2)hideSug(s2,f2)});
/* Nov 18, 2026 (owner-reported fix): the where box prefills
from the saved city (the legacy ytp-city key) when a saved
city exists and the box is empty. This supersedes the
v5.12.2 no-prefill ruling for the saved city only: the pill
already announces the saved city on every page, and an
empty box beside it read as a bug. Nothing else fills the
box: no geolocation, no IP guess, no page city. */
try{var svW=null;try{svW=localStorage.getItem("ytp-city")}catch(e){}
if(svW&&!f2.value)f2.value=svW}catch(x){}
})();

(function(){
var A={sb:null,user:null,session:null,_resolved:false,_q:window.YTPQ||[]};
window.YTPAuth=A;
function drain(){if(A._resolved)return;A._resolved=true;var q=A._q.splice(0,A._q.length);for(var i=0;i<q.length;i++){try{q[i](A)}catch(e){}}}
window.ytpOnReady=function(fn){if(A._resolved){try{fn(A)}catch(e){}}else{A._q.push(fn)}};
function fullName(){if(!A.user)return "";var m=A.user.user_metadata||{};return String(m.full_name||m.name||"").trim()}
A.firstName=function(){var n=fullName();return n?n.split(/\s+/)[0]:(A.user?(A.user.email||"").split("@")[0]:"")};
A.displayName=function(){var n=fullName();if(!n)return A.user?A.user.email||"":"";var p=n.split(/\s+/);return p.length>1?p[0]+" "+p[1].charAt(0)+".":p[0]};
A.signIn=function(){if(!A.sb)return;A.sb.auth.signInWithOAuth({provider:"google",options:{redirectTo:window.location.href}})};
A.signOut=function(){if(!A.sb)return;A.sb.auth.signOut().then(function(){window.location.reload()})};
var ownerProbed=false;
function probeOwner(){var link=document.getElementById("ytp-biz-link");if(!link)return;
if(!A.user||!A.sb){link.hidden=true;ownerProbed=false;return}
if(ownerProbed)return;ownerProbed=true;
try{A.sb.from("profiles").select("is_owner").eq("id",A.user.id).then(function(r){var row=r&&r.data&&r.data[0];if(row&&row.is_owner===true){link.hidden=false;var hc=document.querySelector("a.hclaim");if(hc){hc.textContent="Business dashboard";hc.setAttribute("href","/business/")}}}).catch(function(){})}catch(e){}}
function render(){var si=document.getElementById("ytp-signin"),um=document.getElementById("ytp-umenu"),ub=document.getElementById("ytp-ubtn");if(!si||!um)return;if(A.user){si.hidden=true;um.hidden=false;if(ub){/* Item 27: signed-in state shows a circular initials badge with a chevron. */
var nm=fullName(),ini;if(nm){var pp=nm.split(/\s+/);ini=(pp[0].charAt(0)+(pp.length>1?pp[pp.length-1].charAt(0):"")).toUpperCase()}else{ini=((A.user.email||"A").charAt(0)).toUpperCase()}
ub.innerHTML="";var sp=document.createElement("span");sp.className="uinit";sp.setAttribute("aria-hidden","true");sp.textContent=ini;ub.appendChild(sp);var cv=document.createElement("span");cv.className="uchev";cv.setAttribute("aria-hidden","true");cv.innerHTML='<svg width="10" height="6" viewBox="0 0 10 6"><path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';ub.appendChild(cv);ub.classList.add("hasbadge");ub.setAttribute("aria-label","Account menu for "+(nm||A.user.email||"your account"))}}else{si.hidden=false;um.hidden=true}probeOwner()}
function wire(){var si=document.getElementById("ytp-signin");if(si)si.addEventListener("click",function(){A.signIn()});
var ub=document.getElementById("ytp-ubtn"),um=document.getElementById("ytp-umenu");
if(ub&&um){ub.addEventListener("click",function(e){e.stopPropagation();var open=um.classList.toggle("open");ub.setAttribute("aria-expanded",open?"true":"false")});
document.addEventListener("click",function(e){if(!um.contains(e.target)){um.classList.remove("open");ub.setAttribute("aria-expanded","false")}});
document.addEventListener("keydown",function(e){if(e.key==="Escape"){um.classList.remove("open");ub.setAttribute("aria-expanded","false")}});
ytpKbNav(um,ub,function(){return um.querySelectorAll(".udrop a,.udrop button")},function(){um.classList.add("open");ub.setAttribute("aria-expanded","true")},function(){um.classList.remove("open");ub.setAttribute("aria-expanded","false")})}
var so=document.getElementById("ytp-signout");if(so)so.addEventListener("click",function(){A.signOut()})}
try{if(window.supabase&&window.supabase.createClient){A.sb=window.supabase.createClient("https://klbgkidcdrlqsvrgfafv.supabase.co","sb_publishable_Z4jRZ_-LdpstUH6b_Gcs-Q_Jeok7Emb")}}catch(e){A.sb=null}
wire();render();
setTimeout(drain,4000);
if(A.sb){A.sb.auth.getSession().then(function(res){var s=res&&res.data?res.data.session:null;A.session=s;A.user=s?s.user:null;render();drain()}).catch(function(){drain()});
A.sb.auth.onAuthStateChange(function(ev,s){A.session=s;A.user=s?s.user:null;render()})}
else{drain()}
})();


(function(){
document.addEventListener("submit",function(ev){
var f=ev.target;if(!f||!f.querySelector)return;
var hp=f.querySelector("input[name='company_website']");
if(hp&&hp.value){ev.preventDefault();ev.stopPropagation();ev.stopImmediatePropagation()}
},true);
})();

/* Item 28 Part A (Nov 17, 2026): saved-city routing and the change-city pill; writers record only a chosen or search-resolved city. */
(function(){
function getSaved(){try{return localStorage.getItem("ytp-city")||""}catch(e){return ""}}
function setSaved(v){try{if(v)localStorage.setItem("ytp-city",v);else localStorage.removeItem("ytp-city")}catch(e){}}
function parseSaved(v){var i=v.lastIndexOf(",");if(i<1)return null;var c=v.slice(0,i).trim(),s=v.slice(i+1).trim();return (c&&s)?{city:c,state:s}:null}
var cm=document.getElementById("ytp-citymap");
if(cm){try{var cj=JSON.parse(cm.textContent);if(cj&&cj.city&&cj.state)setSaved(String(cj.city)+", "+String(cj.state))}catch(e){}}
var saved=getSaved(),parsed=parseSaved(saved),navLinks=[];
if(parsed){var as=document.querySelectorAll(".catnav a[href]");
for(var i=0;i<as.length;i++){var h=as[i].getAttribute("href")||"";var m=/^\/([a-z0-9-]+)\/$/.exec(h);
if(m){as[i].setAttribute("data-loc28",h);as[i].setAttribute("href","/search/?v="+m[1]+"&city="+encodeURIComponent(parsed.city)+"&state="+encodeURIComponent(parsed.state));navLinks.push(as[i])}}}
if(!saved)return;
/* Saved-city pill removed Nov 18, 2026: the city now lives in the search box itself (owner: one spot). */

})();

/* Item 29: ytpCloses54 mirrors the v5.4 engine's range logic; the open judgment stays the engine's. */
function ytpCloses54(list,tz){if(typeof ytpParseWeek54!=="function"||typeof ytpFmtMin54!=="function")return null;var wk=ytpParseWeek54(list);if(!wk)return null;var o={},ps;try{ps=new Intl.DateTimeFormat("en-US",{timeZone:tz,weekday:"short",hour:"2-digit",minute:"2-digit",hourCycle:"h23"}).formatToParts(new Date());for(var i=0;i<ps.length;i++)o[ps[i].type]=ps[i].value}catch(e){return null}
var day="MonTueWedThuFriSatSun".indexOf(o.weekday)/3;if(day<0)return null;var min=(parseInt(o.hour,10)%24)*60+parseInt(o.minute,10),t=wk[day],i,r;
for(i=0;i<t.length;i++){r=t[i];if(min>=r[0]&&min<r[1])return(r[0]===0&&r[1]===1440)?null:ytpFmtMin54(r[1])}
var y=wk[(day+6)%7];for(i=0;i<y.length;i++){r=y[i];if(r[1]>1440&&min<r[1]-1440)return ytpFmtMin54(r[1])}
return null}
window.ytpCloses54=ytpCloses54;
(function(){function up(){if(typeof hoursBySlug54==="undefined")return;var ss=document.querySelectorAll("[data-open57]");for(var i=0;i<ss.length;i++){var s=ss[i];if(s.hidden)continue;var c=s.closest?s.closest("[data-slug]"):null;var e=c?hoursBySlug54[c.getAttribute("data-slug")]:null;if(!e)continue;if(typeof ytpHoursCard77==="function"&&ytpHoursCard77(s,e.h,e.tz))continue;if(typeof ytpOpenNow54!=="function")continue;var st=ytpOpenNow54(e.h,e.tz);if(!st)continue;if(st.open){var ct=ytpCloses54(e.h,e.tz);s.textContent=ct?("Open now · Closes "+ct):"Open now"}else s.textContent="Closed now"}}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",up);else up()})();


/* v5.41 item 77: timezone-accurate hours intelligence. One shared helper (ytpHoursStatus77) computes the status in the BUSINESS local timezone (the stored tz on the listing, never the visitor zone): "Open now · Closes in 35 min" amber under 60 minutes via the on-closing77 class, "Closed · Opens at 8 AM" later today or "Closed · Opens Tue at 9 AM" another day, "Open 24 hours", and no status at all when hours are unverified or unparseable. ytpHoursMount77 also bolds today's row (today77) in the profile schedule table, with today computed in the business timezone. The D1 renderer ships the same helper natively in its OPENNOW script; this module is the static tree parity path and runs on DOMContentLoaded, after the per-page v5.4 mount, so its result is the final one. */
function ytpHoursStatus77(list,tz,nowMs){if(typeof ytpParseWeek54!=="function"||typeof ytpFmtMin54!=="function")return null;var wk=ytpParseWeek54(list);if(!wk)return null;var now;try{var parts=new Intl.DateTimeFormat("en-US",{timeZone:tz,weekday:"short",hour:"2-digit",minute:"2-digit",hourCycle:"h23"}).formatToParts(new Date(nowMs||Date.now()));var o={};for(var i=0;i<parts.length;i++)o[parts[i].type]=parts[i].value;var dm={Mon:0,Tue:1,Wed:2,Thu:3,Fri:4,Sat:5,Sun:6};if(dm[o.weekday]===undefined)return null;now={day:dm[o.weekday],min:(parseInt(o.hour,10)%24)*60+parseInt(o.minute,10)}}catch(e){return null}
var DAYS77=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];var today=wk[now.day],r,i;var is24=today.length===1&&today[0][0]===0&&today[0][1]===1440;var closeEnd=null;
for(i=0;i<today.length;i++){r=today[i];if(now.min>=r[0]&&now.min<r[1]){closeEnd=r[1];break}}
if(closeEnd===null){var y=wk[(now.day+6)%7];for(i=0;i<y.length;i++){r=y[i];if(r[1]>1440&&now.min<r[1]-1440){closeEnd=r[1]-1440;break}}}
var txt;if(!today.length)txt="Closed today";else if(is24)txt="Open 24 hours";else txt="Today: "+today.map(function(rr){return ytpFmtMin54(rr[0])+" \u2013 "+ytpFmtMin54(rr[1])}).join(", ");
if(closeEnd!==null){if(is24)return{open:true,is24:true,closingSoon:false,label:"Open 24 hours",today:txt,todayDay:now.day};var cin=closeEnd-now.min;if(cin<=60)return{open:true,is24:false,closingSoon:true,closesInMin:cin,label:"Open now \u00b7 Closes in "+cin+" min",today:txt,todayDay:now.day};return{open:true,is24:false,closingSoon:false,closesAt:ytpFmtMin54(closeEnd),label:"Open now \u00b7 Closes "+ytpFmtMin54(closeEnd),today:txt,todayDay:now.day}}
for(var off=0;off<8;off++){var d=wk[(now.day+off)%7];var starts=[];for(i=0;i<d.length;i++)starts.push(d[i][0]);starts.sort(function(a,b){return a-b});for(i=0;i<starts.length;i++){if(off===0&&starts[i]<=now.min)continue;var lbl=off===0?("Closed \u00b7 Opens at "+ytpFmtMin54(starts[i])):("Closed \u00b7 Opens "+DAYS77[(now.day+off)%7]+" at "+ytpFmtMin54(starts[i]));return{open:false,is24:false,closingSoon:false,label:lbl,today:txt,todayDay:now.day}}}
return{open:false,is24:false,closingSoon:false,label:"Closed",today:txt,todayDay:now.day}}
function ytpHoursMount77(){var el=document.getElementById("ytp-opennow");if(!el)return;var items=document.querySelectorAll(".hourslist li");var list=[];for(var i=0;i<items.length;i++)list.push(items[i].textContent);var st=ytpHoursStatus77(list,el.getAttribute("data-tz"));if(!st)return;el.innerHTML='<span class="'+(st.open?(st.closingSoon?"on-closing77":"on-open"):"on-closed")+'">'+st.label+'</span> <span class="on-today">'+st.today+"</span>";el.hidden=false;if(typeof YTP_DAYS54!=="undefined"){for(var j=0;j<items.length;j++){var mm=/^([a-z]+)/.exec((items[j].textContent||"").trim().toLowerCase());if(mm&&YTP_DAYS54[mm[1]]===st.todayDay&&items[j].classList)items[j].classList.add("today77")}}}
function ytpHoursCard77(slot,list,tz){var st=ytpHoursStatus77(list,tz);if(!st)return false;slot.hidden=false;slot.textContent=st.label;slot.style.color=st.open?(st.closingSoon?"#b45309":""):"#5a6672";return true}
window.ytpHoursStatus77=ytpHoursStatus77;window.ytpHoursMount77=ytpHoursMount77;window.ytpHoursCard77=ytpHoursCard77;
(function(){function run77(){try{ytpHoursMount77()}catch(e){}}if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",run77);else run77()})();

/* Item 53 (v5.20): phone Map/List toggle, map resize re-sync, small-width card link shortening, result-card photo links. */
(function(){
function ready(f){if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",f);else f()}
ready(function(){
var layout=document.querySelector(".cat-layout");
var mapEl=layout?layout.querySelector(":scope > .cat-map"):null;
var fb=document.querySelector(".cat-main .filterbar");
if(layout&&mapEl&&fb&&!document.querySelector(".maptoggle53")){
var b=document.createElement("button");b.type="button";b.className="maptoggle53";b.textContent="Show map";b.setAttribute("aria-expanded","false");
fb.parentNode.insertBefore(b,fb.nextSibling);
b.addEventListener("click",function(){var on=layout.classList.toggle("showmap53");b.textContent=on?"Show list":"Show map";b.setAttribute("aria-expanded",on?"true":"false");setTimeout(function(){window.dispatchEvent(new Event("resize"))},60)});
}
/* Leaflet maps track window resize themselves; nudging a resize after layout settles re-syncs tile size on category and listing maps. */
setTimeout(function(){window.dispatchEvent(new Event("resize"))},350);
/* Result-card photo carries the profile link (item 44 extended to result cards). */
var cards=document.querySelectorAll(".result-card");
for(var i=0;i<cards.length;i++){(function(c){
var title=c.querySelector("h2 a");if(!title)return;
var img=c.querySelector(":scope > img")||c.querySelector(":scope > .sicon57");
if(!img||img.parentNode!==c)return;
var w=document.createElement("a");w.className="cardimg53";w.href=title.getAttribute("href");w.setAttribute("aria-label",title.textContent.trim());
c.insertBefore(w,img);w.appendChild(img);
})(cards[i])}
/* Secondary card link shortens to View details at small widths, full name kept in aria-label. */
function shorten(){
var small=window.matchMedia&&window.matchMedia("(max-width: 767px)").matches;
var links=document.querySelectorAll(".result-card .rlinks a, .result-card .ract57 a");
for(var i=0;i<links.length;i++){var a=links[i];var full=a.getAttribute("data-viewfull53");
if(!full){var t=a.textContent.trim();if(/^View\s+\S/.test(t)&&t!=="View details"){a.setAttribute("data-viewfull53",t);full=t}else continue}
if(small){a.textContent="View details";a.setAttribute("aria-label",full)}else{a.textContent=full;a.removeAttribute("aria-label")}}
}
shorten();
var rt;window.addEventListener("resize",function(){clearTimeout(rt);rt=setTimeout(shorten,150)});
});
})();

/* v5.40 item 76: Trade archetype CTAs (item 49 completion). On listing profiles this module registers before the item 75 sticky bar and the item 72 shortlist read the Contact card, and it finishes the archetype mapping those surfaces inherit: (1) the Contact card phone link for towing and locksmiths reads "Call Now (number)" and for appointment trades "Call to Book (number)", with the number kept visible; other trades keep "Call (number)"; a link already carrying the archetype label is left alone. (2) Similar pros cards on the profile take the profile trade's own card label: "Get Free Quote" for trades and auto, "Check Availability" for appointment services, no request link at all for walk-in shops (a bakery never shows a request CTA on its cards), and "Request this pro" unchanged for categories not yet mapped. The D1 renderer emits the same labels natively; this module is the static tree's parity path and is idempotent. Held profiles keep their hold treatment: the held Contact card carries no phone link, so no call label is applied there. */
(function(){
function ready76(f){if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",f);else f()}
var QUOTE76="plumbers hvac electricians auto-repair auto-glass roofing handyman lawn-and-landscaping painting towing locksmiths tree-service pest-control movers flooring concrete-contractors kitchen-remodelers bathroom-remodelers general-contractors pool-builders";
var APPT76="hair-salons barbers nails massage spas med-spas natural-skincare pet-grooming pet-boarding tattoo fitness dance-studios veterinary chiropractors dentists optometrists photographers";
var WALK76="bakeries-and-cafes florists bookstores jewelry cleaners pawn-shops bars";
function has76(list,x){return (" "+list+" ").indexOf(" "+x+" ")>=0}
function mode76(slug){if(has76(QUOTE76,slug))return "quote";if(has76(APPT76,slug))return "appt";if(has76(WALK76,slug))return "walkin";return "default"}
function apply76(){
var card=document.querySelector(".bizcard57");
if(!card)return;
var slug=location.pathname.split("/")[1]||"";
var mode=mode76(slug);
var tel=card.querySelector("a.tel[href^='tel:']");
if(tel){
var txt=tel.textContent.trim();
if(mode==="quote"&&(slug==="towing"||slug==="locksmiths")&&txt.indexOf("Call Now")!==0){tel.textContent="Call Now "+txt.replace(/^Call\s*/,"");tel.classList.add("callnow76")}
else if(mode==="appt"&&txt.indexOf("Call to Book")!==0){tel.textContent="Call to Book "+txt.replace(/^Call\s*/,"");tel.classList.add("callbook76")}
}
var lbl=mode==="quote"?"Get Free Quote":mode==="appt"?"Check Availability":null;
var sims=document.querySelectorAll(".similar .card .cardreq");
for(var i=0;i<sims.length;i++){
if(mode==="walkin"){if(sims[i].remove)sims[i].remove();else if(sims[i].parentNode)sims[i].parentNode.removeChild(sims[i]);continue}
if(!lbl)continue;
var a=sims[i].querySelector("a");
if(a)a.textContent=lbl;
}
}
window.ytpArchetype76={mode:mode76,apply:apply76,version:"v5.40-item76"};
ready76(apply76);
})();

/* Item 75 (v5.23): sticky bottom action bar on mobile listing profiles. The bar is built from the listing's own Contact card links (Call plus the primary request CTA), so it always carries this listing's real phone and request target; CSS in ytp.css shows it at 767px and down only. It hides while the request form is on screen so it never duplicates the form. Listings with no Contact card actions (for example fully held listings) get no bar. */
(function(){
function ready(f){if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",f);else f()}
ready(function(){
if(document.querySelector(".stickybar75"))return;
var card=document.querySelector(".bizcard57");
if(!card)return;
var tel=card.querySelector("a.tel[href^='tel:']");
var cta=card.querySelector('a.act57[href="#match"]')||card.querySelector("a.act57");
if(cta&&cta.textContent.trim()==="Message the Business"){var dir75=card.querySelector('a.act57[href*="google.com/maps"]')||card.querySelector('a.act57[href^="http"]');if(dir75)cta=dir75}
if(!tel&&!cta)return;
var bar=document.createElement("nav");bar.className="stickybar75";bar.setAttribute("aria-label","Contact this pro");
if(tel){var a=document.createElement("a");a.className="sb-call75";a.href=tel.getAttribute("href");a.textContent=tel.textContent.trim()||"Call";bar.appendChild(a)}
if(cta){var b=document.createElement("a");b.className="sb-cta75";b.href=cta.getAttribute("href");b.textContent=cta.textContent.trim()||"Request";bar.appendChild(b)}
document.body.appendChild(bar);document.body.classList.add("has-sbar75");
var form=document.getElementById("match");
if(form&&"IntersectionObserver" in window){var io=new IntersectionObserver(function(es){for(var i=0;i<es.length;i++){bar.classList.toggle("barhide75",es[i].isIntersecting)}},{rootMargin:"-10% 0px 0px 0px"});io.observe(form)}
});
})();

/* v5.29 item 62: one-tap clear buttons inside the header search inputs and the homepage hero inputs. */
(function(){
function ready(f){if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",f);else f()}
ready(function(){
var inputs=document.querySelectorAll(".fld57 input[type='text'], .hsearch .fld input[type='text']");
for(var i=0;i<inputs.length;i++){(function(inp){
var wrap=inp.parentNode;if(!wrap||wrap.querySelector(".clearx62"))return;
var b=document.createElement("button");b.type="button";b.className="clearx62";b.textContent="\u00d7";b.setAttribute("aria-label","Clear");
b.addEventListener("click",function(){inp.value="";inp.dispatchEvent(new Event("input",{bubbles:true}));b.classList.remove("on");inp.focus()});
wrap.appendChild(b);
function sync(){b.classList.toggle("on",!!inp.value)}
inp.addEventListener("input",sync);sync();
})(inputs[i])}
});
})();

/* v5.37 item 72: Shortlist / Compare with zero login. Save stores 2 to 4 pros in localStorage only (versioned key ytp-shortlist-v1); anonymous saving never touches auth, never calls Supabase, and never redirects. A bottom bar lists the saved pros and a Compare action (enabled at 2 or more) opens a side-by-side view (rating with its source label, hours or open state where verified hours exist, phone, and the pro's own request button). On listing profiles this module also takes over the existing #ytp-save button in the capture phase, before the legacy per-page handler can run, so the old sign-in redirect for saving is unreachable; the renderer template and the generator now emit a delegating handler instead. While a shortlist exists on a mobile listing profile, the shortlist bar takes the bottom slot and the item 75 contact bar is hidden (CSS in ytp.css), so the two bars never fight. */
(function(){
var KEY72="ytp-shortlist-v1",MAX72=4,noteMsg72="";
function esc72(s){return String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}
function clean72(e){return{slug:String(e.slug),name:String(e.name),url:String(e.url),rating:e.rating?String(e.rating):"",reviews:e.reviews?String(e.reviews):"",rsrc:e.rsrc?String(e.rsrc):"",phone:e.phone?String(e.phone):"",phoneHref:e.phoneHref?String(e.phoneHref):"",ctaLabel:e.ctaLabel?String(e.ctaLabel):"",ctaHref:e.ctaHref?String(e.ctaHref):"",open:e.open?String(e.open):"",hours:e.hours?String(e.hours):""}}
function load72(){try{var raw=localStorage.getItem(KEY72);if(!raw)return[];var arr=JSON.parse(raw);if(!arr||typeof arr.length!=="number")return[];var out=[];for(var i=0;i<arr.length;i++){var e=arr[i];if(e&&typeof e.slug==="string"&&e.slug&&typeof e.name==="string"&&e.name&&typeof e.url==="string"&&e.url)out.push(clean72(e))}return out.slice(0,MAX72)}catch(e){return[]}}
function store72(list){try{localStorage.setItem(KEY72,JSON.stringify(list))}catch(e){}}
function find72(list,slug){for(var i=0;i<list.length;i++)if(list[i].slug===slug)return i;return -1}
function cardEntry72(card){
var slug=card.getAttribute("data-slug")||"";var a=card.querySelector("h2 a");if(!slug||!a)return null;
var url=a.getAttribute("href")||"";
var e={slug:slug,name:a.textContent.trim(),url:url,rating:card.getAttribute("data-rating")||"",reviews:card.getAttribute("data-reviews")||"",rsrc:"",phone:"",phoneHref:"",ctaLabel:"",ctaHref:"",open:"",hours:""};
var g=card.querySelector(".gsrc");if(g)e.rsrc=g.textContent.trim();
if(!e.rating){var rm=card.querySelector(".rmeta57 strong");if(rm)e.rating=rm.textContent.trim()}
if(!e.reviews){var rt=card.querySelector(".rmeta57");if(rt){var m=/\(([0-9,]+) reviews?\)/.exec(rt.textContent);if(m)e.reviews=m[1]}}
var tel=card.querySelector(".rlinks a[href^='tel:'], .ract57 a[href^='tel:']");if(tel){e.phone=tel.textContent.trim();e.phoneHref=tel.getAttribute("href")||""}
var cta=card.querySelector("a.rtel");if(cta){e.ctaLabel=cta.textContent.trim();e.ctaHref=cta.getAttribute("href")||""}
if(!e.ctaHref){var dir76=card.querySelector("a[data-dir76]");if(dir76){e.ctaLabel=dir76.textContent.trim();e.ctaHref=dir76.getAttribute("href")||""}else{e.ctaLabel="View profile";e.ctaHref=url}}
var ol=card.querySelector(".openline57");if(ol&&!ol.hidden&&ol.textContent.trim())e.open=ol.textContent.trim();
return e}
function profileEntry72(){
var slug="";var mf=document.getElementById("ytp-match-form");if(mf)slug=mf.getAttribute("data-match-slug")||"";
if(!slug){var hl=document.getElementById("ytp-highlights");if(hl)slug=hl.getAttribute("data-slug")||""}
if(!slug)slug=location.pathname.replace(/^\/+|\/+$/g,"");
var h1=document.querySelector("h1");if(!h1||!slug)return null;
var e={slug:slug,name:h1.textContent.trim(),url:location.pathname,rating:"",reviews:"",rsrc:"",phone:"",phoneHref:"",ctaLabel:"",ctaHref:"",open:"",hours:""};
var st=document.querySelector("p.stars");if(st){var m=/([0-9]+(?:\.[0-9]+)?)/.exec(st.textContent);if(m)e.rating=m[1];var m2=/([0-9,]+) reviews?/.exec(st.textContent);if(m2)e.reviews=m2[1];var g=st.querySelector(".gsrc");if(g)e.rsrc=g.textContent.trim()}
var tel=document.querySelector(".bizcard57 a.tel[href^='tel:']")||document.querySelector("a.tel[href^='tel:']");if(tel){e.phone=tel.textContent.trim().replace(/^(Call Now|Call to Book|Call)\s+/,"");e.phoneHref=tel.getAttribute("href")||""}
var act=document.querySelector('.bizcard57 a.act57[href="#match"]')||document.querySelector(".bizcard57 a.act57");if(act){e.ctaLabel=act.textContent.trim();e.ctaHref=location.pathname+"#match"}
if(!e.ctaHref){var mh=document.querySelector("#match h2");e.ctaLabel=mh?mh.textContent.trim():"Request this pro";e.ctaHref=location.pathname+"#match"}
var on=document.getElementById("ytp-opennow");if(on&&!on.hidden&&on.textContent.trim())e.open=on.textContent.trim();
var ul=document.querySelector(".lochrs57 ul.hourslist");if(ul){var lis=ul.querySelectorAll("li");var parts=[];for(var i=0;i<lis.length;i++)parts.push(lis[i].textContent.trim());e.hours=parts.join("; ")}
return e}
var bar72=null,ov72=null,opener72=null;
function ensureUI72(){
if(bar72)return;
bar72=document.createElement("div");bar72.className="shortbar72";bar72.id="shortbar72";bar72.hidden=true;bar72.setAttribute("role","region");bar72.setAttribute("aria-label","Saved pros");
bar72.innerHTML='<div class="shortbar-in72"><span class="shorthead72"><strong>Saved pros</strong> <span class="shortcount72"></span></span><span class="shortchips72"></span><span class="shortacts72"><button type="button" class="shortcmp72">Compare</button><button type="button" class="shortclear72">Clear</button></span><p class="shortnote72" hidden></p></div>';
document.body.appendChild(bar72);
ov72=document.createElement("div");ov72.className="cmp72";ov72.hidden=true;
ov72.innerHTML='<div class="cmp-panel72" role="dialog" aria-label="Compare saved pros"><div class="cmp-head72"><h2>Compare saved pros</h2><button type="button" class="cmpclose72">Close</button></div><div class="cmp-grid72"></div></div>';
document.body.appendChild(ov72)}
function openCmp72(opener){ensureUI72();opener72=opener||null;ov72.hidden=false;renderCompare72();var cb=ov72.querySelector(".cmpclose72");if(cb)cb.focus()}
function closeCmp72(restore){if(!ov72||ov72.hidden)return;ov72.hidden=true;var op=opener72;opener72=null;if(restore&&op&&document.contains(op))op.focus()}
function ratingText72(e){if(!e.rating)return "-";var t=e.rating;if(e.reviews)t+=" ("+e.reviews+" reviews)";if(e.rsrc)t+=" \u00b7 "+e.rsrc;return t}
function renderCompare72(){
if(!ov72||ov72.hidden)return;var list=load72();var g=ov72.querySelector(".cmp-grid72");g.style.setProperty("--n72",String(Math.max(list.length,1)));
g.innerHTML=list.map(function(e){
return '<section class="cmp-col72"><h3><a href="'+esc72(e.url)+'">'+esc72(e.name)+'</a></h3>'
+'<p class="cmp-row72"><span class="cmp-lab72">Rating</span>'+esc72(ratingText72(e))+'</p>'
+'<p class="cmp-row72"><span class="cmp-lab72">Hours</span>'+esc72(e.open||e.hours||"-")+'</p>'
+'<p class="cmp-row72"><span class="cmp-lab72">Phone</span>'+(e.phone?'<a href="'+esc72(e.phoneHref||("tel:"+e.phone.replace(/[^0-9+]/g,"")))+'">'+esc72(e.phone)+'</a>':"-")+'</p>'
+'<p class="cmp-row72"><a class="cmp-cta72" href="'+esc72(e.ctaHref||e.url)+'">'+esc72(e.ctaLabel||"Request this pro")+'</a></p>'
+'<p class="cmp-row72"><a href="'+esc72(e.url)+'">View full profile</a></p>'
+'<p class="cmp-row72"><button type="button" class="cmp-rm72" data-remove72="'+esc72(e.slug)+'">Remove</button></p></section>'}).join("")}
function syncButtons72(list){
var btns=document.querySelectorAll(".cardsave72");for(var i=0;i<btns.length;i++){var card=btns[i].closest?btns[i].closest(".result-card"):null;var slug=card?card.getAttribute("data-slug"):"";var on=slug&&find72(list,slug)>=0;btns[i].classList.toggle("saved",!!on);btns[i].textContent=on?"Saved":"Save";btns[i].setAttribute("aria-pressed",on?"true":"false")}
var pb=document.getElementById("ytp-save");if(pb){var pe=profileEntry72();var pon=pe&&find72(list,pe.slug)>=0;pb.classList.toggle("saved",!!pon);pb.textContent=pon?"Saved":"Save this pro";pb.setAttribute("aria-pressed",pon?"true":"false")}}
function paint72(){
ensureUI72();var list=load72();
document.body.classList.toggle("has-short72",list.length>0);
bar72.hidden=!list.length;
if(list.length){
bar72.querySelector(".shortcount72").textContent=list.length+" of "+MAX72+" saved";
bar72.querySelector(".shortchips72").innerHTML=list.map(function(e){return '<span class="shortchip72">'+esc72(e.name)+' <button type="button" data-remove72="'+esc72(e.slug)+'" aria-label="Remove '+esc72(e.name)+'">\u00d7</button></span>'}).join("");
var cmp=bar72.querySelector(".shortcmp72");cmp.disabled=list.length<2;
var note=bar72.querySelector(".shortnote72");var msg=noteMsg72||(list.length===1?"Save at least 2 pros to compare.":"");
note.textContent=msg;note.hidden=!msg}
syncButtons72(list);renderCompare72()}
function remove72(slug){var list=load72();var i=find72(list,slug);if(i>=0){list.splice(i,1);store72(list)}noteMsg72="";if(list.length<2&&ov72&&!ov72.hidden&&list.length<1){closeCmp72(false)}paint72()}
function toggle72(entry){
if(!entry)return;var list=load72();var i=find72(list,entry.slug);
if(i>=0){list.splice(i,1);store72(list);noteMsg72="";paint72();return}
if(list.length>=MAX72){noteMsg72="Your shortlist is full (4 pros). Remove one to save another.";paint72();return}
list.push(clean72(entry));store72(list);noteMsg72="";paint72()}
function inject72(){
var cards=document.querySelectorAll(".result-card[data-slug]");
for(var i=0;i<cards.length;i++){var c=cards[i];if(c.querySelector(".cardsave72"))continue;
var host=c.querySelector(".ract57")||c.querySelector(".rlinks")||c.querySelector(".pbody");if(!host)continue;
var b=document.createElement("button");b.type="button";b.className="cardsave72 savebtn";b.textContent="Save";b.setAttribute("aria-pressed","false");host.appendChild(b)}
syncButtons72(load72())}
document.addEventListener("click",function(ev){
var t=ev.target;if(!t||t.nodeType!==1||!t.closest)return;
if(t.closest("#ytp-save")){ev.preventDefault();ev.stopPropagation();toggle72(profileEntry72());return}
var cs=t.closest(".cardsave72");if(cs){ev.preventDefault();ev.stopPropagation();var card=cs.closest(".result-card");toggle72(card?cardEntry72(card):null);return}
var rm=t.closest("[data-remove72]");if(rm){remove72(rm.getAttribute("data-remove72"));return}
if(t.closest(".shortclear72")){store72([]);noteMsg72="";closeCmp72(false);paint72();return}
if(t.closest(".shortcmp72")){openCmp72(t.closest(".shortcmp72"));return}
if(t.closest(".cmpclose72")||t===ov72){closeCmp72(true);return}
},true);
document.addEventListener("keydown",function(ev){if(ev.key==="Escape")closeCmp72(true)});
function ready72(f){if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",f);else f()}
ready72(function(){
ensureUI72();inject72();paint72();
if("MutationObserver" in window&&document.body){var pend=false;var mo=new MutationObserver(function(){if(pend)return;pend=true;setTimeout(function(){pend=false;inject72()},120)});mo.observe(document.body,{childList:true,subtree:true})}
setTimeout(paint72,600);setTimeout(paint72,1800);setTimeout(paint72,5200);
window.addEventListener("storage",function(e){if(e.key===KEY72)paint72()})});
window.ytpShort72={toggle:toggle72,load:load72,paint:paint72,bindProfile:function(){paint72()},version:"v5.37-item72"};
})();

/* v5.38 item 73: Map and memory niceties. (1) Pin-click scroll reliability: window.ytpPinScroll73 scrolls the matching card into view with block center (cards carry scroll-margin in ytp.css for the sticky header) and keeps the card highlight until the scroll finishes, with a quiet-period detector and a hard cap, instead of the old fixed 1800ms timer that could clear mid-scroll on deep pins. The city-trade template, the generator, and /search/ all delegate their pin click to this helper with the old behavior as fallback. Hover linkage (card hover enlarges its pin, pin hover outlines its card) already shipped with item 60 on both templates and is unchanged. (2) Recently Viewed: listing profile visits are recorded in localStorage under the versioned key ytp-recent-v1 (cap 8, most recent first, a revisit moves the pro to the front), and a Recently Viewed strip renders on /search/ and the homepage only when at least one pro has been viewed. Recording reads only the listing's own page (match form with data-match-source listing and a non-empty slug, plus the business card and H1); non-listing pages record nothing. Malformed stored data is tolerated without breaking the page. No login, no auth, no Supabase. */
(function(){
var KEY73="ytp-recent-v1",MAX73=8;
function esc73(s){return String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}
function clean73(e){return{slug:String(e.slug),name:String(e.name),url:String(e.url),rating:e.rating?String(e.rating):"",reviews:e.reviews?String(e.reviews):"",rsrc:e.rsrc?String(e.rsrc):"",cat:e.cat?String(e.cat):""}}
function load73(){try{var raw=localStorage.getItem(KEY73);if(!raw)return[];var arr=JSON.parse(raw);if(!arr||typeof arr.length!=="number")return[];var out=[];for(var i=0;i<arr.length;i++){var e=arr[i];if(e&&typeof e.slug==="string"&&e.slug&&typeof e.name==="string"&&e.name&&typeof e.url==="string"&&e.url)out.push(clean73(e))}return out.slice(0,MAX73)}catch(e){return[]}}
function store73(list){try{localStorage.setItem(KEY73,JSON.stringify(list.slice(0,MAX73)))}catch(e){}}
function record73(entry){
if(!entry||!entry.slug||!entry.name||!entry.url)return load73();
var list=load73();var out=[clean73(entry)];
for(var i=0;i<list.length;i++)if(list[i].slug!==entry.slug)out.push(list[i]);
out=out.slice(0,MAX73);store73(out);return out}
function profileEntry73(){
var mf=document.getElementById("ytp-match-form");
if(!mf||mf.getAttribute("data-match-source")!=="listing")return null;
var slug=mf.getAttribute("data-match-slug")||"";if(!slug)return null;
if(!document.querySelector(".bizcard57"))return null;
var h1=document.querySelector("h1");if(!h1)return null;
var e={slug:slug,name:h1.textContent.trim(),url:location.pathname,rating:"",reviews:"",rsrc:"",cat:""};
var st=document.querySelector("p.stars");if(st){var m=/([0-9]+(?:\.[0-9]+)?)/.exec(st.textContent);if(m)e.rating=m[1];var m2=/([0-9,]+) reviews?/.exec(st.textContent);if(m2)e.reviews=m2[1];var g=st.querySelector(".gsrc");if(g)e.rsrc=g.textContent.trim()}
var bc=document.querySelector('nav[aria-label="Breadcrumb"]');if(bc){var as=bc.querySelectorAll("a");if(as.length>1)e.cat=as[1].textContent.trim()}
return e}
function pinScroll73(card){
if(!card)return;
card.classList.add("hl");
try{card.scrollIntoView({block:"center",behavior:(window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches)?"auto":"smooth"})}catch(e){try{card.scrollIntoView()}catch(x){}}
var start=Date.now(),lastScroll=0,saw=false,done=false;
function onScroll(){saw=true;lastScroll=Date.now()}
window.addEventListener("scroll",onScroll,{passive:true});
var iv=setInterval(function(){
if(done)return;var now=Date.now();
if((saw&&now-lastScroll>350)||(!saw&&now-start>1400)||now-start>6000)finish()},100);
function finish(){if(done)return;done=true;clearInterval(iv);window.removeEventListener("scroll",onScroll);card.classList.remove("hl")}}
function meta73(e){
var parts=[];
if(e.rating)parts.push("\u2605 "+e.rating+(e.reviews?" ("+e.reviews+" reviews)":"")+(e.rsrc?" \u00b7 "+e.rsrc:""));
if(e.cat)parts.push(e.cat);
return parts.join(" \u00b7 ")}
function render73(){
if(document.querySelector(".recent73"))return;
var list=load73();if(!list.length)return;
var host=null,before=null;
var hero=document.querySelector(".herofull");
var cmain=document.querySelector(".cat-main");
if(hero&&location.pathname==="/"){host=hero.parentNode;before=hero.nextSibling}
else if(cmain&&document.getElementById("results-list")){host=cmain;before=cmain.firstChild}
if(!host)return;
var sec=document.createElement("section");sec.className="recent73";sec.setAttribute("aria-label","Recently viewed");
var h=document.createElement("h2");h.className="recent-h73";h.textContent="Recently viewed";sec.appendChild(h);
var row=document.createElement("div");row.className="recent-row73";
row.innerHTML=list.map(function(e){var m=meta73(e);return '<a class="recent-card73" href="'+esc73(e.url)+'"><span class="recent-name73">'+esc73(e.name)+"</span>"+(m?'<span class="recent-meta73">'+esc73(m)+"</span>":"")+"</a>"}).join("");
sec.appendChild(row);
host.insertBefore(sec,before)}
function ready73(f){if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",f);else f()}
ready73(function(){
var pe=profileEntry73();if(pe)record73(pe);
render73();
window.addEventListener("storage",function(e){if(e.key===KEY73)render73()})});
window.ytpPinScroll73=pinScroll73;
window.ytpRecent73={record:record73,load:load73,render:render73,profileEntry:profileEntry73,version:"v5.38-item73"};
})();

/* v5.39 item 74: "Copy your free review link" on claimed profiles. A listing is claimed when either signal the site already uses says so: the static owner status line in the claim strip slot ("This listing is claimed and managed by its owner.", carried by the house and Featured profiles), or the public claimed_listings view (schema v5) positively answering for the slug, the same check the v4.4 claim script runs. Only then does this module insert the control, directly above the reviews section; unclaimed profiles never carry it in markup and never get it inserted, and any error, empty answer or unreachable Supabase leaves the page exactly as rendered. One click copies the canonical listing URL plus #reviews (every listing profile carries the id="reviews" anchor, verified across the static tree and the renderer template). Feedback follows the item 62 share pattern: the label changes to Copied and resets after 2500ms. Clipboard failure is never silent and never an alert: the link is shown in a readonly field and selected so the owner can copy it manually. No login, no auth change; this is a display control on the public claimed profile. */
(function(){
var LABEL74="Copy your free review link";
function buildUrl74(){
var url="";
var can=document.querySelector('link[rel="canonical"]');
if(can)url=can.getAttribute("href")||"";
if(!url)url=location.origin+location.pathname;
url=url.split("#")[0].split("?")[0];
if(url.charAt(url.length-1)!=="/")url+="/";
return url+"#reviews"}
function fallback74(btn,urlEl){
if(urlEl){urlEl.hidden=false;try{urlEl.focus();urlEl.select()}catch(e){}}
btn.textContent="Copy failed, link shown below";
setTimeout(function(){btn.textContent=LABEL74},2500)}
function copied74(btn){
btn.textContent="Copied";
setTimeout(function(){btn.textContent=LABEL74},2500)}
function copy74(btn,urlEl){
var url=buildUrl74();
function fail(){fallback74(btn,urlEl)}
var clip=(typeof navigator!=="undefined")?navigator.clipboard:null;
if(clip&&clip.writeText){
try{var p=clip.writeText(url);
if(p&&typeof p.then==="function"){p.then(function(){copied74(btn)},fail)}
else copied74(btn)}catch(e){fail()}
}else fail()}
function show74(){
var existing=document.querySelector(".revlink74");
if(existing)return existing;
var rev=document.getElementById("reviews");
if(!rev||!rev.parentNode)return null;
var wrap=document.createElement("div");
wrap.className="revlink74";
var btn=document.createElement("button");
btn.type="button";btn.className="revlink74-btn";btn.textContent=LABEL74;
var urlEl=document.createElement("input");
urlEl.type="text";urlEl.className="revlink74-url";urlEl.readOnly=true;urlEl.hidden=true;
urlEl.value=buildUrl74();urlEl.setAttribute("aria-label","Your free review link");
btn.addEventListener("click",function(){copy74(btn,urlEl)});
wrap.appendChild(btn);wrap.appendChild(urlEl);
rev.parentNode.insertBefore(wrap,rev);
return wrap}
function boot74(A){
var strip=document.querySelector(".claimstrip");
if(strip&&/claimed and managed by its owner/.test(strip.textContent||"")){show74();return}
if(!A||!A.sb)return;
var mf=document.getElementById("ytp-match-form");
if(!mf||mf.getAttribute("data-match-source")!=="listing")return;
var slug=mf.getAttribute("data-match-slug")||"";
if(!slug)slug=location.pathname.replace(/^\/+|\/+$/g,"");
if(!slug)return;
if(!document.getElementById("reviews"))return;
try{
var pr=A.sb.from("claimed_listings").select("business_slug").eq("business_slug",slug).then(function(r){
if(!r||r.error||!r.data||!r.data.length)return;
show74()});
if(pr&&typeof pr.catch==="function")pr.catch(function(){});
}catch(e){}}
if(typeof ytpOnReady==="function"){ytpOnReady(boot74)}
window.ytpReviewLink74={show:show74,url:buildUrl74,copy:copy74,boot:boot74,version:"v5.39-item74"};
})();

/* v5.42 item 78: Map discovery part 2, city switcher. The switcher lists the current town plus up to 5 nearby towns for the SAME trade, so switching town keeps the active trade. Nearby uses the item 54 rule: towns within 25 miles by haversine over cities-index.json coordinates, nearest first, never a town 100+ miles away. A town is offered only when category-index.json carries that town's page for the active trade, so a switch never lands on a 404. The module auto-mounts on city-trade pages (pathname trade/state/city plus the ytp-citymap payload) and the /search/ inline script mounts it through window.ytpMap78.mount once a town is active. The "Search this area" bounding-box control lives in the /search/ and city-trade inline scripts, which own their Leaflet map and result state; this module owns the switcher and the shared nearby math. Existing client data only, no backend change. */
(function(){
function hav78(aLa,aLo,bLa,bLo){var R=3959,p=Math.PI/180,dLa=(bLa-aLa)*p,dLo=(bLo-aLo)*p,h=Math.sin(dLa/2)*Math.sin(dLa/2)+Math.cos(aLa*p)*Math.cos(bLa*p)*Math.sin(dLo/2)*Math.sin(dLo/2);return 2*R*Math.asin(Math.sqrt(h))}
function nearby78(cities,cur,cat,trade){
if(!cities||!cur||!cat||!cat[trade])return[];
if(typeof cur.lat!=="number"||typeof cur.lng!=="number")return[];
var tm=cat[trade],out=[];
for(var i=0;i<cities.length;i++){var c=cities[i];
if(!c||typeof c.lat!=="number"||typeof c.lng!=="number")continue;
if(c.city===cur.city&&c.state===cur.state)continue;
var url=tm[c.sslug+"/"+c.cslug];if(!url)continue;
var d=hav78(cur.lat,cur.lng,c.lat,c.lng);
if(d>25)continue;
out.push({city:c.city,state:c.state,url:url,dist:d})}
out.sort(function(a,b){return a.dist-b.dist||String(a.city).localeCompare(String(b.city))});
return out.slice(0,5)}
function esc78(s){return String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}
function mount78(o){
if(!o||!o.trade||!o.cur||!o.before||!o.before.parentNode)return;
if(document.getElementById("ytp-cityswitch78"))return;
if(!window.YTPLoad||!window.YTPLoad.cb)return;
window.YTPLoad.cb("/cities-index.json",function(cities){
if(!cities)return;
window.YTPLoad.cb("/category-index.json",function(cat){
if(!cat)return;
var near=nearby78(cities,o.cur,cat,o.trade);
if(!near.length)return;
if(document.getElementById("ytp-cityswitch78"))return;
var div=document.createElement("nav");
div.className="cityswitch78";div.id="ytp-cityswitch78";
div.setAttribute("aria-label","Nearby towns");
var h='<span class="cs-lab78">Town:</span><span class="cs78 cur" aria-current="true">'+esc78(o.cur.city)+", "+esc78(o.cur.state)+"</span>";
for(var i=0;i<near.length;i++){h+='<a class="cs78" href="'+esc78(near[i].url)+'">'+esc78(near[i].city)+", "+esc78(near[i].state)+"</a>"}
div.innerHTML=h;
o.before.parentNode.insertBefore(div,o.before);
});});}
function auto78(){
var cm=document.getElementById("ytp-citymap");
if(!cm||!document.getElementById("ytp-map"))return;
var seg=location.pathname.split("/").filter(function(x){return x});
if(seg.length!==3)return;
var cd=null;try{cd=JSON.parse(cm.textContent)}catch(e){}
if(!cd||typeof cd.lat!=="number")return;
var lay=document.querySelector(".cat-layout");
if(!lay)return;
mount78({trade:seg[0],cur:{city:cd.city,state:cd.state,lat:cd.lat,lng:cd.lng},before:lay})}
window.ytpMap78={nearby:nearby78,mount:mount78,hav:hav78,version:"v5.42-item78"};
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",auto78);else auto78();
})();

/* v5.43 item 79: reviews scale-up, shared enhancement module. Stage 3 of the reviews track. The v4.9 inline review script on every listing profile (static tree and the D1 renderer template, identical) already ships the 5-to-1 star histogram (ytpHistogram, counts from the loaded approved reviews only), client-side sort (Newest, Highest rated, Lowest rated) plus search, owner replies from response_text or owner_response, and the Helpful counter backed by the real review_votes table (schema v8; counts render only when that table answers, and a signed-out click asks for sign-in first, so no count is ever invented and no localStorage substitute is needed). This module ships the three gaps that inspection found, and only where real rendered data supports them: (1) the anti-filter line, shown only while at least one approved review is actually rendered and hidden otherwise; (2) a Verified Business Owner badge next to the Response from the owner label, added only to a review that carries a real owner response; (3) a distribution fill: when the inline histogram stays empty because its text gate blocked rating-only reviews, the 5-to-1 bar is computed here from the ratings of the reviews actually shown and rendered into the same histogram container with the same markup. Empty, loading, and no-native-review states get nothing extra. Moderation still governs what publishes: this module only enhances approved reviews the inline script already rendered. */
(function(){
var ANTI79="We don't hide legitimate reviews behind an algorithm.";
function ratings79(scope){
var out=[];if(!scope)return out;
var revs=scope.querySelectorAll(".review");
for(var i=0;i<revs.length;i++){
var st=revs[i].querySelector(".stars");if(!st)continue;
var m=/(?:^|\s)([1-5])\s*$/.exec(String(st.textContent||"").trim());
if(m)out.push(Number(m[1]))}
return out}
function dist79(rs){
var counts=[0,0,0,0,0],sum=0;rs=rs||[];
for(var i=0;i<rs.length;i++){var r=rs[i];if(r>=1&&r<=5){counts[r-1]++;sum+=r}}
var total=rs.length;
var pct=counts.map(function(c){return total?Math.round(100*c/total):0});
return{total:total,counts:counts,pct:pct,avg:total?Math.round(10*sum/total)/10:0}}
function histHtml79(d){
return '<div class="histbox"><p class="histavg">'+d.avg.toFixed(1)+' average from '+d.total+' YourTownPros reviews</p>'+[5,4,3,2,1].map(function(s){return '<div class="histrow"><span class="hstar">'+s+' stars</span><span class="histbar"><i style="width:'+d.pct[s-1]+'%"></i></span><span class="hcount">'+d.counts[s-1]+' ('+d.pct[s-1]+'%)</span></div>'}).join("")+"</div>"}
function enhance79(){
var list=document.getElementById("ytp-reviews-list");if(!list)return{reviews:0};
var sec=document.getElementById("reviews");if(!sec)return{reviews:0};
var revs=list.querySelectorAll(".review");
for(var i=0;i<revs.length;i++){
var rev=revs[i];
if(rev.querySelector(".vbadge79"))continue;
var strongs=rev.querySelectorAll("strong"),hit=null;
for(var j=0;j<strongs.length;j++){if(String(strongs[j].textContent||"").indexOf("Response from the owner")===0){hit=strongs[j];break}}
if(!hit||!hit.parentNode)continue;
var b=document.createElement("span");
b.className="ownerbadge vbadge79";b.textContent="Verified Business Owner";
hit.parentNode.insertBefore(b,hit.nextSibling)}
var anti=document.getElementById("ytp-rev-anti79");
if(revs.length){
if(!anti){anti=document.createElement("p");anti.id="ytp-rev-anti79";anti.className="revanti79";anti.textContent=ANTI79;
var tools=document.getElementById("ytp-rev-tools");
if(tools&&tools.parentNode)tools.parentNode.insertBefore(anti,tools.nextSibling);else sec.appendChild(anti)}
anti.hidden=false}
else if(anti)anti.hidden=true;
var hist=document.getElementById("ytp-rev-hist");
if(hist&&revs.length&&!String(hist.textContent||"").trim()){
var rs=ratings79(list);
if(rs.length){hist.innerHTML=histHtml79(dist79(rs));
var t2=document.getElementById("ytp-rev-tools");if(t2)t2.hidden=false}}
return{reviews:revs.length}}
function boot79(){
var list=document.getElementById("ytp-reviews-list");if(!list)return;
enhance79();
if(typeof MutationObserver!=="undefined"){
var mo=new MutationObserver(function(){enhance79()});
mo.observe(list,{childList:true,subtree:true})}}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot79);else boot79();
window.ytpReviews79={dist:dist79,ratings:ratings79,enhance:enhance79,anti:ANTI79,version:"v5.43-item79"};
})();

/* item80:start */
/* v5.44 item 80: generator guardrails, shared module.
(a) Completeness weighting inside the FREE pool's organic order on
city-trade pages: the default order stays the v5.7 Recommended order
(rated first by rating, then review count) with one added tiebreak,
a completeness score from the card's own rendered facts (verified
hours slot, phone, website, street address, claimed badge). Cards
carrying data-feat (Featured and house) are pinned at their rendered
positions and never move; do-not-call cards (their Request link is
the unscoped #match form, the v5.0 marker) stay after every other
free card. Nothing here lifts a hold or outranks Featured.
(c) "Related trades in [City]" strip on every city-trade page: the
links come from /category-index.json itself, so every href is a
city-trade page that exists; the strip renders only when at least
one other trade serves the same city. */
(function(){
"use strict";
var LABELS80={"pet-grooming":"Pet Grooming","tattoo":"Tattoo","nails":"Nail Salons","barbers":"Barbers","tanning":"Tanning Salons","hair-salons":"Hair Salons","med-spas":"Med Spas","massage":"Massage","auto-repair":"Auto Repair","towing":"Towing","plumbers":"Plumbers","electricians":"Electricians","hvac":"HVAC","roofing":"Roofing","painting":"Painters","lawn-and-landscaping":"Lawn & Landscaping","handyman":"Handyman","cleaners":"Cleaners & Laundry","florists":"Florists","bakeries-and-cafes":"Bakeries & Cafes","jewelry":"Jewelry","veterinary":"Veterinary","fitness":"Fitness","locksmiths":"Locksmiths","spas":"Spas","auto-glass":"Auto Glass","pet-boarding":"Pet Boarding & Daycare","dance-studios":"Dance Studios","bookstores":"Bookstores","website-design":"Website Design","natural-skincare":"Natural Skincare"};
function compOf80(s){var n=0;if(s.hours)n++;if(s.phone)n++;if(s.web)n++;if(s.street)n++;if(s.claimed)n++;return n}
function cardSignals80(card){
var meta=card.querySelector(".meta");
var mtext=meta?String(meta.textContent||""):"";
var street=/^\s*\d+\s+\S/.test(mtext);
return{hours:!!card.querySelector("[data-open57]"),
phone:!!card.querySelector("a.telbtn57"),
web:card.getAttribute("data-web")==="1",
street:street,
claimed:!!card.querySelector(".cbadge")}}
function isDnc80(card){
var a=card.querySelector("a.rtel");
if(!a)return false;
var h=a.getAttribute("href")||"";
return h.indexOf("#match")!==-1&&h.indexOf("src=card")===-1}
function itemOf80(card,idx){
var r=parseFloat(card.getAttribute("data-rating")||"");
return{card:card,idx:idx,feat:card.hasAttribute("data-feat"),
dnc:isDnc80(card),rating:isNaN(r)?null:r,
reviews:parseFloat(card.getAttribute("data-reviews")||"0")||0,
comp:compOf80(cardSignals80(card))}}
function cmpFree80(a,c){
if(a.dnc!==c.dnc)return a.dnc?1:-1;
var ah=a.rating===null?0:1,ch=c.rating===null?0:1;
if(ah!==ch)return ch-ah;
if(ah&&ch&&a.rating!==c.rating)return c.rating-a.rating;
if(a.reviews!==c.reviews)return c.reviews-a.reviews;
if(a.comp!==c.comp)return c.comp-a.comp;
return a.idx-c.idx}
function sortFree80(items){
var free=items.filter(function(it){return !it.feat});
free.sort(cmpFree80);
var out=items.slice(),k=0;
for(var i=0;i<out.length;i++){if(!out[i].feat){out[i]=free[k];k++}}
return out}
function related80(index,trade,key){
var out=[];
for(var t in index){
if(t===trade)continue;
if(index[t]&&index[t][key])out.push({trade:t,url:index[t][key]})}
out.sort(function(a,c){return (LABELS80[a.trade]||a.trade)<(LABELS80[c.trade]||c.trade)?-1:1});
return out}
function cityName80(){
var h1=document.querySelector("h1");
var t=h1?String(h1.textContent||""):"";
var m=t.match(/ in ([^,]+),\s*[A-Z]{2}\s*$/);
return m?m[1].trim():""}
function boot80(){
var list=document.getElementById("results-list");
if(!list)return;
var seg=String(window.location.pathname||"").split("/").filter(function(s){return s});
if(seg.length!==3)return;
var trade=seg[0],key=seg[1]+"/"+seg[2];
var cards=Array.prototype.slice.call(list.querySelectorAll(".result-card"));
if(cards.length>1){
var items=cards.map(function(c,i){return itemOf80(c,i)});
var sorted=sortFree80(items);
var changed=false;
for(var i=0;i<sorted.length;i++)if(sorted[i].card!==cards[i]){changed=true;break}
if(changed){
for(var j=0;j<sorted.length;j++)list.appendChild(sorted[j].card);
var all=list.querySelectorAll(".result-card");
for(var n=0;n<all.length;n++){
var rn=all[n].querySelector(".rnum");
if(rn)rn.textContent=(n+1)+"."}}}
if(typeof fetch!=="function")return;
fetch("/category-index.json").then(function(r){return r.json()}).then(function(index){
var rel=related80(index,trade,key);
if(!rel.length)return;
if(document.querySelector(".related80"))return;
var city=cityName80();
var sec=document.createElement("section");
sec.className="related80";
var h=document.createElement("h2");
h.textContent="Related trades in "+(city||"this city");
sec.appendChild(h);
var div=document.createElement("div");
div.className="related80links";
rel.slice(0,12).forEach(function(r){
var a=document.createElement("a");
a.href=r.url;
a.textContent=(LABELS80[r.trade]||r.trade)+(city?" in "+city:"");
div.appendChild(a)});
sec.appendChild(div);
var layout=list.closest?list.closest(".cat-layout"):null;
if(layout&&layout.parentNode)layout.parentNode.insertBefore(sec,layout.nextSibling);
else if(list.parentNode)list.parentNode.appendChild(sec);
}).catch(function(){})}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot80);else boot80();
window.ytpGuard80={compOf:compOf80,signals:cardSignals80,isDnc:isDnc80,itemOf:itemOf80,cmpFree:cmpFree80,sortFree:sortFree80,related:related80,labels:LABELS80,version:"v5.44-item80"};
})();
/* item80:end */

/* item82:start */
/* v5.45 item 82: hero carousel CTAs route through the same saved-city helper as nav and category picks. The Item 28 Part A module in this file rewrites every nav link whose href is a bare trade root (/tattoo/ and the like) to /search/?v=<trade>&city=<saved city>&state=<saved state> when the legacy ytp-city key holds a saved city, and leaves it national when none is saved. The hero carousel missed that routing: the first slide pill is static markup and the deferred slides are built by the homepage script with national hrefs, so the grooming pill landed on the national page while nav picks localized. This module closes that gap with the same parse and the same target shape: every .herofull .pillbtn keeps its original national href in data-loc82 and its live href is the localized form when a saved city exists, or the original when none does. It runs on DOM ready, again on window load (the deferred slides are built on load), and under a MutationObserver on the hero so slides inserted after either pass are routed too. The homepage script also routes deferred pills through window.ytpHero82.localize at creation time. No new city mechanism: the ytp-city key and the Item 28 target shape are the only inputs. */
(function(){
"use strict";
function getSaved82(){try{return localStorage.getItem("ytp-city")||""}catch(e){return ""}}
function parseSaved82(v){var i=String(v||"").lastIndexOf(",");if(i<1)return null;var c=String(v).slice(0,i).trim(),st=String(v).slice(i+1).trim();return (c&&st)?{city:c,state:st}:null}
function localize82(href){var p=parseSaved82(getSaved82());if(!p)return href;var m=/^\/([a-z0-9-]+)\/$/.exec(String(href||""));if(!m)return href;return "/search/?v="+m[1]+"&city="+encodeURIComponent(p.city)+"&state="+encodeURIComponent(p.state)}
function apply82(){var pills=document.querySelectorAll(".herofull .pillbtn");for(var i=0;i<pills.length;i++){var a=pills[i];var orig=a.getAttribute("data-loc82");if(!orig){orig=a.getAttribute("href")||"";if(orig)a.setAttribute("data-loc82",orig)}if(orig)a.setAttribute("href",localize82(orig))}return pills.length}
function boot82(){apply82();var hero=document.querySelector(".herofull");if(hero&&typeof MutationObserver!=="undefined"&&!hero.getAttribute("data-hero82-obs")){hero.setAttribute("data-hero82-obs","1");var mo=new MutationObserver(function(){apply82()});mo.observe(hero,{childList:true,subtree:true})}}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot82);else boot82();
if(typeof window!=="undefined"&&window.addEventListener)window.addEventListener("load",apply82);
window.ytpHero82={localize:localize82,apply:apply82,parse:parseSaved82,version:"v5.45-item82"};
})();
/* item82:end */

/* item90:start */
/* v5.52 item 90: YourTownPros badges (roadmap item 90, Nov 21, 2026). One shared module renders the badge offer block for the two owner surfaces that carry it: the claim confirmation screen (/claimed/, fed by the just-claimed listing stored at claim submit) and the claimed-listing management view (/business/, the permanent "Your badge" section). The offer copy is offer-copy.md v2 verbatim (Goldfish gate passed Nov 21, 2026); this module never rewrites it. The snippet follows embed-spec.md exactly: a plain link wrapping a plain image, generated at render time from the listing record (canonical listing URL from the record slugs, artwork from the variant plus the owner theme and size choice, alt text from the display name, 224 x 56 standard or 160 x 40 compact). No per-business asset, no identifier, no query string, no scripts in the snippet, no tracking pixel. Eligibility is decided in the same render: unclaimed or not live renders nothing; a full hold replaces the block with the paused note; the Featured variant appears only while that listing's Featured state is active (leased, taste, or house in window.YTP_FEAT, the same live state the dashboard Featured pane reads). A lapsed Featured listing reverts to the Listed snippet with the swap note. Missing or partial data renders nothing, so both surfaces stay exactly as built without this module. */
(function(){
"use strict";
function esc90(s){return String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}
function badgeFile90(variant,theme,size){var v=variant==="featured"?"featured":"listed";var t=theme==="dark"?"dark":"light";var s=size==="compact"?"compact-":"";return "badge-"+v+"-"+s+t+".svg"}
function badgeSize90(size){return size==="compact"?{w:160,h:40}:{w:224,h:56}}
function listingUrl90(slug){return "https://yourtownpros.com/"+String(slug||"").replace(/^\/+|\/+$/g,"")+"/"}
function altText90(name,featured){return featured?String(name||"")+", Featured on YourTownPros":String(name||"")+" on YourTownPros"}
function snippet90(o){var f=!!o.featured;var sz=badgeSize90(o.size);return '<a href="'+listingUrl90(o.slug)+'"><img src="https://yourtownpros.com/assets/badges/'+badgeFile90(f?"featured":"listed",o.theme,o.size)+'" alt="'+esc90(altText90(o.name,f))+'" width="'+sz.w+'" height="'+sz.h+'" loading="lazy"></a>'}
function featuredActive90(slug){var F=window.YTP_FEAT||{by_slug:{}};var e=F.by_slug&&F.by_slug[slug];if(!e)return false;return e.state==="leased"||e.state==="taste"||e.state==="house"}
function featuredEntry90(slug){var F=window.YTP_FEAT||{by_slug:{}};return (F.by_slug&&F.by_slug[slug])||null}
function stateFor90(o){if(!o||!o.claimed||!o.live)return "none";if(o.hold)return "hold";return o.featuredActive?"featured":"listed"}
var PAUSED90="Your badge is paused while this listing is on hold. You do not need to remove the badge code from your site. If the hold lifts, the same code works again unchanged.";
var LAPSE90="Your Featured profile has ended, so the badge offered here is now the Listed version. The badge already on your site stays as it is until you paste the new code, and your listing no longer shows as Featured.";
function offerHtml90(o){
var st=stateFor90(o);if(st==="none")return "";
if(st==="hold")return '<div class="badgeb90"><h2>Your badge</h2><p>'+PAUSED90+"</p></div>";
var f=st==="featured";var theme=o.theme==="dark"?"dark":"light";var size=o.size==="compact"?"compact":"standard";
var sn=snippet90({slug:o.slug,name:o.name,featured:f,theme:theme,size:size});var sz=badgeSize90(size);
var h='<div class="badgeb90"><h2>Add your YourTownPros badge to your website</h2>';
h+="<p>You just claimed your listing on YourTownPros, the directory this listing lives on. Your listing is a page of its own showing your rating, your hours, and your phone number, kept current in one place. This badge is a small picture for your website that links straight to that page, so a customer can check your rating and hours and call you from your listing.</p>";
h+='<p class="badgeprev90"><img src="/assets/badges/'+badgeFile90(f?"featured":"listed",theme,size)+'" alt="'+esc90(altText90(o.name,f))+'" width="'+sz.w+'" height="'+sz.h+'"></p>';
h+='<div class="badgepick90"><label>Theme <select class="btheme90"><option value="light"'+(theme==="light"?" selected":"")+'>Light</option><option value="dark"'+(theme==="dark"?" selected":"")+">Dark</option></select></label> ";
h+='<label>Size <select class="bsize90"><option value="standard"'+(size==="standard"?" selected":"")+'>Standard</option><option value="compact"'+(size==="compact"?" selected":"")+">Compact</option></select></label></div>";
h+='<label class="badgelab90">Your badge code</label><textarea class="badgecode90" rows="3" readonly>'+esc90(sn)+'</textarea>';
h+='<p><button type="button" class="badgecopy90">Copy the code</button> <span class="badgemsg90 listed"></span></p>';
if(!f&&o.featuredWas)h+='<p class="badgelapse90">'+LAPSE90+"</p>";
h+="<p>Pick the light or dark version, copy the code, and paste it where you want the badge to appear. The footer is a common spot, and the compact size is small. If your site was built with a website builder, drop the code into its embed or HTML block. If someone else looks after your site, send them the code: it is a two minute job for them.</p>";
h+="<p>A few straight answers:</p><ul>";
h+="<li>It costs nothing. The badge comes with claiming your listing, and it never turns into a charge.</li>";
h+="<li>It links to your listing page, and only your listing page. Not to a category, not to a list of other businesses.</li>";
h+="<li>It is a plain picture with a link. No scripts, no tracking, nothing extra running on your site. The picture itself shows no rating; your rating is on the listing it opens, so what customers see there is always current.</li>";
h+="<li>Why we offer it: a directory is only useful if people can reach the listings in it. Your customers get a short path to your listing, and your listing gets a link from your site. That is the whole arrangement. Nothing else is attached: no fee later, no change to how your listing is shown or ordered, nothing you have to buy.</li>";
h+="<li>You can take it down any time by deleting the code. Nothing breaks.</li></ul>";
h+="<p>If your business has a Featured profile, which is a separate paid option, your badge says Featured on YourTownPros. If a Featured profile ends, the badge offered in your account switches back to the Listed version; the badge already on your site stays as it is until you paste the new code, and your listing stops showing as Featured either way.</p>";
h+="</div>";return h}
function renderInto90(box,o){
if(!box)return "";box.innerHTML=offerHtml90(o);
var th=box.querySelector(".btheme90"),sz=box.querySelector(".bsize90");
function re(){renderInto90(box,{slug:o.slug,name:o.name,claimed:o.claimed,live:o.live,hold:o.hold,featuredActive:o.featuredActive,featuredWas:o.featuredWas,theme:th?th.value:o.theme,size:sz?sz.value:o.size})}
if(th)th.addEventListener("change",re);if(sz)sz.addEventListener("change",re);
var cp=box.querySelector(".badgecopy90");
if(cp)cp.addEventListener("click",function(){var ta=box.querySelector(".badgecode90");var msg=box.querySelector(".badgemsg90");if(!ta)return;ta.select();var ok=false;try{ok=document.execCommand("copy")}catch(e){}if(!ok&&navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(ta.value).then(function(){if(msg)msg.textContent="Copied."}).catch(function(){});if(msg)msg.textContent="Copied.";return}if(msg)msg.textContent=ok?"Copied.":"Select the code and copy it."});
return box.innerHTML}
window.ytpBadge90={file:badgeFile90,size:badgeSize90,url:listingUrl90,alt:altText90,snippet:snippet90,featuredActive:featuredActive90,featuredEntry:featuredEntry90,stateFor:stateFor90,offerHtml:offerHtml90,renderInto:renderInto90,paused:PAUSED90,lapse:LAPSE90,version:"v5.52-item90"};
})();
/* item90:end */
