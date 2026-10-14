import { ELEMENT_LIST, ELEMENTS } from './elements.js'

const W = 720
const H = 960
const BG = ['#2b1430', '#0f0a1a']

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.roundRect(x, y, w, h, r)
}

function drawHeart(ctx, cx, cy, size, color) {
  ctx.save()
  ctx.translate(cx, cy)
  ctx.scale(size / 100, size / 100)
  ctx.beginPath()
  ctx.moveTo(0, 35)
  ctx.bezierCurveTo(-55, 0, -45, -45, -15, -45)
  ctx.bezierCurveTo(-5, -45, 0, -33, 0, -33)
  ctx.bezierCurveTo(0, -33, 5, -45, 15, -45)
  ctx.bezierCurveTo(45, -45, 55, 0, 0, 35)
  ctx.closePath()
  ctx.fillStyle = color
  ctx.fill()
  ctx.restore()
}

/**
 * 결과 카드 이미지를 만든다. 앱 어디서나 <img>로 쓰거나 다운로드할 수 있는 dataURL 반환.
 */
export function renderShareCard(result, tagline = '이름 궁합') {
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')

  // 배경
  const bg = ctx.createLinearGradient(0, 0, 0, H)
  bg.addColorStop(0, BG[0])
  bg.addColorStop(1, BG[1])
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)

  // 은은한 광원
  const glow = ctx.createRadialGradient(W / 2, 300, 20, W / 2, 300, 420)
  glow.addColorStop(0, 'rgba(255, 122, 182, 0.35)')
  glow.addColorStop(1, 'rgba(255, 122, 182, 0)')
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, W, H)

  const pink = '#ff7ab6'
  const dim = 'rgba(255,255,255,0.62)'

  // 타이틀
  ctx.textAlign = 'center'
  ctx.fillStyle = dim
  ctx.font = '600 22px system-ui, sans-serif'
  ctx.fillText(tagline, W / 2, 84)

  // 이름
  ctx.fillStyle = '#fff'
  ctx.font = '700 46px system-ui, sans-serif'
  ctx.fillText(result.first.raw, W / 2 - 110, 168)
  ctx.fillText(result.second.raw, W / 2 + 110, 168)

  ctx.font = '400 34px system-ui, sans-serif'
  ctx.fillStyle = pink
  ctx.fillText('♥', W / 2, 164)

  // 점수 링
  const cx = W / 2
  const cy = 360
  const radius = 120
  ctx.lineWidth = 18
  ctx.strokeStyle = 'rgba(255,255,255,0.12)'
  ctx.beginPath()
  ctx.arc(cx, cy, radius, 0, Math.PI * 2)
  ctx.stroke()

  const start = -Math.PI / 2
  const end = start + (Math.PI * 2 * result.score) / 100
  const ring = ctx.createLinearGradient(cx - radius, cy - radius, cx + radius, cy + radius)
  ring.addColorStop(0, '#ffd166')
  ring.addColorStop(1, pink)
  ctx.strokeStyle = ring
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.arc(cx, cy, radius, start, end)
  ctx.stroke()

  drawHeart(ctx, cx, cy - 18, 46, 'rgba(255,255,255,0.14)')

  ctx.fillStyle = '#fff'
  ctx.font = '800 76px system-ui, sans-serif'
  ctx.fillText(String(result.score), cx, cy + 30)
  ctx.font = '600 20px system-ui, sans-serif'
  ctx.fillStyle = dim
  ctx.fillText('궁합 점수', cx, cy + 62)

  // 등급
  ctx.font = '700 40px system-ui, sans-serif'
  ctx.fillStyle = '#ffd166'
  ctx.fillText(`${result.tier.emoji} ${result.tier.title}`, cx, 570)

  // 오행 바 두 개
  const barY = [650, 726]
  ;[result.first, result.second].forEach((name, i) => {
    const y = barY[i]
    ctx.textAlign = 'left'
    ctx.fillStyle = dim
    ctx.font = '500 18px system-ui, sans-serif'
    ctx.fillText(name.raw, 90, y - 14)

    const total = Math.max(1, name.letters.filter((l) => l.element).length)
    const x = 90
    const w = W - 180
    let acc = 0
    for (const el of ELEMENT_LIST) {
      const count = name.counts[el.key]
      if (count === 0) continue
      const segW = (count / total) * w
      ctx.fillStyle = el.color
      roundRect(ctx, x + acc, y, Math.max(segW - 6, 14), 22, 11)
      ctx.fill()
      acc += segW
    }
  })

  ctx.textAlign = 'center'
  ctx.fillStyle = dim
  ctx.font = '500 18px system-ui, sans-serif'
  const relationText = result.relation ? result.relation.text : '오행 관계를 계산할 수 없어요'
  ctx.fillText(relationText, W / 2, 800)

  // 하단
  ctx.fillStyle = 'rgba(255,255,255,0.35)'
  ctx.font = '500 16px system-ui, sans-serif'
  ctx.fillText('fanmade · 재미로만 즐겨주세요', W / 2, H - 56)

  return canvas.toDataURL('image/png')
}

export function downloadShareCard(dataUrl, filename) {
  const a = document.createElement('a')
  a.href = dataUrl
  a.download = filename
  a.click()
}

export function shareText(result) {
  return [
    `✨ 이름 궁합 결과 ✨`,
    `${result.first.raw} ♥ ${result.second.raw}`,
    `궁합 ${result.score}점 · ${result.tier.title}`,
    result.relation ? `· ${result.relation.text}` : '',
    '',
    '(fanmade 재미용 결과이며 실제 인연과 무관합니다)',
  ]
    .filter(Boolean)
    .join('\n')
}

export { ELEMENTS }
