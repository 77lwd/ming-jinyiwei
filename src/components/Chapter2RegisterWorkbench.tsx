import { useState } from 'react'
import { Check, FileSearch, ScrollText } from 'lucide-react'
import { chapter2MaterialDescriptions, chapter2MaterialLabels } from '../data/chapter2'
import type { Chapter2InvestigationState } from '../types'

export function Chapter2RegisterWorkbench({ investigation, onVerify }: { investigation: Chapter2InvestigationState; onVerify: (materialIds: string[]) => void }) {
  const [selectedMaterialIds, setSelectedMaterialIds] = useState<string[]>([])
  const toggleMaterial = (materialId: string) => setSelectedMaterialIds((current) => current.includes(materialId) ? current.filter((id) => id !== materialId) : [...current, materialId])

  return <section className="verification-workbench" aria-label="失号凭照总簿核验">
    <header className="verification-heading">
      <span><FileSearch size={18} aria-hidden="true" /></span>
      <div><h3>总簿核验</h3><p>只选三案中能够直接证明凭照流转的原件。责任材料仍留在各自案卷。</p></div>
      <strong>{investigation.completedCaseIds.length} 案已封卷</strong>
    </header>
    <fieldset className="verification-materials">
      <legend>选取三案凭照材料</legend>
      <p>必须恰好选择 3 件：全选或混入无关责任材料不能通过核验。</p>
      <div className="material-checklist">{investigation.materialIds.map((materialId) => {
        const checked = selectedMaterialIds.includes(materialId)
        return <label key={materialId} className={checked ? 'is-selected' : ''}>
          <input type="checkbox" checked={checked} onChange={() => toggleMaterial(materialId)} />
          <span aria-hidden="true">{checked ? <Check size={14} /> : null}</span>
          <strong>{chapter2MaterialLabels[materialId] ?? materialId}</strong>
          <small>{chapter2MaterialDescriptions[materialId] ?? '已经取得的第二章案卷材料。'}</small>
        </label>
      })}</div>
    </fieldset>
    <footer className="verification-submit">
      <p aria-live="polite">已选择 <strong>{selectedMaterialIds.length}</strong> / 3 项材料</p>
      <button type="button" className="button button-primary" disabled={selectedMaterialIds.length < 3} onClick={() => onVerify(selectedMaterialIds)}><ScrollText size={17} aria-hidden="true" />呈交总簿核验</button>
    </footer>
  </section>
}
