const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// In-memory real-time chat & presence store
let chatMessages = [
    { id: 1, nick: 'Carlos SP', text: 'Consulta rápida e o CRLV saiu em 10 min!', time: '10:14', likes: 4, dislikes: 0, voted: null },
    { id: 2, nick: 'Ana RS', text: 'Muito bom, evitei um veículo com leilão oculto.', time: '10:20', likes: 7, dislikes: 0, voted: null }
];

let onlineSessions = {}; // sessionId -> { nick, lastSeen }

// Get chat messages
app.get('/api/chat', (req, res) => {
    res.json(chatMessages);
});

// Post new message
app.post('/api/chat', (req, res) => {
    const { nick, text } = req.body;
    if (nick && text) {
        const newMsg = {
            id: Date.now(),
            nick: nick.trim(),
            text: text.trim(),
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            likes: 0,
            dislikes: 0,
            voted: null
        };
        chatMessages.push(newMsg);
        res.json({ success: true, messages: chatMessages });
    } else {
        res.status(400).json({ success: false, error: 'Missing nick or text' });
    }
});

// Like / Dislike message
app.post('/api/chat/vote', (req, res) => {
    const { id, type } = req.body; // type: 'like' or 'dislike'
    const msg = chatMessages.find(m => m.id === id);
    if (msg) {
        if (type === 'like') {
            msg.likes++;
        } else if (type === 'dislike') {
            msg.dislikes++;
        }
        res.json({ success: true, messages: chatMessages });
    } else {
        res.status(404).json({ success: false, error: 'Message not found' });
    }
});

// Presence heartbeat & get online users
app.post('/api/presence', (req, res) => {
    const { sessionId, nick } = req.body;
    const now = Date.now();

    if (sessionId) {
        onlineSessions[sessionId] = {
            nick: nick || 'Visitante Anônimo',
            lastSeen: now
        };
    }

    // Clean up inactive sessions (> 10s)
    Object.keys(onlineSessions).forEach(id => {
        if (now - onlineSessions[id].lastSeen > 10000) {
            delete onlineSessions[id];
        }
    });

    const activeUsers = Object.values(onlineSessions).map(s => s.nick);
    res.json({
        onlineCount: activeUsers.length,
        activeUsers: activeUsers
    });
});

app.listen(PORT, () => {
    console.log(`ArgoCar Server running at http://localhost:${PORT}`);
});
