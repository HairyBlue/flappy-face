const hashLocation = 'game';

let startGameCount = 3;
let startGameGo = false;

let character = null;
let characterId = null;
let triggerSelected = "";


//GAME
let video = null;

let gamePause = false;
let Iinterval = null;
let myRequestAnimation = null;

let HEIGHT = 0;
let WIDTH = 0;

const pipeImg = new Image();
pipeImg.src = "/images/pipe/pipe-default.png";
let pipes = [];
const PIPE_WIDTH = 80;
const PIPE_HEIGHT = 300;
const PIPE_SPEED = 3;
const PIPE_GAP = 80;
let PIPE_SPAWN_INTERVAL = 2000;


const birdImg = new Image();
birdImg.src = '/images/characters/webp/bird.webp';

const bird = {
   x: 80,
   y: HEIGHT/2,
   width: birdImg.width,
   height: birdImg.height,
   velocityY: 0
};

const BIRD_COLLISION_OFFSET = Math.round(bird.width * .05);

let playerScore = 0;

let startTime = 0;

let parsedScore = null;

let actuallLives = 1;
let pipeScoreHits = Math.round(PIPE_WIDTH/PIPE_SPEED);
let hitPipe = 0;

// * ***********************************************************************************************
// GAME
class Pipe {
   constructor(x, y, width, height, speed, isTop = false) {
       this.x = x;
       this.y = y;
       this.width = width;
       this.height = height;
       this.speed = speed;
       this.isTop = isTop;
   }

   update() {
       this.x -= this.speed; // Move pipe left
   }

   draw(ctx) {
      if (this.isTop) {
         ctx.save(); // Save current state
         ctx.translate(this.x + this.width / 2, this.y + this.height / 2); // Move pivot to center
         ctx.scale(1, -1); // Flip vertically
         ctx.drawImage(pipeImg, -this.width / 2, -this.height / 2, this.width, this.height);
         ctx.restore(); // Restore previous state
     } else {
         ctx.drawImage(pipeImg, this.x, this.y, this.width, this.height);
     }
   }

   isOffScreen() {
       return this.x + this.width < 0; // Check if pipe is off-screen
   }
}

function spawnPipes() {
   if (!gamePause) {
      // const now = Date.now();
      // if (now - lastPipeTime > PIPE_SPAWN_INTERVAL) {
         const randomGap = Math.floor(Math.random() * (150 - 80 + 1)) + 80;
         const randomHeight = Math.floor(Math.random() * 200) + 100; // Randomize pipe height

         pipes.push(new Pipe(WIDTH, 0, PIPE_WIDTH, randomHeight, PIPE_SPEED, true));
         pipes.push(new Pipe(WIDTH, randomHeight + randomGap, PIPE_WIDTH, HEIGHT - (randomHeight + PIPE_GAP), PIPE_SPEED));
      //    lastPipeTime = now;
      // }
   } 
}

async function loadModels() {
   await faceapi.nets.ssdMobilenetv1.loadFromUri('/models');
   await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
}

function getVideoElement() {
   return document.getElementById('videoElement');
}

function getGameCanvas() {
   return document.getElementById('gameCanvas');
}


function applyVideoStream() {
   video = getVideoElement();

   if (navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({video: true})
      .then(function (stream){
         video.srcObject = stream;
      })
      .catch(function (err0r) {
         console.log("Something went wrong!");
      });
   }
}

async function doFaceApi() {
   const video = getVideoElement();
   const canvas = getGameCanvas();

   if (!video || !canvas) {
      console.error("Video or canvas element not found!");
      return;
   }

   const displaySize = { width: video.width || 640, height: video.height || 480 };
   faceapi.matchDimensions(canvas, displaySize);

   video.addEventListener("play", async function () {
      // const ctx = getGameCanvas().getContext("2d");
      setInterval(async () => {
         const detections = await faceapi.detectAllFaces(video).withFaceLandmarks();
         const resizedDetections = faceapi.resizeResults(detections, displaySize);

         // ctx.clearRect(0, 0, canvas.width, canvas.height);
         // faceapi.draw.drawDetections(canvas, resizedDetections);
         // faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);

         // Log Nose Landmark
         if (resizedDetections.length > 0) {
            const nose = resizedDetections[0].landmarks.getNose();
            // bird.x = nose[3].x;
            bird.y = nose[3].y;
         }
      }, 100);
   });
}


function gameUpdate() {
   const ctx = getGameCanvas().getContext("2d");
   const pipeCollision = Math.round(PIPE_WIDTH/PIPE_SPEED) + BIRD_COLLISION_OFFSET;
   
   if (gamePause) {
      clearInterval(Iinterval);
      cancelAnimationFrame(myRequestAnimation);
      return
   }

   if (bird) {
      ctx.clearRect(0, 0, WIDTH, HEIGHT); // clear canvas
   
      ctx.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
      
      pipes.forEach((pipe, index) => {
         const birdCollisionX = bird.x + bird.width / 2;
         const birdCollisionY = bird.y + bird.height / 2;

         if (
            birdCollisionX > pipe.x + BIRD_COLLISION_OFFSET &&
            birdCollisionX < pipe.x + pipe.width - BIRD_COLLISION_OFFSET &&
            birdCollisionY > pipe.y + BIRD_COLLISION_OFFSET &&
            birdCollisionY < pipe.y + pipe.height - BIRD_COLLISION_OFFSET
        ) {

            
            hitPipe++;
            pipeScoreHits--;

            if (pipeScoreHits <= pipeCollision) {
               gamePause = true;

               if (parsedScore) {
                  if (playerScore % 1 != 0) {
                     playerScore = Math.round(playerScore);
                  }

                  const endTime = Date.now();
                  const ellapsedTime = (endTime - startTime) / (1000 * 60 * 60);

                  parsedScore.playTime += ellapsedTime;

                  parsedScore.currentScore = playerScore;
                  if (parsedScore.highestScore == 0) {
                     parsedScore.highestScore = playerScore;
                  }

                  if (playerScore > parsedScore.highestScore) {
                     parsedScore.highestScore = playerScore;
                  }
                  
                  localStorage.setItem(LS_USER_SCORE_KEY, JSON.stringify(parsedScore));
                  document.getElementById('play-btn').textContent = "Reset";
                  startGamePopup(true);
               }
            }
        }

         pipe.update();
         pipe.draw(ctx);
   
         // Remove pipes that are off-screen
         if (pipe.isOffScreen()) {
            pipes.splice(index, 1);
            playerScore+=.5;

            if (playerScore % 1 == 0) {
               document.getElementById('current-display-score').textContent = playerScore;
            }
         }
   
         //pipes = pipes.filter(pipe => !pipe.isOffScreen());
      });
   }

   myRequestAnimation = requestAnimationFrame(gameUpdate);
}

// * ***********************************************************************************************


function getCanvaBounding() {
   const canvaWrapper = document.getElementById('canva-wrapper');
   const rect = canvaWrapper.getBoundingClientRect();
   WIDTH = rect.width;
   HEIGHT = rect.height;
}


function loadCharacter() {
   characterId = getCharacterChooseStorage();
   character = charactersData[characterId];

   if (character) {
      birdImg.src = character.imgPath;
      bird.width = bird.width + character.adjustment.width ?? 0;
      bird.height = bird.height + character.adjustment.height ?? 0;

      actuallLives = character.lives; 
      pipeScoreHits = Math.round(PIPE_WIDTH/PIPE_SPEED) * character.lives;
   }
}

function loadScore() {
   const score = getUserScoresStorage();
   if (score) {
      parsedScore = JSON.parse(score);
      document.getElementById('highest-display-score').textContent = parsedScore.highestScore;
   }
}

function displaySelectedCharacter() {
   if (character) {
      document.getElementById(CHARACTER_IMG).src = character.imgPath;
      document.getElementById(CHARACTER_NAME).textContent = character.name;
      document.getElementById(CHARACTER_DESCRIPTION).textContent = character.description;
   }
}

function startGamePopup(open=true) {
   const modalPop = document.getElementById('user-modal-start-game');
   if (open) {
      modalPop.showModal();
   } else {
      modalPop.close();
   }
}

function startCounting() {
   myContext.counting321Interval = setInterval(()=> { 
      startGameCount--;
      document.getElementById('count').textContent = startGameCount;

      if (startGameCount == 0) {
         cancelInterval('counting321Interval');

         document.getElementById('count').textContent = 'GO!';
         document.getElementById('count').style.fontStyle = 'italic';

         setTimeout(() => { 
            document.querySelector('.count-3-2-1').style.display = 'none';
            Iinterval = setInterval(spawnPipes, PIPE_SPAWN_INTERVAL);
            startTime = Date.now();
            
         }, 1000)
      }
   }, 1000)
}


function clickPlayButton() {
   startGameCount = 3;
   pipes = [];

   document.getElementById('play-btn')
      .addEventListener('click', function(e) {

      if (gamePause) {
         window.location.reload();
         return
      }

      startGamePopup(false);
      setTimeout(() => {
         document.querySelector('.count-3-2-1').style.display = 'block';
         startCounting();
      }, 1000)
   })
}

function boot() {
   getCanvaBounding();
   loadCharacter();
   loadScore();
   startGamePopup();
   displaySelectedCharacter();
   applyVideoStream();
   doFaceApi();
   gameUpdate();
   clickPlayButton();
}

window.addEventListener('load', function() {
   this.location.hash = hashLocation;
   checkUserExist();
   this.sessionStorage.setItem(SS_USER_LAST_LOCATION, hashLocation);

   loadModels()
   .then(() => {
      boot();
   })

})
