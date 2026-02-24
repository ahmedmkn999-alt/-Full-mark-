const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');

const app = express();

// إعدادات الحماية الأساسية
app.use(helmet());
app.use(cors());
app.use(express.json());
app.disable('x-powered-by');

// حماية من كثرة الطلبات (DDoS)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "تم حظر الـ IP مؤقتاً."
});
app.use(limiter);

// الصفحة الرئيسية للمنصة (تفتح مباشرة)
app.get('/', (req, res) => {
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
                
                /* النجوم المتحركة */
                .stars-container { position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: -1; overflow: hidden; }
                .star { position: absolute; background: white; border-radius: 50%; box-shadow: 0 0 5px white; animation: floatUp linear infinite; }
                @keyframes floatUp { 0% { opacity: 0; transform: translateY(100px) scale(0.5); } 50% { opacity: 1; transform: translateY(0) scale(1); } 100% { opacity: 0; transform: translateY(-100px) scale(0.5); } }
                
                /* الهيدر */
                header { text-align: center; padding: 40px 20px; background: rgba(168, 255, 210, 0.05); backdrop-filter: blur(10px); border-bottom: 1px solid rgba(168, 255, 210, 0.2); }
                h1 { color: var(--icy-green); text-shadow: 0 0 15px var(--glow); margin: 0; font-size: 3em; }
                p.subtitle { color: #d1f2e0; font-size: 1.1em; margin-top: 10px; }
                
                /* شبكة العرض (الكروت) */
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
                // توليد النجوم
                const starsContainer = document.getElementById('stars');
                for(let i=0; i<150; i++) {
                    let star = document.createElement('div'); star.className = 'star';
                    let size = Math.random() * 3 + 1; star.style.width = size + 'px'; star.style.height = size + 'px';
                    star.style.left = Math.random() * 100 + 'vw'; star.style.top = Math.random() * 100 + 'vh';
                    star.style.animationDuration = (Math.random() * 4 + 3) + 's'; star.style.animationDelay = (Math.random() * 5) + 's';
                    starsContainer.appendChild(star);
                }

                // سحب البيانات وعرضها
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

                // منع الاختصارات لحماية المحتوى (F12, Ctrl+U, etc.)
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
