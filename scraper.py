import requests
import json
import os

# إنشاء المجلدات التي سيتم حفظ المحتوى بداخلها
os.makedirs('full_mark_media/videos', exist_ok=True)
os.makedirs('full_mark_media/images', exist_ok=True)

# رابط ملف البيانات
url = 'https://thanwyaplus.vercel.app/organized_output.json'

try:
    print("جاري الاتصال بالخادم وسحب البيانات...")
    response = requests.get(url)
    data = response.json()
    
    # المرور على جميع العناصر داخل الملف وسحبها
    # (ملاحظة: قد تحتاج لتعديل المفاتيح 'image_url' و 'video_url' حسب الأسماء الفعلية داخل الـ JSON)
    for index, item in enumerate(data):
        # سحب الصور
        if 'image_url' in item:
            img_url = item['image_url']
            img_data = requests.get(img_url).content
            img_name = img_url.split('/')[-1]
            with open(f'full_mark_media/images/{img_name}', 'wb') as handler:
                handler.write(img_data)
                print(f"تم تحميل الصورة: {img_name}")
                
        # سحب الفيديوهات
        if 'video_url' in item:
            vid_url = item['video_url']
            vid_data = requests.get(vid_url, stream=True)
            vid_name = vid_url.split('/')[-1]
            with open(f'full_mark_media/videos/{vid_name}', 'wb') as handler:
                for chunk in vid_data.iter_content(chunk_size=8192):
                    handler.write(chunk)
            print(f"تم تحميل الفيديو: {vid_name}")
                    
    print("تم سحب جميع البيانات بنجاح وأصبحت جاهزة لمنصتك!")
except Exception as e:
    print(f"حدث خطأ أثناء سحب البيانات: {e}")
