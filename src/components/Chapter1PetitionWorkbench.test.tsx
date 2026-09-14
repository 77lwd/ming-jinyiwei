import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Chapter1PetitionWorkbench } from './Chapter1PetitionWorkbench'

describe('Chapter1PetitionWorkbench', () => {
  it('shows the protagonist portrait as the submitter of the petition', () => {
    render(<Chapter1PetitionWorkbench fixedFactIds={['fire-target']} choices={[]} onChoose={vi.fn()} />)

    expect(screen.getByRole('img', { name: '廖威达提交办案依据' })).toHaveAttribute('src', '/assets/chapter1/characters/liao-weida-portrait-v1.png')
    expect(screen.getByText('廖威达')).toBeInTheDocument()
  })
})
