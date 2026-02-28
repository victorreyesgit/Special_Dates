const dateInput = document.getElementById("dateInput");
const result = document.getElementById("result");
const shareModal = document.getElementById("shareModal");
const shareMessage = document.getElementById("shareMessage");
const shareLink = document.getElementById("shareLink");
const copyBtn = document.getElementById("copyBtn");
const basePageLink = "https://victorreyesgit.github.io/Special_Dates/";

// ------------------------
// 1. Generar milestones
// ------------------------
function generateMilestones() {
    let set = new Set();
    for (let i = 10; i <= 999999; i++) {
        const str = i.toString();
        if (i % 1000 === 0) set.add(i);
        if (/^(\d)\1+$/.test(str) && str[0]!=="9") set.add(i);
        if (str.length >=3 && "123456789".includes(str)) set.add(i);
    }
    return Array.from(set).sort((a,b)=>a-b);
}
const milestones = generateMilestones();

// ------------------------
// 2. Confetti
// ------------------------
function launchConfetti() {
    for (let i = 0; i < 80; i++) {
        const conf = document.createElement("div");
        conf.className = "confetti";
        conf.style.left = Math.random()*100+"vw";
        conf.style.backgroundColor = `hsl(${Math.random()*360},100%,50%)`;
        conf.style.animationDuration = (Math.random()*3+2)+"s";
        document.body.appendChild(conf);
        setTimeout(()=>conf.remove(),5000);
    }
}

// ------------------------
// 3. Modal
// ------------------------
function openModal(days,date) {
    const url = `${basePageLink}?date=${date.toISOString().slice(0,10)}`;
    shareMessage.textContent = `I will reach ${days.toLocaleString()} days on ${formatDateDDMMYYYY(date)}`;
    shareLink.value = url;
    shareModal.style.display = "flex";
}
function closeModal(){ shareModal.style.display="none"; }
copyBtn.addEventListener("click",()=>navigator.clipboard.writeText(shareMessage.textContent+"\n"+shareLink.value));

// ------------------------
// 4. Formateo de fecha dd/mm/yyyy
// ------------------------
function formatDateDDMMYYYY(date) {
    const day = String(date.getDate()).padStart(2,'0');
    const month = String(date.getMonth()+1).padStart(2,'0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

// ------------------------
// 5. Calcular y mostrar resultados
// ------------------------
function calculateAndShow(dateObj, showConfetti=true){
    const today = new Date();
    result.innerHTML="";

    let futureMilestones=[];
    milestones.forEach(days=>{
        const futureDate=new Date(dateObj);
        futureDate.setDate(dateObj.getDate()+days);
        if(futureDate>today) futureMilestones.push({days,date:futureDate});
    });

    futureMilestones.sort((a,b)=>a.date-b.date);
    if(futureMilestones.length===0){ result.textContent="No upcoming special days found."; return; }

    const first=futureMilestones[0];
    const nextTen=futureMilestones.slice(1,11);
    const daysUntilFirst=Math.ceil((first.date-today)/(1000*60*60*24));

    result.innerHTML+=`
        <div class="celebration">Time to celebrate</div>
        <div class="big-day" onclick="openModal(${first.days}, new Date('${first.date.toISOString()}'))">
            ${first.days.toLocaleString()} days
        </div>
        <div class="date">${formatDateDDMMYYYY(first.date)} • in ${daysUntilFirst} days</div>
    `;

    if(nextTen.length>0){
        result.innerHTML+=`<div class="section-title">Upcoming special dates</div>`;
        nextTen.forEach(item=>{
            const d=Math.ceil((item.date-today)/(1000*60*60*24));
            result.innerHTML+=`
                <div class="item" onclick="openModal(${item.days}, new Date('${item.date.toISOString()}'))">
                    ${item.days.toLocaleString()} days → ${formatDateDDMMYYYY(item.date)} (in ${d} days)
                </div>
            `;
        });
    }

    if(showConfetti) launchConfetti();
}

// ------------------------
// 6. Input con máscara dd/mm/yyyy
// ------------------------
dateInput.addEventListener("input", (e) => {
    let value = e.target.value.replace(/\D/g,""); // solo números
    if(value.length > 8) value = value.slice(0,8);

    // Insertar barras automáticamente
    let formatted = "";
    if(value.length <=2) formatted = value;
    else if(value.length <=4) formatted = value.slice(0,2)+"/"+value.slice(2);
    else formatted = value.slice(0,2)+"/"+value.slice(2,4)+"/"+value.slice(4);

    e.target.value = formatted;

    // Ejecutar solo si ya hay 10 caracteres (dd/mm/yyyy completo)
    if(formatted.length === 10){
        const parts = formatted.split("/");
        const day = parseInt(parts[0],10);
        const month = parseInt(parts[1],10);
        const year = parseInt(parts[2],10);
        const dateObj = new Date(year, month-1, day);
        if(!isNaN(dateObj)) calculateAndShow(dateObj,true);
    }
});

// ------------------------
// 7. Autocompletar desde URL
// ------------------------
window.addEventListener("DOMContentLoaded",()=>{
    const urlDate=new URLSearchParams(window.location.search).get("date");
    if(urlDate){
        const d = new Date(urlDate);
        const formatted = formatDateDDMMYYYY(d);
        dateInput.value = formatted;
    }
});