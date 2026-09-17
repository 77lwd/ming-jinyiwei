import { useState } from 'react'
import { Check, FileSearch, ScrollText } from 'lucide-react'
import { chapter2Case1Questions, chapter2MaterialDescriptions, chapter2MaterialLabels, chapter2MaterialProvenance } from '../data/chapter2'

export function Chapter2Case1VerificationWorkbench({ materialIds, fixedFactIds = [], onVerify }: { materialIds: string[]; fixedFactIds?: string[]; onVerify: (questionId: string, materialIds: string[]) => void }) {
  const questions = chapter2Case1Questions.filter((question) => !fixedFactIds.includes(question.id))
  const [activeQuestionId, setActiveQuestionId] = useState<(typeof chapter2Case1Questions)[number]['id']>(questions[0]?.id ?? 'self-escape')
  const [selectedMaterialIds, setSelectedMaterialIds] = useState<string[]>([])
  const activeQuestion = questions.find((question) => question.id === activeQuestionId) ?? questions[0]
  const requiredCount = activeQuestion?.requiredCount ?? 0
  const selectQuestion = (id: string) => { setActiveQuestionId(id as (typeof chapter2Case1Questions)[number]['id']); setSelectedMaterialIds([]) }
  const toggleMaterial = (id: string) => setSelectedMaterialIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])

  return <section className="verification-workbench" aria-labelledby="chapter2-case1-verification-heading">
    <header className="verification-heading"><span><FileSearch size={18} aria-hidden="true" /></span><div><h3 id="chapter2-case1-verification-heading">证据命题核验</h3><p>先选一条待证问题，再从已经取得的材料中选出一组能够互相印证的材料。</p></div><strong>雨夜失押</strong></header>
    <div className="verification-layout">
      <section className="verification-questions" aria-label="待证问题"><h4>一、选择待证问题</h4><div className="verification-question-list">{questions.map((question) => { const selected = question.id === activeQuestionId; return <button key={question.id} type="button" aria-pressed={selected} className={`verification-question${selected ? ' is-selected' : ''}`} onClick={() => selectQuestion(question.id)}><span>{selected ? <Check size={15} aria-hidden="true" /> : null}</span><em>{question.stageLabel}</em><strong>{question.shortLabel}</strong><small>{question.prompt}</small></button> })}</div></section>
      <fieldset className="verification-materials"><legend>二、选取案卷材料</legend><p>本题须提交 {requiredCount} 项直接材料。材料可跨命题使用，但漏项、混入无关材料或全选都会退回。</p><div className="material-checklist">{materialIds.map((id) => { const checked = selectedMaterialIds.includes(id); const provenance = chapter2MaterialProvenance[id]; return <label key={id} className={checked ? 'is-selected' : ''}><input type="checkbox" checked={checked} onChange={() => toggleMaterial(id)} /><span aria-hidden="true">{checked ? <Check size={14} /> : null}</span><span className="material-file-details"><strong>{chapter2MaterialLabels[id] ?? id}</strong>{provenance && <em>{provenance.kind} · {provenance.source}</em>}<small>{chapter2MaterialDescriptions[id] ?? '已经取得的第二章案卷材料。'}</small>{provenance && <small className="material-formation">形成：{provenance.formation}</small>}</span></label> })}</div></fieldset>
    </div>
    <footer className="verification-submit"><p aria-live="polite">已选择 <strong>{selectedMaterialIds.length}</strong> / {requiredCount} 项材料{selectedMaterialIds.length < requiredCount ? `，还需至少 ${requiredCount - selectedMaterialIds.length} 项` : selectedMaterialIds.length === requiredCount ? '，请确认原件、口供与对照记录能够互相接续' : '，已超出本题所需数量，仍可呈交但会按精确组合复核'}</p><button type="button" className="button button-primary" disabled={selectedMaterialIds.length < requiredCount} onClick={() => onVerify(activeQuestionId, selectedMaterialIds)}><ScrollText size={17} aria-hidden="true" />呈交这组核验</button></footer>
  </section>
}
