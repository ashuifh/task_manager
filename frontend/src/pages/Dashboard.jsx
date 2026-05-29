import React, { useEffect, useState, useCallback } from 'react';
import {
  Container, Typography, Paper, Button, Box, Chip, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  MenuItem, Select, FormControl, InputLabel, Grid, Card, CardContent,
  CardActions, Pagination, CircularProgress, Alert, Tooltip,
  Collapse, Divider, Badge, Stack, InputAdornment
} from '@mui/material';
import {
  Add, Delete, Edit, Logout, ExpandMore, ExpandLess,
  SubdirectoryArrowRight, FilterList, Sort, Warning,
  CheckCircle, RadioButtonUnchecked, Schedule, Search
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('token')}`,
});

const api = {
  getTasks: (params) => {
    const query = new URLSearchParams(params).toString();
    return fetch(`${BASE_URL}/tasks?${query}`, { headers: getHeaders() }).then(r => r.json());
  },
  createTask: (data) => fetch(`${BASE_URL}/tasks`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) }).then(r => r.json()),
  updateTask: (id, data) => fetch(`${BASE_URL}/tasks/${id}`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify(data) }).then(r => r.json()),
  deleteTask: (id) => fetch(`${BASE_URL}/tasks/${id}`, { method: 'DELETE', headers: getHeaders() }).then(r => r.json()),
};

const PRIORITY_COLORS = { high: 'error', medium: 'warning', low: 'success' };
const STATUS_COLORS = { pending: 'default', 'in-progress': 'primary', completed: 'success' };
const STATUS_ICONS = {
  pending: <RadioButtonUnchecked fontSize="small" />,
  'in-progress': <Schedule fontSize="small" />,
  completed: <CheckCircle fontSize="small" />,
};

const emptyForm = { title: '', description: '', priority: 'medium', dueDate: '', status: 'pending', parentId: null };

// ─── Recursive Subtask Tree ───────────────────────────────────────────────────
const TaskCard = ({ task, allTasks, onEdit, onDelete, onStatusChange, onAddSubtask, depth = 0 }) => {
  const [open, setOpen] = useState(false);
  const subtasks = allTasks.filter(t => t.parentId === task.id);

  return (
    <Box sx={{ ml: depth * 3, mb: 1 }}>
      <Card
        variant="outlined"
        sx={{
          borderLeft: `4px solid`,
          borderLeftColor: task.isOverdue ? 'error.main' :
            task.priority === 'high' ? 'error.light' :
              task.priority === 'medium' ? 'warning.light' : 'success.light',
          opacity: task.status === 'completed' ? 0.7 : 1,
          transition: 'box-shadow 0.2s',
          '&:hover': { boxShadow: 3 },
        }}
      >
        <CardContent sx={{ pb: 1 }}>
          <Box display="flex" alignItems="flex-start" justifyContent="space-between" gap={1}>
            <Box flex={1}>
              <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                {depth > 0 && <SubdirectoryArrowRight fontSize="small" color="action" />}
                <Typography
                  variant="subtitle1"
                  fontWeight={600}
                  sx={{ textDecoration: task.status === 'completed' ? 'line-through' : 'none' }}
                >
                  {task.title}
                </Typography>
                {task.isOverdue && (
                  <Chip icon={<Warning />} label="Overdue" color="error" size="small" />
                )}
                <Chip label={task.priority} color={PRIORITY_COLORS[task.priority]} size="small" variant="outlined" />
                <Chip icon={STATUS_ICONS[task.status]} label={task.status} color={STATUS_COLORS[task.status]} size="small" />
              </Box>
              {task.description && (
                <Typography variant="body2" color="text.secondary" mt={0.5}>{task.description}</Typography>
              )}
              {task.dueDate && (
                <Typography variant="caption" color={task.isOverdue ? 'error' : 'text.secondary'}>
                  Due: {new Date(task.dueDate).toLocaleDateString()}
                </Typography>
              )}
            </Box>
          </Box>
        </CardContent>

        <CardActions sx={{ pt: 0, flexWrap: 'wrap', gap: 0.5 }}>
          <FormControl size="small" sx={{ minWidth: 130 }}>
            <Select
              value={task.status}
              onChange={(e) => onStatusChange(task.id, e.target.value)}
              variant="standard"
              disableUnderline
            >
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="in-progress">In Progress</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
            </Select>
          </FormControl>

          <Box ml="auto" display="flex" gap={0.5}>
            {subtasks.length > 0 && (
              <Tooltip title={open ? 'Hide subtasks' : `${subtasks.length} subtask(s)`}>
                <IconButton size="small" onClick={() => setOpen(!open)}>
                  <Badge badgeContent={subtasks.length} color="primary">
                    {open ? <ExpandLess /> : <ExpandMore />}
                  </Badge>
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title="Add subtask">
              <IconButton size="small" color="primary" onClick={() => onAddSubtask(task.id)}>
                <Add fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Edit">
              <IconButton size="small" onClick={() => onEdit(task)}>
                <Edit fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton size="small" color="error" onClick={() => onDelete(task.id)}>
                <Delete fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </CardActions>
      </Card>

      {/* Recursive subtasks */}
      <Collapse in={open}>
        <Box mt={1}>
          {subtasks.map(sub => (
            <TaskCard
              key={sub.id}
              task={sub}
              allTasks={allTasks}
              onEdit={onEdit}
              onDelete={onDelete}
              onStatusChange={onStatusChange}
              onAddSubtask={onAddSubtask}
              depth={depth + 1}
            />
          ))}
        </Box>
      </Collapse>
    </Box>
  );
};

// ─── Main Dashboard ───────────────────────────────────────────────────────────
const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Filters & Pagination
  const [filters, setFilters] = useState({ status: '', priority: '', sortBy: 'createdAt', page: 1, limit: 10 });
  const [refreshKey, setRefreshKey] = useState(0);
  const forceRefresh = () => setRefreshKey(k => k + 1);
  const [search, setSearch] = useState('');

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const userInfo = localStorage.getItem('user');
    if (!userInfo) { navigate('/auth'); return; }
    setUser(JSON.parse(userInfo));
  }, [navigate]);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.priority) params.priority = filters.priority;
      if (filters.sortBy) params.sortBy = filters.sortBy;
      params.page = filters.page;
      params.limit = filters.limit;

      const data = await api.getTasks(params);
      console.log('Tasks API response:', data);

      // Handle both { tasks: [] } and direct array response
      const taskList = Array.isArray(data) ? data : (data.tasks || []);
      setTasks(taskList);
      setTotal(data.total || taskList.length);
      setPages(data.pages || 1);
    } catch (err) {
      console.error('Load tasks error:', err);
      setError('Failed to load tasks. Make sure backend is running.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { if (user) loadTasks(); }, [user, loadTasks, refreshKey]);

  // ── CRUD handlers ──
  const openCreate = (parentId = null) => {
    setEditingTask(null);
    setForm({ ...emptyForm, parentId });
    setDialogOpen(true);
  };

  const openEdit = (task) => {
    setEditingTask(task);
    setForm({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
      status: task.status,
      parentId: task.parentId || null,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      const payload = {
        ...form,
        dueDate: form.dueDate && form.dueDate !== '0001-01-01' ? form.dueDate : null,
      };
      if (editingTask) {
        await api.updateTask(editingTask.id, payload);
      } else {
        await api.createTask(payload);
      }
      setDialogOpen(false);
      setForm(emptyForm);
      forceRefresh();
    } catch (err) {
      console.error('Save error:', err);
      setError('Failed to save task.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task and its subtasks?')) return;
    try {
      await api.deleteTask(id);
      forceRefresh();
    } catch {
      setError('Failed to delete task.');
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await api.updateTask(id, { status });
      setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t));
    } catch {
      setError('Failed to update status.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/auth');
  };

  // Only show root tasks; subtasks render recursively inside TaskCard
  const rootTasks = tasks.filter(t => !t.parentId);

  // Client-side search filter
  const filteredRoot = rootTasks.filter(t =>
    !search || t.title.toLowerCase().includes(search.toLowerCase()) || t.description?.toLowerCase().includes(search.toLowerCase())
  );

  const overdueCount = tasks.filter(t => t.isOverdue).length;
  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const pendingCount = tasks.filter(t => t.status === 'pending').length;

  if (!user) return null;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>

      {/* ── Header ── */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
        <Box>
          <Typography variant="h4" fontWeight={700}>Task Dashboard</Typography>
          <Typography variant="body2" color="text.secondary">Welcome back, {user.name}!</Typography>
        </Box>
        <Box display="flex" gap={1}>
          <Button variant="contained" startIcon={<Add />} onClick={() => openCreate()}>
            New Task
          </Button>
          <Button variant="outlined" color="inherit" startIcon={<Logout />} onClick={handleLogout}>
            Logout
          </Button>
        </Box>
      </Box>

      {/* ── Stats ── */}
      <Grid container spacing={2} mb={3}>
        {[
          { label: 'Total', value: total, color: 'primary.main' },
          { label: 'Pending', value: pendingCount, color: 'text.secondary' },
          { label: 'Completed', value: completedCount, color: 'success.main' },
          { label: 'Overdue', value: overdueCount, color: 'error.main' },
        ].map(stat => (
          <Grid item xs={6} sm={3} key={stat.label}>
            <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}>
              <Typography variant="h4" fontWeight={700} color={stat.color}>{stat.value}</Typography>
              <Typography variant="caption" color="text.secondary">{stat.label}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* ── Filters ── */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth size="small" placeholder="Search tasks..."
              value={search} onChange={e => setSearch(e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start"><Search /></InputAdornment> }}
            />
          </Grid>
          <Grid item xs={6} sm={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select label="Status" value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value, page: 1 }))}>
                <MenuItem value="">All</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="in-progress">In Progress</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} sm={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Priority</InputLabel>
              <Select label="Priority" value={filters.priority} onChange={e => setFilters(f => ({ ...f, priority: e.target.value, page: 1 }))}>
                <MenuItem value="">All</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="low">Low</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} sm={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Sort By</InputLabel>
              <Select label="Sort By" value={filters.sortBy} onChange={e => setFilters(f => ({ ...f, sortBy: e.target.value, page: 1 }))}>
                <MenuItem value="createdAt">Newest First</MenuItem>
                <MenuItem value="dueDate">Due Date</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} sm={2}>
            <Button fullWidth variant="outlined" size="small" onClick={() => { setFilters({ status: '', priority: '', sortBy: 'createdAt', page: 1, limit: 10 }); setSearch(''); }}>
              Clear
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* ── Error ── */}
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      {/* ── Task List ── */}
      {loading ? (
        <Box display="flex" justifyContent="center" py={6}><CircularProgress /></Box>
      ) : filteredRoot.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 2 }}>
          <Typography variant="h6" color="text.secondary">No tasks found</Typography>
          <Typography variant="body2" color="text.secondary" mb={2}>Create your first task to get started</Typography>
          <Button variant="contained" startIcon={<Add />} onClick={() => openCreate()}>Create Task</Button>
        </Paper>
      ) : (
        <Stack spacing={1}>
          {filteredRoot.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              allTasks={tasks}
              onEdit={openEdit}
              onDelete={handleDelete}
              onStatusChange={handleStatusChange}
              onAddSubtask={(parentId) => openCreate(parentId)}
            />
          ))}
        </Stack>
      )}

      {/* ── Pagination ── */}
      {pages > 1 && (
        <Box display="flex" justifyContent="center" mt={3}>
          <Pagination count={pages} page={filters.page} onChange={(_, p) => setFilters(f => ({ ...f, page: p }))} color="primary" />
        </Box>
      )}

      {/* ── Create/Edit Dialog ── */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingTask ? 'Edit Task' : form.parentId ? 'Add Subtask' : 'New Task'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField
              label="Title *" fullWidth value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            />
            <TextField
              label="Description" fullWidth multiline rows={3} value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Priority</InputLabel>
                  <Select label="Priority" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
                    <MenuItem value="low">Low</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="high">High</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select label="Status" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="in-progress">In Progress</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            <TextField
              label="Due Date" type="date" fullWidth value={form.dueDate}
              onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
              InputLabelProps={{ shrink: true }}
            />
            {form.parentId && (
              <Alert severity="info">This task will be created as a subtask.</Alert>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" disabled={saving || !form.title.trim()}>
            {saving ? <CircularProgress size={20} /> : editingTask ? 'Save Changes' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Dashboard;