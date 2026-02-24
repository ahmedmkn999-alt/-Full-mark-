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

// API لسحب البيانات
app.get('/api/scrape', async (req, res) => {
    try {
        const response = await fetch('https://thanwyaplus.vercel.app/organized_output.json');
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'خطأ في سحب البيانات' });
    }
});

// الصفحة الرئيسية للمنصة
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html dir="rtl">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>منصة Full Mark</title>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
            <style>
                :root { --icy-green: #a8ffd2; --glow: #00ff88; --dark-bg: #05130d; --card-bg: rgba(255, 255, 255, 0.03); }
                body { margin: 0; background-color: var(--dark-bg); color: white; font-family: 'Segoe UI', Tahoma, Geneva, sans-serif; overflow-x: hidden; user-select: none; }
                
                /* النجوم */
                .stars-container { position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: -1; }
                .star { position: absolute; background: white; border-radius: 50%; box-shadow: 0 0 5px white; animation: floatUp linear infinite; }
                @keyframes floatUp { 0% { opacity: 0; transform: translateY(100px) scale(0.5); } 50% { opacity: 1; transform: translateY(0) scale(1); } 100% { opacity: 0; transform: translateY(-100px) scale(0.5); } }
                
                /* الهيدر (Navbar) */
                nav { display: flex; justify-content: space-between; align-items: center; padding: 15px 40px; background: rgba(5, 19, 13, 0.8); backdrop-filter: blur(15px); border-bottom: 1px solid rgba(168, 255, 210, 0.2); position: sticky; top: 0; z-index: 100; box-shadow: 0 4px 20px rgba(0, 255, 136, 0.1); }
                .brand { display: flex; flex-direction: column; }
                .brand h1 { color: var(--icy-green); text-shadow: 0 0 10px var(--glow); margin: 0; font-size: 1.8em; letter-spacing: 1px; }
                .brand span { color: #d1f2e0; font-size: 0.8em; opacity: 0.8; }
                
                /* زر البروفايل */
                .profile-trigger { width: 45px; height: 45px; border-radius: 50%; border: 2px solid var(--icy-green); cursor: pointer; overflow: hidden; transition: 0.3s; box-shadow: 0 0 10px rgba(0,255,136,0.3); }
                .profile-trigger:hover { transform: scale(1.1); box-shadow: 0 0 20px var(--glow); }
                .profile-trigger img { width: 100%; height: 100%; object-fit: cover; }

                /* القائمة الجانبية للبروفايل */
                .profile-sidebar { position: fixed; top: 0; left: -350px; width: 300px; height: 100vh; background: rgba(5, 19, 13, 0.95); backdrop-filter: blur(20px); border-right: 1px solid rgba(168, 255, 210, 0.2); transition: 0.4s ease-in-out; z-index: 1000; padding: 30px; box-shadow: 5px 0 30px rgba(0,0,0,0.8); overflow-y: auto; }
                .profile-sidebar.open { left: 0; }
                .close-btn { position: absolute; top: 20px; right: 20px; font-size: 1.5em; color: white; cursor: pointer; transition: 0.3s; }
                .close-btn:hover { color: #ff4d4d; transform: rotate(90deg); }
                .profile-header { text-align: center; margin-top: 30px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 20px; }
                .profile-header img { width: 100px; height: 100px; border-radius: 50%; border: 3px solid var(--glow); box-shadow: 0 0 20px rgba(0,255,136,0.4); }
                .profile-header h2 { color: var(--icy-green); margin: 15px 0 5px; font-size: 1.5em; }
                .profile-header p { color: #aaa; margin: 0; font-size: 0.9em; }
                .profile-stats { margin-top: 20px; display: grid; gap: 15px; }
                .stat-box { background: var(--card-bg); padding: 15px; border-radius: 12px; border: 1px solid rgba(168,255,210,0.1); display: flex; align-items: center; justify-content: space-between; }
                .stat-box i { color: var(--glow); font-size: 1.5em; }

                /* العداد التنازلي داخل البروفايل */
                .countdown-wrapper { margin-top: 25px; text-align: center; background: rgba(0, 255, 136, 0.05); padding: 15px; border-radius: 15px; border: 1px solid rgba(168,255,210,0.15); box-shadow: 0 0 15px rgba(0,255,136,0.05); }
                .countdown-title { color: #d1f2e0; font-size: 0.9em; margin-bottom: 15px; font-weight: bold; }
                .timer { display: flex; justify-content: center; gap: 8px; direction: ltr; }
                .time-box { background: rgba(0, 0, 0, 0.4); border: 1px solid var(--icy-green); padding: 10px; border-radius: 10px; min-width: 45px; text-align: center; }
                .time-box span { display: block; font-size: 1.3em; font-weight: bold; color: white; text-shadow: 0 0 10px var(--glow); }
                .time-box label { font-size: 0.7em; color: var(--icy-green); display: block; margin-top: 3px; }

                .logout-btn { display: block; width: 100%; margin-top: 30px; padding: 12px; background: rgba(255, 77, 77, 0.1); border: 1px solid #ff4d4d; color: #ff4d4d; border-radius: 10px; cursor: pointer; font-weight: bold; transition: 0.3s; }
                .logout-btn:hover { background: #ff4d4d; color: white; box-shadow: 0 0 15px rgba(255,77,77,0.5); }

                /* زر الرجوع */
                .controls-bar { max-width: 1300px; margin: 20px auto 0; padding: 0 40px; display: flex; align-items: center; }
                .back-btn { background: rgba(255,255,255,0.05); border: 1px solid rgba(168,255,210,0.3); color: var(--icy-green); padding: 10px 20px; border-radius: 30px; cursor: pointer; display: flex; align-items: center; gap: 10px; font-weight: bold; transition: 0.3s; backdrop-filter: blur(5px); }
                .back-btn:hover { background: var(--glow); color: #05130d; transform: translateX(5px); }

                /* شبكة الكروت */
                .grid-container { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 30px; padding: 30px 40px 60px; max-width: 1300px; margin: auto; }
                .card { background: var(--card-bg); backdrop-filter: blur(15px); border: 1px solid rgba(168, 255, 210, 0.15); border-radius: 20px; padding: 15px; text-align: center; transition: all 0.4s ease; cursor: pointer; position: relative; }
                .card:hover { transform: translateY(-8px); border-color: var(--icy-green); box-shadow: 0 10px 30px rgba(0, 255, 136, 0.15); }
                .card img, .card video, .card iframe { width: 100%; height: 200px; object-fit: cover; border-radius: 12px; margin-bottom: 15px; background: #000; border: none; }
                .card h3 { color: var(--icy-green); font-size: 1.3em; margin: 5px 0; }
                .card p.sub { color: #888; font-size: 0.85em; margin: 0; }
            </style>
        </head>
        <body oncontextmenu="return false;">
            <div class="stars-container" id="stars"></div>
            
            <nav>
                <div class="brand">
                    <h1>Full Mark</h1>
                    <span>طريقك للعلامة الكاملة</span>
                </div>
                <div class="profile-trigger" onclick="toggleProfile()">
                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=a8ffd2" alt="Profile">
                </div>
            </nav>

            <div class="profile-sidebar" id="profileSidebar">
                <i class="fas fa-times close-btn" onclick="toggleProfile()"></i>
                <div class="profile-header">
                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=a8ffd2" alt="Profile">
                    <h2 id="userName">طالب Full Mark</h2>
                    <p id="userEmail">يتم الربط قريباً...</p>
                </div>
                <div class="profile-stats">
                    <div class="stat-box">
                        <div>
                            <div style="color:#aaa; font-size:0.8em">المستوى الحالي</div>
                            <div style="color:white; font-size:1.1em; font-weight:bold">الأسطورة 👑</div>
                        </div>
                        <i class="fas fa-trophy"></i>
                    </div>
                </div>

                <div class="countdown-wrapper">
                    <div class="countdown-title">الوقت المتبقي على التفوق 🚀</div>
                    <div class="timer">
                        <div class="time-box"><span id="days">00</span><label>أيام</label></div>
                        <div class="time-box"><span id="hours">00</span><label>ساعات</label></div>
                        <div class="time-box"><span id="mins">00</span><label>دقائق</label></div>
                        <div class="time-box"><span id="secs">00</span><label>ثواني</label></div>
                    </div>
                </div>

                <button class="logout-btn"><i class="fas fa-sign-out-alt"></i> تسجيل الخروج</button>
            </div>

            <div class="controls-bar" id="controls-bar"></div>
            <div id="main-content"></div>

            <script>
                // توليد النجوم
                const starsContainer = document.getElementById('stars');
                for(let i=0; i<80; i++) {
                    let star = document.createElement('div'); star.className = 'star';
                    let size = Math.random() * 3 + 1; star.style.width = size + 'px'; star.style.height = size + 'px';
                    star.style.left = Math.random() * 100 + 'vw'; star.style.top = Math.random() * 100 + 'vh';
                    star.style.animationDuration = (Math.random() * 4 + 3) + 's'; star.style.animationDelay = (Math.random() * 5) + 's';
                    starsContainer.appendChild(star);
                }

                // فتح وقفل البروفايل
                function toggleProfile() {
                    document.getElementById('profileSidebar').classList.toggle('open');
                }

                // العداد التنازلي
                const countDownDate = new Date("Jun 1, 2026 00:00:00").getTime();
                setInterval(function() {
                    const now = new Date().getTime();
                    const distance = countDownDate - now;
                    document.getElementById("days").innerText = Math.floor(distance / (1000 * 60 * 60 * 24)).toString().padStart(2, '0');
                    document.getElementById("hours").innerText = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)).toString().padStart(2, '0');
                    document.getElementById("mins").innerText = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0');
                    document.getElementById("secs").innerText = Math.floor((distance % (1000 * 60)) / 1000).toString().padStart(2, '0');
                }, 1000);

                // سحب وعرض المحتوى (المجلدات والفيديوهات)
                const mainContent = document.getElementById('main-content');
                const controlsBar = document.getElementById('controls-bar');
                let historyStack = [];

                fetch('/api/scrape')
                    .then(res => res.json())
                    .then(data => {
                        renderView(data);
                    })
                    .catch(err => {
                        mainContent.innerHTML = '<h3 style="text-align:center;">جاري تجهيز المنصة...</h3>';
                    });

                function renderView(dataObject) {
                    mainContent.innerHTML = ''; 
                    controlsBar.innerHTML = '';

                    // رسم زر الرجوع
                    if (historyStack.length > 0) {
                        const backBtn = document.createElement('button');
                        backBtn.className = 'back-btn';
                        backBtn.innerHTML = '<i class="fas fa-arrow-right"></i> رجوع للخلف';
                        backBtn.onclick = () => {
                            const prevData = historyStack.pop();
                            renderView(prevData);
                        };
                        controlsBar.appendChild(backBtn);
                    }

                    const grid = document.createElement('div');
                    grid.className = 'grid-container';
                    mainContent.appendChild(grid);

                    // تحويل البيانات لمصفوفة
                    let items = [];
                    if (Array.isArray(dataObject)) {
                        items = dataObject;
                    } else if (typeof dataObject === 'object' && dataObject !== null) {
                        Object.keys(dataObject).forEach(key => {
                            items.push({
                                folderName: key,
                                folderContent: dataObject[key]
                            });
                        });
                    }

                    if (items.length === 0) {
                        grid.innerHTML = '<h3 style="color:white; width:100%; text-align:center;">لا يوجد محتوى هنا!</h3>';
                        return;
                    }

                    items.forEach((item, index) => {
                        const card = document.createElement('div');
                        card.className = 'card';
                        
                        // ✅ الذكاء الجديد لمعرفة إذا كان مجلد أو فيديو
                        // لو مفيش رابط فيديو يبقى 100% ده مجلد
                        let videoUrl = item.video_url || item.video || item.link;
                        let isFolder = !videoUrl; 
                        
                        let titleText = item.folderName || item.title || item.name || \`عنصر \${index + 1}\`;

                        if (isFolder) {
                            // 📁 تصميم المجلد
                            let img = item.image_url || item.image || item.thumbnail || 'https://images.unsplash.com/photo-1513258496099-48168024aec0?q=80&w=400&auto=format&fit=crop';
                            card.innerHTML = \`
                                <img src="\${img}" alt="مجلد">
                                <h3>📁 \${titleText}</h3>
                                <p class="sub" style="color:#d1f2e0;">اضغط هنا لفتح المدرسين</p>
                            \`;
                            
                            // استخراج المحتوى الداخلي للمجلد
                            let targetContent = item.folderContent;
                            if (!targetContent) {
                                for (let key in item) {
                                    if (key !== 'image_url' && key !== 'image' && key !== 'title' && key !== 'name' && typeof item[key] === 'object' && item[key] !== null) {
                                        targetContent = item[key];
                                        break;
                                    }
                                }
                            }
                            if(!targetContent) targetContent = item; // احتياطي

                            card.onclick = () => {
                                historyStack.push(dataObject); 
                                renderView(targetContent);   
                            };
                        } else {
                            // 🎬 تصميم الفيديو 
                            let imageUrl = item.image_url || item.image || item.thumbnail;
                            
                            let mediaContent = '';
                            if (videoUrl.includes('youtube') || videoUrl.includes('iframe')) {
                                mediaContent = \`<iframe src="\${videoUrl}" allowfullscreen></iframe>\`;
                            } else {
                                mediaContent = \`<video controls controlsList="nodownload"><source src="\${videoUrl}"></video>\`;
                            }
                            
                            card.innerHTML = \`\${mediaContent}<h3>\${titleText}</h3><p class="sub">محاضرة جاهزة للمشاهدة</p>\`;
                            // منع ضغطة الفيديو من إنها تفتح حاجة تانية
                            card.onclick = (e) => e.stopPropagation();
                        }
                        
                        grid.appendChild(card);
                    });
                }

                // الحماية
                document.onkeydown = function(e) {
                    if(e.keyCode == 123 || (e.ctrlKey && e.shiftKey && (e.keyCode == 73 || e.keyCode == 67 || e.keyCode == 74)) || (e.ctrlKey && e.keyCode == 85)) return false;
                }
            </script>
        </body>
        </html>
    `);
});

module.exports = app;
    
