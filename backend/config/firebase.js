const { initializeApp } = require('firebase/app');
const { getFirestore } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyDcz3k20dILaQi6EEgow9epH6RCEoBsG6c",
  authDomain: "taskmanager-856fc.firebaseapp.com",
  projectId: "taskmanager-856fc",
  storageBucket: "taskmanager-856fc.firebasestorage.app",
  messagingSenderId: "251554555182",
  appId: "1:251554555182:web:feb15e24e1eadbe24f86bf",
  measurementId: "G-4J121368DJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

console.log(' Firebase Initialized with provided configuration successfully.');

module.exports = db;