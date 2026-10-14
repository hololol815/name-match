import { useMemo, useState } from 'react'
import NameForm from './components/NameForm.jsx'
import ResultView from './components/ResultView.jsx'
import { calculate } from './game/elements.js'
import { validate } from './game/validate.js'
import { downloadShareCard, renderShareCard, shareText } from './game/shareCard.js'
import './App.css'

const SAMPLE_FIRST = '김나영'

const RANDOM_FIRST = [
  '김', '이', '박', '최', '정', '강', '조', '윤', '장', '임',
  '한', '오', '서', '신', '권', '황', '안', '송', '전', '홍',
]
const RANDOM_MID = [
  '나', '민', '서', '지', '하', '도', '유', '정', '예', '수',
  '시', '주', '건', '우', '재', '현', '준', '소', '근', '태',
]
const RANDOM_LAST = [
  '영', '준', '현', '우', '서', '민', '지', '훈', '빈', '솔',
  '연', '온', '유', '호', '결', '담', '윤', '리', '산', '별',
]

function randomName() {
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]
  const size = Math.random() < 0.55 ? 3 : 2
  let name = pick(RANDOM_FIRST) + pick(RANDOM_MID)
  if (size === 3) name += pick(RANDOM_LAST)
  return name
}

export default function App() {
  const [first, setFirst] = useState(SAMPLE_FIRST)
  const [second, setSecond] = useState('')
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)
  const [copied, setCopied] = useState(false)

  const shareImage = useMemo(
    () => (result ? renderShareCard(result) : null),
    [result],
  )

  const runMatch = (a, b) => {
    const nextError = validate(a, '첫 번째') ?? validate(b, '두 번째')
    if (nextError) {
      setError(nextError)
      setResult(null)
      return
    }
    const calc = calculate(a, b)
    if (!calc) {
      setError('이름을 확인해 주세요')
      setResult(null)
      return
    }
    setError(null)
    setCopied(false)
    setResult(calc)
  }

  const handleSubmit = () => runMatch(first, second)

  const handleRandom = () => {
    let candidate = randomName()
    let guard = 0
    while (candidate === first.trim() && guard < 10) {
      candidate = randomName()
      guard += 1
    }
    setSecond(candidate)
    setError(null)
  }

  const handleCopy = async () => {
    if (!result) return
    const text = shareText(result)
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  const handleDownload = () => {
    if (!shareImage || !result) return
    downloadShareCard(shareImage, `${result.first.raw}-${result.second.raw}-궁합.png`)
  }

  return (
    <main className="app">
      <header className="hero">
        <h1>
          이름 <em>궁합</em>
        </h1>
        <p>두 이름의 오행으로 궁합을 점쳐봅니다</p>
      </header>

      {!result ? (
        <NameForm
          first={first}
          second={second}
          error={error}
          onFirst={setFirst}
          onSecond={setSecond}
          onSubmit={handleSubmit}
          onRandom={handleRandom}
        />
      ) : (
        <>
          <ResultView result={result} onReset={() => setResult(null)} />

          <section className="share">
            <h3>결과 저장</h3>
            <div className="share-body">
              {shareImage && (
                <img className="share-preview" src={shareImage} alt="결과 카드 미리보기" />
              )}
              <div className="share-actions">
                <button type="button" className="btn primary" onClick={handleDownload}>
                  🖼 카드 저장
                </button>
                <button type="button" className="btn ghost" onClick={handleCopy}>
                  {copied ? '✅ 복사됨' : '📋 결과 텍스트 복사'}
                </button>
              </div>
            </div>
          </section>
        </>
      )}

      <footer className="foot">
        팬메이드 재미용 결과이며 실제 인연과 관계없습니다. 이름 궁합은 오행의象征적 해석입니다.
      </footer>
    </main>
  )
}
