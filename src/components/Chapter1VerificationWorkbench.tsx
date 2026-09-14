import { useMemo, useState } from 'react'
import { Check, FileSearch, ScrollText } from 'lucide-react'
import { chapter1InvestigationBlueprint, chapter1MaterialDescriptions, chapter1MaterialLabels } from '../data/chapter1'
import type { Chapter1InvestigationState, Chapter1QuestionId } from '../types'

interface Props {
  investigation: Chapter1InvestigationState
  supplementalChoices: Array<{ id: string; label: string }>
  onSupplement: (choiceId: string) => void
  onVerify: (questionId: Chapter1QuestionId, materialIds: string[]) => void
}

export function Chapter1VerificationWorkbench({ investigation, supplementalChoices, onSupplement, onVerify }: Props) {
  const questions = useMemo(
    () => chapter1InvestigationBlueprint.openQuestions.filter((question) => investigation.openQuestionIds.includes(question.id)),
    [investigation.openQuestionIds],
  )
  const [activeQuestionId, setActiveQuestionId] = useState<Chapter1QuestionId | null>(questions[0]?.id ?? null)
  const [selectedMaterialIds, setSelectedMaterialIds] = useState<string[]>([])
  const currentQuestionId = questions.some((question) => question.id === activeQuestionId) ? activeQuestionId : questions[0]?.id ?? null

  const selectQuestion = (questionId: Chapter1QuestionId) => {
    setActiveQuestionId(questionId)
    setSelectedMaterialIds([])
  }

  const toggleMaterial = (materialId: string) => {
    setSelectedMaterialIds((current) => current.includes(materialId) ? current.filter((id) => id !== materialId) : [...current, materialId])
  }

  return <section className="verification-workbench" aria-labelledby="verification-heading">
    <header className="verification-heading">
      <span><FileSearch size={18} aria-hidden="true" /></span>
      <div><h3 id="verification-heading">证据命题核验</h3><p>先选一条待证问题，再从已经取得的材料中选出一组能够互相印证的材料。</p></div>
      <strong>{investigation.fixedFactIds.length} 项已固定</strong>
    </header>

    <div className="verification-layout">
      <section className="verification-questions" aria-label="待证问题">
        <h4>一、选择待证问题</h4>
        <div className="verification-question-list">{questions.map((question) => {
          const selected = question.id === currentQuestionId
          return <button key={question.id} type="button" aria-pressed={selected} className={`verification-question${selected ? ' is-selected' : ''}`} onClick={() => selectQuestion(question.id)}>
            <span>{selected ? <Check size={15} aria-hidden="true" /> : null}</span>
            <strong>{question.shortLabel}</strong>
            <small>{question.prompt}</small>
          </button>
        })}</div>
      </section>

      <fieldset className="verification-materials" disabled={!currentQuestionId}>
        <legend>二、选取案卷材料</legend>
        <p>只列出你已经查到的材料。多选无关材料不能加强命题，反而会使证据链失焦。</p>
        <div className="material-checklist">{investigation.materialIds.map((materialId) => {
          const checked = selectedMaterialIds.includes(materialId)
          return <label key={materialId} className={checked ? 'is-selected' : ''}>
            <input type="checkbox" checked={checked} onChange={() => toggleMaterial(materialId)} />
            <span aria-hidden="true">{checked ? <Check size={14} /> : null}</span>
            <strong>{chapter1MaterialLabels[materialId] ?? materialId}</strong>
            <small>{chapter1MaterialDescriptions[materialId] ?? '已经取得的案卷材料。'}</small>
          </label>
        })}</div>
      </fieldset>
    </div>

    <footer className="verification-submit">
      <p aria-live="polite">已选择 <strong>{selectedMaterialIds.length}</strong> 项材料{selectedMaterialIds.length < 2 ? '，至少还需一项' : '，请确认每项都直接支撑命题'}</p>
      <button type="button" className="button button-primary" disabled={!currentQuestionId || selectedMaterialIds.length < 2} onClick={() => currentQuestionId && onVerify(currentQuestionId, selectedMaterialIds)}><ScrollText size={17} aria-hidden="true" />呈交这组核验</button>
    </footer>

    {supplementalChoices.length > 0 && <section className="verification-supplement" aria-label="尚未完成的现场补查">
      <div><strong>仍有一处现场未查</strong><small>补查会先取得第一项材料，再进入该路线的后续查验。</small></div>
      {supplementalChoices.map((choice) => <button type="button" key={choice.id} className="button verification-supplement-button" onClick={() => onSupplement(choice.id)}>{choice.label}</button>)}
    </section>}
  </section>
}
