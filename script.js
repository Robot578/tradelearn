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

// База знаний учителя
const teacherKnowledge = {
    questions: {
        'что такое трейдинг': 'Трейдинг - это процесс покупки и продажи активов (акций, криптовалют, валют) с целью получения прибыли от изменения их цен.',
        'как начать торговать': 'Начните с изучения основ: технического и фундаментального анализа, управления рисками. Используйте демо-счет для практики.',
        'что такое свечной график': 'Свечной график показывает ценовые движения за определенный период. Каждая свеча показывает цену открытия, закрытия, максимум и минимум.',
        'что такое стоп лосс': 'Стоп-лосс - это ордер, который автоматически закрывает позицию при достижении определенного уровня убытка, чтобы ограничить потери.',
        'что такое тейк профит': 'Тейк-профит - это ордер, который автоматически закрывает позицию при достижении определенного уровня прибыли.',
        'что такое rsi': 'RSI (Relative Strength Index) - индикатор, показывающий перекупленность (выше 70) и перепроданность (ниже 30) рынка.',
        'что такое macd': 'MACD (Moving Average Convergence Divergence) - индикатор, показывающий изменение силы и направления тренда.',
        'что такое боллинджер': 'Полосы Боллинджера - индикатор волатильности, состоящий из трех линий: средней (SMA) и двух стандартных отклонений.',
        'что такое кредитное плечо': 'Кредитное плечо позволяет торговать на суммы, превышающие ваш депозит, увеличивая как потенциальную прибыль, так и убытки.',
        'что такое бычий рынок': 'Бычий рынок - период роста цен, оптимизма и высокого спроса на активы.',
        'что такое медвежий рынок': 'Медвежий рынок - период падения цен, пессимизма и высокого предложения активов.'
    },
    
    lessons: {
        'basics': {
            title: '📖 Основы трейдинга',
            content: `Основные понятия трейдинга:
            
1. **Актив** - то, чем вы торгуете (акции, криптовалюты, валюта)
2. **Лот** - размер позиции
3. **Пункт (пипс)** - минимальное изменение цены
4. **Спред** - разница между ценой покупки и продажи
5. **Маржа** - залог для открытия позиции
6. **Плечо** - множитель торговой позиции
            
Совет: Начинайте с маленьких объемов и всегда используйте стоп-лосс!`
        },
        'candles': {
            title: '🕯️ Свечной анализ',
            content: `Японские свечи - основной инструмент технического анализа:
            
**Строение свечи:**
- Тело (open-close)
- Тени (high-low)
            
**Типы свечей:**
- Бычья (зеленая) - close > open
- Медвежья (красная) - close < open
            
**Паттерны:**
- Молот (разворот вверх)
- Повешенный (разворот вниз)
- Поглощение (смена тренда)
- Доджи (нерешительность)`
        },
        'indicators': {
            title: '📊 Индикаторы',
            content: `Основные индикаторы технического анализа:
            
**Трендовые:**
- SMA (простая скользящая средняя)
- EMA (экспоненциальная скользящая)
- MACD (схождение/расхождение)
            
**Осцилляторы:**
- RSI (индекс относительной силы)
- Stochastic (стохастик)
- CCI (индекс товарного канала)
            
**Волатильность:**
- Полосы Боллинджера
- ATR (средний истинный диапазон)`
        },
        'risk': {
            title: '🛡️ Управление рисками',
            content: `Правила управления рисками:
            
1. **Риск на сделку**: не более 1-2% от депозита
2. **Соотношение риск/прибыль**: минимум 1:2
3. **Стоп-лосс**: обязателен для каждой сделки
4. **Диверсификация**: не вкладывайте все в один актив
5. **Эмоции**: торгуйте по плану, а не на эмоциях
            
Формула расчета объема:
Объем = (Депозит × Риск%) / (Цена входа - Стоп-лосс)`
        },
        'macd': {
            title: '📈 MACD индикатор',
            content: `MACD (Moving Average Convergence Divergence):
            
**Составляющие:**
- MACD линия (12 EMA - 26 EMA)
- Сигнальная линия (9 EMA от MACD)
- Гистограмма (разница между линиями)
            
**Сигналы:**
- Пересечение MACD выше сигнальной - покупка
- Пересечение MACD ниже сигнальной - продажа
- Дивергенция - сильный разворотный сигнал
            
**Настройки**: 12, 26, 9 (стандартные)`
        },
        'bollinger': {
            title: '📊 Полосы Боллинджера',
            content: `Полосы Боллинджера - индикатор волатильности:
            
**Составляющие:**
- Средняя линия (20 SMA)
- Верхняя полоса (SMA + 2σ)
- Нижняя полоса (SMA - 2σ)
            
**Сигналы:**
- Отскок от нижней полосы - покупка
- Отскок от верхней полосы - продажа
- Сужение полос - снижение волатильности
- Расширение полос - рост волатильности
            
**Важно**: 95% цен движутся внутри полос`
        }
    },
    
    dictionary: {
        'sma': {
            title: 'SMA (Simple Moving Average)',
            description: 'Простая скользящая средняя - среднее арифметическое цен за определенный период. Сглаживает ценовые колебания и показывает направление тренда.'
        },
        'ema': {
            title: 'EMA (Exponential Moving Average)',
            description: 'Экспоненциальная скользящая средняя - придает больший вес последним ценам, быстрее реагирует на изменения чем SMA.'
        },
        'rsi': {
            title: 'RSI (Relative Strength Index)',
            description: 'Индекс относительной силы - осциллятор от 0 до 100. Выше 70 - перекупленность, ниже 30 - перепроданность.'
        },
        'macd': {
            title: 'MACD',
            description: 'Moving Average Convergence Divergence - показывает взаимосвязь между двумя скользящими средними. Состоит из MACD линии, сигнальной линии и гистограммы.'
        },
        'bollinger': {
            title: 'Полосы Боллинджера',
            description: 'Bollinger Bands - состоят из средней SMA и двух полос на расстоянии 2 стандартных отклонений. Показывают волатильность и уровни перекупленности/перепроданности.'
        },
        'stoploss': {
            title: 'Stop-Loss',
            description: 'Стоп-лосс - ордер для автоматического закрытия позиции при достижении определенного уровня убытков. Обязателен для управления рисками.'
        },
        'takeprofit': {
            title: 'Take-Profit', 
            description: 'Тейк-профит - ордер для автоматического закрытия позиции при достижении определенного уровня прибыли. Помогает фиксировать прибыль.'
        },
        'leverage': {
            title: 'Кредитное плечо',
            description: 'Leverage - позволяет торговать объемами, превышающими ваш депозит. Увеличивает как прибыль, так и убытки. Используйте осторожно!'
        },
        'bullmarket': {
            title: 'Бычий рынок',
            description: 'Bull Market - период роста цен, оптимизма инвесторов и экономического роста. Характеризуется восходящим трендом.'
        },
        'bearmarket': {
            title: 'Медвежий рынок',
            description: 'Bear Market - период падения цен, пессимизма и экономического спада. Характеризуется нисходящим трендом.'
        },
        'atr': {
            title: 'ATR (Average True Range)',
            description: 'Средний истинный диапазон - индикатор волатильности. Показывает средний диапазон движения цены за определенный период.'
        },
        'divergence': {
            title: 'Дивергенция',
            description: 'Расхождение между движением цены и индикатора. Бычья дивергенция - цена делает новые минимумы, а индикатор - нет. Медвежья - наоборот.'
        }
    }
};

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
        // Создаем график
        chart = LightweightCharts.createChart(chartContainer, {
            width: chartContainer.clientWidth,
            height: 400,
            layout: {
                backgroundColor: '#1e1e1e',
                textColor: '#d1d4dc',
            },
            grid: {
                vertLines: {
                    color: '#2b2b43',
                },
                horzLines: {
                    color: '#2b2b43',
                },
            },
            crosshair: {
                mode: LightweightCharts.CrosshairMode.Normal,
            },
            rightPriceScale: {
                borderColor: '#485c7b',
            },
            timeScale: {
                borderColor: '#485c7b',
                timeVisible: true,
                secondsVisible: false,
            },
            handleScroll: {
                mouseWheel: true,
                pressedMouseMove: true,
            },
            handleScale: {
                axisPressedMouseMove: true,
                mouseWheel: true,
                pinch: true,
            },
        });

        // Создаем свечную серию
        candleSeries = chart.addCandlestickSeries({
            upColor: '#26a69a',
            downColor: '#ef5350',
            borderDownColor: '#ef5350',
            borderUpColor: '#26a69a',
            wickDownColor: '#ef5350',
            wickUpColor: '#26a69a',
        });

        // Создаем серии для индикаторов
        smaSeries = chart.addLineSeries({
            color: '#2962FF',
            lineWidth: 1,
            title: 'SMA 20',
        });

        emaSeries = chart.addLineSeries({
            color: '#FF6B6B',
            lineWidth: 1,
            title: 'EMA 12',
        });

        // Создаем график для RSI
        const rsiChart = LightweightCharts.createChart(document.createElement('div'), {
            width: chartContainer.clientWidth,
            height: 150,
            layout: {
                backgroundColor: '#1e1e1e',
                textColor: '#d1d4dc',
            },
            grid: {
                vertLines: {
                    color: '#2b2b43',
                },
                horzLines: {
                    color: '#2b2b43',
                },
            },
            rightPriceScale: {
                borderColor: '#485c7b',
            },
            timeScale: {
                borderColor: '#485c7b',
                timeVisible: true,
                secondsVisible: false,
            },
        });

        rsiSeries = rsiChart.addLineSeries({
            color: '#FF9800',
            lineWidth: 1,
            title: 'RSI 14',
        });

        // Обработчик изменения размера
        window.addEventListener('resize', function() {
            chart.applyOptions({
                width: chartContainer.clientWidth,
            });
        });

        console.log('График успешно инициализирован');
        
        // Генерируем тестовые данные для демонстрации
        generateSampleData();
        
    } catch (error) {
        console.error('Ошибка при инициализации графика:', error);
        showNotification('Ошибка загрузки графика', 'error');
    }
}

function generateSampleData() {
    console.log('Генерация тестовых данных...');
    
    const sampleData = [];
    let basePrice = 50000;
    const now = new Date();
    
    for (let i = 100; i >= 0; i--) {
        const time = new Date(now);
        time.setMinutes(time.getMinutes() - i * 60);
        
        const open = basePrice;
        const change = (Math.random() - 0.5) * 1000;
        const close = open + change;
        const high = Math.max(open, close) + Math.random() * 500;
        const low = Math.min(open, close) - Math.random() * 500;
        
        sampleData.push({
            time: Math.floor(time.getTime() / 1000),
            open: open,
            high: high,
            low: low,
            close: close,
        });
        
        basePrice = close;
    }
    
    currentData = sampleData;
    
    // Обновляем график
    if (candleSeries) {
        candleSeries.setData(sampleData);
        calculateIndicators();
    }
    
    // Обновляем текущую цену
    updateCurrentPrice(sampleData[sampleData.length - 1]);
    
    console.log('Тестовые данные сгенерированы');
}

function calculateIndicators() {
    if (!currentData.length) return;
    
    // SMA 20
    const smaData = [];
    for (let i = 19; i < currentData.length; i++) {
        let sum = 0;
        for (let j = i - 19; j <= i; j++) {
            sum += currentData[j].close;
        }
        smaData.push({
            time: currentData[i].time,
            value: sum / 20
        });
    }
    
    if (indicators.sma && smaSeries) {
        smaSeries.setData(smaData);
    }
    
    // EMA 12
    const emaData = [];
    const multiplier = 2 / (12 + 1);
    let ema = currentData[0].close;
    
    emaData.push({
        time: currentData[0].time,
        value: ema
    });
    
    for (let i = 1; i < currentData.length; i++) {
        ema = (currentData[i].close - ema) * multiplier + ema;
        emaData.push({
            time: currentData[i].time,
            value: ema
        });
    }
    
    if (indicators.ema && emaSeries) {
        emaSeries.setData(emaData);
    }
}

function updateCurrentPrice(latestCandle) {
    const priceElement = document.getElementById('current-price');
    const changeElement = document.getElementById('price-change');
    
    if (priceElement && changeElement && latestCandle) {
        const price = latestCandle.close;
        const change = ((price - latestCandle.open) / latestCandle.open) * 100;
        
        priceElement.textContent = price.toFixed(2);
        changeElement.textContent = `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`;
        changeElement.style.color = change >= 0 ? 'var(--profit)' : 'var(--loss)';
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
    
    // Переключение таймфреймов
    document.querySelectorAll('.timeframe-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.timeframe-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentTimeframe = this.getAttribute('data-tf');
            loadChartData();
        });
    });
    
    // Выбор актива
    document.getElementById('asset-select').addEventListener('change', function() {
        currentAsset = this.value;
        loadChartData();
    });
    
    // Индикаторы
    document.getElementById('sma-toggle').addEventListener('change', function() {
        indicators.sma = this.checked;
        calculateIndicators();
    });
    
    document.getElementById('ema-toggle').addEventListener('change', function() {
        indicators.ema = this.checked;
        calculateIndicators();
    });
    
    // Кнопки управления графиком
    document.getElementById('auto-scale-btn').addEventListener('click', function() {
        if (chart) {
            chart.timeScale().fitContent();
        }
    });
    
    document.getElementById('reset-chart-btn').addEventListener('click', function() {
        generateSampleData();
        if (chart) {
            chart.timeScale().fitContent();
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
    
    // Быстрые кнопки процентов
    document.querySelectorAll('.quick-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const percent = parseInt(this.getAttribute('data-percent'));
            const amountInput = document.getElementById('trade-amount');
            const maxAmount = balance;
            amountInput.value = (maxAmount * percent / 100).toFixed(2);
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

function loadChartData() {
    console.log(`Загрузка данных для ${currentAsset} на таймфрейме ${currentTimeframe}`);
    
    // Показываем индикатор загрузки
    const loadingOverlay = document.getElementById('chartLoadingOverlay');
    if (loadingOverlay) {
        loadingOverlay.style.display = 'flex';
    }
    
    // Имитация загрузки данных
    setTimeout(() => {
        generateSampleData();
        
        // Скрываем индикатор загрузки
        if (loadingOverlay) {
            loadingOverlay.style.display = 'none';
        }
        
        showNotification(`График обновлен: ${currentAsset} (${currentTimeframe})`, 'success');
    }, 1000);
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
            asset: currentAsset,
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
            asset: currentAsset,
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
                // Для простоты используем текущую цену BTC для всех активов
                const price = currentData[currentData.length - 1].close;
                total += portfolio[asset] * price;
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
    
    historyContainer.innerHTML = tradeHistory.map(trade => `
        <div class="history-item ${trade.type}">
            <div class="trade-info">
                <span class="trade-type">${trade.type === 'buy' ? '🟢 ПОКУПКА' : '🔴 ПРОДАЖА'}</span>
                <span class="trade-asset">${trade.asset}</span>
            </div>
            <div class="trade-details">
                <span>${trade.amount.toFixed(6)}</span>
                <span>${trade.price.toFixed(2)} USDT</span>
                <span>${trade.total.toFixed(2)} USDT</span>
            </div>
            <div class="trade-time">${trade.timestamp}</div>
        </div>
    `).join('');
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
        const wins = tradeHistory.filter(t => t.profit > 0).length;
        const rate = tradeHistory.length > 0 ? (wins / tradeHistory.length * 100) : 0;
        winRate.querySelector('.stat-value').textContent = rate.toFixed(1) + '%';
    }
    
    if (totalProfit) {
        const profit = equityCurve[equityCurve.length - 1] - 100;
        totalProfit.querySelector('.stat-value').textContent = profit.toFixed(2) + ' USDT';
        totalProfit.querySelector('.stat-value').style.color = profit >= 0 ? 'var(--profit)' : 'var(--loss)';
    }
}

function updateEquityChart() {
    // Простая реализация графика доходности
    const equityChart = document.getElementById('equity-chart');
    if (equityChart && equityCurve.length > 1) {
        // Здесь можно добавить реализацию графика с помощью библиотеки
        equityChart.innerHTML = `<div style="padding: 20px; text-align: center; color: var(--text-secondary);">
            График доходности: ${equityCurve[equityCurve.length - 1].toFixed(2)} USDT
        </div>`;
    }
}

function showTeacherHint() {
    const hints = [
        "💡 Обратите внимание на текущий тренд на графике",
        "💡 Используйте стоп-лосс для ограничения убытков",
        "💡 Не рискуйте более 2% депозита в одной сделке",
        "💡 Анализируйте объемы торгов для подтверждения тренда",
        "💡 Следите за уровнями поддержки и сопротивления",
        "💡 Используйте несколько таймфреймов для анализа",
        "💡 Не поддавайтесь эмоциям - торгуйте по плану"
    ];
    
    const randomHint = hints[Math.floor(Math.random() * hints.length)];
    document.getElementById('teacher-message').textContent = randomHint;
}

function showTeacherAnalysis() {
    const latestCandle = currentData[currentData.length - 1];
    const prevCandle = currentData[currentData.length - 2];
    
    if (!latestCandle || !prevCandle) return;
    
    const change = ((latestCandle.close - prevCandle.close) / prevCandle.close) * 100;
    
    let analysis = `📊 Анализ текущей ситуации:
    
Цена: ${latestCandle.close.toFixed(2)} USDT
Изменение: ${change >= 0 ? '+' : ''}${change.toFixed(2)}%
Объем: Анализируйте паттерны...

`;
    
    if (change > 2) {
        analysis += "📈 Сильный восходящий импульс. Возможность для покупки на откате.";
    } else if (change < -2) {
        analysis += "📉 Сильный нисходящий импульс. Рассмотрите продажи на отскоке.";
    } else {
        analysis += "➡️ Боковое движение. Ожидайте пробой уровня для определения направления.";
    }
    
    analysis += "\n\nРекомендация: Используйте стоп-лосс и торгуйте малыми объемами.";
    
    document.getElementById('teacher-message').textContent = analysis;
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
        document.getElementById('teacher-message').textContent = lesson.content;
        document.getElementById('teacher-lessons').style.display = 'none';
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
    
    let answer = null;
    
    // Поиск ответа в базе знаний
    for (const [key, value] of Object.entries(teacherKnowledge.questions)) {
        if (question.includes(key)) {
            answer = value;
            break;
        }
    }
    
    if (!answer) {
        answer = "Пока я не могу ответить на этот вопрос. Попробуйте задать вопрос про основы трейдинга, технический анализ или управление рисками.";
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
        <div class="order-item">
            <div class="order-header">
                <span class="order-type">${getOrderTypeText(order.type)}</span>
                <span class="order-asset">${order.asset}</span>
                <button class="cancel-order" data-id="${order.id}">❌</button>
            </div>
            <div class="order-details">
                <span>Цена: ${order.price.toFixed(2)}</span>
                <span>Объем: ${order.amount.toFixed(6)}</span>
                <span>Создан: ${order.timestamp}</span>
            </div>
        </div>
    `).join('');
    
    // Добавляем обработчики для кнопок отмены
    document.querySelectorAll('.cancel-order').forEach(btn => {
        btn.addEventListener('click', function() {
            const orderId = parseInt(this.getAttribute('data-id'));
            cancelOrder(orderId);
        });
    });
}

function getOrderTypeText(type) {
    const types = {
        'STOP': '🛡️ Стоп-лосс',
        'TAKE_PROFIT': '💰 Тейк-профит',
        'STOP_LIMIT': '🎯 Стоп-лимит'
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
    
    // Обновляем данные для выбранной вкладки
    updateAnalysisData(tabName);
}

function updateAnalysisData(tabName) {
    const latestCandle = currentData[currentData.length - 1];
    if (!latestCandle) return;
    
    switch (tabName) {
        case 'trend':
            updateTrendAnalysis(latestCandle);
            break;
        case 'volatility':
            updateVolatilityAnalysis(latestCandle);
            break;
        case 'support':
            updateSupportAnalysis(latestCandle);
            break;
        case 'sentiment':
            updateSentimentAnalysis(latestCandle);
            break;
    }
}

function updateTrendAnalysis(candle) {
    // Простой анализ тренда на основе последних свечей
    const recentCandles = currentData.slice(-10);
    const ups = recentCandles.filter(c => c.close > c.open).length;
    const downs = recentCandles.length - ups;
    
    document.getElementById('current-trend').textContent = ups > downs ? '📈 Восходящий' : downs > ups ? '📉 Нисходящий' : '➡️ Боковой';
    document.getElementById('current-trend').style.color = ups > downs ? 'var(--profit)' : downs > ups ? 'var(--loss)' : 'var(--text-secondary)';
    
    document.getElementById('trend-strength').textContent = Math.abs(ups - downs) >= 3 ? 'Сильный' : 'Слабый';
    document.getElementById('rsi-value').textContent = '50.0';
    document.getElementById('macd-value').textContent = 'Нейтральный';
    document.getElementById('adx-value').textContent = '25.0';
}

function updateVolatilityAnalysis(candle) {
    // Простой расчет волатильности
    const recentCandles = currentData.slice(-20);
    const highs = recentCandles.map(c => c.high);
    const lows = recentCandles.map(c => c.low);
    const maxHigh = Math.max(...highs);
    const minLow = Math.min(...lows);
    const volatility = ((maxHigh - minLow) / minLow) * 100;
    
    document.getElementById('atr-value').textContent = (volatility / 2).toFixed(2);
    document.getElementById('daily-volatility').textContent = volatility.toFixed(2) + '%';
    document.getElementById('std-dev').textContent = (volatility / 4).toFixed(2);
    document.getElementById('beta-value').textContent = '1.0';
}

function updateSupportAnalysis(candle) {
    // Простые расчеты уровней поддержки/сопротивления
    const recentCandles = currentData.slice(-50);
    const highs = recentCandles.map(c => c.high);
    const lows = recentCandles.map(c => c.low);
    
    const resistance = Math.max(...highs);
    const support = Math.min(...lows);
    const pivot = (resistance + support + candle.close) / 3;
    
    document.getElementById('resistance-level').textContent = resistance.toFixed(2);
    document.getElementById('support-level').textContent = support.toFixed(2);
    document.getElementById('pivot-level').textContent = pivot.toFixed(2);
    document.getElementById('r1-level').textContent = (pivot * 2 - support).toFixed(2);
    document.getElementById('s1-level').textContent = (pivot * 2 - resistance).toFixed(2);
}

function updateSentimentAnalysis(candle) {
    // Простой анализ сентимента
    const change = ((candle.close - candle.open) / candle.open) * 100;
    
    let sentiment = 'Нейтральный';
    let sentimentColor = 'var(--text-secondary)';
    
    if (change > 2) {
        sentiment = 'Бычий';
        sentimentColor = 'var(--profit)';
    } else if (change < -2) {
        sentiment = 'Медвежий';
        sentimentColor = 'var(--loss)';
    }
    
    document.getElementById('overall-sentiment').textContent = sentiment;
    document.getElementById('overall-sentiment').style.color = sentimentColor;
    document.getElementById('buyer-strength').textContent = change > 0 ? 'Сильная' : 'Слабая';
    document.getElementById('seller-strength').textContent = change < 0 ? 'Сильная' : 'Слабая';
    document.getElementById('sentiment-recommendation').textContent = 
        change > 1 ? 'Рассмотреть покупку' : change < -1 ? 'Рассмотреть продажу' : 'Ожидать';
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
            <div class="signal-icon">${signal.type === 'buy' ? '🟢' : signal.type === 'sell' ? '🔴' : '⚠️'}</div>
            <div class="signal-content">
                <div class="signal-title">${signal.title}</div>
                <div class="signal-desc">${signal.description}</div>
                <div class="signal-time">${signal.timestamp}</div>
            </div>
        </div>
    `).join('');
}

function showDetailedStatistics() {
    const stats = `
Общая статистика:
- Всего сделок: ${tradeHistory.length}
- Прибыльных: ${tradeHistory.filter(t => t.profit > 0).length}
- Убыточных: ${tradeHistory.filter(t => t.profit < 0).length}
- Процент побед: ${tradeHistory.length > 0 ? (tradeHistory.filter(t => t.profit > 0).length / tradeHistory.length * 100).toFixed(1) : 0}%
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
        <span class="notification-message">${message}</span>
        <button class="notification-close">×</button>
    `;
    
    container.appendChild(notification);
    
    // Автоматическое удаление через 5 секунд
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
    
    // Закрытие по клику
    notification.querySelector('.notification-close').addEventListener('click', function() {
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 300);
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
            
            showNotification('Данные загружены', 'success');
        } catch (error) {
            console.error('Ошибка загрузки данных:', error);
            showNotification('Ошибка загрузки данных', 'error');
        }
    }
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
    
    // Имитация подключения к рынку
    setTimeout(() => {
        document.getElementById('connection-status').textContent = 'Подключено';
        document.getElementById('connection-status').style.color = 'var(--profit)';
    }, 2000);
}

// Стили для уведомлений (добавляем динамически)
const notificationStyles = `
.notification {
    position: fixed;
    top: 20px;
    right: 20px;
    background: var(--surface);
    border-left: 4px solid var(--primary);
    padding: 15px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    display: flex;
    align-items: center;
    gap: 10px;
    max-width: 300px;
    z-index: 1000;
    animation: slideIn 0.3s ease;
    transition: opacity 0.3s ease;
}

.notification.success {
    border-left-color: var(--profit);
}

.notification.error {
    border-left-color: var(--loss);
}

.notification.warning {
    border-left-color: var(--warning);
}

.notification-close {
    background: none;
    border: none;
    color: var(--text-secondary);
    cursor: pointer;
    font-size: 18px;
    padding: 0;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.notification-close:hover {
    color: var(--text);
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
