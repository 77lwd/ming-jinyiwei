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
    expect(screen.getByText('廖威达：')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: '廖威达肖像' })).toHaveAttribute('src', '/assets/chapter1/characters/liao-weida-portrait-v1.png')
    expect(screen.getByLabelText('押役周六肖像待补')).toBeInTheDocument()
    expect(screen.queryByText('过桥前给了我。赵七手冻得发僵，说让我收着。')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '听他回答' }))
    expect(screen.getByText('押役周六：')).toBeInTheDocument()
    expect(screen.getByText('过桥前给了我。赵七手冻得发僵，说让我收着。')).toBeInTheDocument()
    expect(screen.queryByText('他说到这里，手往腰后探了一下。')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '继续听' }))
    expect(screen.getByText('他说到这里，手往腰后探了一下。')).toBeInTheDocument()
    expect(screen.getByText('本轮记下')).toBeInTheDocument()
    expect(screen.getByText(/钥匙的交接没有旁证/)).toBeInTheDocument()
    expect(screen.getByText('下一步')).toBeInTheDocument()
    expect(onConfirm).not.toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button', { name: '继续闻讯' }))
    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it('sends the player to testimony sorting instead of signing automatically', () => {
    render(<Chapter2InquiryDialogue
      node="chapter2.case1-inquiry.guard-b.3"
      question="从柳沟停车开始重说。"
      narrative={{ title: '赵七口供签押', paragraphs: [{ kind: 'prose', text: '赵七从头复述一遍，在末页按了手印。' }] }}
      onConfirm={() => undefined}
    />)

    fireEvent.click(screen.getByRole('button', { name: '听他回答' }))
    expect(screen.getByText('赵七问话已完')).toBeInTheDocument()
    expect(screen.getByText(/仍须作为冲突保留/)).toBeInTheDocument()
    expect(screen.getByText(/签押后再与周六口供逐项对照/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '进入口供整理' })).toBeInTheDocument()
  })

  it('makes clear that Zhou Liu alone does not create the combined verification material', () => {
    render(<Chapter2InquiryDialogue
      node="chapter2.case1-inquiry.guard-a.3"
      question="只说你自己看见了什么。"
      narrative={{ title: '周六 · 亲见口供', paragraphs: [{ kind: 'dialogue', text: '我回来时车里已经没人。' }] }}
      onConfirm={() => undefined}
    />)

    fireEvent.click(screen.getByRole('button', { name: '听他回答' }))
    expect(screen.getByText('周六问话已完')).toBeInTheDocument()
    expect(screen.getByText(/整理正确后才可复述签押/)).toBeInTheDocument()
  })

  it('uses the current witness question after a handoff instead of the prior action label', () => {
    render(<Chapter2InquiryDialogue
      node="chapter2.case1-inquiry.river-tea.1"
      question="封存船夫证言，单独询问阿顺"
      narrative={{ title: '茶棚伙计进屋', paragraphs: [{ kind: 'dialogue', text: '我只听见车响，没出去看。' }] }}
      onConfirm={() => undefined}
    />)

    expect(screen.getByText('你先说自己亲耳听见、亲眼看见的。官车到棚外以后，发生了什么？')).toBeInTheDocument()
    expect(screen.queryByText('封存船夫证言，单独询问阿顺')).not.toBeInTheDocument()
  })
})
