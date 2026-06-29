const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// In-memory data store for prototype
const db = {
  users: [],
  folders: [],
  tasks: [],
  expenses: []
};

// --- Mock AI Arrangement ---
app.post('/api/arrange-tasks', (req, res) => {
  const { tasks } = req.body;
  // Mocking AI rearranging logic based on some heuristic or just randomly for now
  if (!tasks || !Array.isArray(tasks)) {
    return res.status(400).json({ error: 'Tasks array required' });
  }
  const arranged = [...tasks].sort((a, b) => a.text.localeCompare(b.text)); // Simple sort mock
  res.json({ arranged });
});

// --- Mock Disease Detector ---
app.post('/api/detect-disease', (req, res) => {
  const { type, symptoms } = req.body; // type: 'plant' | 'animal'
  
  if (!symptoms) return res.status(400).json({ error: 'Symptoms required' });

  // Simple mock response based on type
  let suggestions = [];
  if (type === 'plant') {
    if (symptoms.toLowerCase().includes('yellow')) {
      suggestions.push({ name: 'Nitrogen Deficiency', description: 'Leaves turning yellow, usually starting at the bottom.' });
      suggestions.push({ name: 'Overwatering', description: 'Yellowing leaves that may feel mushy.' });
    } else {
      suggestions.push({ name: 'General Fungal Infection', description: 'Spots on leaves, stunted growth.' });
    }
  } else {
    // Animal
    if (symptoms.toLowerCase().includes('cough') || symptoms.toLowerCase().includes('sneeze')) {
      suggestions.push({ name: 'Respiratory Infection', description: 'Coughing, sneezing, nasal discharge.' });
      suggestions.push({ name: 'Kennel Cough (Dogs)', description: 'Dry, honking cough.' });
    } else {
      suggestions.push({ name: 'Gastroenteritis', description: 'Lethargy, potential vomiting or diarrhea.' });
    }
  }

  res.json({ suggestions });
});

// --- User / Social Routes ---
app.post('/api/login', (req, res) => {
  const { name, email, pfpUrl } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });

  // Generate 9 digit unique ID
  const uniqueId = Math.floor(100000000 + Math.random() * 900000000).toString();
  
  const newUser = { id: uniqueId, name, email, pfpUrl, friends: [] };
  db.users.push(newUser);

  res.json({ user: newUser });
});

app.post('/api/add-friend', (req, res) => {
  const { userId, friendId } = req.body;
  const user = db.users.find(u => u.id === userId);
  const friend = db.users.find(u => u.id === friendId);

  if (user && friend) {
    if (!user.friends.includes(friendId)) user.friends.push(friendId);
    if (!friend.friends.includes(userId)) friend.friends.push(userId); // Mutual
    res.json({ success: true, friends: user.friends });
  } else {
    res.status(404).json({ error: 'User or Friend not found' });
  }
});


// Basic health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
