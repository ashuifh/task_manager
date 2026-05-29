const { collection, query, where, getDocs, addDoc, doc, updateDoc, deleteDoc, serverTimestamp, getDoc } = require('firebase/firestore');
const db = require('../config/firebase');

// @desc    Get user's tasks with filtering, sorting, pagination
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res) => {
  try {
    const { status, priority, sortBy, page = 1, limit = 10 } = req.query;
    
    const tasksRef = collection(db, 'tasks');
    const q = query(tasksRef, where('userId', '==', req.user.id));
    const snapshot = await getDocs(q);
    
    let tasks = [];
    snapshot.forEach(doc => {
      tasks.push({ id: doc.id, ...doc.data() });
    });
    
    // Filtering
    if (status) tasks = tasks.filter(t => t.status === status);
    if (priority) tasks = tasks.filter(t => t.priority === priority);
    
    // Sorting (default by createdAt descending)
    if (sortBy === 'dueDate') {
      tasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    } else {
      tasks.sort((a, b) => b.createdAt?.toMillis() - a.createdAt?.toMillis());
    }
    
    // Overdue identification
    const now = new Date();
    tasks = tasks.map(t => ({
      ...t,
      isOverdue: t.dueDate && new Date(t.dueDate) < now && t.status !== 'completed'
    }));

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedTasks = tasks.slice(startIndex, endIndex);
    
    res.json({
      tasks: paginatedTasks,
      total: tasks.length,
      page: Number(page),
      pages: Math.ceil(tasks.length / limit)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create a task
// @route   POST /api/tasks
// @access  Private
const createTask = async (req, res) => {
  const { title, description, priority, dueDate, parentId } = req.body;
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
      parentId: parentId || null, // For recursive subtasks
      createdAt: serverTimestamp()
    });
    
    res.status(201).json({ id: docRef.id, title, status: 'pending' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update a task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res) => {
  try {
    const taskRef = doc(db, 'tasks', req.params.id);
    const taskSnap = await getDoc(taskRef);
    
    if (!taskSnap.exists()) return res.status(404).json({ message: 'Task not found' });
    if (taskSnap.data().userId !== req.user.id) return res.status(401).json({ message: 'Not authorized' });

    await updateDoc(taskRef, req.body);
    res.json({ id: req.params.id, ...req.body });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = async (req, res) => {
  try {
    const taskRef = doc(db, 'tasks', req.params.id);
    const taskSnap = await getDoc(taskRef);
    
    if (!taskSnap.exists()) return res.status(404).json({ message: 'Task not found' });
    if (taskSnap.data().userId !== req.user.id) return res.status(401).json({ message: 'Not authorized' });

    await deleteDoc(taskRef);
    res.json({ message: 'Task removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getTasks, createTask, updateTask, deleteTask };
