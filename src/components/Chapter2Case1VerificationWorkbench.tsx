import { useRef, useState } from 'react'
import { Check, FileSearch, ScrollText } from 'lucide-react'
import { chapter2Case1Questions, chapter2MaterialDescriptions, chapter2MaterialLabels, chapter2MaterialProvenance } from '../data/chapter2'

export function Chapter2Case1VerificationWorkbench({ materialIds, fixedFactIds = [], onVerify }: { materialIds: string[]; fixedFactIds?: string[]; onVerify: (questionId: string, materialIds: string[]) => void }) {
  const questions = chapter2Case1Questions.filter((question) => !fixedFactIds.includes(question.id))
  const materialListRef = useRef<HTMLFieldSetElement>(null)
  const [activeQuestionId, setActiveQuestionId] = useState<(typeof chapter2Case1Questions)[number]['id']>(questions[0]?.id ?? 'self-escape')
  const [selectedByQuestion, setSelectedByQuestion] = useState<Record<string, string[]>>({})
  const activeQuestion = questions.find((question) => question.id === activeQuestionId) ?? questions[0]
  const requiredCount = activeQuestion?.requiredCount ?? 0
  const selectedMaterialIds = selectedByQuestion[activeQuestionId] ?? []
  const selectQuestion = (id: string) => {
    setActiveQuestionId(id as (typeof chapter2Case1Questions)[number]['id'])
    if (materialListRef.current) materialListRef.current.scrollTop = 0
  }
  const toggleMaterial = (id: string) => setSelectedByQuestion((current) => {
    const selected = current[activeQuestionId] ?? []
    return { ...current, [activeQuestionId]: selected.includes(id) ? selected.filter((item) => item !== id) : [...selected, id] }
  })
  const materialGroups = [
    { label: '现场与物证', kinds: ['现场勘验', '物证检视'] },
    { label: '文书原件', kinds: ['文书原件', '文书对照'] },
    { label: '独立签押口供', kinds: ['签押口供', '签押证言'] },
    { label: '口供与证言对照', kinds: ['口供对照', '证言对照'] },
  ].map((group) => ({ ...group, materials: materialIds.filter((id) => group.kinds.includes(chapter2MaterialProvenance[id]?.kind ?? '')) })).filter((group) => group.materials.length > 0)

  return <section className="verification-workbench" aria-labelledby="chapter2-case1-verification-heading">
    <header className="verification-heading"><span><FileSearch size={18} aria-hidden="true" /></span><div><h3 id="chapter2-case1-verification-heading">证据命题核验</h3><p>先选一条待证问题，再从已经取得的材料中选出一组能够互相印证的材料。</p></div><strong>雨夜失押</strong></header>
    <div className="verification-layout">
      <fieldset className="verification-questions" role="radiogroup" aria-labelledby="verification-question-heading"><legend id="verification-question-heading">一、选择待证问题</legend><div className="verification-question-list">{questions.map((question) => { const selected = question.id === activeQuestionId; return <button key={question.id} type="button" role="radio" aria-checked={selected} className={`verification-question${selected ? ' is-selected' : ''}`} onClick={() => selectQuestion(question.id)}><span aria-hidden="true">{selected ? <Check size={15} /> : null}</span><em>{question.stageLabel}</em><strong>{question.shortLabel}</strong><small>{question.prompt}</small></button> })}</div></fieldset>
      <div className="verification-material-panel">
        <fieldset ref={materialListRef} className="verification-materials"><legend>二、选取案卷材料</legend><p>本题须提交 {requiredCount} 项直接材料。材料可跨命题使用，但漏项、混入无关材料或全选都会退回。</p><div className="material-groups">{materialGroups.map((group) => <section key={group.label} className="material-group" aria-labelledby={`material-group-${group.label}`}><h4 id={`material-group-${group.label}`}>{group.label}<span>{group.materials.length}项</span></h4><div className="material-checklist">{group.materials.map((id) => { const checked = selectedMaterialIds.includes(id); const provenance = chapter2MaterialProvenance[id]; return <label key={id} className={checked ? 'is-selected' : ''}><input type="checkbox" aria-label={chapter2MaterialLabels[id] ?? id} checked={checked} onChange={() => toggleMaterial(id)} /><span aria-hidden="true">{checked ? <Check size={14} /> : null}</span><span className="material-file-details"><strong>{chapter2MaterialLabels[id] ?? id}</strong>{provenance && <em>{provenance.kind} · {provenance.source}</em>}<small>{chapter2MaterialDescriptions[id] ?? '已经取得的第二章案卷材料。'}</small>{provenance && <small className="material-formation">形成：{provenance.formation}</small>}</span></label> })}</div></section>)}</div></fieldset>
        <footer className="verification-submit"><p aria-live="polite">已选择 <strong>{selectedMaterialIds.length}</strong> / {requiredCount} 项材料{selectedMaterialIds.length < requiredCount ? `，还需至少 ${requiredCount - selectedMaterialIds.length} 项` : selectedMaterialIds.length === requiredCount ? '，请确认原件、口供与对照记录能够互相接续' : '，已超出本题所需数量，仍可呈交但会按精确组合复核'}</p><button type="button" className="button button-primary" disabled={selectedMaterialIds.length < requiredCount} onClick={() => onVerify(activeQuestionId, selectedMaterialIds)}><ScrollText size={17} aria-hidden="true" />呈交这组核验</button></footer>
      </div>
    </div>
  </section>
}
