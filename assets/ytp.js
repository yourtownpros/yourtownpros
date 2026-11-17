
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


/* v5.1: Suggest an edit. The form inserts one row into
edit_suggestions (schema v10) as pending; nothing renders
publicly from it, and the listing changes only after a
person checks the suggestion against a source (a later
build bakes approved corrections into the data). Until
schema v10 is applied the insert errors and the form says
so plainly; it never shows a success it did not get. No
account is needed: the form asks for a name and an optional
email, and a signed-in user's id rides along when there is
one. */
ytpOnReady(function(A){
var form=document.querySelector(".sgform");
if(!form)return;
var slug=form.getAttribute("data-slug");
/* Nov 16, 2026: the row list replaces the dropdown.
Tapping a row selects the suggestion type into the same
hidden sg_field the submit below already reads, expands
the details area, and swaps in the prompt written for
that type. The Report inappropriate content link selects
the Other row. */
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
if(o){sgSelect(o);o.scrollIntoView({behavior:"smooth",block:"center"});}
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
/* v5.1: owner highlights on the listing. Approved rows from
owner_highlights (schema v10) render as chips in the mount,
labeled as owner-provided and separate from the researched
attribute chips and from reviews. Any error (including the
table not existing yet) leaves the mount empty and the page
exactly as built. */
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

(function(){var b=document.querySelector(".share57");if(!b||!navigator.clipboard)return;b.addEventListener("click",function(){navigator.clipboard.writeText(location.href).then(function(){b.textContent="Link copied"},function(){})})})();

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
})(menus[j])}
var navs=document.querySelectorAll(".catnav");
for(var n=0;n<navs.length;n++){navs[n].addEventListener("scroll",function(){closeAll(null)})}
document.addEventListener("click",function(){closeAll(null)});
document.addEventListener("keydown",function(e){if(e.key==="Escape")closeAll(null)});
})();


/* SHIP 1 (spec 2.2): window.YTPLoad, the one shared loader.
   YTPLoad.json(url) returns a Promise; a URL is fetched at most
   once per page, ever: concurrent callers share the pending
   Promise and later callers get the cached value. typeahead,
   cities and category indexes also persist in sessionStorage
   under versioned keys (<build> below, the same stamp the
   build writes into typeahead.json), so a later page in the
   session makes zero network requests for them. Listing shards
   stay in memory and are written to sessionStorage only while
   their total decoded size stays under a 2.5 MB LRU cap.
   YTPLoad.cb(url, fn) is the callback form the existing
   consumers use; fn receives the data, or null on failure. */
window.YTPLoad = (function () {
  var BUILD = "v512-20261114-ship1";
  var cache = {}, pending = {};
  var SESS = { "/typeahead.json": "ytp-ta-",
    "/cities-index.json": "ytp-ci-",
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


/* v5.12 SHIP 1: header two-field search on the shared
YTPLoad loader and the split index (spec sections 2, 3.3, 6).
Suggestions read typeahead.json only: categories first (with
the spec 4.4 synonyms), then business names ranked by
distance from the active location; the header never loads a
listing shard and never fetches the whole index. Category +
town resolutions route to the /search/ radius view (v5.12
item 1); the static category and town pages stay live for
SEO and direct links. v5.12.2 (owner ruling Nov 14): the
where box is NEVER prefilled, not from the page, not from
storage, not from a geo guess; it starts empty unless the
user typed a location in this session. Name suggestions
rank by distance from the town in the where box only. */
(function(){
var form=document.getElementById("ytp-hform57");if(!form)return;
var f1=document.getElementById("ytp-q57"),f2=document.getElementById("ytp-w57"),
s1=document.getElementById("sug-q57"),s2=document.getElementById("sug-w57");
var TA=null,CT=null,CAT=null,pickB=null,pickV=null,pickC=null,pickCat=false,hi57=-1,s1Items=null,s1Fn=null;
function esc(s){return String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}
function loadTA(cb){if(TA){cb();return}window.YTPLoad.cb("/typeahead.json",function(d){TA=d||{cats:[],towns:[],names:[],shared:{}};cb()})}
function loadCT(cb){if(CT){cb();return}window.YTPLoad.cb("/cities-index.json",function(d){CT=d||[];cb()})}
function loadCAT(cb){if(CAT){cb();return}window.YTPLoad.cb("/category-index.json",function(d){CAT=d||{};cb()})}
function ensure(cb){loadTA(function(){loadCT(function(){loadCAT(cb)})})}
function normQ(q){return q.toLowerCase().replace(/[^a-z0-9 ]/g," ").replace(/\s+/g," ").trim()}
function havMi(aLa,aLo,bLa,bLo){var R=3959,p=Math.PI/180,dLa=(bLa-aLa)*p,dLo=(bLo-aLo)*p,h=Math.sin(dLa/2)*Math.sin(dLa/2)+Math.cos(aLa*p)*Math.cos(bLa*p)*Math.sin(dLo/2)*Math.sin(dLo/2);return 2*R*Math.asin(Math.sqrt(h))}
/* v5.17 search group helpers. nearMe57 splits a trailing
"near <place>" or "near me" off the what text; lev57 is a
bounded edit distance and sing57 a light singularizer, the
pair behind the fuzzy category stage in catMatches. */
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
function savedCity57(){/* Roadmap item 28's saved-city leg,
read-only: the legacy ytp-city key (still read by the match
thanks page) resolves an explicit "near me" query when the
where box is empty. It never prefills the box and never
ranks suggestions; the v5.12.2 ruling stands. */
var v=null;try{v=localStorage.getItem("ytp-city")}catch(e){}
if(!v)return null;
return resolveCityText(v)}
function storeCity28(c){/* Item 28 Part A writer (Nov 17,
2026): a submitted search records the city it resolved,
in the legacy key's "City, ST" form every reader parses.
Only a resolved city object reaches here: typed in the
box, picked from suggestions, or named after "near".
Nothing guesses a city, and the write never prefills
a box; the v5.12.2 ruling stands. */
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
if(c.label.toLowerCase().indexOf(qn)===0)one.push({slug:c.slug,label:c.label,st:1})}
one.sort(function(a,b){return a.label.localeCompare(b.label)});
return one.slice(0,5)}
function push(slug,st){if(!bySlug[slug])return;
for(var j=0;j<scored.length;j++)if(scored[j].slug===slug){if(st<scored[j].st)scored[j].st=st;return}
scored.push({slug:slug,label:bySlug[slug].label,st:st})}
for(i=0;i<TA.cats.length;i++){c=TA.cats[i];
var lab=c.label.toLowerCase(),syns=c.syn||[];
if(lab===qn||syns.indexOf(qn)>-1)push(c.slug,0);
else if(lab.indexOf(qn)===0||syns.some(function(s){return s.indexOf(qn)===0||qn.indexOf(s)===0}))push(c.slug,1);
else if(lab.indexOf(qn)>-1||syns.some(function(s){return s.indexOf(qn)>-1}))push(c.slug,2)}
var shared=TA.shared||{};
for(var term in shared){var tl=term.toLowerCase();
var st2=tl===qn?0:(tl.indexOf(qn)===0||qn.indexOf(tl)===0?1:(tl.indexOf(qn)>-1?2:-1));
if(st2>-1)for(i=0;i<shared[term].length;i++)push(shared[term][i],st2)}
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
if(fbest&&!ftie)push(fbest,3)}
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
function nameMatches(q){if(!TA)return[];
var qn=normQ(q);if(qn.length<2)return[];
var ms=TA.names.filter(function(e){return e.n.toLowerCase().indexOf(qn)>-1});
var loc=activeLoc();
if(loc){var near=[],far=[];
for(var i=0;i<ms.length;i++){var e=ms[i];
if(typeof e.la==="number"){e._d=havMi(e.la,e.lo,loc.lat,loc.lng);
if(e._d<=50)near.push(e);else if(e.s===loc.state)far.push(e)}
else if(e.s===loc.state)far.push(e)}
near.sort(function(a,b){return nameStr(a,qn)-nameStr(b,qn)||a._d-b._d||(b.v||0)-(a.v||0)});
far.sort(function(a,b){return nameStr(a,qn)-nameStr(b,qn)||(b.v||0)-(a.v||0)});
var out=near.slice(0,5);
if(near.length<2)out=near.concat(far).slice(0,5);
return out}
ms.sort(function(a,b){return nameStr(a,qn)-nameStr(b,qn)||(b.v||0)-(a.v||0)});
return ms.slice(0,5)}
function show(box,items,fn){if(!items.length){box.style.display="none";box.innerHTML="";return}
box.innerHTML=items.map(function(it){return '<a href="#">'+it.html+"</a>"}).join("");
box.style.display="block";
var links=box.querySelectorAll("a");
for(var i=0;i<links.length;i++){(function(a,it){a.addEventListener("click",function(ev){ev.preventDefault();fn(it)})})(links[i],items[i])}
if(box===s1){s1Items=items;s1Fn=fn;hi57=-1}}
function sugBiz(){var q=f1.value.trim().toLowerCase();q=nearMe57(q).q;if(q.length<1||!TA){s1.style.display="none";return}
var cats=catMatches(q).map(function(c){return{vslug:c.slug,cat:true,label:c.label,go:"/"+c.slug+"/",html:"<strong>"+esc(c.label)+"</strong><span>Category</span>"}});
var biz=nameMatches(q).map(function(e){return{go:e.u,vslug:e.vs,name:e.n,html:"<strong>"+esc(e.n)+"</strong><span>"+esc(e.t)+" \u00b7 "+esc(e.c)+", "+esc(e.s)+"</span>"}});
show(s1,cats.concat(biz).slice(0,8),function(it){pickB=it.go;pickV=it.vslug||null;pickCat=!!it.cat;f1.value=it.cat?(it.label||""):(it.name||"");s1.style.display="none";ensure(go)})}
function cityMatches(q){var name=q,st="",ci=q.indexOf(",");
if(ci>-1){name=q.slice(0,ci).trim();st=q.slice(ci+1).trim()}
var pre=[],sub=[];
for(var i=0;i<CT.length;i++){var e=CT[i],nm=e.city.toLowerCase();
if(st&&e.state.toLowerCase().indexOf(st)!==0)continue;
if(!name||nm.indexOf(name)===0)pre.push(e);else if(nm.indexOf(name)>-1)sub.push(e)}
return pre.concat(sub)}
function sugCity(){if(!CT)return;
var q=f2.value.trim().toLowerCase();
var ms=cityMatches(q).slice(0,7);
show(s2,ms.map(function(e){return{city:e,html:"<strong>"+esc(e.city)+", "+esc(e.state)+"</strong><span>"+e.count+" businesses</span>"}}),function(it){pickC=it.city;f2.value=it.city.city+", "+it.city.state;s2.style.display="none"})}
function resolveCity(){if(pickC)return pickC;
if(!CT)return null;
return resolveCityText(f2.value)}
function go(){var raw=f1.value.trim();
var nm=nearMe57(normQ(raw));
var city=resolveCity();
if(!city&&nm.place)city=resolveCityText(nm.place);
if(!city&&nm.near)city=savedCity57();
if(city&&city.city&&city.state)storeCity28(city);
var q=nm.q;
/* v5.17 search group (QA item 3), on the v5.12.2 contract
(a category plus a resolved town lands on the radius
view): typed text NEVER lands on a single listing and
NEVER falls back to the home page. The old first-name-match
jumps (a bare "plumber" with no town went straight to one
plumber's listing) and the silent "/" fallback are gone.
The only direct listing route left is an explicit
suggestion click (pickB): the visitor's own choice.
Everything else resolves to the radius view or to
/search/?q=, where the query is resolved in the open:
category results, a town picker, business name matches,
or a helpful empty state. */
if(pickB&&!nm.near){location.href=pickB;return}
if(city&&pickCat&&pickV){location.href="/search/?v="+pickV+"&city="+encodeURIComponent(city.city)+"&state="+city.state;return}
if(city&&q){var cms=catMatches(q);
if(cms.length){location.href="/search/?v="+cms[0].slug+"&city="+encodeURIComponent(city.city)+"&state="+city.state;return}
location.href=searchURL57(raw,city);return}
if(city){location.href=city.url;return}
if(q||nm.near){location.href=searchURL57(raw,null,f2.value.trim()||null);return}
location.href="/search/"}
form.addEventListener("submit",function(ev){ev.preventDefault();ensure(go)});
f1.addEventListener("input",function(){pickB=null;pickV=null;pickCat=false;loadTA(sugBiz)});
f1.addEventListener("focus",function(){loadTA(sugBiz)});
/* v5.18 (item 45): the header dropdown gains the hero
search keyboard navigation, and trades offer from the
first keystroke (sugBiz gate above). A category pick
fills the box with the clean trade label. */
function paint57(){var ls=s1.querySelectorAll("a");for(var i=0;i<ls.length;i++)ls[i].classList.toggle("active",i===hi57)}
f1.addEventListener("keydown",function(ev){if(s1.style.display!=="block"||!s1Items||!s1Items.length)return;
if(ev.key==="ArrowDown"||ev.key==="ArrowUp"){ev.preventDefault();hi57=ev.key==="ArrowDown"?(hi57+1)%s1Items.length:(hi57-1+s1Items.length)%s1Items.length;paint57()}
else if(ev.key==="Enter"&&hi57>=0){ev.preventDefault();var it=s1Items[hi57];if(it&&s1Fn)s1Fn(it)}
else if(ev.key==="Escape"){s1.style.display="none"}});
f2.addEventListener("input",function(){pickC=null;loadCT(sugCity)});
f2.addEventListener("focus",function(){loadCT(sugCity)});
document.addEventListener("click",function(ev){if(!s1.contains(ev.target)&&ev.target!==f1)s1.style.display="none";if(!s2.contains(ev.target)&&ev.target!==f2)s2.style.display="none"});
/* v5.12.2 (owner ruling Nov 14): NO where-box prefill.
The v5.10.1 block that filled the box from the page's own
location, falling back to a saved city, is removed: the
box starts empty on every page unless the user typed a
location in this session (the /search/ view still sets it
from the search URL the user just submitted). v5.17 adds
one narrow read back: savedCity57 reads the legacy
ytp-city key only to resolve an explicit "near me" query
(roadmap item 28's saved-city leg). The box is still
never prefilled and the key is never written here. */
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
function render(){var si=document.getElementById("ytp-signin"),um=document.getElementById("ytp-umenu"),ub=document.getElementById("ytp-ubtn");if(!si||!um)return;if(A.user){si.hidden=true;um.hidden=false;if(ub)ub.textContent=A.firstName()||"Account"}else{si.hidden=false;um.hidden=true}probeOwner()}
function wire(){var si=document.getElementById("ytp-signin");if(si)si.addEventListener("click",function(){A.signIn()});
var ub=document.getElementById("ytp-ubtn"),um=document.getElementById("ytp-umenu");
if(ub&&um){ub.addEventListener("click",function(e){e.stopPropagation();var open=um.classList.toggle("open");ub.setAttribute("aria-expanded",open?"true":"false")});
document.addEventListener("click",function(e){if(!um.contains(e.target)){um.classList.remove("open");ub.setAttribute("aria-expanded","false")}});
document.addEventListener("keydown",function(e){if(e.key==="Escape"){um.classList.remove("open");ub.setAttribute("aria-expanded","false")}})}
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

/* Item 28 Part A (Nov 17, 2026): saved-city routing and
the change-city pill. The legacy ytp-city key holds one
"City, ST" string, the form every existing reader parses
(savedCity57 in this file, the match thanks page). Writers
in this build: a city category page records its city (the
ytp-citymap block exists only on those pages, so opening
one is the visitor's own choice of city), and the header
and hero searches record the city a submitted search
resolved (storeCity28, beside savedCity57). Nothing here
guesses a city: no geolocation, no IP lookup, and no box
is ever prefilled; the v5.12.2 no-prefill ruling stands.
Readers in this build: when a city is saved, top-nav trade
links route straight to /search/?v=<trade>&city=<city>&
state=<state>, and a compact pill in the header names the
saved city with Change and Clear actions. With nothing
saved, this module changes nothing. */
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
var htop=document.querySelector(".htop");if(!htop)return;
var pill=document.createElement("span");pill.className="citypill28";pill.id="ytp-citypill";
pill.title="Saved on this device only, from the city you searched for. Change picks a different city, and the × makes the site forget it.";
var nm=document.createElement("span");nm.className="cp-name";nm.textContent="📍 "+saved;pill.appendChild(nm);
var chg=document.createElement("button");chg.type="button";chg.className="cp-change";chg.textContent="Change";pill.appendChild(chg);
var clr=document.createElement("button");clr.type="button";clr.className="cp-clear";clr.setAttribute("aria-label","Clear saved city");clr.textContent="×";pill.appendChild(clr);
var hr=htop.querySelector(".hright");if(hr)htop.insertBefore(pill,hr);else htop.appendChild(pill);
chg.addEventListener("click",function(ev){if(ev&&ev.stopPropagation)ev.stopPropagation();var w=document.getElementById("ytp-w57")||document.getElementById("hs-city");if(!w)return;w.value=saved;w.scrollIntoView({block:"center"});w.focus();if(w.select)w.select();try{w.dispatchEvent(new Event("input",{bubbles:true}))}catch(e){}});
clr.addEventListener("click",function(){setSaved("");
for(var j=0;j<navLinks.length;j++){var o=navLinks[j].getAttribute("data-loc28");if(o)navLinks[j].setAttribute("href",o);navLinks[j].removeAttribute("data-loc28")}
if(pill.parentNode)pill.parentNode.removeChild(pill);
var hint=document.getElementById("hs-loc-hint");
if(hint&&hint.getAttribute("data-loc28")){hint.removeAttribute("data-loc28");hint.textContent="Location unavailable, type your city instead";hint.style.display="none"}});
})();
