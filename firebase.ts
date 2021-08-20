import firebase from "firebase";

const firebaseConfig = {
  apiKey: "AIzaSyBKf3PecCc71Q1g3xjkPwPj9VaFHdTLdUY",
  authDomain: "reddit-nextapp.firebaseapp.com",
  projectId: "reddit-nextapp",
  storageBucket: "reddit-nextapp.appspot.com",
  messagingSenderId: "480924373815",
  appId: "1:480924373815:web:d5570493a47c721740c0b2",
};

const app = !firebase.apps.length
  ? firebase.initializeApp(firebaseConfig)
  : firebase.app();

  const db = app.firestore(); 

  export { db };