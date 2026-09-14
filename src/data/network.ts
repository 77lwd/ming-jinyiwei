export type NetworkId = 'zhou_hanchuan' | 'tan_baokun' | 'feng_tianshun'

export function relationStage(score: number): string {
  if (score >= 60) return '亲近'
  if (score >= 30) return '信任'
  if (score > 0) return '熟悉'
  if (score < -30) return '疏远'
  return '陌生'
}

export function displayedRelationStage(id: NetworkId, score: number, flags: Record<string, boolean>): string {
  const established = (id === 'tan_baokun' && flags.first_case_closed === true) || (id === 'feng_tianshun' && flags.tianshun_reconnected === true)
  if (established && score >= 0 && score < 30) return '熟悉'
  return relationStage(score)
}

export const networkPeople: Record<NetworkId, { name: string; opinion: string; image?: string; imageAlt: string }> = {
  zhou_hanchuan: {
    name: '周寒川',
    opinion: '关心你的处境，认可你按规矩办差。',
    image: '/assets/chapter1/characters/zhou-hanchuan-portrait-v1.png',
    imageAlt: '周寒川肖像',
  },
  tan_baokun: {
    name: '覃保坤',
    opinion: '认可你愿意按程序把事实核清，也在观察你能否经得住后续差事。',
    image: '/assets/chapter1/characters/qian-baokun-portrait-v1.png',
    imageAlt: '覃保坤肖像',
  },
  feng_tianshun: {
    name: '冯天顺',
    opinion: '仍把你当作儿时兄弟，愿意与你恢复往来。',
    image: '/assets/chapter1/characters/feng-tianshun-portrait-v1.png',
    imageAlt: '冯天顺肖像',
  },
}

export function knownNetworkIds(npcRelations: Record<string, number>, flags: Record<string, boolean>): NetworkId[] {
  const ids: NetworkId[] = []
  if ((npcRelations.zhou_hanchuan ?? 0) > 0) ids.push('zhou_hanchuan')
  if ((npcRelations.tan_baokun ?? 0) > 0 || flags.prologue_survivor === true || flags.first_case_closed === true) ids.push('tan_baokun')
  if (flags.tianshun_reconnected === true || (npcRelations.feng_tianshun ?? 0) > 0) ids.push('feng_tianshun')
  return ids
}

export function networkOpinion(id: NetworkId): string {
  return networkPeople[id].opinion
}
