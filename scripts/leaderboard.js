let user = null;
let userScore = null;

let userListScore = {};

function loadStorage() {
   user = getUserStorage();
   userScore = getUserScoresStorage();
}

function getUserFirebase() {
  return new Promise((resolve, reject) => {
      db.collection(FLAPPY_USERS_COLLECTION)
      .get()
      .then((querySnapshot) => {
         const docs = querySnapshot.docs;

         for (let doc of docs) {
            const data = doc.data();

            userListScore[doc.id] = {
               uuid: data.uuid,
               username: data.username
            }
         }

         resolve()
      })
      .catch((e) => {
         console.log(e);
         reject(e)
      })
  }) 
}


function getUserScoreFirebase() {
   for (let userUUID in  userListScore) {
      db.collection(FLAPPY_SCORES_COLLECTION)
      .doc(userUUID)
      .get()
      .then((docScore) => {
         const scoreData = docScore.data();

         userListScore[userUUID].score = {
            highestScore: scoreData.highestScore,
            playTime: scoreData.playTime,
            displayHighestScorePublic: scoreData.displayHighestScorePublic
         }

      })
      .catch(e => {
         console.log(e)
      })
   }
}




function getRanking() {
   const list = Object.values(userListScore);

   list.sort((a , b) => { 
      return a.score.highestScore - b.score.highestScore
   })

   list.reverse();

   let rank = 1;

   for (let user in userListScore) {
      userListScore[user].score.rank = rank;
      rank++;
   }
}

function loadMyScore() {
   if (user) {
      const parsedUser = JSON.parse(user);
      const uuid = parsedUser.uuid;
      if (userListScore[uuid]) {
         const myListScore = userListScore[uuid];

         document.getElementById('current-username').textContent = myListScore.username;
         document.getElementById('current-user-hscore').textContent = myListScore.score.highestScore;
         document.getElementById('current-user-rank').textContent = myListScore.score.rank;
      }
   }
}


function loadListUserScore() {
   const ul = document.getElementById('user-list');

   const urlImgORg = window.location.origin;

   for (let user in userListScore) {
      const rrank = userListScore[user].score.rank;
      const sscore = userListScore[user].score.highestScore;


      const li = document.createElement('li');
      const displayCurUser = document.createElement('div');
      displayCurUser.classList.add('display-current-user');
      
      const currentUserInfo = document.createElement('div');
      currentUserInfo.classList.add('current-user-info');
      const img = document.createElement('img');
      img.src = urlImgORg + '/images/avatar/default-avatar.png';
      const name = document.createElement('span');
      name.textContent = userListScore[user].username;
      currentUserInfo.append(img, name)
      displayCurUser.appendChild(currentUserInfo);

      const rankScoreList = document.createElement('div')
      rankScoreList.classList.add('rank-score-list');

      let ribbonPath = '';

      if (rrank <= 3) {
         ribbonPath = urlImgORg + `/images/ribbon/${rrank}-place.svg`
      }

      const ribbon = document.createElement('img');
      ribbon.src = ribbonPath;
      ribbon.setAttribute('alt', 'ribbon');
      ribbon.classList.add('ribbon');
      rankScoreList.appendChild(ribbon);

      const rank = document.createElement('div');
      rank.classList.add('rank');
      const spanSHRANK = document.createElement('span');
      spanSHRANK.textContent = 'RANK';
      spanSHRANK.classList.add('sub-header')
      const spanRankNum = document.createElement('span').textContent = rrank;
      const br1 = document.createElement('br');
      rank.append(spanSHRANK, br1, spanRankNum);
      rankScoreList.appendChild(rank);

      const score = document.createElement('div');
      score.classList.add('score');
      const spanSHSCORE= document.createElement('span');
      spanSHSCORE.textContent = 'SCORE';
      spanSHSCORE.classList.add('sub-header')
      const spanSCORENum = document.createElement('span').textContent = sscore;
      const br2 = document.createElement('br');
      score.append(spanSHSCORE, br2, spanSCORENum);

      rankScoreList.appendChild(score);

      displayCurUser.appendChild(rankScoreList);

      li.append(displayCurUser);

      ul.appendChild(li);
   }
}

function boot() {
   setTimeout(() => {
      getRanking();
      loadMyScore();
      loadListUserScore()
   }, 800)
}

window.addEventListener('load', function() {
   loadStorage();
   getUserFirebase()
   .then(() => {
      getUserScoreFirebase();
      boot();
   })

})