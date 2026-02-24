const express = require('express');
const helmet = require('helmet');
const cors = require('cors');

const app = express();

// إعدادات الحماية (تم تعديلها للسماح بعرض الفيديوهات الخارجية)
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json());
app.disable('x-powered-by');

// ==========================================
// 🔴 الكوبري (Proxy): السيرفر بتاعك هو اللي هيسحب البيانات
// ==========================================
app.get('/api/scrape', async (req, res) => {
    try {
        // السيرفر بيقوم بجلب الـ JSON من الرابط
        const response = await fetch('https://thanwyaplus.vercel.app/organized_output.json');
        const data = await response.json();
        res.json(data); // إرسال البيانات لموقعك
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: 'حدث خطأ في سحب البيانات' });
    }
});

// ==========================================
// الصفحة الرئيسية للمنصة
// ==========================================
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
                body { margin: 0; background-color: var(--dark-bg); color: white; font-family: 'Segoe UI', Tahoma, Geneva, sans-serif; overflow-x: hidden; }
                
                .stars-container { position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: -1; overflow: hidden; }
                .star { position: absolute; background: white; border-radius: 50%; box-shadow: 0 0 5px white; animation: floatUp linear infinite; }
                @keyframes floatUp { 0% { opacity: 0; transform: translateY(100px) scale(0.5); } 50% { opacity: 1; transform: translateY(0) scale(1); } 100% { opacity: 0; transform: translateY(-100px) scale(0.5); } }
                
                header { text-align: center; padding: 40px 20px; background: rgba(168, 255, 210, 0.05); backdrop-filter: blur(10px); border-bottom: 1px solid rgba(168, 255, 210, 0.2); }
                h1 { color: var(--icy-green); text-shadow: 0 0 15px var(--glow); margin: 0; font-size: 3em; }
                p.subtitle { color: #d1f2e0; font-size: 1.1em; margin-top: 10px; }
                
                .grid-container { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 30px; padding: 40px; max-width: 1300px; margin: auto; }
                .card { background: rgba(255, 255, 255, 0.03); backdrop-filter: blur(15px); border: 1px solid rgba(168, 255, 210, 0.15); border-radius: 20px; padding: 20px; text-align: center; transition: all 0.4s ease; }
                .card:hover { transform: translateY(-10px); border-color: var(--icy-green); box-shadow: 0 10px 30px rgba(0, 255, 136, 0.2); }
                .card img, .card video, .card iframe { width: 100%; height: 200px; border-radius: 12px; margin-bottom: 15px; background: #000; border: none; }
                .card h3 { color: var(--icy-green); font-size: 1.2em; margin: 10px 0; }
                
                .loading { text-align: center; font-size: 1.5em; color: var(--icy-green); margin-top: 50px; }
            </style>
        </head>
        <body oncontextmenu="return false;">
            <div class="stars-container" id="stars"></div>
            <header>
                <h1>Full Mark</h1>
                <p class="subtitle">طريقك للعلامة الكاملة بأسلوب مبتكر</p>
            </header>
            
            <div id="loading" class="loading">جاري سحب المحتوى... لحظات من فضلك ⏳</div>
            <div class="grid-container" id="content"></div>

            <script>
                // توليد النجوم
                const starsContainer = document.getElementById('stars');
                for(let i=0; i<100; i++) {
                    let star = document.createElement('div'); star.className = 'star';
                    let size = Math.random() * 3 + 1; star.style.width = size + 'px'; star.style.height = size + 'px';
                    star.style.left = Math.random() * 100 + 'vw'; star.style.top = Math.random() * 100 + 'vh';
                    star.style.animationDuration = (Math.random() * 4 + 3) + 's'; star.style.animationDelay = (Math.random() * 5) + 's';
                    starsContainer.appendChild(star);
                }

                // سحب البيانات من السيرفر الخاص بنا (الـ API اللي عملناه فوق)
                const contentDiv = document.getElementById('content');
                const loadingDiv = document.getElementById('loading');

                fetch('/api/scrape')
                    .then(response => response.json())
                    .then(data => {
                        loadingDiv.style.display = 'none'; // إخفاء رسالة التحميل
                        
                        // التأكد إن البيانات عبارة عن مصفوفة (Array)
                        let items = Array.isArray(data) ? data : (data.data || Object.values(data));
                        
                        if (!items || items.length === 0) {
                            contentDiv.innerHTML = '<h3 style="color:white; text-align:center;">الملف فارغ أو لا يوجد بيانات!</h3>';
                            return;
                        }

                        items.forEach((item, index) => {
                            const card = document.createElement('div');
                            card.className = 'card';
                            
                            // حاولنا تغطية كل المسميات المحتملة داخل الـ JSON
                            let videoUrl = item.video_url || item.video || item.link; 
                            let imageUrl = item.image_url || item.image || item.thumbnail;
                            let title = item.title || item.name || \`المحاضرة رقم \${index + 1}\`;

                            let mediaContent = '';
                            if (videoUrl) {
                                // لو الرابط يوتيوب أو ايفريم
                                if(videoUrl.includes('youtube') || videoUrl.includes('iframe')) {
                                    mediaContent = \`<iframe src="\${videoUrl}" allowfullscreen></iframe>\`;
                                } else {
                                    mediaContent = \`<video controls controlsList="nodownload"><source src="\${videoUrl}"></video>\`;
                                }
                            } else if (imageUrl) {
                                mediaContent = \`<img src="\${imageUrl}" alt="محتوى">\`;
                            } else {
                                mediaContent = \`<div style="height:200px; background:#111; border-radius:12px; display:flex; align-items:center; justify-content:center;">ملف غير معروف</div>\`;
                            }
                            
                            card.innerHTML = \`\${mediaContent}<h3>\${title}</h3>\`;
                            contentDiv.appendChild(card);
                        });
                    })
                    .catch(err => {
                        loadingDiv.style.display = 'none';
                        contentDiv.innerHTML = '<h3 style="color:red; text-align:center;">حدث خطأ أثناء جلب البيانات!</h3>';
                        console.error(err);
                    });

                // منع الاختصارات لحماية المحتوى
                document.onkeydown = function(e) {
                    if(e.keyCode == 123 || (e.ctrlKey && e.shiftKey && (e.keyCode == 73 || e.keyCode == 67 || e.keyCode == 74)) || (e.ctrlKey && e.keyCode == 85)) return false;
                }
            </script>
        </body>
        </html>
    `);
});

module.exports = app;
