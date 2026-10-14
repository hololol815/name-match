const HANGUL = /^[가-힣]+$/

export function validate(name, label) {
  const value = (name ?? '').trim()
  if (!value) return `${label} 이름을 입력해 주세요`
  if (!HANGUL.test(value)) return `${label} 이름은 한글로 입력해 주세요`
  if (value.length > 6) return `${label} 이름은 6자까지 입력할 수 있어요`
  return null
}
