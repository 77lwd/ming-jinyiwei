import { useRef, useState } from 'react'
import { Check, FileSearch, ScrollText } from 'lucide-react'
import {
  chapter2Case2MaterialDescriptions,
  chapter2Case2MaterialLabels,
  chapter2Case2MaterialProvenance,
  chapter2Case2Questions,
} from '../data/chapter2Case2'

export function Chapter2Case2VerificationWorkbench({ materialIds, fixedFactIds = [], onVerify }: {
  materialIds: string[]
  fixedFactIds?: string[]
  onVerify: (questionId: string, materialIds: string[]) => void
}) {
  const questions = chapter2Case2Questions.filter((question) => !fixedFactIds.includes(question.id))
  const materialListRef = useRef<HTMLFieldSetElement>(null)
  const [activeQuestionId, setActiveQuestionId] = useState<(typeof chapter2Case2Questions)[number]['id']>(questions[0]?.id ?? 'voluntary-hiding-pressure')
  const [selectedByQuestion, setSelectedByQuestion] = useState<Record<string, string[]>>({})
  const activeQuestion = questions.find((question) => question.id === activeQuestionId) ?? questions[0]
  const selectedMaterialIds = selectedByQuestion[activeQuestionId] ?? []

  const selectQuestion = (id: string) => {
    setActiveQuestionId(id as (typeof chapter2Case2Questions)[number]['id'])
    if (materialListRef.current) materialListRef.current.scrollTop = 0
  }

  const toggleMaterial = (id: string) => setSelectedByQuestion((current) => {
    const selected = current[activeQuestionId] ?? []
    return { ...current, [activeQuestionId]: selected.includes(id) ? selected.filter((item) => item !== id) : [...selected, id] }
  })

  const materialGroups = [
    { label: '现场与物证', kinds: ['现场勘验', '物证检视'] },
    { label: '副契与债务文书', kinds: ['文书原件', '账册核验', '文书对照'] },
    { label: '凭照与交接', kinds: ['凭照原件', '权限核验', '交割记录'] },
    { label: '签押口供与对照', kinds: ['签押口供', '签押证言', '口供对照', '凭照对照'] },
  ].map((group) => ({ ...group, materials: materialIds.filter((id) => group.kinds.includes(chapter2Case2MaterialProvenance[id]?.kind ?? '')) })).filter((group) => group.materials.length > 0)

  if (!activeQuestion) return null

  return <section className="verification-workbench" aria-labelledby="chapter2-case2-verification-heading">
    <header className="verification-heading"><span><FileSearch size={18} aria-hidden="true" /></span><div><h3 id="chapter2-case2-verification-heading">第二案材料核验</h3><p>每条命题都必须提交一组精确材料。全选、混入无关材料或缺少一项，都会退回待核。</p></div><strong>空屋里的嫁妆</strong></header>
    <div className="verification-layout">
      <fieldset className="verification-questions" role="radiogroup" aria-labelledby="case2-verification-question-heading"><legend id="case2-verification-question-heading">一、选择待证命题</legend><div className="verification-question-list">{questions.map((question) => { const selected = question.id === activeQuestionId; return <button key={question.id} type="button" role="radio" aria-checked={selected} className={`verification-question${selected ? ' is-selected' : ''}`} onClick={() => selectQuestion(question.id)}><span aria-hidden="true">{selected ? <Check size={15} /> : null}</span><em>{question.stageLabel}</em><strong>{question.shortLabel}</strong><small>{question.prompt}</small></button> })}</div></fieldset>
      <div className="verification-material-panel">
        <fieldset ref={materialListRef} className="verification-materials"><legend>二、选取案卷材料</legend><p>本题须提交 {activeQuestion.requiredCount} 项直接材料。每项材料的来源、取得方式和形成理由都已写入案卷。</p><div className="material-groups">{materialGroups.map((group) => <section key={group.label} className="material-group" aria-labelledby={`case2-material-group-${group.label}`}><h4 id={`case2-material-group-${group.label}`}>{group.label}<span>{group.materials.length}项</span></h4><div className="material-checklist">{group.materials.map((id) => { const checked = selectedMaterialIds.includes(id); const provenance = chapter2Case2MaterialProvenance[id]; return <label key={id} className={checked ? 'is-selected' : ''}><input type="checkbox" aria-label={chapter2Case2MaterialLabels[id] ?? id} checked={checked} onChange={() => toggleMaterial(id)} /><span aria-hidden="true">{checked ? <Check size={14} /> : null}</span><span className="material-file-details"><strong>{chapter2Case2MaterialLabels[id] ?? id}</strong>{provenance && <em>{provenance.kind} · {provenance.source}</em>}<small>{chapter2Case2MaterialDescriptions[id] ?? '已取得的第二案案卷材料。'}</small>{provenance && <small className="material-formation">形成：{provenance.formation}</small>}</span></label> })}</div></section>)}</div></fieldset>
        <footer className="verification-submit"><p aria-live="polite">已选择 <strong>{selectedMaterialIds.length}</strong> / {activeQuestion.requiredCount} 项材料{selectedMaterialIds.length < activeQuestion.requiredCount ? `，还需至少 ${activeQuestion.requiredCount - selectedMaterialIds.length} 项` : selectedMaterialIds.length === activeQuestion.requiredCount ? '，请确认材料能够共同回答本题' : '，已超出本题所需数量，呈交后会退回'}</p><button type="button" className="button button-primary" disabled={selectedMaterialIds.length < activeQuestion.requiredCount} onClick={() => onVerify(activeQuestion.id, selectedMaterialIds)}><ScrollText size={17} aria-hidden="true" />呈交这组核验</button></footer>
      </div>
    </div>
  </section>
}
