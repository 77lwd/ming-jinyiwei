import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Chapter2InquiryDialogue } from './Chapter2InquiryDialogue'

describe('Chapter2InquiryDialogue', () => {
  it('reveals the selected question and witness response one beat at a time', () => {
    const onConfirm = vi.fn()
    render(<Chapter2InquiryDialogue
      node="chapter2.case1-inquiry.guard-a.1"
      question="你说钥匙起先在赵七手里。后来交给了谁？"
      narrative={{ title: '周六 · 钥匙', paragraphs: [
        { kind: 'dialogue', text: '过桥前给了我。赵七手冻得发僵，说让我收着。' },
        { kind: 'prose', text: '他说到这里，手往腰后探了一下。' },
      ] }}
      onConfirm={onConfirm}
    />)

    expect(screen.getByText('你说钥匙起先在赵七手里。后来交给了谁？')).toBeInTheDocument()
    expect(screen.queryByText('过桥前给了我。赵七手冻得发僵，说让我收着。')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '听他回答' }))
    expect(screen.getByText('过桥前给了我。赵七手冻得发僵，说让我收着。')).toBeInTheDocument()
    expect(screen.queryByText('他说到这里，手往腰后探了一下。')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '继续听' }))
    expect(screen.getByText('他说到这里，手往腰后探了一下。')).toBeInTheDocument()
    expect(onConfirm).not.toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button', { name: '继续闻讯' }))
    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it('labels the final signed statement as completing the testimony', () => {
    render(<Chapter2InquiryDialogue
      node="chapter2.case1-inquiry.guard-b.3"
      question="从柳沟停车开始重说。"
      narrative={{ title: '赵七口供签押', paragraphs: [{ kind: 'prose', text: '赵七从头复述一遍，在末页按了手印。' }] }}
      onConfirm={() => undefined}
    />)

    fireEvent.click(screen.getByRole('button', { name: '听他回答' }))
    expect(screen.getByRole('button', { name: '完成签押' })).toBeInTheDocument()
  })
})
