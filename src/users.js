/**
 * 用户管理模块 - 基于 localStorage
 */
const STORAGE_KEY = 'bazi_users';
const LAST_SELECTED_USER_KEY = 'bazi_last_selected_user_id';

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export function getUsers() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch {
        return [];
    }
}

export function saveUsers(users) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

export function addUser({ name, sex, year, month, day, hour, minute }) {
    const users = getUsers();
    const user = {
        id: generateId(),
        name,
        sex: Number(sex),
        year: Number(year),
        month: Number(month),
        day: Number(day),
        hour: Number(hour),
        minute: Number(minute),
        createdAt: new Date().toISOString(),
    };
    users.push(user);
    saveUsers(users);
    return user;
}

export function updateUser(id, data) {
    const users = getUsers();
    const idx = users.findIndex(u => u.id === id);
    if (idx === -1) return null;
    users[idx] = { ...users[idx], ...data };
    saveUsers(users);
    return users[idx];
}

export function deleteUser(id) {
    const users = getUsers().filter(u => u.id !== id);
    saveUsers(users);
    return users;
}

export function getUser(id) {
    return getUsers().find(u => u.id === id) || null;
}

export function getLastSelectedUserId() {
    return localStorage.getItem(LAST_SELECTED_USER_KEY);
}

export function setLastSelectedUserId(id) {
    if (id) {
        localStorage.setItem(LAST_SELECTED_USER_KEY, id);
    } else {
        localStorage.removeItem(LAST_SELECTED_USER_KEY);
    }
}

// 初始化默认案例（如果为空）
export function initDefaultCases() {
    const users = getUsers();
    if (users.length === 0) {
        addUser({ name: '案例7', sex: 1, year: 2000, month: 11, day: 23, hour: 13, minute: 52 });
    }
}
