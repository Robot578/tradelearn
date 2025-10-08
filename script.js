// Основные переменные
let chart;
let candleSeries;
let volumeSeries;
let currentData = [];
let balance = 100.00;
let portfolio = {
    'BTC': 0,
    'ETH': 0, 
    'SOL': 0,
    'ADA': 0,
    'DOT': 0
};
let tradeHistory = [];
let currentAsset = 'BTCUSDT';
let currentTimeframe = '1m';

// Настройки
let leverage = 1;
let tradingFees = 0.1;

let indicators = {
    sma: true,
    ema: false,
    rsi: false,
    volume: true,
    macd: false,
    bollinger: false
};

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Основная функция инициализации
function initializeApp() {
    initializeChart();
    setupEventListeners();
    loadInitialData();
    updateUI();
    initializeTeacher();
}

// Инициализация графика
function initializeChart() {
    const chartContainer = document.getElementById('candleChart');
    
    // Создаем график с темной темой
    chart = LightweightCharts.createChart(chartContainer, {
        width: chartContainer.clientWidth,
        height: chartContainer.clientHeight,
        layout: {
            background: { color: '#121212' },
            textColor: '#D9D9D9',
        },
        grid: {
            vertLines: { color: '#2B2B2B' },
            horzLines: { color: '#2B2B2B' },
        },
        crosshair: {
            mode: LightweightCharts.CrosshairMode.Normal,
        },
        rightPriceScale: {
            borderColor: '#2B2B2B',
        },
        timeScale: {
            borderColor: '#2B2B2B',
            timeVisible: true,
            secondsVisible: false,
        },
        handleScroll: {
            mouseWheel: true,
            pressedMouseMove: true,
            horzTouchDrag: true,
            vertTouchDrag: true,
        },
        handleScale: {
            axisPressedMouseMove: true,
            mouseWheel: true,
            pinch: true,
        },
    });

    // Основная серия свечей
    candleSeries = chart.addCandlestickSeries({
        upColor: '#26a69a',
        downColor: '#ef5350',
        borderVisible: false,
        wickUpColor: '#26a69a',
        wickDownColor: '#ef5350',
    });

    // Серия для объема
    volumeSeries = chart.addHistogramSeries({
        color: '#26a69a',
        priceFormat: {
            type: 'volume',
        },
        priceScaleId: 'volume',
        scaleMargins: {
            top: 0.8,
            bottom: 0,
        },
    });
}

// Настройка обработчиков событий
function setupEventListeners() {
    // Переключение сайдбара
    document.getElementById('sidebarToggle').addEventListener('click', toggleSidebar);
    
    // Навигация
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const section = this.getAttribute('data-section');
            showSection(section);
        });
    });

    // Выбор актива
    document.getElementById('assetSelect').addEventListener('change', function() {
        currentAsset = this.value;
        loadChartData();
    });

    // Таймфреймы
    document.querySelectorAll('.timeframe-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.timeframe-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentTimeframe = this.getAttribute('data-timeframe');
            loadChartData();
        });
    });

    // Индикаторы
    document.getElementById('showSMA').addEventListener('change', function() {
        indicators.sma = this.checked;
        updateIndicators();
    });
    
    document.getElementById('showEMA').addEventListener('change', function() {
        indicators.ema = this.checked;
        updateIndicators();
    });
    
    document.getElementById('showRSI').addEventListener('change', function() {
        indicators.rsi = this.checked;
        updateIndicators();
    });
    
    document.getElementById('showVolume').addEventListener('change', function() {
        indicators.volume = this.checked;
        updateIndicators();
    });
    
    document.getElementById('showMACD').addEventListener('change', function() {
        indicators.macd = this.checked;
        updateIndicators();
    });
    
    document.getElementById('showBollinger').addEventListener('change', function() {
        indicators.bollinger = this.checked;
        updateIndicators();
    });

    // Торговля
    document.getElementById('buyBtn').addEventListener('click', () => executeTrade('buy'));
    document.getElementById('sellBtn').addEventListener('click', () => executeTrade('sell'));
    document.getElementById('leverageSlider').addEventListener('input', function() {
        leverage = parseInt(this.value);
        document.getElementById('leverageValue').textContent = `${leverage}x`;
        updateTradingInfo();
    });

    // Риск менеджмент
    document.getElementById('calculateRisk').addEventListener('click', calculateRiskManagement);

    // Учитель
    document.getElementById('askQuestion').addEventListener('click', askTeacherQuestion);
    document.querySelectorAll('.teacher-action-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const action = this.getAttribute('data-action');
            handleTeacherAction(action);
        });
    });

    // Данные
    document.getElementById('exportBtn').addEventListener('click', exportData);
    document.getElementById('importBtn').addEventListener('click', () => document.getElementById('importFile').click());
    document.getElementById('importFile').addEventListener('change', importData);
    document.getElementById('resetBtn').addEventListener('click', resetData);

    // Закрытие секций
    document.querySelectorAll('.close-section').forEach(btn => {
        btn.addEventListener('click', function() {
            this.closest('.content-section').style.display = 'none';
        });
    });
}

// Загрузка начальных данных
async function loadInitialData() {
    showLoading();
    await loadChartData();
    hideLoading();
    updateUI();
}

// Загрузка данных для графика
async function loadChartData() {
    try {
        showLoading();
        
        // Генерируем тестовые данные
        generateTestData();
        
    } catch (error) {
        console.error('Error loading chart data:', error);
        generateTestData();
    } finally {
        hideLoading();
    }
}

// Генерация тестовых данных
function generateTestData() {
    const testData = [];
    let basePrice = 50000;
    let currentTime = Math.floor(Date.now() / 1000) - 100 * 60;
    
    for (let i = 0; i < 100; i++) {
        const volatility = 0.02;
        const changePercent = 2 * volatility * Math.random() - volatility;
        const changeAmount = basePrice * changePercent;
        const open = basePrice;
        const close = basePrice + changeAmount;
        const high = Math.max(open, close) + Math.random() * basePrice * 0.01;
        const low = Math.min(open, close) - Math.random() * basePrice * 0.01;
        const volume = 100 + Math.random() * 900;
        
        testData.push({
            time: currentTime + i * 60,
            open: open,
            high: high,
            low: low,
            close: close,
            volume: volume
        });
        
        basePrice = close;
    }
    
    currentData = testData;
    candleSeries.setData(testData);
    updateIndicators();
    
    if (testData.length > 0) {
        updateCurrentPrice(testData[testData.length - 1].close);
        document.getElementById('tradePrice').value = testData[testData.length - 1].close.toFixed(2);
    }
}

// Обновление индикаторов
function updateIndicators() {
    if (currentData.length === 0) return;

    // Объем
    if (indicators.volume) {
        const volumeData = currentData.map(d => ({
            time: d.time,
            value: d.volume,
            color: d.close >= d.open ? 'rgba(38, 166, 154, 0.5)' : 'rgba(239, 83, 80, 0.5)'
        }));
        volumeSeries.setData(volumeData);
    } else {
        volumeSeries.setData([]);
    }
}

// Обновление текущей цены
function updateCurrentPrice(price) {
    const priceElement = document.querySelector('.asset-price');
    const changeElement = document.querySelector('.price-change');
    
    priceElement.textContent = `$${price.toFixed(2)}`;
    changeElement.textContent = '+0.42%'; // Статичное значение для демо
    
    // Анимация обновления
    priceElement.classList.add('price-update');
    setTimeout(() => {
        priceElement.classList.remove('price-update');
    }, 1000);
}

// Исполнение сделки
function executeTrade(type) {
    const amountInput = document.getElementById('tradeAmount');
    const amount = parseFloat(amountInput.value);
    
    if (!amount || amount <= 0) {
        showNotification('Введите корректную сумму', 'error');
        return;
    }
    
    if (type === 'buy' && amount > balance) {
        showNotification('Недостаточно средств', 'error');
        return;
    }
    
    const currentPrice = getCurrentPrice();
    const totalCost = amount * currentPrice;
    const fee = totalCost * (tradingFees / 100);
    
    if (type === 'buy') {
        // Покупка
        balance -= totalCost + fee;
        const asset = currentAsset.replace('USDT', '');
        portfolio[asset] = (portfolio[asset] || 0) + amount;
        
        tradeHistory.push({
            type: 'BUY',
            asset: currentAsset,
            amount: amount,
            price: currentPrice,
            total: totalCost,
            fee: fee,
            timestamp: new Date().toLocaleString()
        });
        
        showNotification(`Куплено ${amount} ${asset} за $${totalCost.toFixed(2)}`, 'success');
        
    } else {
        // Продажа
        const asset = currentAsset.replace('USDT', '');
        if (!portfolio[asset] || portfolio[asset] < amount) {
            showNotification('Недостаточно активов для продажи', 'error');
            return;
        }
        
        portfolio[asset] -= amount;
        balance += totalCost - fee;
        
        tradeHistory.push({
            type: 'SELL',
            asset: currentAsset,
            amount: amount,
            price: currentPrice,
            total: totalCost,
            fee: fee,
            timestamp: new Date().toLocaleString()
        });
        
        showNotification(`Продано ${amount} ${asset} за $${totalCost.toFixed(2)}`, 'success');
    }
    
    updateUI();
}

// Получение текущей цены
function getCurrentPrice() {
    if (currentData.length > 0) {
        return currentData[currentData.length - 1].close;
    }
    return 50000;
}

// Расчет рисков
function calculateRiskManagement() {
    const riskAmount = parseFloat(document.getElementById('riskAmount').value) || 0;
    const stopLoss = parseFloat(document.getElementById('stopLoss').value) || 0;
    const takeProfit = parseFloat(document.getElementById('takeProfit').value) || 0;
    
    if (!riskAmount || !stopLoss || !takeProfit) {
        showNotification('Заполните все поля рисков', 'warning');
        return;
    }
    
    const currentPrice = getCurrentPrice();
    const riskPerShare = Math.abs(currentPrice - stopLoss);
    const rewardPerShare = Math.abs(takeProfit - currentPrice);
    
    const positionSize = riskAmount / riskPerShare;
    const potentialLoss = positionSize * riskPerShare;
    const potentialProfit = positionSize * rewardPerShare;
    const riskRewardRatio = rewardPerShare / riskPerShare;
    
    // Обновляем UI
    document.getElementById('positionSize').textContent = positionSize.toFixed(4);
    document.getElementById('potentialLoss').textContent = `$${potentialLoss.toFixed(2)}`;
    document.getElementById('potentialProfit').textContent = `$${potentialProfit.toFixed(2)}`;
    document.getElementById('riskRewardRatio').textContent = riskRewardRatio.toFixed(2);
}

// Обновление UI
function updateUI() {
    updateBalanceDisplay();
    updatePortfolioDisplay();
    updateTradeHistory();
    updateTradingInfo();
    updateStatsDisplay();
}

// Обновление отображения баланса
function updateBalanceDisplay() {
    document.querySelector('.balance-amount').textContent = `$${balance.toFixed(2)}`;
}

// Обновление отображения портфеля
function updatePortfolioDisplay() {
    const portfolioGrid = document.querySelector('.portfolio-grid');
    if (!portfolioGrid) return;
    
    let totalValue = balance;
    let portfolioHTML = '';
    
    Object.keys(portfolio).forEach(asset => {
        if (portfolio[asset] > 0) {
            const assetValue = portfolio[asset] * getCurrentPrice();
            totalValue += assetValue;
            portfolioHTML += `
                <div class="portfolio-item">
                    <span>${asset}</span>
                    <span>${portfolio[asset].toFixed(4)} ($${assetValue.toFixed(2)})</span>
                </div>
            `;
        }
    });
    
    portfolioHTML += `
        <div class="portfolio-item total">
            <span>Общий баланс</span>
            <span>$${totalValue.toFixed(2)}</span>
        </div>
    `;
    
    portfolioGrid.innerHTML = portfolioHTML;
}

// Обновление истории торгов
function updateTradeHistory() {
    const historyList = document.querySelector('.history-list');
    if (!historyList) return;
    
    if (tradeHistory.length === 0) {
        historyList.innerHTML = '<div class="empty-history">История торгов пуста</div>';
        return;
    }
    
    let historyHTML = '';
    tradeHistory.slice(-10).reverse().forEach(trade => {
        const isProfit = trade.type === 'SELL';
        historyHTML += `
            <div class="history-item ${isProfit ? '' : 'loss'}">
                <div class="history-info">
                    <span class="history-type">${trade.type} ${trade.asset}</span>
                    <span class="history-details">
                        ${trade.amount} по $${trade.price.toFixed(2)} | ${trade.timestamp}
                    </span>
                </div>
                <div class="history-amount ${isProfit ? 'profit' : 'loss'}">
                    ${trade.type === 'BUY' ? '-' : '+'}$${trade.total.toFixed(2)}
                </div>
            </div>
        `;
    });
    
    historyList.innerHTML = historyHTML;
}

// Обновление информации о торговле
function updateTradingInfo() {
    document.getElementById('leverageValue').textContent = `${leverage}x`;
}

// Обновление статистики
function updateStatsDisplay() {
    const totalTrades = tradeHistory.length;
    const profitableTrades = tradeHistory.filter(t => t.type === 'SELL').length;
    const winRate = totalTrades > 0 ? (profitableTrades / totalTrades * 100).toFixed(1) : 0;
    
    document.getElementById('totalTrades').textContent = totalTrades;
    document.getElementById('winRate').textContent = `${winRate}%`;
    
    // Упрощенный расчет прибыли
    const totalProfit = tradeHistory.reduce((sum, trade) => {
        return trade.type === 'SELL' ? sum + trade.total : sum - trade.total;
    }, 0);
    
    document.getElementById('totalProfit').textContent = `$${totalProfit.toFixed(2)}`;
}

// Учитель и AI помощник
function initializeTeacher() {
    const dictionary = {
        'Лонг (Long)': 'Позиция на покупку, прибыль при росте цены',
        'Шорт (Short)': 'Позиция на продажу, прибыль при падении цены',
        'Спред (Spread)': 'Разница между ценой покупки и продажи',
        'Стоп-лосс (Stop-Loss)': 'Ордер для ограничения убытков',
        'Тейк-профит (Take-Profit)': 'Ордер для фиксации прибыли',
        'Плечо (Leverage)': 'Кредитное плечо для увеличения объема позиции',
        'Бычий рынок': 'Рост цен, оптимизм',
        'Медвежий рынок': 'Падение цен, пессимизм'
    };
    
    // Заполняем словарь терминов
    const dictionaryGrid = document.querySelector('.dictionary-grid');
    if (dictionaryGrid) {
        let dictionaryHTML = '';
        Object.keys(dictionary).forEach(term => {
            dictionaryHTML += `
                <div class="dictionary-term">
                    <span class="term-name">${term}</span>
                    <span class="term-desc">${dictionary[term]}</span>
                </div>
            `;
        });
        dictionaryGrid.innerHTML = dictionaryHTML;
        
        // Добавляем обработчики для терминов
        document.querySelectorAll('.dictionary-term').forEach(term => {
            term.addEventListener('click', function() {
                const termName = this.querySelector('.term-name').textContent;
                showTermDefinition(termName, dictionary[termName]);
            });
        });
    }
}

// Показать определение термина
function showTermDefinition(term, definition) {
    document.getElementById('termTitle').textContent = term;
    document.getElementById('termDescription').textContent = definition;
    
    // Показываем секцию с определением
    const termDetails = document.querySelector('.term-details');
    termDetails.style.display = 'block';
}

// Обработка вопроса учителю
function askTeacherQuestion() {
    const questionInput = document.getElementById('teacherQuestion');
    const question = questionInput.value.toLowerCase().trim();
    
    if (!question) {
        showNotification('Введите ваш вопрос', 'warning');
        return;
    }
    
    let answer = "Хороший вопрос! Рекомендую изучить основы трейдинга. Вы можете спросить о: трейдинге, стоп-лоссе, тейк-профите, индикаторах или управлении рисками.";
    
    // Простые ответы на базовые вопросы
    if (question.includes('что такое трейдинг')) {
        answer = 'Трейдинг - это торговля финансовыми инструментами с целью получения прибыли от изменения их цены.';
    } else if (question.includes('стоп лосс')) {
        answer = 'Стоп-лосс - это ордер, который автоматически закрывает позицию при достижении определенного уровня убытка, чтобы ограничить потери.';
    } else if (question.includes('тейк профит')) {
        answer = 'Тейк-профит - это ордер, который автоматически закрывает позицию при достижении определенного уровня прибыли, чтобы зафиксировать доход.';
    } else if (question.includes('индикатор')) {
        answer = 'Индикаторы - это математические расчеты на основе цены и объема, которые помогают анализировать рынок. Популярные: SMA, EMA, RSI, MACD.';
    }
    
    // Показываем ответ
    document.getElementById('termTitle').textContent = 'Ответ на ваш вопрос';
    document.getElementById('termDescription').textContent = answer;
    
    const termDetails = document.querySelector('.term-details');
    termDetails.style.display = 'block';
    
    // Очищаем поле ввода
    questionInput.value = '';
}

// Обработка действий учителя
function handleTeacherAction(action) {
    let title = '';
    let content = '';
    
    switch(action) {
        case 'explain-chart':
            title = '📊 Объяснение графика';
            content = 'График показывает изменение цены актива во времени. Зеленые свечи - рост цены, красные - падение. Верхняя тень свечи - максимальная цена, нижняя - минимальная. Тело свечи - цена открытия и закрытия.';
            break;
        case 'explain-indicators':
            title = '📈 Объяснение индикаторов';
            content = 'Индикаторы помогают анализировать рынок:\n• SMA/EMA - скользящие средние\n• RSI - сила тренда (перекупленность/перепроданность)\n• MACD - изменение тренда\n• Volume - объем торгов\n• Bollinger Bands - волатильность';
            break;
        case 'risk-advice':
            title = '🛡️ Советы по рискам';
            content = 'Важные правила управления рисками:\n1. Рискуйте не более 1-2% от депозита в одной сделке\n2. Используйте стоп-лосс\n3. Соотношение риск/прибыль минимум 1:2\n4. Диверсифицируйте портфель\n5. Не поддавайтесь эмоциям';
            break;
        case 'trading-strategy':
            title = '🎯 Стратегии торговли';
            content = 'Базовые стратегии для начинающих:\n• Следование тренду - покупать на росте, продавать на падении\n• Торговля в диапазоне - покупка у поддержки, продажа у сопротивления\n• Скальпинг - множество быстрых сделок с маленькой прибылью';
            break;
    }
    
    document.getElementById('termTitle').textContent = title;
    document.getElementById('termDescription').textContent = content;
    
    const termDetails = document.querySelector('.term-details');
    termDetails.style.display = 'block';
}

// Экспорт данных
function exportData() {
    const data = {
        balance: balance,
        portfolio: portfolio,
        tradeHistory: tradeHistory,
        settings: {
            leverage: leverage,
            indicators: indicators
        }
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = 'tradelearn_data.json';
    link.click();
    
    showNotification('Данные экспортированы', 'success');
}

// Импорт данных
function importData(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            
            if (data.balance !== undefined) balance = data.balance;
            if (data.portfolio) portfolio = data.portfolio;
            if (data.tradeHistory) tradeHistory = data.tradeHistory;
            if (data.settings) {
                if (data.settings.leverage) leverage = data.settings.leverage;
                if (data.settings.indicators) indicators = data.settings.indicators;
            }
            
            updateUI();
            showNotification('Данные импортированы', 'success');
            
        } catch (error) {
            showNotification('Ошибка импорта данных', 'error');
        }
    };
    
    reader.readAsText(file);
    event.target.value = '';
}

// Сброс данных
function resetData() {
    if (confirm('Вы уверены? Все данные будут удалены.')) {
        balance = 100.00;
        portfolio = {
            'BTC': 0,
            'ETH': 0, 
            'SOL': 0,
            'ADA': 0,
            'DOT': 0
        };
        tradeHistory = [];
        leverage = 1;
        
        updateUI();
        showNotification('Данные сброшены', 'success');
    }
}

// Показать секцию
function showSection(sectionName) {
    // Скрываем все секции
    document.querySelectorAll('.content-section').forEach(section => {
        section.style.display = 'none';
    });
    
    // Показываем выбранную секцию
    const targetSection = document.querySelector(`[data-section="${sectionName}"]`);
    if (targetSection) {
        targetSection.style.display = 'block';
    }
    
    // Обновляем активную кнопку навигации
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-section') === sectionName) {
            btn.classList.add('active');
        }
    });
}

// Переключение сайдбара
function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    sidebar.classList.toggle('collapsed');
}

// Показать уведомление
function showNotification(message, type = 'info') {
    // Создаем элемент уведомления
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button class="notification-close">✕</button>
    `;
    
    // Добавляем в документ
    document.body.appendChild(notification);
    
    // Анимация появления
    setTimeout(() => notification.classList.add('show'), 100);
    
    // Закрытие по клику
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    });
    
    // Автоматическое закрытие
    setTimeout(() => {
        if (notification.parentNode) {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// Показать загрузку
function showLoading() {
    const loadingOverlay = document.querySelector('.loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.style.display = 'flex';
    }
}

// Скрыть загрузку
function hideLoading() {
    const loadingOverlay = document.querySelector('.loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.style.display = 'none';
    }
}

// Обработка изменения размера окна
window.addEventListener('resize', function() {
    if (chart) {
        const chartContainer = document.getElementById('candleChart');
        chart.applyOptions({
            width: chartContainer.clientWidth,
            height: chartContainer.clientHeight
        });
    }
});
