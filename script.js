// Основные переменные
let chart;
let candleSeries;
let volumeSeries;
let smaSeries;
let emaSeries;
let rsiSeries;
let macdSeries;
let bollingerSeries;
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
let activeOrders = [];
let currentAsset = 'BTCUSDT';
let currentTimeframe = '1m';

// Расширенные настройки
let leverage = 1;
let tradingFees = 0.1;
let spread = 0.01;
let userLevel = 1;
let userXP = 0;

let indicators = {
    sma: true,
    ema: false,
    rsi: false,
    volume: true,
    macd: false,
    bollinger: false,
    stochastic: false
};

let advancedStats = {
    totalProfit: 0,
    maxDrawdown: 0,
    averageWin: 0,
    averageLoss: 0,
    profitFactor: 0,
    sharpeRatio: 0,
    expectancy: 0,
    totalTrades: 0,
    winningTrades: 0,
    losingTrades: 0
};

let achievements = {
    firstTrade: { unlocked: false, reward: 5, xp: 50 },
    profit10: { unlocked: false, reward: 10, xp: 100 },
    riskManager: { unlocked: false, reward: 15, xp: 150 },
    streak3: { unlocked: false, reward: 8, xp: 80 },
    volumeTrader: { unlocked: false, reward: 20, xp: 200 },
    analyst: { unlocked: false, reward: 12, xp: 120 }
};

let dailyQuests = {
    trade3: { completed: false, progress: 0, target: 3, reward: 5, xp: 50 },
    useStopLoss: { completed: false, progress: 0, target: 5, reward: 8, xp: 80 },
    profit5: { completed: false, progress: 0, target: 5, reward: 10, xp: 100 }
};

let wsConnection = null;
let realTimeData = null;

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
        'какие индикаторы использовать': 'Начните с SMA, EMA, RSI и MACD. Каждый индикатор имеет свои особенности и сигналы.'
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
        },
        'strategies': {
            title: '🎯 Торговые стратегии',
            content: `Разные стратегии для разных стилей торговли:
            
            • Скальпинг - множество быстрых сделок с маленькой прибылью
            • Дейтрейдинг - сделки в течение одного дня
            • Свинг-трейдинг - удержание позиций несколько дней
            • Позиционная торговля - долгосрочные инвестиции
            
            Выберите стиль, который подходит вашему характеру и расписанию!`
        }
    },

    dictionary: {
        'Лонг (Long)': 'Позиция на покупку, прибыль при росте цены',
        'Шорт (Short)': 'Позиция на продажу, прибыль при падении цены',
        'Спред (Spread)': 'Разница между ценой покупки и продажи',
        'Ликвидация (Liquidation)': 'Принудительное закрытие позиции при недостатке средств',
        'Маржа (Margin)': 'Залог для открытия позиции с плечом',
        'Плечо (Leverage)': 'Кредитное плечо для увеличения объема позиции',
        'Волатильность (Volatility)': 'Степень изменения цены актива',
        'Тренд (Trend)': 'Направление движения цены',
        'Коррекция (Correction)': 'Временное движение против тренда',
        'Поддержка (Support)': 'Уровень, где цена находит покупателей',
        'Сопротивление (Resistance)': 'Уровень, где цена находит продавцов',
        'Быки (Bulls)': 'Трейдеры, ожидающие роста цены',
        'Медведи (Bears)': 'Трейдеры, ожидающие падения цены',
        'Флэт (Flat)': 'Боковое движение цены без явного тренда',
        'Гэп (Gap)': 'Разрыв в цене между торговыми сессиями',
        'Слиппидж (Slippage)': 'Разница между ожидаемой и фактической ценой исполнения',
        'Арбитраж (Arbitrage)': 'Покупка и продажа актива на разных рынках для получения прибыли от разницы цен',
        'Диверсификация (Diversification)': 'Распределение инвестиций между разными активами',
        'Хеджирование (Hedging)': 'Страхование рисков открытием противоположных позиций',
        'Аллигатор (Alligator)': 'Торговая стратегия на основе трех скользящих средних'
    }
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
    setupWebSocket();
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

    // Серии для индикаторов
    smaSeries = chart.addLineSeries({
        color: '#2962FF',
        lineWidth: 2,
        title: 'SMA 20',
        priceScaleId: 'left',
    });

    emaSeries = chart.addLineSeries({
        color: '#FF6D00',
        lineWidth: 2,
        title: 'EMA 20',
        priceScaleId: 'left',
    });

    rsiSeries = chart.addLineSeries({
        color: '#9C27B0',
        lineWidth: 2,
        title: 'RSI',
        priceScaleId: 'rsi',
    });

    macdSeries = chart.addLineSeries({
        color: '#FF4081',
        lineWidth: 2,
        title: 'MACD',
        priceScaleId: 'macd',
    });

    bollingerSeries = chart.addLineSeries({
        color: '#4CAF50',
        lineWidth: 1,
        title: 'Bollinger Bands',
        priceScaleId: 'left',
    });

    // Настройка шкал для индикаторов
    chart.priceScale('volume').applyOptions({
        scaleMargins: {
            top: 0.8,
            bottom: 0,
        },
    });

    chart.priceScale('rsi').applyOptions({
        scaleMargins: {
            top: 0.1,
            bottom: 0.1,
        },
    });

    chart.priceScale('macd').applyOptions({
        scaleMargins: {
            top: 0.1,
            bottom: 0.1,
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
    document.querySelectorAll('.indicator-checkbox input').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const indicator = this.id.replace('show', '').toLowerCase();
            indicators[indicator] = this.checked;
            updateIndicators();
        });
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

    // Словарь терминов
    document.querySelectorAll('.dictionary-term').forEach(term => {
        term.addEventListener('click', function() {
            const termName = this.querySelector('.term-name').textContent;
            showTermDefinition(termName);
        });
    });

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
}

// Загрузка начальных данных
async function loadInitialData() {
    showLoading();
    await loadChartData();
    hideLoading();
    updateUI();
}

// Загрузка данных для графика с использованием прокси
async function loadChartData() {
    try {
        showLoading();
        
        // Используем прокси для обхода CORS
        const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
        const binanceUrl = `https://api.binance.com/api/v3/klines?symbol=${currentAsset}&interval=${currentTimeframe}&limit=100`;
        
        const response = await fetch(proxyUrl + binanceUrl, {
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Преобразуем данные в формат для графика
        const chartData = data.map(kline => ({
            time: kline[0] / 1000, // Convert to seconds
            open: parseFloat(kline[1]),
            high: parseFloat(kline[2]),
            low: parseFloat(kline[3]),
            close: parseFloat(kline[4]),
            volume: parseFloat(kline[5])
        }));

        currentData = chartData;
        
        // Обновляем график
        candleSeries.setData(chartData);
        
        // Обновляем индикаторы
        updateIndicators();
        
        // Обновляем текущую цену
        if (chartData.length > 0) {
            const latestPrice = chartData[chartData.length - 1].close;
            updateCurrentPrice(latestPrice);
        }
        
    } catch (error) {
        console.error('Error loading chart data:', error);
        
        // Fallback: генерируем тестовые данные если API недоступно
        generateTestData();
    } finally {
        hideLoading();
    }
}

// Генерация тестовых данных если API недоступно
function generateTestData() {
    const testData = [];
    let basePrice = 50000;
    let currentTime = Math.floor(Date.now() / 1000) - 100 * 60; // 100 минут назад
    
    for (let i = 0; i < 100; i++) {
        const volatility = 0.02; // 2% волатильность
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

    // SMA (20 периодов)
    if (indicators.sma) {
        const smaData = calculateSMA(currentData, 20);
        smaSeries.setData(smaData);
    } else {
        smaSeries.setData([]);
    }

    // EMA (20 периодов)
    if (indicators.ema) {
        const emaData = calculateEMA(currentData, 20);
        emaSeries.setData(emaData);
    } else {
        emaSeries.setData([]);
    }

    // RSI (14 периодов)
    if (indicators.rsi) {
        const rsiData = calculateRSI(currentData, 14);
        rsiSeries.setData(rsiData);
    } else {
        rsiSeries.setData([]);
    }

    // MACD
    if (indicators.macd) {
        const macdData = calculateMACD(currentData);
        macdSeries.setData(macdData);
    } else {
        macdSeries.setData([]);
    }

    // Bollinger Bands
    if (indicators.bollinger) {
        const bbData = calculateBollingerBands(currentData, 20, 2);
        bollingerSeries.setData(bbData);
    } else {
        bollingerSeries.setData([]);
    }
}

// Расчет SMA
function calculateSMA(data, period) {
    const smaData = [];
    for (let i = period - 1; i < data.length; i++) {
        let sum = 0;
        for (let j = 0; j < period; j++) {
            sum += data[i - j].close;
        }
        smaData.push({
            time: data[i].time,
            value: sum / period
        });
    }
    return smaData;
}

// Расчет EMA
function calculateEMA(data, period) {
    const emaData = [];
    const multiplier = 2 / (period + 1);
    
    // Первое значение EMA - это SMA
    let ema = data.slice(0, period).reduce((sum, d) => sum + d.close, 0) / period;
    emaData.push({ time: data[period - 1].time, value: ema });
    
    for (let i = period; i < data.length; i++) {
        ema = (data[i].close - ema) * multiplier + ema;
        emaData.push({ time: data[i].time, value: ema });
    }
    
    return emaData;
}

// Расчет RSI
function calculateRSI(data, period) {
    const rsiData = [];
    const gains = [];
    const losses = [];
    
    // Рассчитываем изменения
    for (let i = 1; i < data.length; i++) {
        const change = data[i].close - data[i - 1].close;
        gains.push(change > 0 ? change : 0);
        losses.push(change < 0 ? Math.abs(change) : 0);
    }
    
    // Рассчитываем RSI
    for (let i = period; i < gains.length; i++) {
        const avgGain = gains.slice(i - period, i).reduce((sum, g) => sum + g, 0) / period;
        const avgLoss = losses.slice(i - period, i).reduce((sum, l) => sum + l, 0) / period;
        
        const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
        const rsi = 100 - (100 / (1 + rs));
        
        rsiData.push({
            time: data[i + 1].time, // +1 потому что мы начали с i=1 для изменений
            value: rsi
        });
    }
    
    return rsiData;
}

// Расчет MACD
function calculateMACD(data) {
    const ema12 = calculateEMA(data, 12);
    const ema26 = calculateEMA(data, 26);
    
    const macdData = [];
    const minLength = Math.min(ema12.length, ema26.length);
    
    for (let i = 0; i < minLength; i++) {
        const macd = ema12[ema12.length - minLength + i].value - ema26[ema26.length - minLength + i].value;
        macdData.push({
            time: ema26[ema26.length - minLength + i].time,
            value: macd
        });
    }
    
    return macdData;
}

// Расчет Bollinger Bands
function calculateBollingerBands(data, period, stdDev) {
    const bbData = [];
    
    for (let i = period - 1; i < data.length; i++) {
        const slice = data.slice(i - period + 1, i + 1);
        const prices = slice.map(d => d.close);
        const mean = prices.reduce((sum, p) => sum + p, 0) / period;
        
        const squaredDiffs = prices.map(p => Math.pow(p - mean, 2));
        const variance = squaredDiffs.reduce((sum, sd) => sum + sd, 0) / period;
        const standardDeviation = Math.sqrt(variance);
        
        bbData.push({
            time: data[i].time,
            value: mean + (standardDeviation * stdDev)
        });
    }
    
    return bbData;
}

// WebSocket для реальных данных
function setupWebSocket() {
    try {
        // Используем wss поток для тестовых данных, так как Binance требует API ключ
        const wsUrl = 'wss://stream.binance.com:9443/ws/btcusdt@kline_1m';
        
        wsConnection = new WebSocket(wsUrl);
        
        wsConnection.onopen = function() {
            console.log('WebSocket connected');
        };
        
        wsConnection.onmessage = function(event) {
            const data = JSON.parse(event.data);
            
            if (data.k) {
                const kline = data.k;
                const newCandle = {
                    time: kline.t / 1000,
                    open: parseFloat(kline.o),
                    high: parseFloat(kline.h),
                    low: parseFloat(kline.l),
                    close: parseFloat(kline.c),
                    volume: parseFloat(kline.v)
                };
                
                // Обновляем текущую цену
                updateCurrentPrice(newCandle.close);
                
                // Можно добавить логику для обновления графика в реальном времени
                // Но для демо мы будем просто обновлять периодически
            }
        };
        
        wsConnection.onerror = function(error) {
            console.error('WebSocket error:', error);
            // Fallback на периодическое обновление
            setInterval(loadChartData, 30000); // Обновляем каждые 30 секунд
        };
        
        wsConnection.onclose = function() {
            console.log('WebSocket disconnected');
        };
        
    } catch (error) {
        console.error('WebSocket setup failed:', error);
        // Fallback на периодическое обновление
        setInterval(loadChartData, 30000);
    }
}

// Обновление текущей цены
function updateCurrentPrice(price) {
    const priceElement = document.querySelector('.asset-price');
    const changeElement = document.querySelector('.price-change');
    const previousPrice = parseFloat(priceElement.textContent.replace('$', '')) || price;
    
    const change = price - previousPrice;
    const changePercent = ((change / previousPrice) * 100).toFixed(2);
    
    priceElement.textContent = `$${price.toFixed(2)}`;
    
    if (change >= 0) {
        changeElement.textContent = `+${changePercent}%`;
        changeElement.className = 'price-change positive';
    } else {
        changeElement.textContent = `${changePercent}%`;
        changeElement.className = 'price-change negative';
    }
    
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
        portfolio[currentAsset.replace('USDT', '')] = (portfolio[currentAsset.replace('USDT', '')] || 0) + amount;
        
        tradeHistory.push({
            type: 'BUY',
            asset: currentAsset,
            amount: amount,
            price: currentPrice,
            total: totalCost,
            fee: fee,
            timestamp: new Date().toLocaleString()
        });
        
        showNotification(`Куплено ${amount} ${currentAsset} за $${totalCost.toFixed(2)}`, 'success');
        
        // Разблокируем достижения
        checkAchievements();
        
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
        
        showNotification(`Продано ${amount} ${currentAsset} за $${totalCost.toFixed(2)}`, 'success');
        
        // Обновляем статистику
        updateAdvancedStats();
    }
    
    updateUI();
    updatePortfolioDisplay();
    updateTradeHistory();
}

// Получение текущей цены
function getCurrentPrice() {
    if (currentData.length > 0) {
        return currentData[currentData.length - 1].close;
    }
    return 50000; // Fallback цена
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
    
    // Проверяем достижения
    if (stopLoss > 0) {
        dailyQuests.useStopLoss.progress++;
        if (dailyQuests.useStopLoss.progress >= dailyQuests.useStopLoss.target) {
            dailyQuests.useStopLoss.completed = true;
            unlockAchievement('riskManager');
        }
    }
}

// Обновление расширенной статистики
function updateAdvancedStats() {
    if (tradeHistory.length === 0) return;
    
    const profitableTrades = tradeHistory.filter(t => {
        if (t.type === 'BUY') return false;
        // Для упрощения считаем все продажи прибыльными
        return true;
    });
    
    const losingTrades = tradeHistory.filter(t => {
        if (t.type === 'BUY') return false;
        // Для демо считаем все продажи прибыльными
        return false;
    });
    
    advancedStats.totalTrades = tradeHistory.length;
    advancedStats.winningTrades = profitableTrades.length;
    advancedStats.losingTrades = losingTrades.length;
    advancedStats.winRate = (advancedStats.winningTrades / advancedStats.totalTrades * 100).toFixed(1);
    
    updateStatsDisplay();
}

// Обновление отображения статистики
function updateStatsDisplay() {
    document.getElementById('totalTrades').textContent = advancedStats.totalTrades;
    document.getElementById('winRate').textContent = `${advancedStats.winRate}%`;
    document.getElementById('totalProfit').textContent = `$${advancedStats.totalProfit.toFixed(2)}`;
    document.getElementById('bestTrade').textContent = `$${advancedStats.averageWin.toFixed(2)}`;
}

// Проверка достижений
function checkAchievements() {
    // Первая сделка
    if (tradeHistory.length >= 1 && !achievements.firstTrade.unlocked) {
        unlockAchievement('firstTrade');
    }
    
    // 3 сделки подряд
    if (tradeHistory.length >= 3 && !achievements.streak3.unlocked) {
        unlockAchievement('streak3');
    }
    
    // Объем торгов
    const totalVolume = tradeHistory.reduce((sum, trade) => sum + trade.amount, 0);
    if (totalVolume >= 10 && !achievements.volumeTrader.unlocked) {
        unlockAchievement('volumeTrader');
    }
    
    // Использование индикаторов
    const indicatorsUsed = Object.values(indicators).filter(val => val).length;
    if (indicatorsUsed >= 3 && !achievements.analyst.unlocked) {
        unlockAchievement('analyst');
    }
    
    updateQuestsProgress();
}

// Разблокировка достижения
function unlockAchievement(achievementKey) {
    const achievement = achievements[achievementKey];
    if (achievement && !achievement.unlocked) {
        achievement.unlocked = true;
        balance += achievement.reward;
        userXP += achievement.xp;
        
        showNotification(`Достижение разблокировано: ${getAchievementName(achievementKey)}! +$${achievement.reward}`, 'success');
        updateAchievementsDisplay();
        updateUI();
    }
}

// Получение названия достижения
function getAchievementName(key) {
    const names = {
        firstTrade: 'Первая сделка',
        profit10: 'Прибыль $10',
        riskManager: 'Риск-менеджер',
        streak3: 'Серия из 3 сделок',
        volumeTrader: 'Объемный трейдер',
        analyst: 'Аналитик'
    };
    return names[key] || key;
}

// Обновление прогресса квестов
function updateQuestsProgress() {
    dailyQuests.trade3.progress = Math.min(tradeHistory.length, dailyQuests.trade3.target);
    
    if (dailyQuests.trade3.progress >= dailyQuests.trade3.target && !dailyQuests.trade3.completed) {
        dailyQuests.trade3.completed = true;
        balance += dailyQuests.trade3.reward;
        userXP += dailyQuests.trade3.xp;
        showNotification(`Квест выполнен: 3 сделки! +$${dailyQuests.trade3.reward}`, 'success');
    }
    
    updateQuestsDisplay();
}

// Обновление UI
function updateUI() {
    updateBalanceDisplay();
    updatePortfolioDisplay();
    updateTradeHistory();
    updateTradingInfo();
    updateAchievementsDisplay();
    updateQuestsDisplay();
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
            const assetValue = portfolio[asset] * getCurrentPrice(); // Упрощенный расчет
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
    
    const feesDisplay = document.querySelector('.trading-fees-display');
    if (feesDisplay) {
        feesDisplay.textContent = `Комиссия: ${tradingFees}% | Спред: ${spread}% | Плечо: ${leverage}x`;
    }
}

// Обновление достижений
function updateAchievementsDisplay() {
    const achievementsGrid = document.querySelector('.achievements-grid');
    if (!achievementsGrid) return;
    
    let achievementsHTML = '';
    Object.keys(achievements).forEach(key => {
        const achievement = achievements[key];
        achievementsHTML += `
            <div class="achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}">
                <div class="achievement-icon">🏆</div>
                <div class="achievement-title">${getAchievementName(key)}</div>
                <div class="achievement-desc">${achievement.unlocked ? 'Разблокировано' : 'Заблокировано'}</div>
                <div class="achievement-reward">+$${achievement.reward}</div>
            </div>
        `;
    });
    
    achievementsGrid.innerHTML = achievementsHTML;
}

// Обновление квестов
function updateQuestsDisplay() {
    const questsGrid = document.querySelector('.quests-grid');
    if (!questsGrid) return;
    
    let questsHTML = '';
    Object.keys(dailyQuests).forEach(key => {
        const quest = dailyQuests[key];
        const progressPercent = (quest.progress / quest.target) * 100;
        
        questsHTML += `
            <div class="quest-card ${quest.completed ? 'completed' : ''}">
                <div class="quest-title">${getQuestName(key)}</div>
                <div class="quest-desc">Прогресс: ${quest.progress}/${quest.target}</div>
                <div class="quest-progress">
                    <div class="quest-progress-bar" style="width: ${progressPercent}%"></div>
                </div>
                <div class="quest-reward">Награда: +$${quest.reward}</div>
            </div>
        `;
    });
    
    questsGrid.innerHTML = questsHTML;
}

// Получение названия квеста
function getQuestName(key) {
    const names = {
        trade3: '3 сделки за день',
        useStopLoss: 'Использовать стоп-лосс 5 раз',
        profit5: 'Заработать $5'
    };
    return names[key] || key;
}

// Учитель и AI помощник
function initializeTeacher() {
    // Заполняем словарь терминов
    const dictionaryGrid = document.querySelector('.dictionary-grid');
    if (dictionaryGrid) {
        let dictionaryHTML = '';
        Object.keys(teacherKnowledge.dictionary).forEach(term => {
            dictionaryHTML += `
                <div class="dictionary-term">
                    <span class="term-name">${term}</span>
                    <span class="term-desc">${teacherKnowledge.dictionary[term].substring(0, 50)}...</span>
                </div>
            `;
        });
        dictionaryGrid.innerHTML = dictionaryHTML;
        
        // Добавляем обработчики для терминов
        document.querySelectorAll('.dictionary-term').forEach(term => {
            term.addEventListener('click', function() {
                const termName = this.querySelector('.term-name').textContent;
                showTermDefinition(termName);
            });
        });
    }
    
    // Заполняем уроки
    const lessonsGrid = document.querySelector('.lessons-grid');
    if (lessonsGrid) {
        let lessonsHTML = '';
        Object.keys(teacherKnowledge.lessons).forEach(lessonKey => {
            const lesson = teacherKnowledge.lessons[lessonKey];
            lessonsHTML += `
                <div class="lesson-card" data-lesson="${lessonKey}">
                    <span class="lesson-title">${lesson.title}</span>
                    <span class="lesson-desc">${lesson.content.substring(0, 80)}...</span>
                </div>
            `;
        });
        lessonsGrid.innerHTML = lessonsHTML;
        
        // Добавляем обработчики для уроков
        document.querySelectorAll('.lesson-card').forEach(card => {
            card.addEventListener('click', function() {
                const lessonKey = this.getAttribute('data-lesson');
                showLesson(lessonKey);
            });
        });
    }
}

// Показать определение термина
function showTermDefinition(term) {
    const definition = teacherKnowledge.dictionary[term];
    if (definition) {
        document.getElementById('term-title').textContent = term;
        document.getElementById('term-description').textContent = definition;
        
        // Показываем секцию с определением
        const termSection = document.querySelector('[data-section="term-details"]');
        if (termSection) {
            termSection.style.display = 'block';
        }
    }
}

// Показать урок
function showLesson(lessonKey) {
    const lesson = teacherKnowledge.lessons[lessonKey];
    if (lesson) {
        document.getElementById('term-title').textContent = lesson.title;
        document.getElementById('term-description').textContent = lesson.content;
        
        // Показываем секцию с уроком
        const termSection = document.querySelector('[data-section="term-details"]');
        if (termSection) {
            termSection.style.display = 'block';
        }
    }
}

// Обработка вопроса учителю
function askTeacherQuestion() {
    const questionInput = document.getElementById('teacherQuestion');
    const question = questionInput.value.toLowerCase().trim();
    
    if (!question) {
        showNotification('Введите ваш вопрос', 'warning');
        return;
    }
    
    let answer = null;
    
    // Ищем ответ в базе знаний
    Object.keys(teacherKnowledge.questions).forEach(key => {
        if (question.includes(key)) {
            answer = teacherKnowledge.questions[key];
        }
    });
    
    if (!answer) {
        // Если не нашли точного ответа, ищем по ключевым словам
        const keywords = question.split(' ');
        for (let keyword of keywords) {
            if (keyword.length > 3) { // Игнорируем короткие слова
                Object.keys(teacherKnowledge.questions).forEach(key => {
                    if (key.includes(keyword) && !answer) {
                        answer = teacherKnowledge.questions[key];
                    }
                });
            }
        }
    }
    
    if (!answer) {
        answer = "Хороший вопрос! Рекомендую изучить основы трейдинга в разделе 'Уроки'. Также вы можете спросить о: трейдинге, стоп-лоссе, тейк-профите, индикаторах или управлении рисками.";
    }
    
    // Показываем ответ
    document.getElementById('term-title').textContent = 'Ответ на ваш вопрос';
    document.getElementById('term-description').textContent = answer;
    
    // Показываем секцию с ответом
    const termSection = document.querySelector('[data-section="term-details"]');
    if (termSection) {
        termSection.style.display = 'block';
    }
    
    // Очищаем поле ввода
    questionInput.value = '';
}

// Обработка действий учителя
function handleTeacherAction(action) {
    switch(action) {
        case 'explain-chart':
            showLesson('candles');
            break;
        case 'explain-indicators':
            showLesson('indicators');
            break;
        case 'risk-advice':
            showLesson('risk');
            break;
        case 'trading-strategy':
            showLesson('strategies');
            break;
        case 'market-analysis':
            analyzeCurrentMarket();
            break;
        case 'portfolio-review':
            reviewPortfolio();
            break;
    }
}

// Анализ текущего рынка
function analyzeCurrentMarket() {
    if (currentData.length === 0) {
        showNotification('Загрузите данные графика для анализа', 'warning');
        return;
    }
    
    const latestData = currentData[currentData.length - 1];
    const price = latestData.close;
    const volume = latestData.volume;
    
    // Простой анализ тренда
    let trend = 'боковой';
    if (currentData.length >= 5) {
        const recentPrices = currentData.slice(-5).map(d => d.close);
        const priceChange = recentPrices[4] - recentPrices[0];
        const changePercent = (priceChange / recentPrices[0]) * 100;
        
        if (changePercent > 2) trend = 'бычий';
        else if (changePercent < -2) trend = 'медвежий';
    }
    
    const analysis = `Текущий анализ рынка:
• Цена: $${price.toFixed(2)}
• Тренд: ${trend}
• Объем: ${volume.toFixed(2)}
• Рекомендация: ${getTradingRecommendation(trend)}`;

    document.getElementById('term-title').textContent = 'Анализ рынка';
    document.getElementById('term-description').textContent = analysis;
    
    const termSection = document.querySelector('[data-section="term-details"]');
    if (termSection) {
        termSection.style.display = 'block';
    }
}

// Получение торговой рекомендации
function getTradingRecommendation(trend) {
    switch(trend) {
        case 'бычий':
            return 'Рассмотрите возможность покупки на откатах к поддержке';
        case 'медвежий':
            return 'Рассмотрите возможность продажи на отскоках к сопротивлению';
        default:
            return 'Ожидайте пробой уровня для определения направления';
    }
}

// Обзор портфеля
function reviewPortfolio() {
    const totalValue = Object.keys(portfolio).reduce((sum, asset) => {
        return sum + (portfolio[asset] * getCurrentPrice());
    }, balance);
    
    const review = `Обзор вашего портфеля:
• Общая стоимость: $${totalValue.toFixed(2)}
• Денежные средства: $${balance.toFixed(2)}
• Диверсификация: ${Object.keys(portfolio).filter(a => portfolio[a] > 0).length} активов

Рекомендации:
${getPortfolioRecommendations()}`;

    document.getElementById('term-title').textContent = 'Обзор портфеля';
    document.getElementById('term-description').textContent = review;
    
    const termSection = document.querySelector('[data-section="term-details"]');
    if (termSection) {
        termSection.style.display = 'block';
    }
}

// Рекомендации для портфеля
function getPortfolioRecommendations() {
    const assetsCount = Object.keys(portfolio).filter(a => portfolio[a] > 0).length;
    
    if (assetsCount === 0) {
        return '• Начните с диверсификации портфеля\n• Рассмотрите покупку основных активов\n• Не забывайте про управление рисками';
    } else if (assetsCount < 3) {
        return '• Увеличьте диверсификацию портфеля\n• Добавьте еще 1-2 актива\n• Балансируйте риски';
    } else {
        return '• Хорошая диверсификация\n• Продолжайте мониторить позиции\n• Ребалансируйте при необходимости';
    }
}

// Вспомогательные функции
function toggleSidebar() {
    document.querySelector('.sidebar').classList.toggle('collapsed');
}

function showSection(section) {
    // Скрываем все секции
    document.querySelectorAll('.content-section').forEach(sec => {
        sec.style.display = 'none';
    });
    
    // Показываем выбранную секцию
    const targetSection = document.querySelector(`[data-section="${section}"]`);
    if (targetSection) {
        targetSection.style.display = 'block';
    }
    
    // Обновляем активную кнопку навигации
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-section="${section}"]`).classList.add('active');
}

function showLoading() {
    const overlay = document.querySelector('.loading-overlay');
    if (overlay) {
        overlay.style.display = 'flex';
    }
}

function hideLoading() {
    const overlay = document.querySelector('.loading-overlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
}

function showNotification(message, type = 'info') {
    // Создаем уведомление
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: ${type === 'error' ? '#cf6679' : type === 'success' ? '#00c853' : '#2962ff'};
        color: white;
        border-radius: 8px;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Анимация появления
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Автоматическое скрытие
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Экспорт данных
function exportData() {
    const data = {
        balance: balance,
        portfolio: portfolio,
        tradeHistory: tradeHistory,
        settings: {
            leverage: leverage,
            tradingFees: tradingFees
        }
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = 'trading-data.json';
    link.click();
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
            if (data.portfolio) portfolio = {...portfolio, ...data.portfolio};
            if (data.tradeHistory) tradeHistory = data.tradeHistory;
            if (data.settings) {
                if (data.settings.leverage) leverage = data.settings.leverage;
                if (data.settings.tradingFees) tradingFees = data.settings.tradingFees;
            }
            
            updateUI();
            showNotification('Данные успешно импортированы', 'success');
        } catch (error) {
            showNotification('Ошибка при импорте данных', 'error');
        }
    };
    reader.readAsText(file);
}

// Сброс данных
function resetData() {
    if (confirm('Вы уверены, что хотите сбросить все данные? Это действие нельзя отменить.')) {
        balance = 100.00;
        portfolio = {
            'BTC': 0,
            'ETH': 0, 
            'SOL': 0,
            'ADA': 0,
            'DOT': 0
        };
        tradeHistory = [];
        activeOrders = [];
        
        updateUI();
        showNotification('Данные сброшены', 'info');
    }
}
