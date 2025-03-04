const hashLocation = 'menu';
let gameLastLocation = false;

let character = null;
let characterId = null;
let triggerSelected = "";


let user = null;
let userScore = null;

function displaySelectedCharacter(onload=true) {
   if (onload) {
      characterId = getCharacterChooseStorage();

      if (!characterId) {
         document.getElementById(CHARACTER_NO_SELECT).style.display = 'block';
         document.getElementById(CHARACTER_SELECT).style.display = 'none';
   
         document.getElementById(CHARACTER_NO_SELECT_MOBILE).style.display = 'block';
         document.getElementById(CHARACTER_SELECT_MOBILE).style.display = 'none';
      } else {
         character = charactersData[characterId];
      }
   }

   if (character) {
      document.getElementById(CHARACTER_IMG).src = character.imgPath;
      document.getElementById(CHARACTER_NAME).textContent = character.name;
      document.getElementById(CHARACTER_LIVES).textContent = 'Lives: ' + character.lives;
      document.getElementById(CHARACTER_DESCRIPTION).textContent = character.description;

      document.getElementById(CHARACTER_IMG_MOBILE).src = character.imgPath;
      document.getElementById(CHARACTER_NAME_MOBILE).textContent = character.name;
      document.getElementById(CHARACTER_LIVES_MOBILE).textContent = 'Lives: ' + character.lives;
      document.getElementById(CHARACTER_DESCRIPTION_MOBILE).textContent = character.description;

      document.getElementById(CHARACTER_NO_SELECT).style.display = 'none';
      document.getElementById(CHARACTER_SELECT).style.display = 'block';

      document.getElementById(CHARACTER_NO_SELECT_MOBILE).style.display = 'none';
      document.getElementById(CHARACTER_SELECT_MOBILE).style.display = 'block';
      const crowns = document.querySelectorAll('.crown');
      const editions = document.querySelectorAll('.edition');

      for (let crown of crowns) {
         if (character.crown) {
            crown.style.display = 'block'
         } else {
            crown.style.display = 'none'
         }
      }
      
      for (let edition of editions) {
         if (character.limitedEdition) {
            edition.style.display = 'flex'
         } else {
            edition.style.display = 'none'
         }
      }

      if (characterId !== character.id) {
         document.getElementById(IN_USED_BUTTON).style.display = 'none';
         document.getElementById(IN_USED_BUTTON_MOBILE).style.display = 'none';

         document.getElementById(USE_BUTTON).style.display = 'block';
         document.getElementById(USE_BUTTON_MOBILE).style.display = 'block';
      } else {
         document.getElementById(IN_USED_BUTTON).style.display = 'block';
         document.getElementById(IN_USED_BUTTON_MOBILE).style.display = 'block';

         document.getElementById(USE_BUTTON).style.display = 'none';
         document.getElementById(USE_BUTTON_MOBILE).style.display = 'none';
      }

      if (triggerSelected.toLowerCase().trim() === "use") {
         localStorage.setItem(LS_USER_CHARACTER, character.id);
         window.location.reload();
      }
   }

}

function displayUserProfile() {
   if (user) {
      const parsed = JSON.parse(user);
      document.getElementById(USERNAME_ID).textContent = parsed.username;
   }
}

function loadScore() {
   if (userScore) {
      const parsedScore = JSON.parse(userScore);
      document.getElementById('current-display-score').textContent = parsedScore.currentScore;
      document.getElementById('highest-display-score').textContent = parsedScore.highestScore;
      document.getElementById('play-time-display').textContent = parsedScore.playTime.toFixed(2);
   }
}

function displayListCharacters() {
   const list = document.getElementById(CHARACTERS_LIST);
   const listMobile = document.getElementById(CHARACTERS_LIST_MOBILE);

   for (let characterId in charactersData) {
      const button = document.createElement('button');
      const img = document.createElement('img');

      img.src = charactersData[characterId].imgPath;
      img.setAttribute('alt',  charactersData[characterId].name);
      img.setAttribute('data-img-id',  charactersData[characterId].id);

      button.append(img);
      list.append(button);
   }

   for (let characterId in charactersData) {
      const button = document.createElement('button');
      const img = document.createElement('img');

      img.src = charactersData[characterId].imgPath;
      img.setAttribute('alt',  charactersData[characterId].name);
      img.setAttribute('data-img-id',  charactersData[characterId].id);

      button.append(img);
      listMobile.append(button);
   }
}

function characterList() {
   const characterList = this.document.getElementById('game-characters');
   const characterListMobile = this.document.getElementById('game-characters-mobile');

   //Terrible implementation

   characterList.addEventListener('click', function(e) {
      e.preventDefault();
      const imgdId = e.target.dataset.imgId;
   
      if (imgdId) {
         character = charactersData[imgdId];
      } else {
         triggerSelected = e.target.textContent;
      }

      displaySelectedCharacter(false);
   })

   characterListMobile.addEventListener('click', function(e) {
      e.preventDefault();
      const imgdId = e.target.dataset.imgId;
   
      if (imgdId) {
         character = charactersData[imgdId];
      } else {
         triggerSelected = e.target.textContent;
      }

      displaySelectedCharacter(false);
   })
}

function syncUserScoreFirebase() {
   document.getElementById('sync-score').addEventListener('click', function() {
      const parseUser = JSON.parse(user);
      const parseUserScore = JSON.parse(userScore);

      const uuid = parseUser.uuid;

      db.collection(FLAPPY_SCORES_COLLECTION).doc(uuid)
      .update({
         currentScore: parseUserScore.currentScore,
         highestScore: parseUserScore.highestScore,
         playTime: parseUserScore.playTime,
      })
      .then(() => {
         window.location.reload();
      })
   })
}

function getUserScoreFirebase() {
   if (user && userScore) {
      const userParsed = JSON.parse(user);
      const userScoreParsed = JSON.parse(userScore);

      const uuid = userParsed.uuid;
      if (uuid) {
         db.collection(FLAPPY_SCORES_COLLECTION).doc(uuid).get()
         .then((doc) => {
            const data = doc.data();

            let syncFirebaseScore = false;

            if (userScoreParsed.highestScore > data.highestScore) {
               syncFirebaseScore = true
            } else if (userScoreParsed.playTime > data.playTime) {
               syncFirebaseScore = true
            }

            if (syncFirebaseScore) {
               document.getElementById('sync-score').style.display = 'block';
               syncUserScoreFirebase();
            }
 
         })
      }
   }
   
}

function loadStorage() {
   user = getUserStorage();
   userScore = getUserScoresStorage();
}

function boot() {
   loadStorage();
   loadScore();
   displayUserProfile();
   displaySelectedCharacter();
   displayListCharacters();
   characterList();
   getUserScoreFirebase();

   gameLastLocation = isGameLastLocation();
   if (gameLastLocation) {
      document.getElementById('go-to-game').style.display = 'block';
   }

}


window.addEventListener('load', function() {
   this.location.hash = hashLocation;
   checkUserExist();
   boot();

   this.document.getElementById('logout-to-game').addEventListener('click', function () {
      logout();
   })
})