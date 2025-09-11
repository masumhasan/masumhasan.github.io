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

  // background circle
  ctx.beginPath();
  ctx.arc(radius, radius, radius - 5, 0, 2 * Math.PI);
  ctx.fillStyle = color;
  ctx.fill();

  // numbers 12, 3, 6, 9
  ctx.fillStyle = "#222";
  ctx.font = `bold ${radius * 0.2}px Arial`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  ctx.fillText("12", radius, radius * 0.25);
  ctx.fillText("3", radius * 1.75, radius);
  ctx.fillText("6", radius, radius * 1.75);
  ctx.fillText("9", radius * 0.25, radius);

  // hour hand
  let hourAngle = ((h % 12) * Math.PI) / 6 + (m * Math.PI) / 360;
  ctx.beginPath();
  ctx.moveTo(radius, radius);
  ctx.lineTo(
    radius + Math.cos(hourAngle - Math.PI / 2) * (radius * 0.5),
    radius + Math.sin(hourAngle - Math.PI / 2) * (radius * 0.5)
  );
  ctx.lineWidth = radius * 0.06;
  ctx.strokeStyle = "#333";
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
  ctx.strokeStyle = "#333";
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

  // center dot
  ctx.beginPath();
  ctx.arc(radius, radius, radius * 0.04, 0, 2 * Math.PI);
  ctx.fillStyle = "#222";
  ctx.fill();
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

    document.getElementById(`time${i}`).textContent = local.toLocaleTimeString(
      [],
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  });
}

createClocks();
setInterval(updateClocks, 1000);
updateClocks();
window.addEventListener("resize", updateClocks);

//  Author: Masum Hasan
// GitHub: https://github.com/masumhasan
//  File: canvas.html
// Description: Tech logos floating animation for personal website.

//Canvas Logos Animation

// Randomize position, delay, and speed for each tech logo
document.addEventListener("DOMContentLoaded", function () {
  const pictures = document.querySelectorAll("tech-logo");
  pictures.forEach(function (pic) {
    const left = Math.floor(Math.random() * 96);
    const bottom = Math.floor(Math.random() * 81);
    // Start animation at -10s
    const delay = (Math.random() * 10 - 10).toFixed(2); // -10s to 0s
    const duration = (6 + Math.random() * 8).toFixed(2);
    pic.style.left = left + "%";
    pic.style.bottom = bottom + "px";
    pic.style.animationDelay = delay + "s";
    pic.style.animationDuration = duration + "s";
  });
});
