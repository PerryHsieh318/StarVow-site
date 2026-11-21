import { enterPage } from "./motion/entrance.js";

// Preserve bookmarks from the previous single-page edition.
const siteRoot = new URL("./", import.meta.url);
if(location.pathname === siteRoot.pathname || location.pathname === siteRoot.pathname + "index.html") {
  const routes={"#download":"/play/","#install":"/play/#install","#guide":"/play/#install","#features":"/features/","#community":"/community/","#news-list":"/news/"};
  if(routes[location.hash]) location.replace(new URL(routes[location.hash].slice(1), siteRoot));
}
const menu=document.querySelector(".menu");
function closeMenu(focus=false) {
  if(!menu.open) return;
  menu.open=false;
  if(focus) menu.querySelector("summary").focus();
}
document.addEventListener("keydown",event=>{if(event.key==="Escape") closeMenu(true)});
document.addEventListener("click",event=>{if(!menu.contains(event.target)) closeMenu()});
matchMedia("(min-width:761px)").addEventListener("change",()=>closeMenu());

const filters=document.querySelector(".filters");
if(filters) {
  const buttons=[...filters.querySelectorAll("button")];
  function select(value) {
    const selected=buttons.some(b=>b.dataset.filter===value)?value:"all";
    for(const button of buttons) button.setAttribute("aria-pressed",String(button.dataset.filter===selected));
    for(const row of document.querySelectorAll("[data-category]")) row.hidden=selected!=="all"&&row.dataset.category!==selected;
  }
  filters.addEventListener("click",event=>{
    const button=event.target.closest("button");
    if(!button) return;
    const url=new URL(location.href), value=button.dataset.filter;
    if(value==="all") url.searchParams.delete("category");else url.searchParams.set("category",value);
    if(url.href!==location.href) history.pushState(null,"",url);
    select(value);
  });
  const fromUrl=()=>select(new URL(location.href).searchParams.get("category"));
  addEventListener("popstate",fromUrl);fromUrl();filters.hidden=false;
}
const hero=document.querySelector(".hero");
if(hero) {
  const skills=hero.querySelector("[data-costume]") ? import("./motion/maple/skills.js") : null;
  Promise.all([import("./motion/scene.js"),skills]).then(([scene,maple])=>scene.mountScene(hero,maple));
}
enterPage();
