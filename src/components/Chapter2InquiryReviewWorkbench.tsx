import { useState } from 'react'
import { Check, FileCheck2, FileSearch } from 'lucide-react'
import { chapter2InquiryReviews } from '../data/chapter2'

export function Chapter2InquiryReviewWorkbench({ node, errorTitle, onSubmit }: {
  node: string
  errorTitle?: string
  onSubmit: (selections: string[]) => void
}) {
  const review = chapter2InquiryReviews[node]
  const [answers, setAnswers] = useState<Record<string, string>>({})
  if (!review) return null
  const complete = review.statements.every((statement) => answers[statement.id])
  const completedCount = review.statements.filter((statement) => answers[statement.id]).length

  return <section className="inquiry-review" aria-labelledby="inquiry-review-title">
    <header className="inquiry-review-heading">
      <span className="inquiry-review-heading-icon"><FileSearch size={18} aria-hidden="true" /></span>
      <div><span>口供整理</span><h3 id="inquiry-review-title">{review.title}</h3><p>{review.instruction}</p></div>
      <strong><FileCheck2 size={15} aria-hidden="true" />待誊清</strong>
    </header>
    {errorTitle === '这份记录还不能签押' && <div className="inquiry-review-error" role="alert">这份记录仍把亲见、推断或冲突混在一起，请重新逐句归类。</div>}
    <div className="inquiry-review-list">
      {review.statements.map((statement, index) => <section key={statement.id} className="inquiry-review-row">
        <span className="inquiry-review-index" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
        <p>{statement.text}</p>
        <div className="inquiry-review-options" role="radiogroup" aria-label={`第${index + 1}条口供归类`}>{review.categories.map((category) => <label key={category.id} className={answers[statement.id] === category.id ? 'selected' : ''}>
          <input type="radio" name={statement.id} value={category.id} checked={answers[statement.id] === category.id} onChange={() => setAnswers((current) => ({ ...current, [statement.id]: category.id }))} />
          <span>{answers[statement.id] === category.id && <Check size={14} />}{category.label}</span>
        </label>)}</div>
      </section>)}
    </div>
    <footer><p aria-live="polite">已归类 <strong>{completedCount}</strong> / {review.statements.length} 条</p><button className="button button-primary" disabled={!complete} onClick={() => onSubmit(review.statements.map((statement) => `${statement.id}:${answers[statement.id]}`))}>核对并誊清</button></footer>
  </section>
}
