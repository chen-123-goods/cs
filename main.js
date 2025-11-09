// ===== 配置 =====
const productId = 'dUHf8I122S';
const deviceName = 'STM32_02';
const fixedToken = 'version=2018-10-31&res=products%2FdUHf8I122S%2Fdevices%2FSTM32_02&et=1762681540&method=md5&sign=ERw7vZoM8%2BiSjRjXB1i4qQ%3D%3D';
const apiUrl = 'https://iot-api.heclouds.com/datapoint/history-datapoints';

const fields = {
    T: { label: '温度', unit: '℃', color: '#ff9800', icon: '🔥' },
    H: { label: '湿度', unit: '%', color: '#00bcd4', icon: '💧' },
    L: { label: '光照', unit: 'lux', color: '#ffc107', icon: '☀️' },
    Rn: { label: '雨滴', unit: 'mm', color: '#3f51b5', icon: '🌧️' },
    HR: { label: '心率', unit: 'bpm', color: '#f44336', icon: '❤️' },
    BO: { label: '血氧', unit: '%', color: '#e91e63', icon: '🫁' },
    Ro: { label: '翻滚角', unit: '°', color: '#9c27b0', icon: '🌀' },
    Pi: { label: '俯仰角', unit: '°', color: '#673ab7', icon: '📐' },
    Rf: { label: 'RFID', unit: '', color: '#009688', icon: '🆔' }
};

function formatTime(t) {
    return new Date(t).toLocaleString('zh-CN', { hour12: false });
}

function render(data) {
    const grid = document.getElementById('cards');
    const update = document.getElementById('updateTime');
    grid.innerHTML = '';
    const ts = data.length ? data[0].at : '--';
    update.textContent = '更新时间：' + formatTime(ts);

    data.forEach(item => {
        const f = fields[item.id] || { label: item.id, unit: '', color: '#fff', icon: '📊' };
        const card = document.createElement('div');
        card.className = 'card';
        card.dataset.id = item.id;
        card.innerHTML = `
            <div class="icon">${f.icon}</div>
            <div class="label">${f.label}</div>
            <div class="value flip" style="color:${f.color}">${item.value}<span class="unit">${f.unit}</span></div>
            <div class="time">${formatTime(item.at)}</div>
        `;
        grid.appendChild(card);
        setTimeout(() => card.querySelector('.value').classList.remove('flip'), 600);
    });
}

async function fetchLatest() {
    try {
        const params = new URLSearchParams({
            product_id: productId,
            device_name: deviceName,
            datastream_id: Object.keys(fields).join(','),
            limit: 1,
            sort: 'DESC'
        });
        const res = await fetch(`${apiUrl}?${params}`, {
            method: 'GET',
            headers: { authorization: fixedToken }
        });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const json = await res.json();
        if (json.code !== 0) throw new Error(json.msg || '业务失败');
        const streams = json.data?.datastreams || [];
        const points = [];
        streams.forEach(s => {
            if (s.datapoints && s.datapoints.length) {
                points.push({ id: s.id, value: s.datapoints[0].value, at: s.datapoints[0].at });
            }
        });
        render(points);
    } catch (e) {
        console.error(e);
        document.getElementById('updateTime').textContent = '更新失败：' + e.message;
    }
}

// 首次 + 定时
fetchLatest();
setInterval(fetchLatest, 5000);