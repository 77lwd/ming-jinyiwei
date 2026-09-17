import { ChevronRight, ScrollText } from 'lucide-react'
import { chapter1MaterialDescriptions, chapter1MaterialLabels } from '../data/chapter1'
import { chapter2MaterialDescriptions, chapter2MaterialLabels } from '../data/chapter2'
import type { ChapterId, NarrativeBlock, NarrativeEvent } from '../types'
import { CaseContext } from './CaseContext'
import { NarrativePanel } from './NarrativePanel'

interface ResultPanelProps {
  chapter?: ChapterId
  node: string
  narrative: NarrativeBlock
  event: NarrativeEvent | undefined
  onConfirm: () => void
  onOpenCaseRecord?: () => void
}

export function ResultPanel({ chapter = 'chapter1', node, narrative, event, onConfirm, onOpenCaseRecord }: ResultPanelProps) {
  const isChapterOneClosure = node === 'chapter1.case-closed'
  const isChapterTwoCaseOneClosure = chapter === 'chapter2' && node === 'chapter2.case1-authority-review'
  const isClosure = isChapterOneClosure || isChapterTwoCaseOneClosure
  const isNightPreservation = node === 'chapter1.night-preservation'
  const hasFiledMaterials = Boolean(event?.acquiredMaterialIds?.length)
  const receiptLabel = isClosure ? '案件封结回执' : isNightPreservation ? '夜间保全回执' : '核验回执'
  const authorityLabel = isClosure ? '封结批示' : isNightPreservation ? '保全批示' : '核验批示'
  const materialLabels = chapter === 'chapter2' ? chapter2MaterialLabels : chapter1MaterialLabels
  const materialDescriptions = chapter === 'chapter2' ? chapter2MaterialDescriptions : chapter1MaterialDescriptions
  return (
    <section className={`result-view${isClosure ? ' closure-result' : ''}${hasFiledMaterials ? ' material-result' : ''}${isNightPreservation ? ' preservation-result' : ''}`} aria-label="选择结果">
      <NarrativePanel narrative={narrative}>
        <section className="result-pause" aria-label="覃保坤核验回执">
          <div className="result-document-meta" aria-hidden="true"><span>北镇抚司</span><span>{chapter === 'chapter2' ? '第二章案牍' : '第一章案牍'}</span></div>
          <div className="result-authority"><img src="/assets/chapter1/characters/qian-baokun-portrait-v1.png" alt="覃保坤" /><span><strong>覃保坤</strong><small>百户 · 本案承办</small></span><em>{authorityLabel}</em></div>
          <CaseContext node={node} />
          <section className="result-consequences" aria-labelledby="result-consequences-heading">
            <div className="result-consequences-heading">
              <ScrollText size={18} aria-hidden="true" />
              <h2 id="result-consequences-heading">{receiptLabel}</h2>
            </div>
            {isChapterOneClosure ? <div className="closure-stamp"><span className="closure-seal" aria-hidden="true">封</span><strong>纸铺失火案 · 已正式封结</strong><p>责任判断已通过复核，程序处置已由覃保坤主持完成。</p><ul><li>关键事实已固定</li><li>卷宗完成归档</li><li>后续进入证物保全与案后交接</li></ul></div> : isChapterTwoCaseOneClosure ? <div className="closure-stamp chapter2-closure-stamp"><span className="closure-seal" aria-hidden="true">封</span><strong>雨夜失押 · 已正式封结</strong><p>本案结清的是失押责任与违规交接，不把尚未查明的去向写成已经侦破。</p><ul className="closure-findings"><li><b>案件结论</b><span>马骁并非自行脱逃；锁扣、车辕与拖痕证明翻车现场经过人为布置，真实凭照被用于未经核验的交接。</span></li><li><b>程序处置</b><span>{event?.id.includes('preserve-guard-responsibility') ? '周六与赵七的失职责任分别入卷，凭照存根封存，责任材料完成移交。' : event?.id.includes('follow-river-transfer') ? '违规转移事实入卷，河埠与城南方向材料封存，押役责任另列待核。' : '已查清事实与责任建议分别入卷，由覃保坤落签封存。'}</span></li><li><b>仍待追查</b><span>马骁去向仍列待查；谁安排转移、凭照从何人手中流出，本案不作越证结论。</span></li></ul></div> : event?.acquiredMaterialIds?.length ? <div className="materials-filed" role="region" aria-label="材料入档"><strong>材料入档 · 新增 {event.acquiredMaterialIds.length} 项</strong><ul>{event.acquiredMaterialIds.map((id, index) => <li key={id}><span className="material-index" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span><span className="material-file-copy"><b>{materialLabels[id] ?? id}</b><span>{materialDescriptions[id] ?? '已记录入案卷。'}</span></span><em>已入档</em></li>)}</ul><p>已收入案情记录，可随时查看。</p>{onOpenCaseRecord && <button type="button" className="button button-secondary" onClick={onOpenCaseRecord}>查看案情记录</button>}</div> : event?.effects.length ? <ul>{event.effects.map((effect, index) => <li key={`${effect}-${index}`}>{effect}</li>)}</ul> : <p className="result-consequences-empty">{isNightPreservation ? '这一项保全已写入夜间笔录；其余现场条件将在第二日复核时显出后果。' : '这一步先固定调查方向；完整事实将在继续核验后写入案件工作板。'}</p>}
          </section>
          <div className="dossier-continue"><button className="button button-primary" data-audio-sfx="confirm" onClick={onConfirm}>{isChapterOneClosure ? '进入证物归档' : isChapterTwoCaseOneClosure ? '进入案后交接' : '将核验结果写入案卷'} <ChevronRight size={18} /></button></div>
        </section>
      </NarrativePanel>
    </section>
  )
}
