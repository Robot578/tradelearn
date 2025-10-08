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
        },
        'macd': {
            title: '📈 MACD индикатор',
            content: `MACD (Moving Average Convergence Divergence) - трендовый индикатор.

Составляющие:
• MACD линия - разница между EMA 12 и EMA 26
• Сигнальная линия - EMA 9 от MACD
• Гистограмма - разница между MACD и сигнальной линией

Сигналы:
• Пересечение MACD выше сигнальной - бычий сигнал
• Пересечение MACD ниже сигнальной - медвежий сигнал
• Дивергенция - расхождение с ценой указывает на возможный разворот

Используйте MACD в сочетании с другими индикаторами.`
        },
        'bollinger': {
            title: '📊 Полосы Боллинджера',
            content: `Полосы Боллинджера показывают волатильность рынка.

Составляющие:
• Средняя линия - SMA 20
• Верхняя полоса - SMA 20 + (2 × стандартное отклонение)
• Нижняя полоса - SMA 20 - (2 × стандартное отклонение)

Сигналы:
• Сужение полос - низкая волатильность, возможен пробой
• Расширение полос - высокая волатильность
• Касание верхней полосы - возможна перекупленность
• Касание нижней полосы - возможна перепроданность
• Отскок от полос - торговля в диапазоне

Полосы Боллинджера хорошо работают в боковом тренде.`
        }
    },

    dictionary: {
        'sma': {
            title: 'SMA (Simple Moving Average)',
            description: 'Простая скользящая средняя - индикатор, показывающий среднюю цену актива за определенный период. Сглаживает ценовые колебания и помогает определить тренд. Чем длиннее период, тем более сглаженной будет линия.'
        },
        'ema': {
            title: 'EMA (Exponential Moving Average)',
            description: 'Экспоненциальная скользящая средняя - похожа на SMA, но придает больший вес последним ценам, что делает ее более чувствительной к недавним изменениям цены. Быстрее реагирует на ценовые движения.'
        },
        'rsi': {
            title: 'RSI (Relative Strength Index)',
            description: 'Индекс относительной силы - осциллятор, измеряющий скорость и изменение ценовых движений. Значения выше 70 указывают на перекупленность, ниже 30 - на перепроданность. Дивергенция RSI с ценой может сигнализировать о развороте.'
        },
        'macd': {
            title: 'MACD (Moving Average Convergence Divergence)',
            description: 'Индикатор, показывающий взаимосвязь между двумя скользящими средними. Помогает определить момент изменения тренда. Состоит из MACD линии, сигнальной линии и гистограммы. Пересечения линий дают торговые сигналы.'
        },
        'bollinger': {
            title: 'Полосы Боллинджера (Bollinger Bands)',
            description: 'Технический индикатор, состоящий из трех линий, который показывает волатильность рынка и потенциальные уровни поддержки и сопротивления. Ширина полос зависит от волатильности - расширяется при высокой волатильности и сужается при низкой.'
        },
        'stoploss': {
            title: 'Stop-Loss (Стоп-Лосс)',
            description: 'Ордер, который автоматически закрывает позицию при достижении определенного уровня убытка. Защищает от больших потерь. Рекомендуется устанавливать стоп-лосс на уровне 1-2% от депозита.'
        },
        'takeprofit': {
            title: 'Take-Profit (Тейк-Профит)',
            description: 'Ордер, который автоматически закрывает позицию при достижении определенного уровня прибыли. Позволяет зафиксировать прибыль. Обычно устанавливается на уровне, где соотношение риск/прибыль составляет 1:2 или более.'
        },
        'leverage': {
            title: 'Кредитное плечо (Leverage)',
            description: 'Торговля с заемными средствами, которая позволяет открывать позиции большего объема при меньшем депозите. Увеличивает как прибыль, так и убытки. Требует осторожного управления рисками.'
        },
        'bullmarket': {
            title: 'Бычий рынок (Bull Market)',
            description: 'Период роста цен на рынке, когда инвесторы настроены оптимистично и ожидают дальнейшего повышения цен. Характеризуется восходящим трендом, высокими объемами покупок и позитивными новостями.'
        },
        'bearmarket': {
            title: 'Медвежий рынок (Bear Market)',
            description: 'Период падения цен на рынке, когда инвесторы настроены пессимистично и ожидают дальнейшего снижения цен. Характеризуется нисходящим трендом, высокими объемами продаж и негативными новостями.'
        },
        'atr': {
            title: 'ATR (Average True Range)',
            description: 'Индикатор волатильности, показывающий средний диапазон изменения цены за определенный период. Помогает определить размер стоп-лосса и тейк-профита. Высокое значение ATR указывает на высокую волатильность.'
        },
        'divergence': {
            title: 'Дивергенция',
            description: 'Расхождение между движением цены и индикатора, часто предвещающее разворот тренда. Бычья дивергенция возникает, когда цена делает новые минимумы, а индикатор - нет. Медвежья - когда цена делает новые максимумы, а индикатор - нет.'
        }
    },

    getSmartAnswer: function(question) {
        question = question.toLowerCase();
        
        if (question.includes('как выбрать') && question.includes('актив')) {
            return "Выбирайте активы с хорошим объемом торгов, изучайте их фундаментальные показатели и следите за новостями. Начинайте с основных криптовалют (BTC, ETH) - они менее волатильны.";
        }
        
        if (question.includes('лучшее время') && question.includes('торг')) {
            return "Лучшее время для торговли зависит от волатильности актива. Криптовалюты часто активны круглосуточно, но наибольшая активность наблюдается во время работы американской и азиатской сессий (14:00-22:00 UTC).";
        }
        
        if (question.includes('сколько') && question.includes('зарабат')) {
            return "Доходность зависит от многих факторов: вашей стратегии, риска, рыночных условий. Реальные ожидания для начинающих: 5-20% в месяц при грамотном подходе. Помните - сохранение капитала важнее высокой доходности!";
        }
        
        if (question.includes('новичк')) {
            return "Новичкам рекомендую: 1) Изучить основы 2) Торговать на демо-счете 3) Начать с маленьких сумм 4) Фокусироваться на обучении, а не на заработке 5) Вести торговый журнал 6) Не рисковать больше 1-2% на сделку";
        }
        
        if (question.includes('ошибк') && question.includes('начина')) {
            return "Частые ошибки новичков: 1) Торговля без стоп-лосса 2) Излишний риск 3) Эмоциональные решения 4) Отсутствие торгового плана 5) Погоня за убытками 6) Слишком частый трейдинг 7) Использование слишком большого кредитного плеча";
        }

        if (question.includes('стратеги')) {
            return "Лучшие стратегии для начинающих: 1) Следование тренду 2) Торговля от уровней поддержки/сопротивления 3) Использование простых индикаторов (SMA, RSI). Начните с одной стратегии и отработайте ее до автоматизма.";
        }

        if (question.includes('эмоци')) {
            return "Эмоции - главный враг трейдера! Контролируйте: 1) Жадность - не увеличивайте риск 2) Страх - следуйте плану 3) Надежда - не держите убыточные позиции 4) Паника - не совершайте импульсных сделок. Используйте торговый план и дисциплину!";
        }
        
        return "Хороший вопрос! Рекомендую изучить эту тему в разделе 'Уроки' или спросите более конкретно. Также можете спросить о: индикаторах, рисках, стратегиях или психологии трейдинга.";
    }
};

// Инициализация приложения
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    initializeWebSocket();
    loadChartData();
    updateUI();
});

// Инициализация приложения
function initializeApp() {
    loadFromLocalStorage();
    initializeChart();
    
    const savedIndicators = localStorage.getItem('tradelearn_indicators');
    if (savedIndicators) {
        indicators = {...indicators, ...JSON.parse(savedIndicators)};
        updateIndicatorCheckboxes();
    }
    
    updateUI();
    updateDataInfo();
}

// Настройка обработчиков событий
function setupEventListeners() {
    // Навигация
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const section = e.currentTarget.dataset.section;
            showSection(section);
        });
    });
    
    // Закрытие секций
    document.querySelectorAll('.close-section').forEach(btn => {
        btn.addEventListener('click', () => {
            hideAllSections();
        });
    });
    
    // Переключение сайдбара
    document.getElementById('sidebar-toggle').addEventListener('click', toggleSidebar);
    
    // Выбор актива
    document.getElementById('asset-select').addEventListener('change', (e) => {
        switchAsset(e.target.value);
    });
    
    // Таймфреймы
    document.querySelectorAll('.timeframe-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.timeframe-btn').forEach(b => b.classList.remove('active'));
            e.currentTarget.classList.add('active');
            switchTimeframe(e.currentTarget.dataset.tf);
        });
    });
    
    // Индикаторы
    document.getElementById('sma-toggle').addEventListener('change', toggleIndicator);
    document.getElementById('ema-toggle').addEventListener('change', toggleIndicator);
    document.getElementById('rsi-toggle').addEventListener('change', toggleIndicator);
    document.getElementById('macd-toggle').addEventListener('change', toggleIndicator);
    document.getElementById('bollinger-toggle').addEventListener('change', toggleIndicator);
    
    // Торговля
    document.getElementById('buy-btn').addEventListener('click', () => executeTrade('buy'));
    document.getElementById('sell-btn').addEventListener('click', () => executeTrade('sell'));
    document.getElementById('buy-max-btn').addEventListener('click', buyMax);
    
    // Быстрые кнопки
    document.querySelectorAll('.quick-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const percent = parseInt(e.target.dataset.percent);
            setTradeAmountByPercent(percent);
        });
    });
    
    // Тип ордера в торговле
    document.getElementById('order-type-select').addEventListener('change', (e) => {
        const limitGroup = document.getElementById('limit-price-group');
        limitGroup.style.display = e.target.value === 'limit' ? 'block' : 'none';
    });
    
    // Риск менеджмент
    document.getElementById('calculate-risk').addEventListener('click', calculateRisk);
    
    // Учитель
    document.getElementById('teacher-hint').addEventListener('click', showTeacherHint);
    document.getElementById('teacher-analysis').addEventListener('click', showTeacherAnalysis);
    document.getElementById('teacher-lesson').addEventListener('click', showTeacherLesson);
    document.getElementById('teacher-dictionary-btn').addEventListener('click', toggleDictionary);
    document.getElementById('ask-question').addEventListener('click', answerQuestion);
    document.getElementById('teacher-question').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') answerQuestion();
    });
    document.getElementById('close-term').addEventListener('click', () => {
        document.getElementById('term-details').style.display = 'none';
    });
    
    // Учитель - уроки
    document.querySelectorAll('.lesson-card').forEach(card => {
        card.addEventListener('click', (e) => {
            const lessonId = e.currentTarget.dataset.lesson;
            showLesson(lessonId);
        });
    });
    
    // Учитель - словарь
    document.querySelectorAll('.dictionary-term').forEach(term => {
        term.addEventListener('click', (e) => {
            const termId = e.currentTarget.dataset.term;
            showTermDefinition(termId);
        });
    });
    
    // Данные
    document.getElementById('export-btn').addEventListener('click', exportData);
    document.getElementById('import-btn').addEventListener('click', () => document.getElementById('import-file').click());
    document.getElementById('import-file').addEventListener('change', importData);
    document.getElementById('backup-btn').addEventListener('click', createBackup);
    document.getElementById('reset-btn').addEventListener('click', resetData);
    
    // Ордера
    document.getElementById('create-order-btn').addEventListener('click', createOrder);
    
    // Управление графиком
    document.getElementById('auto-scale-btn').addEventListener('click', autoScaleChart);
    document.getElementById('reset-chart-btn').addEventListener('click', resetChart);
    
    // Фильтры сигналов
    document.querySelectorAll('.signal-filter').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.signal-filter').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            updateSignalsList([]);
        });
    });
    
    // Вкладки анализа
    document.querySelectorAll('.analysis-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            const tabName = e.target.dataset.tab;
            document.querySelectorAll('.analysis-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            e.target.classList.add('active');
            document.getElementById(`${tabName}-analysis`).classList.add('active');
        });
    });
    
    // Фильтры истории
    document.querySelectorAll('.history-filter').forEach(filter => {
        filter.addEventListener('click', (e) => {
            document.querySelectorAll('.history-filter').forEach(f => f.classList.remove('active'));
            e.target.classList.add('active');
            updateHistoryList();
        });
    });
}

// Инициализация WebSocket для реальных данных
function initializeWebSocket() {
    updateConnectionStatus('connecting');
    
    try {
        const symbol = currentAsset.toLowerCase();
        wsConnection = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol}@kline_${currentTimeframe}`);
        
        wsConnection.onopen = function() {
            updateConnectionStatus('connected');
            showNotification('Подключено', 'Реальные данные Binance подключены', 'success');
        };
        
        wsConnection.onmessage = function(event) {
            const data = JSON.parse(event.data);
            processRealTimeData(data);
        };
        
        wsConnection.onerror = function(error) {
            console.error('WebSocket error:', error);
            updateConnectionStatus('error');
            showNotification('Ошибка подключения', 'Используются симулированные данные', 'error');
        };
        
        wsConnection.onclose = function() {
            updateConnectionStatus('disconnected');
            setTimeout(initializeWebSocket, 5000);
        };
        
    } catch (error) {
        console.error('WebSocket initialization failed:', error);
        updateConnectionStatus('error');
    }
}

// Обработка реальных данных
function processRealTimeData(data) {
    const kline = data.k;
    const newCandle = {
        time: Math.floor(kline.t / 1000),
        open: parseFloat(kline.o),
        high: parseFloat(kline.h),
        low: parseFloat(kline.l),
        close: parseFloat(kline.c),
        volume: parseFloat(kline.v)
    };
    
    // Обновляем текущую цену
    updateCurrentPrice(newCandle);
    
    // Обновляем рыночную статистику
    updateMarketStats(data);
    
    // Анализируем данные для сигналов
    analyzeMarketData(newCandle);
}

// Обновление статуса подключения
function updateConnectionStatus(status) {
    const statusElement = document.getElementById('connection-status');
    statusElement.textContent = getStatusText(status);
    statusElement.className = `connection-status ${status}`;
}

function getStatusText(status) {
    const statusMap = {
        'connected': '✅ Подключено к Binance',
        'connecting': '🔄 Подключение...',
        'disconnected': '❌ Отключено',
        'error': '⚠️ Ошибка подключения'
    };
    return statusMap[status] || 'Неизвестно';
}

// Загрузка исторических данных с Binance
async function loadChartData() {
    showLoading();
    
    try {
        let data;
        
        try {
            data = await fetchHistoricalData();
        } catch (error) {
            console.warn('Real data unavailable, using simulated data:', error);
            data = await simulateChartData();
        }
        
        currentData = data;
        candleSeries.setData(data);
        updateCurrentPrice(data[data.length - 1]);
        calculateIndicators(data);
        analyzeMarketData(data[data.length - 1]);
        
    } catch (error) {
        console.error('Chart data loading error:', error);
        showError('Не удалось загрузить данные графика');
    } finally {
        hideLoading();
    }
}

// Загрузка исторических данных с Binance API
async function fetchHistoricalData() {
    const timeframeMap = {
        '1m': '1m', '5m': '5m', '15m': '15m',
        '1h': '1h', '4h': '4h', '1d': '1d', '1w': '1w'
    };
    
    const interval = timeframeMap[currentTimeframe] || '1h';
    const limit = 500;
    
    const response = await fetch(
        `https://api.binance.com/api/v3/klines?symbol=${currentAsset}&interval=${interval}&limit=${limit}`
    );
    
    if (!response.ok) {
        throw new Error('Binance API error');
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
}

// Симуляция данных (резервный вариант)
async function simulateChartData() {
    return new Promise(resolve => {
        setTimeout(() => {
            const now = Date.now();
            const data = [];
            let price = currentAsset.includes('BTC') ? 50000 : 
                       currentAsset.includes('ETH') ? 3000 :
                       currentAsset.includes('SOL') ? 100 :
                       currentAsset.includes('ADA') ? 0.5 :
                       currentAsset.includes('DOT') ? 7 :
                       currentAsset.includes('BNB') ? 600 :
                       currentAsset.includes('XRP') ? 0.6 : 0.1;
            
            for (let i = 100; i > 0; i--) {
                const time = now - i * 3600000;
                const open = price;
                const change = (Math.random() - 0.5) * (price * 0.02);
                price = price + change;
                const high = Math.max(open, price) + Math.random() * (price * 0.01);
                const low = Math.min(open, price) - Math.random() * (price * 0.01);
                const close = price;
                
                data.push({
                    time: Math.floor(time / 1000),
                    open: open,
                    high: high,
                    low: low,
                    close: close,
                    volume: Math.random() * 1000
                });
            }
            resolve(data);
        }, 1000);
    });
}

// Инициализация графика
function initializeChart() {
    const chartContainer = document.getElementById('candleChart');
    
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
        height: chartContainer.clientHeight,
    });
    
    // Свечная серия
    candleSeries = chart.addCandlestickSeries({
        upColor: '#00c853',
        downColor: '#ff5252',
        borderDownColor: '#ff5252',
        borderUpColor: '#00c853',
        wickDownColor: '#ff5252',
        wickUpColor: '#00c853',
    });
    
    // SMA
    smaSeries = chart.addLineSeries({
        color: '#2962ff',
        lineWidth: 2,
        title: 'SMA 20',
    });
    
    // EMA
    emaSeries = chart.addLineSeries({
        color: '#ff6d00',
        lineWidth: 2,
        title: 'EMA 12',
    });
    
    // RSI
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
    
    // Ресайз
    new ResizeObserver(entries => {
        if (entries.length === 0) return;
        const { width, height } = entries[0].contentRect;
        chart.applyOptions({ width, height });
    }).observe(chartContainer);
}

// Рассчитать индикаторы
function calculateIndicators(data) {
    // SMA 20
    if (indicators.sma) {
        const smaData = calculateSMA(data, 20);
        smaSeries.setData(smaData);
    }
    
    // EMA 12
    if (indicators.ema) {
        const emaData = calculateEMA(data, 12);
        emaSeries.setData(emaData);
    }
    
    // RSI 14
    if (indicators.rsi) {
        const rsiData = calculateRSI(data, 14);
        rsiSeries.setData(rsiData);
    }
    
    // Обновляем видимость
    updateIndicatorsVisibility();
}

// Расчет SMA
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

// Расчет EMA
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

// Расчет RSI
function calculateRSI(data, period) {
    const result = [];
    let gains = 0;
    let losses = 0;
    
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

// Обновить видимость индикаторов
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

// Переключение индикатора
function toggleIndicator(e) {
    const indicator = e.target.id.replace('-toggle', '');
    indicators[indicator] = e.target.checked;
    
    if (currentData.length > 0) {
        calculateIndicators(currentData);
    }
    saveIndicatorsToLocalStorage();
}

// Обновить чекбоксы индикаторов
function updateIndicatorCheckboxes() {
    document.getElementById('sma-toggle').checked = indicators.sma;
    document.getElementById('ema-toggle').checked = indicators.ema;
    document.getElementById('rsi-toggle').checked = indicators.rsi;
    document.getElementById('macd-toggle').checked = indicators.macd;
    document.getElementById('bollinger-toggle').checked = indicators.bollinger;
}

// Сохранить настройки индикаторов
function saveIndicatorsToLocalStorage() {
    localStorage.setItem('tradelearn_indicators', JSON.stringify(indicators));
}

// Показать секцию
function showSection(sectionId) {
    hideAllSections();
    const section = document.getElementById(`${sectionId}-section`);
    if (section) {
        section.style.display = 'block';
    }
}

// Скрыть все секции
function hideAllSections() {
    document.querySelectorAll('.content-section').forEach(section => {
        section.style.display = 'none';
    });
}

// Переключение сайдбара
function toggleSidebar() {
    document.querySelector('.sidebar').classList.toggle('collapsed');
}

// Показать загрузку
function showLoading() {
    document.getElementById('chartLoadingOverlay').style.display = 'flex';
}

// Скрыть загрузку
function hideLoading() {
    document.getElementById('chartLoadingOverlay').style.display = 'none';
}

// Показать ошибку
function showError(message) {
    showNotification('Ошибка', message, 'error');
}

// Обновить текущую цену
function updateCurrentPrice(bar) {
    const priceElement = document.getElementById('current-price');
    const changeElement = document.getElementById('price-change');
    
    const prevPrice = currentData.length > 1 ? currentData[currentData.length - 2].close : bar.open;
    const change = ((bar.close - prevPrice) / prevPrice) * 100;
    
    priceElement.textContent = bar.close.toFixed(2);
    changeElement.textContent = `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`;
    changeElement.className = `price-change ${change >= 0 ? 'positive' : 'negative'}`;
}

// Обновить рыночную статистику
function updateMarketStats(data) {
    if (data && data.k) {
        const kline = data.k;
        document.getElementById('volume24h').textContent = formatVolume(parseFloat(kline.v));
        document.getElementById('high24h').textContent = parseFloat(kline.h).toFixed(2);
        document.getElementById('low24h').textContent = parseFloat(kline.l).toFixed(2);
    }
}

function formatVolume(volume) {
    if (volume >= 1000000) {
        return (volume / 1000000).toFixed(2) + 'M';
    } else if (volume >= 1000) {
        return (volume / 1000).toFixed(2) + 'K';
    }
    return volume.toFixed(2);
}

// Показать подсказку
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

// Скрыть подсказку
function hideTooltip() {
    const tooltip = document.getElementById('chart-tooltip');
    if (tooltip) {
        tooltip.style.display = 'none';
    }
}

// Выполнить сделку
function executeTrade(type) {
    const amount = parseFloat(document.getElementById('trade-amount').value);
    const orderType = document.getElementById('order-type-select').value;
    const currentPrice = currentData[currentData.length - 1].close;
    
    if (isNaN(amount) || amount <= 0) {
        showError('Введите корректную сумму');
        return;
    }
    
    let executionPrice = currentPrice;
    if (orderType === 'limit') {
        const limitPrice = parseFloat(document.getElementById('limit-price').value);
        if (isNaN(limitPrice) || limitPrice <= 0) {
            showError('Введите корректную цену лимита');
            return;
        }
        executionPrice = limitPrice;
    }
    
    if (type === 'buy') {
        if (amount > balance) {
            showError('Недостаточно средств');
            return;
        }
        
        const assetAmount = amount / executionPrice;
        const assetSymbol = currentAsset.replace('USDT', '');
        portfolio[assetSymbol] = (portfolio[assetSymbol] || 0) + assetAmount;
        balance -= amount;
        
        tradeHistory.push({
            type: 'buy',
            asset: assetSymbol,
            amount: assetAmount,
            price: executionPrice,
            total: amount,
            timestamp: Date.now(),
            orderType: orderType
        });
        
        showNotification('Покупка', `Куплено ${assetAmount.toFixed(6)} ${assetSymbol} за ${amount.toFixed(2)} USDT`, 'success');
        
    } else if (type === 'sell') {
        const assetSymbol = currentAsset.replace('USDT', '');
        const assetAmount = amount / executionPrice;
        
        if (assetAmount > (portfolio[assetSymbol] || 0)) {
            showError('Недостаточно актива');
            return;
        }
        
        portfolio[assetSymbol] = (portfolio[assetSymbol] || 0) - assetAmount;
        balance += amount;
        
        tradeHistory.push({
            type: 'sell',
            asset: assetSymbol,
            amount: assetAmount,
            price: executionPrice,
            total: amount,
            timestamp: Date.now(),
            orderType: orderType
        });
        
        showNotification('Продажа', `Продано ${assetAmount.toFixed(6)} ${assetSymbol} за ${amount.toFixed(2)} USDT`, 'success');
    }
    
    // Обновляем кривую доходности
    updateEquityCurve();
    
    updateUI();
    saveToLocalStorage();
    checkAchievements();
    showTeacherHint();
}

// Купить на все средства
function buyMax() {
    const currentPrice = currentData[currentData.length - 1].close;
    const maxAmount = balance * 0.95; // Оставляем 5% на комиссии
    document.getElementById('trade-amount').value = maxAmount.toFixed(2);
    executeTrade('buy');
}

// Установить сумму по проценту
function setTradeAmountByPercent(percent) {
    const maxAmount = balance * (percent / 100);
    document.getElementById('trade-amount').value = maxAmount.toFixed(2);
}

// Рассчитать риск
function calculateRisk() {
    const deposit = parseFloat(document.getElementById('risk-deposit').value);
    const riskPercent = parseFloat(document.getElementById('risk-percent').value);
    const entryPrice = parseFloat(document.getElementById('risk-entry').value);
    const stopPrice = parseFloat(document.getElementById('risk-stop').value);
    
    if (isNaN(deposit) || isNaN(riskPercent) || isNaN(entryPrice) || isNaN(stopPrice)) {
        showError('Заполните все поля');
        return;
    }
    
    const riskAmount = deposit * (riskPercent / 100);
    const priceDifference = Math.abs(entryPrice - stopPrice);
    const volume = riskAmount / priceDifference;
    const potentialProfit = volume * (entryPrice * 0.02); // 2% тейк-профит
    const riskRewardRatio = potentialProfit / riskAmount;
    
    document.getElementById('risk-volume').textContent = volume.toFixed(6);
    document.getElementById('risk-amount').textContent = riskAmount.toFixed(2) + ' USDT';
    document.getElementById('risk-profit').textContent = potentialProfit.toFixed(2) + ' USDT';
    document.getElementById('risk-ratio').textContent = riskRewardRatio.toFixed(2);
    
    // Автоматически заполняем поле суммы в торговле
    document.getElementById('trade-amount').value = (volume * entryPrice).toFixed(2);
}

// Показать подсказку учителя
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

// Показать анализ учителя
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

// Показать урок учителя
function showTeacherLesson() {
    const lessons = document.getElementById('teacher-lessons');
    const dictionary = document.getElementById('teacher-dictionary');
    const termDetails = document.getElementById('term-details');
    
    if (lessons.style.display === 'block') {
        lessons.style.display = 'none';
    } else {
        lessons.style.display = 'block';
        dictionary.style.display = 'none';
        termDetails.style.display = 'none';
        document.getElementById('teacher-message').textContent = "Выберите урок для изучения:";
    }
}

// Ответить на вопрос
function answerQuestion() {
    const questionInput = document.getElementById('teacher-question');
    const question = questionInput.value.toLowerCase().trim();
    
    if (!question) return;
    
    let answer = "Извините, я не понял вопрос. Попробуйте спросить о: трейдинге, индикаторах, рисках, стоп-лоссе или тейк-профите.";
    
    // Поиск в базе знаний
    for (const [key, value] of Object.entries(teacherKnowledge.questions)) {
        if (question.includes(key)) {
            answer = value;
            break;
        }
    }
    
    // Специальные ответы
    if (question.includes('привет') || question.includes('здравств')) {
        answer = "Привет! Я ваш учитель по трейдингу. Задавайте вопросы, и я с радостью помогу!";
    }
    
    if (question.includes('спасибо') || question.includes('благодар')) {
        answer = "Пожалуйста! Всегда рад помочь. Удачи в трейдинге! 🚀";
    }
    
    // Умные ответы
    if (answer === "Извините, я не понял вопрос...") {
        answer = teacherKnowledge.getSmartAnswer(question);
    }
    
    document.getElementById('teacher-message').textContent = answer;
    questionInput.value = '';
}

// Показать урок
function showLesson(lessonId) {
    const lesson = teacherKnowledge.lessons[lessonId];
    if (lesson) {
        document.getElementById('teacher-message').innerHTML = `
            <strong>${lesson.title}</strong><br><br>
            ${lesson.content.replace(/\n/g, '<br>')}
        `;
    }
}

// Показать определение термина
function showTermDefinition(termId) {
    const term = teacherKnowledge.dictionary[termId];
    if (term) {
        document.getElementById('term-title').textContent = term.title;
        document.getElementById('term-description').textContent = term.description;
        document.getElementById('term-details').style.display = 'block';
        document.getElementById('teacher-dictionary').style.display = 'none';
    }
}

// Переключить словарь
function toggleDictionary() {
    const dictionary = document.getElementById('teacher-dictionary');
    const lessons = document.getElementById('teacher-lessons');
    const termDetails = document.getElementById('term-details');
    
    if (dictionary.style.display === 'block') {
        dictionary.style.display = 'none';
    } else {
        dictionary.style.display = 'block';
        lessons.style.display = 'none';
        termDetails.style.display = 'none';
    }
}

// Создать ордер
function createOrder() {
    const orderType = document.getElementById('order-type').value;
    const orderPrice = parseFloat(document.getElementById('order-price').value);
    const orderAmount = parseFloat(document.getElementById('order-amount').value);
    
    if (isNaN(orderPrice) || isNaN(orderAmount) || orderPrice <= 0 || orderAmount <= 0) {
        showError('Заполните все поля корректно');
        return;
    }
    
    activeOrders.push({
        type: orderType,
        price: orderPrice,
        amount: orderAmount,
        asset: currentAsset.replace('USDT', ''),
        timestamp: Date.now()
    });
    
    updateOrdersList();
    saveToLocalStorage();
    
    document.getElementById('order-price').value = '';
    document.getElementById('order-amount').value = '';
    
    showNotification('Ордер создан', `${getOrderTypeText(orderType)} ордер на ${orderAmount} по цене ${orderPrice}`, 'success');
}

function getOrderTypeText(type) {
    const types = {
        'STOP': 'Стоп-лосс',
        'TAKE_PROFIT': 'Тейк-профит',
        'STOP_LIMIT': 'Стоп-лимит'
    };
    return types[type] || type;
}

// Обновить список ордеров
function updateOrdersList() {
    const container = document.getElementById('orders-container');
    
    if (activeOrders.length === 0) {
        container.innerHTML = '<div class="empty-orders">Активных ордеров нет</div>';
        return;
    }
    
    container.innerHTML = activeOrders.map((order, index) => `
        <div class="order-item ${order.type.toLowerCase().replace('_', '-')}">
            <div class="order-info">
                <div class="order-type">${getOrderTypeText(order.type)}</div>
                <div class="order-details">
                    ${order.asset} | Цена: ${order.price.toFixed(2)} | Объем: ${order.amount.toFixed(6)}
                </div>
            </div>
            <div class="order-actions">
                <button class="order-cancel-btn" onclick="cancelOrder(${index})">Отмена</button>
            </div>
        </div>
    `).join('');
}

// Отменить ордер
function cancelOrder(index) {
    activeOrders.splice(index, 1);
    updateOrdersList();
    saveToLocalStorage();
    showNotification('Ордер отменен', 'Ордер успешно удален', 'warning');
}

// Анализ рыночных данных для сигналов
function analyzeMarketData(currentCandle) {
    if (currentData.length < 20) return;
    
    const signals = [];
    
    // Анализ RSI
    if (document.getElementById('rsi-signals').checked) {
        const rsiSignals = analyzeRSI();
        signals.push(...rsiSignals);
    }
    
    // Анализ MACD
    if (document.getElementById('macd-signals').checked) {
        const macdSignals = analyzeMACD();
        signals.push(...macdSignals);
    }
    
    // Анализ Боллинджера
    if (document.getElementById('bollinger-signals').checked) {
        const bollingerSignals = analyzeBollinger();
        signals.push(...bollingerSignals);
    }
    
    // Обновляем список сигналов
    updateSignalsList(signals);
    
    // Обновляем анализ рынка
    updateMarketAnalysis();
}

// Анализ RSI
function analyzeRSI() {
    const signals = [];
    const rsiData = calculateRSI(currentData, 14);
    
    if (rsiData.length === 0) return signals;
    
    const currentRSI = rsiData[rsiData.length - 1].value;
    document.getElementById('rsi-value').textContent = currentRSI.toFixed(2);
    
    if (currentRSI > 70) {
        signals.push({
            type: 'sell',
            strength: 'high',
            description: `RSI ${currentRSI.toFixed(2)} - Перекупленность`,
            timestamp: Date.now()
        });
    } else if (currentRSI < 30) {
        signals.push({
            type: 'buy',
            strength: 'high',
            description: `RSI ${currentRSI.toFixed(2)} - Перепроданность`,
            timestamp: Date.now()
        });
    } else if (currentRSI > 65) {
        signals.push({
            type: 'warning',
            strength: 'medium',
            description: `RSI ${currentRSI.toFixed(2)} - Приближается к перекупленности`,
            timestamp: Date.now()
        });
    } else if (currentRSI < 35) {
        signals.push({
            type: 'warning',
            strength: 'medium',
            description: `RSI ${currentRSI.toFixed(2)} - Приближается к перепроданности`,
            timestamp: Date.now()
        });
    }
    
    return signals;
}

// Анализ MACD
function analyzeMACD() {
    const signals = [];
    const macdData = calculateMACD(currentData);
    
    if (macdData.length < 2) return signals;
    
    const current = macdData[macdData.length - 1];
    const previous = macdData[macdData.length - 2];
    
    document.getElementById('macd-value').textContent = current.macd.toFixed(4);
    
    if (previous.macd < previous.signal && current.macd > current.signal) {
        signals.push({
            type: 'buy',
            strength: 'medium',
            description: 'MACD пересек сигнальную линию вверх',
            timestamp: Date.now()
        });
    } else if (previous.macd > previous.signal && current.macd < current.signal) {
        signals.push({
            type: 'sell',
            strength: 'medium',
            description: 'MACD пересек сигнальную линию вниз',
            timestamp: Date.now()
        });
    }
    
    return signals;
}

// Анализ Боллинджера
function analyzeBollinger() {
    const signals = [];
    const bollingerData = calculateBollingerBands(currentData, 20, 2);
    
    if (bollingerData.length === 0) return signals;
    
    const current = bollingerData[bollingerData.length - 1];
    const currentPrice = currentData[currentData.length - 1].close;
    
    if (currentPrice > current.upper) {
        signals.push({
            type: 'sell',
            strength: 'medium',
            description: 'Цена выше верхней полосы Боллинджера',
            timestamp: Date.now()
        });
    } else if (currentPrice < current.lower) {
        signals.push({
            type: 'buy',
            strength: 'medium',
            description: 'Цена ниже нижней полосы Боллинджера',
            timestamp: Date.now()
        });
    }
    
    return signals;
}

// Расчет MACD
function calculateMACD(data, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) {
    const closes = data.map(d => d.close);
    const fastEMA = calculateEMAValues(closes, fastPeriod);
    const slowEMA = calculateEMAValues(closes, slowPeriod);
    
    const macdLine = fastEMA.map((fast, i) => fast - slowEMA[i]);
    const signalLine = calculateEMAValues(macdLine, signalPeriod);
    
    return macdLine.map((macd, i) => ({
        macd: macd,
        signal: signalLine[i],
        histogram: macd - signalLine[i]
    }));
}

// Расчет EMA для массива значений
function calculateEMAValues(data, period) {
    const k = 2 / (period + 1);
    const ema = [data[0]];
    
    for (let i = 1; i < data.length; i++) {
        ema.push(data[i] * k + ema[i - 1] * (1 - k));
    }
    
    return ema;
}

// Расчет полос Боллинджера
function calculateBollingerBands(data, period = 20, stdDevMultiplier = 2) {
    const result = [];
    
    for (let i = period - 1; i < data.length; i++) {
        const slice = data.slice(i - period + 1, i + 1).map(d => d.close);
        const mean = slice.reduce((a, b) => a + b, 0) / period;
        const variance = slice.reduce((acc, price) => acc + Math.pow(price - mean, 2), 0) / period;
        const stdDev = Math.sqrt(variance);
        
        result.push({
            middle: mean,
            upper: mean + (stdDev * stdDevMultiplier),
            lower: mean - (stdDev * stdDevMultiplier)
        });
    }
    
    return result;
}

// Обновление списка сигналов
function updateSignalsList(signals) {
    const signalsList = document.getElementById('signals-list');
    const activeFilter = document.querySelector('.signal-filter.active').dataset.type;
    
    tradingSignals = [...signals, ...tradingSignals].slice(0, 50);
    
    if (tradingSignals.length === 0) {
        signalsList.innerHTML = '<div class="empty-signals">Сигналы появятся здесь</div>';
        return;
    }
    
    const filteredSignals = activeFilter === 'all' 
        ? tradingSignals 
        : tradingSignals.filter(s => s.type === activeFilter);
    
    signalsList.innerHTML = filteredSignals.map(signal => `
        <div class="signal-item ${signal.type}">
            <div class="signal-info">
                <div class="signal-type">${getSignalTypeText(signal.type)}</div>
                <div class="signal-desc">${signal.description}</div>
                <div class="signal-time">${new Date(signal.timestamp).toLocaleTimeString()}</div>
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

// Обновление анализа рынка
function updateMarketAnalysis() {
    if (currentData.length < 20) return;
    
    updateTrendAnalysis();
    updateVolatilityAnalysis();
    updateSupportResistance();
    updateSentimentAnalysis();
}

function updateTrendAnalysis() {
    const prices = currentData.map(d => d.close);
    
    if (prices.length < 50) return;
    
    const shortMA = calculateSMA(currentData, 10);
    const longMA = calculateSMA(currentData, 50);
    
    if (shortMA.length === 0 || longMA.length === 0) return;
    
    const currentShort = shortMA[shortMA.length - 1].value;
    const currentLong = longMA[longMA.length - 1].value;
    
    let trend = 'Боковой';
    let strength = 'Слабый';
    
    if (currentShort > currentLong) {
        trend = 'Восходящий';
        strength = currentShort - currentLong > currentLong * 0.02 ? 'Сильный' : 'Средний';
    } else if (currentShort < currentLong) {
        trend = 'Нисходящий';
        strength = currentLong - currentShort > currentLong * 0.02 ? 'Сильный' : 'Средний';
    }
    
    document.getElementById('current-trend').textContent = trend;
    document.getElementById('trend-strength').textContent = strength;
    
    // Простой ADX расчет
    const adx = calculateSimpleADX();
    document.getElementById('adx-value').textContent = adx.toFixed(2);
}

function calculateSimpleADX() {
    // Упрощенный расчет ADX
    if (currentData.length < 14) return 25;
    
    let sumPositive = 0;
    let sumNegative = 0;
    
    for (let i = 1; i < 14; i++) {
        const change = currentData[currentData.length - i].close - currentData[currentData.length - i - 1].close;
        if (change > 0) sumPositive += change;
        else sumNegative += Math.abs(change);
    }
    
    const dx = Math.abs(sumPositive - sumNegative) / (sumPositive + sumNegative) * 100;
    return Math.min(dx * 1.5, 60); // Нормализуем к реалистичным значениям
}

function updateVolatilityAnalysis() {
    const atr = calculateATR(currentData, 14);
    const volatility = (atr / currentData[currentData.length - 1].close) * 100;
    
    document.getElementById('atr-value').textContent = atr.toFixed(4);
    document.getElementById('daily-volatility').textContent = volatility.toFixed(2) + '%';
    
    // Стандартное отклонение
    const recentPrices = currentData.slice(-20).map(d => d.close);
    const mean = recentPrices.reduce((a, b) => a + b, 0) / recentPrices.length;
    const stdDev = Math.sqrt(recentPrices.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / recentPrices.length);
    document.getElementById('std-dev').textContent = stdDev.toFixed(4);
    
    // Бета коэффициент (упрощенный)
    document.getElementById('beta-value').textContent = (volatility / 10).toFixed(2);
}

function calculateATR(data, period = 14) {
    if (data.length < period + 1) return 0;
    
    let sumTR = 0;
    
    for (let i = 1; i <= period; i++) {
        const high = data[data.length - i].high;
        const low = data[data.length - i].low;
        const prevClose = data[data.length - i - 1].close;
        
        const tr = Math.max(
            high - low,
            Math.abs(high - prevClose),
            Math.abs(low - prevClose)
        );
        sumTR += tr;
    }
    
    return sumTR / period;
}

function updateSupportResistance() {
    const recentData = currentData.slice(-50);
    const highs = recentData.map(d => d.high);
    const lows = recentData.map(d => d.low);
    
    const resistance = Math.max(...highs);
    const support = Math.min(...lows);
    const currentClose = recentData[recentData.length - 1].close;
    const pivot = (resistance + support + currentClose) / 3;
    
    const r1 = 2 * pivot - support;
    const s1 = 2 * pivot - resistance;
    
    document.getElementById('resistance-level').textContent = resistance.toFixed(2);
    document.getElementById('support-level').textContent = support.toFixed(2);
    document.getElementById('pivot-level').textContent = pivot.toFixed(2);
    document.getElementById('r1-level').textContent = r1.toFixed(2);
    document.getElementById('s1-level').textContent = s1.toFixed(2);
}

function updateSentimentAnalysis() {
    // Упрощенный анализ сентимента на основе последних движений
    const recentChanges = [];
    for (let i = 1; i <= 5; i++) {
        if (currentData.length > i) {
            const change = ((currentData[currentData.length - i].close - currentData[currentData.length - i - 1].close) / 
                           currentData[currentData.length - i - 1].close) * 100;
            recentChanges.push(change);
        }
    }
    
    const positiveChanges = recentChanges.filter(change => change > 0).length;
    const sentiment = positiveChanges >= 3 ? 'Бычий' : positiveChanges <= 1 ? 'Медвежий' : 'Нейтральный';
    
    document.getElementById('overall-sentiment').textContent = sentiment;
    document.getElementById('buyer-strength').textContent = positiveChanges + '/5';
    document.getElementById('seller-strength').textContent = (5 - positiveChanges) + '/5';
    
    let recommendation = 'Наблюдайте';
    if (sentiment === 'Бычий') recommendation = 'Рассмотрите покупку';
    else if (sentiment === 'Медвежий') recommendation = 'Рассмотрите продажу';
    
    document.getElementById('sentiment-recommendation').textContent = recommendation;
}

// Уведомления
function showNotification(title, message, type = 'info') {
    const container = document.getElementById('notification-container');
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-header">
            <div class="notification-title">${title}</div>
            <button class="notification-close">✕</button>
        </div>
        <div class="notification-message">${message}</div>
    `;
    
    container.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
    
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.remove();
    });
}

// Управление графиком
function autoScaleChart() {
    chart.timeScale().fitContent();
    showNotification('Масштаб', 'График автоматически масштабирован', 'info');
}

function resetChart() {
    chart.timeScale().resetTimeScale();
    showNotification('Сброс', 'Масштаб графика сброшен', 'info');
}

// Смена актива
function switchAsset(newAsset) {
    currentAsset = newAsset;
    
    if (wsConnection) {
        wsConnection.close();
    }
    
    document.getElementById('current-asset').textContent = newAsset.replace('USDT', '/USDT');
    loadChartData();
    initializeWebSocket();
}

// Смена таймфрейма
function switchTimeframe(newTimeframe) {
    currentTimeframe = newTimeframe;
    
    if (wsConnection) {
        wsConnection.close();
    }
    
    loadChartData();
    initializeWebSocket();
}

// Обновление интерфейса
function updateUI() {
    // Баланс
    document.getElementById('balance').textContent = balance.toFixed(2) + ' USDT';
    
    // Портфель
    document.getElementById('btc-amount').textContent = portfolio.BTC.toFixed(6);
    document.getElementById('eth-amount').textContent = portfolio.ETH.toFixed(6);
    document.getElementById('sol-amount').textContent = portfolio.SOL.toFixed(6);
    document.getElementById('ada-amount').textContent = portfolio.ADA.toFixed(6);
    document.getElementById('dot-amount').textContent = portfolio.DOT.toFixed(6);
    document.getElementById('bnb-amount').textContent = portfolio.BNB.toFixed(6);
    
    // Общая стоимость
    const currentPrice = currentData.length > 0 ? currentData[currentData.length - 1].close : 0;
    const totalValue = calculateTotalPortfolioValue(currentPrice);
    document.getElementById('total-value').textContent = totalValue.toFixed(2) + ' USDT';
    
    // История
    updateHistoryList();
    
    // Ордера
    updateOrdersList();
    
    // Статистика
    updateStatistics();
    
    // Данные
    updateDataInfo();
}

function calculateTotalPortfolioValue(currentPrice) {
    let total = balance;
    const priceMultipliers = {
        'BTC': 1,
        'ETH': 0.06, // Примерное соотношение цен
        'SOL': 0.002,
        'ADA': 0.00001,
        'DOT': 0.0001,
        'BNB': 0.012,
        'XRP': 0.00002,
        'DOGE': 0.000001
    };
    
    for (const [asset, amount] of Object.entries(portfolio)) {
        if (amount > 0 && priceMultipliers[asset]) {
            total += amount * currentPrice * priceMultipliers[asset];
        }
    }
    
    return total;
}

// Обновить историю сделок
function updateHistoryList() {
    const container = document.getElementById('history-items');
    const activeFilter = document.querySelector('.history-filter.active').dataset.filter;
    
    if (tradeHistory.length === 0) {
        container.innerHTML = '<div class="empty-history">Сделок пока нет</div>';
        return;
    }
    
    let filteredHistory = tradeHistory;
    
    if (activeFilter === 'buy') {
        filteredHistory = tradeHistory.filter(t => t.type === 'buy');
    } else if (activeFilter === 'sell') {
        filteredHistory = tradeHistory.filter(t => t.type === 'sell');
    } else if (activeFilter === 'profit') {
        filteredHistory = tradeHistory.filter(t => {
            if (t.type === 'buy') return false;
            // Для продаж определяем прибыльность
            const buyTrades = tradeHistory.filter(bt => 
                bt.type === 'buy' && bt.asset === t.asset && bt.timestamp < t.timestamp
            );
            if (buyTrades.length === 0) return false;
            const avgBuyPrice = buyTrades.reduce((sum, bt) => sum + bt.price, 0) / buyTrades.length;
            return t.price > avgBuyPrice;
        });
    } else if (activeFilter === 'loss') {
        filteredHistory = tradeHistory.filter(t => {
            if (t.type === 'buy') return false;
            const buyTrades = tradeHistory.filter(bt => 
                bt.type === 'buy' && bt.asset === t.asset && bt.timestamp < t.timestamp
            );
            if (buyTrades.length === 0) return false;
            const avgBuyPrice = buyTrades.reduce((sum, bt) => sum + bt.price, 0) / buyTrades.length;
            return t.price <= avgBuyPrice;
        });
    }
    
    container.innerHTML = filteredHistory.slice().reverse().map(trade => {
        const isProfit = trade.type === 'sell' && isTradeProfitable(trade);
        return `
            <div class="history-item ${trade.type === 'buy' ? '' : (isProfit ? '' : 'loss')}">
                <div class="history-info">
                    <div class="history-type">${trade.type === 'buy' ? 'Покупка' : 'Продажа'} ${trade.asset}</div>
                    <div class="history-details">
                        ${new Date(trade.timestamp).toLocaleString()} | 
                        Цена: ${trade.price.toFixed(2)} | 
                        Объем: ${trade.amount.toFixed(6)}
                        ${trade.orderType === 'limit' ? ' (Лимит)' : ''}
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

// Обновить статистику
function updateStatistics() {
    const totalTrades = tradeHistory.length;
    const buyTrades = tradeHistory.filter(t => t.type === 'buy').length;
    const sellTrades = tradeHistory.filter(t => t.type === 'sell').length;
    
    const winningTrades = tradeHistory.filter(t => 
        t.type === 'sell' && isTradeProfitable(t)
    ).length;
    
    const winRate = totalTrades > 0 ? (winningTrades / sellTrades * 100) : 0;
    
    const totalProfit = calculateTotalProfit();
    const avgTradeReturn = totalTrades > 0 ? (totalProfit / totalTrades) : 0;
    
    document.getElementById('total-trades').querySelector('.stat-value').textContent = totalTrades;
    document.getElementById('win-rate').querySelector('.stat-value').textContent = winRate.toFixed(1) + '%';
    document.getElementById('total-profit').querySelector('.stat-value').textContent = totalProfit.toFixed(2) + ' USDT';
    document.getElementById('avg-trade').querySelector('.stat-value').textContent = avgTradeReturn.toFixed(2) + '%';
}

function calculateTotalProfit() {
    let profit = 0;
    const assetBalances = {};
    
    tradeHistory.forEach(trade => {
        if (trade.type === 'buy') {
            if (!assetBalances[trade.asset]) {
                assetBalances[trade.asset] = { amount: 0, cost: 0 };
            }
            assetBalances[trade.asset].amount += trade.amount;
            assetBalances[trade.asset].cost += trade.total;
        } else if (trade.type === 'sell') {
            if (assetBalances[trade.asset]) {
                const avgCost = assetBalances[trade.asset].cost / assetBalances[trade.asset].amount;
                const tradeProfit = (trade.price - avgCost) * trade.amount;
                profit += tradeProfit;
                
                assetBalances[trade.asset].amount -= trade.amount;
                assetBalances[trade.asset].cost -= avgCost * trade.amount;
            }
        }
    });
    
    return profit;
}

// Обновить кривую доходности
function updateEquityCurve() {
    const currentEquity = calculateTotalPortfolioValue(currentData[currentData.length - 1].close);
    equityCurve.push(currentEquity);
    
    // Ограничиваем длину массива
    if (equityCurve.length > 100) {
        equityCurve.shift();
    }
}

// Проверка достижений
function checkAchievements() {
    const achievements = document.querySelectorAll('.achievement-card');
    
    achievements.forEach(achievement => {
        const title = achievement.querySelector('.achievement-title').textContent;
        
        if (title === 'Первая сделка' && tradeHistory.length > 0) {
            achievement.classList.remove('locked');
            achievement.classList.add('unlocked');
        }
        
        if (title === 'Профит +10%') {
            const totalValue = calculateTotalPortfolioValue(currentData[currentData.length - 1].close);
            if (totalValue >= 110) {
                achievement.classList.remove('locked');
                achievement.classList.add('unlocked');
            }
        }
        
        if (title === '5 успешных сделок') {
            const successfulTrades = tradeHistory.filter(t => 
                t.type === 'sell' && isTradeProfitable(t)
            ).length;
            if (successfulTrades >= 5) {
                achievement.classList.remove('locked');
                achievement.classList.add('unlocked');
            }
        }
    });
}

// Экспорт данных
function exportData() {
    const data = {
        balance,
        portfolio,
        tradeHistory,
        activeOrders,
        indicators,
        equityCurve,
        version: '1.0',
        exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `tradelearn-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
    showNotification('Экспорт', 'Данные успешно экспортированы', 'success');
}

// Импорт данных
function importData(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            
            if (data.version) {
                balance = data.balance || balance;
                portfolio = data.portfolio || portfolio;
                tradeHistory = data.tradeHistory || tradeHistory;
                activeOrders = data.activeOrders || activeOrders;
                indicators = data.indicators || indicators;
                equityCurve = data.equityCurve || equityCurve;
                
                updateUI();
                updateIndicatorCheckboxes();
                updateIndicatorsVisibility();
                saveToLocalStorage();
                saveIndicatorsToLocalStorage();
                
                showNotification('Импорт', 'Данные успешно импортированы', 'success');
            } else {
                showError('Неверный формат файла');
            }
            
        } catch (error) {
            showError('Ошибка при импорте данных');
        }
    };
    
    reader.readAsText(file);
    event.target.value = '';
}

// Создать бэкап
function createBackup() {
    exportData();
}

// Сброс данных
function resetData() {
    if (confirm('Вы уверены? Все торговые данные будут удалены. Баланс будет сброшен до 100 USDT.')) {
        balance = 100.00;
        portfolio = {
            'BTC': 0, 'ETH': 0, 'SOL': 0, 'ADA': 0, 
            'DOT': 0, 'BNB': 0, 'XRP': 0, 'DOGE': 0
        };
        tradeHistory = [];
        activeOrders = [];
        equityCurve = [100];
        
        updateUI();
        saveToLocalStorage();
        showNotification('Сброс', 'Данные успешно сброшены', 'success');
    }
}

// Обновить информацию о данных
function updateDataInfo() {
    const data = {
        balance,
        portfolio,
        tradeHistory,
        activeOrders
    };
    
    const dataSize = new Blob([JSON.stringify(data)]).size;
    document.getElementById('data-size').textContent = (dataSize / 1024).toFixed(2) + ' KB';
    document.getElementById('last-update').textContent = new Date().toLocaleString();
}

// Сохранить в localStorage
function saveToLocalStorage() {
    const data = {
        balance,
        portfolio,
        tradeHistory,
        activeOrders,
        equityCurve
    };
    
    localStorage.setItem('tradelearn_data', JSON.stringify(data));
    updateDataInfo();
}

// Загрузить из localStorage
function loadFromLocalStorage() {
    const saved = localStorage.getItem('tradelearn_data');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            balance = data.balance || balance;
            portfolio = data.portfolio || portfolio;
            tradeHistory = data.tradeHistory || tradeHistory;
            activeOrders = data.activeOrders || activeOrders;
            equityCurve = data.equityCurve || equityCurve;
        } catch (error) {
            console.error('Ошибка загрузки данных:', error);
        }
    }
}

// Глобальные функции
window.cancelOrder = cancelOrder;

// Инициализация при загрузке
initializeApp();
