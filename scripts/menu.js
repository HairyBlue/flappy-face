const hashLocation = 'menu';
let gameLastLocation = false;

let character = null;
let characterId = null;
let triggerSelected = "";


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
      document.getElementById(CHARACTER_DESCRIPTION).textContent = character.description;

      document.getElementById(CHARACTER_IMG_MOBILE).src = character.imgPath;
      document.getElementById(CHARACTER_NAME_MOBILE).textContent = character.name;
      document.getElementById(CHARACTER_DESCRIPTION_MOBILE).textContent = character.description;

      document.getElementById(CHARACTER_NO_SELECT).style.display = 'none';
      document.getElementById(CHARACTER_SELECT).style.display = 'block';

      document.getElementById(CHARACTER_NO_SELECT_MOBILE).style.display = 'none';
      document.getElementById(CHARACTER_SELECT_MOBILE).style.display = 'block';

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
         document.getElementById(IN_USED_BUTTON).style.display = 'block';
         document.getElementById(IN_USED_BUTTON_MOBILE).style.display = 'block';

         document.getElementById(USE_BUTTON).style.display = 'none';
         document.getElementById(USE_BUTTON_MOBILE).style.display = 'none';
      }
   }

}

function displayUserProfile() {
   const user = getUserStorage();
   const parsed = JSON.parse(user);
   
   if (user) {
      document.getElementById(USERNAME_ID).textContent = parsed.username;
   }
}

function loadScore() {
   const score = getUserScoresStorage();
   if (score) {
      const parsedScore = JSON.parse(score);
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


function boot() {
   displayUserProfile();
   loadScore();
   displaySelectedCharacter();
   displayListCharacters();
   characterList();
   gameLastLocation = isGameLastLocation();

   if (gameLastLocation) {
      document.getElementById('go-to-game').style.display = 'block';
   }

}


window.addEventListener('load', function() {
   this.location.hash = hashLocation;
   checkUserExist();
   boot();
})