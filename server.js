app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html dir="rtl">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>منصة Full Mark</title>
            <style>
                /* إعدادات الألوان والخلفية */
                :root {
                    --icy-green: #a8ffd2; /* الأخضر الثلجي */
                    --glow: #00ff88;
                    --dark-bg: #05130d; /* لون خلفية داكن جداً يميل للأخضر */
                }
                body {
                    margin: 0;
                    padding: 0;
                    background-color: var(--dark-bg);
                    color: white;
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    overflow-x: hidden;
                    user-select: none; /* منع تحديد النص */
                }

                /* تأثير النجوم المتحركة */
                .stars-container {
                    position: fixed;
                    top: 0; left: 0; width: 100%; height: 100%;
                    z-index: -1;
                    overflow: hidden;
                }
                .star {
                    position: absolute;
                    background: white;
                    border-radius: 50%;
                    box-shadow: 0 0 5px white;
                    animation: floatUp linear infinite;
                }
                @keyframes floatUp {
                    0% { opacity: 0; transform: translateY(100px) scale(0.5); }
                    50% { opacity: 1; transform: translateY(0) scale(1); }
                    100% { opacity: 0; transform: translateY(-100px) scale(0.5); }
                }

                /* الهيدر (العنوان) */
                header {
                    text-align: center;
                    padding: 50px 20px;
                    background: rgba(168, 255, 210, 0.05);
                    backdrop-filter: blur(10px);
                    border-bottom: 1px solid rgba(168, 255, 210, 0.2);
                    box-shadow: 0 4px 30px rgba(0, 255, 136, 0.1);
                }
                h1 {
                    color: var(--icy-green);
                    text-shadow: 0 0 15px var(--glow);
                    margin: 0;
                    font-size: 3.5em;
                    letter-spacing: 2px;
                }
                p.subtitle {
                    color: #d1f2e0;
                    font-size: 1.2em;
                    margin-top: 10px;
                }

                /* تقسيم المحتوى (نفس فكرة ترتيب الـ JSON) */
                .grid-container {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
                    gap: 30px;
                    padding: 50px;
                    max-width: 1300px;
                    margin: auto;
                }

                /* تصميم الكروت (المحتوى) بتأثير الزجاج */
                .card {
                    background: rgba(255, 255, 255, 0.03);
                    backdrop-filter: blur(15px);
                    -webkit-backdrop-filter: blur(15px);
                    border: 1px solid rgba(168, 255, 210, 0.15);
                    border-radius: 20px;
                    padding: 20px;
                    text-align: center;
                    transition: all 0.4s ease;
                    position: relative;
                    overflow: hidden;
                }
                .card:hover {
                    transform: translateY(-10px);
                    border-color: var(--icy-green);
                    box-shadow: 0 10px 30px rgba(0, 255, 136, 0.2);
                }
                .card img, .card video {
                    width: 100%;
                    border-radius: 12px;
                    margin-bottom: 15px;
                    background: #000;
                }
                .card h3 {
                    color: var(--icy-green);
                    font-size: 1.4em;
                    margin: 10px 0;
                }
            </style>
        </head>
        <body oncontextmenu="return false;">
            <div class="stars-container" id="stars"></div>

            <header>
                <h1>Full Mark</h1>
                <p class="subtitle">طريقك للعلامة الكاملة بأسلوب مبتكر</p>
            </header>

            <div class="grid-container" id="content">
                </div>

            <script>
                // 1. إنشاء النجوم المتحركة
                const starsContainer = document.getElementById('stars');
                for(let i = 0; i < 150; i++) {
                    let star = document.createElement('div');
                    star.className = 'star';
                    let size = Math.random() * 3 + 1; // حجم عشوائي
                    star.style.width = size + 'px';
                    star.style.height = size + 'px';
                    star.style.left = Math.random() * 100 + 'vw';
                    star.style.top = Math.random() * 100 + 'vh';
                    star.style.animationDuration = (Math.random() * 4 + 3) + 's'; // سرعة عشوائية
                    star.style.animationDelay = (Math.random() * 5) + 's';
                    starsContainer.appendChild(star);
                }

                // 2. كود جلب بيانات ملف الـ JSON وعرضها ككروت مقسمة
                // ملاحظة: قمنا بمحاكاة البيانات، يمكنك ربطها بمسار الـ API الخاص بك
                const dataUrl = 'https://thanwyaplus.vercel.app/organized_output.json';
                const contentDiv = document.getElementById('content');

                fetch(dataUrl)
                    .then(response => response.json())
                    .then(data => {
                        data.forEach((item, index) => {
                            const card = document.createElement('div');
                            card.className = 'card';
                            
                            let mediaContent = '';
                            // التحقق مما إذا كان العنصر فيديو أو صورة (حسب مفاتيح الـ JSON)
                            if(item.video_url) {
                                mediaContent = \`<video controls controlsList="nodownload"><source src="\${item.video_url}" type="video/mp4"></video>\`;
                            } else if (item.image_url) {
                                mediaContent = \`<img src="\${item.image_url}" alt="محتوى تعليمي">\`;
                            } else {
                                mediaContent = \`<img src="https://via.placeholder.com/300x200/05130d/a8ffd2?text=Full+Mark" alt="No Media">\`;
                            }

                            // عنوان افتراضي إذا لم يوجد في الـ JSON
                            let title = item.title ? item.title : \`المحاضرة رقم \${index + 1}\`;

                            card.innerHTML = \`
                                \${mediaContent}
                                <h3>\${title}</h3>
                            \`;
                            contentDiv.appendChild(card);
                        });
                    })
                    .catch(error => {
                        contentDiv.innerHTML = '<h3 style="color:red;">حدث خطأ في تحميل البيانات!</h3>';
                        console.error('Error fetching data:', error);
                    });

                // 3. منع الاختصارات لحماية المنصة
                document.onkeydown = function(e) {
                    if(e.keyCode == 123) return false;
                    if(e.ctrlKey && e.shiftKey && (e.keyCode == 'I'.charCodeAt(0) || e.keyCode == 'C'.charCodeAt(0) || e.keyCode == 'J'.charCodeAt(0))) return false;
                    if(e.ctrlKey && e.keyCode == 'U'.charCodeAt(0)) return false;
                }
            </script>
        </body>
        </html>
    `);
});
