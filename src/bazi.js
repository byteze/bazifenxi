/**
 * 八字计算引擎 - 基于 lunar-javascript
 */
import { Solar, Lunar, EightChar } from 'lunar-javascript';

// ========== 常量 ==========
const TIAN_GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const DI_ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

const WU_XING_MAP = {
    '甲': '木', '乙': '木', '丙': '火', '丁': '火', '戊': '土', '己': '土',
    '庚': '金', '辛': '金', '壬': '水', '癸': '水',
    '子': '水', '丑': '土', '寅': '木', '卯': '木', '辰': '土', '巳': '火',
    '午': '火', '未': '土', '申': '金', '酉': '金', '戌': '土', '亥': '水'
};

// 藏干表
const CANG_GAN = {
    '子': ['癸'], '丑': ['己', '癸', '辛'], '寅': ['甲', '丙', '戊'], '卯': ['乙'],
    '辰': ['戊', '乙', '癸'], '巳': ['丙', '庚', '戊'], '午': ['丁', '己'],
    '未': ['己', '丁', '乙'], '申': ['庚', '壬', '戊'], '酉': ['辛'],
    '戌': ['戊', '辛', '丁'], '亥': ['壬', '甲']
};

// 十神关系
const SHI_SHEN_TABLE = {
    '甲': { '甲': '比肩', '乙': '劫财', '丙': '食神', '丁': '伤官', '戊': '偏财', '己': '正财', '庚': '七杀', '辛': '正官', '壬': '偏印', '癸': '正印' },
    '乙': { '甲': '劫财', '乙': '比肩', '丙': '伤官', '丁': '食神', '戊': '正财', '己': '偏财', '庚': '正官', '辛': '七杀', '壬': '正印', '癸': '偏印' },
    '丙': { '甲': '偏印', '乙': '正印', '丙': '比肩', '丁': '劫财', '戊': '食神', '己': '伤官', '庚': '偏财', '辛': '正财', '壬': '七杀', '癸': '正官' },
    '丁': { '甲': '正印', '乙': '偏印', '丙': '劫财', '丁': '比肩', '戊': '伤官', '己': '食神', '庚': '正财', '辛': '偏财', '壬': '正官', '癸': '七杀' },
    '戊': { '甲': '七杀', '乙': '正官', '丙': '偏印', '丁': '正印', '戊': '比肩', '己': '劫财', '庚': '食神', '辛': '伤官', '壬': '偏财', '癸': '正财' },
    '己': { '甲': '正官', '乙': '七杀', '丙': '正印', '丁': '偏印', '戊': '劫财', '己': '比肩', '庚': '伤官', '辛': '食神', '壬': '正财', '癸': '偏财' },
    '庚': { '甲': '偏财', '乙': '正财', '丙': '七杀', '丁': '正官', '戊': '偏印', '己': '正印', '庚': '比肩', '辛': '劫财', '壬': '食神', '癸': '伤官' },
    '辛': { '甲': '正财', '乙': '偏财', '丙': '正官', '丁': '七杀', '戊': '正印', '己': '偏印', '庚': '劫财', '辛': '比肩', '壬': '伤官', '癸': '食神' },
    '壬': { '甲': '食神', '乙': '伤官', '丙': '偏财', '丁': '正财', '戊': '七杀', '己': '正官', '庚': '偏印', '辛': '正印', '壬': '比肩', '癸': '劫财' },
    '癸': { '甲': '伤官', '乙': '食神', '丙': '正财', '丁': '偏财', '戊': '正官', '己': '七杀', '庚': '正印', '辛': '偏印', '壬': '劫财', '癸': '比肩' },
};

// 十二长生表（日干对地支）
const SHI_ER_CHANG_SHENG_ORDER = ['长生', '沐浴', '冠带', '临官', '帝旺', '衰', '病', '死', '墓', '绝', '胎', '养'];
const CHANG_SHENG_START = {
    '甲': '亥', '乙': '午', '丙': '寅', '丁': '酉', '戊': '寅', '己': '酉',
    '庚': '巳', '辛': '子', '壬': '申', '癸': '卯'
};

// 纳音表
const NA_YIN = {
    '甲子': '海中金', '乙丑': '海中金', '丙寅': '炉中火', '丁卯': '炉中火',
    '戊辰': '大林木', '己巳': '大林木', '庚午': '路旁土', '辛未': '路旁土',
    '壬申': '剑锋金', '癸酉': '剑锋金', '甲戌': '山头火', '乙亥': '山头火',
    '丙子': '涧下水', '丁丑': '涧下水', '戊寅': '城头土', '己卯': '城头土',
    '庚辰': '白蜡金', '辛巳': '白蜡金', '壬午': '杨柳木', '癸未': '杨柳木',
    '甲申': '泉中水', '乙酉': '泉中水', '丙戌': '屋上土', '丁亥': '屋上土',
    '戊子': '霹雳火', '己丑': '霹雳火', '庚寅': '松柏木', '辛卯': '松柏木',
    '壬辰': '长流水', '癸巳': '长流水', '甲午': '沙中金', '乙未': '沙中金',
    '丙申': '山下火', '丁酉': '山下火', '戊戌': '平地木', '己亥': '平地木',
    '庚子': '壁上土', '辛丑': '壁上土', '壬寅': '金箔金', '癸卯': '金箔金',
    '甲辰': '覆灯火', '乙巳': '覆灯火', '丙午': '天河水', '丁未': '天河水',
    '戊申': '大驿土', '己酉': '大驿土', '庚戌': '钗钏金', '辛亥': '钗钏金',
    '壬子': '桑柘木', '癸丑': '桑柘木', '甲寅': '大溪水', '乙卯': '大溪水',
    '丙辰': '沙中土', '丁巳': '沙中土', '戊午': '天上火', '己未': '天上火',
    '庚申': '石榴木', '辛酉': '石榴木', '壬戌': '大海水', '癸亥': '大海水'
};

// 空亡表：以日柱查甲子旬
const KONG_WANG_TABLE = {
    '甲子': ['戌', '亥'], '甲戌': ['申', '酉'], '甲申': ['午', '未'],
    '甲午': ['辰', '巳'], '甲辰': ['寅', '卯'], '甲寅': ['子', '丑']
};

// 五行旺相休囚死 - 根据月令地支
const WANG_XIANG_MAP = {
    '寅': { '木': '旺', '火': '相', '土': '死', '金': '囚', '水': '休' },
    '卯': { '木': '旺', '火': '相', '土': '死', '金': '囚', '水': '休' },
    '巳': { '火': '旺', '土': '相', '金': '死', '水': '囚', '木': '休' },
    '午': { '火': '旺', '土': '相', '金': '死', '水': '囚', '木': '休' },
    '辰': { '土': '旺', '金': '相', '水': '死', '木': '囚', '火': '休' },
    '丑': { '土': '旺', '金': '相', '水': '死', '木': '囚', '火': '休' },
    '戌': { '土': '旺', '金': '相', '水': '死', '木': '囚', '火': '休' },
    '未': { '土': '旺', '金': '相', '水': '死', '木': '囚', '火': '休' },
    '申': { '金': '旺', '水': '相', '木': '死', '火': '囚', '土': '休' },
    '酉': { '金': '旺', '水': '相', '木': '死', '火': '囚', '土': '休' },
    '亥': { '水': '旺', '木': '相', '火': '死', '土': '囚', '金': '休' },
    '子': { '水': '旺', '木': '相', '火': '死', '土': '囚', '金': '休' },
};

// ========== 工具函数 ==========

function getWuXing(gz) {
    return WU_XING_MAP[gz] || '';
}

function getShiShen(riGan, otherGan) {
    if (riGan === otherGan) return '元男'; // 日干本身标记
    return SHI_SHEN_TABLE[riGan]?.[otherGan] || '';
}

// 获取日主十神（标记日主为元男/元女）
function getZhuStar(riGan, gan, sex) {
    if (gan === riGan) return sex === 1 ? '元男' : '元女';
    return SHI_SHEN_TABLE[riGan]?.[gan] || '';
}

function getChangSheng(riGan, diZhi) {
    const startDz = CHANG_SHENG_START[riGan];
    const startIdx = DI_ZHI.indexOf(startDz);
    const targetIdx = DI_ZHI.indexOf(diZhi);
    // 阳干顺行，阴干逆行
    const isYang = TIAN_GAN.indexOf(riGan) % 2 === 0;
    let diff;
    if (isYang) {
        diff = (targetIdx - startIdx + 12) % 12;
    } else {
        diff = (startIdx - targetIdx + 12) % 12;
    }
    return SHI_ER_CHANG_SHENG_ORDER[diff];
}

function getNaYin(gz) {
    return NA_YIN[gz] || '';
}

function getKongWang(dayGanZhi) {
    // 找到日柱所在的甲子旬
    const dayTgIdx = TIAN_GAN.indexOf(dayGanZhi[0]);
    const dayDzIdx = DI_ZHI.indexOf(dayGanZhi[1]);
    // 推算旬首
    let xunTgIdx = (dayTgIdx - dayDzIdx % 10 + 10) % 10;
    let xunDzIdx = (dayDzIdx - dayDzIdx % 12 + 12) % 12;
    // 直接计算: 甲子旬空亡戌亥, etc.
    const xunGz = TIAN_GAN[xunTgIdx] + DI_ZHI[xunDzIdx];
    // 空亡是旬中缺少的两个地支
    const xunDzSet = new Set();
    for (let i = 0; i < 10; i++) {
        xunDzSet.add(DI_ZHI[(xunDzIdx + i) % 12]);
    }
    const kw = DI_ZHI.filter(dz => !xunDzSet.has(dz));
    return kw.join('');
}

// 获取各柱的空亡
function getPillarKongWang(ganZhi) {
    const tgIdx = TIAN_GAN.indexOf(ganZhi[0]);
    const dzIdx = DI_ZHI.indexOf(ganZhi[1]);
    // 找旬首
    const offset = tgIdx; // 干在旬中的位置
    const xunDzStart = (dzIdx - offset + 12) % 12;
    // 空亡的两个地支
    const kw1 = DI_ZHI[(xunDzStart + 10) % 12];
    const kw2 = DI_ZHI[(xunDzStart + 11) % 12];
    return kw1 + kw2;
}

// ========== 天干关系 ==========
const TG_HE = [['甲', '己'], ['乙', '庚'], ['丙', '辛'], ['丁', '壬'], ['戊', '癸']];
const TG_HE_HUA = { '甲己': '土', '乙庚': '金', '丙辛': '水', '丁壬': '木', '戊癸': '火' };
const TG_CHONG = [['甲', '庚'], ['乙', '辛'], ['丙', '壬'], ['丁', '癸']];
const TG_KE_MAP = {
    '木': ['土'], '土': ['水'], '水': ['火'], '火': ['金'], '金': ['木']
};

function getTianGanInteractions(allTg) {
    const results = [];
    for (let i = 0; i < allTg.length; i++) {
        for (let j = i + 1; j < allTg.length; j++) {
            const a = allTg[i], b = allTg[j];
            // 相合
            for (const [x, y] of TG_HE) {
                if ((a === x && b === y) || (a === y && b === x)) {
                    const key = TIAN_GAN.indexOf(a) < TIAN_GAN.indexOf(b) ? a + b : b + a;
                    const hua = TG_HE_HUA[key] || '';
                    results.push(`${a}${b}合化${hua}`);
                }
            }
            // 相克
            const wxA = getWuXing(a), wxB = getWuXing(b);
            if (TG_KE_MAP[wxA]?.includes(wxB)) {
                results.push(`${a}${b}相克`);
            } else if (TG_KE_MAP[wxB]?.includes(wxA)) {
                results.push(`${b}${a}相克`);
            }
        }
    }
    return [...new Set(results)];
}

// ========== 地支关系 ==========
const DZ_LIU_HE = [['子', '丑', '土'], ['寅', '亥', '木'], ['卯', '戌', '火'], ['辰', '酉', '金'], ['巳', '申', '水'], ['午', '未', '火']];
const DZ_SAN_HE = [['申', '子', '辰', '水'], ['亥', '卯', '未', '木'], ['寅', '午', '戌', '火'], ['巳', '酉', '丑', '金']];
const DZ_SAN_HUI = [['寅', '卯', '辰', '木'], ['巳', '午', '未', '火'], ['申', '酉', '戌', '金'], ['亥', '子', '丑', '水']];
const DZ_CHONG = [['子', '午'], ['丑', '未'], ['寅', '申'], ['卯', '酉'], ['辰', '戌'], ['巳', '亥']];
const DZ_XING = [['寅', '巳', '申'], ['丑', '戌', '未'], ['子', '卯'], ['辰', '辰'], ['午', '午'], ['酉', '酉'], ['亥', '亥']];
const DZ_HAI = [['子', '未'], ['丑', '午'], ['寅', '巳'], ['卯', '辰'], ['申', '亥'], ['酉', '戌']];
const DZ_PO = [['子', '酉'], ['丑', '辰'], ['寅', '亥'], ['卯', '午'], ['巳', '申'], ['未', '戌']];
const DZ_AN_HE = [['午', '亥'], ['卯', '申']];

function getDiZhiInteractions(allDz) {
    const results = [];
    const dzSet = allDz;

    // 六合
    for (const [a, b, hua] of DZ_LIU_HE) {
        if (dzSet.includes(a) && dzSet.includes(b)) {
            results.push(`${a}${b}合化${hua}`);
        }
    }

    // 三合
    for (const [a, b, c, ju] of DZ_SAN_HE) {
        if (dzSet.includes(a) && dzSet.includes(b) && dzSet.includes(c)) {
            results.push(`${a}${b}${c}三合${ju}局`);
        }
        // 半合
        const has = [dzSet.includes(a), dzSet.includes(b), dzSet.includes(c)];
        const count = has.filter(Boolean).length;
        if (count === 2) {
            const present = [a, b, c].filter((_, i) => has[i]);
            results.push(`${present.join('')}半合${ju}局`);
        }
    }

    // 三会
    for (const [a, b, c, ju] of DZ_SAN_HUI) {
        if (dzSet.includes(a) && dzSet.includes(b) && dzSet.includes(c)) {
            results.push(`${a}${b}${c}三会${ju}局`);
        }
    }

    // 暗合
    for (const [a, b] of DZ_AN_HE) {
        if (dzSet.includes(a) && dzSet.includes(b)) {
            results.push(`${a}${b}暗合`);
        }
    }

    // 相刑
    for (const xing of DZ_XING) {
        if (xing.length === 3) {
            const [a, b, c] = xing;
            if (dzSet.includes(a) && dzSet.includes(b) && dzSet.includes(c)) {
                results.push(`${a}${b}${c}三刑`);
            }
            // 两两相刑
            for (let i = 0; i < 3; i++) for (let j = i + 1; j < 3; j++) {
                if (dzSet.includes(xing[i]) && dzSet.includes(xing[j])) {
                    results.push(`${xing[i]}${xing[j]}相刑`);
                }
            }
        } else if (xing.length === 2) {
            const [a, b] = xing;
            if (a === b) {
                if (dzSet.filter(d => d === a).length >= 2) {
                    results.push(`${a}${a}自刑`);
                }
            } else if (dzSet.includes(a) && dzSet.includes(b)) {
                results.push(`${a}${b}相刑`);
            }
        }
    }

    // 相冲
    for (const [a, b] of DZ_CHONG) {
        if (dzSet.includes(a) && dzSet.includes(b)) {
            results.push(`${a}${b}相冲`);
        }
    }

    // 相破
    for (const [a, b] of DZ_PO) {
        if (dzSet.includes(a) && dzSet.includes(b)) {
            results.push(`${a}${b}相破`);
        }
    }

    // 相害
    for (const [a, b] of DZ_HAI) {
        if (dzSet.includes(a) && dzSet.includes(b)) {
            results.push(`${a}${b}相害`);
        }
    }

    return [...new Set(results)];
}

// ========== 神煞计算 ==========
function getShenSha(eightChar, ganZhi) {
    // 使用 lunar-javascript 的神煞功能
    // 简化版：基于常见神煞规则
    const result = [];
    const dayGan = eightChar.dayGan;
    const dayZhi = eightChar.dayZhi;
    const yearZhi = eightChar.yearZhi;

    const tg = ganZhi[0];
    const dz = ganZhi.length > 1 ? ganZhi[1] : '';

    // 天乙贵人
    const tianYi = {
        '甲': ['丑', '未'], '戊': ['丑', '未'], '庚': ['丑', '未'],
        '乙': ['子', '申'], '己': ['子', '申'],
        '丙': ['亥', '酉'], '丁': ['亥', '酉'],
        '壬': ['卯', '巳'], '癸': ['卯', '巳'],
        '辛': ['午', '寅']
    };
    if (tianYi[dayGan]?.includes(dz)) result.push('天乙贵人');

    // 天德贵人
    const tianDe = {
        '寅': '丁', '卯': '申', '辰': '壬', '巳': '辛', '午': '甲', '未': '癸',
        '申': '壬', '酉': '丙', '戌': '乙', '亥': '甲', '子': '己', '丑': '庚'
    };
    if (tianDe[eightChar.monthZhi] === tg) result.push('天德贵人');

    // 月德贵人
    const yueDe = {
        '寅': '丙', '午': '丙', '戌': '丙', '申': '壬', '子': '壬', '辰': '壬',
        '亥': '甲', '卯': '甲', '未': '甲', '巳': '庚', '酉': '庚', '丑': '庚'
    };
    if (yueDe[eightChar.monthZhi] === tg) result.push('月德贵人');

    // 文昌贵人
    const wenChang = {
        '甲': '巳', '乙': '午', '丙': '申', '丁': '酉', '戊': '申',
        '己': '酉', '庚': '亥', '辛': '子', '壬': '寅', '癸': '卯'
    };
    if (wenChang[dayGan] === dz) result.push('文昌贵人');

    // 太极贵人
    const taiJi = {
        '甲': ['子', '午'], '乙': ['子', '午'], '丙': ['卯', '酉'], '丁': ['卯', '酉'],
        '戊': ['辰', '戌', '丑', '未'], '己': ['辰', '戌', '丑', '未'],
        '庚': ['寅', '亥'], '辛': ['寅', '亥'], '壬': ['巳', '申'], '癸': ['巳', '申']
    };
    if (taiJi[dayGan]?.includes(dz)) result.push('太极贵人');

    // 德秀贵人
    const deXiu = {
        '寅': ['丙', '丁', '戊', '己'], '卯': ['丙', '丁', '戊', '己'],
        '巳': ['戊', '己', '庚', '辛', '壬', '癸'], '午': ['戊', '己', '庚', '辛', '壬', '癸'],
        '申': ['壬', '癸', '甲', '乙'], '酉': ['壬', '癸', '甲', '乙'],
        '亥': ['甲', '乙', '丙', '丁'], '子': ['甲', '乙', '丙', '丁'],
        '辰': ['壬', '癸'], '戌': ['壬', '癸'], '丑': ['庚', '辛'], '未': ['庚', '辛']
    };
    if (deXiu[eightChar.monthZhi]?.includes(tg)) result.push('德秀贵人');

    // 福星贵人
    const fuXing = {
        '甲': '寅', '乙': '丑', '丙': '子', '丁': '亥', '戊': '申',
        '己': '未', '庚': '午', '辛': '巳', '壬': '辰', '癸': '卯'
    };
    if (fuXing[dayGan] === dz) result.push('福星贵人');

    // 国印贵人
    const guoYin = {
        '甲': '戌', '乙': '亥', '丙': '丑', '丁': '寅', '戊': '丑',
        '己': '寅', '庚': '辰', '辛': '巳', '壬': '未', '癸': '申'
    };
    if (guoYin[dayGan] === dz) result.push('国印贵人');

    // 天厨贵人
    const tianChu = {
        '甲': '巳', '乙': '午', '丙': '巳', '丁': '午', '戊': '巳',
        '己': '午', '庚': '亥', '辛': '子', '壬': '亥', '癸': '子'
    };
    if (tianChu[dayGan] === dz) result.push('天厨贵人');

    // 金舆
    const jinYu = {
        '甲': '辰', '乙': '巳', '丙': '未', '丁': '申', '戊': '未',
        '己': '申', '庚': '戌', '辛': '亥', '壬': '丑', '癸': '寅'
    };
    if (jinYu[dayGan] === dz) result.push('金舆');

    // 驿马
    const yiMa = {
        '寅': '申', '午': '申', '戌': '申', '申': '寅', '子': '寅', '辰': '寅',
        '巳': '亥', '酉': '亥', '丑': '亥', '亥': '巳', '卯': '巳', '未': '巳'
    };
    if (yiMa[yearZhi] === dz) result.push('驿马');

    // 华盖
    const huaGai = {
        '寅': '戌', '午': '戌', '戌': '戌', '申': '辰', '子': '辰', '辰': '辰',
        '巳': '丑', '酉': '丑', '丑': '丑', '亥': '未', '卯': '未', '未': '未'
    };
    if (huaGai[yearZhi] === dz) result.push('华盖');

    // 桃花
    const taoHua = {
        '寅': '卯', '午': '卯', '戌': '卯', '申': '酉', '子': '酉', '辰': '酉',
        '巳': '午', '酉': '午', '丑': '午', '亥': '子', '卯': '子', '未': '子'
    };
    if (taoHua[yearZhi] === dz) result.push('桃花');

    // 将星
    const jiangXing = {
        '寅': '午', '午': '午', '戌': '午', '申': '子', '子': '子', '辰': '子',
        '巳': '酉', '酉': '酉', '丑': '酉', '亥': '卯', '卯': '卯', '未': '卯'
    };
    if (jiangXing[yearZhi] === dz) result.push('将星');

    // 羊刃
    const yangRen = {
        '甲': '卯', '乙': '寅', '丙': '午', '丁': '巳', '戊': '午',
        '己': '巳', '庚': '酉', '辛': '申', '壬': '子', '癸': '亥'
    };
    if (yangRen[dayGan] === dz) result.push('羊刃');

    // 飞刃
    const feiRen = {
        '甲': '酉', '乙': '申', '丙': '子', '丁': '亥', '戊': '子',
        '己': '亥', '庚': '卯', '辛': '寅', '壬': '午', '癸': '巳'
    };
    if (feiRen[dayGan] === dz) result.push('飞刃');

    // 禄神
    const luShen = {
        '甲': '寅', '乙': '卯', '丙': '巳', '丁': '午', '戊': '巳',
        '己': '午', '庚': '申', '辛': '酉', '壬': '亥', '癸': '子'
    };
    if (luShen[dayGan] === dz) result.push('禄神');

    // 空亡
    const kw = getPillarKongWang(eightChar.dayGan + eightChar.dayZhi);
    if (kw.includes(dz)) result.push('空亡');

    // 亡神
    const wangShen = {
        '寅': '巳', '午': '巳', '戌': '巳', '申': '亥', '子': '亥', '辰': '亥',
        '巳': '申', '酉': '申', '丑': '申', '亥': '寅', '卯': '寅', '未': '寅'
    };
    if (wangShen[yearZhi] === dz) result.push('亡神');

    // 劫煞
    const jieSha = {
        '寅': '亥', '午': '亥', '戌': '亥', '申': '巳', '子': '巳', '辰': '巳',
        '巳': '寅', '酉': '寅', '丑': '寅', '亥': '申', '卯': '申', '未': '申'
    };
    if (jieSha[yearZhi] === dz) result.push('劫煞');

    // 灾煞
    const zaiSha = {
        '寅': '子', '午': '子', '戌': '子', '申': '午', '子': '午', '辰': '午',
        '巳': '卯', '酉': '卯', '丑': '卯', '亥': '酉', '卯': '酉', '未': '酉'
    };
    if (zaiSha[yearZhi] === dz) result.push('灾煞');

    // 天喜
    const tianXi = {
        '子': '酉', '丑': '申', '寅': '未', '卯': '午', '辰': '巳', '巳': '辰',
        '午': '卯', '未': '寅', '申': '丑', '酉': '子', '戌': '亥', '亥': '戌'
    };
    if (tianXi[yearZhi] === dz) result.push('天喜');

    // 红鸾
    const hongLuan = {
        '子': '卯', '丑': '寅', '寅': '丑', '卯': '子', '辰': '亥', '巳': '戌',
        '午': '酉', '未': '申', '申': '未', '酉': '午', '戌': '巳', '亥': '辰'
    };
    if (hongLuan[yearZhi] === dz) result.push('红鸾');

    // 孤辰
    const guChen = {
        '寅': '巳', '卯': '巳', '辰': '巳', '巳': '申', '午': '申', '未': '申',
        '申': '亥', '酉': '亥', '戌': '亥', '亥': '寅', '子': '寅', '丑': '寅'
    };
    if (guChen[yearZhi] === dz) result.push('孤辰');

    // 寡宿
    const guaSu = {
        '寅': '丑', '卯': '丑', '辰': '丑', '巳': '辰', '午': '辰', '未': '辰',
        '申': '未', '酉': '未', '戌': '未', '亥': '戌', '子': '戌', '丑': '戌'
    };
    if (guaSu[yearZhi] === dz) result.push('寡宿');

    // 天医
    const tianYi2 = {
        '子': '亥', '丑': '子', '寅': '丑', '卯': '寅', '辰': '卯', '巳': '辰',
        '午': '巳', '未': '午', '申': '未', '酉': '申', '戌': '酉', '亥': '戌'
    };
    if (tianYi2[eightChar.monthZhi] === dz) result.push('天医');

    // 丧门
    const sangMen = {
        '子': '午', '丑': '未', '寅': '申', '卯': '酉', '辰': '戌', '巳': '亥',
        '午': '子', '未': '丑', '申': '寅', '酉': '卯', '戌': '辰', '亥': '巳'
    };
    if (sangMen[yearZhi] === dz) result.push('丧门');

    // 吊客
    const diaoKe = {
        '子': '戌', '丑': '亥', '寅': '子', '卯': '丑', '辰': '寅', '巳': '卯',
        '午': '辰', '未': '巳', '申': '午', '酉': '未', '戌': '申', '亥': '酉'
    };
    if (diaoKe[yearZhi] === dz) result.push('吊客');

    // 阴差阳错 (特定日柱)
    const ycyc = ['丙子', '丙午', '丁丑', '丁未', '戊寅', '戊申', '辛卯', '辛酉', '壬辰', '壬戌', '癸巳', '癸亥'];
    if (ganZhi === eightChar.dayGan + eightChar.dayZhi && ycyc.includes(ganZhi)) {
        result.push('阴差阳错');
    }

    // 九丑日
    const jiuChou = ['壬子', '壬午', '戊午', '戊子', '己酉', '己卯', '乙卯', '乙酉', '辛卯', '辛酉'];
    if (ganZhi === eightChar.dayGan + eightChar.dayZhi && jiuChou.includes(ganZhi)) {
        result.push('九丑日');
    }

    // 童子煞 (简化版)
    const tongZi = {
        '寅': '卯', '卯': '卯', '辰': '卯',
        '巳': '午', '午': '午', '未': '午',
        '申': '酉', '酉': '酉', '戌': '酉',
        '亥': '子', '子': '子', '丑': '子'
    };
    // 月支与时支/日支关系
    if (tongZi[eightChar.monthZhi] === dz) result.push('童子煞');

    // 元辰
    const yuanChen = {
        '子': '未', '丑': '午', '寅': '巳', '卯': '辰', '辰': '卯', '巳': '寅',
        '午': '丑', '未': '子', '申': '亥', '酉': '戌', '戌': '酉', '亥': '申'
    };
    if (yuanChen[yearZhi] === dz) result.push('元辰');

    // 血刃
    const xueRen = {
        '子': '丑', '丑': '寅', '寅': '卯', '卯': '辰', '辰': '巳', '巳': '午',
        '午': '未', '未': '申', '申': '酉', '酉': '戌', '戌': '亥', '亥': '子'
    };
    if (xueRen[yearZhi] === dz) result.push('血刃');

    // 流霞
    const liuXia = {
        '甲': '酉', '乙': '戌', '丙': '未', '丁': '申', '戊': '巳',
        '己': '午', '庚': '卯', '辛': '辰', '壬': '丑', '癸': '寅'
    };
    if (liuXia[dayGan] === dz) result.push('流霞');

    // 勾绞煞
    const gouJiao = {
        '子': '丑', '丑': '寅', '寅': '卯', '卯': '辰', '辰': '巳', '巳': '午',
        '午': '未', '未': '申', '申': '酉', '酉': '戌', '戌': '亥', '亥': '子'
    };
    // 另一方向
    const gouJiao2 = {
        '子': '亥', '丑': '子', '寅': '丑', '卯': '寅', '辰': '卯', '巳': '辰',
        '午': '巳', '未': '午', '申': '未', '酉': '申', '戌': '酉', '亥': '戌'
    };
    if (gouJiao[yearZhi] === dz || gouJiao2[yearZhi] === dz) result.push('勾绞煞');

    // 红艳煞
    const hongYan = {
        '甲': '午', '乙': '午', '丙': '寅', '丁': '未', '戊': '辰',
        '己': '辰', '庚': '戌', '辛': '酉', '壬': '子', '癸': '申'
    };
    if (hongYan[dayGan] === dz) result.push('红艳煞');

    // 天罗地网
    if (dz === '戌' || dz === '亥') {
        const wx = getWuXing(dayGan);
        if (wx === '火' || wx === '木') result.push('天罗地网');
        else if (dz === '戌') result.push('天罗');
    }
    if (dz === '辰' || dz === '巳') {
        const wx = getWuXing(dayGan);
        if (wx === '水' || wx === '金') result.push('天罗地网');
    }

    // 月德合
    const yueDeHe = {
        '寅': '辛', '午': '辛', '戌': '辛', '申': '丁', '子': '丁', '辰': '丁',
        '亥': '己', '卯': '己', '未': '己', '巳': '乙', '酉': '乙', '丑': '乙'
    };
    if (yueDeHe[eightChar.monthZhi] === tg) result.push('月德合');

    // 天德合
    const tianDeHe = {
        '寅': '壬', '卯': '癸', '辰': '丁', '巳': '丙', '午': '己', '未': '戊',
        '申': '丁', '酉': '辛', '戌': '庚', '亥': '己', '子': '甲', '丑': '乙'
    };
    if (tianDeHe[eightChar.monthZhi] === tg) result.push('天德合');

    // 学堂
    const xueTang = { '木': '亥', '火': '寅', '土': '寅', '金': '巳', '水': '申' };
    if (xueTang[getWuXing(dayGan)] === dz) result.push('学堂');

    // 词馆
    const ciGuan = {
        '甲': '寅', '乙': '卯', '丙': '巳', '丁': '午', '戊': '巳',
        '己': '午', '庚': '申', '辛': '酉', '壬': '亥', '癸': '子'
    };
    // 词馆另一算法
    if (ciGuan[dayGan] === dz && getChangSheng(dayGan, dz) === '临官') result.push('词馆');

    // 披麻
    const piMa = {
        '子': '巳', '丑': '午', '寅': '未', '卯': '申', '辰': '酉', '巳': '戌',
        '午': '亥', '未': '子', '申': '丑', '酉': '寅', '戌': '卯', '亥': '辰'
    };
    if (piMa[yearZhi] === dz) result.push('披麻');

    return result;
}


// ========== 主计算函数 ==========
export function calculateBazi(year, month, day, hour, minute, sex) {
    const solar = Solar.fromYmdHms(year, month, day, hour, minute, 0);
    const lunar = solar.getLunar();
    const eightCharObj = lunar.getEightChar();

    // 四柱
    const yearGan = eightCharObj.getYear().substring(0, 1);
    const yearZhi = eightCharObj.getYear().substring(1, 2);
    const monthGan = eightCharObj.getMonth().substring(0, 1);
    const monthZhi = eightCharObj.getMonth().substring(1, 2);
    const dayGan = eightCharObj.getDay().substring(0, 1);
    const dayZhi = eightCharObj.getDay().substring(1, 2);
    const hourGan = eightCharObj.getTime().substring(0, 1);
    const hourZhi = eightCharObj.getTime().substring(1, 2);

    const ec = { dayGan, dayZhi, yearZhi, monthZhi };

    const pillars = [
        { label: '年柱', gan: yearGan, zhi: yearZhi, gz: yearGan + yearZhi },
        { label: '月柱', gan: monthGan, zhi: monthZhi, gz: monthGan + monthZhi },
        { label: '日柱', gan: dayGan, zhi: dayZhi, gz: dayGan + dayZhi },
        { label: '时柱', gan: hourGan, zhi: hourZhi, gz: hourGan + hourZhi },
    ];

    // 十神
    pillars.forEach(p => {
        p.mainStar = getZhuStar(dayGan, p.gan, sex);
        p.ganWuXing = getWuXing(p.gan);
        p.zhiWuXing = getWuXing(p.zhi);
    });

    // 藏干 + 藏干十神
    pillars.forEach(p => {
        const cg = CANG_GAN[p.zhi] || [];
        p.cangGan = cg.map(g => ({
            gan: g,
            wuXing: getWuXing(g),
            shiShen: SHI_SHEN_TABLE[dayGan]?.[g] || ''
        }));
    });

    // 星运（日干十二长生对各柱地支）/ 自坐
    pillars.forEach(p => {
        p.xingYun = getChangSheng(dayGan, p.zhi);
    });

    // 自坐：各柱天干对本柱地支的十二长生
    pillars.forEach(p => {
        p.ziZuo = getChangSheng(p.gan, p.zhi);
    });

    // 空亡（各柱）
    pillars.forEach(p => {
        p.kongWang = getPillarKongWang(p.gz);
    });

    // 纳音
    pillars.forEach(p => {
        p.naYin = getNaYin(p.gz);
    });

    // 四柱神煞
    pillars.forEach(p => {
        p.shenSha = getShenSha(ec, p.gz);
    });

    // ===== 大运 =====
    const daYunList = [];
    const yun = eightCharObj.getYun(sex === 1 ? 1 : 0);
    const startAge = yun.getStartYear();
    const daYunArr = yun.getDaYun();

    for (let i = 0; i < daYunArr.length; i++) {
        const dy = daYunArr[i];
        const ganZhi = dy.getGanZhi();

        // Get XiaoYun array from DaYun (not from LiuNian)
        let xiaoYunArr = [];
        try { xiaoYunArr = dy.getXiaoYun() || []; } catch (e) { /* ignore */ }

        const liuNianArr = dy.getLiuNian() || [];

        // Build LiuNian data with matched XiaoYun
        const liuNianData = liuNianArr.map((ln, lnIdx) => {
            const lnGz = ln.getGanZhi();
            const xy = xiaoYunArr[lnIdx] || null;
            let xiaoYunInfo = null;
            if (xy) {
                try {
                    const xyGz = xy.getGanZhi();
                    xiaoYunInfo = { gz: xyGz, gan: xyGz[0], zhi: xyGz[1] };
                } catch (e) { /* ignore */ }
            }
            return {
                year: ln.getYear(),
                age: ln.getAge(),
                gan: lnGz[0],
                zhi: lnGz[1],
                gz: lnGz,
                ganShiShen: SHI_SHEN_TABLE[dayGan]?.[lnGz[0]] || '',
                zhiShiShen: SHI_SHEN_TABLE[dayGan]?.[CANG_GAN[lnGz[1]]?.[0]] || '',
                shenSha: getShenSha(ec, lnGz),
                xiaoYun: xiaoYunInfo
            };
        });

        if (!ganZhi || ganZhi.length < 2) {
            // 小运期（出生到起运前）
            daYunList.push({
                index: i,
                startYear: dy.getStartYear(),
                endYear: dy.getEndYear(),
                startAge: dy.getStartAge(),
                endAge: dy.getEndAge(),
                gan: '',
                zhi: '',
                gz: '',
                isXiaoYun: true,
                shiShen: '',
                zhiShiShen: '',
                shenSha: [],
                liuNian: liuNianData
            });
            continue;
        }
        const gan = ganZhi[0], zhi = ganZhi[1];
        daYunList.push({
            index: i,
            startYear: dy.getStartYear(),
            endYear: dy.getEndYear(),
            startAge: dy.getStartAge(),
            endAge: dy.getEndAge(),
            gan,
            zhi,
            gz: ganZhi,
            isXiaoYun: false,
            shiShen: SHI_SHEN_TABLE[dayGan]?.[gan] || '',
            zhiShiShen: SHI_SHEN_TABLE[dayGan]?.[CANG_GAN[zhi]?.[0]] || '',
            shenSha: getShenSha(ec, ganZhi),
            liuNian: liuNianData
        });
    }

    // ===== 流月（当前选中流年的12个月）=====
    // 根据流年天干推算各月天干地支
    function getLiuYue(liuNianGan, liuNianYear) {
        const months = [];
        const jieQiNames = ['立春', '惊蛰', '清明', '立夏', '芒种', '小暑', '立秋', '白露', '寒露', '立冬', '大雪', '小寒'];
        const monthDzOrder = ['寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥', '子', '丑'];

        // 年干定月干起始 (甲己之年丙作首)
        const monthGanStart = { '甲': 2, '乙': 4, '丙': 6, '丁': 8, '戊': 0, '己': 2, '庚': 4, '辛': 6, '壬': 8, '癸': 0 };
        const startGanIdx = monthGanStart[liuNianGan];

        // 获取每个月的节气日期
        const jieQiTable = Lunar.fromYmd(liuNianYear, 6, 1).getJieQiTable();
        for (let i = 0; i < 12; i++) {
            const mGanIdx = (startGanIdx + i) % 10;
            const mGan = TIAN_GAN[mGanIdx];
            const mZhi = monthDzOrder[i];
            const gz = mGan + mZhi;

            // 节气日期 - 使用实际节气日期
            let jqYear;
            let jqMonth;
            let jqDay;
            const jqName = jieQiNames[i];
            const jqSolar = jieQiTable ? jieQiTable[jqName] : null;
            if (jqSolar) {
                jqYear = jqSolar.getYear();
                jqMonth = jqSolar.getMonth();
                jqDay = jqSolar.getDay();
            } else {
                // 回退到固定日期，避免节气表缺失导致崩溃
                jqMonth = i < 11 ? i + 2 : 1;
                jqDay = [4, 5, 5, 5, 5, 7, 7, 7, 8, 7, 7, 5][i];
                jqYear = i < 11 ? liuNianYear : liuNianYear + 1;
            }

            months.push({
                index: i,
                jieQi: jqName,
                jieQiDate: `${jqMonth}/${jqDay}`,
                jieQiYear: jqYear,
                jieQiMonth: jqMonth,
                jieQiDay: jqDay,
                gan: mGan,
                zhi: mZhi,
                gz,
                ganShiShen: SHI_SHEN_TABLE[dayGan]?.[mGan] || '',
                zhiShiShen: SHI_SHEN_TABLE[dayGan]?.[CANG_GAN[mZhi]?.[0]] || '',
                shenSha: getShenSha(ec, gz),
            });
        }
        return months;
    }

    // ===== 流日（给定年月的每一天的日柱）=====
    function getLiuRi(liuYueYear, liuYueMonth) {
        const days = [];
        const weekNames = ['日', '一', '二', '三', '四', '五', '六'];

        // 获取该月的天数
        const daysInMonth = new Date(liuYueYear, liuYueMonth, 0).getDate();

        for (let d = 1; d <= daysInMonth; d++) {
            try {
                const solarDay = Solar.fromYmd(liuYueYear, liuYueMonth, d);
                const lunarDay = solarDay.getLunar();
                const ecObj = lunarDay.getEightChar();
                const dayGz = ecObj.getDay();
                const dGan = dayGz[0];
                const dZhi = dayGz[1];
                const gz = dGan + dZhi;

                days.push({
                    index: d - 1,
                    day: d,
                    month: liuYueMonth,
                    year: liuYueYear,
                    weekDay: weekNames[solarDay.getWeek()],
                    gan: dGan,
                    zhi: dZhi,
                    gz,
                    ganShiShen: SHI_SHEN_TABLE[dayGan]?.[dGan] || '',
                    zhiShiShen: SHI_SHEN_TABLE[dayGan]?.[CANG_GAN[dZhi]?.[0]] || '',
                    shenSha: getShenSha(ec, gz),
                });
            } catch (e) {
                // skip invalid dates
            }
        }
        return days;
    }

    // ===== 流日（给定起止日期范围内的日柱）=====
    function getLiuRiRange(startY, startM, startD, endY, endM, endD) {
        const days = [];
        const weekNames = ['日', '一', '二', '三', '四', '五', '六'];
        const start = new Date(startY, startM - 1, startD);
        const end = new Date(endY, endM - 1, endD);

        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            const y = d.getFullYear();
            const m = d.getMonth() + 1;
            const day = d.getDate();
            try {
                const solarDay = Solar.fromYmd(y, m, day);
                const lunarDay = solarDay.getLunar();
                const ecObj = lunarDay.getEightChar();
                const dayGz = ecObj.getDay();
                const dGan = dayGz[0];
                const dZhi = dayGz[1];
                const gz = dGan + dZhi;

                days.push({
                    index: days.length,
                    day,
                    month: m,
                    year: y,
                    weekDay: weekNames[solarDay.getWeek()],
                    gan: dGan,
                    zhi: dZhi,
                    gz,
                    ganShiShen: SHI_SHEN_TABLE[dayGan]?.[dGan] || '',
                    zhiShiShen: SHI_SHEN_TABLE[dayGan]?.[CANG_GAN[dZhi]?.[0]] || '',
                    shenSha: getShenSha(ec, gz),
                });
            } catch (e) {
                // skip invalid dates
            }
        }
        return days;
    }

    // ===== 五行旺相 =====
    const wxStatus = WANG_XIANG_MAP[monthZhi] || {};

    // ===== 天干留意 / 地支留意 =====
    // 收集所有天干和地支（含流月流年小运 + 四柱）
    const allTianGan = pillars.map(p => p.gan);
    const allDiZhi = pillars.map(p => p.zhi);
    const tgInteractions = getTianGanInteractions(allTianGan);
    const dzInteractions = getDiZhiInteractions(allDiZhi);

    // 农历信息
    const lunarYear = lunar.getYearInChinese();
    const lunarMonth = lunar.getMonthInChinese();
    const lunarDay = lunar.getDayInChinese();
    const shengXiao = lunar.getYearShengXiao();
    const shiChen = lunar.getTimeZhi();

    // 起运信息
    const qiYunDesc = `出生后${yun.getStartYear()}年${yun.getStartMonth()}月${yun.getStartDay()}天${yun.getStartHour()}时起运`;
    const qiYunAge = startAge;

    // 交运信息
    const jiaoYunGan1 = TIAN_GAN[(TIAN_GAN.indexOf(yearGan) + 5) % 10];
    const jiaoYunGan2 = yearGan;

    return {
        // 基本信息
        solar: { year, month, day, hour, minute },
        lunar: {
            year: lunarYear,
            month: lunarMonth,
            day: lunarDay,
            shengXiao,
            shiChen,
        },
        sex,

        // 四柱
        pillars,
        dayGan,
        dayZhi,

        // 大运
        daYun: daYunList,
        qiYunDesc,
        qiYunAge,

        // 流月 / 流日生成函数
        getLiuYue,
        getLiuRi,
        getLiuRiRange,

        // 五行旺相
        wuXingStatus: wxStatus,

        // 天干地支留意
        tgInteractions,
        dzInteractions,

        // 获取完整天干地支交互（含额外柱）
        getFullInteractions(extraTg = [], extraDz = []) {
            const tg = [...allTianGan, ...extraTg];
            const dz = [...allDiZhi, ...extraDz];
            return {
                tg: getTianGanInteractions(tg),
                dz: getDiZhiInteractions(dz),
            };
        },

        // 十神简称映射
        shiShenShort(ss) {
            const map = {
                '比肩': '比', '劫财': '劫', '食神': '食', '伤官': '伤',
                '偏财': '才', '正财': '财', '七杀': '杀', '正官': '官',
                '偏印': '枭', '正印': '印', '元男': '', '元女': ''
            };
            return map[ss] ?? ss;
        }
    };
}

export { getWuXing, SHI_SHEN_TABLE, CANG_GAN, TIAN_GAN, DI_ZHI, getChangSheng, getNaYin, getPillarKongWang, getShenSha };
