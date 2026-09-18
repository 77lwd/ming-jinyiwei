import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { DeveloperMenu } from './DeveloperMenu'

describe('DeveloperMenu', () => {
  it('opens a checkpoint menu and starts the selected slice', () => {
    const onStart = vi.fn()
    render(<DeveloperMenu onStart={onStart} />)

    fireEvent.click(screen.getByRole('button', { name: '开发者模式' }))
    fireEvent.click(screen.getByRole('button', { name: '第一案 · 开始闻讯' }))

    expect(onStart).toHaveBeenCalledWith('chapter2-case1-inquiry')
  })

  it('offers a direct first-case-end checkpoint', () => {
    const onStart = vi.fn()
    render(<DeveloperMenu onStart={onStart} />)

    fireEvent.click(screen.getByRole('button', { name: '开发者模式' }))
    fireEvent.click(screen.getByRole('button', { name: '第一案 · 结案处置' }))

    expect(onStart).toHaveBeenCalledWith('chapter2-case1-end')
  })
})
