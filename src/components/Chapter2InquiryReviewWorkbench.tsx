import { useState } from 'react'
import { Check, FileSearch } from 'lucide-react'
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

  return <section className="inquiry-review" aria-labelledby="inquiry-review-title">
    <header>
      <FileSearch size={18} aria-hidden="true" />
      <div><span>口供整理</span><h2 id="inquiry-review-title">{review.title}</h2></div>
    </header>
    <p>{review.instruction}</p>
    {errorTitle === '这份记录还不能签押' && <div className="inquiry-review-error" role="alert">这份记录仍把亲见、推断或冲突混在一起，请重新逐句归类。</div>}
    <div className="inquiry-review-list">
      {review.statements.map((statement, index) => <fieldset key={statement.id}>
        <legend><small>{String(index + 1).padStart(2, '0')}</small>{statement.text}</legend>
        <div>{review.categories.map((category) => <label key={category.id} className={answers[statement.id] === category.id ? 'selected' : ''}>
          <input type="radio" name={statement.id} value={category.id} checked={answers[statement.id] === category.id} onChange={() => setAnswers((current) => ({ ...current, [statement.id]: category.id }))} />
          <span>{answers[statement.id] === category.id && <Check size={14} />}{category.label}</span>
        </label>)}</div>
      </fieldset>)}
    </div>
    <footer><button className="button button-primary" disabled={!complete} onClick={() => onSubmit(review.statements.map((statement) => `${statement.id}:${answers[statement.id]}`))}>核对并誊清</button></footer>
  </section>
}
