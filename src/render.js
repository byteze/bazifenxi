/**
 * UI 渲染模块 - 专业细盘页
 */
import { getWuXing, CANG_GAN, SHI_SHEN_TABLE } from './bazi.js';

// 五行CSS类名映射
function wxClass(char) {
  const wx = getWuXing(char);
  const map = { '木': 'wood', '火': 'fire', '土': 'soil', '金': 'gold', '水': 'water' };
  return map[wx] || '';
}

function wxColorClass(wx) {
  const map = { '木': 'wood', '火': 'fire', '土': 'soil', '金': 'gold', '水': 'water' };
  return map[wx] || '';
}

// 十神简称
function ssShort(ss) {
  const map = {
    '比肩': '比', '劫财': '劫', '食神': '食', '伤官': '伤',
    '偏财': '才', '正财': '财', '七杀': '杀', '正官': '官',
    '偏印': '枭', '正印': '印', '元男': '', '元女': ''
  };
  return map[ss] ?? ss;
}

/**
 * 渲染专业细盘完整页面
 */
export function renderChart(container, data, state) {
  const { pillars, daYun, sex, lunar, solar, wuXingStatus, dayGan } = data;
  const { selectedDaYun, selectedLiuNian } = state;

  // 找到当前大运和流年
  const currentDY = daYun[selectedDaYun] || daYun[0];
  const liuNianList = currentDY?.liuNian || [];
  const currentLN = liuNianList[selectedLiuNian] || liuNianList[0];
  const liuYueList = currentLN ? data.getLiuYue(currentLN.gan, currentLN.year) : [];

  // 找当前选中的流月 (默认当前月份)
  const now = new Date();
  const currentMonth = now.getMonth(); // 0-indexed
  const selectedLiuYue = state.selectedLiuYue ?? currentMonth;
  const currentLY = liuYueList[selectedLiuYue] || liuYueList[0];

  // 流日 - 根据选中的流月计算
  let liuRiList = [];
  let liuRiSolarMonth = null;
  let liuRiSolarYear = null;
  if (currentLY && currentLN) {
    // 计算流月对应的阳历月份
    // 流月index: 0=寅月(2月), 1=卯月(3月), ..., 10=子月(11月), 11=丑月(12月→次年1月)
    const lyIndex = currentLY.index;
    if (lyIndex < 11) {
      liuRiSolarMonth = lyIndex + 2; // 寅月=2月, 卯月=3月, ...
      liuRiSolarYear = currentLN.year;
    } else {
      liuRiSolarMonth = 1; // 丑月=次年1月
      liuRiSolarYear = currentLN.year + 1;
    }
    liuRiList = data.getLiuRi(liuRiSolarYear, liuRiSolarMonth);
  }

  // 找当前选中的流日 (默认当天或第一天)
  let selectedLiuRi = state.selectedLiuRi;
  if (selectedLiuRi === null || selectedLiuRi === undefined) {
    // 尝试自动选中当天
    const todayDay = now.getDate();
    const todayMonth = now.getMonth() + 1;
    const todayYear = now.getFullYear();
    if (liuRiSolarYear === todayYear && liuRiSolarMonth === todayMonth) {
      selectedLiuRi = todayDay - 1;
    } else {
      selectedLiuRi = 0;
    }
  }
  const currentLR = liuRiList[selectedLiuRi] || liuRiList[0];

  // 小运
  const xiaoYun = currentLN?.xiaoYun || null;

  // 完整天干地支交互
  const extraTg = [];
  const extraDz = [];
  if (currentLR) { extraTg.push(currentLR.gan); extraDz.push(currentLR.zhi); }
  if (currentLY) { extraTg.push(currentLY.gan); extraDz.push(currentLY.zhi); }
  if (currentLN) { extraTg.push(currentLN.gan); extraDz.push(currentLN.zhi); }
  if (xiaoYun) { extraTg.push(xiaoYun.gan); extraDz.push(xiaoYun.zhi); }
  const fullInteractions = data.getFullInteractions(extraTg, extraDz);

  // 神煞
  const ec = { dayGan: data.dayGan, dayZhi: data.dayZhi, yearZhi: pillars[0].zhi, monthZhi: pillars[1].zhi };

  const genderLabel = sex === 1 ? '乾造' : '坤造';

  let html = `
    <!-- 头部信息 -->
    <div class="chart-header">
      <div class="header-avatar">
        <div class="avatar-circle">${sex === 1 ? '♂' : '♀'}</div>
        <span class="avatar-name">${state.userName || '未知'}</span>
      </div>
      <div class="header-info">
        <div>阴历：${lunar.year}年${lunar.month}月${lunar.day} ${lunar.shiChen}时 <span class="tag-gender">(${genderLabel})</span></div>
        <div>阳历：${solar.year}年${solar.month}月${solar.day}日 ${String(solar.hour).padStart(2, '0')}:${String(solar.minute).padStart(2, '0')}</div>
      </div>
    </div>

    <!-- 专业细盘主表格 -->
    <div class="pro-table-wrapper">
      <table class="pro-table">
        <thead>
          <tr>
            <th>日期</th>
            <th class="col-border">流日</th>
            <th class="col-border">流月</th>
            <th class="col-border">流年</th>
            <th class="col-border">小运</th>
            <th class="col-border col-pillar">年柱</th>
            <th class="col-border">月柱</th>
            <th class="col-border">日柱</th>
            <th class="col-border">时柱</th>
          </tr>
        </thead>
        <tbody>
          <!-- 主星 -->
          <tr class="row-alt">
            <td class="row-label">主星</td>
            <td class="col-border">${currentLR ? SHI_SHEN_TABLE[dayGan]?.[currentLR.gan] || '' : ''}</td>
            <td class="col-border">${currentLY ? SHI_SHEN_TABLE[dayGan]?.[currentLY.gan] || '' : ''}</td>
            <td class="col-border">${currentLN ? currentLN.ganShiShen : ''}</td>
            <td class="col-border">${xiaoYun ? SHI_SHEN_TABLE[dayGan]?.[xiaoYun.gan] || '' : ''}</td>
            ${pillars.map(p => `<td class="col-border${p.label === '年柱' ? ' col-pillar' : ''}">${p.mainStar}</td>`).join('')}
          </tr>
          <!-- 天干 -->
          <tr>
            <td class="row-label">天干</td>
            <td class="col-border"><span class="gz-char ${wxClass(currentLR?.gan)}">${currentLR?.gan || ''}</span></td>
            <td class="col-border"><span class="gz-char ${wxClass(currentLY?.gan)}">${currentLY?.gan || ''}</span></td>
            <td class="col-border"><span class="gz-char ${wxClass(currentLN?.gan)}">${currentLN?.gan || ''}</span></td>
            <td class="col-border"><span class="gz-char ${wxClass(xiaoYun?.gan)}">${xiaoYun?.gan || ''}</span></td>
            ${pillars.map(p => `<td class="col-border${p.label === '年柱' ? ' col-pillar' : ''}"><span class="gz-char ${wxClass(p.gan)}">${p.gan}</span></td>`).join('')}
          </tr>
          <!-- 地支 -->
          <tr class="row-alt">
            <td class="row-label">地支</td>
            <td class="col-border"><span class="gz-char ${wxClass(currentLR?.zhi)}">${currentLR?.zhi || ''}</span></td>
            <td class="col-border"><span class="gz-char ${wxClass(currentLY?.zhi)}">${currentLY?.zhi || ''}</span></td>
            <td class="col-border"><span class="gz-char ${wxClass(currentLN?.zhi)}">${currentLN?.zhi || ''}</span></td>
            <td class="col-border"><span class="gz-char ${wxClass(xiaoYun?.zhi)}">${xiaoYun?.zhi || ''}</span></td>
            ${pillars.map(p => `<td class="col-border${p.label === '年柱' ? ' col-pillar' : ''}"><span class="gz-char ${wxClass(p.zhi)}">${p.zhi}</span></td>`).join('')}
          </tr>
          <!-- 藏干 -->
          <tr>
            <td class="row-label">藏干</td>
            <td class="col-border">${renderCangGan(currentLR?.zhi, dayGan)}</td>
            <td class="col-border">${renderCangGan(currentLY?.zhi, dayGan)}</td>
            <td class="col-border">${renderCangGan(currentLN?.zhi, dayGan)}</td>
            <td class="col-border">${renderCangGan(xiaoYun?.zhi, dayGan)}</td>
            ${pillars.map(p => `<td class="col-border${p.label === '年柱' ? ' col-pillar' : ''}">${renderCangGanFull(p, dayGan)}</td>`).join('')}
          </tr>
          <!-- 星运 -->
          <tr class="row-alt">
            <td class="row-label">星运</td>
            <td class="col-border">${currentLR ? getChangShengImport(dayGan, currentLR.zhi) : ''}</td>
            <td class="col-border">${currentLY ? getChangShengImport(dayGan, currentLY.zhi) : ''}</td>
            <td class="col-border">${currentLN ? getChangShengImport(dayGan, currentLN.zhi) : ''}</td>
            <td class="col-border">${xiaoYun ? getChangShengImport(dayGan, xiaoYun.zhi) : ''}</td>
            ${pillars.map(p => `<td class="col-border${p.label === '年柱' ? ' col-pillar' : ''}">${p.xingYun}</td>`).join('')}
          </tr>
          <!-- 自坐 -->
          <tr>
            <td class="row-label">自坐</td>
            <td class="col-border">${currentLR ? getZiZuoImport(currentLR.gan, currentLR.zhi) : ''}</td>
            <td class="col-border">${currentLY ? getZiZuoImport(currentLY.gan, currentLY.zhi) : ''}</td>
            <td class="col-border">${currentLN ? getZiZuoImport(currentLN.gan, currentLN.zhi) : ''}</td>
            <td class="col-border">${xiaoYun ? getZiZuoImport(xiaoYun.gan, xiaoYun.zhi) : ''}</td>
            ${pillars.map(p => `<td class="col-border${p.label === '年柱' ? ' col-pillar' : ''}">${p.ziZuo}</td>`).join('')}
          </tr>
          <!-- 空亡 -->
          <tr class="row-alt">
            <td class="row-label">空亡</td>
            <td class="col-border">${currentLR ? getKongWangImport(currentLR.gz) : ''}</td>
            <td class="col-border">${currentLY ? getKongWangImport(currentLY.gz) : ''}</td>
            <td class="col-border">${currentLN ? getKongWangImport(currentLN.gz) : ''}</td>
            <td class="col-border">${xiaoYun ? getKongWangImport(xiaoYun.gz) : ''}</td>
            ${pillars.map(p => `<td class="col-border${p.label === '年柱' ? ' col-pillar' : ''}">${p.kongWang}</td>`).join('')}
          </tr>
          <!-- 纳音 -->
          <tr>
            <td class="row-label">纳音</td>
            <td class="col-border"><span class="text-sm">${currentLR ? getNaYinImport(currentLR.gz) : ''}</span></td>
            <td class="col-border"><span class="text-sm">${currentLY ? getNaYinImport(currentLY.gz) : ''}</span></td>
            <td class="col-border"><span class="text-sm">${currentLN ? getNaYinImport(currentLN.gz) : ''}</span></td>
            <td class="col-border"><span class="text-sm">${xiaoYun ? getNaYinImport(xiaoYun.gz) : ''}</span></td>
            ${pillars.map(p => `<td class="col-border${p.label === '年柱' ? ' col-pillar' : ''}"><span class="text-sm">${p.naYin}</span></td>`).join('')}
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 起运信息 -->
    <div class="qiyun-bar">
      <span>${data.qiYunDesc}</span>
      <span>${data.qiYunAge}岁</span>
    </div>

    <!-- 大运区域 -->
    <div class="section-block">
      <div class="section-title-bar">
        <div class="section-title-vert"><span>大</span><span>运</span></div>
      </div>
      <div class="dayun-scroll" id="dayun-scroll">
        ${daYun.map((dy, idx) => `
          <div class="dayun-card ${idx === selectedDaYun ? 'selected' : ''}" data-dayun="${idx}">
            <div class="dayun-year">${dy.startYear}</div>
            <div class="dayun-age">${dy.isXiaoYun ? `${dy.startAge}~${dy.endAge}岁` : `${dy.startAge}岁`}</div>
            ${dy.isXiaoYun ? '<div class="dayun-label">小运</div>' :
      `<div class="dayun-gz"><span class="gz-char ${wxClass(dy.gan)}">${dy.gan}</span><span class="ss-label">${ssShort(dy.shiShen)}</span></div>
               <div class="dayun-gz"><span class="gz-char ${wxClass(dy.zhi)}">${dy.zhi}</span><span class="ss-label">${ssShort(dy.zhiShiShen)}</span></div>`
    }
          </div>
        `).join('')}
      </div>
    </div>

    <!-- 流年区域 -->
    <div class="section-block">
      <div class="section-title-bar">
        <div class="section-title-vert"><span>流</span><span>年</span></div>
        <div class="section-title-sub">小运</div>
      </div>
      <div class="liunian-scroll" id="liunian-scroll">
        ${liuNianList.map((ln, idx) => `
          <div class="liunian-card ${idx === selectedLiuNian ? 'selected' : ''} ${ln.year === now.getFullYear() ? 'current-year' : ''}" data-liunian="${idx}">
            <div class="ln-year">${ln.year}</div>
            <div class="ln-gz"><span class="gz-char ${wxClass(ln.gan)}">${ln.gan}</span><span class="ss-label">${ssShort(ln.ganShiShen)}</span></div>
            <div class="ln-gz"><span class="gz-char ${wxClass(ln.zhi)}">${ln.zhi}</span><span class="ss-label">${ssShort(ln.zhiShiShen)}</span></div>
            ${ln.xiaoYun ? `<div class="ln-xiaoyun">${ln.xiaoYun.gz}</div>` : ''}
          </div>
        `).join('')}
      </div>
    </div>

    <!-- 流月区域 -->
    <div class="section-block">
      <div class="section-title-bar">
        <div class="section-title-vert"><span>流</span><span>月</span></div>
      </div>
      <div class="liuyue-scroll" id="liuyue-scroll">
        ${liuYueList.map((ly, idx) => `
          <div class="liuyue-card ${idx === selectedLiuYue ? 'selected' : ''}" data-liuyue="${idx}">
            <div class="ly-jq">${ly.jieQi}</div>
            <div class="ly-date">${ly.jieQiDate}</div>
            <div class="ly-gz"><span class="gz-char ${wxClass(ly.gan)}">${ly.gan}</span><span class="ss-label">${ssShort(ly.ganShiShen)}</span></div>
            <div class="ly-gz"><span class="gz-char ${wxClass(ly.zhi)}">${ly.zhi}</span><span class="ss-label">${ssShort(ly.zhiShiShen)}</span></div>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- 流日区域 -->
    <div class="section-block">
      <div class="section-title-bar">
        <div class="section-title-vert"><span>流</span><span>日</span></div>
        ${liuRiSolarYear && liuRiSolarMonth ? `<div class="section-title-sub">${liuRiSolarMonth}月</div>` : ''}
      </div>
      <div class="liuri-scroll" id="liuri-scroll">
        ${liuRiList.map((lr, idx) => {
      const isToday = lr.year === now.getFullYear() && lr.month === (now.getMonth() + 1) && lr.day === now.getDate();
      return `
          <div class="liuri-card ${idx === selectedLiuRi ? 'selected' : ''} ${isToday ? 'current-day' : ''}" data-liuri="${idx}">
            <div class="lr-date">${lr.month}/${lr.day}</div>
            <div class="lr-week">周${lr.weekDay}</div>
            <div class="lr-gz"><span class="gz-char ${wxClass(lr.gan)}">${lr.gan}</span><span class="ss-label">${ssShort(lr.ganShiShen)}</span></div>
            <div class="lr-gz"><span class="gz-char ${wxClass(lr.zhi)}">${lr.zhi}</span><span class="ss-label">${ssShort(lr.zhiShiShen)}</span></div>
          </div>
        `}).join('')}
      </div>
    </div>

    <!-- 五行旺相 -->
    <div class="wx-status-bar">
      ${['水', '木', '金', '土', '火'].map(wx => {
        const status = wuXingStatus[wx] || '';
        return `<span class="wx-tag ${wxColorClass(wx)}">${wx}${status}</span>`;
      }).join('')}
    </div>

    <!-- 天干留意 / 地支留意 -->
    <div class="interactions-box">
      <div class="interaction-row">
        <div class="interaction-label">天干留意</div>
        <div class="interaction-value">${fullInteractions.tg.join(',') || '无'}</div>
      </div>
      <div class="interaction-row">
        <div class="interaction-label">地支留意</div>
        <div class="interaction-value">${fullInteractions.dz.join(',') || '无'}</div>
      </div>
    </div>

    <!-- 神煞 -->
    ${renderShenShaSection('四柱神煞', pillars.map(p => ({ label: p.gz, list: p.shenSha })))}
    ${currentDY && !currentDY.isXiaoYun ? renderShenShaSection('大运神煞', [{ label: currentDY.gz, list: currentDY.shenSha }]) : ''}
    ${currentLN ? renderShenShaSection('流年神煞', [{ label: currentLN.gz, list: currentLN.shenSha }]) : ''}
    ${currentLY ? renderShenShaSection('流月神煞', [{ label: currentLY.gz, list: currentLY.shenSha }]) : ''}
    ${currentLR ? renderShenShaSection('流日神煞', [{ label: currentLR.gz, list: currentLR.shenSha }]) : ''}
  `;

  container.innerHTML = html;
}

function renderCangGan(zhi, dayGan) {
  if (!zhi) return '';
  const cg = CANG_GAN[zhi] || [];
  return `<div class="cg-list">${cg.map(g => `<div class="cg-item"><span class="${wxClass(g)}">${g}</span> <span class="ss-sm">${ssShort(SHI_SHEN_TABLE[dayGan]?.[g] || '')}</span></div>`).join('')}</div>`;
}

function renderCangGanFull(pillar, dayGan) {
  return `<div class="cg-list">${pillar.cangGan.map(cg =>
    `<div class="cg-item"><span class="${wxClass(cg.gan)}">${cg.gan}</span> <span class="ss-sm">${ssShort(cg.shiShen)}</span></div>`
  ).join('')}</div>`;
}

function renderShenShaSection(title, items) {
  const filtered = items.filter(it => it.list && it.list.length > 0);
  if (filtered.length === 0) return '';
  return `
    <div class="shensha-section">
      <div class="shensha-title">${title}</div>
      <div class="shensha-content">
        ${filtered.map(it => `
          <div class="shensha-row">
            <span class="shensha-label">${it.label}：</span>
            <div class="shensha-tags">${it.list.map(s => `<span class="shensha-tag">${s}</span>`).join('')}</div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

// 导入辅助函数
import { getChangSheng, getNaYin, getPillarKongWang } from './bazi.js';
function getChangShengImport(dayGan, zhi) { return zhi ? getChangSheng(dayGan, zhi) : ''; }
function getZiZuoImport(gan, zhi) { return (gan && zhi) ? getChangSheng(gan, zhi) : ''; }
function getKongWangImport(gz) { return gz ? getPillarKongWang(gz) : ''; }
function getNaYinImport(gz) { return gz ? getNaYin(gz) : ''; }
