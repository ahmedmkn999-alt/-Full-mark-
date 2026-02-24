const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');

const app = express();

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json());
app.disable('x-powered-by');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "تم حظر الـ IP مؤقتاً."
});
app.use(limiter);

// ==========================================
// الكوبري (API) لسحب البيانات
// ==========================================
app.get('/api/scrape', async (req, res) => {
    try {
        const response = await fetch('https://thanwyaplus.vercel.app/organized_output.json');
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'خطأ في سحب البيانات' });
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
                body { margin: 0; background-color: var(--dark-bg); color: white; font-family: 'Segoe UI', Tahoma, Geneva, sans-serif; overflow-x: hidden; user-select: none; }
                
                /* النجوم المتحركة */
                .stars-container { position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: -1; overflow: hidden; }
                .star { position: absolute; background: white; border-radius: 50%; box-shadow: 0 0 5px white; animation: floatUp linear infinite; }
                @keyframes floatUp { 0% { opacity: 0; transform: translateY(100px) scale(0.5); } 50% { opacity: 1; transform: translateY(0) scale(1); } 100% { opacity: 0; transform: translateY(-100px) scale(0.5); } }
                
                /* الهيدر */
                header { text-align: center; padding: 40px 20px; background: rgba(168, 255, 210, 0.05); backdrop-filter: blur(10px); border-bottom: 1px solid rgba(168, 255, 210, 0.2); }
                h1 { color: var(--icy-green); text-shadow: 0 0 15px var(--glow); margin: 0; font-size: 3em; }
                p.subtitle { color: #d1f2e0; font-size: 1.1em; margin-top: 10px; }
                
                /* شبكة الكروت (الفولدرات أو الفيديوهات) */
                .grid-container { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 30px; padding: 40px; max-width: 1300px; margin: auto; }
                .card { background: rgba(255, 255, 255, 0.03); backdrop-filter: blur(15px); border: 1px solid rgba(168, 255, 210, 0.15); border-radius: 20px; padding: 20px; text-align: center; transition: all 0.4s ease; position: relative; }
                .card:hover { transform: translateY(-10px); border-color: var(--icy-green); box-shadow: 0 10px 30px rgba(0, 255, 136, 0.2); }
                .card img, .card video, .card iframe { width: 100%; height: 220px; object-fit: cover; border-radius: 12px; margin-bottom: 15px; background: #000; border: none; }
                .card h3 { color: var(--icy-green); font-size: 1.4em; margin: 10px 0; }
                
                /* زرار الرجوع */
                .back-btn { display: block; margin: 20px auto; padding: 12px 30px; background: var(--icy-green); color: #05130d; font-weight: bold; font-size: 1.2em; border: none; border-radius: 10px; cursor: pointer; transition: 0.3s; box-shadow: 0 0 15px rgba(0,255,136,0.3); }
                .back-btn:hover { background: var(--glow); transform: scale(1.05); }
                
                .loading { text-align: center; font-size: 1.5em; color: var(--icy-green); margin-top: 50px; }
            </style>
        </head>
        <body oncontextmenu="return false;">
            <div class="stars-container" id="stars"></div>
            <header>
                <h1>Full Mark</h1>
                <p class="subtitle">طريقك للعلامة الكاملة بأسلوب مبتكر</p>
            </header>
            
            <div id="loading" class="loading">جاري ترتيب المحتوى... ⏳</div>
            <div id="main-content"></div>

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

                const mainContent = document.getElementById('main-content');
                const loadingDiv = document.getElementById('loading');
                
                let historyStack = []; // لتخزين مسار الصفحات للرجوع للخلف

                // جلب البيانات الأساسية
                fetch('/api/scrape')
                    .then(res => res.json())
                    .then(data => {
                        loadingDiv.style.display = 'none';
                        let items = Array.isArray(data) ? data : (data.data || Object.values(data));
                        renderView(items);
                    })
                    .catch(err => {
                        loadingDiv.innerHTML = '<span style="color:red;">حدث خطأ في تحميل البيانات!</span>';
                    });

                // دالة ذكية لعرض المجلدات أو الفيديوهات
                function renderView(items) {
                    mainContent.innerHTML = ''; 

                    // إضافة زرار الرجوع لو إحنا جوا مجلد
                    if (historyStack.length > 0) {
                        const backBtn = document.createElement('button');
                        backBtn.className = 'back-btn';
                        backBtn.innerText = '⬅️ رجوع للمجلد السابق';
                        backBtn.onclick = () => {
                            const prevItems = historyStack.pop();
                            renderView(prevItems);
                        };
                        mainContent.appendChild(backBtn);
                    }

                    const grid = document.createElement('div');
                    grid.className = 'grid-container';
                    mainContent.appendChild(grid);

                    if (!items || items.length === 0) {
                        grid.innerHTML = '<h3 style="color:white; width:100%; text-align:center;">لا يوجد محتوى هنا!</h3>';
                        return;
                    }

                    items.forEach((item, index) => {
                        // لو العنصر كان نص مش مجسم، هنحوله
                        if(typeof item !== 'object') { item = { title: 'محتوى', video_url: item }; }

                        const card = document.createElement('div');
                        card.className = 'card';
                        
                        let titleText = item.title || item.name || \`عنصر رقم \${index + 1}\`;
                        
                        // البحث عن مصفوفة داخل العنصر (عشان نعرف إذا كان مجلد ولا فيديو)
                        let nestedData = null;
                        for (let key in item) {
                            if (Array.isArray(item[key]) && item[key].length > 0) {
                                nestedData = item[key]; // لقينا فيديوهات جواه
                                break;
                            }
                        }

                        if (nestedData) {
                            // 📁 ده مجلد (زي 2026 و 2025)
                            let img = item.image_url || item.image || item.thumbnail || 'https://via.placeholder.com/400x300/05130d/a8ffd2?text=Folder';
                            card.innerHTML = \`
                                <img src="\${img}" alt="مجلد">
                                <h3>📁 \${titleText}</h3>
                                <p style="color:#d1f2e0; font-size:0.9em; margin:0;">اضغط هنا لفتح المحاضرات</p>
                            \`;
                            card.style.cursor = 'pointer';
                            card.onclick = () => {
                                historyStack.push(items); // حفظ الصفحة الحالية
                                renderView(nestedData);   // فتح المجلد
                            };
                        } else {
                            // 🎬 ده فيديو أو صورة نهائية
                            let videoUrl = item.video_url || item.video || item.link;
                            let imageUrl = item.image_url || item.image || item.thumbnail;
                            
                            let mediaContent = '';
                            if (videoUrl) {
                                if(videoUrl.includes('youtube') || videoUrl.includes('iframe')) {
                                    mediaContent = \`<iframe src="\${videoUrl}" allowfullscreen></iframe>\`;
                                } else {
                                    mediaContent = \`<video controls controlsList="nodownload"><source src="\${videoUrl}"></video>\`;
                                }
                            } else if (imageUrl) {
                                mediaContent = \`<img src="\${imageUrl}" alt="صورة">\`;
                            } else {
                                mediaContent = \`<div style="height:220px; background:#111; border-radius:12px; display:flex; align-items:center; justify-content:center;">ملف مجهول</div>\`;
                            }
                            
                            card.innerHTML = \`\${mediaContent}<h3>\${titleText}</h3>\`;
                        }
                        
                        grid.appendChild(card);
                    });
                }

                // حماية المنصة
                document.onkeydown = function(e) {
                    if(e.keyCode == 123 || (e.ctrlKey && e.shiftKey && (e.keyCode == 73 || e.keyCode == 67 || e.keyCode == 74)) || (e.ctrlKey && e.keyCode == 85)) return false;
                }
            </script>
        </body>
        </html>
    `);
});

module.exports = app;
