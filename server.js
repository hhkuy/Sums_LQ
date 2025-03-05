require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const cors = require('cors');
const path = require('path'); // NEW: لزوم استخدام sendFile

const app = express();
app.use(bodyParser.json({ limit: '10mb' }));
app.use(cors());

// اجلب البيانات من متغيرات البيئة
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_USER = process.env.GITHUB_USER;
const MAIN_REPO_NAME = process.env.MAIN_REPO_NAME;        // مثال: 'Sums_Q'
const IMAGES_REPO_NAME = process.env.IMAGES_REPO_NAME;    // مثال: 'Sums_Q_L_Pic'

// رؤوس التوثيق
const githubHeaders = {
  'Authorization': `Bearer ${GITHUB_TOKEN}`,
  'Accept': 'application/vnd.github+json'
};

// ================ مساعدة: جلب SHA لملف على GitHub ================
async function getFileSha(repoName, path){
  const url = `https://api.github.com/repos/${GITHUB_USER}/${repoName}/contents/${path}`;
  const res = await fetch(url, { headers: githubHeaders });
  if(res.status === 200){
    const json = await res.json();
    if(json.sha) return json.sha;
  }
  return null;
}

// ================ 1) جلب exp_topics.json ================
app.get('/api/get-exp-topics', async (req, res) => {
  try {
    const path = `exp_data/exp_topics.json`; // مكان الملف
    const url = `https://api.github.com/repos/${GITHUB_USER}/${MAIN_REPO_NAME}/contents/${path}`;
    const resp = await fetch(url, { headers: githubHeaders });
    if(resp.status !== 200){
      const t = await resp.text();
      return res.json({ success: false, error: t });
    }
    const j = await resp.json();
    const content = Buffer.from(j.content, 'base64').toString('utf8');
    const parsed = JSON.parse(content);
    res.json({ success: true, content: parsed, sha: j.sha });
  } catch(e){
    console.error(e);
    res.json({ success: false, error: e.toString() });
  }
});

// ================ 2) حفظ exp_topics.json ================
app.post('/api/save-exp-topics', async (req, res) => {
  try {
    const { content, sha } = req.body;
    const path = `exp_data/exp_topics.json`;
    const url = `https://api.github.com/repos/${GITHUB_USER}/${MAIN_REPO_NAME}/contents/${path}`;
    const encoded = Buffer.from(JSON.stringify(content, null, 2)).toString('base64');
    const body = {
      message: "Update exp_topics.json",
      content: encoded,
      sha: sha
    };
    const resp = await fetch(url, {
      method: 'PUT',
      headers: { ...githubHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const j = await resp.json();
    if(!j.content){
      return res.json({ success: false, error: j.message || 'Unknown error' });
    }
    res.json({ success: true });
  } catch(e){
    console.error(e);
    res.json({ success: false, error: e.toString() });
  }
});

// ================ 3) إضافة ملف جديد (فارغ) لمحتوى في مجلد exp_data ================
app.post('/api/add-file', async (req, res) => {
  try {
    let { fileName } = req.body;
    if(!fileName) return res.json({ success:false, error: 'No fileName provided.' });
    const path = `exp_data/${fileName}`;
    // أنشئ كائن JSON افتراضي
    const defaultJson = { title: fileName.replace('.json',''), content: "" };
    const encoded = Buffer.from(JSON.stringify(defaultJson, null, 2)).toString('base64');
    const url = `https://api.github.com/repos/${GITHUB_USER}/${MAIN_REPO_NAME}/contents/${path}`;
    let body = {
      message: `Create new file: ${fileName}`,
      content: encoded
    };
    let resp = await fetch(url, {
      method: 'PUT',
      headers: { ...githubHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    let j = await resp.json();
    if(j.content){
      return res.json({ success: true, filePath: path });
    } else {
      return res.json({ success: false, error: j.message || 'Could not create file' });
    }
  } catch(e){
    console.error(e);
    return res.json({ success:false, error:e.toString() });
  }
});

// ================ 4) حذف ملف من المستودع الرئيسي ================
app.delete('/api/delete-file', async (req, res) => {
  try {
    const filePath = req.query.filePath;
    if(!filePath) return res.json({ success:false, error: 'No filePath provided.' });
    const sha = await getFileSha(MAIN_REPO_NAME, filePath);
    if(!sha) return res.json({ success:false, error:'File not found or no SHA.' });

    const url = `https://api.github.com/repos/${GITHUB_USER}/${MAIN_REPO_NAME}/contents/${filePath}`;
    const body = {
      message: `Delete file: ${filePath}`,
      sha: sha
    };
    const resp = await fetch(url, {
      method: 'DELETE',
      headers: { ...githubHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const j = await resp.json();
    if(j.commit){
      return res.json({ success:true });
    } else {
      return res.json({ success:false, error:j.message || 'Could not delete file' });
    }
  } catch(e){
    console.error(e);
    return res.json({ success:false, error:e.toString() });
  }
});

// ================ 5) جلب ملف محتوى (dataFile) ================
app.get('/api/get-content-file', async (req, res) => {
  try {
    let filePath = req.query.filePath;
    if(!filePath) return res.json({ success:false, error:'No filePath provided.' });
    let url = `https://api.github.com/repos/${GITHUB_USER}/${MAIN_REPO_NAME}/contents/${filePath}`;
    let resp = await fetch(url, { headers: githubHeaders });
    if(resp.status !== 200){
      let t = await resp.text();
      return res.json({ success:false, error:t });
    }
    let j = await resp.json();
    let contentDecoded = Buffer.from(j.content, 'base64').toString('utf8');
    let parsed = {};
    try {
      parsed = JSON.parse(contentDecoded);
    } catch(err){
      parsed = { content: contentDecoded };
    }
    return res.json({ success:true, content: parsed, sha: j.sha });
  } catch(e){
    console.error(e);
    return res.json({ success:false, error:e.toString() });
  }
});

// ================ 6) حفظ ملف محتوى (dataFile) ================
app.post('/api/save-content-file', async (req, res) => {
  try {
    let { filePath, sha, newContent } = req.body;
    if(!filePath || !sha) return res.json({ success:false, error:'Missing filePath or sha' });

    // جلب المحتوى القديم لمعرفة الشكل
    let oldSha = await getFileSha(MAIN_REPO_NAME, filePath);
    if(oldSha !== sha){
      // ربما تغير الملف في GitHub!
      console.warn("Possible conflict - SHA mismatch");
    }

    // نفترض أن الملف يحتوي كائن JSON في الشكل { title, content }
    const urlGet = `https://api.github.com/repos/${GITHUB_USER}/${MAIN_REPO_NAME}/contents/${filePath}`;
    const respGet = await fetch(urlGet, { headers: githubHeaders });
    if(respGet.status !== 200){
      return res.json({ success:false, error:'File not found or no permission' });
    }
    const getJson = await respGet.json();
    let oldContent = Buffer.from(getJson.content, 'base64').toString('utf8');
    let parsedOld = {};
    try {
      parsedOld = JSON.parse(oldContent);
    } catch(e){
      parsedOld = { content: oldContent };
    }
    // حدث حقل content
    parsedOld.content = newContent;

    // الآن احفظ
    const updatedBase64 = Buffer.from(JSON.stringify(parsedOld, null, 2)).toString('base64');
    const urlPut = `https://api.github.com/repos/${GITHUB_USER}/${MAIN_REPO_NAME}/contents/${filePath}`;
    const putBody = {
      message: `Update content file: ${filePath}`,
      content: updatedBase64,
      sha: getJson.sha
    };
    const respPut = await fetch(urlPut, {
      method: 'PUT',
      headers: { ...githubHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify(putBody)
    });
    const putJson = await respPut.json();
    if(putJson.content && putJson.content.sha){
      return res.json({ success:true, newSha: putJson.content.sha });
    } else {
      return res.json({ success:false, error: putJson.message || 'Could not update file' });
    }
  } catch(e){
    console.error(e);
    return res.json({ success:false, error:e.toString() });
  }
});

// ================ 7) رفع صورة إلى مستودع الصور (IMAGES_REPO_NAME) ================
app.post('/api/upload-image', async (req, res) => {
  try {
    let { name, base64 } = req.body;
    if(!name || !base64) return res.json({ success:false, error:'Missing name or base64' });

    let extension = name.split('.').pop().toLowerCase();
    if(['jpg','jpeg','png','gif','webp'].indexOf(extension) === -1){
      extension = 'png';
    }
    let newFileName = Date.now() + '.' + extension;
    let path = `pic/${newFileName}`; // داخل مجلد pic في مستودع الصور

    let fileSha = await getFileSha(IMAGES_REPO_NAME, path);
    if(fileSha){
      newFileName = Date.now() + '_' + Math.floor(Math.random()*1000) + '.' + extension;
      path = `pic/${newFileName}`;
    }

    const url = `https://api.github.com/repos/${GITHUB_USER}/${IMAGES_REPO_NAME}/contents/${path}`;
    const body = {
      message: `Upload image ${newFileName}`,
      content: base64
    };
    const resp = await fetch(url, {
      method: 'PUT',
      headers: { ...githubHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const j = await resp.json();
    if(j.content){
      let rawUrl = `https://raw.githubusercontent.com/${GITHUB_USER}/${IMAGES_REPO_NAME}/main/pic/${newFileName}`;
      return res.json({ success:true, url: rawUrl, filePath: `pic/${newFileName}` });
    } else {
      return res.json({ success:false, error: j.message || 'Upload failed' });
    }
  } catch(e){
    console.error(e);
    return res.json({ success:false, error:e.toString() });
  }
});

// ================ 8) حذف صورة من مستودع الصور ================
app.delete('/api/delete-image', async (req, res) => {
  try {
    let filePath = req.query.filePath; // pic/xxx.png
    if(!filePath) return res.json({ success:false, error:'No filePath provided.' });
    let sha = await getFileSha(IMAGES_REPO_NAME, filePath);
    if(!sha) return res.json({ success:false, error:'File not found in images repo or no SHA.' });
    let url = `https://api.github.com/repos/${GITHUB_USER}/${IMAGES_REPO_NAME}/contents/${filePath}`;
    let body = {
      message: `Delete image: ${filePath}`,
      sha: sha
    };
    let resp = await fetch(url, {
      method: 'DELETE',
      headers: { ...githubHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    let j = await resp.json();
    if(j.commit){
      return res.json({ success:true });
    } else {
      return res.json({ success:false, error:j.message || 'Could not delete image' });
    }
  } catch(e){
    console.error(e);
    return res.json({ success:false, error:e.toString() });
  }
});

// NEW: serve admin.html at root to fix "Cannot GET /"
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

// serve admin.html + أي ملفات ثابتة
app.use(express.static(__dirname));

// افتراضي: استمع على بورت 3000 محليًا
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log("Server listening on port " + port);
});
