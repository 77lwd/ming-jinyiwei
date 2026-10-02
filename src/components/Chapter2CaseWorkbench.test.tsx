import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Chapter2CaseContext, Chapter2CaseRecord } from './Chapter2CaseWorkbench'

describe('Chapter2CaseRecord', () => {
  it('changes the case context after the first case is sealed', () => {
    render(<Chapter2CaseContext node="chapter2.case1-closed" />)

    expect(screen.getByText('第一案已经封卷，带着封存凭照转入下一桩差事。')).toBeInTheDocument()
    expect(screen.getByText('失押责任已经入卷。')).toBeInTheDocument()
    expect(screen.getByText('马骁的去向另列续查。')).toBeInTheDocument()
    expect(screen.queryByText(/先完成三条调查线/)).not.toBeInTheDocument()
  })

  it('shows only the current first-case record without future-case or register spoilers', () => {
    render(<Chapter2CaseRecord node="chapter2.rain-night-transfer" investigation={{
      activeCaseId: 'rain-night-transfer',
      completedActionIds: ['c2-01-preserve-wet-stub'],
      caseMaterialIds: ['wet-transfer-stub'],
      completedCaseIds: [],
      branchIds: [],
      materialIds: ['wet-transfer-stub'],
      fixedFactIds: [],
      registerVerified: false,
    }} />)

    expect(screen.getByRole('heading', { name: '雨夜失押' })).toBeInTheDocument()
    expect(screen.getByText('湿透的换押存根')).toBeInTheDocument()
    expect(screen.getByText(/换押文书/)).toBeInTheDocument()
    expect(screen.queryByText('空屋里的嫁妆')).not.toBeInTheDocument()
    expect(screen.queryByText('倒在更鼓前的人')).not.toBeInTheDocument()
    expect(screen.queryByText('章末总簿要求')).not.toBeInTheDocument()
    expect(screen.queryByText('未剪角的封验凭照')).not.toBeInTheDocument()
    expect(screen.queryByText('夜放牌副券')).not.toBeInTheDocument()
  })

  it('shows each signed statement only after that person has finished inquiry', () => {
    render(<Chapter2CaseRecord node="chapter2.case1-inquiry.guard-b.1" investigation={{
      activeCaseId: 'rain-night-transfer',
      completedActionIds: ['c2-01-guard-a-statement'],
      caseMaterialIds: [],
      completedCaseIds: [],
      branchIds: [],
      materialIds: [],
      fixedFactIds: [],
      registerVerified: false,
    }} />)

    expect(screen.getByText('周六口供 · 已复述签押')).toBeInTheDocument()
    expect(screen.getByText('赵七口供 · 闻讯未完')).toBeInTheDocument()
    expect(screen.queryByText('船夫陈老桨证言 · 已复述签押')).not.toBeInTheDocument()
  })

  it('shows second-case investigation lines, witness status, and fixed propositions', () => {
    render(<Chapter2CaseRecord node="chapter2.case2-close-review" investigation={{
      activeCaseId: 'empty-dowry-house',
      completedActionIds: [
        'c2-02-inspect-backdoor', 'c2-02-inspect-dyehouse', 'c2-02-recover-deed', 'c2-02-check-debt-ledger',
        'c2-02-verify-credential', 'c2-02-trace-credential-handover', 'c2-02-luxiaoling-statement',
      ],
      caseMaterialIds: ['indigo-footprints', 'torn-dowry-sash', 'inheritance-deed', 'debt-ledger', 'coercive-private-contract', 'inspection-credential', 'credential-scope-record', 'credential-handover-record', 'luxiaoling-signed-statement'],
      completedCaseIds: [],
      branchIds: [],
      materialIds: ['indigo-footprints', 'torn-dowry-sash', 'inheritance-deed', 'debt-ledger', 'coercive-private-contract', 'inspection-credential', 'credential-scope-record', 'credential-handover-record', 'luxiaoling-signed-statement'],
      fixedFactIds: ['voluntary-hiding-pressure'],
      registerVerified: false,
    }} />)

    expect(screen.getByText('后门与废染坊 · 已完成')).toBeInTheDocument()
    expect(screen.getByText('副契与债务压力 · 已完成')).toBeInTheDocument()
    expect(screen.getByText('凭照与中间人交接 · 已完成')).toBeInTheDocument()
    expect(screen.getByText('卢小绫口供 · 已复述签押')).toBeInTheDocument()
    expect(screen.getByText(/主动藏身与离开前压力/)).toBeInTheDocument()
    expect(screen.getByText('卢盛口供 · 闻讯未完')).toBeInTheDocument()
  })
})
