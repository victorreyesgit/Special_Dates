// ==========================
// VARIABLES PRINCIPALES
// ==========================
let lang = localStorage.getItem("lang") || 'es'; // idioma por defecto o guardado
const dateInput = document.getElementById("dateInput");
const result = document.getElementById("result");
const shareModal = document.getElementById("shareModal");
const shareMessage = document.getElementById("shareMessage");
const shareLink = document.getElementById("shareLink");
const copyBtn = document.getElementById("copyBtn");
const basePageLink = "https://victorreyesgit.github.io/Special_Dates/";
const langMenuImages = document.querySelectorAll("#langMenu img");
const langIcon = document.getElementById("langIcon");

// ==========================
// TEXTOS SEGÚN IDIOMA
// ==========================
const texts = {
    en: {
        title: "Special Dates",
        subtitle: "Because birthdays are not the only special days to celebrate!",
        enterBirthday: "Enter your birthday and guess how many days you've lived",
        youHave: "You lived",
        nextDayVersary: "Your next day-versary is",
        nextDay: "Your next special day is",
        upcoming: "Upcoming special dates",
        shareMessage: "I will be",
        days: "days",
        daysold: "days old",
        inDays: "in",
        inDate: "on",
        noUpcoming: "No upcoming special days found."
    },
    es: {
        title: "Fechas Especiales",
        subtitle: "Porque los cumpleaños no son los únicos días especiales para celebrar!",
        enterBirthday: "Pon aquí tu cumpleaños y adivina cuántos días tienes",
        youHave: "Tienes",
        nextDayVersary: "Tu siguiente cumpledía es",
        nextDay: "Tu próximo día especial es",
        upcoming: "Próximas fechas especiales",
        shareMessage: "Cumpliré",
        days: "días",
        daysold: "días",
        inDays: "en",
        inDate: "el",
        noUpcoming: "No se encontraron días especiales futuros."
    }
};

// ==========================
// GENERAR MILESTONES
// ==========================
function generateMilestones() {
    let set = new Set();

    // números con todos los dígitos iguales (excepto 9)
    for (let d = 1; d <= 8; d++) {
        let str = "";
        while (Number(str + d) <= 1000000) {
            str += d;
            set.add(Number(str));
        }
    }

    // múltiplos de 100 menores que 1000
    for (let i = 100; i < 1000; i += 100) {
        set.add(i);
    }


     // Mas
    for (let i = 1000; i <= 1000000; i += 1000) {
        set.add(i);
    }

    return Array.from(set).sort((a, b) => a - b);
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
    const url = basePageLink;
    const t = texts[lang];
    shareMessage.textContent = `${t.shareMessage} ${days.toLocaleString()} ${t.daysold} ${t.inDate} ${date.toLocaleDateString("en-GB")}`;
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
    document.querySelector(".subtitle").textContent = t.subtitle;
    document.querySelector(".input-label").textContent = t.enterBirthday;

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

    // calcular cuántos días vividos
    const daysLived = Math.floor((today - baseDate)/(1000*60*60*24));
    const t = texts[lang];
    result.innerHTML += `<div class="celebration">${t.youHave} ${daysLived.toLocaleString()} ${t.days}</div>`;

    let futureMilestones=[];
    milestones.forEach(days=>{
        const futureDate = new Date(baseDate);
        futureDate.setDate(baseDate.getDate()+days);
        if(futureDate>today) futureMilestones.push({days, date:futureDate});
    });

    futureMilestones.sort((a,b)=>a.date-b.date);
    if(futureMilestones.length===0){
        result.innerHTML += `<div>${t.noUpcoming}</div>`;
        return;
    }

    const first = futureMilestones[0];
    const nextTen = futureMilestones.slice(1,4);
    const daysUntilFirst = Math.ceil((first.date - today)/(1000*60*60*24));

    // mostrar siguiente day-versary
    result.innerHTML += `
        <div class="celebration">${t.nextDayVersary}</div>
        <div class="big-day" onclick="openModal(${first.days}, new Date('${first.date.toISOString()}'))">
            ${first.days.toLocaleString()} ${t.days}
        </div>
        <div class="date">${first.date.toLocaleDateString("en-GB")} • ${t.inDays} ${daysUntilFirst} ${t.days}</div>
    `;

    // próximos
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
dateInput.addEventListener("input", (e)=>{
    let val = dateInput.value.replace(/\D/g,"");
    if(val.length>2) val = val.slice(0,2)+"/"+val.slice(2);
    if(val.length>5) val = val.slice(0,5)+"/"+val.slice(5,9);
    dateInput.value = val;

    if(val.length===10){
        calculateAndShow(val);
    }
});

// ==========================
// MENU IDIOMAS
// ==========================
langIcon.addEventListener("click", (e)=>{
    const menu = document.getElementById("langMenu");
    menu.style.display = (menu.style.display === "flex") ? "none" : "flex";
    e.stopPropagation();
});

langMenuImages.forEach(img => {
    img.addEventListener("click", () => {
        lang = img.dataset.lang;
        localStorage.setItem("lang", lang); // guardar idioma
        location.reload(); // recarga para reiniciar textos y cálculos
    });
});

// cerrar menú si clic fuera
document.addEventListener("click",(e)=>{
    const menu = document.getElementById("langMenu");
    if(!langIcon.contains(e.target)) menu.style.display="none";
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