import type { StageId } from './types'

export interface StageCopy {
  id: StageId
  label: string
  primary: string
  secondary: string
  cue?: string
}

export const STAGE_COPY: Record<StageId, StageCopy> = {
  entry: {
    id: 'entry',
    label: '静水入口',
    primary: '夜已经很深。',
    secondary: '水还没有开口。',
    cue: '触碰水滴',
  },
  surface: {
    id: 'surface',
    label: '表面',
    primary: '城市把夜留在水上。',
    secondary: '那句话，还在更下面。',
  },
  echo: {
    id: 'echo',
    label: '回声',
    primary: '你碰到的，不是影子。',
    secondary: '是它还在回声里改变形状。',
  },
  unsaid: {
    id: 'unsaid',
    label: '未说出口',
    primary: '有些话没有消失。',
    secondary: '它们只是失去了出口。',
  },
  core: {
    id: 'core',
    label: '蓝色核心',
    primary: '先让碎片醒来。',
    secondary: '然后按住，不替它命名。',
    cue: '移动，再按住',
  },
  ascent: {
    id: 'ascent',
    label: '返回水面',
    primary: '你没有把它带走。',
    secondary: '只是让它被听见一次。',
  },
  record: {
    id: 'record',
    label: '潜航记录',
    primary: '水面恢复了原来的安静。',
    secondary: '但你知道，安静不等于空无。',
  },
}
