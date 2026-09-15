import { useState } from 'react'
import { Check, FileSearch, ScrollText } from 'lucide-react'
import { chapter2MaterialDescriptions, chapter2MaterialLabels } from '../data/chapter2'

const questions = [
  { id: 'guard-duty', shortLabel: '押役是否存在失职？', prompt: '核对换押手续、现场锁扣与押役亲见口供。' },
  { id: 'illegal-transfer', shortLabel: '马骁是否经过违规转移？', prompt: '核对换押存根、锁扣状态与河埠转运证言。' },
]

export function Chapter2Case1VerificationWorkbench({ materialIds, onVerify }: { materialIds: string[]; onVerify: (questionId: string, materialIds: string[]) => void }) {
  const [activeQuestionId, setActiveQuestionId] = useState(questions[0].id)
  const [selectedMaterialIds, setSelectedMaterialIds] = useState<string[]>([])
  const selectQuestion = (id: string) => { setActiveQuestionId(id); setSelectedMaterialIds([]) }
  const toggleMaterial = (id: string) => setSelectedMaterialIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])

  return <section className="verification-workbench" aria-labelledby="chapter2-case1-verification-heading">
    <header className="verification-heading"><span><FileSearch size={18} aria-hidden="true" /></span><div><h3 id="chapter2-case1-verification-heading">证据命题核验</h3><p>先选一条待证问题，再从已经取得的材料中选出一组能够互相印证的材料。</p></div><strong>雨夜失押</strong></header>
    <div className="verification-layout">
      <section className="verification-questions" aria-label="待证问题"><h4>一、选择待证问题</h4><div className="verification-question-list">{questions.map((question) => { const selected = question.id === activeQuestionId; return <button key={question.id} type="button" aria-pressed={selected} className={`verification-question${selected ? ' is-selected' : ''}`} onClick={() => selectQuestion(question.id)}><span>{selected ? <Check size={15} aria-hidden="true" /> : null}</span><strong>{question.shortLabel}</strong><small>{question.prompt}</small></button> })}</div></section>
      <fieldset className="verification-materials"><legend>二、选取案卷材料</legend><p>这里只显示已经取得的材料。混入无关材料不能加强命题，反而会使证据链失焦。</p><div className="material-checklist">{materialIds.map((id) => { const checked = selectedMaterialIds.includes(id); return <label key={id} className={checked ? 'is-selected' : ''}><input type="checkbox" checked={checked} onChange={() => toggleMaterial(id)} /><span aria-hidden="true">{checked ? <Check size={14} /> : null}</span><strong>{chapter2MaterialLabels[id] ?? id}</strong><small>{chapter2MaterialDescriptions[id] ?? '已经取得的第二章案卷材料。'}</small></label> })}</div></fieldset>
    </div>
    <footer className="verification-submit"><p aria-live="polite">已选择 <strong>{selectedMaterialIds.length}</strong> 项材料{selectedMaterialIds.length < 3 ? '，至少还需补齐一项' : '，请确认每项都直接支撑命题'}</p><button type="button" className="button button-primary" disabled={selectedMaterialIds.length < 3} onClick={() => onVerify(activeQuestionId, selectedMaterialIds)}><ScrollText size={17} aria-hidden="true" />呈交这组核验</button></footer>
  </section>
}
