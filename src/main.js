/**
 * 应用入口
 */
import './style.css';
import { calculateBazi } from './bazi.js';
import { getUsers, addUser, updateUser, deleteUser, initDefaultCases, getUser } from './users.js';
import { renderChart } from './render.js';

// 应用状态
const appState = {
    selectedUserId: null,
    baziData: null,
    selectedDaYun: 0,
    selectedLiuNian: 0,
    selectedLiuYue: null, // null = auto detect current month
    selectedLiuRi: null, // null = auto detect current day
    userName: '',
};

// DOM 元素
const chartContainer = document.getElementById('chart-container');
const btnSwitchUser = document.getElementById('btn-switch-user');
const currentUserName = document.getElementById('current-user-name');
const userDropdown = document.getElementById('user-dropdown');
const userList = document.getElementById('user-list');
const btnAdd = document.getElementById('btn-add-user');
const formOverlay = document.getElementById('user-form-overlay');
const form = document.getElementById('user-form');
const formTitle = document.getElementById('form-title');
const formId = document.getElementById('form-id');
const formName = document.getElementById('form-name');
const formDate = document.getElementById('form-date');
const formTime = document.getElementById('form-time');
const btnCancel = document.getElementById('btn-cancel');

// ========== 下拉面板控制 ==========
function toggleDropdown() {
    const isHidden = userDropdown.classList.contains('hidden');
    if (isHidden) {
        openDropdown();
    } else {
        closeDropdown();
    }
}

function openDropdown() {
    userDropdown.classList.remove('hidden');
    btnSwitchUser.classList.add('active');
}

function closeDropdown() {
    userDropdown.classList.add('hidden');
    btnSwitchUser.classList.remove('active');
}

// ========== 初始化 ==========
function init() {
    initDefaultCases();
    renderUserList();
    bindEvents();

    // 自动选择第一个用户
    const users = getUsers();
    if (users.length > 0) {
        selectUser(users[0].id);
    }
}

// ========== 用户列表渲染 ==========
function renderUserList() {
    const users = getUsers();
    userList.innerHTML = users.map(u => `
    <div class="user-item ${u.id === appState.selectedUserId ? 'selected' : ''}" data-id="${u.id}">
      <div class="user-item-main">
        <span class="user-icon">${u.sex === 1 ? '♂' : '♀'}</span>
        <div class="user-item-info">
          <div class="user-name">${u.name}</div>
          <div class="user-date">${u.year}-${String(u.month).padStart(2, '0')}-${String(u.day).padStart(2, '0')} ${String(u.hour).padStart(2, '0')}:${String(u.minute).padStart(2, '0')}</div>
        </div>
      </div>
      <div class="user-item-actions">
        <button class="btn-mini btn-edit" data-id="${u.id}" title="编辑">✎</button>
        <button class="btn-mini btn-delete" data-id="${u.id}" title="删除">✕</button>
      </div>
    </div>
  `).join('');
}

// ========== 更新顶栏用户名 ==========
function updateCurrentUserDisplay() {
    const user = getUser(appState.selectedUserId);
    if (user) {
        currentUserName.textContent = user.name;
    } else {
        currentUserName.textContent = '选择命例';
    }
}

// ========== 选择用户 ==========
function selectUser(userId) {
    appState.selectedUserId = userId;
    appState.selectedDaYun = 0;
    appState.selectedLiuNian = 0;
    appState.selectedLiuYue = null;
    appState.selectedLiuRi = null;

    const user = getUser(userId);
    if (!user) return;

    appState.userName = user.name;
    updateCurrentUserDisplay();

    try {
        appState.baziData = calculateBazi(user.year, user.month, user.day, user.hour, user.minute, user.sex);

        // 自动定位到当前年份所在大运
        const now = new Date();
        const currentYear = now.getFullYear();
        const daYun = appState.baziData.daYun;
        for (let i = 0; i < daYun.length; i++) {
            if (currentYear >= daYun[i].startYear && currentYear <= daYun[i].endYear) {
                appState.selectedDaYun = i;
                // 找到当前流年
                const ln = daYun[i].liuNian;
                for (let j = 0; j < ln.length; j++) {
                    if (ln[j].year === currentYear) {
                        appState.selectedLiuNian = j;
                        break;
                    }
                }
                break;
            }
        }

        renderBaziChart();
    } catch (e) {
        console.error('八字计算错误:', e);
        chartContainer.innerHTML = `<div class="placeholder"><p>计算错误: ${e.message}</p></div>`;
    }

    renderUserList();
    closeDropdown();
}

// ========== 渲染八字图表 ==========
function renderBaziChart() {
    if (!appState.baziData) return;
    renderChart(chartContainer, appState.baziData, appState);
    bindChartEvents();
}

// ========== 图表事件绑定 ==========
function bindChartEvents() {
    // 大运点击
    chartContainer.querySelectorAll('.dayun-card').forEach(card => {
        card.addEventListener('click', () => {
            appState.selectedDaYun = parseInt(card.dataset.dayun);
            appState.selectedLiuNian = 0;
            appState.selectedLiuYue = null;
            appState.selectedLiuRi = null;
            renderBaziChart();
        });
    });

    // 流年点击
    chartContainer.querySelectorAll('.liunian-card').forEach(card => {
        card.addEventListener('click', () => {
            appState.selectedLiuNian = parseInt(card.dataset.liunian);
            appState.selectedLiuYue = null;
            appState.selectedLiuRi = null;
            renderBaziChart();
        });
    });

    // 流月点击
    chartContainer.querySelectorAll('.liuyue-card').forEach(card => {
        card.addEventListener('click', () => {
            appState.selectedLiuYue = parseInt(card.dataset.liuyue);
            appState.selectedLiuRi = null;
            renderBaziChart();
        });
    });

    // 流日点击
    chartContainer.querySelectorAll('.liuri-card').forEach(card => {
        card.addEventListener('click', () => {
            appState.selectedLiuRi = parseInt(card.dataset.liuri);
            renderBaziChart();
        });
    });
}

// ========== 事件绑定 ==========
function bindEvents() {
    // 切换用户下拉面板
    btnSwitchUser.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleDropdown();
    });

    // 点击外部关闭下拉面板
    document.addEventListener('click', (e) => {
        if (!userDropdown.contains(e.target) && !btnSwitchUser.contains(e.target)) {
            closeDropdown();
        }
    });

    // 新增用户
    btnAdd.addEventListener('click', () => {
        formId.value = '';
        formName.value = '';
        formDate.value = '';
        formTime.value = '';
        form.querySelector('input[name="sex"][value="1"]').checked = true;
        formTitle.textContent = '新增命例';
        formOverlay.classList.remove('hidden');
        closeDropdown();
    });

    // 取消
    btnCancel.addEventListener('click', () => {
        formOverlay.classList.add('hidden');
    });

    // 表单提交
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = formName.value.trim();
        const sex = parseInt(form.querySelector('input[name="sex"]:checked').value);
        const [year, month, day] = formDate.value.split('-').map(Number);
        const [hour, minute] = formTime.value.split(':').map(Number);

        if (formId.value) {
            updateUser(formId.value, { name, sex, year, month, day, hour, minute });
            selectUser(formId.value);
        } else {
            const user = addUser({ name, sex, year, month, day, hour, minute });
            selectUser(user.id);
        }

        formOverlay.classList.add('hidden');
        renderUserList();
    });

    // 用户列表事件委托
    userList.addEventListener('click', (e) => {
        const editBtn = e.target.closest('.btn-edit');
        const deleteBtn = e.target.closest('.btn-delete');
        const userItem = e.target.closest('.user-item');

        if (editBtn) {
            e.stopPropagation();
            const user = getUser(editBtn.dataset.id);
            if (!user) return;
            formId.value = user.id;
            formName.value = user.name;
            formDate.value = `${user.year}-${String(user.month).padStart(2, '0')}-${String(user.day).padStart(2, '0')}`;
            formTime.value = `${String(user.hour).padStart(2, '0')}:${String(user.minute).padStart(2, '0')}`;
            form.querySelector(`input[name="sex"][value="${user.sex}"]`).checked = true;
            formTitle.textContent = '编辑命例';
            formOverlay.classList.remove('hidden');
            closeDropdown();
        } else if (deleteBtn) {
            e.stopPropagation();
            if (confirm('确定删除该命例吗？')) {
                deleteUser(deleteBtn.dataset.id);
                renderUserList();
                if (appState.selectedUserId === deleteBtn.dataset.id) {
                    const users = getUsers();
                    if (users.length > 0) {
                        selectUser(users[0].id);
                    } else {
                        appState.selectedUserId = null;
                        updateCurrentUserDisplay();
                        chartContainer.innerHTML = `<div class="placeholder"><div class="placeholder-icon">☰</div><p>请点击右上角切换用户</p></div>`;
                    }
                }
            }
        } else if (userItem) {
            selectUser(userItem.dataset.id);
        }
    });

    // 点击遮罩关闭表单
    formOverlay.addEventListener('click', (e) => {
        if (e.target === formOverlay) formOverlay.classList.add('hidden');
    });
}

// ========== 启动 ==========
init();
