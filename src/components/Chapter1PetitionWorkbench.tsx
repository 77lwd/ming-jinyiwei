import { FileLock2, ShieldCheck } from 'lucide-react'

interface Props {
  fixedFactIds: string[]
  choices: Array<{ id: string; label: string }>
  onChoose: (choiceId: string) => void
}

const petitionCopy: Record<string, { title: string; detail: string; authority: string }> = {
  'request-supplement': { title: '继续补查', detail: '说明尚未回答的待证问题，请求再查一处材料。', authority: '由覃保坤批准补查范围' },
  'preserve-evidence': { title: '封存证物', detail: '呈报已经固定的事实，请求差役守住现有证物。', authority: '由覃保坤签押封存' },
  'detain-he-xing': { title: '暂扣贺兴', detail: '呈报毁证目标与印纸去向，请求进入责任判断。', authority: '由覃保坤决定是否暂扣' },
}

export function Chapter1PetitionWorkbench({ fixedFactIds, choices, onChoose }: Props) {
  return <section className="petition-workbench" aria-labelledby="petition-heading">
    <figure className="petition-portrait">
      <img src="/assets/chapter1/characters/liao-weida-portrait-v1.png" alt="廖威达提交办案依据" />
      <figcaption><strong>廖威达</strong><span>锦衣卫校尉 · 提交依据</span></figcaption>
    </figure>
    <div className="petition-body">
      <header><span><FileLock2 size={18} aria-hidden="true" /></span><div><h3 id="petition-heading">向覃保坤呈报依据</h3><p>廖威达只能提出建议。封存、调人、暂扣和正式复核都须由覃保坤批准。</p></div><strong>当前已固定 {fixedFactIds.length} 项事实</strong></header>
      <div className="petition-options">{choices.map((choice) => {
        const copy = petitionCopy[choice.id] ?? { title: choice.label, detail: '呈报现有依据。', authority: '等待上级决定' }
        return <button type="button" key={choice.id} onClick={() => onChoose(choice.id)}>
          <span className="petition-option-icon"><ShieldCheck size={18} aria-hidden="true" /></span>
          <span><strong>{copy.title}</strong><small>{copy.detail}</small><em>{copy.authority}</em></span>
        </button>
      })}</div>
    </div>
  </section>
}
