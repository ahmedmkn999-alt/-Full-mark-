export default async function handler(req, res) {
  try {
    // السحب الأصلي والآمن جداً
    const response = await fetch('https://thanwyaplus.vercel.app/organized_output.json');
    
    if (!response.ok) {
      throw new Error('فشل الوصول للرابط الأساسي');
    }
    
    const data = await response.json();

    // السطرين دول هما اللي بيحلوا مشكلة الحماية عشان الواجهة تقرأ الداتا
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
    
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'خطأ', details: error.message });
  }
}
