const hashLocation = 'home';

let userName = '';
let passWord = '';
let waiting = false;
let gameLastLocation = false;
/**
 * Registers a user to Firestore.
 *
 * @param {Object} userData
 * @param {string} userData.username
 * @param {string} userData.password
 * @param {string} userData.uuid
 * @param {string} userData.avatar
 * 
 * @param {Object} userScores 
 * @param {string} userScores.userUUID
 * @param {number} userScores.currentScore
 * @param {number} userScores.highestScore
 * @param {number} userScores.playTime
 * @param {boolean} userScores.displayHighestScorePublic
 */
function registUserToFirestore (userData, userScores) {
   const regUser = new Promise((resolve, reject)=> {
      db.collection(FLAPPY_USERS_COLLECTION).doc(userData.uuid).set({
         username: userData.username,
         password: userData.password,
         uuid: userData.uuid,
         avatar: userData.avatar
     })
     .then(() => {
         console.log("User succesfully register to firestore");
         resolve()
     })
     .catch((error) => {
         reject('Error in registering user: ' + error)
     });
   
   })

   const regUserScore = new Promise((resolve, reject) => {
      db.collection(FLAPPY_SCORES_COLLECTION).doc(userData.uuid).set({
         userUUID: userScores.userUUID,
         currentScore: userScores.currentScore,
         highestScore: userScores.highestScore,
         playTime: userScores.playTime,
         displayHighestScorePublic: userScores.displayHighestScorePublic
      })
      .then(() => {
         console.log("User Score succesfully register to firestore");
         resolve()
      })
      .catch((error) => {
         reject('Error in registering user score: '+ error)
      });
   })

   Promise
      .allSettled([regUser, regUserScore])
      .then(()=> {
         waiting = false;
         window.location.reload();
      })
      .catch((e)=> {
         console.log(e)
      })

}

/**
 * 
 * @param {string} type LOGIN | REGISTRATION
 * @param {string} errorMessage 
 * @returns 
 */
function getUserFirestore(type, errorMessage) {
   return new Promise((resolve, reject) => {
      const userQuery = db.collection(FLAPPY_USERS_COLLECTION).where('username', '==', userName);

      userQuery.get().then((querySnapshot) => {
         // console.log(querySnapshot.size);

         if (querySnapshot.size == 0) {
            if (type === "LOGIN") {
               displayErrorMessage(errorMessage);
               reject(errorMessage)
            }  if (type === "REGISTRATION") { 
               resolve();
            }
         }
         else if (querySnapshot.size == 1) {
            if (type === "LOGIN") { 

               const data = querySnapshot.docs[0].data();
               const validPassword = bcryptCompareHashedPassword(passWord, data.password);
               if (!validPassword) {
                  displayErrorMessage(errorMessage);
                  reject(errorMessage)
               } else {
                  resolve(data);
               }
            } 
            
            if (type === "REGISTRATION") {
               displayErrorMessage(errorMessage);
               reject(errorMessage)
            }
         }
      });
   })
}


function register() {
   const regBtn = document.getElementById('register-button');
   regBtn.addEventListener('click', function(e) {
      e.preventDefault();
      if (waiting) return;

      if (!userName || !passWord) {
         displayErrorMessage('Username or Password should not be empty')
         return 
      }

      const acceptableUsername = /^[a-zA-Z][a-zA-Z0-9._]{2,15}$/.test(userName);
      const acceptablePassword = /^.{4,}$/.test(passWord);

      if (!acceptableUsername) {
         displayErrorMessage(`
            ❌ _user123 (cannot start with _)
            ❌ 123username (cannot start with a number)
            ❌ ab (too short, must be at least 3 characters)
            ❌ longusername123456 (too long, max 16 characters)
         `)
         return
      }

      if (!acceptablePassword) {
         displayErrorMessage(`
         ❌ "abc" (too short)
         ❌ "" (empty)
      `)
      return
      }

      const uuidStr = uuid();

      const userData = {
         username: userName,
         password: bcryptHashPassword(passWord),
         uuid: uuidStr,
         avatar: ''
      }

      const userScores = {
         userUUID: uuidStr,
         currentScore: 0,
         highestScore: 0,
         playTime: 0,
         displayHighestScorePublic: false
      }

      const errorMessage = 'Username already exist';
      localStorage.setItem(LS_USER_KEY, JSON.stringify(userData));
      localStorage.setItem(LS_USER_CHARACTER, DEFUALT_CHARACTER);
      localStorage.setItem(LS_USER_SCORE_KEY, JSON.stringify(userScores));

      getUserFirestore('REGISTRATION', errorMessage)
      .then(()=> {
         registUserToFirestore(userData, userScores);
      })
      .catch(() => {
         waiting = false;
      })
     
      waiting = true;
   })
}

function login() {
   const loginBtn = document.getElementById('login-button');
   loginBtn.addEventListener('click', function(e){
      e.preventDefault();
      if (waiting) return;
      if (!userName) return;

      waiting = true;
      const errorMessage = 'Invalid credentials';
      getUserFirestore('LOGIN', errorMessage)
      .then(data => {
         db.collection(FLAPPY_SCORES_COLLECTION).doc(data.uuid).get()
         .then((doc) => {
            const scoredata = doc.data();
            localStorage.setItem(LS_USER_CHARACTER, DEFUALT_CHARACTER);

            localStorage.setItem(LS_USER_KEY, JSON.stringify(data));
            localStorage.setItem(LS_USER_SCORE_KEY, JSON.stringify(scoredata));
            window.location.reload();
         })
         .catch(e => {
            console.loge(e);
         })
      })
      .catch((e)=> {
         console.log(e);
         waiting = false;
      })
   })
}

function dialogUserInput() {
   const username = document.getElementById('username');
   const password = document.getElementById('password');

   username.addEventListener('input', function(e) {
      e.preventDefault();
      userName = username.value;
   })

   password.addEventListener('input', function(e) {
      e.preventDefault();
      passWord = password.value;
   })
}

window.addEventListener('load', function() {
   this.location.hash = hashLocation;
   checkUserExist();
   register();
   login();
   gameLastLocation = isGameLastLocation();
})