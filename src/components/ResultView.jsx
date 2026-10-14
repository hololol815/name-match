import { ELEMENT_LIST, ELEMENTS, isGenerating, isOvercoming } from '../game/elements.js'

function NameColumn({ name, side }) {
  return (
    <div className={`name-col ${side}`}>
      <ul className="letters">
        {name.letters.map((l) => (
          <li key={`${l.char}-${l.index}`} className="letter">
            <span className="glyph">{l.char}</span>
            <span className="hanja" style={{ color: l.element ? ELEMENTS[l.element].color : '#888' }}>
              {l.element ? ELEMENTS[l.element].hanja : '—'}
            </span>
            <span className="elem-name">{l.element ? ELEMENTS[l.element].name : ''}</span>
          </li>
        ))}
      </ul>
      <div className="bar" role="img" aria-label="오행 분포">
        {ELEMENT_LIST.map((el) => {
          const count = name.counts[el.key]
          const total = Math.max(1, name.letters.filter((l) => l.element).length)
          return (
            <span
              key={el.key}
              className="seg"
              title={`${el.name} ${count}글자`}
              style={{
                width: count ? `${(count / total) * 100}%` : '0%',
                background: el.color,
              }}
            />
          )
        })}
      </div>
      <p className="dominant">
        지배 오행{' '}<strong style={{ color: name.dominant ? ELEMENTS[name.dominant].color : '#888' }}>
          {name.dominant ? `${ELEMENTS[name.dominant].hanja} ${ELEMENTS[name.dominant].name}` : '—'}
        </strong>
      </p>
    </div>
  )
}

export default function ResultView({ result, onReset }) {
  const { score, tier, first, second, reasons, relation, shared } = result
  const relationClass = relation ? relation.type : 'none'

  return (
    <section className="result">
      <header className="result-head">
        <p className="label">이름 궁합 결과</p>
        <h2 className="tier">
          {tier.emoji} {tier.title}
        </h2>
        <p className="tier-desc">{tier.desc}</p>
      </header>

      <div className="score-wrap">
        <div
          className="score-ring"
          style={{ '--pct': `${score * 3.6}deg` }}
          role="img"
          aria-label={`궁합 ${score}점`}
        >
          <div className="score-inner">
            <strong>{score}</strong>
            <span>점</span>
          </div>
        </div>
      </div>

      <div className="names">
        <NameColumn name={first} side="left" />
        <div className={`relation ${relationClass}`}>
          <span className="symbol">
            {relationClass === 'same' ? '＝' : relationClass === 'generates' ? '→' : relationClass === 'overcomes' ? '→' : '?'}
          </span>
          <span className="rel-text">{relation ? relation.text : '오행 관계 없음'}</span>
        </div>
        <NameColumn name={second} side="right" />
      </div>

      {relation && (
        <p className={`rel-detail ${relationClass}`}>
          {ELEMENTS[relation.from].hanja}
          {isGenerating(relation.from, relation.to) ? ' 生 ' : isOvercoming(relation.from, relation.to) ? ' 克 ' : ' ＝ '}
          {ELEMENTS[relation.to].hanja}
        </p>
      )}

      {shared.length > 0 && (
        <p className="shared">
          공통 글자 <strong>{shared.join(' ')}</strong>
        </p>
      )}

      <ul className="reasons">
        {reasons.map((r) => (
          <li key={r}>{r}</li>
        ))}
      </ul>

      <div className="actions">
        <button type="button" className="btn primary" onClick={onReset}>
          다시 보기
        </button>
      </div>
    </section>
  )
}
