// Основные переменные
let chart;
let candleSeries;
let smaSeries;
let emaSeries;
let rsiSeries;
let volumeSeries;
let currentData = [];
let balance = 100.00;
let portfolio = {
    'BTC': 0,
    'ETH': 0, 
    'SOL': 0,
    'ADA': 0,
    'DOT': 0,
    'BNB': 0,
    'XRP': 0,
    'DOGE': 0
};
let tradeHistory = [];
let activeOrders = [];
let currentAsset = 'BTCUSDT';
let currentTimeframe = '1h';
let indicators = {
    sma: true,
    ema: false,
    rsi: false,
    macd: false,
    bollinger: false
};
let wsConnection = null;
let marketData = {};
let tradingSignals = [];
let equityCurve = [100];

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM загружен, инициализация приложения...');
    initializeApp();
});

function initializeApp() {
    console.log('Инициализация приложения...');
    
    // Инициализация графика
    initializeChart();
    
    // Инициализация обработчиков событий
    initializeEventHandlers();
    
    // Загрузка начальных данных
    loadInitialData();
    
    // Загрузка сохраненных данных
    loadSavedData();
    
    // Загрузка реальных данных с Binance
    loadRealChartData();
    
    console.log('Приложение инициализировано');
}

function initializeChart() {
    console.log('Инициализация графика...');
    
    const chartContainer = document.getElementById('candleChart');
    if (!chartContainer) {
        console.error('Контейнер графика не найден!');
        return;
    }
    
    try {
        // Создаем график с оригинальным дизайном
        chart = LightweightCharts.createChart(chartContainer, {
            layout: {
                background: { color: '#121212' },
                textColor: 'rgba(255, 255, 255, 0.9)',
            },
            grid: {
                vertLines: { color: 'rgba(42, 46, 57, 0.5)' },
                horzLines: { color: 'rgba(42, 46, 57, 0.5)' },
            },
            timeScale: {
                timeVisible: true,
                secondsVisible: false,
                borderColor: 'rgba(197, 203, 206, 0.4)',
            },
            crosshair: {
                mode: LightweightCharts.CrosshairMode.Normal,
            },
            width: chartContainer.clientWidth,
            height: 400,
        });

        // Создаем свечную серию с оригинальными цветами
        candleSeries = chart.addCandlestickSeries({
            upColor: '#00c853',
            downColor: '#ff5252',
            borderDownColor: '#ff5252',
            borderUpColor: '#00c853',
            wickDownColor: '#ff5252',
            wickUpColor: '#00c853',
        });

        // Создаем серии для индикаторов с оригинальными цветами
        smaSeries = chart.addLineSeries({
            color: '#2962ff',
            lineWidth: 2,
            title: 'SMA 20',
        });

        emaSeries = chart.addLineSeries({
            color: '#ff6d00',
            lineWidth: 2,
            title: 'EMA 12',
        });

        // RSI серия
        rsiSeries = chart.addLineSeries({
            color: '#9c27b0',
            lineWidth: 1,
            title: 'RSI',
            priceScaleId: 'rsi',
        });

        // Настройка шкалы для RSI
        chart.priceScale('rsi').applyOptions({
            scaleMargins: {
                top: 0.8,
                bottom: 0.1,
            }
        });

        // Объемы
        volumeSeries = chart.addHistogramSeries({
            color: '#26a69a',
            priceFormat: {
                type: 'volume',
            },
            priceScaleId: 'volume',
        });

        chart.priceScale('volume').applyOptions({
            scaleMargins: {
                top: 0.8,
                bottom: 0,
            },
        });

        // Подсказка
        chart.subscribeCrosshairMove(param => {
            if (!param.point) return;
            
            const data = param.seriesData.get(candleSeries);
            if (data) {
                showTooltip(param.point.x, param.point.y, data);
            } else {
                hideTooltip();
            }
        });

        // Обработчик изменения размера
        new ResizeObserver(entries => {
            if (entries.length === 0) return;
            const { width, height } = entries[0].contentRect;
            chart.applyOptions({ width, height: 400 });
        }).observe(chartContainer);

        console.log('График успешно инициализирован');
        
    } catch (error) {
        console.error('Ошибка при инициализации графика:', error);
        showNotification('Ошибка загрузки графика', 'error');
    }
}

// Загрузка реальных данных с Binance
async function loadRealChartData() {
    console.log('Загрузка реальных данных с Binance...');
    
    const loadingOverlay = document.getElementById('chartLoadingOverlay');
    if (loadingOverlay) {
        loadingOverlay.style.display = 'flex';
    }
    
    try {
        const data = await fetchBinanceData(currentAsset, currentTimeframe);
        currentData = data;
        
        if (candleSeries && data.length > 0) {
            candleSeries.setData(data);
            calculateIndicators();
            updateCurrentPrice(data[data.length - 1]);
        }
        
        showNotification(`Данные загружены: ${currentAsset}`, 'success');
        
    } catch (error) {
        console.error('Ошибка загрузки данных:', error);
        showNotification('Ошибка загрузки данных с Binance', 'error');
        // Используем демо данные в случае ошибки
        generateSampleData();
    } finally {
        if (loadingOverlay) {
            loadingOverlay.style.display = 'none';
        }
    }
}

// Получение данных с Binance API
async function fetchBinanceData(symbol, interval, limit = 500) {
    console.log(`Запрос данных: ${symbol}, ${interval}`);
    
    const timeframeMap = {
        '1m': '1m', '5m': '5m', '15m': '15m',
        '1h': '1h', '4h': '4h', '1d': '1d', '1w': '1w'
    };
    
    const binanceInterval = timeframeMap[interval] || '1h';
    
    try {
        const response = await fetch(
            `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${binanceInterval}&limit=${limit}`
        );
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const klines = await response.json();
        
        return klines.map(k => ({
            time: Math.floor(k[0] / 1000),
            open: parseFloat(k[1]),
            high: parseFloat(k[2]),
            low: parseFloat(k[3]),
            close: parseFloat(k[4]),
            volume: parseFloat(k[5])
        }));
        
    } catch (error) {
        console.error('Ошибка получения данных с Binance:', error);
        throw error;
    }
}

// Генерация демо данных (резервный вариант)
function generateSampleData() {
    console.log('Генерация демо данных...');
    
    const sampleData = [];
    let basePrice = currentAsset.includes('BTC') ? 50000 : 
                   currentAsset.includes('ETH') ? 3000 :
                   currentAsset.includes('SOL') ? 100 :
                   currentAsset.includes('ADA') ? 0.5 :
                   currentAsset.includes('DOT') ? 7 :
                   currentAsset.includes('BNB') ? 600 :
                   currentAsset.includes('XRP') ? 0.6 : 0.1;
    
    const now = Date.now();
    
    for (let i = 100; i >= 0; i--) {
        const time = now - i * 3600000; // 1 час интервал
        
        const open = basePrice;
        const change = (Math.random() - 0.5) * (basePrice * 0.02);
        const close = open + change;
        const high = Math.max(open, close) + Math.random() * (basePrice * 0.01);
        const low = Math.min(open, close) - Math.random() * (basePrice * 0.01);
        
        sampleData.push({
            time: Math.floor(time / 1000),
            open: open,
            high: high,
            low: low,
            close: close,
            volume: Math.random() * 1000
        });
        
        basePrice = close;
    }
    
    currentData = sampleData;
    
    if (candleSeries) {
        candleSeries.setData(sampleData);
        calculateIndicators();
        updateCurrentPrice(sampleData[sampleData.length - 1]);
    }
    
    console.log('Демо данные сгенерированы');
}

function calculateIndicators() {
    if (!currentData.length) return;
    
    // SMA 20
    if (indicators.sma) {
        const smaData = calculateSMA(currentData, 20);
        smaSeries.setData(smaData);
    }
    
    // EMA 12
    if (indicators.ema) {
        const emaData = calculateEMA(currentData, 12);
        emaSeries.setData(emaData);
    }
    
    // RSI 14
    if (indicators.rsi) {
        const rsiData = calculateRSI(currentData, 14);
        rsiSeries.setData(rsiData);
    }
    
    updateIndicatorsVisibility();
}

function calculateSMA(data, period) {
    const result = [];
    for (let i = period - 1; i < data.length; i++) {
        let sum = 0;
        for (let j = 0; j < period; j++) {
            sum += data[i - j].close;
        }
        result.push({
            time: data[i].time,
            value: sum / period
        });
    }
    return result;
}

function calculateEMA(data, period) {
    const result = [];
    const k = 2 / (period + 1);
    let ema = data[0].close;
    
    result.push({
        time: data[0].time,
        value: ema
    });
    
    for (let i = 1; i < data.length; i++) {
        ema = (data[i].close - ema) * k + ema;
        result.push({
            time: data[i].time,
            value: ema
        });
    }
    return result;
}

function calculateRSI(data, period) {
    const result = [];
    let gains = 0;
    let losses = 0;
    
    // Расчет первых period значений
    for (let i = 1; i <= period; i++) {
        const change = data[i].close - data[i - 1].close;
        if (change >= 0) {
            gains += change;
        } else {
            losses += Math.abs(change);
        }
    }
    
    let avgGain = gains / period;
    let avgLoss = losses / period;
    
    // Расчет остальных значений
    for (let i = period + 1; i < data.length; i++) {
        const change = data[i].close - data[i - 1].close;
        let currentGain = 0;
        let currentLoss = 0;
        
        if (change >= 0) {
            currentGain = change;
        } else {
            currentLoss = Math.abs(change);
        }
        
        avgGain = (avgGain * (period - 1) + currentGain) / period;
        avgLoss = (avgLoss * (period - 1) + currentLoss) / period;
        
        const rs = avgGain / (avgLoss === 0 ? 1 : avgLoss);
        const rsi = 100 - (100 / (1 + rs));
        
        result.push({
            time: data[i].time,
            value: rsi
        });
    }
    
    return result;
}

function updateIndicatorsVisibility() {
    smaSeries.applyOptions({
        visible: indicators.sma
    });
    
    emaSeries.applyOptions({
        visible: indicators.ema
    });
    
    rsiSeries.applyOptions({
        visible: indicators.rsi
    });
}

function updateCurrentPrice(latestCandle) {
    const priceElement = document.getElementById('current-price');
    const changeElement = document.getElementById('price-change');
    
    if (priceElement && changeElement && latestCandle) {
        const price = latestCandle.close;
        
        // Расчет изменения цены
        let changePercent = 0;
        if (currentData.length > 1) {
            const prevPrice = currentData[currentData.length - 2].close;
            changePercent = ((price - prevPrice) / prevPrice) * 100;
        }
        
        priceElement.textContent = price.toFixed(2);
        changeElement.textContent = `${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}%`;
        changeElement.className = `price-change ${changePercent >= 0 ? 'positive' : 'negative'}`;
        
        // Обновляем статистику рынка
        updateMarketStats(latestCandle);
    }
}

function updateMarketStats(candle) {
    document.getElementById('volume24h').textContent = formatVolume(candle.volume || 0);
    document.getElementById('high24h').textContent = candle.high.toFixed(2);
    document.getElementById('low24h').textContent = candle.low.toFixed(2);
}

function formatVolume(volume) {
    if (volume >= 1000000) {
        return (volume / 1000000).toFixed(2) + 'M';
    } else if (volume >= 1000) {
        return (volume / 1000).toFixed(2) + 'K';
    }
    return volume.toFixed(2);
}

function showTooltip(x, y, data) {
    const tooltip = document.getElementById('chart-tooltip');
    if (!tooltip) return;
    
    const change = ((data.close - data.open) / data.open) * 100;
    const changeClass = change >= 0 ? 'profit' : 'loss';
    
    tooltip.innerHTML = `
        <div class="tooltip-header">${new Date(data.time * 1000).toLocaleString()}</div>
        <div class="tooltip-content">
            <span class="tooltip-label">Open:</span>
            <span class="tooltip-value">${data.open.toFixed(2)}</span>
            
            <span class="tooltip-label">High:</span>
            <span class="tooltip-value">${data.high.toFixed(2)}</span>
            
            <span class="tooltip-label">Low:</span>
            <span class="tooltip-value">${data.low.toFixed(2)}</span>
            
            <span class="tooltip-label">Close:</span>
            <span class="tooltip-value">${data.close.toFixed(2)}</span>
            
            <span class="tooltip-label">Change:</span>
            <span class="tooltip-value ${changeClass}">${change >= 0 ? '+' : ''}${change.toFixed(2)}%</span>
        </div>
    `;
    
    const chartContainer = document.querySelector('.chart-container');
    const rect = chartContainer.getBoundingClientRect();
    
    tooltip.style.left = (x + rect.left) + 'px';
    tooltip.style.top = (y + rect.top - 100) + 'px';
    tooltip.style.display = 'block';
}

function hideTooltip() {
    const tooltip = document.getElementById('chart-tooltip');
    if (tooltip) {
        tooltip.style.display = 'none';
    }
}

function initializeEventHandlers() {
    console.log('Инициализация обработчиков событий...');
    
    // Навигация
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const section = this.getAttribute('data-section');
            showSection(section);
        });
    });
    
    // Закрытие секций
    document.querySelectorAll('.close-section').forEach(btn => {
        btn.addEventListener('click', function() {
            hideAllSections();
        });
    });
    
    // Переключение сайдбара
    document.getElementById('sidebar-toggle').addEventListener('click', function() {
        document.querySelector('.sidebar').classList.toggle('collapsed');
    });
    
    // Переключение таймфреймов
    document.querySelectorAll('.timeframe-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.timeframe-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentTimeframe = this.getAttribute('data-tf');
            loadRealChartData();
        });
    });
    
    // Выбор актива
    document.getElementById('asset-select').addEventListener('change', function() {
        currentAsset = this.value;
        document.getElementById('current-asset').textContent = currentAsset.replace('USDT', '/USDT');
        loadRealChartData();
    });
    
    // Индикаторы
    document.getElementById('sma-toggle').addEventListener('change', function() {
        indicators.sma = this.checked;
        calculateIndicators();
        saveIndicatorsToLocalStorage();
    });
    
    document.getElementById('ema-toggle').addEventListener('change', function() {
        indicators.ema = this.checked;
        calculateIndicators();
        saveIndicatorsToLocalStorage();
    });
    
    document.getElementById('rsi-toggle').addEventListener('change', function() {
        indicators.rsi = this.checked;
        calculateIndicators();
        saveIndicatorsToLocalStorage();
    });
    
    document.getElementById('macd-toggle').addEventListener('change', function() {
        indicators.macd = this.checked;
        saveIndicatorsToLocalStorage();
    });
    
    document.getElementById('bollinger-toggle').addEventListener('change', function() {
        indicators.bollinger = this.checked;
        saveIndicatorsToLocalStorage();
    });
    
    // Кнопки управления графиком
    document.getElementById('auto-scale-btn').addEventListener('click', function() {
        if (chart) {
            chart.timeScale().fitContent();
        }
    });
    
    document.getElementById('reset-chart-btn').addEventListener('click', function() {
        if (chart) {
            chart.timeScale().resetTimeScale();
        }
    });
    
    // Торговля
    document.getElementById('buy-btn').addEventListener('click', function() {
        executeTrade('buy');
    });
    
    document.getElementById('sell-btn').addEventListener('click', function() {
        executeTrade('sell');
    });
    
    document.getElementById('buy-max-btn').addEventListener('click', function() {
        executeTrade('buy', true);
    });
    
    // Тип ордера в торговле
    document.getElementById('order-type-select').addEventListener('change', function() {
        const limitGroup = document.getElementById('limit-price-group');
        limitGroup.style.display = this.value === 'limit' ? 'block' : 'none';
    });
    
    // Быстрые кнопки процентов
    document.querySelectorAll('.quick-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const percent = parseInt(this.getAttribute('data-percent'));
            setTradeAmountByPercent(percent);
        });
    });
    
    // Учитель
    document.getElementById('teacher-hint').addEventListener('click', function() {
        showTeacherHint();
    });
    
    document.getElementById('teacher-analysis').addEventListener('click', function() {
        showTeacherAnalysis();
    });
    
    document.getElementById('teacher-lesson').addEventListener('click', function() {
        toggleTeacherLessons();
    });
    
    document.getElementById('teacher-dictionary-btn').addEventListener('click', function() {
        toggleTeacherDictionary();
    });
    
    document.getElementById('ask-question').addEventListener('click', function() {
        askTeacherQuestion();
    });
    
    document.getElementById('teacher-question').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            askTeacherQuestion();
        }
    });
    
    // Словарь терминов
    document.querySelectorAll('.dictionary-term').forEach(term => {
        term.addEventListener('click', function() {
            const termKey = this.getAttribute('data-term');
            showTermDetails(termKey);
        });
    });
    
    document.getElementById('close-term').addEventListener('click', function() {
        document.getElementById('term-details').style.display = 'none';
    });
    
    // Уроки
    document.querySelectorAll('.lesson-card').forEach(card => {
        card.addEventListener('click', function() {
            const lessonKey = this.getAttribute('data-lesson');
            showLesson(lessonKey);
        });
    });
    
    // Калькулятор рисков
    document.getElementById('calculate-risk').addEventListener('click', function() {
        calculateRisk();
    });
    
    // Создание ордера
    document.getElementById('create-order-btn').addEventListener('click', function() {
        createOrder();
    });
    
    // Экспорт/импорт данных
    document.getElementById('export-btn').addEventListener('click', exportData);
    document.getElementById('import-btn').addEventListener('click', function() {
        document.getElementById('import-file').click();
    });
    document.getElementById('import-file').addEventListener('change', importData);
    document.getElementById('backup-btn').addEventListener('click', createBackup);
    document.getElementById('reset-btn').addEventListener('click', resetData);
    
    // Анализ рынка - переключение вкладок
    document.querySelectorAll('.analysis-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            switchAnalysisTab(tabName);
        });
    });
    
    // Фильтры истории
    document.querySelectorAll('.history-filter').forEach(filter => {
        filter.addEventListener('click', function() {
            const filterType = this.getAttribute('data-filter');
            filterHistory(filterType);
        });
    });
    
    // Фильтры сигналов
    document.querySelectorAll('.signal-filter').forEach(filter => {
        filter.addEventListener('click', function() {
            const signalType = this.getAttribute('data-type');
            filterSignals(signalType);
        });
    });
    
    // Подробная статистика
    document.getElementById('show-detailed-stats').addEventListener('click', function() {
        showDetailedStatistics();
    });
    
    console.log('Обработчики событий инициализированы');
}

function showSection(sectionName) {
    // Скрываем все секции
    hideAllSections();
    
    // Показываем выбранную секцию
    const section = document.getElementById(sectionName + '-section');
    if (section) {
        section.style.display = 'block';
    }
    
    // Обновляем активную кнопку навигации
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-section') === sectionName) {
            btn.classList.add('active');
        }
    });
}

function hideAllSections() {
    document.querySelectorAll('.content-section').forEach(section => {
        section.style.display = 'none';
    });
}

function executeTrade(type, maxAmount = false) {
    const amountInput = document.getElementById('trade-amount');
    let amount = parseFloat(amountInput.value);
    
    if (isNaN(amount) || amount <= 0) {
        showNotification('Введите корректную сумму', 'error');
        return;
    }
    
    if (maxAmount) {
        amount = balance;
        amountInput.value = amount.toFixed(2);
    }
    
    if (amount > balance) {
        showNotification('Недостаточно средств', 'error');
        return;
    }
    
    const currentPrice = currentData[currentData.length - 1].close;
    const assetSymbol = currentAsset.replace('USDT', '');
    
    if (type === 'buy') {
        const assetAmount = amount / currentPrice;
        portfolio[assetSymbol] = (portfolio[assetSymbol] || 0) + assetAmount;
        balance -= amount;
        
        const trade = {
            id: Date.now(),
            type: 'buy',
            asset: assetSymbol,
            amount: assetAmount,
            price: currentPrice,
            total: amount,
            timestamp: new Date().toLocaleString(),
            profit: 0
        };
        
        tradeHistory.push(trade);
        showNotification(`Куплено ${assetAmount.toFixed(6)} ${assetSymbol} за ${amount.toFixed(2)} USDT`, 'success');
    } else {
        const currentHolding = portfolio[assetSymbol] || 0;
        const assetAmount = amount / currentPrice;
        
        if (assetAmount > currentHolding) {
            showNotification('Недостаточно активов для продажи', 'error');
            return;
        }
        
        portfolio[assetSymbol] = currentHolding - assetAmount;
        balance += amount;
        
        const trade = {
            id: Date.now(),
            type: 'sell',
            asset: assetSymbol,
            amount: assetAmount,
            price: currentPrice,
            total: amount,
            timestamp: new Date().toLocaleString(),
            profit: 0
        };
        
        tradeHistory.push(trade);
        showNotification(`Продано ${assetAmount.toFixed(6)} ${assetSymbol} за ${amount.toFixed(2)} USDT`, 'success');
    }
    
    updateBalance();
    updatePortfolio();
    updateTradeHistory();
    updateStatistics();
    saveData();
}

function setTradeAmountByPercent(percent) {
    const maxAmount = balance * (percent / 100);
    document.getElementById('trade-amount').value = maxAmount.toFixed(2);
}

function updateBalance() {
    const balanceElement = document.getElementById('balance');
    if (balanceElement) {
        balanceElement.textContent = balance.toFixed(2) + ' USDT';
    }
}

function updatePortfolio() {
    // Обновляем отображение портфеля
    Object.keys(portfolio).forEach(asset => {
        const element = document.getElementById(asset.toLowerCase() + '-amount');
        if (element) {
            element.textContent = portfolio[asset].toFixed(6);
        }
    });
    
    // Обновляем общую стоимость
    const totalElement = document.getElementById('total-value');
    if (totalElement) {
        let total = balance;
        Object.keys(portfolio).forEach(asset => {
            if (portfolio[asset] > 0) {
                // Используем текущую цену для расчета стоимости
                const currentPrice = currentData[currentData.length - 1].close;
                total += portfolio[asset] * currentPrice;
            }
        });
        totalElement.textContent = total.toFixed(2) + ' USDT';
        
        // Обновляем кривую доходности
        equityCurve.push(total);
        updateEquityChart();
    }
}

function updateTradeHistory() {
    const historyContainer = document.getElementById('history-items');
    if (!historyContainer) return;
    
    if (tradeHistory.length === 0) {
        historyContainer.innerHTML = '<div class="empty-history">Сделок пока нет</div>';
        return;
    }
    
    historyContainer.innerHTML = tradeHistory.slice().reverse().map(trade => {
        const isProfit = trade.type === 'sell' && isTradeProfitable(trade);
        return `
            <div class="history-item ${trade.type === 'buy' ? '' : (isProfit ? '' : 'loss')}">
                <div class="history-info">
                    <div class="history-type">${trade.type === 'buy' ? 'Покупка' : 'Продажа'} ${trade.asset}</div>
                    <div class="history-details">
                        ${trade.timestamp} | 
                        Цена: ${trade.price.toFixed(2)} | 
                        Объем: ${trade.amount.toFixed(6)}
                    </div>
                </div>
                <div class="history-amount ${trade.type === 'buy' ? 'loss' : (isProfit ? 'profit' : 'loss')}">
                    ${trade.type === 'buy' ? '-' : (isProfit ? '+' : '-')}${trade.total.toFixed(2)} USDT
                </div>
            </div>
        `;
    }).join('');
}

function isTradeProfitable(sellTrade) {
    const buyTrades = tradeHistory.filter(t => 
        t.type === 'buy' && t.asset === sellTrade.asset && t.timestamp < sellTrade.timestamp
    );
    if (buyTrades.length === 0) return false;
    
    const totalBuyAmount = buyTrades.reduce((sum, t) => sum + t.amount, 0);
    const totalBuyCost = buyTrades.reduce((sum, t) => sum + (t.amount * t.price), 0);
    const avgBuyPrice = totalBuyCost / totalBuyAmount;
    
    return sellTrade.price > avgBuyPrice;
}

function updateStatistics() {
    const totalTrades = document.getElementById('total-trades');
    const winRate = document.getElementById('win-rate');
    const totalProfit = document.getElementById('total-profit');
    const avgTrade = document.getElementById('avg-trade');
    
    if (totalTrades) {
        totalTrades.querySelector('.stat-value').textContent = tradeHistory.length;
    }
    
    // Простая логика для демонстрации
    if (winRate) {
        const wins = tradeHistory.filter(t => t.type === 'sell' && isTradeProfitable(t)).length;
        const rate = tradeHistory.filter(t => t.type === 'sell').length > 0 ? 
            (wins / tradeHistory.filter(t => t.type === 'sell').length * 100) : 0;
        winRate.querySelector('.stat-value').textContent = rate.toFixed(1) + '%';
    }
    
    if (totalProfit) {
        const profit = equityCurve[equityCurve.length - 1] - 100;
        totalProfit.querySelector('.stat-value').textContent = profit.toFixed(2) + ' USDT';
        totalProfit.querySelector('.stat-value').style.color = profit >= 0 ? 'var(--profit)' : 'var(--loss)';
    }
    
    if (avgTrade) {
        const profit = equityCurve[equityCurve.length - 1] - 100;
        const avg = tradeHistory.length > 0 ? (profit / tradeHistory.length) : 0;
        avgTrade.querySelector('.stat-value').textContent = avg.toFixed(2) + '%';
    }
}

function updateEquityChart() {
    // Простая реализация графика доходности
    const equityChart = document.getElementById('equity-chart');
    if (equityChart && equityCurve.length > 1) {
        equityChart.innerHTML = `<div style="padding: 20px; text-align: center; color: var(--text-secondary);">
            📈 Общая доходность: ${((equityCurve[equityCurve.length - 1] - 100) / 100 * 100).toFixed(2)}%
            <br>Текущий баланс: ${equityCurve[equityCurve.length - 1].toFixed(2)} USDT
        </div>`;
    }
}

// База знаний учителя
const teacherKnowledge = {
    questions: {
        'что такое трейдинг': 'Трейдинг - это торговля финансовыми инструментами с целью получения прибыли от изменения их цены.',
        'как начать торговать': 'Начните с изучения основ, откройте демо-счет, разработайте стратегию и торгуйте на небольшие суммы.',
        'что такое стоп лосс': 'Стоп-лосс - это ордер, который автоматически закрывает позицию при достижении определенного уровня убытка.',
        'что такое тейк профит': 'Тейк-профит - это ордер, который автоматически закрывает позицию при достижении определенного уровня прибыли.',
        'как анализировать график': 'Используйте технический анализ: изучайте свечные паттерны, индикаторы, уровни поддержки и сопротивления.',
        'что такое бычий рынок': 'Бычий рынок - это период роста цен, когда инвесторы настроены оптимистично.',
        'что такое медвежий рынок': 'Медвежий рынок - это период падения цен, когда инвесторы настроены пессимистично.',
        'как управлять рисками': 'Рискуйте не более 1-2% от депозита на сделку, используйте стоп-лосс и диверсифицируйте портфель.',
        'что такое диверсификация': 'Диверсификация - это распределение капитала между разными активами для снижения рисков.',
        'какие индикаторы использовать': 'Начните с SMA, EMA, RSI и MACD. Каждый индикатор имеет свои особенности и сигналы.',
        'что такое leverage': 'Кредитное плечо позволяет торговать большими объемами при меньшем депозите, но увеличивает риски.',
        'как читать свечи': 'Японские свечи показывают цену открытия, закрытия, максимум и минимум за период времени.'
    },

    lessons: {
        'basics': {
            title: '📖 Основы трейдинга',
            content: `Трейдинг - это искусство buying low and selling high (покупать дешево, продавать дорого). 
            
Основные понятия:
• Long (лонг) - покупка актива в ожидании роста цены
• Short (шорт) - продажа актива в ожидании падения цены  
• Spread (спред) - разница между ценой покупки и продажи
• Volume (объем) - количество торгуемых активов
• Liquidity (ликвидность) - возможность быстро купить/продать актив

Важно: никогда не рискуйте больше, чем можете позволить себе потерять!`
        },
        'candles': {
            title: '🕯️ Свечной анализ',
            content: `Японские свечи показывают цену открытия, закрытия, максимум и минимум за период.

Основные паттерны:
• Бычья свеча - закрытие выше открытия (обычно зеленая)
• Медвежья свеча - закрытие ниже открытия (обычно красная)  
• Доджи - маленькое тело, нерешительность рынка
• Молот - бычий разворотный паттерн
• Повешенный - медвежий разворотный паттерн
• Поглощение - большая свеча перекрывает предыдущую

Анализируйте свечи в контексте тренда!`
        },
        'indicators': {
            title: '📊 Технические индикаторы',
            content: `Индикаторы помогают анализировать рынок и находить точки входа.

Популярные индикаторы:
• SMA (Simple Moving Average) - простая скользящая средняя
• EMA (Exponential Moving Average) - экспоненциальная скользящая средняя  
• RSI (Relative Strength Index) - индекс относительной силы
• MACD (Moving Average Convergence Divergence) - схождение/расхождение скользящих средних
• Bollinger Bands - полосы Боллинджера для анализа волатильности

Не используйте слишком много индикаторов - это создаст путаницу!`
        },
        'risk': {
            title: '🛡️ Управление рисками',
            content: `Управление рисками - ключ к успешному трейдингу!

Основные правила:
• Рискуйте не более 1-2% от депозита на сделку
• Всегда устанавливайте стоп-лосс
• Соотношение риск/прибыль должно быть не менее 1:2
• Ведите торговый журнал
• Контролируйте эмоции - жадность и страх главные враги трейдера

Помните: сохранить капитал важнее, чем заработать!`
        }
    },

    dictionary: {
        'sma': {
            title: 'SMA (Simple Moving Average)',
            description: 'Простая скользящая средняя - индикатор, показывающий среднюю цену актива за определенный период. Сглаживает ценовые колебания и помогает определить тренд.'
        },
        'ema': {
            title: 'EMA (Exponential Moving Average)',
            description: 'Экспоненциальная скользящая средняя - похожа на SMA, но придает больший вес последним ценам, что делает ее более чувствительной к недавним изменениям цены.'
        },
        'rsi': {
            title: 'RSI (Relative Strength Index)',
            description: 'Индекс относительной силы - осциллятор, измеряющий скорость и изменение ценовых движений. Значения выше 70 указывают на перекупленность, ниже 30 - на перепроданность.'
        },
        'macd': {
            title: 'MACD (Moving Average Convergence Divergence)',
            description: 'Индикатор, показывающий взаимосвязь между двумя скользящими средними. Помогает определить момент изменения тренда.'
        },
        'bollinger': {
            title: 'Полосы Боллинджера (Bollinger Bands)',
            description: 'Технический индикатор, состоящий из трех линий, который показывает волатильность рынка и потенциальные уровни поддержки и сопротивления.'
        }
    }
};

function showTeacherHint() {
    const messages = [
        "Помните о стоп-лоссах! Рискуйте не более 2% от депозита.",
        "Анализируйте график перед совершением сделки. Ищите подтверждения!",
        "Не поддавайтесь эмоциям - торгуйте по плану, а не по настроению.",
        "Диверсифицируйте портфель для снижения рисков. Не кладите все яйца в одну корзину!",
        "Изучайте основы технического анализа - это фундамент успешного трейдинга.",
        "Ведите торговый журнал! Анализируйте свои успехи и ошибки.",
        "Тренд - ваш друг. Не пытайтесь торговать против тренда, особенно новичкам.",
        "Паттерны повторяются! Изучайте исторические данные и графические модели.",
        "Управление капиталом важнее, чем точность прогнозов!",
        "Обучайтесь постоянно! Рынки меняются, и ваши знания должны обновляться."
    ];
    
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    document.getElementById('teacher-message').textContent = randomMessage;
}

function showTeacherAnalysis() {
    const currentPrice = currentData[currentData.length - 1].close;
    const analysis = `Текущая цена ${currentAsset}: ${currentPrice.toFixed(2)}. `;
    
    // Простой анализ на основе последних данных
    let recommendation = "Рекомендую изучить график и индикаторы.";
    if (currentData.length > 1) {
        const prevPrice = currentData[currentData.length - 2].close;
        const trend = currentPrice > prevPrice ? "восходящий" : "нисходящий";
        recommendation = `Наблюдается ${trend} тренд. ${recommendation}`;
    }
    
    document.getElementById('teacher-message').textContent = analysis + recommendation;
}

function toggleTeacherLessons() {
    const lessonsDiv = document.getElementById('teacher-lessons');
    const isVisible = lessonsDiv.style.display === 'block';
    
    lessonsDiv.style.display = isVisible ? 'none' : 'block';
    document.getElementById('teacher-dictionary').style.display = 'none';
    document.getElementById('term-details').style.display = 'none';
}

function toggleTeacherDictionary() {
    const dictionaryDiv = document.getElementById('teacher-dictionary');
    const isVisible = dictionaryDiv.style.display === 'block';
    
    dictionaryDiv.style.display = isVisible ? 'none' : 'block';
    document.getElementById('teacher-lessons').style.display = 'none';
    document.getElementById('term-details').style.display = 'none';
}

function showLesson(lessonKey) {
    const lesson = teacherKnowledge.lessons[lessonKey];
    if (lesson) {
        document.getElementById('teacher-message').innerHTML = `
            <strong>${lesson.title}</strong><br><br>
            ${lesson.content.replace(/\n/g, '<br>')}
        `;
    }
}

function showTermDetails(termKey) {
    const term = teacherKnowledge.dictionary[termKey];
    if (term) {
        document.getElementById('term-title').textContent = term.title;
        document.getElementById('term-description').textContent = term.description;
        document.getElementById('term-details').style.display = 'block';
        document.getElementById('teacher-dictionary').style.display = 'none';
    }
}

function askTeacherQuestion() {
    const questionInput = document.getElementById('teacher-question');
    const question = questionInput.value.toLowerCase().trim();
    
    if (!question) {
        showNotification('Введите вопрос', 'error');
        return;
    }
    
    let answer = "Извините, я не понял вопрос. Попробуйте спросить о: трейдинге, индикаторах, рисках, стоп-лоссе или тейк-профите.";
    
    // Поиск в базе знаний
    for (const [key, value] of Object.entries(teacherKnowledge.questions)) {
        if (question.includes(key)) {
            answer = value;
            break;
        }
    }
    
    document.getElementById('teacher-message').textContent = `❓ Ваш вопрос: ${question}\n\n💡 Ответ: ${answer}`;
    questionInput.value = '';
}

function calculateRisk() {
    const deposit = parseFloat(document.getElementById('risk-deposit').value);
    const riskPercent = parseFloat(document.getElementById('risk-percent').value);
    const entryPrice = parseFloat(document.getElementById('risk-entry').value);
    const stopPrice = parseFloat(document.getElementById('risk-stop').value);
    
    if (isNaN(deposit) || isNaN(riskPercent) || isNaN(entryPrice) || isNaN(stopPrice)) {
        showNotification('Заполните все поля корректно', 'error');
        return;
    }
    
    if (entryPrice <= stopPrice) {
        showNotification('Цена входа должна быть выше стоп-лосса для LONG', 'error');
        return;
    }
    
    const riskAmount = deposit * (riskPercent / 100);
    const priceDifference = entryPrice - stopPrice;
    const volume = riskAmount / priceDifference;
    const riskRewardRatio = 2; // Простое предположение
    
    document.getElementById('risk-volume').textContent = volume.toFixed(6);
    document.getElementById('risk-amount').textContent = riskAmount.toFixed(2) + ' USDT';
    document.getElementById('risk-profit').textContent = (riskAmount * riskRewardRatio).toFixed(2) + ' USDT';
    document.getElementById('risk-ratio').textContent = riskRewardRatio.toFixed(2);
}

function createOrder() {
    const orderType = document.getElementById('order-type').value;
    const price = parseFloat(document.getElementById('order-price').value);
    const amount = parseFloat(document.getElementById('order-amount').value);
    
    if (isNaN(price) || isNaN(amount) || price <= 0 || amount <= 0) {
        showNotification('Заполните все поля корректно', 'error');
        return;
    }
    
    const order = {
        id: Date.now(),
        type: orderType,
        asset: currentAsset,
        price: price,
        amount: amount,
        timestamp: new Date().toLocaleString(),
        status: 'active'
    };
    
    activeOrders.push(order);
    updateOrdersDisplay();
    showNotification(`Ордер создан: ${orderType}`, 'success');
    saveData();
}

function updateOrdersDisplay() {
    const ordersContainer = document.getElementById('orders-container');
    
    if (activeOrders.length === 0) {
        ordersContainer.innerHTML = '<div class="empty-orders">Активных ордеров нет</div>';
        return;
    }
    
    ordersContainer.innerHTML = activeOrders.map(order => `
        <div class="order-item ${order.type.toLowerCase().replace('_', '-')}">
            <div class="order-info">
                <div class="order-type">${getOrderTypeText(order.type)}</div>
                <div class="order-details">
                    ${order.asset} | Цена: ${order.price.toFixed(2)} | Объем: ${order.amount.toFixed(6)}
                </div>
            </div>
            <div class="order-actions">
                <button class="order-cancel-btn" onclick="cancelOrder(${order.id})">Отмена</button>
            </div>
        </div>
    `).join('');
}

function getOrderTypeText(type) {
    const types = {
        'STOP': 'Стоп-лосс',
        'TAKE_PROFIT': 'Тейк-профит',
        'STOP_LIMIT': 'Стоп-лимит'
    };
    return types[type] || type;
}

function cancelOrder(orderId) {
    activeOrders = activeOrders.filter(order => order.id !== orderId);
    updateOrdersDisplay();
    showNotification('Ордер отменен', 'success');
    saveData();
}

function switchAnalysisTab(tabName) {
    // Обновляем активные вкладки
    document.querySelectorAll('.analysis-tab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.getAttribute('data-tab') === tabName) {
            tab.classList.add('active');
        }
    });
    
    // Показываем соответствующий контент
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
        if (content.id === tabName + '-analysis') {
            content.classList.add('active');
        }
    });
}

function filterHistory(filterType) {
    document.querySelectorAll('.history-filter').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-filter') === filterType) {
            btn.classList.add('active');
        }
    });
    
    // В реальном приложении здесь была бы фильтрация
    updateTradeHistory(); // Просто обновляем отображение
}

function filterSignals(signalType) {
    document.querySelectorAll('.signal-filter').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-type') === signalType) {
            btn.classList.add('active');
        }
    });
    
    // Обновляем отображение сигналов
    updateSignalsDisplay();
}

function updateSignalsDisplay() {
    const signalsList = document.getElementById('signals-list');
    
    if (tradingSignals.length === 0) {
        signalsList.innerHTML = '<div class="empty-signals">Сигналы появятся здесь</div>';
        return;
    }
    
    // Простое отображение сигналов
    signalsList.innerHTML = tradingSignals.map(signal => `
        <div class="signal-item ${signal.type}">
            <div class="signal-info">
                <div class="signal-type">${getSignalTypeText(signal.type)}</div>
                <div class="signal-desc">${signal.description}</div>
                <div class="signal-time">${signal.timestamp}</div>
            </div>
            <div class="signal-strength ${signal.strength}">
                ${getStrengthText(signal.strength)}
            </div>
        </div>
    `).join('');
}

function getSignalTypeText(type) {
    const typeMap = {
        'buy': '🟢 Покупка',
        'sell': '🔴 Продажа',
        'warning': '🟡 Внимание'
    };
    return typeMap[type] || type;
}

function getStrengthText(strength) {
    const strengthMap = {
        'high': 'Высокая',
        'medium': 'Средняя',
        'low': 'Низкая'
    };
    return strengthMap[strength] || strength;
}

function showDetailedStatistics() {
    const stats = `
Общая статистика:
- Всего сделок: ${tradeHistory.length}
- Прибыльных: ${tradeHistory.filter(t => t.type === 'sell' && isTradeProfitable(t)).length}
- Убыточных: ${tradeHistory.filter(t => t.type === 'sell' && !isTradeProfitable(t)).length}
- Процент побед: ${tradeHistory.filter(t => t.type === 'sell').length > 0 ? 
    (tradeHistory.filter(t => t.type === 'sell' && isTradeProfitable(t)).length / 
     tradeHistory.filter(t => t.type === 'sell').length * 100).toFixed(1) : 0}%
- Общая прибыль: ${(equityCurve[equityCurve.length - 1] - 100).toFixed(2)} USDT
- Максимальная просадка: 0.00 USDT
    `;
    
    alert(stats);
}

// Система уведомлений
function showNotification(message, type = 'info') {
    const container = document.getElementById('notification-container');
    if (!container) return;
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-header">
            <div class="notification-title">${type === 'success' ? '✅ Успех' : type === 'error' ? '❌ Ошибка' : 'ℹ️ Информация'}</div>
            <button class="notification-close">✕</button>
        </div>
        <div class="notification-message">${message}</div>
    `;
    
    container.appendChild(notification);
    
    // Автоматическое удаление через 5 секунд
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
    
    // Закрытие по клику
    notification.querySelector('.notification-close').addEventListener('click', function() {
        notification.remove();
    });
}

// Система сохранения данных
function saveData() {
    const data = {
        balance: balance,
        portfolio: portfolio,
        tradeHistory: tradeHistory,
        activeOrders: activeOrders,
        equityCurve: equityCurve,
        version: '1.0',
        lastUpdate: new Date().toISOString()
    };
    
    localStorage.setItem('tradelearn-data', JSON.stringify(data));
    updateDataInfo();
}

function saveIndicatorsToLocalStorage() {
    localStorage.setItem('tradelearn-indicators', JSON.stringify(indicators));
}

function loadSavedData() {
    const saved = localStorage.getItem('tradelearn-data');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            balance = data.balance || 100.00;
            portfolio = data.portfolio || {};
            tradeHistory = data.tradeHistory || [];
            activeOrders = data.activeOrders || [];
            equityCurve = data.equityCurve || [100];
            
            updateBalance();
            updatePortfolio();
            updateTradeHistory();
            updateOrdersDisplay();
            updateStatistics();
            updateDataInfo();
            
        } catch (error) {
            console.error('Ошибка загрузки данных:', error);
        }
    }
    
    // Загрузка настроек индикаторов
    const savedIndicators = localStorage.getItem('tradelearn-indicators');
    if (savedIndicators) {
        try {
            indicators = {...indicators, ...JSON.parse(savedIndicators)};
            updateIndicatorCheckboxes();
        } catch (error) {
            console.error('Ошибка загрузки настроек индикаторов:', error);
        }
    }
}

function updateIndicatorCheckboxes() {
    document.getElementById('sma-toggle').checked = indicators.sma;
    document.getElementById('ema-toggle').checked = indicators.ema;
    document.getElementById('rsi-toggle').checked = indicators.rsi;
    document.getElementById('macd-toggle').checked = indicators.macd;
    document.getElementById('bollinger-toggle').checked = indicators.bollinger;
}

function exportData() {
    const data = {
        balance: balance,
        portfolio: portfolio,
        tradeHistory: tradeHistory,
        activeOrders: activeOrders,
        equityCurve: equityCurve,
        version: '1.0',
        exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tradelearn-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification('Данные экспортированы', 'success');
}

function importData(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            
            if (confirm('Заменить текущие данные импортированными?')) {
                balance = data.balance || 100.00;
                portfolio = data.portfolio || {};
                tradeHistory = data.tradeHistory || [];
                activeOrders = data.activeOrders || [];
                equityCurve = data.equityCurve || [100];
                
                updateBalance();
                updatePortfolio();
                updateTradeHistory();
                updateOrdersDisplay();
                updateStatistics();
                saveData();
                
                showNotification('Данные импортированы', 'success');
            }
        } catch (error) {
            console.error('Ошибка импорта данных:', error);
            showNotification('Ошибка импорта данных', 'error');
        }
    };
    reader.readAsText(file);
    event.target.value = ''; // Сброс input
}

function createBackup() {
    saveData();
    showNotification('Резервная копия создана', 'success');
}

function resetData() {
    if (confirm('Вы уверены? Все данные будут удалены.')) {
        localStorage.removeItem('tradelearn-data');
        balance = 100.00;
        portfolio = {};
        tradeHistory = [];
        activeOrders = [];
        equityCurve = [100];
        
        updateBalance();
        updatePortfolio();
        updateTradeHistory();
        updateOrdersDisplay();
        updateStatistics();
        
        showNotification('Данные сброшены', 'success');
    }
}

function updateDataInfo() {
    const saved = localStorage.getItem('tradelearn-data');
    const size = saved ? (new Blob([saved]).size / 1024).toFixed(2) : '0';
    const lastUpdate = saved ? new Date(JSON.parse(saved).lastUpdate).toLocaleString() : 'Неизвестно';
    
    document.getElementById('data-size').textContent = size + ' KB';
    document.getElementById('last-update').textContent = lastUpdate;
}

function loadInitialData() {
    console.log('Загрузка начальных данных...');
    updateBalance();
    updatePortfolio();
    updateTradeHistory();
    updateOrdersDisplay();
    updateStatistics();
    updateDataInfo();
    
    // Обновляем статус подключения
    setTimeout(() => {
        document.getElementById('connection-status').textContent = '✅ Подключено к Binance';
        document.getElementById('connection-status').className = 'connection-status connected';
    }, 2000);
}

// Глобальные функции
window.cancelOrder = cancelOrder;

// Стили для уведомлений
const notificationStyles = `
.notification {
    position: fixed;
    top: 20px;
    right: 20px;
    background: var(--surface);
    border-left: 4px solid var(--primary);
    padding: 12px 15px;
    border-radius: 6px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    animation: slideIn 0.3s ease;
    max-width: 300px;
    z-index: 10000;
}

.notification.success {
    border-left-color: var(--success);
}

.notification.error {
    border-left-color: var(--error);
}

.notification-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 5px;
}

.notification-title {
    font-weight: 600;
    font-size: 0.9rem;
}

.notification-close {
    background: none;
    border: none;
    color: var(--text-secondary);
    cursor: pointer;
    font-size: 1rem;
}

.notification-message {
    font-size: 0.8rem;
    color: var(--text-secondary);
}

@keyframes slideIn {
    from {
        transform: translateX(100%);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}
`;

// Добавляем стили в документ
const styleSheet = document.createElement('style');
styleSheet.textContent = notificationStyles;
document.head.appendChild(styleSheet);
