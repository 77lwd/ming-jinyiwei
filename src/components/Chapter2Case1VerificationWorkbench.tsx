import { Check, FileSearch, ScrollText } from 'lucide-react'
import { chapter2MaterialDescriptions, chapter2MaterialLabels } from '../data/chapter2'

const case1Materials = ['unforced-lock', 'wet-transfer-stub', 'separate-guard-statements', 'river-route-testimony']

export function Chapter2Case1VerificationWorkbench({ materialIds, onVerify }: { materialIds: string[]; onVerify: (materialIds: string[]) => void }) {
  return <section className="verification-workbench" aria-label="雨夜失押结案核验">
    <header className="verification-heading"><span><FileSearch size={18} aria-hidden="true" /></span><div><h3>第一案结案核验</h3><p>把已经取得的材料组成一条可复核的责任判断。只能选择本次调查实际取得的证物。</p></div><strong>雨夜失押</strong></header>
    <div className="verification-materials"><p>选择一组主证据链：押役责任线，或河埠转运线。</p><div className="material-checklist">{case1Materials.map((id) => <div key={id} className="material-checklist-row"><span className="material-check-icon"><Check size={14} /></span><div><strong>{chapter2MaterialLabels[id]}</strong><small>{materialIds.includes(id) ? chapter2MaterialDescriptions[id] : '尚未取得，不能用于结案核验。'}</small></div></div>)}</div></div>
    <div className="verification-submit"><p>结案证物会按调查结果自动组合。</p><div className="verification-actions"><button type="button" className="button button-secondary" disabled={!materialIds.includes('separate-guard-statements') && !materialIds.includes('river-route-testimony')} onClick={() => onVerify(materialIds.includes('separate-guard-statements') ? ['unforced-lock', 'wet-transfer-stub', 'separate-guard-statements'] : ['unforced-lock', 'wet-transfer-stub', 'river-route-testimony'])}><ScrollText size={17} aria-hidden="true" />提交结案核验</button></div></div>
  </section>
}
