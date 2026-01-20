import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { GameManager } from './GameManager';

const app = express();

// Enable CORS for all origins
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: false
}));

// Health check endpoint for Render
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
    res.json({ 
        status: 'Bull vs Bear Server Running',
        version: '1.0.0',
        endpoints: ['/health', '/start', '/reset']
    });
});

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
        credentials: false
    },
    transports: ['websocket', 'polling'],
    allowEIO3: true,
    pingTimeout: 60000,
    pingInterval: 25000
});
const gameManager = new GameManager(io);

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('joinGame', (name: string) => {
        gameManager.addPlayer(socket.id, name);
        // Auto-start for simplicity if 2 players join, or just manual start logic later
        // For now, let's just start immediately if it's the first player for testing
        gameManager.startPreMatch();
    });

    socket.on('selectAvatar', (avatarId) => {
        gameManager.handleSelectAvatar(socket.id, avatarId);
    });

    socket.on('selectStrategy', (strategyId) => {
        gameManager.handleSelectStrategy(socket.id, strategyId);
    });

    socket.on('buyAsset', (assetId: string, amount: number) => {
        gameManager.handleBuy(socket.id, assetId, amount);
    });

    socket.on('sellAsset', (assetId: string, amount: number) => {
        gameManager.handleSell(socket.id, assetId, amount);
    });

    socket.on('usePowerUp', (powerUpId: string) => {
        gameManager.handleUsePowerUp(socket.id, powerUpId);
    });

    socket.on('playAgain', () => {
        gameManager.handlePlayAgain();
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        gameManager.removePlayer(socket.id);
    });
});

// Simple endpoint to start game for testing
app.get('/start', (req, res) => {
    gameManager.startPreMatch();
    res.send('Game started');
});

app.get('/reset', (req, res) => {
    gameManager.handlePlayAgain();
    res.send('Game reset and started');
});

const PORT = parseInt(process.env.PORT || '3000', 10);

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
