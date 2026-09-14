export const chapter1Stages = [
  ['field', '接案现场'],
  ['evidence', '固定矛盾'],
  ['review', '正式复核'],
  ['close', '结案归档'],
] as const

export function getChapter1StageIndex(node: string) {
  if (node === 'chapter1.entry' || node === 'chapter1.paper-shop-fire' || node === 'chapter1.route-investigation') return 0
  if (node === 'chapter1.day1-evidence' || node === 'chapter1.night-preservation') return 1
  if (node === 'chapter1.day2-verify' || node === 'chapter1.authorization-review' || node === 'chapter1.closure-judgment') return 2
  if (node.startsWith('chapter1.')) return 3
  return 0
}
