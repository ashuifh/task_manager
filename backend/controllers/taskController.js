const { collection, query, where, getDocs, addDoc, doc, updateDoc, deleteDoc, serverTimestamp, getDoc } = require('firebase/firestore');
const db = require('../config/firebase');

// @desc    Get user's tasks
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res) => {
  try {
    const tasksRef = collection(db, 'tasks');
    const q = query(tasksRef, where('userId', '==', req.user.id));
    const snapshot = await getDocs(q);
    
    const tasks = [];
    snapshot.forEach(doc => {
      tasks.push({ id: doc.id, ...doc.data() });
    });
    
    res.json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create a task
// @route   POST /api/tasks
// @access  Private
const createTask = async (req, res) => {
  const { title, description, priority, dueDate } = req.body;
  if (!title) return res.status(400).json({ message: 'Task title is required' });

  try {
    const tasksRef = collection(db, 'tasks');
    const docRef = await addDoc(tasksRef, {
      userId: req.user.id,
      title,
      description: description || '',
      status: 'pending',
      priority: priority || 'medium',
      dueDate: dueDate || null,
      createdAt: serverTimestamp()
    });
    
    res.status(201).json({ id: docRef.id, title, status: 'pending' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getTasks, createTask };
