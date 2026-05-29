const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { collection, query, where, getDocs, addDoc, serverTimestamp } = require('firebase/firestore');
const db = require('../config/firebase');

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Please add all fields' });
  }

  try {
    const usersRef = collection(db, 'users');

    // Check if user already exists
    const q = query(usersRef, where('email', '==', email));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user in Firestore
    const docRef = await addDoc(usersRef, {
      name,
      email,
      password: hashedPassword,
      createdAt: serverTimestamp()
    });

    res.status(201).json({
      _id: docRef.id,
      name,
      email,
      token: generateToken(docRef.id)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Authenticate a user
// @route   POST /api/users/login
// @access  Public
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please add all fields' });
  }

  try {
    const usersRef = collection(db, 'users');

    // Check for user email
    const q = query(usersRef, where('email', '==', email));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    let userDoc;
    let userId;
    snapshot.forEach(doc => {
      userDoc = doc.data();
      userId = doc.id;
    });

    // Check password
    const isMatch = await bcrypt.compare(password, userDoc.password);

    if (isMatch) {
      res.json({
        _id: userId,
        name: userDoc.name,
        email: userDoc.email,
        token: generateToken(userId)
      });
    } else {
      res.status(400).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  registerUser,
  loginUser,
};
