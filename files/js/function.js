const cities = {
  Dhaka: "Asia/Dhaka",
  NewYork: "America/New_York",
  London: "Europe/London",
  Dubai: "Asia/Dubai",
  Berlin: "Europe/Berlin",
};

function drawClock(city, tz) {
  const canvas = document.getElementById(city);
  const ctx = canvas.getContext("2d");
  const size = (canvas.width = canvas.offsetWidth);
  canvas.height = size;
  const radius = size / 2;

  ctx.clearRect(0, 0, size, size);
  ctx.translate(radius, radius);

  // draw circle
  ctx.beginPath();
  ctx.arc(0, 0, radius - 5, 0, 2 * Math.PI);
  ctx.fillStyle = "white";
  ctx.fill();
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 3;
  ctx.stroke();

  // get time
  let now = new Date();
  let time = new Date(now.toLocaleString("en-US", { timeZone: tz }));

  let sec = time.getSeconds();
  let min = time.getMinutes();
  let hr = time.getHours();

  // draw numbers
  ctx.font = `${radius * 0.15}px Arial`;
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";
  for (let num = 1; num <= 12; num++) {
    let ang = (num * Math.PI) / 6;
    ctx.rotate(ang);
    ctx.translate(0, -radius * 0.85);
    ctx.rotate(-ang);
    ctx.fillText(num.toString(), 0, 0);
    ctx.rotate(ang);
    ctx.translate(0, radius * 0.85);
    ctx.rotate(-ang);
  }

  // draw hands
  function drawHand(pos, length, width, color = "black") {
    ctx.beginPath();
    ctx.lineWidth = width;
    ctx.lineCap = "round";
    ctx.strokeStyle = color;
    ctx.moveTo(0, 0);
    ctx.rotate(pos);
    ctx.lineTo(0, -length);
    ctx.stroke();
    ctx.rotate(-pos);
  }

  // hour hand
  let hourPos = ((hr % 12) * Math.PI) / 6 + (min * Math.PI) / (6 * 60);
  drawHand(hourPos, radius * 0.5, 5);

  // minute hand
  let minPos = (min * Math.PI) / 30 + (sec * Math.PI) / (30 * 60);
  drawHand(minPos, radius * 0.7, 3);

  // second hand
  let secPos = (sec * Math.PI) / 30;
  drawHand(secPos, radius * 0.8, 2, "red");

  ctx.translate(-radius, -radius);
}

function updateClocks() {
  for (let city in cities) {
    drawClock(city, cities[city]);
  }
}

setInterval(updateClocks, 1000);
updateClocks();
