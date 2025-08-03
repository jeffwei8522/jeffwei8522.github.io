// 使用一個立即執行的非同步函式 (IIFE)
(async () => {
    // --- 區塊 1: 通用設定與 Header/Footer 注入 ---
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
    } catch (error) { console.error('載入共用元件時發生錯誤:', error); }

    // --- 區塊 2: 每日行程頁 (dayX.html) 時間軸動態生成 ---
    const dayMatch = path.match(/day(\d+)\.html$/);
    if (dayMatch) {
        const dayNumber = parseInt(dayMatch[1], 10);
        const timelineContainer = document.querySelector('.timeline-container');
        if (timelineContainer) {
            try {
                const [itineraryData, places, hotels, flights] = await Promise.all([
                    fetch(`${prefix}data/itinerary.json`).then(res => res.json()),
                    fetch(`${prefix}data/places.json`).then(res => res.json()),
                    fetch(`${prefix}data/hotels.json`).then(res => res.json()),
                    fetch(`${prefix}data/flights.json`).then(res => res.json())
                ]);
                const allData = [...places, ...hotels, ...flights];
                const dayData = itineraryData.find(d => d.day === dayNumber);
                if (!dayData) throw new Error(`在 itinerary.json 中找不到 Day ${dayNumber} 的資料`);
                let timelineHTML = '';
                for (const item of dayData.items) {
                    const itemDetails = allData.find(p => p.id === (item.ref_id || item.id));
                    let link = `${prefix}notes/attraction-hub.html?id=${item.ref_id || item.id}`;
                    let title = item.title_zh || (itemDetails ? itemDetails.name_zh : '未知項目');
                    let subtitle = item.title_en || '點此查看詳情';
                    if (item.type === 'hotel' && itemDetails) {
                        link = `${prefix}hotels/${itemDetails.id}.html`;
                        title = item.title_zh || itemDetails.name_zh;
                        subtitle = "點此查看住宿詳情";
                    } else if (item.type === 'flight' && itemDetails) {
                         link = `${prefix}notes/flight-hub.html?id=${item.ref_id || item.id}`;
                         title = `${itemDetails.airline} (${itemDetails.flight_no})`;
                         subtitle = "點此查看航班資訊";
                    }
                    let imageHTML = '';
                    if (itemDetails && itemDetails.img) {
                        imageHTML = `<img src="${prefix}photos/${itemDetails.img}" alt="${itemDetails.name_zh}">`;
                    }
                    const iconMap = { flight: 'fa-plane', hotel: 'fa-bed', food: 'fa-utensils', place: 'fa-map-location-dot' };
                    const icon = iconMap[item.type] || 'fa-map-marker-alt';
                    
                    let bookingIndicator = ''; // 預設為空
                    if (itemDetails && itemDetails.booking_url && itemDetails.booking_url !== "") {
                        // 如果這個景點有 booking_url 且不是空的
                        bookingIndicator = ' <i class="fa-solid fa-circle-check" style="color: #28a745; font-size: 0.9rem;"></i>';
                    }

                    timelineHTML += `<a href="${link}" class="timeline-link"><div class="timeline-item"><div class="timeline-time">${item.time}</div><div class="timeline-connector"><div class="timeline-dot"></div></div><div class="timeline-content">${imageHTML}<h3><i class="fa-solid ${icon}"></i> ${title}${bookingIndicator}</h3><p>${subtitle}</p></div></div></a>`;
                }
                timelineContainer.innerHTML = timelineHTML;
            } catch (error) {
                console.error(`生成 Day ${dayNumber} 時間軸時出錯:`, error);
                timelineContainer.innerHTML = `<p style="color:red; text-align:center;">${error.message}</p>`;
            }
        }
    }

    // --- 區塊 3: Hub 頁面驅動邏輯 ---
    if (path.includes('attraction-hub.html') || path.includes('flight-hub.html')) {
        const titleEl = document.getElementById('hub-title'), briefEl = document.getElementById('hub-brief'), imageEl = document.getElementById('hub-image'),
              tableEl = document.getElementById('hub-table'), linkEl = document.getElementById('hub-external-link');
        try {
            const urlParams = new URLSearchParams(window.location.search);
            const itemId = urlParams.get('id');
            if (!itemId) throw new Error('網址中找不到項目 ID');
            const [places, flights, itineraryData] = await Promise.all([
                fetch(`${prefix}data/places.json`).then(res => res.json()),
                fetch(`${prefix}data/flights.json`).then(res => res.json()),
                fetch(`${prefix}data/itinerary.json`).then(res => res.json())
            ]);
            let itemData = null, itemType = null;
            itemData = flights.find(f => f.id === itemId);
            if (itemData) { itemType = 'flight'; }
            else { itemData = places.find(p => p.id === itemId); if (itemData) itemType = 'place'; }
            if (!itemData) {
                 for (const day of itineraryData) {
                    const foundItem = day.items.find(i => i.id === itemId);
                    if (foundItem) {
                        itemData = { ...foundItem, name_zh: foundItem.title_zh, brief_zh: `一個安排在 ${foundItem.time} 的活動。` };
                        itemType = 'place'; break;
                    }
                }
            }
            if (!itemData) throw new Error(`在所有資料中都找不到 ID 為 "${itemId}" 的項目。`);
            if (itemType === 'flight') {
                titleEl.innerText = `${itemData.airline} (${itemData.flight_no})`;
                briefEl.innerText = `從 ${itemData.dep_airport} 前往 ${itemData.arr_airport} 的航班`;
                tableEl.style.display = 'table';
                tableEl.innerHTML = `<thead><tr><th>項目</th><th>內容</th></tr></thead><tbody><tr><td>航空公司</td><td>${itemData.airline}</td></tr><tr><td>航班號</td><td>${itemData.flight_no}</td></tr><tr><td>日期</td><td>${itemData.date}</td></tr><tr><td>出發</td><td>${itemData.dep_time} (${itemData.dep_airport})</td></tr><tr><td>抵達</td><td>${itemData.arr_time} (${itemData.arr_airport})</td></tr><tr><td>登機門 (Gate)</td><td>(待更新)</td></tr></tbody>`;
                linkEl.style.display = 'inline-block';
                linkEl.href = `https://www.airport.co.kr/gimhae/main.do`;
                linkEl.innerHTML = `<i class="fa-solid fa-plane-departure"></i> 前往釜山機場官網`;
            } else if (itemType === 'place') {
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
                if (itemData.hasOwnProperty('booking_url')) { // 檢查這個景點是否有預訂需求
                const bookingBtn = document.createElement('a');
                bookingBtn.target = '_blank';
                bookingBtn.className = 'btn';
                bookingBtn.style.marginLeft = '1rem';

                if (itemData.booking_url && itemData.booking_url !== "") {
                    // --- 已預訂 ---
                    bookingBtn.href = itemData.booking_url;
                    bookingBtn.style.backgroundColor = '#28a745'; // 成功的綠色
                    bookingBtn.innerHTML = `<i class="fa-solid fa-check"></i> 查看預訂憑證`;
                } else {
                    // --- 未預訂 ---
                    bookingBtn.href = '#'; // 沒有連結
                    bookingBtn.classList.add('disabled'); // 使用您 style.css 裡寫好的 disabled 樣式
                    bookingBtn.innerHTML = `<i class="fa-solid fa-ticket"></i> 尚未預訂`;
                    bookingBtn.onclick = (e) => e.preventDefault(); // 防止點擊跳轉
                }
                
                linkEl.parentNode.insertBefore(bookingBtn, linkEl.nextSibling);
            }
            }
        } catch (error) {
            console.error("Hub 頁面載入錯誤:", error);
            titleEl.innerText = '資料載入失敗';
            briefEl.innerText = `錯誤訊息：${error.message}。請確認 /data/ 資料夾與 JSON 檔案都已正確建立。`;
        }
    }

    // --- 區塊 4: (升級) 景點總表頁，支援雙模式切換 ---
    if (path.includes('destinations.html')) {
        // ✨ (此處已移除重複的 const path 宣告) ✨
        const contentArea = document.getElementById('dest-content-area');
        const viewAllBtn = document.getElementById('view-all-btn');
        const viewCategorizedBtn = document.getElementById('view-categorized-btn');
        
        if (contentArea && viewAllBtn && viewCategorizedBtn) {
            try {
                const places = await fetch(`${prefix}data/places.json`).then(res => res.json());

                const renderAllAsGrid = () => {
                    let cardsHTML = '<div class="dest-grid">';
                    for (const place of places) {
                        cardsHTML += `
                            <a href="${prefix}notes/attraction-hub.html?id=${place.id}" class="dest-card" id="${place.id}">
                                <img src="${prefix}photos/${place.img}" alt="${place.name_zh}">
                                <h4>${place.name_zh}</h4>
                                <p>${place.brief_zh}</p>
                            </a>
                        `;
                    }
                    cardsHTML += '</div>';
                    contentArea.innerHTML = cardsHTML;
                    viewAllBtn.classList.add('active');
                    viewCategorizedBtn.classList.remove('active');
                };

                const renderCategorized = () => {
                    const areaTranslations = { "Seomyeon": "西面區", "Haeundae": "海雲台區", "Saha": "沙下區", "Seo": "西區", "Gijang": "機張郡", "Nam": "南區", "Yeongdo": "影島區", "Nampo": "南浦區", "Suyeong": "水營區", "Uncategorized": "未分類" };
                    const groupedByArea = places.reduce((acc, place) => {
                        const area = place.area || "Uncategorized";
                        if (!acc[area]) acc[area] = [];
                        acc[area].push(place);
                        return acc;
                    }, {});
                    let finalHTML = '';
                    for (const area in groupedByArea) {
                        const chineseArea = areaTranslations[area] || area;
                        finalHTML += `<h3 class="hotel-area-title">${chineseArea} (${area})</h3>`;
                        finalHTML += '<div class="dest-grid">';
                        for (const place of groupedByArea[area]) {
                            finalHTML += `
                                <a href="${prefix}notes/attraction-hub.html?id=${place.id}" class="dest-card" id="${place.id}">
                                    <img src="${prefix}photos/${place.img}" alt="${place.name_zh}">
                                    <h4>${place.name_zh}</h4>
                                    <p>${place.brief_zh}</p>
                                </a>
                            `;
                        }
                        finalHTML += '</div>';
                    }
                    contentArea.innerHTML = finalHTML;
                    viewAllBtn.classList.remove('active');
                    viewCategorizedBtn.classList.add('active');
                };

                viewAllBtn.addEventListener('click', renderAllAsGrid);
                viewCategorizedBtn.addEventListener('click', renderCategorized);
                renderAllAsGrid();

            } catch (error) {
                console.error('生成景點總表時出錯:', error);
                contentArea.innerHTML = `<p style="color:red; text-align:center;">${error.message}</p>`;
            }
        }
    }
})();