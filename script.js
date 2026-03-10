const STORAGE_KEY = "fullmoon.pocketplanner.projecttimeline";
const TITLE_KEY = "fullmoon.pocketplanner.projecttimeline.title";
const pageTitle = document.getElementById("pageTitle");

/* load saved title */
const savedTitle = localStorage.getItem(TITLE_KEY);
if (savedTitle) {
  pageTitle.textContent = savedTitle;
}

/* save on edit */
pageTitle.addEventListener("input", () => {
  localStorage.setItem(TITLE_KEY, pageTitle.textContent.trim());
});

pageTitle.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    pageTitle.blur();
  }
});


function loadData() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {
    projects: Array(10).fill(""),
    done: {}
  };
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}



document.addEventListener("DOMContentLoaded", () => {
  let data = loadData();
  const DAY_BUFFER = 31;
  let startDate = new Date();

  const monthRow = document.getElementById("month-row");
  const dayRow = document.getElementById("day-row");
  const dateRow = document.getElementById("date-row");
  const body = document.getElementById("timeline-body");
  const yearLabel = document.querySelector(".year-label");
  const todayBtn = document.getElementById("todayBtn");

  const leftBtn = document.querySelector(".nav.left");
  const rightBtn = document.querySelector(".nav.right");

  function render() {
    yearLabel.textContent = startDate.getFullYear();

    monthRow.innerHTML = `
      <th rowspan="3" class="fixed num">#</th>
      <th rowspan="3" class="fixed title">Project</th>
    `;
    dayRow.innerHTML = "";
    dateRow.innerHTML = "";


    const today = new Date();
    today.setHours(0, 0, 0, 0);



    let currentMonth = "";
    let monthSpan = 0;
    let monthStartIndex = 0;

    for (let i = 0; i < DAY_BUFFER; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      d.setHours(0, 0, 0, 0);

      const day = d.toLocaleDateString("en-US", { weekday: "short" });
      const month = d.toLocaleDateString("en-US", { month: "long" });

      let dateClass = day.toLowerCase();
      if (d < today) dateClass += " past";
      if (d.getTime() === today.getTime()) dateClass += " today";

      dayRow.innerHTML += `<th class="${dateClass}">${day}</th>`;
      dateRow.innerHTML += `<th class="${dateClass}">${d.getDate()}</th>`;

      if (month !== currentMonth) {
        if (currentMonth) {
          monthRow.children[monthStartIndex].colSpan = monthSpan;
        }
        currentMonth = month;
        monthSpan = 1;
        monthStartIndex = monthRow.children.length;
        monthRow.innerHTML += `<th>${month}</th>`;
      } else {
        monthSpan++;
      }
    }

    if (monthRow.children.length) {
      monthRow.children[monthStartIndex].colSpan = monthSpan;
    }

    body.innerHTML = "";

    for (let row = 1; row <= 10; row++) {
      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td class="fixed num">${row}</td>
        <td class="fixed project"></td>
      `;

      // ✅ Project input (per row)
      const input = document.createElement("input");
      input.type = "text";
      input.placeholder = "Project Title";
      input.className = "project-input";
      input.value = data.projects[row - 1];

      input.oninput = () => {
        data.projects[row - 1] = input.value;
        saveData(data);
      };

      tr.querySelector(".project").appendChild(input);

      for (let i = 0; i < DAY_BUFFER; i++) {
        const cellDate = new Date(startDate);
        cellDate.setDate(cellDate.getDate() + i);
        cellDate.setHours(0, 0, 0, 0);

        const dateKey = cellDate.toISOString().split("T")[0];
        const key = `${row}-${dateKey}`;

        const td = document.createElement("td");
        td.className = "day-cell";

        if (cellDate < today) td.classList.add("past");
        else if (cellDate.getTime() === today.getTime()) td.classList.add("today");
        else td.classList.add("future");

        if (data.done[key]) td.classList.add("done");


        td.onclick = () => {
          td.classList.toggle("done");
          data.done[key] = td.classList.contains("done");
          saveData(data);
        };

        tr.appendChild(td);
      }

      body.appendChild(tr);
    }
  }
  let touchStartX = 0;
let touchEndX = 0;
const SWIPE_THRESHOLD = 50;

const swipeArea = document.querySelector(".timeline-wrapper");

if ("ontouchstart" in window && swipeArea) {
  swipeArea.addEventListener("touchstart", (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  swipeArea.addEventListener("touchend", (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  }, { passive: true });
}

function handleSwipe() {
  const diff = touchStartX - touchEndX;
  if (Math.abs(diff) < SWIPE_THRESHOLD) return;

  if (diff > 0) {
    startDate.setDate(startDate.getDate() + 1); // swipe left → next
  } else {
    startDate.setDate(startDate.getDate() - 1); // swipe right → previous
  }

  render();
}



  leftBtn.onclick = () => {
    startDate.setDate(startDate.getDate() - 1);
    render();
  };

  rightBtn.onclick = () => {
    startDate.setDate(startDate.getDate() + 1);
    render();
  };

  todayBtn.onclick = () => {
    startDate = new Date();     // reset to today
    startDate.setHours(0,0,0,0);
    render();
  };

  render();
  lucide.createIcons();

});

