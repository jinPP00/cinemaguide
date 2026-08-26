import { pricesOf } from '@/lib/data';
import type { Branch } from '@/lib/types';

type FormatInfo = {
  key: string;
  title: string;
  desc: string;
};

/**
 * 요금표에 실제로 등장하는 상영 방식만 짧게 설명한다.
 *
 * 가격이 싸다/비싸다는 평가는 하지 않는다. 사용자가 표의 이름만 보고도
 * "2D와 3D가 뭐가 다른지", "IMAX/4DX는 왜 별도 요금표인지" 알 수 있도록
 * 화면·좌석·음향·착용 장비처럼 관람 방식에서 확인 가능한 차이만 적는다.
 * 홍보성 수식어(압도적·최고·몰입감 등)는 쓰지 않는다.
 */
function formatInfo(label: string): FormatInfo | null {
  const upper = label.toUpperCase();

  if (/ULTRA\s*4DX/.test(upper)) {
    return {
      key: 'ultra4dx',
      title: 'ULTRA 4DX',
      desc: '4DX의 움직이는 좌석·환경 효과와 SCREENX의 좌우 확장 화면을 함께 사용하는 상영 방식입니다.',
    };
  }
  if (/4DX|MX4D|수퍼\s*4D/.test(label)) {
    return {
      key: '4dx',
      title: /MX4D/i.test(label) ? 'MX4D' : /수퍼\s*4D/.test(label) ? '수퍼 4D' : '4DX',
      desc: '영화 장면에 맞춰 좌석이 움직이고 바람·진동·안개·향 등 환경 효과가 함께 작동하는 상영 방식입니다.',
    };
  }
  if (/SCREENX/i.test(label)) {
    return {
      key: 'screenx',
      title: 'SCREENX',
      desc: '정면 화면뿐 아니라 좌우 벽면까지 영상을 이어서 보여주는 3면 상영 방식입니다. 좌우 화면은 대응하는 장면에서 사용됩니다.',
    };
  }
  if (/IMAX/i.test(label)) {
    return {
      key: 'imax',
      title: /LASER/i.test(label) ? 'IMAX LASER' : 'IMAX',
      desc: 'IMAX 규격의 대형 스크린과 전용 영사·음향 시스템을 사용하는 상영관입니다. LASER 표기는 레이저 영사 시스템을 쓰는 관입니다.',
    };
  }
  if (/DOLBY\s*CINEMA/i.test(label)) {
    return {
      key: 'dolby-cinema',
      title: 'DOLBY CINEMA',
      desc: 'Dolby Vision 영상 규격과 Dolby Atmos 입체 음향을 함께 적용한 상영관입니다.',
    };
  }
  if (/DOLBY\s*(?:VISION\s*\+\s*)?ATMOS|DOLBY ATMOS/i.test(label)) {
    return {
      key: 'dolby-atmos',
      title: /VISION/i.test(label) ? 'DOLBY VISION + ATMOS' : 'DOLBY ATMOS',
      desc: /VISION/i.test(label)
        ? 'Dolby Vision 영상과 Dolby Atmos 입체 음향을 함께 적용합니다.'
        : '천장 방향을 포함한 다채널 스피커 구성을 사용하는 Dolby Atmos 음향 규격이 적용됩니다.',
    };
  }
  if (/리클라이너|RECLINER/i.test(label)) {
    return {
      key: 'recliner',
      title: '리클라이너',
      desc: '등받이를 뒤로 눕힐 수 있는 좌석을 사용하는 상영관입니다. 지점에 따라 일반석과 리클라이너석 요금이 따로 표시됩니다.',
    };
  }
  if (/COMFORT/i.test(label)) {
    return {
      key: 'comfort',
      title: 'COMFORT',
      desc: '좌석 등급을 나눠 운영하는 상영관입니다. 같은 관에서도 일반석·스페셜석·커플석처럼 선택한 좌석에 따라 요금표가 달라질 수 있습니다.',
    };
  }
  if (/수퍼LED|광음LED|MEGA\s*\|\s*LED/i.test(label)) {
    return {
      key: 'led',
      title: 'LED 상영관',
      desc: '영사기로 스크린에 빛을 쏘는 방식이 아니라 LED 패널 자체가 영상을 표시하는 상영관입니다.',
    };
  }
  if (/수퍼플렉스/i.test(label)) {
    return {
      key: 'superplex',
      title: '수퍼플렉스',
      desc: '롯데시네마의 대형 스크린 상영관입니다. 지점별 상영관 구성과 좌석 형태는 다를 수 있습니다.',
    };
  }
  if (/샤롯데|BOUTIQUE|SUITE|GOLD\s*CLASS/i.test(label)) {
    return {
      key: 'premium',
      title: /샤롯데/.test(label) ? '샤롯데' : /BOUTIQUE/i.test(label) ? 'BOUTIQUE' : '프리미엄 상영관',
      desc: '일반 상영관과 좌석 구성·좌석 수·부대 서비스가 다른 프리미엄 형태의 상영관입니다. 제공 항목은 지점과 상품에 따라 다릅니다.',
    };
  }

  // 3D가 포함된 특별관은 위에서 특별관 설명을 먼저 반환한다. 일반 3D 요금표만 여기로 온다.
  if (/(^|[^A-Z0-9])3D([^A-Z0-9]|$)/i.test(label)) {
    return {
      key: '3d',
      title: '3D',
      desc: '좌우 눈에 서로 다른 영상을 보여 입체감을 만드는 상영 방식으로, 관람할 때 3D 안경을 착용합니다.',
    };
  }
  if (/(^|[^A-Z0-9])2D([^A-Z0-9]|$)/i.test(label) || /일반/.test(label)) {
    return {
      key: '2d',
      title: '2D',
      desc: '일반적인 평면 영상 상영 방식입니다. 3D 전용 안경이나 움직이는 좌석 같은 별도 관람 장비는 사용하지 않습니다.',
    };
  }

  return null;
}

export default function CheapestNote({ branch }: { branch: Branch }) {
  const labels = [...new Set(pricesOf(branch.id).map((row) => row.label).filter(Boolean))];
  const seen = new Set<string>();
  const items: FormatInfo[] = [];

  for (const label of labels) {
    const info = formatInfo(label);
    if (!info || seen.has(info.key)) continue;
    seen.add(info.key);
    items.push(info);
  }

  if (items.length === 0) return null;

  return (
    <div className="fare-format-guide" aria-label="상영 방식 차이">
      <div className="fare-format-heading">상영 방식 차이</div>
      <dl className="fare-format-list">
        {items.map((item) => (
          <div key={item.key}>
            <dt>{item.title}</dt>
            <dd>{item.desc}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
