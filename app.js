const exhibits = {
  1: {
    className: "exhibit-01",
    titleSvg: "./assets/exhibit-01-title.svg",
    titleWidth: "281px",
    titleLeft: "39px",
    titleTop: "129px",
    titleHeight: "auto",
    desc: "",
    descLeft: "46px",
    descTop: "240px",
    descWidth: "220px",
    background: "linear-gradient(180deg,#f4f0ef 0%,#f2e3ea 100%)",
    video: "./assets/exhibit-01.mp4"
  },
  2: {
    className: "exhibit-02",
    titleSvg: "./assets/exhibit-02-title.svg",
    titleWidth: "281px",
    titleLeft: "39px",
    titleTop: "129px",
    titleHeight: "auto",
    desc: "",
    descLeft: "46px",
    descTop: "240px",
    descWidth: "220px",
    descColor: "rgba(255, 255, 255, 0.92)",
    background: "linear-gradient(180deg,#36557a 0%,#87a5c8 100%)",
    video: "./assets/exhibit-02.mp4"
  },
  3: {
    className: "exhibit-03",
    titleSvg: "./assets/exhibit-03-title.svg",
    titleWidth: "270px",
    titleLeft: "39px",
    titleTop: "129px",
    titleHeight: "auto",
    desc: "",
    descColor: "rgba(216, 228, 241, 0.94)",
    descLeft: "45px",
    descTop: "238px",
    descWidth: "257px",
    background: "linear-gradient(180deg,#36557a 0%,#87a5c8 100%)",
    video: "./assets/exhibit-03.mp4"
  },
  4: {
    className: "exhibit-04",
    titleSvg: "./assets/exhibit-04-title.svg",
    titleWidth: "285.4px",
    titleLeft: "39px",
    titleTop: "129px",
    titleHeight: "auto",
    desc: "",
    descLeft: "46px",
    descTop: "240px",
    descWidth: "220px",
    background: "linear-gradient(180deg,#2c3042 0%,#1f2233 100%)",
    video: "./assets/exhibit-04.mp4"
  },
  5: {
    className: "exhibit-05",
    titleSvg: "./assets/exhibit-05-title.svg",
    titleWidth: "318px",
    titleLeft: "39px",
    titleTop: "129px",
    titleHeight: "auto",
    desc: "",
    descLeft: "46px",
    descTop: "240px",
    descWidth: "220px",
    background: "linear-gradient(180deg,#e4e4e2 0%,#f1efed 100%)",
    video: "./assets/exhibit-05.mp4"
  }
};

const homePage = document.getElementById("homePage");
const exhibitPage = document.getElementById("exhibitPage");
const homeScroll = document.getElementById("homeScroll");
const group17 = document.getElementById("group17");
const group19 = document.getElementById("group19");
const stoneObject = document.getElementById("stoneObject");

const GROUP17_GAP_FROM_GROUP19 = 192;
const GROUP17_STICKY_TOP = 80;
const exhibitRoot = document.getElementById("exhibitRoot");
const contentTrack = document.getElementById("contentTrack");
let panelCurrent = document.getElementById("panelCurrent");
let panelNext = document.getElementById("panelNext");

const panelARefs = {
  titleImg: document.getElementById("exhibitTitleImg"),
  desc: document.getElementById("exhibitDesc"),
  video: document.getElementById("exhibitVideo")
};
const panelBRefs = {
  titleImg: document.getElementById("exhibitTitleImgNext"),
  desc: document.getElementById("exhibitDescNext"),
  video: document.getElementById("exhibitVideoNext")
};

let currentPanelRefs = panelARefs;
let nextPanelRefs = panelBRefs;
const backHome = document.getElementById("backHome");
const leftBtn = document.getElementById("leftBtn");
const rightBtn = document.getElementById("rightBtn");


const homeDragZone = document.getElementById("homeDragZone");
const heartPuzzle = document.getElementById("heartPuzzle");
const heartSlots = Array.from(document.querySelectorAll(".heart-slot"));
const dragPieces = Array.from(document.querySelectorAll(".drag-object[data-piece]"));
const artboardOverlay = document.getElementById("artboardOverlay");
const artboardPanel = document.getElementById("artboardPanel");
const artboardCanvas = document.getElementById("artboardCanvas");
const clearBoardBtn = document.getElementById("clearBoardBtn");
const sendBoardBtn = document.getElementById("sendBoardBtn");
const particleHeartLayer = document.getElementById("particleHeartLayer");
const particleHeartCanvas = document.getElementById("particleHeartCanvas");

let currentExhibit = 1;
let holdTimer = null;
let isHoldingPlay = false;
let group17OriginTop = 0;
let placedPieces = new Set();
let isDrawing = false;
let heartParticles = [];
let heartAnimFrame = null;
let dragState = null;
let isExhibitSliding = false;
let slideTimer = null;
const exhibitClassNames = Object.values(exhibits).map((item) => item.className);

function showHome() {
  stopHoldPlay();
  exhibitVideo.pause();
  homePage.classList.add("active");
  exhibitPage.classList.remove("active");
}

function initializeGroup17Origin() {
  const group19Top = group19.offsetTop;
  group17OriginTop = group19Top + GROUP17_GAP_FROM_GROUP19;
  group17.style.top = `${group17OriginTop}px`;
}

function showExhibit() {
  homePage.classList.remove("active");
  exhibitPage.classList.add("active");
  exhibitPage.classList.remove("reveal");
  void exhibitPage.offsetWidth;
  exhibitPage.classList.add("reveal");
}

function prevIndex(index) {
  return index === 1 ? 5 : index - 1;
}

function nextIndex(index) {
  return index === 5 ? 1 : index + 1;
}

function applyExhibitDataToPanel(data, target) {
  target.titleImg.src = data.titleSvg;
  target.titleImg.style.width = data.titleWidth;
  target.titleImg.style.left = data.titleLeft || "39px";
  target.titleImg.style.top = data.titleTop || "129px";
  target.titleImg.style.height = data.titleHeight || "auto";

  target.desc.textContent = data.desc || "";
  target.desc.style.color = data.descColor || "rgba(255, 255, 255, 0.92)";
  target.desc.style.width = data.descWidth || "220px";
  target.desc.style.left = data.descLeft || "46px";
  target.desc.style.top = data.descTop || "240px";

  target.video.pause();
  target.video.currentTime = 0;
  target.video.src = data.video;
  target.video.loop = false;
}

function renderExhibit(index, direction = 0) {
  const data = exhibits[index];

  if (direction === 0) {
    currentExhibit = index;
    exhibitRoot.classList.remove(...exhibitClassNames);
    exhibitRoot.classList.add(data.className);
    exhibitRoot.style.background = data.background;
    applyExhibitDataToPanel(data, currentPanelRefs);
    stopHoldPlay();
    return;
  }

  if (isExhibitSliding) return;
  isExhibitSliding = true;

  if (slideTimer) {
    clearTimeout(slideTimer);
    slideTimer = null;
  }

  const nextData = data;
  const slideClass = direction > 0 ? "slide-next" : "slide-prev";

  applyExhibitDataToPanel(nextData, nextPanelRefs);

  exhibitRoot.classList.remove(...exhibitClassNames);
  exhibitRoot.classList.add(nextData.className);
  exhibitRoot.style.background = nextData.background;

  contentTrack.classList.add("no-anim");
  contentTrack.classList.remove("slide-next", "slide-prev", "prep-prev");
  if (direction < 0) contentTrack.classList.add("prep-prev");

  requestAnimationFrame(() => {
    contentTrack.classList.remove("no-anim");
    contentTrack.classList.add(slideClass);

    slideTimer = setTimeout(() => {
      contentTrack.classList.add("no-anim");
      contentTrack.classList.remove("slide-next", "slide-prev", "prep-prev");

      const oldCurrentPanel = panelCurrent;
      panelCurrent = panelNext;
      panelNext = oldCurrentPanel;

      const oldCurrentRefs = currentPanelRefs;
      currentPanelRefs = nextPanelRefs;
      nextPanelRefs = oldCurrentRefs;

      panelCurrent.classList.remove("next");
      panelCurrent.classList.add("current");
      panelNext.classList.remove("current");
      panelNext.classList.add("next");

      requestAnimationFrame(() => {
        contentTrack.classList.remove("no-anim");
      });

      currentExhibit = index;
      isExhibitSliding = false;
      slideTimer = null;
    }, 260);
  });

  stopHoldPlay();
}

function updateGroup17State() {
  const stoneRect = stoneObject.getBoundingClientRect();
  const scrollRect = homeScroll.getBoundingClientRect();
  const scrollTop = homeScroll.scrollTop;

  const group17ViewportTop = group17OriginTop - scrollTop;
  const shouldStick = group17ViewportTop <= GROUP17_STICKY_TOP;
  const isStoneOutOfView = stoneRect.bottom <= scrollRect.top;

  if (isStoneOutOfView) {
    group17.classList.remove("stuck");
    group17.style.opacity = "0";
    return;
  }

  group17.style.opacity = "1";

  if (shouldStick) {
    group17.classList.add("stuck");
    group17.style.top = `${GROUP17_STICKY_TOP}px`;
    group17.style.left = "50%";
    group17.style.transform = "translateX(-50%)";
  } else {
    group17.classList.remove("stuck");
    group17.style.top = `${group17OriginTop}px`;
    group17.style.left = "50%";
    group17.style.transform = "translateX(-50%)";
  }
}

function getActiveExhibitVideo() {
  return currentPanelRefs.video;
}

function stopHoldPlay() {
  if (holdTimer) {
    clearTimeout(holdTimer);
    holdTimer = null;
  }
  if (isHoldingPlay) {
    getActiveExhibitVideo().pause();
    isHoldingPlay = false;
  }
}

function updateHeartPuzzleVisibility() {
  const zoneRect = homeDragZone.getBoundingClientRect();
  const scrollRect = homeScroll.getBoundingClientRect();
  const fullyVisible = zoneRect.top >= scrollRect.top && zoneRect.bottom <= scrollRect.bottom;
  heartPuzzle.classList.toggle("visible", fullyVisible);
}

function burstParticlesAt(x, y) {
  for (let i = 0; i < 12; i += 1) {
    const p = document.createElement("span");
    p.className = "piece-particle";
    p.style.left = `${x}px`;
    p.style.top = `${y}px`;
    p.style.setProperty("--dx", `${(Math.random() - 0.5) * 84}px`);
    p.style.setProperty("--dy", `${(Math.random() - 0.5) * 84}px`);
    homeDragZone.appendChild(p);
    setTimeout(() => p.remove(), 620);
  }
}

function checkPuzzleCompletion() {
  if (placedPieces.size < 5) return;
  heartPuzzle.classList.add("complete");
  setTimeout(() => {
    artboardOverlay.classList.add("open");
    artboardOverlay.setAttribute("aria-hidden", "false");
  }, 360);
}

function completePieceToSlot(pieceId, slotEl) {
  if (!pieceId || !slotEl || slotEl.dataset.slot !== pieceId || placedPieces.has(pieceId)) return false;

  placedPieces.add(pieceId);
  slotEl.classList.add("filled");

  const pieceEl = dragPieces.find((p) => p.dataset.piece === pieceId);
  if (pieceEl) pieceEl.classList.add("placed");

  const slotRect = slotEl.getBoundingClientRect();
  const zoneRect = homeDragZone.getBoundingClientRect();
  burstParticlesAt(slotRect.left - zoneRect.left + slotRect.width / 2, slotRect.top - zoneRect.top + slotRect.height / 2);
  checkPuzzleCompletion();
  return true;
}

function findSlotAtClientPoint(clientX, clientY) {
  return heartSlots.find((slot) => {
    const r = slot.getBoundingClientRect();
    return clientX >= r.left && clientX <= r.right && clientY >= r.top && clientY <= r.bottom;
  }) || null;
}

function setupDragPieces() {
  dragPieces.forEach((piece) => {
    piece.setAttribute("draggable", "true");

    piece.addEventListener("dragstart", (event) => {
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", piece.dataset.piece || "");
    });

    piece.addEventListener("pointerdown", (event) => {
      if (placedPieces.has(piece.dataset.piece || "")) return;
      const rect = piece.getBoundingClientRect();
      dragState = {
        piece,
        id: piece.dataset.piece || "",
        offsetX: event.clientX - rect.left,
        offsetY: event.clientY - rect.top,
        originalLeft: piece.style.left,
        originalTop: piece.style.top
      };
      piece.classList.add("dragging");
      piece.setPointerCapture(event.pointerId);
      event.preventDefault();
    });

    piece.addEventListener("pointermove", (event) => {
      if (!dragState || dragState.piece !== piece) return;
      const zoneRect = homeDragZone.getBoundingClientRect();
      piece.style.left = `${event.clientX - zoneRect.left - dragState.offsetX}px`;
      piece.style.top = `${event.clientY - zoneRect.top - dragState.offsetY}px`;
      piece.style.zIndex = "30";
    });

    piece.addEventListener("pointerup", (event) => {
      if (!dragState || dragState.piece !== piece) return;
      const slot = findSlotAtClientPoint(event.clientX, event.clientY);
      const ok = completePieceToSlot(dragState.id, slot);
      piece.classList.remove("dragging");
      piece.style.zIndex = "";
      if (!ok) {
        piece.style.left = "";
        piece.style.top = "";
      }
      dragState = null;
    });

    piece.addEventListener("pointercancel", () => {
      if (!dragState || dragState.piece !== piece) return;
      piece.classList.remove("dragging");
      piece.style.left = "";
      piece.style.top = "";
      piece.style.zIndex = "";
      dragState = null;
    });
  });

  heartSlots.forEach((slot) => {
    slot.addEventListener("dragover", (event) => event.preventDefault());
    slot.addEventListener("drop", (event) => {
      event.preventDefault();
      const pieceId = event.dataTransfer.getData("text/plain");
      completePieceToSlot(pieceId, slot);
    });
  });
}

function setupArtboardDrawing() {
  const ctx = artboardCanvas.getContext("2d");
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = "rgba(255,255,255,0.96)";
  ctx.lineWidth = 2;
  ctx.shadowColor = "rgba(255,255,255,0.55)";
  ctx.shadowBlur = 8;

  const getPoint = (event) => {
    const rect = artboardCanvas.getBoundingClientRect();
    const touch = event.touches ? event.touches[0] : event;
    return { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
  };

  const start = (event) => {
    isDrawing = true;
    const p = getPoint(event);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
  };

  const draw = (event) => {
    if (!isDrawing) return;
    event.preventDefault();
    const p = getPoint(event);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
  };

  const end = () => {
    isDrawing = false;
    ctx.closePath();
  };

  artboardCanvas.addEventListener("mousedown", start);
  artboardCanvas.addEventListener("mousemove", draw);
  window.addEventListener("mouseup", end);

  artboardCanvas.addEventListener("touchstart", start, { passive: false });
  artboardCanvas.addEventListener("touchmove", draw, { passive: false });
  artboardCanvas.addEventListener("touchend", end);

  clearBoardBtn.addEventListener("click", () => ctx.clearRect(0, 0, artboardCanvas.width, artboardCanvas.height));
}

function startParticleHeart() {
  artboardOverlay.classList.remove("open");
  particleHeartLayer.classList.add("open");

  const canvas = particleHeartCanvas;
  const ctx = canvas.getContext("2d");
  const w = canvas.width;
  const h = canvas.height;
  const cx = w / 2;
  const cy = h / 2;

  heartParticles = Array.from({ length: 320 }, (_, i) => {
    const t = (Math.PI * 2 * i) / 320;
    const x = 16 * Math.sin(t) ** 3;
    const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
    return {
      tx: cx + x * 6,
      ty: cy + y * 6,
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 2 + 1,
      color: ["rgba(255,255,255,0.9)", "rgba(255,170,156,0.85)", "rgba(255,255,255,0.45)"][i % 3]
    };
  });

  const animate = () => {
    ctx.clearRect(0, 0, w, h);
    const pulse = 1 + Math.sin(Date.now() / 420) * 0.04;

    heartParticles.forEach((p) => {
      p.x += (p.tx - p.x) * 0.04 + (Math.random() - 0.5) * 0.25;
      p.y += (p.ty - p.y) * 0.04 + (Math.random() - 0.5) * 0.25;

      ctx.beginPath();
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 10;
      ctx.arc(cx + (p.x - cx) * pulse, cy + (p.y - cy) * pulse, p.r, 0, Math.PI * 2);
      ctx.fill();
    });

    heartAnimFrame = requestAnimationFrame(animate);
  };

  animate();
}

function stopParticleHeart() {
  if (heartAnimFrame) {
    cancelAnimationFrame(heartAnimFrame);
    heartAnimFrame = null;
  }
  particleHeartLayer.classList.remove("open");
}

function setupOverlays() {
  artboardOverlay.addEventListener("click", (event) => {
    if (event.target === artboardOverlay) artboardOverlay.classList.remove("open");
  });

  sendBoardBtn.addEventListener("click", (event) => {
    event.stopPropagation();
    startParticleHeart();
  });

  const closeParticleHeart = () => {
    if (!particleHeartLayer.classList.contains("open")) return;
    stopParticleHeart();
  };

  particleHeartLayer.addEventListener("click", closeParticleHeart);
  particleHeartCanvas.addEventListener("click", closeParticleHeart);
}

function startHoldPlay(event) {
  if (event && event.type === "pointerdown" && event.pointerType === "mouse" && event.button !== 0) return;
  if (holdTimer) {
    clearTimeout(holdTimer);
  }
  holdTimer = setTimeout(() => {
    isHoldingPlay = true;
    getActiveExhibitVideo().play().catch(() => {});
  }, 220);
}

document.querySelectorAll(".home-object").forEach((button) => {
  button.addEventListener("click", () => {
    const target = button;
    target.classList.add("focus-enter");
    renderExhibit(Number(button.dataset.exhibit));
    setTimeout(() => {
      showExhibit();
      target.classList.remove("focus-enter");
    }, 260);
  });
});

backHome.addEventListener("click", showHome);
leftBtn.addEventListener("click", () => renderExhibit(prevIndex(currentExhibit), -1));
rightBtn.addEventListener("click", () => renderExhibit(nextIndex(currentExhibit), 1));

homeScroll.addEventListener("scroll", () => {
  updateGroup17State();
  updateHeartPuzzleVisibility();
});
window.addEventListener("resize", () => {
  initializeGroup17Origin();
  updateGroup17State();
  updateHeartPuzzleVisibility();
});

const bindHoldEventsToVideo = (videoEl) => {
  videoEl.addEventListener("pointerdown", startHoldPlay);
  ["pointerup", "pointercancel", "pointerleave", "lostpointercapture"].forEach((eventName) => {
    videoEl.addEventListener(eventName, stopHoldPlay);
  });
  videoEl.addEventListener("ended", () => {
    isHoldingPlay = false;
  });
};

bindHoldEventsToVideo(exhibitVideo);
bindHoldEventsToVideo(exhibitVideoNext);
window.addEventListener("pointerup", stopHoldPlay);
window.addEventListener("blur", stopHoldPlay);

setupDragPieces();
setupArtboardDrawing();
setupOverlays();
initializeGroup17Origin();
updateGroup17State();
updateHeartPuzzleVisibility();
showHome();
