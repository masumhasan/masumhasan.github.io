const cities = [
  { name: "Dhaka", timeZone: "Asia/Dhaka", color: "#FDDDE6" },
  { name: "New York", timeZone: "America/New_York", color: "#9CC3E6" },
  { name: "Dubai", timeZone: "Asia/Dubai", color: "#B8E0D2" },
  { name: "Berlin", timeZone: "Europe/Berlin", color: "#C97C7C" },
];

function createClocks() {
  const wrapper = document.getElementById("clocks");
  wrapper.innerHTML = "";
  cities.forEach((city, i) => {
    const box = document.createElement("div");
    box.className = "clock-box";
    box.innerHTML = `
          <canvas id="clock${i}" class="clock-clockpage"></canvas>
          <div class="city">${city.name}</div>
          <div class="time" id="time${i}"></div>
        `;
    wrapper.appendChild(box);
  });
}

function drawClock(ctx, radius, h, m, s, ampm, color) {
  ctx.clearRect(0, 0, radius * 2, radius * 2);

  // background
  ctx.beginPath();
  ctx.arc(radius, radius, radius - 5, 0, 2 * Math.PI);
  ctx.fillStyle = color;
  ctx.fill();

  // ticks
  ctx.strokeStyle = "#333";
  ctx.lineWidth = Math.max(1, radius * 0.01);
  for (let i = 0; i < 12; i++) {
    let angle = (i * Math.PI) / 6;
    let x1 = radius + Math.cos(angle) * (radius - radius * 0.1);
    let y1 = radius + Math.sin(angle) * (radius - radius * 0.1);
    let x2 = radius + Math.cos(angle) * (radius - 5);
    let y2 = radius + Math.sin(angle) * (radius - 5);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  // hour hand
  let hourAngle = ((h % 12) * Math.PI) / 6 + (m * Math.PI) / 360;
  ctx.beginPath();
  ctx.moveTo(radius, radius);
  ctx.lineTo(
    radius + Math.cos(hourAngle - Math.PI / 2) * (radius * 0.5),
    radius + Math.sin(hourAngle - Math.PI / 2) * (radius * 0.5)
  );
  ctx.lineWidth = radius * 0.06;
  ctx.stroke();

  // minute hand
  let minAngle = (m * Math.PI) / 30 + (s * Math.PI) / 1800;
  ctx.beginPath();
  ctx.moveTo(radius, radius);
  ctx.lineTo(
    radius + Math.cos(minAngle - Math.PI / 2) * (radius * 0.7),
    radius + Math.sin(minAngle - Math.PI / 2) * (radius * 0.7)
  );
  ctx.lineWidth = radius * 0.04;
  ctx.stroke();

  // second hand
  let secAngle = (s * Math.PI) / 30;
  ctx.beginPath();
  ctx.moveTo(radius, radius);
  ctx.lineTo(
    radius + Math.cos(secAngle - Math.PI / 2) * (radius * 0.8),
    radius + Math.sin(secAngle - Math.PI / 2) * (radius * 0.8)
  );
  ctx.strokeStyle = "#222";
  ctx.lineWidth = radius * 0.02;
  ctx.stroke();

  // AM/PM inside clock (20% from top)
  ctx.fillStyle = "#222";
  ctx.font = `bold ${radius * 0.15}px Arial`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(ampm, radius, radius * 1.5);
}
function updateClocks() {
  cities.forEach((city, i) => {
    const clockpage = document.getElementById(`clock${i}`);
    const size = clockpage.offsetWidth;

    const ratio = window.devicePixelRatio;
    clockpage.width = size * ratio;
    clockpage.height = size * ratio;

    const ctx = clockpage.getContext("2d");
    ctx.scale(ratio, ratio);

    const radius = size / 2;

    const now = new Date();
    const local = new Date(
      now.toLocaleString("en-US", { timeZone: city.timeZone })
    );

    let h = local.getHours();
    let m = local.getMinutes();
    let s = local.getSeconds();

    const ampm = h >= 12 ? "PM" : "AM";

    drawClock(ctx, radius, h, m, s, ampm, city.color);

    document.getElementById(`time${i}`).textContent =
      local.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }) +
      " " +
      ampm;
  });
}

createClocks();
setInterval(updateClocks, 1000);
updateClocks();
window.addEventListener("resize", updateClocks);
