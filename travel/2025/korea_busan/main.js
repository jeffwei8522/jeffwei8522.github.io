// 使用一個立即執行的非同步函式 (IIFE)，確保程式碼在頁面載入時自動執行
(async () => {
    // --- 區塊 1: Header/Footer 動態注入 (維持不變) ---
    const path = window.location.pathname;
    const isSubdirectory = path.includes('/days/') || path.includes('/hotels/') || path.includes('/notes/');
    const prefix = isSubdirectory ? '../' : './';
    try {
        let [headerTxt, footerTxt] = await Promise.all([
            fetch(`${prefix}components/header.html`).then(res => res.ok ? res.text() : Promise.reject(new Error(`無法載入 header.html`))),
            fetch(`${prefix}components/footer.html`).then(res => res.ok ? res.text() : Promise.reject(new Error(`無法載入 footer.html`)))
        ]);
        if (!isSubdirectory) {
            headerTxt = headerTxt.replace(/(href|src)="\.\.\//g, '$1="');
        }
        document.body.insertAdjacentHTML('afterbegin', headerTxt);
        document.body.insertAdjacentHTML('beforeend', footerTxt);
        const navLinks = document.querySelectorAll('nav a');
        navLinks.forEach(link => {
            if (new URL(link.href).pathname === window.location.pathname) {
                link.classList.add('active');
            }
        });
    } catch (error) {
        console.error('載入共用元件時發生錯誤:', error);
    }

    // --- 區塊 2: Hub 頁面驅動邏輯 (已重寫並修正) ---
    if (path.includes('attraction-hub.html') || path.includes('flight-hub.html')) {
        const titleEl = document.getElementById('hub-title');
        const briefEl = document.getElementById('hub-brief');
        const imageEl = document.getElementById('hub-image');
        const tableEl = document.getElementById('hub-table');
        const linkEl = document.getElementById('hub-external-link');

        try {
            const urlParams = new URLSearchParams(window.location.search);
            const itemId = urlParams.get('id');
            if (!itemId) throw new Error('網址中找不到項目 ID');

            const [places, flights, itineraryData] = await Promise.all([
                fetch(`${prefix}data/places.json`).then(res => res.json()),
                fetch(`${prefix}data/flights.json`).then(res => res.json()),
                fetch(`${prefix}data/itinerary.json`).then(res => res.json())
            ]);

            let itemData = null;
            let itemType = null;

            // 步驟 1: 精準查找資料，並確定類型
            itemData = flights.find(f => f.id === itemId);
            if (itemData) {
                itemType = 'flight';
            } else {
                itemData = places.find(p => p.id === itemId);
                if (itemData) {
                    itemType = 'place';
                }
            }
            if (!itemData) {
                 for (const day of itineraryData) {
                    const foundItem = day.items.find(i => i.id === itemId);
                    if (foundItem) {
                        itemData = { ...foundItem, name_zh: foundItem.title_zh, brief_zh: `一個安排在 ${foundItem.time} 的活動。` };
                        itemType = 'place';
                        break;
                    }
                }
            }
            if (!itemData) throw new Error(`在所有資料中都找不到 ID 為 "${itemId}" 的項目。`);

            // 步驟 2: 根據確定好的類型，執行不同的顯示邏輯
            if (itemType === 'flight') {
                titleEl.innerText = `${itemData.airline} (${itemData.flight_no})`;
                briefEl.innerText = `從 ${itemData.dep_airport} 前往 ${itemData.arr_airport} 的航班`;
                tableEl.style.display = 'table';
                tableEl.innerHTML = `
                    <tr><td>航空公司</td><td>${itemData.airline}</td></tr>
                    <tr><td>航班號</td><td>${itemData.flight_no}</td></tr>
                    <tr><td>日期</td><td>${itemData.date}</td></tr>
                    <tr><td>出發</td><td>${itemData.dep_time} (${itemData.dep_airport})</td></tr>
                    <tr><td>抵達</td><td>${itemData.arr_time} (${itemData.arr_airport})</td></tr>
                    <tr><td>登機門 (Gate)</td><td>(待更新)</td></tr>
                `;
                linkEl.style.display = 'inline-block';
                linkEl.href = `https://www.airport.co.kr/gimhae/main.do`;
                linkEl.innerHTML = `<i class="fa-solid fa-plane-departure"></i> 前往釜山機場官網`;
            } 
            else if (itemType === 'place') {
                titleEl.innerText = itemData.name_zh;
                briefEl.innerText = itemData.brief_zh;
                if (itemData.img) {
                    imageEl.src = `${prefix}photos/${itemData.img}`;
                    imageEl.alt = `圖片: ${itemData.img}`;
                    imageEl.style.display = 'block';
                }
                if (itemData.open_hours) {
                    tableEl.style.display = 'table';
                    tableEl.innerHTML = `<tr><td>開放時間</td><td>${itemData.open_hours}</td></tr>`;
                }
                linkEl.style.display = 'inline-block';
                const query = itemData.name_zh || itemData.title_zh;
                linkEl.href = `https://map.naver.com/p/search/${encodeURIComponent("부산 " + query)}`;
                linkEl.innerHTML = `<i class="fa-solid fa-map-location-dot"></i> 在 Naver Map 查看位置`;
            }

        } catch (error) {
            console.error("Hub 頁面載入錯誤:", error);
            titleEl.innerText = '資料載入失敗';
            briefEl.innerText = `錯誤訊息：${error.message}。請確認 /data/ 資料夾與 JSON 檔案都已正確建立。`;
        }
    }
})();