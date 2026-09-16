import { ArrowRight, History, Shield } from 'lucide-react'
import { AudioSettingsPanel } from './AudioSettingsPanel'
import { DeveloperMenu } from './DeveloperMenu'
import type { DeveloperCheckpointId } from '../engine/gameEngine'

interface TitleScreenProps {
  hasSave: boolean
  saveError: string | null
  onNewGame: () => void
  onContinue: () => void
  onDeveloperStart?: (checkpoint: DeveloperCheckpointId) => void
}

export function TitleScreen({ hasSave, saveError, onNewGame, onContinue, onDeveloperStart }: TitleScreenProps) {
  const startNewGame = () => {
    if (!hasSave || window.confirm('确定覆盖当前存档并重新开始吗？')) onNewGame()
  }

  return (
    <main className="title-screen">
      <div className="title-art" aria-hidden="true" />
      <AudioSettingsPanel />
      {onDeveloperStart && <DeveloperMenu onStart={onDeveloperStart} />}
      <section className="title-content" aria-labelledby="game-title">
        <div className="title-kicker"><Shield size={16} /> 单机文字角色扮演</div>
        <h1 id="game-title">我在明朝当锦衣卫</h1>
        <p className="title-era">崇祯元年 · 北镇抚司</p>
        <p className="title-copy">十五年前，一场火带走了廖家。如今，你穿上飞鱼服，从第一份旧卷开始追查。</p>
        {saveError && <p className="save-error" role="alert">{saveError}，你仍可开始新游戏。</p>}
        <div className="title-actions">
          {hasSave && (
            <button className="button button-primary" onClick={onContinue}>
              <History size={18} /> 继续游戏
            </button>
          )}
          <button className={hasSave ? 'button button-secondary' : 'button button-primary'} onClick={startNewGame}>
            {hasSave ? '重新开始' : '开始新游戏'} <ArrowRight size={18} />
          </button>
        </div>
      </section>
    </main>
  )
}
