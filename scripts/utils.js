const myContext = {};

function getUserStorage() {
   return localStorage.getItem(LS_USER_KEY);
}

function getUserScoresStorage() {
   return localStorage.getItem(LS_USER_SCORE_KEY);
}

function getCharacterChooseStorage() {
   return localStorage.getItem(LS_USER_CHARACTER);
}

function uuid() {
   return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
       var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
       return v.toString(16);
   });
}

function bcryptHashPassword(password) {
   return bcrypt.hashSync(password, 12);
}
 
function bcryptCompareHashedPassword(password, hashedPassword) {
return bcrypt.compareSync(password, hashedPassword);
}


function cancelTimeOut(context) {
   if (myContext[context]) {
      clearTimeout(myContext[context]);
      delete myContext[context];
   }
}

function cancelInterval(context) {
   if (myContext[context]) {
      clearInterval(myContext[context]);
      delete myContext[context];
   }
}

function displayErrorMessage(message) {
   const error = document.querySelector('.error-message');
   error.innerText = message;
   error.style.display = 'block'

   cancelTimeOut('removeErrorMessage');
   myContext.removeErrorMessage = setTimeout(()=> {
      error.innerText = '';
      error.style.display = 'none'
   }, 15000)
}

function checkUserExist() {
   const hash = window.location.hash;
   const user = getUserStorage();

   if (!user) {
      if (!hash || hash !== 'home') {
         window.location.pathname = '/';
      } else {
         const dialog = document.getElementById('user-modal-registration');
         dialog.showModal();
         dialogUserInput();
      }
   }
}


function isGameLastLocation() {
   const lastLocation = this.sessionStorage.getItem(SS_USER_LAST_LOCATION);
   
   if (lastLocation && lastLocation == 'game') {
      this.sessionStorage.removeItem(SS_USER_LAST_LOCATION);

      return true;
   }

   return false;
}
