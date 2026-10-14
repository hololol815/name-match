import { ELEMENT_LIST, ELEMENTS } from '../game/elements.js'

export default function NameForm({ first, second, error, onFirst, onSecond, onSubmit, onRandom }) {
  return (
    <form
      className="name-form"
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit()
      }}
    >
      <div className="field">
        <label htmlFor="name-a">첫 번째 이름</label>
        <input
          id="name-a"
          value={first}
          onChange={(e) => onFirst(e.target.value)}
          placeholder="예: 김나영"
          maxLength={6}
          autoComplete="off"
        />
      </div>

      <div className="heart" aria-hidden="true">
        ♥
      </div>

      <div className="field">
        <label htmlFor="name-b">두 번째 이름</label>
        <input
          id="name-b"
          value={second}
          onChange={(e) => onSecond(e.target.value)}
          placeholder="예: 이현우"
          maxLength={6}
          autoComplete="off"
        />
      </div>

      <div className="actions">
        <button type="submit" className="btn primary">
          궁합 보기
        </button>
        <button type="button" className="btn ghost" onClick={onRandom}>
          🎲 상대 랜덤 뽑기
        </button>
      </div>

      {error && <p className="error">{error}</p>}

      <ul className="legend">
        {ELEMENT_LIST.map((el) => (
          <li key={el.key}>
            <span className="dot" style={{ background: el.color }} />
            {ELEMENTS[el.key].hanja} {el.name}
          </li>
        ))}
      </ul>
      <p className="note">
        글자마다 오행이 정해져 있고, 목생화·화생토·토생금·금생수·수생목(相生)과 상극(相克)을
        계산해 점수를 냅니다.
      </p>
    </form>
  )
}
