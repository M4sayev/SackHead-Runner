import kaplay from "kaplay";

const ctx = kaplay({ width: window.innerWidth, height: window.innerHeight });
ctx.setGravity(1000);

loadSound("backgroundMusic", "../assets/OST.mp4");

let bgMusic;
let musicPlaying = localStorage.getItem("music")
  ? JSON.parse(localStorage.getItem("music"))
  : true;

let gamePaused = false;

function toggleMusic() {
  if (!bgMusic) {
    bgMusic = play("backgroundMusic", { loop: true, volume: 0.5 });
    musicPlaying = true;
  } else if (musicPlaying) {
    bgMusic.stop();
    musicPlaying = false;
  } else {
    bgMusic = play("backgroundMusic", { loop: true, volume: 0.5 });
    musicPlaying = true;
  }
  localStorage.setItem("music", JSON.stringify(musicPlaying));
  updateMusicButton();
}

function togglePause() {
  gamePaused = !gamePaused;
  updatePauseButton();
}

const musicButton = document.createElement("button");
musicButton.style.position = "absolute";
musicButton.style.left = "20px";
musicButton.style.top = "100px";
musicButton.style.width = "50px";
musicButton.style.height = "50px";
musicButton.style.borderRadius = "50%";
musicButton.style.border = "2px solid #fff";
musicButton.style.fontSize = "24px";
musicButton.style.color = "#fff";
musicButton.style.backgroundColor = "#6464ff";
musicButton.style.cursor = "pointer";
musicButton.style.boxShadow = "0 4px 6px rgba(0,0,0,0.3)";
musicButton.style.transition = "all 0.2s";
musicButton.style.zIndex = 10;
musicButton.setAttribute("tabindex", "-1");
musicButton.addEventListener("mousedown", (e) => e.preventDefault());
document.body.appendChild(musicButton);

const pauseButton = document.createElement("button");
pauseButton.style.position = "absolute";
pauseButton.style.left = "80px";
pauseButton.style.top = "100px";
pauseButton.style.width = "50px";
pauseButton.style.height = "50px";
pauseButton.style.borderRadius = "50%";
pauseButton.style.border = "2px solid #fff";
pauseButton.style.fontSize = "24px";
pauseButton.style.color = "#fff";
pauseButton.style.backgroundColor = "#ff6464";
pauseButton.style.cursor = "pointer";
pauseButton.style.boxShadow = "0 4px 6px rgba(0,0,0,0.3)";
pauseButton.style.transition = "all 0.2s";
pauseButton.style.zIndex = 10;
pauseButton.setAttribute("tabindex", "-1");
pauseButton.addEventListener("mousedown", (e) => e.preventDefault());
document.body.appendChild(pauseButton);

function updateMusicButton() {
  musicButton.innerText = musicPlaying ? "♫" : "♫✕";
  musicButton.style.backgroundColor = musicPlaying ? "#6464ff" : "#963232";
}

function updatePauseButton() {
  pauseButton.innerText = gamePaused ? "▶" : "II";
  pauseButton.style.backgroundColor = gamePaused ? "#32a852" : "#ff6464";
}

musicButton.addEventListener("click", toggleMusic);
pauseButton.addEventListener("click", togglePause);

updateMusicButton();
updatePauseButton();

// Workaround browser audio restrictions
window.addEventListener("load", () => {
  bgMusic = play("backgroundMusic", { loop: true, volume: 0.0 });
  musicPlaying = true;
  updateMusicButton();

  setTimeout(() => {
    bgMusic.volume = 0.5;
  }, 500);
});

// Instructions Popup
let gameStarted = false;

const popup = document.createElement("div");
popup.style.position = "fixed";
popup.style.top = "0";
popup.style.left = "0";
popup.style.width = "100%";
popup.style.height = "100%";
popup.style.background = "rgba(0,0,0,0.8)";
popup.style.display = "flex";
popup.style.flexDirection = "column";
popup.style.justifyContent = "center";
popup.style.alignItems = "center";
popup.style.color = "#fff";
popup.style.fontSize = "20px";
popup.style.textAlign = "center";
popup.style.zIndex = 100;

const instructions = document.createElement("div");
instructions.innerHTML = `
  <h1 style="font-size:32px; margin-bottom:20px;">How to Play</h1>
  <p>⬅️ / A : Move Left</p>
  <p>➡️ / D : Move Right</p>
  <p>⬆️ / W / Space : Jump</p>
  <p>H : Throw Bottle to Kill Birds 🐦</p>
  <p>Avoid obstacles and survive as long as possible!</p>
`;

const startButton = document.createElement("button");
startButton.innerText = "Start Game";
startButton.style.marginTop = "30px";
startButton.style.padding = "10px 20px";
startButton.style.fontSize = "20px";
startButton.style.border = "none";
startButton.style.borderRadius = "10px";
startButton.style.backgroundColor = "#6464ff";
startButton.style.color = "#fff";
startButton.style.cursor = "pointer";
startButton.addEventListener("click", () => {
  popup.remove();
});

popup.appendChild(instructions);
popup.appendChild(startButton);
document.body.appendChild(popup);

startButton.addEventListener("click", () => {
  popup.remove();
  gameStarted = true;

  const canvas = document.querySelector("canvas");
  if (canvas) {
    canvas.setAttribute("tabindex", "0");
    canvas.focus();
  }
});

let WIDTH = ctx.width();
let HEIGHT = ctx.height();

window.addEventListener("resize", () => {
  WIDTH = window.innerWidth;
  HEIGHT = window.innerHeight;
  location.reload();
  ctx.setSize(WIDTH, HEIGHT);
});

ctx.loadSprite("bg", "../assets/bg-image.png");
ctx.loadSprite("player", "../assets/spritesheet-full.png", {
  sliceX: 10,
  sliceY: 5,
  anims: {
    idle: { from: 0, to: 9, loop: true, speed: 8 },
    jump: { from: 10, to: 19, speed: 30 },
    fall: { from: 20, to: 27, speed: 8 },
    walk: { from: 30, to: 39, loop: true, speed: 15 },
    hit: { from: 40, to: 49, speed: 25 },
  },
});
ctx.loadSprite("bird", "../assets/BirdSprite.png", {
  sliceX: 8,
  sliceY: 3,
  anims: {
    idle: { from: 0, to: 2, loop: true, speed: 8 },
    fly: { from: 8, to: 15, loop: true, speed: 8 },
  },
});
ctx.loadSprite("bottle", "../assets/bottle_sprite.png", {
  sliceX: 21,
  anims: {
    rotate: { from: 0, to: 20, loop: true, speed: 8 },
    fall: { from: 10, to: 20, speed: 10 },
  },
});
ctx.loadSprite("trashCan", "../assets/trash_can.png");

ctx.loadSprite("bucket", "../assets/bucket.png");

let score = 0;
let birdsKilled = 0;

ctx.scene("YOU LOSE", () => {
  ctx.add([ctx.rect(WIDTH, HEIGHT), ctx.color(20, 20, 30), ctx.pos(0, 0)]);
  ctx.add([
    ctx.text("YOU LOSE", {
      size: 96,
      font: "sink",
      transform: { style: "uppercase" },
    }),
    ctx.pos(WIDTH / 2, HEIGHT / 2 - 50),
    ctx.anchor("center"),
    ctx.color(255, 0, 0),
    ctx.outline(6, ctx.rgb(255, 255, 255)),
  ]);
  ctx.add([
    ctx.text(`Score: ${score}`, { size: 48 }),
    ctx.pos(WIDTH / 2, HEIGHT / 2 + 50),
    ctx.anchor("center"),
    ctx.color(255, 255, 255),
  ]);
  ctx.add([
    ctx.text(`Birds killed: ${birdsKilled}`, { size: 48 }),
    ctx.pos(WIDTH / 2, HEIGHT / 2 + 110),
    ctx.anchor("center"),
    ctx.color(255, 255, 255),
  ]);
  setTimeout(() => location.reload(), 5000);
});

ctx.onLoad(() => {
  const GROUND_HEIGHT = HEIGHT * 0.1;
  let canThrow = true;
  const THROW_COOLDOWN = 1000;

  const bg1 = ctx.add([
    ctx.sprite("bg"),
    ctx.pos(0, 0),
    ctx.scale(WIDTH / 1280, HEIGHT / 720),
    "bg",
  ]);
  const bg2 = ctx.add([
    ctx.sprite("bg"),
    ctx.pos(WIDTH, 0),
    ctx.scale(WIDTH / 1280, HEIGHT / 720),
    "bg",
  ]);

  ctx.add([
    ctx.rect(WIDTH, GROUND_HEIGHT),
    ctx.pos(0, HEIGHT - GROUND_HEIGHT),
    ctx.area(),
    ctx.body({ isStatic: true }),
    ctx.color(33, 39, 66),
  ]);

  const player = ctx.add([
    ctx.sprite("player", { anim: "idle" }),
    ctx.scale(5),
    ctx.pos(150, HEIGHT - GROUND_HEIGHT - 150),
    ctx.area({ scale: 0.6 }),
    ctx.body(),
    ctx.anchor("center"),
  ]);

  const scoreLabel = ctx.add([
    ctx.text("Score: 0", { size: 32 }),
    ctx.pos(20, 20),
  ]);
  const birdsKilledLabel = ctx.add([
    ctx.text("Birds killed: 0", { size: 32 }),
    ctx.pos(20, 60),
  ]);

  const obstacles = [];
  const birds = [];
  let OBSTACLE_SPEED = 20000;

  const obstacleTypes = [
    { sprite: "trashCan", scale: 3.5, offSet: 100 },
    { sprite: "bucket", scale: 1, offSet: 60 },
  ];

  function spawnObstacle() {
    if (!gameStarted) {
      setTimeout(spawnObstacle, 500);
      return;
    }
    if (gamePaused) {
      setTimeout(spawnObstacle, 500);
      return;
    }

    const type =
      obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
    const obstacle = ctx.add([
      ctx.sprite(type.sprite),
      ctx.pos(player.pos.x + WIDTH + 200, HEIGHT - GROUND_HEIGHT - type.offSet),
      ctx.scale(type.scale),
      ctx.area({ scale: 0.8 }),
      ctx.body({ isStatic: true }),
      "obstacle",
    ]);
    obstacles.push(obstacle);
    setTimeout(spawnObstacle, 1200 + Math.random() * 2000);
  }

  function spawnBird() {
    if (!gameStarted) {
      setTimeout(spawnBird, 1000);
      return;
    }
    if (gamePaused) {
      setTimeout(spawnBird, 1000);
      return;
    }

    const patternType = Math.floor(Math.random() * 3);
    const maxJumpHeight = HEIGHT * 0.4;
    const minY = HEIGHT - GROUND_HEIGHT - maxJumpHeight;
    const maxY = HEIGHT - GROUND_HEIGHT - 50;
    const birdY = minY + Math.random() * (maxY - minY);

    const bird = ctx.add([
      ctx.sprite("bird", { anim: "fly" }),
      ctx.pos(player.pos.x + WIDTH + 200, birdY),
      ctx.scale(6),
      ctx.area({ scale: 0.8, isSensor: true }),
      "bird",
    ]);
    birds.push(bird);

    let t = 0;
    const speed = 400 + Math.random() * 200;
    const amplitude = 50 + Math.random() * 70;

    bird.onUpdate(() => {
      if (gamePaused || !gameStarted) return;

      bird.move(-speed * ctx.dt(), 0);

      if (patternType === 1) {
        bird.pos.y += Math.sin(t * 5) * amplitude * ctx.dt();
      } else if (patternType === 2) {
        bird.pos.y += (t % 2 === 0 ? 1 : -1) * amplitude * ctx.dt();
      }
      t += ctx.dt();

      // remove if off-screen
      if (
        bird.pos.x + bird.width < player.pos.x - WIDTH / 2 ||
        bird.pos.y + bird.height < 0 ||
        bird.pos.y > HEIGHT
      ) {
        ctx.destroy(bird);
        const index = birds.indexOf(bird);
        if (index > -1) birds.splice(index, 1);
      }
    });

    setTimeout(spawnBird, 5000 + Math.random() * 3000);
  }

  spawnObstacle();
  spawnBird();

  let movingLeft = false;
  let movingRight = false;
  let isHitting = false;

  let PLAYER_SPEED = 25000;

  let lastAnim = "idle";

  ctx.onUpdate(() => {
    if (gamePaused || !gameStarted) return;

    score += 1;
    OBSTACLE_SPEED += 5;
    PLAYER_SPEED += 5;
    scoreLabel.text = `Score: ${score}`;

    let speed = 0;
    if (movingRight) speed = PLAYER_SPEED * ctx.dt();
    if (movingLeft) speed = -PLAYER_SPEED * ctx.dt();

    bg1.move(-speed, 0);
    bg2.move(-speed, 0);
    if (bg1.pos.x <= -WIDTH) bg1.pos.x = bg2.pos.x + WIDTH;
    if (bg2.pos.x <= -WIDTH) bg2.pos.x = bg1.pos.x + WIDTH;
    if (bg1.pos.x >= WIDTH) bg1.pos.x = bg2.pos.x - WIDTH;
    if (bg2.pos.x >= WIDTH) bg2.pos.x = bg1.pos.x - WIDTH;

    for (let i = obstacles.length - 1; i >= 0; i--) {
      const ob = obstacles[i];
      ob.move(-OBSTACLE_SPEED * ctx.dt() - speed, 0);
      if (ob.pos.x + ob.width < player.pos.x - WIDTH / 2) {
        ctx.destroy(ob);
        obstacles.splice(i, 1);
      }
    }

    for (let i = birds.length - 1; i >= 0; i--) {
      const bird = birds[i];
      bird.move(-OBSTACLE_SPEED * ctx.dt() - speed - 200, 0);
      if (bird.pos.x + bird.width < player.pos.x - WIDTH / 2) {
        ctx.destroy(bird);
        birds.splice(i, 1);
      }
    }

    if (isHitting) return;

    let nextAnim = lastAnim;

    if (!player.isGrounded()) {
      if (player.vel.y < 0) nextAnim = "jump";
      else nextAnim = "fall";
    } else {
      if (movingLeft || movingRight) nextAnim = "walk";
      else nextAnim = "idle";
    }

    if (nextAnim !== lastAnim) {
      player.play(nextAnim, true);
      lastAnim = nextAnim;
    }
  });

  player.onCollide("obstacle", () => ctx.go("YOU LOSE"));
  player.onCollide("bird", (b) => {
    if (isHitting) {
      ctx.destroy(b);
      const index = birds.indexOf(b);
      if (index > -1) birds.splice(index, 1);
      birdsKilled += 1;
      birdsKilledLabel.text = `Birds killed: ${birdsKilled}`;
    } else {
      ctx.go("YOU LOSE");
    }
  });

  ctx.onKeyDown(["left", "a"], () => {
    if (gamePaused || !gameStarted) return;
    movingLeft = true;
    player.flipX = true;
  });
  ctx.onKeyDown(["right", "d"], () => {
    if (gamePaused || !gameStarted) return;
    movingRight = true;
    player.flipX = false;
  });
  ctx.onKeyRelease(["left", "a"], () => {
    movingLeft = false;
  });
  ctx.onKeyRelease(["right", "d"], () => {
    movingRight = false;
  });

  ctx.onKeyPress(["space", "w"], () => {
    if (gamePaused || !gameStarted) return;
    if (player.isGrounded()) {
      player.jump();
      player.play("jump");
      setTimeout(() => player.play("fall"), 300);
    }
  });

  ctx.onKeyPress("h", () => {
    if (gamePaused || !gameStarted) return;
    if (!canThrow) return;
    isHitting = true;
    player.play("hit", true);
    throwBottle();
    canThrow = false;
    setTimeout(() => {
      canThrow = true;
    }, THROW_COOLDOWN);
    setTimeout(() => {
      isHitting = false;
    }, 500);
  });

  function throwBottle() {
    const bottle = ctx.add([
      ctx.sprite("bottle", { anim: "rotate" }),
      ctx.pos(player.pos.x, player.pos.y - 50),
      ctx.scale(6),
      ctx.area({ scale: 0.7, isSensor: true }),
      ctx.anchor("center"),
      "bottle",
    ]);
    const direction = player.flipX ? -1 : 1;
    let velX = 80000 * direction;
    let velY = -20000;
    const gravity = 80000;

    bottle.onUpdate(() => {
      if (gamePaused || !gameStarted) return;
      velY += gravity * ctx.dt();
      bottle.move(velX * ctx.dt(), velY * ctx.dt());
      bottle.angle += 20;
      if (bottle.pos.y > HEIGHT) ctx.destroy(bottle);
    });

    bottle.onCollide("bird", (b) => {
      ctx.destroy(b);
      const index = birds.indexOf(b);
      if (index > -1) birds.splice(index, 1);
      ctx.destroy(bottle);
      birdsKilled += 1;
      birdsKilledLabel.text = `Birds killed: ${birdsKilled}`;
    });

    setTimeout(() => {
      if (bottle) ctx.destroy(bottle);
    }, 3000);
  }

  ctx.onKeyPress("r", () => location.reload());
});
