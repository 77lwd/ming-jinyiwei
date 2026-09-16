import { ChapterComplete } from './components/ChapterComplete'
import { AudioInteractionBridge } from './components/AudioInteractionBridge'
import { GameLayout } from './components/GameLayout'
import { PrologueView } from './components/PrologueView'
import { TitleScreen } from './components/TitleScreen'
import { useGameStore } from './store/gameStore'
import './styles/app.css'

export default function App() {
  const screen = useGameStore((state) => state.screen)
  const phase = useGameStore((state) => state.phase)
  const prologueScene = useGameStore((state) => state.prologueScene)
  const hasSave = useGameStore((state) => state.hasSave)
  const saveError = useGameStore((state) => state.saveError)
  const newGame = useGameStore((state) => state.newGame)
  const continueGame = useGameStore((state) => state.continueGame)
  const nextPrologue = useGameStore((state) => state.nextPrologue)
  const skipPrologue = useGameStore((state) => state.skipPrologue)
  const startDeveloperCheckpoint = useGameStore((state) => state.startDeveloperCheckpoint)

  return <>
    <AudioInteractionBridge />
    {screen === 'title' && <TitleScreen hasSave={hasSave} saveError={saveError} onNewGame={newGame} onContinue={continueGame} onDeveloperStart={import.meta.env.DEV ? startDeveloperCheckpoint : undefined} />}
    {screen === 'complete' && <ChapterComplete />}
    {screen === 'game' && phase === 'prologue' && <PrologueView sceneIndex={prologueScene} onNext={nextPrologue} onSkip={skipPrologue} />}
    {screen === 'game' && phase !== 'prologue' && <GameLayout />}
  </>
}
