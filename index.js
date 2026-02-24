const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');

const app = express();

// إعدادات الحماية
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.disable('x-powered-by');

// حماية من كثرة الطلبات (DDoS)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "تم حظر الـ IP مؤقتاً."
});
app.use(limiter);

// ==========================================
// إعدادات المرور والتشفير
// ==========================================
const PLATFORM_PASSWORD = "123"; // كود الدخول للطلاب
const JWT_SECRET = "FullMark_Secret_Key_Super_Protected_2026"; // مفتاح تشفير الجلسة

// شاشة تسجيل الدخول
app.get('/login', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html dir="rtl">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>تسجيل الدخول - Full Mark</title>
            <style>
                :root { --icy-green: #a8ffd2; --glow: #00ff88; --dark-bg: #05130d; }
                body { margin: 0; background-color: var(--dark-bg); color: white; font-family: 'Segoe UI', Tahoma, Geneva, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; overflow: hidden; }
                .stars-container { position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: -1; }
                .star { position: absolute; background: white; border-radius: 50%; box-shadow: 0 0 5px white; animation: floatUp linear infinite; }
                @keyframes floatUp { 0% { opacity: 0; transform: translateY(100px) scale(0.5); } 50% { opacity: 1; transform: translateY(0) scale(1); } 100% { opacity: 0; transform: translateY(-100px) scale(0.5); } }
                .login-box { background: rgba(255, 255, 255, 0.03); backdrop-filter: blur(15px); border: 1px solid rgba(168, 255, 210, 0.15); border-radius: 20px; padding: 40px; text-align: center; width: 320px; box-shadow: 0 10px 30px rgba(0, 255, 136, 0.1); z-index: 10; }
                h2 { color: var(--icy-green); text-shadow: 0 0 15px var(--glow); margin-bottom: 25px; font-size: 2em; }
                input { width: 90%; padding: 12px; margin-bottom: 20px; border-radius: 10px; border: 1px solid var(--icy-green); background: rgba(0,0,0,0.4); color: white; text-align: center; font-size: 1.1em; outline: none; }
                button { width: 100%; padding: 12px; border-radius: 10px; border: none; background: var(--icy-green); color: #05130d; font-weight: bold; font-size: 1.2em; cursor: pointer; transition: 0.3s; }
                button:hover { box-shadow: 0 0 20px var(--glow); transform: scale(1.05); }
                .error-msg { color: #ff4d4d; font-size: 0.9em; margin-bottom: 15px; display: none; }
            </style>
        </head>
        <body>
            <div class="stars-container" id="stars"></div>
            <div class="login-box">
                <h2>Full Mark</h2>
                <div class="error-msg" id="errorMsg">كود الدخول غير صحيح!</div>
                <form id="loginForm">
                    <input type="password" id="password" placeholder="أدخل كود الدخول" required>
                    <button type="submit">دخول المنصة</button>
                </form>
            </div>
            <script>
                const starsContainer = document.getElementById('stars');
                for(let i=0; i<100; i++) {
                    let star = document.createElement('div'); star.className = 'star';
                    let size = Math.random() * 3 + 1; star.style.width = size + 'px'; star.style.height = size + 'px';
                    star.style.left = Math.random() * 100 + 'vw'; star.style.top = Math.random() * 100 + 'vh';
                    star.style.animationDuration = (Math.random() * 4 + 3) + 's'; star.style.animationDelay = (Math.random() * 5) + 's';
                    starsContainer.appendChild(star);
                }

                document.getElementById('loginForm').addEventListener('submit', async (e) => {
                    e.preventDefault();
                    const password = document.getElementById('password').value;
                    const res = await fetch('/api/login', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ password })
                    });
                    if(res.ok) window.location.href = '/';
                    else document.getElementById('errorMsg').style.display = 'block';
                });
            </script>
        </body>
        </html>
    `);
});

// API التحقق من صحة الدخول
app.post('/api/login', (req, res) => {
    const { password } = req.body;
    if (password === PLATFORM_PASSWORD) {
        const token = jwt.sign({ authorized: true }, JWT_SECRET, { expiresIn: '24h' });
        res.cookie('auth_token', token, { 
            httpOnly: true, 
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000 
        });
        res.status(200).json({ message: 'تم' });
    } else {
        res.status(401).json({ error: 'خطأ' });
    }
});

// وسيط الحماية لمنع الدخول بدون توكن
const checkAuth = (req, res, next) => {
    const token = req.cookies.auth_token;
    if (!token) return res.redirect('/login');
    try {
        jwt.verify(token, JWT_SECRET);
        next();
    } catch (err) {
        res.clearCookie('auth_token');
        return res.redirect('/login');
    }
};

// الصفحة الرئيسية للمنصة
app.get('/', checkAuth, (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html dir="rtl">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>منصة Full Mark</title>
            <style>
                :root { --icy-green: #a8ffd2; --glow: #00ff88; --dark-bg: #05130d; }
                body { margin: 0; background-color: var(--dark-bg); color: white; font-family: 'Segoe UI', Tahoma, Geneva, sans-serif; overflow-x: hidden; user-select: none; }
                .stars-container { position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: -1; overflow: hidden; }
                .star { position: absolute; background: white; border-radius: 50%; box-shadow: 0 0 5px white; animation: floatUp linear infinite; }
                @keyframes floatUp { 0% { opacity: 0; transform: translateY(100px) scale(0.5); } 50% { opacity: 1; transform: translateY(0) scale(1); } 100% { opacity: 0; transform: translateY(-100px) scale(0.5); } }
                header { text-align: center; padding: 40px 20px; background: rgba(168, 255, 210, 0.05); backdrop-filter: blur(10px); border-bottom: 1px solid rgba(168, 255, 210, 0.2); }
                h1 { color: var(--icy-green); text-shadow: 0 0 15px var(--glow); margin: 0; font-size: 3em; }
                p.subtitle { color: #d1f2e0; font-size: 1.1em; margin-top: 10px; }
                .grid-container { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 30px; padding: 40px; max-width: 1300px; margin: auto; }
                .card { background: rgba(255, 255, 255, 0.03); backdrop-filter: blur(15px); border: 1px solid rgba(168, 255, 210, 0.15); border-radius: 20px; padding: 20px; text-align: center; transition: all 0.4s ease; }
                .card:hover { transform: translateY(-10px); border-color: var(--icy-green); box-shadow: 0 10px 30px rgba(0, 255, 136, 0.2); }
                .card img, .card video { width: 100%; border-radius: 12px; margin-bottom: 15px; background: #000; }
                .card h3 { color: var(--icy-green); font-size: 1.3em; margin: 10px 0; }
            </style>
        </head>
        <body oncontextmenu="return false;">
            <div class="stars-container" id="stars"></div>
            <header>
                <h1>Full Mark</h1>
                <p class="subtitle">طريقك للعلامة الكاملة بأسلوب مبتكر</p>
            </header>
            <div class="grid-container" id="content"></div>

            <script>
                const starsContainer = document.getElementById('stars');
                for(let i=0; i<150; i++) {
                    let star = document.createElement('div'); star.className = 'star';
                    let size = Math.random() * 3 + 1; star.style.width = size + 'px'; star.style.height = size + 'px';
                    star.style.left = Math.random() * 100 + 'vw'; star.style.top = Math.random() * 100 + 'vh';
                    star.style.animationDuration = (Math.random() * 4 + 3) + 's'; star.style.animationDelay = (Math.random() * 5) + 's';
                    starsContainer.appendChild(star);
                }

                const dataUrl = 'https://thanwyaplus.vercel.app/organized_output.json';
                const contentDiv = document.getElementById('content');

                fetch(dataUrl)
                    .then(response => response.json())
                    .then(data => {
                        data.forEach((item, index) => {
                            const card = document.createElement('div');
                            card.className = 'card';
                            let mediaContent = item.video_url 
                                ? \`<video controls controlsList="nodownload"><source src="\${item.video_url}" type="video/mp4"></video>\` 
                                : item.image_url ? \`<img src="\${item.image_url}" alt="محتوى">\` 
                                : \`<img src="https://via.placeholder.com/300x200/05130d/a8ffd2?text=Full+Mark">\`;
                            
                            let title = item.title ? item.title : \`المحاضرة رقم \${index + 1}\`;
                            card.innerHTML = \`\${mediaContent}<h3>\${title}</h3>\`;
                            contentDiv.appendChild(card);
                        });
                    })
                    .catch(() => contentDiv.innerHTML = '<h3>حدث خطأ في تحميل البيانات!</h3>');

                document.onkeydown = function(e) {
                    if(e.keyCode == 123 || (e.ctrlKey && e.shiftKey && (e.keyCode == 73 || e.keyCode == 67 || e.keyCode == 74)) || (e.ctrlKey && e.keyCode == 85)) return false;
                }
            </script>
        </body>
        </html>
    `);
});

// التصدير لتعمل على Vercel
module.exports = app;
