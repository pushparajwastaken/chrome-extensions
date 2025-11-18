function updateCountdown() {
  const now = new Date();
  const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);

  const diff = endOfYear - now;

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  const text = `${days}d ${hours}h ${minutes}m ${seconds}s`;

  document.getElementById("countdown").textContent = text;
  requestAnimationFrame(updateCountdown);
}

requestAnimationFrame(updateCountdown);
