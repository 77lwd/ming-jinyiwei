import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { chapter2InquiryReviews } from '../data/chapter2'
import { Chapter2InquiryReviewWorkbench } from './Chapter2InquiryReviewWorkbench'

describe('Chapter2InquiryReviewWorkbench', () => {
  it('requires every statement to be classified before submission', () => {
    const onSubmit = vi.fn()
    render(<Chapter2InquiryReviewWorkbench node="chapter2.case1-inquiry.guard-a.review" onSubmit={onSubmit} />)

    const submit = screen.getByRole('button', { name: '核对并誊清' })
    expect(submit).toBeDisabled()
    fireEvent.click(screen.getAllByLabelText('标记冲突')[0])
    fireEvent.click(screen.getAllByLabelText('写入亲见事实')[1])
    fireEvent.click(screen.getAllByLabelText('列入待核')[2])
    expect(submit).toBeEnabled()
    fireEvent.click(submit)
    expect(onSubmit).toHaveBeenCalledWith(['zhou-gap:conflict', 'zhou-stop:fact', 'zhou-guess:pending'])
  })

  it('does not repeat the same correct option pattern for every witness', () => {
    const reviewNodes = ['chapter2.case1-inquiry.guard-a.review', 'chapter2.case1-inquiry.guard-b.review', 'chapter2.case1-inquiry.river-boat.review', 'chapter2.case1-inquiry.river-tea.review']
    const patterns = reviewNodes.map((node) => {
      const review = chapter2InquiryReviews[node]
      return review.statements.map((statement) => review.categories.findIndex((category) => review.expected.includes(`${statement.id}:${category.id}`))).join('-')
    })

    expect(patterns).not.toContain('0-1-2')
    expect(new Set(patterns).size).toBe(reviewNodes.length)
  })
})
