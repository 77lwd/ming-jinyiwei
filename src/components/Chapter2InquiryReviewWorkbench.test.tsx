import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Chapter2InquiryReviewWorkbench } from './Chapter2InquiryReviewWorkbench'

describe('Chapter2InquiryReviewWorkbench', () => {
  it('requires every statement to be classified before submission', () => {
    const onSubmit = vi.fn()
    render(<Chapter2InquiryReviewWorkbench node="chapter2.case1-inquiry.guard-a.review" onSubmit={onSubmit} />)

    const submit = screen.getByRole('button', { name: '核对并誊清' })
    expect(submit).toBeDisabled()
    fireEvent.click(screen.getAllByLabelText('写入亲见事实')[0])
    fireEvent.click(screen.getAllByLabelText('列入待核')[1])
    fireEvent.click(screen.getAllByLabelText('标记冲突')[2])
    expect(submit).toBeEnabled()
    fireEvent.click(submit)
    expect(onSubmit).toHaveBeenCalledWith(['zhou-stop:fact', 'zhou-guess:pending', 'zhou-gap:conflict'])
  })
})
