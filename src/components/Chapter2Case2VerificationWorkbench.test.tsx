import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { chapter2Case2VerificationSets } from '../data/chapter2Case2'
import { Chapter2Case2VerificationWorkbench } from './Chapter2Case2VerificationWorkbench'

const materials = [
  'indigo-footprints', 'torn-dowry-sash', 'inheritance-deed', 'debt-ledger', 'coercive-private-contract',
  'inspection-credential', 'credential-scope-record', 'credential-handover-record',
  'luxiaoling-signed-statement', 'lusheng-signed-statement', 'spouse-witness-signed-testimony', 'tea-clerk-signed-testimony',
  'family-pressure-comparison', 'credential-handover-comparison',
]

describe('Chapter2Case2VerificationWorkbench', () => {
  it('shows three propositions and preserves a separate selection for each', () => {
    render(<Chapter2Case2VerificationWorkbench materialIds={materials} onVerify={vi.fn()} />)

    expect(screen.getByRole('heading', { name: '第二案材料核验' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /卢小绫是主动藏身/ })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /卢盛是否以债务逼迫/ })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /真实凭照是否被滥用/ })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('checkbox', { name: '通往废染坊的靛色脚印' }))
    fireEvent.click(screen.getByRole('radio', { name: /卢盛是否以债务逼迫/ }))
    expect(screen.getByRole('checkbox', { name: '通往废染坊的靛色脚印' })).not.toBeChecked()
    fireEvent.click(screen.getByRole('radio', { name: /卢小绫是主动藏身/ }))
    expect(screen.getByRole('checkbox', { name: '通往废染坊的靛色脚印' })).toBeChecked()
  })

  it('does not allow all materials as a shortcut and submits only the active exact set', () => {
    const onVerify = vi.fn()
    render(<Chapter2Case2VerificationWorkbench materialIds={materials} onVerify={onVerify} />)

    const expected = chapter2Case2VerificationSets['voluntary-hiding-pressure']
    for (const id of expected) {
      const label = id === 'indigo-footprints' ? '通往废染坊的靛色脚印'
        : id === 'torn-dowry-sash' ? '撕裂的嫁衣衣带'
          : id === 'luxiaoling-signed-statement' ? '卢小绫签押口供'
            : '夫家妇人签押证言'
      fireEvent.click(screen.getByRole('checkbox', { name: label }))
    }
    const submit = screen.getByRole('button', { name: '呈交这组核验' })
    expect(submit).toBeEnabled()
    fireEvent.click(submit)
    expect(onVerify).toHaveBeenCalledWith('voluntary-hiding-pressure', expected)
  })
})
