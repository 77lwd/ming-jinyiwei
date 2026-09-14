import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ResultPanel } from './ResultPanel'

describe('ResultPanel', () => {
  it('keeps the chapter-one investigation context visible after a choice', () => {
    render(<ResultPanel
      node="chapter1.paper-shop-fire"
      narrative={{ title: '先核验送样路线', paragraphs: [{ kind: 'prose', text: '你先拿着送样凭条走访邻铺与脚夫。' }] }}
      event={{ id: 'route', chapter: 'chapter1', title: '先核验送样路线', summary: '凭条需要进一步核对。', effects: [] }}
      onConfirm={vi.fn()}
    />)

    expect(screen.getByRole('region', { name: '核验回执' })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: '当前办案信息' })).toBeInTheDocument()
    expect(screen.getByText('覃保坤')).toBeInTheDocument()
  })

  it('marks the case closure separately from an ordinary verification receipt', () => {
    render(<ResultPanel
      node="chapter1.case-closed"
      narrative={{ title: '程序处置', paragraphs: [{ kind: 'prose', text: '覃保坤落下批示。' }] }}
      event={{ id: 'closure', chapter: 'chapter1', title: '程序处置', summary: '案件封结。', effects: [] }}
      onConfirm={vi.fn()}
    />)

    expect(screen.getByText('案件封结回执')).toBeInTheDocument()
    expect(screen.getByText('纸铺失火案 · 已正式封结')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /进入证物归档/ })).toBeInTheDocument()
  })

  it('uses a casework action for a verification result instead of a generic continue label', () => {
    render(<ResultPanel
      node="chapter1.day2-verify"
      narrative={{ title: '火是从账架旁起的', paragraphs: [{ kind: 'prose', text: '两项材料已经对上。' }] }}
      event={{ id: 'verify', chapter: 'chapter1', title: '起火位置是否指向毁证', summary: '火是从账架旁起的。', effects: ['火是从账架旁起的'] }}
      onConfirm={vi.fn()}
    />)

    expect(screen.getByRole('button', { name: /将核验结果写入案卷/ })).toBeInTheDocument()
  })

  it('gives the night-preservation result its own approval and receipt language', () => {
    render(<ResultPanel
      node="chapter1.night-preservation"
      narrative={{ title: '守住残料', paragraphs: [{ kind: 'prose', text: '你留下人手看住坍塌处。' }] }}
      event={{ id: 'night', chapter: 'chapter1', title: '守住残料', summary: '残料得以保全。', effects: [] }}
      onConfirm={vi.fn()}
    />)

    expect(screen.getByText('保全批示')).toBeInTheDocument()
    expect(screen.getByText('夜间保全回执')).toBeInTheDocument()
    expect(screen.getByText(/这一项保全已写入夜间笔录/)).toBeInTheDocument()
  })

  it('shows newly acquired materials without revealing their verification use', () => {
    const onOpenCaseRecord = vi.fn()
    render(<ResultPanel
      node="chapter1.route-investigation"
      narrative={{ title: '脚夫记得另一条路', paragraphs: [{ kind: 'prose', text: '脚夫与邻铺的说法已经记下。' }] }}
      event={{ id: 'route', chapter: 'chapter1', title: '找脚夫核对', summary: '取得两份证词。', effects: [], acquiredMaterialIds: ['neighbor-testimony', 'porter-testimony'] }}
      onConfirm={vi.fn()}
      onOpenCaseRecord={onOpenCaseRecord}
    />)

    expect(screen.getByRole('region', { name: '材料入档' })).toBeInTheDocument()
    expect(screen.getByText('邻铺证词')).toBeInTheDocument()
    expect(screen.getByText('脚夫证词')).toBeInTheDocument()
    expect(screen.getByText('已收入案情记录，可随时查看。')).toBeInTheDocument()
    expect(screen.queryByText(/可核验|待证问题|正确组合/)).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '查看案情记录' }))
    expect(onOpenCaseRecord).toHaveBeenCalledOnce()
  })

})
