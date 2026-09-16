import { useEffect, useRef, useState } from 'react'
import { BookOpen, ChevronRight, FileText, HeartHandshake, RotateCcw, X } from 'lucide-react'
import { getMainlineChoices } from '../engine/gameEngine'
import { useGameStore } from '../store/gameStore'
import { AudioSettingsPanel } from './AudioSettingsPanel'
import { CaseContext } from './CaseContext'
import { CaseRecord } from './CaseRecord'
import { CaseProgress, InvestigationChoices } from './CaseWorkbench'
import { Chapter1VerificationWorkbench } from './Chapter1VerificationWorkbench'
import { Chapter1PetitionWorkbench } from './Chapter1PetitionWorkbench'
import { Chapter2RegisterWorkbench } from './Chapter2RegisterWorkbench'
import { Chapter2Case1VerificationWorkbench } from './Chapter2Case1VerificationWorkbench'
import { Chapter2CaseContext, Chapter2CaseProgress, Chapter2CaseRecord, Chapter2InvestigationChoices } from './Chapter2CaseWorkbench'
import { NarrativePanel } from './NarrativePanel'
import { NetworkDrawer } from './NetworkDrawer'
import type { NetworkId } from '../data/network'
import { RecentEvents } from './RecentEvents'
import { ResultPanel } from './ResultPanel'
import { StatusRail } from './StatusRail'

export function GameLayout() {
  const state = useGameStore()
  const [drawer, setDrawer] = useState<'dossier' | 'record' | 'network' | null>(null)
  const [networkInitialSelection, setNetworkInitialSelection] = useState<NetworkId | undefined>()
  const closeDrawerRef = useRef<HTMLButtonElement>(null)
  const mainlineChoices = getMainlineChoices(state)
  const continueLabels: Record<string, string> = {
    'chapter1.entry': '随覃百户前往城南',
    'chapter1.day1-evidence': '整理两处初核',
    'chapter1.case-closed': '清点火场遗留物',
    'chapter1.charred-token': '将木牌单独入档',
    'chapter1.feng-reunion': '结束第一章',
  }

  useEffect(() => {
    if (!drawer) return
    closeDrawerRef.current?.focus()
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setDrawer(null)
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [drawer])

  const openNetwork = (initialSelectedId?: NetworkId) => {
    setNetworkInitialSelection(initialSelectedId)
    setDrawer('network')
  }

  return (
    <main className={`game-shell${state.phase === 'mainline' && state.mainlineNode === 'chapter1.paper-shop-fire' ? ' fire-desk-sample' : ''}`}>
      <header className="game-header">
        <div className="game-wordmark"><span>锦衣卫</span><strong>北镇抚司案牍</strong></div>
        <div className="chapter-mark"><span>当前章节</span><strong>{state.chapter === 'chapter1' ? '第一章 · 纸灰里的银子' : state.chapter === 'chapter2' ? '第二章 · 失号凭照' : state.chapter}</strong></div>
        <div className="header-actions">
          <AudioSettingsPanel />
          <button className="icon-button" aria-label="重新开始" title="重新开始" onClick={() => { if (window.confirm('确定清除当前进度并返回标题吗？')) state.restart() }}><RotateCcw size={18} /></button>
        </div>
      </header>

      <div className="game-workspace">
        <nav className="desk-tools" aria-label="案桌工具">
          <button className="desk-tool" type="button" aria-label="个人档案" title="个人档案" onClick={() => setDrawer('dossier')}><BookOpen size={19} /><span>档案</span></button>
          <button className="desk-tool" type="button" aria-label="案情记录" title="案情记录" onClick={() => setDrawer('record')}><FileText size={19} /><span>案情</span></button>
        </nav>
        <aside className="desk-network" aria-label="人脉入口">
          <button className="desk-tool" type="button" aria-label="人脉" title="人脉" onClick={() => openNetwork()}><HeartHandshake size={19} /><span>人脉</span></button>
        </aside>

        <section className="play-column">
          {state.phase === 'mainline' ? (
            <section className="case-desk">
              {state.chapter === 'chapter1' && <CaseProgress node={state.mainlineNode} />}
              {state.chapter === 'chapter2' && <Chapter2CaseProgress node={state.mainlineNode} investigation={state.chapter2Investigation} />}
              <NarrativePanel narrative={state.currentNarrative}>
                {state.chapter === 'chapter1' && state.mainlineNode === 'chapter1.feng-reunion' && state.flags.tianshun_reconnected && <section className="relationship-update" aria-label="人脉更新"><img src="/assets/chapter1/characters/feng-tianshun-portrait-v1.png" alt="冯天顺肖像" /><div><strong>人脉更新</strong><span>冯天顺已加入你的人脉</span><small>关系阶段：熟悉 · 他仍把你当作儿时兄弟，愿意与你恢复往来。</small></div><button type="button" className="button button-secondary" onClick={() => openNetwork('feng_tianshun')}>查看人脉</button></section>}
                {state.chapter === 'chapter1' && <CaseContext node={state.mainlineNode} />}
                {state.chapter === 'chapter2' && <Chapter2CaseContext node={state.mainlineNode} />}
                {state.chapter === 'chapter2' && state.mainlineNode === 'chapter2.case1-close-review' ? (
                  <Chapter2Case1VerificationWorkbench materialIds={state.chapter2Investigation.caseMaterialIds ?? []} fixedFactIds={state.chapter2Investigation.fixedFactIds} onVerify={state.submitChapter2Case1Verification} />
                ) : state.chapter === 'chapter2' && state.mainlineNode === 'chapter2.register-review' ? (
                  <Chapter2RegisterWorkbench investigation={state.chapter2Investigation} onVerify={state.submitChapter2RegisterVerification} />
                ) : state.chapter === 'chapter1' && state.mainlineNode === 'chapter1.day2-verify' ? (
                  <Chapter1VerificationWorkbench investigation={state.chapter1Investigation} supplementalChoices={mainlineChoices} onSupplement={state.chooseMainline} onVerify={state.submitChapter1Verification} />
                ) : state.chapter === 'chapter1' && state.mainlineNode === 'chapter1.authorization-review' ? (
                  <Chapter1PetitionWorkbench fixedFactIds={state.chapter1Investigation.fixedFactIds} choices={mainlineChoices} onChoose={state.chooseMainline} />
                ) : mainlineChoices.length ? (
                  state.chapter === 'chapter1' ? <InvestigationChoices choices={mainlineChoices} onChoose={state.chooseMainline} /> : state.chapter === 'chapter2' ? <Chapter2InvestigationChoices node={state.mainlineNode} choices={mainlineChoices} onChoose={state.chooseMainline} /> : <div className="event-choices">{mainlineChoices.map((choice) => <button key={choice.id} data-audio-sfx="choice" onClick={() => state.chooseMainline(choice.id)}><span><strong>{choice.label}</strong></span><ChevronRight size={18} /></button>)}</div>
                ) : (
                  <div className="dossier-continue"><button className="button button-primary" data-audio-sfx="confirm" onClick={state.advanceMainline}>{continueLabels[state.mainlineNode] ?? '继续办差'} <ChevronRight size={18} /></button></div>
                )}
              </NarrativePanel>
            </section>
          ) : state.phase === 'result' ? (
              <ResultPanel chapter={state.chapter} node={state.mainlineNode} narrative={state.currentNarrative} event={state.recentEvents[0]} onConfirm={state.confirmResult} onOpenCaseRecord={() => setDrawer('record')} />
          ) : null}
        </section>

      </div>
      {drawer && <div className="drawer-backdrop" role="presentation" onClick={() => setDrawer(null)}><aside className="dossier-drawer" role="dialog" aria-modal="true" aria-label={drawer === 'dossier' ? '个人档案' : drawer === 'network' ? '人脉' : '案情记录'} onClick={(event) => event.stopPropagation()}><button ref={closeDrawerRef} className="drawer-close" aria-label="关闭" onClick={() => setDrawer(null)}><X size={18} /></button>{drawer === 'dossier' ? <StatusRail /> : drawer === 'network' ? <NetworkDrawer initialSelectedId={networkInitialSelection} onClose={() => setDrawer(null)} /> : state.chapter === 'chapter1' ? <CaseRecord node={state.mainlineNode} events={state.recentEvents} investigation={state.chapter1Investigation} /> : state.chapter === 'chapter2' ? <Chapter2CaseRecord investigation={state.chapter2Investigation} /> : <RecentEvents />}</aside></div>}
    </main>
  )
}
