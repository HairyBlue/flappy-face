const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: "",
  measurementId: ""
};

 // Initialize Firebase
 const app = firebase.initializeApp(firebaseConfig);
 const db = firebase.firestore();