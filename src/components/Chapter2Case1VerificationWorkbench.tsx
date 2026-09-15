import { useState } from 'react'
import { Check, FileSearch, ScrollText } from 'lucide-react'
import { chapter2MaterialDescriptions, chapter2MaterialLabels } from '../data/chapter2'

const case1Materials = ['unforced-lock', 'wet-transfer-stub', 'separate-guard-statements', 'river-route-testimony']

export function Chapter2Case1VerificationWorkbench({ materialIds, onVerify }: { materialIds: string[]; onVerify: (questionId: string, materialIds: string[]) => void }) {
  const [questionId, setQuestionId] = useState('guard-duty')
  const [selected, setSelected] = useState<string[]>([])
  const toggle = (id: string) => setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])
  return <section className="verification-workbench" aria-label="雨夜失押结案核验">
    <header className="verification-heading"><span><FileSearch size={18} aria-hidden="true" /></span><div><h3>第一案结案核验</h3><p>把已经取得的材料组成一条可复核的责任判断。只能选择本次调查实际取得的证物。</p></div><strong>雨夜失押</strong></header>
    <fieldset className="verification-materials"><legend>选择待证问题</legend><label><input type="radio" checked={questionId === 'guard-duty'} onChange={() => setQuestionId('guard-duty')} />押役是否存在失职？</label><label><input type="radio" checked={questionId === 'illegal-transfer'} onChange={() => setQuestionId('illegal-transfer')} />马骁是否经过违规转移？</label><p>证物必须精确对应问题；全选或混入无关材料不能通过。</p><div className="material-checklist">{case1Materials.map((id) => { const available = materialIds.includes(id); const checked = selected.includes(id); return <label key={id} className={`material-checklist-row${checked ? ' is-selected' : ''}`}><input type="checkbox" disabled={!available} checked={checked} onChange={() => toggle(id)} /><span className="material-check-icon">{checked ? <Check size={14} /> : null}</span><div><strong>{chapter2MaterialLabels[id]}</strong><small>{available ? chapter2MaterialDescriptions[id] : '尚未取得，不能用于结案核验。'}</small></div></label> })}</div></fieldset>
    <div className="verification-submit"><p aria-live="polite">已选择 {selected.length} 件材料</p><div className="verification-actions"><button type="button" className="button button-secondary" disabled={selected.length !== 3} onClick={() => onVerify(questionId, selected)}><ScrollText size={17} aria-hidden="true" />提交结案核验</button></div></div>
  </section>
}
