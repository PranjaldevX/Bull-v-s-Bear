
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000');

socket.on('connect', () => {
    console.log('Connected to server');
    socket.emit('joinGame', 'Tester');
});

socket.on('gameState', (state: any) => {
    console.log(`Phase: ${state.phase}, Round: ${state.currentRound}`);

    if (state.phase === 'PRE_MATCH' && state.subPhase === 'INTRO' && state.currentRound === 0) {
        console.log("SUCCESS: Game reset correctly.");
        process.exit(0);
    }
});

// Simulate Play Again after a delay (simulating game end)
setTimeout(() => {
    console.log('Sending playAgain...');
    socket.emit('playAgain');
}, 2000);

// Timeout
setTimeout(() => {
    console.log("Timeout waiting for reset.");
    process.exit(1);
}, 5000);
