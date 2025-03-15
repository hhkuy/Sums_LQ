require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch'); // يبقى كما هو
const cors = require('cors');
const path = require('path');

const app = express();
app.use(bodyParser.json({ limit: '10mb' }));
app.use(cors());

// يطبع القيم للتحقق من توفرها
console.log("GITHUB_TOKEN:", process.env.GITHUB_TOKEN ? "EXISTS" : "MISSING!");
console.log("GITHUB_USER:", process.env.GITHUB_USER);
console.log("MAIN_REPO_NAME:", process.env.MAIN_REPO_NAME);
console.log("IMAGES_REPO_NAME:", process.env.IMAGES_REPO_NAME);

// جلب متغيرات البيئة
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_USER = process.env.GITHUB_USER;
const MAIN_REPO_NAME = process.env.MAIN_REPO_NAME;
const IMAGES_REPO_NAME = process.env.IMAGES_REPO_NAME;

// ترويسات GitHub
const githubHeaders = {
  'Authorization': `Bearer ${GITHUB_TOKEN}`,
  'Accept': 'application/vnd.github+json'
};

/** دالة مساعدة لجلب SHA لملف في GitHub */
async function getFileSha(repoName, filePath){
  const url = `https://api.github.com/repos/${GITHUB_USER}/${repoName}/contents/${filePath}`;
  const res = await fetch(url, { headers: githubHeaders });
  if(res.status === 200){
    const json = await res.json();
    if(json.sha) return json.sha;
  }
  return null;
}

/** =============== مسارات الـ API =============== */

/** 1) جلب exp_topics.json */
app.get('/api/get-exp-topics', async (req, res) => {
  try {
    const pathFile = `exp_data/exp_topics.json`;
    const url = `https://api.github.com/repos/${GITHUB_USER}/${MAIN_REPO_NAME}/contents/${pathFile}`;
    const resp = await fetch(url, { headers: githubHeaders });
    if(resp.status !== 200){
      const t = await resp.text();
      console.error("get-exp-topics error:", t);
      return res.json({ success: false, error: t });
    }
    const j = await resp.json();
    const content = Buffer.from(j.content, 'base64').toString('utf8');
    const parsed = JSON.parse(content);
    return res.json({ success: true, content: parsed, sha: j.sha });
  } catch(e){
    console.error("get-exp-topics exception:", e);
    return res.json({ success: false, error: e.toString() });
  }
});

/** 2) حفظ exp_topics.json */
app.post('/api/save-exp-topics', async (req, res) => {
  try {
    const { content, sha } = req.body;
    const pathFile = `exp_data/exp_topics.json`;
    const url = `https://api.github.com/repos/${GITHUB_USER}/${MAIN_REPO_NAME}/contents/${pathFile}`;

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
      console.error("save-exp-topics error:", j);
      return res.json({ success: false, error: j.message || 'Unknown error' });
    }
    return res.json({ success: true });
  } catch(e){
    console.error("save-exp-topics exception:", e);
    return res.json({ success: false, error: e.toString() });
  }
});

/** 3) إنشاء ملف جديد في exp_data */
app.post('/api/add-file', async (req, res) => {
  try {
    const { fileName, newJsonTitle } = req.body;
    if(!fileName) return res.json({ success:false, error:'No fileName provided.' });

    const pathFile = `exp_data/${fileName}`;
    const defaultTitle = newJsonTitle || fileName.replace('.json','');
    const defaultJson = { title: defaultTitle, content: "" };
    const encoded = Buffer.from(JSON.stringify(defaultJson, null, 2)).toString('base64');

    const url = `https://api.github.com/repos/${GITHUB_USER}/${MAIN_REPO_NAME}/contents/${pathFile}`;
    const body = {
      message: `Create new file: ${fileName}`,
      content: encoded
    };
    const resp = await fetch(url, {
      method: 'PUT',
      headers: { ...githubHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const j = await resp.json();
    if(j.content){
      return res.json({ success: true, filePath: fileName }); 
    } else {
      console.error("add-file error:", j);
      return res.json({ success: false, error: j.message || 'Could not create file' });
    }
  } catch(e){
    console.error("add-file exception:", e);
    return res.json({ success:false, error:e.toString() });
  }
});

/** 4) حذف ملف من المستودع الرئيسي */
app.delete('/api/delete-file', async (req, res) => {
  try {
    const filePath = req.query.filePath; 
    if(!filePath) return res.json({ success:false, error:'No filePath provided.' });

    const fullPath = filePath; 
    const sha = await getFileSha(MAIN_REPO_NAME, fullPath);
    if(!sha) {
      console.error("delete-file: file not found or no SHA for", fullPath);
      return res.json({ success:false, error:'File not found or no SHA.' });
    }

    const url = `https://api.github.com/repos/${GITHUB_USER}/${MAIN_REPO_NAME}/contents/${fullPath}`;
    const body = {
      message: `Delete file: ${fullPath}`,
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
      console.error("delete-file error:", j);
      return res.json({ success:false, error:j.message || 'Could not delete file' });
    }
  } catch(e){
    console.error("delete-file exception:", e);
    return res.json({ success:false, error:e.toString() });
  }
});

/** 5) جلب ملف محتوى (dataFile) */
app.get('/api/get-content-file', async (req, res) => {
  try {
    const shortFilePath = req.query.filePath;
    if(!shortFilePath) return res.json({ success:false, error:'No filePath provided.' });
    const fullPath = `exp_data/${shortFilePath}`;

    const url = `https://api.github.com/repos/${GITHUB_USER}/${MAIN_REPO_NAME}/contents/${fullPath}`;
    const resp = await fetch(url, { headers: githubHeaders });
    if(resp.status !== 200){
      const t = await resp.text();
      console.error("get-content-file error text:", t);
      return res.json({ success:false, error:t });
    }
    const j = await resp.json();
    const contentDecoded = Buffer.from(j.content, 'base64').toString('utf8');
    let parsed;
    try {
      parsed = JSON.parse(contentDecoded);
    } catch(err){
      parsed = { content: contentDecoded };
    }
    return res.json({ success:true, content: parsed, sha: j.sha });
  } catch(e){
    console.error("get-content-file exception:", e);
    return res.json({ success:false, error:e.toString() });
  }
});

/** 6) حفظ ملف محتوى (dataFile) */
app.post('/api/save-content-file', async (req, res) => {
  try {
    const { filePath, sha, newContent } = req.body;
    if(!filePath || !sha) return res.json({ success:false, error:'Missing filePath or sha' });

    const fullPath = `exp_data/${filePath}`;
    const oldSha = await getFileSha(MAIN_REPO_NAME, fullPath);
    if(oldSha && oldSha !== sha){
      console.warn("Possible conflict - local sha != remote sha for", fullPath);
    }

    const urlGet = `https://api.github.com/repos/${GITHUB_USER}/${MAIN_REPO_NAME}/contents/${fullPath}`;
    const respGet = await fetch(urlGet, { headers: githubHeaders });
    if(respGet.status !== 200){
      console.error("save-content-file: can't read old content", await respGet.text());
      return res.json({ success:false, error:'File not found or no permission' });
    }
    const getJson = await respGet.json();
    const oldContent = Buffer.from(getJson.content, 'base64').toString('utf8');

    let parsedOld;
    try {
      parsedOld = JSON.parse(oldContent);
    } catch(e){
      parsedOld = { content: oldContent };
    }
    parsedOld.content = newContent;

    const updatedBase64 = Buffer.from(JSON.stringify(parsedOld, null, 2)).toString('base64');
    const urlPut = `https://api.github.com/repos/${GITHUB_USER}/${MAIN_REPO_NAME}/contents/${fullPath}`;
    const putBody = {
      message: `Update content file: ${fullPath}`,
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
      console.error("save-content-file put error:", putJson);
      return res.json({ success:false, error: putJson.message || 'Could not update file' });
    }
  } catch(e){
    console.error("save-content-file exception:", e);
    return res.json({ success:false, error:e.toString() });
  }
});

/** 7) رفع صورة إلى مستودع الصور */
app.post('/api/upload-image', async (req, res) => {
  try {
    const { name, base64 } = req.body;
    if(!name || !base64) return res.json({ success:false, error:'Missing name or base64' });

    let extension = name.split('.').pop().toLowerCase();
    if(!['jpg','jpeg','png','gif','webp'].includes(extension)){
      extension = 'png';
    }
    let newFileName = Date.now() + '.' + extension;
    let pathFile = `pic/${newFileName}`;

    const fileSha = await getFileSha(IMAGES_REPO_NAME, pathFile);
    if(fileSha){
      newFileName = Date.now() + '_' + Math.floor(Math.random()*1000) + '.' + extension;
      pathFile = `pic/${newFileName}`;
    }

    const url = `https://api.github.com/repos/${GITHUB_USER}/${IMAGES_REPO_NAME}/contents/${pathFile}`;
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
      const rawUrl = `https://raw.githubusercontent.com/${GITHUB_USER}/${IMAGES_REPO_NAME}/main/pic/${newFileName}`;
      return res.json({ success:true, url: rawUrl, filePath: `pic/${newFileName}` });
    } else {
      console.error("upload-image error:", j);
      return res.json({ success:false, error: j.message || 'Upload failed' });
    }
  } catch(e){
    console.error("upload-image exception:", e);
    return res.json({ success:false, error:e.toString() });
  }
});

/** 8) حذف صورة من مستودع الصور */
app.delete('/api/delete-image', async (req, res) => {
  try {
    const filePath = req.query.filePath;
    if(!filePath) return res.json({ success:false, error:'No filePath provided.' });

    const sha = await getFileSha(IMAGES_REPO_NAME, filePath);
    if(!sha){
      console.error("delete-image: file not found or no sha", filePath);
      return res.json({ success:false, error:'Image not found or no SHA.' });
    }
    const url = `https://api.github.com/repos/${GITHUB_USER}/${IMAGES_REPO_NAME}/contents/${filePath}`;
    const body = {
      message: `Delete image: ${filePath}`,
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
      console.error("delete-image error:", j);
      return res.json({ success:false, error:j.message || 'Could not delete image' });
    }
  } catch(e){
    console.error("delete-image exception:", e);
    return res.json({ success:false, error:e.toString() });
  }
});

/** 9) إعادة تسمية ملف محتوى (مع تحديث الـ title داخله) */
app.post('/api/rename-file', async (req, res) => {
  try {
    const { oldPath, newPath, newTitle } = req.body;
    if(!oldPath || !newPath) {
      return res.json({ success:false, error:"Missing oldPath or newPath" });
    }

    const sha = await getFileSha(MAIN_REPO_NAME, "exp_data/"+oldPath);
    if(!sha){
      return res.json({ success:false, error:"File not found or no SHA for oldPath" });
    }

    const getUrl = `https://api.github.com/repos/${GITHUB_USER}/${MAIN_REPO_NAME}/contents/exp_data/${oldPath}`;
    const respGet = await fetch(getUrl, { headers: githubHeaders });
    if(respGet.status !== 200){
      const t = await respGet.text();
      console.error("rename-file get error text:", t);
      return res.json({ success:false, error:t });
    }
    const getJ = await respGet.json();
    const oldDecoded = Buffer.from(getJ.content, 'base64').toString('utf8');
    let parsedOld;
    try {
      parsedOld = JSON.parse(oldDecoded);
    } catch(e){
      parsedOld = { content: oldDecoded };
    }
    if(newTitle){
      parsedOld.title = newTitle;
    }

    const updatedBase64 = Buffer.from(JSON.stringify(parsedOld, null, 2)).toString('base64');
    const putUrl = `https://api.github.com/repos/${GITHUB_USER}/${MAIN_REPO_NAME}/contents/exp_data/${oldPath}`;
    const putBody = {
      message: `Rename file to ${newPath}`,
      content: updatedBase64,
      sha: getJ.sha,
      path: newPath
    };
    const respPut = await fetch(putUrl, {
      method: 'PUT',
      headers: { ...githubHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify(putBody)
    });
    const putJson = await respPut.json();
    if(!putJson.content){
      console.error("rename-file put error:", putJson);
      return res.json({ success:false, error:putJson.message || 'Could not rename file' });
    }
    return res.json({ success:true });
  } catch(e){
    console.error("rename-file exception:", e);
    return res.json({ success:false, error:e.toString() });
  }
});

/** تقديم أي ملف ثابت (ومن ضمنه admin.html) */
app.use(express.static(__dirname));

/** مسار احتياطي: أي طلب لا ينطبق على الـAPI أو ملف ثابت → أعد admin.html */
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

/** بدء السيرفر على بورت 3000 (محلي) أو ما تحدده Vercel */
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log("Server listening on port " + port);
});
