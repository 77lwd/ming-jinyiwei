import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { InvestigationChoices } from './CaseWorkbench'

describe('InvestigationChoices', () => {
  it('shows both the silver and health costs for hiring guards', () => {
    const onChoose = vi.fn()
    render(<InvestigationChoices choices={[{ id: 'guard-remains', label: '雇人守住火场残料' }]} onChoose={onChoose} />)

    expect(screen.getByText('预计消耗银两 5')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /雇人守住火场残料/ }))
    expect(onChoose).toHaveBeenCalledWith('guard-remains')
  })
})
