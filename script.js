// garbage collection
window.addEventListener("load", function () {
  const startBtn = document.getElementById("start_mission");
  const rulesBlock = document.getElementById("rules");
  const canvas = document.getElementById("canvas1");
  const winBlock = document.getElementById("win");
  const loseBlock = document.getElementById("lose");
  const ctx = canvas.getContext("2d");
  startBtn.addEventListener("click", (e) => {
    e.preventDefault();
    rulesBlock.classList.add("hidden");
    canvas.classList.remove("hidden");
  });

  canvas.width = 600;
  canvas.height = 800;
  ctx.strokeStyle = "white";
  ctx.lineWidth = 3;
  ctx.font = "20px Audiowide";
  ctx.fillStyle = "white";

  class Asteroid {
    constructor(game) {
      this.game = game;
      this.radius = 100;
      this.x = -this.radius;
      this.y = Math.random() * this.game.height;
      this.spriteWidth = 300;
      this.spriteHeight = 300;
      this.sizeModifier = Math.random() * 0.5 + 0.5;
      this.speed = Math.random() * 1.5 + 1.5;
      this.free = true;
      this.angle = 0;
      this.va = Math.random() * 0.02 - 0.01;
      this.lives = 1;
      this.maxFrame = 22;
      this.image = document.getElementById("explosions_");
      this.frameX = 0;
      this.frameY = Math.floor(Math.random() * 3);
       this.explosion1 = document.getElementById("explosion1");
      this.explosion2 = document.getElementById("explosion2");
      this.explosion3 = document.getElementById("explosion3");
      this.explosion4 = document.getElementById("explosion4");
      this.explosion5 = document.getElementById("explosion5");
      this.explosion6 = document.getElementById("explosion6");
      this.explosionSounds = [this.explosion1, this.explosion2, this.explosion3, this.explosion4, this.explosion5, this.explosion6];

      this.sound = this.explosionSounds[Math.floor(Math.random() * this.explosionSounds.length)];
    }
    draw(context) {
      // console.log(this.game.explosionSounds);

      if (!this.free && !this.game.gameOver) {
        context.save();
        context.translate(this.x, this.y);
        context.rotate(this.angle);
        context.drawImage(this.image, this.frameX * this.spriteWidth, this.frameY * this.spriteHeight, this.spriteWidth, this.spriteHeight, -this.spriteWidth * 0.5, -this.spriteHeight * 0.5, this.spriteWidth, this.spriteHeight);
        if (this.game.debug) {
          context.fillText(this.lives, 0, 0);
        }
        context.restore();
      }
    }
    update() {
      if (!this.free && !this.game.gameOver) {
        this.angle += this.va;
        this.x += this.speed;
        if (this.x > this.game.width && this.lives >= 1) {
    
          this.reset();
        }
        if (this.lives < 1 && this.game.spriteUpdate) {
          
          this.frameX++;
           if(this.frameX === 2){
            this.play();        

          }
          if (this.frameX > this.maxFrame) {
                
            this.reset();
            this.game.score += this.lives;
          }
        }
      }
    }
    reset() {
      this.free = true;
      this.lives = 1;
      this.frameX = 0;
      this.frameY = Math.floor(Math.random() * 3);
    }
    hit(damage) {
      this.lives -= damage;
    }
    start() {
      this.lives = 1;
      this.frameX = 0;
      this.frameY = Math.floor(Math.random() * 3);
      this.free = false;
      this.x = -this.radius;
      this.y = Math.random() * this.game.height;
    }
     play(){
      this.sound.currentTime = 0;
      this.sound.volume = 0.1;
      this.sound.play();
    }
  }

  class Game {
    constructor(width, height) {
      this.width = width;
      this.height = height;
      this.asteroidPool = [];
      this.maxAsteroids = 10;
      this.asteroidTimer = 0;
      this.asteroidInterval = 500;

      this.createAsteroidPool();
      this.debug = false;
      this.gameOver = false;

      this.spriteUpdate = false;
      this.spriteTimer = 0;
      this.spriteInterval = 50;

      // timer
      this.time = 50000;
      this.minTime = 0;

      this.score = 0;
      this.maxScore = 50;

      this.mouse = {
        x: 0,
        y: 0,
        radius: 10,
      };
     
      window.addEventListener("keyup", (e) => {
        if (e.key === "d") this.debug = !this.debug;
      });
      window.addEventListener("keydown", (e) => {
        if (e.key === "r" && this.gameOver) this.restart();
        if (e.key === "q") stopAnimation();
        if (e.key === "s") startAnimation();
      });
      window.addEventListener("click", (e) => {
        // add explosions at click coordinates
        this.mouse.x = e.offsetX;
        this.mouse.y = e.offsetY;
        this.asteroidPool.forEach((asteroid) => {
          if (!asteroid.free && this.checkCollision(asteroid, this.mouse) && !this.gameOver) {
            asteroid.hit(1);
          }
        });
      });
    }
    createAsteroidPool() {
      for (let i = 0; i < this.maxAsteroids; i++) {
        this.asteroidPool.push(new Asteroid(this));
      }
    }

    getAsteroid() {
      for (let i = 0; i < this.asteroidPool.length; i++) {
        if (this.asteroidPool[i].free) {
          return this.asteroidPool[i];
        }
      }
    }

    checkCollision(a, b) {
      const sumOffRadii = a.radius + b.radius;
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      const distance = Math.hypot(dx, dy);
      return distance < sumOffRadii;
    }
    restart() {
      this.asteroidPool = [];
      this.maxAsteroids = 10;
      this.asteroidTimer = 0;
      this.asteroidInterval = 500;
      this.createAsteroidPool();
      this.debug = false;
      this.gameOver = false;

      // timer
      this.time = 50000;
      this.minTime = 0;

      this.score = 0;
      this.maxScore = 50;

      this.mouse = {
        x: 0,
        y: 0,
        radius: 2,
      };
    }
    render(context, deltaTime) {
      // create asteroids periodiccaly

      if (this.asteroidTimer > this.asteroidInterval) {
        // add new Asteroid
        const asteroid = this.getAsteroid();
        if (asteroid) asteroid.start();
        this.asteroidTimer = 0;
      } else {
        this.asteroidTimer += deltaTime;
      }
       // update sprites
          if (this.spriteTimer < this.spriteInterval) {
            this.spriteTimer += deltaTime;
            this.spriteUpdate = false;
          } else {
            this.spriteTimer = 0;
            this.spriteUpdate = true;
          }
          console.log(this.spriteUpdate);
      this.asteroidPool.forEach((asteroid) => {
        asteroid.draw(context);
        asteroid.update();
      });

      if (!this.gameOver) {
        context.fillText("chances of escape decrease: " + (this.score * 2).toFixed(0) + "%", 20, 75);
        if ((this.score * 2).toFixed(0) > 0) {
        }
        context.fillText("Asteroids: " + this.score, 20, 55);
        if (this.score > 0) {
        }
        context.fillText("Timer: " + (this.time * 0.001).toFixed(0), 20, 35);
      }

      if (this.time > this.minTime && this.score <= this.maxScore) {
        this.time -= deltaTime;
      } else if ((this.time > this.minTime || this.time === this.minTime) && this.score >= this.maxScore) {
        context.save();
        context.textAlign = "center";
        context.font = "50px Audiowide";
        context.fillText("We are saved! ", this.width * 0.5, this.height * 0.7);
        context.font = "20px Audiowide";
        context.fillText(this.score + " asteroids were destroyed", this.width * 0.5, this.height * 0.75);
        context.font = "30px Audiowide";
        context.fillText("to restart press R", this.width * 0.5, this.height * 0.9);
        context.restore();
        this.gameOver = true;
      } else if ((this.time < this.minTime || this.time === this.minTime) && (this.score * 2).toFixed(0) > 80) {
        context.save();
        context.textAlign = "center";
        context.font = "50px Audiowide";
        context.fillText("We have a chance, ", this.width * 0.5, this.height * 7.5);
        context.font = "20px Audiowide";
        context.fillText((this.score * 2).toFixed(1) + " asteroids were destroyed", this.width * 0.5, this.height * 0.75);
        context.font = "30px Audiowide";
        context.fillText("to restart press R", this.width * 0.5, this.height * 0.9);
        context.restore();
        this.gameOver = true;
      } else {
        this.time = this.minTime;
        context.save();
        context.textAlign = "center";
        context.font = "50px Audiowide";
        context.fillText("You lose. ", this.width * 0.5, this.height * 0.7);
        context.font = "20px Audiowide";
        if (this.score < 0) {
          context.fillText(Math.abs(this.score) + " asteroids were missed", this.width * 0.5, this.height * 0.75);
        } else {
          context.fillText("only " + this.score + " asteroids were destroyed", this.width * 0.5, this.height * 0.75);
        }
        context.font = "30px Audiowide";
        context.fillText("to restart press R", this.width * 0.5, this.height * 0.9);
        context.restore();
        this.gameOver = true;
      }
    }
  }
  function stopAnimation() {
    cancelAnimationFrame(animationId);
    isAnimating = false;
    console.log("Анимация остановлена");
  }
  function startAnimation() {
    isAnimating = true;
    animate(0);
  }

  const game = new Game(canvas.width, canvas.height);

  let lastTime = 0;
  function animate(timeStamp) {
    const deltaTime = timeStamp - lastTime;
    lastTime = timeStamp;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!canvas.classList.contains("hidden")) {
      game.render(ctx, deltaTime);
    }

    animationId = requestAnimationFrame(animate);
  }
  animate(0);
});
// garbage collection origin
// window.addEventListener("load", function () {
//   /** @type {HTMLCanvasElement} */
//   const canvas = document.getElementById("canvas1");
//   const ctx = canvas.getContext("2d");
//   canvas.width = 600;
//   canvas.height = 800;
//   ctx.strokeStyle = "white";
//   ctx.lineWidth = 3;
//   ctx.font = '20px Helvetica';
//   ctx.fillStyle = 'white';

//   class Asteroid {
//     constructor(game) {
//       this.game = game;
//       this.radius = 75;
//       this.x = -this.radius;
//       this.y = Math.random() * this.game.height;
//       this.image = document.getElementById("asteroid");
//       this.spriteWidth = 150;
//       this.spriteHeight = 155;
//       this.sizeModifier = Math.random() * 0.5 + 0.5;
//       this.speed = Math.random() * 1.5 + 0.1;
//       this.free = true;
//       this.angle = 0;
//       this.va = Math.random() * 0.02 - 0.01;
//     }
//     draw(context) {
//       if (!this.free) {
//          // context.beginPath();
//          // context.arc(this.x  , this.y, this.radius * this.sizeModifier, 0, Math.PI * 2);
//          // // 6.28 radians = 360 degrees
//          // context.stroke();
//          context.save();
//          context.translate(this.x, this.y);
//          context.rotate(this.angle);
//          context.drawImage(
//             this.image,
//             -this.spriteWidth * 0.5,
//             -this.spriteHeight * 0.5,
//             this.spriteWidth * this.sizeModifier,
//             this.spriteHeight * this.sizeModifier
//          );
//           context.restore();

//       }
//     }
//     update() {
//       if (!this.free) {
//         this.angle += this.va;
//         this.x += this.speed;
//         if (this.x > this.game.width - this.radius) {
//           this.reset();
//           const explosion = this.game.getExplosion();
//           if(explosion) explosion.start(this.x, this.y, 0);
//         }
//       }
//     }
//     reset() {
//       this.free = true;
//     }
//     start() {
//       this.free = false;
//       this.x = -this.radius;
//       this.y = Math.random() * this.game.height;
//     }
//   }
//   class Explosion {
//     constructor(game) {
//       this.game = game;
//       this.x = 0;
//       this.y = 0;
//       this.speed = 0;
//       this.image = document.getElementById("explosions");
//       this.spriteWidth = 300;
//       this.spriteHeight = 300;
//       this.free = true;
//       this.frameX = 0;
//       this.frameY = Math.floor(Math.random() * 3);
//       this.maxFrame = 22;
//       this.animationTimer = 0;
//       this.animationInterval = 1000/20;
//       this.sound = this.game.explosionSounds[Math.floor(Math.random() * this.game.explosionSounds.length)];
//     }
//     draw(context) {
//       if (!this.free) {
//          context.drawImage(this.image,this.spriteWidth * this.frameX, this.spriteHeight * this.frameY, this.spriteWidth, this.spriteHeight, this.x - this.spriteWidth * 0.5, this.y - this.spriteHeight * 0.5, this.spriteWidth, this.spriteHeight);
//       }
//     }
//     update(deltaTime) {
//       if (!this.free) {
//          this.x += this.speed;
//          if(this.animationTimer > this.animationInterval){
//             this.frameX++;
//             if(this.frameX > this.maxFrame) this.reset();
//             this.animationTimer = 0;
//          } else {
//             this.animationTimer += deltaTime;
//          }
//       }
//     }
//     play(){
//       this.sound.currentTime = 0;
//         this.sound.volume = 0.1;
//       this.sound.play();
//     }
//     reset() {
//       this.free = true;
//     }
//     start(x, y, speed) {
//       this.free = false;
//        this.x = x;
//       this.y = y;
//       this.frameX = 0;
//       this.speed = speed;
//         this.sound = this.game.explosionSounds[Math.floor(Math.random() * this.game.explosionSounds.length)];
//       this.play();
//     }
//   }
//   class Game {
//     constructor(width, height) {
//       this.width = width;
//       this.height = height;
//       this.asteroidPool = [];
//       this.maxAsteroids = 30;
//       this.asteroidTimer = 0;
//       this.asteroidInterval = 500;
//       this.createAsteroidPool();

//       this.score = 0;
//       this.maxScore = 10;

//       this.mouse = {
//          x: 0,
//          y: 0,
//          radius: 2
//       }

//       this.explosion1 = document.getElementById('explosion1');
//       this.explosion2 = document.getElementById('explosion2');
//       this.explosion3 = document.getElementById('explosion3');
//       this.explosion4 = document.getElementById('explosion4');
//       this.explosion5 = document.getElementById('explosion5');
//       this.explosion6 = document.getElementById('explosion6');
//       this.explosionSounds = [this.explosion1, this.explosion2, this.explosion3, this.explosion4, this.explosion5, this.explosion6];

//       this.explosionPool = [];
//       this.maxExplosions = 20;
//       this.createExplosionPool();

//       window.addEventListener('click', e=> {
//          // add explosions at click coordinates
//         this.mouse.x = e.offsetX;
//         this.mouse.y = e.offsetY;
//         this.asteroidPool.forEach(asteroid => {
//          if(!asteroid.free && this.checkCollision(asteroid, this.mouse)){
//             const explosion = this.getExplosion();
//             if(explosion) explosion.start(asteroid.x, asteroid.y, asteroid.speed * 0.4);
//             asteroid.reset();
//             if( this.score < this.maxScore) this.score++;
//             // console.log(explosion);
//          }
//         });
//       });
//     }
//     createAsteroidPool() {
//       for (let i = 0; i < this.maxAsteroids; i++) {
//         this.asteroidPool.push(new Asteroid(this));
//       }
//     }
//     createExplosionPool() {
//       for (let i = 0; i < this.maxExplosions; i++) {
//         this.explosionPool.push(new Explosion(this));
//       }
//     }
//     getAsteroid() {
//       for (let i = 0; i < this.asteroidPool.length; i++) {
//         if (this.asteroidPool[i].free) {
//           return this.asteroidPool[i];
//         }
//       }
//     }
//     getExplosion() {
//       for (let i = 0; i < this.explosionPool.length; i++) {
//         if (this.explosionPool[i].free) {
//           return this.explosionPool[i];
//         }
//       }
//     }
//     checkCollision(a,b){
//       const sumOffRadii = a.radius + b.radius;
//       const dx = a.x - b.x;
//       const dy = a.y - b.y;
//       const distance = Math.hypot(dx, dy);
//       return distance < sumOffRadii;

//     }
//     render(context, deltaTime) {
//       // create asteroids periodiccaly
//       if (this.asteroidTimer > this.asteroidInterval) {
//         // add new Asteroid
//         const asteroid = this.getAsteroid();
//         if (asteroid) asteroid.start();
//         this.asteroidTimer = 0;
//       } else {
//         this.asteroidTimer += deltaTime;
//       }
//       this.asteroidPool.forEach((asteroid) => {
//         asteroid.draw(context);
//         asteroid.update();
//       });
//       this.explosionPool.forEach((explosion) => {
//         explosion.draw(context);
//         explosion.update(deltaTime);
//       });
//       context.fillText('Score ' + this.score, 20, 35);
//       if (this.score >= this.maxScore) {
//          context.save();
//          context.textAlign = 'center';
//            context.fillText('You win, final score  ' + this.score, this.width * 0.5, this.height * 0.5);
//            context.restore();
//       }
//     }
//   }
//   const game = new Game(canvas.width, canvas.height);

//   let lastTime = 0;
//   function animate(timeStamp) {
//     const deltaTime = timeStamp - lastTime;
//     lastTime = timeStamp;
//     ctx.clearRect(0, 0, canvas.width, canvas.height);
//     game.render(ctx, deltaTime);

//     requestAnimationFrame(animate);
//   }
//   animate(0);
// });

