import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import { GameState, ClientToServerEvents, ServerToClientEvents, GameResult, AvatarId, StrategyId } from '@bvb/shared';

interface GameStore {
    socket: Socket<ServerToClientEvents, ClientToServerEvents> | null;
    gameState: GameState | null;
    gameResults: GameResult[] | null;
    isConnected: boolean;
    playerName: string;

    connect: (name: string) => void;
    joinGame: () => void;
    selectAvatar: (avatarId: AvatarId) => void;
    selectStrategy: (strategyId: StrategyId) => void;
    buyAsset: (assetId: string, amount: number) => void;
    sellAsset: (assetId: string, amount: number) => void;
    usePowerUp: (powerUpId: string) => void;
    playAgain: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
    socket: null,
    gameState: null,
    gameResults: null,
    isConnected: false,
    playerName: '',

    connect: (name: string) => {
        console.log('Connecting to server with name:', name);
        const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';
        console.log('Server URL:', serverUrl);
        const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(serverUrl);

        socket.on('connect', () => {
            console.log('Socket connected:', socket.id);
            set({ isConnected: true, socket });
            socket.emit('joinGame', name);
        });

        socket.on('disconnect', () => {
            console.log('Socket disconnected');
            set({ isConnected: false, socket: null });
        });

        socket.on('gameState', (state: GameState) => {
            console.log('Received gameState:', state);
            set({ gameState: state });
        });

        socket.on('gameOver', (results: GameResult[]) => {
            console.log('Received gameOver:', results);
            set({ gameResults: results });
        });

        set({ playerName: name });
    },

    joinGame: () => {
        // Handled in connect for now
    },

    selectAvatar: (avatarId: AvatarId) => {
        const { socket } = get();
        if (socket) {
            socket.emit('selectAvatar', avatarId);
        }
    },

    selectStrategy: (strategyId: StrategyId) => {
        const { socket } = get();
        if (socket) {
            socket.emit('selectStrategy', strategyId);
        }
    },

    buyAsset: (assetId: string, amount: number) => {
        const { socket } = get();
        if (socket) {
            socket.emit('buyAsset', assetId, amount);
        }
    },

    sellAsset: (assetId: string, amount: number) => {
        const { socket } = get();
        if (socket) {
            socket.emit('sellAsset', assetId, amount);
        }
    },

    usePowerUp: (powerUpId: string) => {
        const { socket } = get();
        if (socket) {
            socket.emit('usePowerUp', powerUpId);
        }
    },

    playAgain: () => {
        const { socket } = get();
        if (socket) {
            // Clear game results immediately so the modal closes
            set({ gameResults: null });
            socket.emit('playAgain');
        }
    }
}));
