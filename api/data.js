module.exports = async function(req, res) {
    try {
        // السيرفر هو اللي بيروح يجيب الداتا عشان يتخطى الحماية
        const response = await fetch('https://thanwyaplus.vercel.app/organized_output.json');
        const data = await response.json();
        
        // السماح للمنصة بتاعتك إنها تقرأ الداتا
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Cache-Control', 's-maxage=3600'); // حفظ الداتا عشان الموقع يفتح طلقة
        
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: "فشل السحب" });
    }
};
