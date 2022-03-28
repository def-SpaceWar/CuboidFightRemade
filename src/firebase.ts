// Import the functions you need from the SDKs you need

import { initializeApp } from "firebase/app";

// TODO: Add SDKs for Firebase products that you want to use

// https://firebase.google.com/docs/web/setup#available-libraries


// Your web app's Firebase configuration

const firebaseConfig = {

  apiKey: "AIzaSyCO1VVJGeL2dgBpVNgncWvJlizlDsj1h-8",

  authDomain: "cuboidfightremade.firebaseapp.com",

  databaseURL: "https://cuboidfightremade-default-rtdb.firebaseio.com",

  projectId: "cuboidfightremade",

  storageBucket: "cuboidfightremade.appspot.com",

  messagingSenderId: "822112221601",

  appId: "1:822112221601:web:a199261916b5e3bbedb3e0"

};


// Initialize Firebase

export const app = initializeApp(firebaseConfig);
