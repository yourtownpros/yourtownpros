
(function(){
var el=document.getElementById("ytp-lmap");if(!el||!window.L)return;
var dEl=document.getElementById("ytp-lmap-data");if(!dEl)return;
var d=null;try{d=JSON.parse(dEl.textContent)}catch(e){return}
function esc(s){return String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}
/* v5.10.1: CARTO Voyager tiles, and wheel zoom stays
off until the map is clicked (the category-map pattern),
so page scroll is never trapped by the listing map. */
var map=L.map(el,{scrollWheelZoom:false});
L.tileLayer("https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",{maxZoom:19,attribution:"&copy; OpenStreetMap contributors &copy; CARTO"}).addTo(map);
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
form.addEventListener("submit",function(ev){
ev.preventDefault();
var msg=form.querySelector(".sgmsg");
function fail(){if(msg)msg.textContent="Could not send. Please try again later.";}
var hp=form.querySelector("input[name='company_website']");
if(hp&&hp.value)return;
function val(n){var el=form.querySelector('[name="'+n+'"]');return el?el.value.trim():"";}
var name=val("sg_name"),details=val("sg_details");
if(!name||!details){if(msg)msg.textContent="Please add your name and a few details about what should change.";return;}
if(!A||!A.sb){fail();return;}
var row={business_slug:slug,field_hint:val("sg_field"),details:details,submitter_name:name,contact:val("sg_email"),status:"pending"};
if(A.user)row.user_id=A.user.id;
A.sb.from("edit_suggestions").insert(row).then(function(r){
if(r.error){fail();return;}
form.reset();
if(msg)msg.textContent="Thanks. We check every suggestion before anything on this page changes.";
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


/* v5.7: header two-field search. Same routing contract as
the hero search (category + city through the category
index, else best business/city target); the where field
prefills from the saved city the hero search stores. */
(function(){
var form=document.getElementById("ytp-hform57");if(!form)return;
var f1=document.getElementById("ytp-q57"),f2=document.getElementById("ytp-w57"),
s1=document.getElementById("sug-q57"),s2=document.getElementById("sug-w57");
var D=null,CT=null,CAT=null,pickB=null,pickV=null,pickC=null;
function esc(s){return String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;")}
function fetchJ(u,cb){fetch(u).then(function(r){return r.json()}).then(function(d){cb(d)}).catch(function(){cb(null)})}
function loadD(cb){if(D){cb();return}fetchJ("/search-index.json",function(d){D=d||[];cb()})}
function loadCT(cb){if(CT){cb();return}fetchJ("/cities-index.json",function(d){CT=d||[];cb()})}
function loadCAT(cb){if(CAT){cb();return}fetchJ("/category-index.json",function(d){CAT=d||{};cb()})}
function ensure(cb){loadD(function(){loadCT(function(){loadCAT(cb)})})}
function sm57(e,q){return e.name.toLowerCase().indexOf(q)>-1||(e.attrs||[]).join(" ").toLowerCase().indexOf(q)>-1||(e.services||[]).join(" ").toLowerCase().indexOf(q)>-1}
function show(box,items,fn){if(!items.length){box.style.display="none";box.innerHTML="";return}
box.innerHTML=items.map(function(it){return '<a href="#">'+it.html+"</a>"}).join("");
box.style.display="block";
var links=box.querySelectorAll("a");
for(var i=0;i<links.length;i++){(function(a,it){a.addEventListener("click",function(ev){ev.preventDefault();fn(it)})})(links[i],items[i])}}
function sugBiz(){var q=f1.value.trim().toLowerCase();if(q.length<2||!D){s1.style.display="none";return}
var seen={},cats=[];
for(var i=0;i<D.length&&cats.length<4;i++){var e=D[i];
if(e.vertical.toLowerCase().indexOf(q)>-1&&!seen[e.vslug]){seen[e.vslug]=1;cats.push({vslug:e.vslug,go:"/"+e.vslug+"/",html:"<strong>"+esc(e.vertical)+"</strong><span>Category</span>"})}}
var biz=D.filter(function(e){return sm57(e,q)}).slice(0,6).map(function(e){return{go:e.url,html:"<strong>"+esc(e.name)+"</strong><span>"+esc(e.vertical)+" \u00b7 "+esc(e.city)+", "+e.state+"</span>"}});
show(s1,cats.concat(biz).slice(0,8),function(it){pickB=it.go;pickV=it.vslug||null;f1.value=it.html.replace(/<[^>]+>/g,"");s1.style.display="none";ensure(go)})}
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
show(s2,ms.map(function(e){return{city:e,html:"<strong>"+esc(e.city)+", "+e.state+"</strong><span>"+e.count+" businesses</span>"}}),function(it){pickC=it.city;f2.value=it.city.city+", "+it.city.state;s2.style.display="none"})}
function resolveCity(){if(pickC)return pickC;
var t=f2.value.trim();if(!t||!CT)return null;
var low=t.toLowerCase();
for(var i=0;i<CT.length;i++){if((CT[i].city+", "+CT[i].state).toLowerCase()===low)return CT[i]}
for(var i=0;i<CT.length;i++){if(CT[i].city.toLowerCase()===low)return CT[i]}
return null}
function go(){var city=resolveCity(),q=f1.value.trim().toLowerCase();
if(city&&CAT&&pickV&&CAT[pickV]&&CAT[pickV][city.sslug+"/"+city.cslug]){location.href=CAT[pickV][city.sslug+"/"+city.cslug];return}
if(pickB){location.href=pickB;return}
if(city&&CAT&&q){var key=city.sslug+"/"+city.cslug,seen={},vs=[];
for(var i=0;i<D.length;i++){var e=D[i];if(e.vertical.toLowerCase().indexOf(q)>-1&&!seen[e.vslug]){seen[e.vslug]=1;vs.push(e.vslug)}}
for(var i=0;i<vs.length;i++){if(CAT[vs[i]]&&CAT[vs[i]][key]){location.href=CAT[vs[i]][key];return}}}
if(city&&q){var m=D.filter(function(e){return e.city===city.city&&e.state===city.state&&(e.vertical.toLowerCase().indexOf(q)>-1||sm57(e,q))});
if(m.length>=2&&CAT&&CAT[m[0].vslug]&&CAT[m[0].vslug][city.sslug+"/"+city.cslug]){location.href=CAT[m[0].vslug][city.sslug+"/"+city.cslug];return}
if(m.length===1){location.href=m[0].url;return}}
if(city){location.href=city.url;return}
if(q){var b=D.filter(function(e){return sm57(e,q)});
if(b.length){location.href=b[0].url;return}
var c=D.filter(function(e){return e.vertical.toLowerCase().indexOf(q)>-1});
if(c.length){location.href="/"+c[0].vslug+"/";return}}
location.href="/"}
form.addEventListener("submit",function(ev){ev.preventDefault();ensure(go)});
f1.addEventListener("input",function(){pickB=null;pickV=null;loadD(sugBiz)});
f1.addEventListener("focus",function(){loadD(sugBiz)});
f2.addEventListener("input",function(){pickC=null;loadCT(sugCity)});
f2.addEventListener("focus",function(){loadCT(sugCity)});
document.addEventListener("click",function(ev){if(!s1.contains(ev.target)&&ev.target!==f1)s1.style.display="none";if(!s2.contains(ev.target)&&ev.target!==f2)s2.style.display="none"});
/* v5.10.1: the where box shows the location of the page
being viewed first (the category page's city block, else
the listing's map data); a saved city is only a fallback,
so a stale saved city never overrides the place on screen. */
try{var own=null;
var cm=document.getElementById("ytp-citymap");
if(cm){try{var cj=JSON.parse(cm.textContent);if(cj&&cj.city)own=cj.city+", "+cj.state}catch(x){}}
if(!own){var lm=document.getElementById("ytp-lmap-data");
if(lm){try{var lj=JSON.parse(lm.textContent);
if(lj&&lj.city)own=lj.city;
else if(lj&&lj.addr){var sg=String(lj.addr).split(",");
if(sg.length>=2)own=sg[sg.length-2].trim()+", "+sg[sg.length-1].trim()}}catch(x){}}}
if(own)f2.value=own;
else{var saved=localStorage.getItem("ytp-city");if(saved&&!f2.value)f2.value=saved}}catch(x){}
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
