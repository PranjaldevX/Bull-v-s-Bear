import { useState } from 'react';
import { useGameStore } from './store/gameStore';
import { Lobby } from './components/Lobby';
import { GameDashboard } from './components/GameDashboard';
import { Intro } from './components/PreMatch/Intro';
import { AvatarSelection } from './components/PreMatch/AvatarSelection';
import { StrategySelection } from './components/PreMatch/StrategySelection';
import { ScenarioTeaser } from './components/PreMatch/ScenarioTeaser';
import { LandingPage } from './components/LandingPage';

function App() {
    const isConnected = useGameStore(state => state.isConnected);
    const gameState = useGameStore(state => state.gameState);
    const [showLanding, setShowLanding] = useState(true);

    if (showLanding) {
        return <LandingPage onContinue={() => setShowLanding(false)} />;
    }

    if (!isConnected || !gameState) {
        return <Lobby />;
    }

    if (gameState.phase === 'PRE_MATCH') {
        switch (gameState.subPhase) {
            case 'INTRO': return <Intro />;
            case 'AVATAR_SELECTION': return <AvatarSelection />;
            case 'STRATEGY_SELECTION': return <StrategySelection />;
            case 'SCENARIO_TEASER': return <ScenarioTeaser />;
            default: return <Intro />;
        }
    }

    return <GameDashboard />;
}

export default App;
