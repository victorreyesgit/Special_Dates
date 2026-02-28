// ==========================
// VARIABLES PRINCIPALES
// ==========================
let lang = 'es'; // idioma por defecto
const dateInput = document.getElementById("dateInput");
const result = document.getElementById("result");
const shareModal = document.getElementById("shareModal");
const shareMessage = document.getElementById("shareMessage");
const shareLink = document.getElementById("shareLink");
const copyBtn = document.getElementById("copyBtn");
const basePageLink = "https://victorreyesgit.github.io/Special_Dates/";
const langMenuImages = document.querySelectorAll("#langMenu img");

// ==========================
// TEXTOS SEGÚN IDIOMA
// ==========================
const texts = {
    en: {
        nextDay: "Your next special day is",
        upcoming: "Upcoming special dates",
        shareMessage: "I will reach",
        enterBirthday: "Enter your birthday",
        days: "days",
        inDays: "in",
        noUpcoming: "No upcoming special days found."
    },
    es: {
        nextDay: "Tu próximo día especial es",
        upcoming: "Próximas fechas especiales",
        shareMessage: "Cumpliré",
        enterBirthday: "Pon aquí tu cumpleaños",
        days: "días",
        inDays: "el",
        noUpcoming: "No se encontraron días especiales futuros."
    }
};

// ==========================
// GENERAR MILESTONES
// ==========================
function generateMilestones() {
    let set = new Set();
    for(let i=10;i<=999999;i++){
        const str = i.toString();
        if(i%1000===0) set.add(i);
        if(/^(\d)\1+$/.test(str) && str[0]!=="9") set.add(i);
        if(str.length>=3 && "123456789".includes(str)) set.add(i);
    }
    return Array.from(set).sort((a,b)=>a-b);
}
const milestones = generateMilestones();

// ==========================
// CONFETTI
// ==========================
function launchConfetti(){
    for(let i=0;i<80;i++){
        const conf = document.createElement("div");
        conf.className="confetti";
        conf.style.left=Math.random()*100+"vw";
        conf.style.backgroundColor=`hsl(${Math.random()*360},100%,50%)`;
        conf.style.animationDuration=(Math.random()*3+2)+"s";
        document.body.appendChild(conf);
        setTimeout(()=>conf.remove(),5000);
    }
}

// ==========================
// MODAL COMPARTIR
// ==========================
function openModal(days, date){
    const url = `${basePageLink}?date=${date.toISOString().slice(0,10)}`;
    const t = texts[lang];
    shareMessage.textContent = `${t.shareMessage} ${days.toLocaleString()} ${t.days} ${t.inDays} ${date.toLocaleDateString("en-GB")}`;
    shareLink.value = url;
    shareModal.style.display = "flex";
}

function closeModal(){ shareModal.style.display="none"; }

copyBtn.addEventListener("click", ()=>{
    const text = shareMessage.textContent + "\n" + shareLink.value;
    navigator.clipboard.writeText(text)
        .then(()=>alert("Copied to clipboard!"))
        .catch(()=>alert("Could not copy."));
});

// ==========================
// ACTUALIZAR TEXTOS SEGÚN IDIOMA
// ==========================
function updateTexts(){
    const t = texts[lang];
    document.querySelector(".subtitle").textContent = lang==='en' 
        ? "Because birthdays are not the only special days to celebrate!" 
        : "Porque los cumpleaños no son los únicos días especiales para celebrar!";
    document.querySelector("label.input-label").textContent = t.enterBirthday;

    // actualizar resultados ya calculados
    const celebrationDiv = document.querySelector(".celebration");
    if(celebrationDiv) celebrationDiv.textContent = t.nextDay;

    const sectionTitleDiv = document.querySelector(".section-title");
    if(sectionTitleDiv) sectionTitleDiv.textContent = t.upcoming;

    const items = document.querySelectorAll(".item");
    const today = new Date();
    items.forEach(item=>{
        const parts = item.dataset.date.split("-"); // date stored in dataset
        const futureDate = new Date(parts[0], parts[1]-1, parts[2]);
        const daysCount = parseInt(item.dataset.days,10);
        const d = Math.ceil((futureDate - today)/(1000*60*60*24));
        item.textContent = `${daysCount.toLocaleString()} ${t.days} → ${futureDate.toLocaleDateString("en-GB")} (${t.inDays} ${d} ${t.days})`;
    });

    // actualizar modal si está abierto
    if(shareModal.style.display==="flex"){
        const urlDate = shareLink.value.split("=")[1];
        const futureDate = new Date(urlDate);
        const daysMatch = shareMessage.textContent.match(/\d+/);
        const days = daysMatch ? parseInt(daysMatch[0]) : 0;
        shareMessage.textContent = `${t.shareMessage} ${days.toLocaleString()} ${t.days} ${t.inDays} ${futureDate.toLocaleDateString("en-GB")}`;
    }
}

// ==========================
// CÁLCULO Y MOSTRAR FECHAS
// ==========================
function calculateAndShow(dateValue){
    const parts = dateValue.split("/");
    if(parts.length!==3) return;
    const day=parseInt(parts[0],10);
    const month=parseInt(parts[1],10)-1;
    const year=parseInt(parts[2],10);
    const baseDate = new Date(year, month, day);
    const today = new Date();
    result.innerHTML="";

    let futureMilestones=[];
    milestones.forEach(days=>{
        const futureDate = new Date(baseDate);
        futureDate.setDate(baseDate.getDate()+days);
        if(futureDate>today) futureMilestones.push({days, date:futureDate});
    });

    futureMilestones.sort((a,b)=>a.date-b.date);
    if(futureMilestones.length===0){
        result.textContent = texts[lang].noUpcoming;
        return;
    }

    const first = futureMilestones[0];
    const nextTen = futureMilestones.slice(1,11);
    const daysUntilFirst = Math.ceil((first.date - today)/(1000*60*60*24));
    const t = texts[lang];

    // mostrar primer día
    result.innerHTML += `
        <div class="celebration">${t.nextDay}</div>
        <div class="big-day" onclick="openModal(${first.days}, new Date('${first.date.toISOString()}'))">
            ${first.days.toLocaleString()} ${t.days}
        </div>
        <div class="date">${first.date.toLocaleDateString("en-GB")} • ${t.inDays} ${daysUntilFirst} ${t.days}</div>
    `;

    // siguientes
    if(nextTen.length>0){
        result.innerHTML += `<div class="section-title">${t.upcoming}</div>`;
        nextTen.forEach(item=>{
            const d = Math.ceil((item.date-today)/(1000*60*60*24));
            result.innerHTML += `
                <div class="item" data-days="${item.days}" data-date="${item.date.getFullYear()}-${item.date.getMonth()+1}-${item.date.getDate()}" onclick="openModal(${item.days}, new Date('${item.date.toISOString()}'))">
                    ${item.days.toLocaleString()} ${t.days} → ${item.date.toLocaleDateString("en-GB")} (${t.inDays} ${d} ${t.days})
                </div>
            `;
        });
    }

    launchConfetti();
}

// ==========================
// AUTO-FORMATEO DD/MM/YYYY
// ==========================
dateInput.addEventListener("input", (e) => {
    let val = dateInput.value.replace(/\D/g, "");
    if(val.length>2) val = val.slice(0,2)+"/"+val.slice(2);
    if(val.length>5) val = val.slice(0,5)+"/"+val.slice(5,9);
    dateInput.value = val;

    if(val.length===10){
        calculateAndShow(val);
    }
});

// ==========================
// DETECCIÓN CAMBIO DE IDIOMA
// ==========================
langMenuImages.forEach(img => {
    img.addEventListener("click", () => {
        lang = img.dataset.lang;
        updateTexts();
        document.getElementById("langMenu").style.display="none";
    });
});

// Cerrar menú si clic fuera
document.addEventListener("click",(e)=>{
    const menu = document.getElementById("langMenu");
    const icon = document.getElementById("langIcon");
    if(!icon.contains(e.target)) menu.style.display="none";
});

// ==========================
// AUTOCOMPLETAR DESDE URL
// ==========================
function getDateFromURL(){
    const params = new URLSearchParams(window.location.search);
    return params.get("date");
}

window.addEventListener("DOMContentLoaded", ()=>{
    updateTexts();
    const urlDate = getDateFromURL();
    if(urlDate){
        const parts = urlDate.split("-");
        if(parts.length===3){
            dateInput.value = `${parts[2]}/${parts[1]}/${parts[0]}`;
        }
    }
});