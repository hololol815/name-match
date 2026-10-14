// 오행(五行) 기반 이름 궁합 계산 로직
// 글자 → 오행 배정은 한글 유니코드 순서(가~힣) 기반이라, 같은 글자는 항상 같은 오행입니다.

export const ELEMENTS = {
  wood: { key: 'wood', hanja: '木', name: '목', color: '#4caf50' },
  fire: { key: 'fire', hanja: '火', name: '화', color: '#ff5252' },
  earth: { key: 'earth', hanja: '土', name: '토', color: '#c98a4b' },
  metal: { key: 'metal', hanja: '金', name: '금', color: '#90a4ae' },
  water: { key: 'water', hanja: '水', name: '수', color: '#42a5f5' },
}

export const ELEMENT_LIST = Object.values(ELEMENTS)

// 목생화 → 화생토 → 토생금 → 금생수 → 수생목
const GENERATES = {
  wood: 'fire',
  fire: 'earth',
  earth: 'metal',
  metal: 'water',
  water: 'wood',
}

// 목극토 → 토극수 → 수극화 → 화극금 → 금극목
const OVERCOMES = {
  wood: 'earth',
  earth: 'water',
  water: 'fire',
  fire: 'metal',
  metal: 'wood',
}

export const isGenerating = (a, b) => GENERATES[a] === b
export const isOvercoming = (a, b) => OVERCOMES[a] === b

const HANGUL_START = 0xac00
const HANGUL_END = 0xd7a3

// 한글 한 글자를 오행에 배정한다
export function elementOf(char) {
  const code = char.charCodeAt(0)
  if (code < HANGUL_START || code > HANGUL_END) return null
  return ELEMENT_LIST[(code - HANGUL_START) % 5].key
}

// 이름 전체를 글자 단위로 분석한다
export function analyzeName(raw) {
  const chars = [...(raw ?? '').trim()].filter((c) => /\S/.test(c))

  const letters = chars.map((char, index) => ({
    char,
    index,
    element: elementOf(char),
    hasBatchim: /[가-힣]/.test(char) && (char.charCodeAt(0) - HANGUL_START) % 28 !== 0,
  }))

  const counts = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 }
  for (const l of letters) if (l.element) counts[l.element] += 1

  const dominant = ELEMENT_LIST.reduce((best, el) =>
    counts[el.key] > counts[best.key] ? el : best,
  )

  return {
    raw: (raw ?? '').trim(),
    letters,
    counts,
    dominant: counts[dominant.key] > 0 ? dominant.key : null,
    length: letters.length,
  }
}

// 두 이름에 공통으로 들어 있는 글자
function sharedLetters(a, b) {
  const setB = new Set(b.letters.map((l) => l.char))
  return a.letters.filter((l) => setB.has(l.char)).map((l) => l.char)
}

// 같은 이름 조합이면 항상 같은 결과가 나오도록 하는 결정적 흔들림
function seededJitter(a, b) {
  const seed = [...(a + b)].reduce((acc, ch) => (acc * 31 + ch.charCodeAt(0)) % 9973, 7)
  return (seed % 11) - 5 // -5 ~ +5
}

export const TIERS = [
  { min: 90, title: '천생연분', emoji: '💞', desc: '말 안 해도 통하는, 진짜 인연입니다.' },
  { min: 80, title: '오래가는 인연', emoji: '💘', desc: '달라지면 좋고 오래 만날수록 좋아지는 사이입니다.' },
  { min: 70, title: '서로를 아는 사이', emoji: '💕', desc: '의외로 잘 맞는 조합이에요.' },
  { min: 55, title: '편한 친구지간', emoji: '🤝', desc: '연애로 가기엔 아쉽지만 친구로는 최고입니다.' },
  { min: 38, title: '연애보다 우정', emoji: '🍀', desc: '설렘보단 안정, 동호회에는 딱이네요.' },
  { min: 0, title: '아직 인연이 아니에요', emoji: '🌱', desc: '지금은 아니지만, 인연은 천천히 옵니다.' },
]

export function tierOf(score) {
  return TIERS.find((t) => score >= t.min) ?? TIERS[TIERS.length - 1]
}

// 두 이름의 첫 글자 오행 관계
export function relationship(first, second) {
  const a = first.letters[0]?.element
  const b = second.letters[0]?.element
  if (!a || !b) return null
  if (a === b) return { type: 'same', from: a, to: b, text: '같은 오행 · 생각이 비슷해요' }
  if (isGenerating(a, b)) return { type: 'generates', from: a, to: b, text: '상생(相生) · 서로를 살려주는 관계' }
  if (isOvercoming(a, b)) return { type: 'overcomes', from: a, to: b, text: '상극(相克) · 부딪히지만 성장하는 관계' }
  if (isGenerating(b, a)) return { type: 'generates', from: b, to: a, text: '상생(相生) · 서로를 살려주는 관계' }
  if (isOvercoming(b, a)) return { type: 'overcomes', from: b, to: a, text: '상극(相克) · 부딪히지만 성장하는 관계' }
  return null
}

export function calculate(firstName, secondName) {
  const a = analyzeName(firstName)
  const b = analyzeName(secondName)
  if (!a.length || !b.length) return null

  let score = 40
  const reasons = []

  // 1. 첫 글자 오행 (가장 큰 영향)
  const fa = a.letters[0].element
  const fb = b.letters[0].element
  if (fa && fb) {
    if (fa === fb) {
      score += 8
      reasons.push('첫 글자의 오행이 같아 생각이 잘 통합니다')
    } else if (isGenerating(fa, fb) || isGenerating(fb, fa)) {
      score += 16
      reasons.push('첫 글자끼리 상생(相生)이라 자연스럽게 끌립니다')
    } else {
      score -= 16
      reasons.push('첫 글자끼리 상극(相克)이라 초반에 부딪힐 수 있어요')
    }
  }

  // 2. 내 첫 글자 ↔ 상대 마지막 글자
  const la = a.letters[a.letters.length - 1]?.element
  const lb = b.letters[b.letters.length - 1]?.element
  if (fa && lb && isGenerating(fa, lb)) {
    score += 9
    reasons.push('끝 글자가 상대를 살려주는 배치입니다')
  } else if (fb && la && isGenerating(fb, la)) {
    score += 9
    reasons.push('끝 글자가 상대를 살려주는 배치입니다')
  }

  // 3. 겹치는 오행 (대화가 통하는 부분)
  const overlap = ELEMENT_LIST.filter((el) => a.counts[el.key] > 0 && b.counts[el.key] > 0)
  score += overlap.length * 4
  if (overlap.length >= 2) {
    reasons.push(`${overlap.map((o) => o.name).join('·')} 오행이 겹쳐 취향이 비슷합니다`)
  }

  // 4. 이름 길이
  const gap = Math.abs(a.length - b.length)
  if (gap === 0) {
    score += 6
    reasons.push('이름 길이가 같아 리듬이 비슷합니다')
  } else if (gap === 1) {
    score += 2
  }

  // 5. 공통 글자
  const shared = sharedLetters(a, b)
  if (shared.length > 0) {
    score += Math.min(shared.length * 5, 10)
    reasons.push(`'${[...new Set(shared)].join(', ')}' 글자가 겹칩니다`)
  }

  // 6. 받침 유무
  const batchimA = a.letters.some((l) => l.hasBatchim)
  const batchimB = b.letters.some((l) => l.hasBatchim)
  if (batchimA === batchimB) {
    score += 4
    reasons.push(batchimA ? '둘 다 받침이 있어 든든한 쪽입니다' : '둘 다 받침이 없어 가벼운 쪽입니다')
  }

  score += seededJitter(a.raw, b.raw)
  score = Math.max(1, Math.min(100, Math.round(score)))

  return {
    score,
    tier: tierOf(score),
    first: a,
    second: b,
    shared: [...new Set(shared)],
    reasons,
    relation: relationship(a, b),
  }
}
