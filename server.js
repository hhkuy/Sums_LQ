require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(bodyParser.json({ limit: '10mb' }));
app.use(cors());

// متغيرات البيئة
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_USER = process.env.GITHUB_USER;
const MAIN_REPO_NAME = process.env.MAIN_REPO_NAME;
const IMAGES_REPO_NAME = process.env.IMAGES_REPO_NAME;

const githubHeaders = {
  'Authorization': `Bearer ${GITHUB_TOKEN}`,
  'Accept': 'application/vnd.github+json'
};

function githubUrl(repo, filePath){
  return `https://api.github.com/repos/${GITHUB_USER}/${repo}/contents/${filePath}`;
}

// دالة مساعدة لجلب SHA
async function getFileSha(repoName, filePath){
  const url = githubUrl(repoName, filePath);
  const res = await fetch(url, { headers: githubHeaders });
  if(res.status === 200){
    let j = await res.json();
    if(j.sha) return j.sha;
  }
  return null;
}

/* ================== API Endpoints ================== */

/** 1) جلب exp_topics.json */
app.get('/api/get-exp-topics', async (req, res) => {
  try {
    const filePath = 'exp_data/exp_topics.json';
    const url = githubUrl(MAIN_REPO_NAME, filePath);
    let resp = await fetch(url, { headers: githubHeaders });
    if(resp.status!==200){
      let txt = await resp.text();
      return res.json({ success:false, error:txt });
    }
    let j = await resp.json();
    let decoded = Buffer.from(j.content, 'base64').toString('utf8');
    let parsed = JSON.parse(decoded);
    return res.json({ success:true, content:parsed, sha:j.sha });
  } catch(e){
    return res.json({ success:false, error:e.toString() });
  }
});

/** 2) حفظ exp_topics.json */
app.post('/api/save-exp-topics', async (req, res) => {
  try {
    let { content, sha } = req.body;
    const filePath = 'exp_data/exp_topics.json';
    const url = githubUrl(MAIN_REPO_NAME, filePath);

    let encoded = Buffer.from(JSON.stringify(content, null, 2)).toString('base64');
    let body = {
      message: "Update exp_topics.json",
      content: encoded,
      sha: sha
    };
    let resp = await fetch(url, {
      method:'PUT',
      headers:{ ...githubHeaders, 'Content-Type':'application/json' },
      body: JSON.stringify(body)
    });
    let rj = await resp.json();
    if(!rj.content){
      return res.json({ success:false, error:rj.message||'Unknown error' });
    }
    return res.json({ success:true });
  } catch(e){
    return res.json({ success:false, error:e.toString() });
  }
});

/** 3) إضافة ملف جديد (محتوى) في exp_data */
app.post('/api/add-file', async (req, res) => {
  try {
    let { fileName, customTitle } = req.body;
    if(!fileName) return res.json({ success:false, error:'No fileName provided.' });

    let pathFile = `exp_data/${fileName}`;
    let defaultJson = {
      title: customTitle || fileName.replace('.json',''),
      content: ""
    };
    let encoded = Buffer.from(JSON.stringify(defaultJson, null, 2)).toString('base64');

    let url = githubUrl(MAIN_REPO_NAME, pathFile);
    let body = {
      message: `Create new file: ${fileName}`,
      content: encoded
    };
    let resp = await fetch(url, {
      method:'PUT',
      headers:{ ...githubHeaders, 'Content-Type':'application/json' },
      body: JSON.stringify(body)
    });
    let j = await resp.json();
    if(j.content){
      return res.json({ success:true, filePath: pathFile });
    } else {
      return res.json({ success:false, error:j.message||'Could not create file' });
    }
  } catch(e){
    return res.json({ success:false, error:e.toString() });
  }
});

/** 4) واجهة rename-file (لإعادة تسمية ملف) */
app.post('/api/rename-file', async (req, res) => {
  try {
    let { fileName, oldContentObj, oldPath } = req.body;
    if(!fileName) return res.json({ success:false, error:'No new fileName' });
    if(!oldPath) return res.json({ success:false, error:'No oldPath' });

    let newPath = `exp_data/${fileName}`;

    // 1) أنشئ الملف الجديد
    let newContentEncoded = Buffer.from(JSON.stringify(oldContentObj, null, 2)).toString('base64');
    let createUrl = githubUrl(MAIN_REPO_NAME, newPath);
    let createBody = {
      message: `Rename from ${oldPath} to ${newPath}`,
      content: newContentEncoded
    };
    let createResp = await fetch(createUrl, {
      method:'PUT',
      headers:{...githubHeaders, 'Content-Type':'application/json'},
      body: JSON.stringify(createBody)
    });
    let createJ = await createResp.json();
    if(!createJ.content){
      return res.json({ success:false, error:createJ.message||'Could not create new file' });
    }

    // 2) احذف القديم
    let oldSha = await getFileSha(MAIN_REPO_NAME, oldPath);
    if(oldSha){
      let delUrl = githubUrl(MAIN_REPO_NAME, oldPath);
      let delBody = {
        message: `Delete old file: ${oldPath}`,
        sha: oldSha
      };
      let delResp = await fetch(delUrl, {
        method:'DELETE',
        headers:{...githubHeaders, 'Content-Type':'application/json'},
        body: JSON.stringify(delBody)
      });
      let delJ = await delResp.json();
      if(!delJ.commit){
        return res.json({ success:false, error:delJ.message||'Could not delete old file' });
      }
    }

    return res.json({ success:true });
  } catch(e){
    return res.json({ success:false, error:e.toString() });
  }
});

/** 5) حذف ملف من المستودع الرئيسي */
app.delete('/api/delete-file', async (req, res) => {
  try {
    let filePath = req.query.filePath;
    if(!filePath) return res.json({ success:false, error:'No filePath provided' });
    let sha = await getFileSha(MAIN_REPO_NAME, filePath);
    if(!sha) return res.json({ success:false, error:'File not found or no SHA' });

    let url = githubUrl(MAIN_REPO_NAME, filePath);
    let body = {
      message: `Delete file: ${filePath}`,
      sha: sha
    };
    let resp = await fetch(url, {
      method:'DELETE',
      headers:{ ...githubHeaders, 'Content-Type':'application/json' },
      body: JSON.stringify(body)
    });
    let j = await resp.json();
    if(j.commit){
      return res.json({ success:true });
    } else {
      return res.json({ success:false, error:j.message||'Could not delete file' });
    }
  } catch(e){
    return res.json({ success:false, error:e.toString() });
  }
});

/** 6) جلب ملف محتوى (dataFile) */
app.get('/api/get-content-file', async (req, res) => {
  try {
    let filePath = req.query.filePath;
    if(!filePath) return res.json({ success:false, error:'No filePath provided' });

    let urlF = githubUrl(MAIN_REPO_NAME, filePath);
    let resp = await fetch(urlF, { headers: githubHeaders });
    if(resp.status!==200){
      let txt = await resp.text();
      return res.json({ success:false, error:txt });
    }
    let j = await resp.json();
    let contentDecoded = Buffer.from(j.content, 'base64').toString('utf8');
    let parsed;
    try {
      parsed = JSON.parse(contentDecoded);
    } catch(e){
      parsed = { content: contentDecoded };
    }
    return res.json({ success:true, content:parsed, sha:j.sha });
  } catch(e){
    return res.json({ success:false, error:e.toString() });
  }
});

/** 7) حفظ ملف محتوى */
app.post('/api/save-content-file', async (req, res) => {
  try {
    let { filePath, sha, newContent } = req.body;
    if(!filePath || !sha) return res.json({ success:false, error:'Missing filePath or sha' });

    let existingSha = await getFileSha(MAIN_REPO_NAME, filePath);
    if(existingSha && existingSha!==sha){
      console.warn("Possible conflict: local sha != remote sha for", filePath);
    }

    let getUrl = githubUrl(MAIN_REPO_NAME, filePath);
    let getResp = await fetch(getUrl, { headers: githubHeaders });
    if(getResp.status!==200){
      let t = await getResp.text();
      return res.json({ success:false, error:'Cannot read old file: '+t });
    }
    let getJ = await getResp.json();
    let oldDecoded = Buffer.from(getJ.content, 'base64').toString('utf8');
    let parsedOld;
    try { parsedOld = JSON.parse(oldDecoded); }
    catch(e){ parsedOld = { content: oldDecoded }; }

    parsedOld.content = newContent;

    let updated = Buffer.from(JSON.stringify(parsedOld, null, 2)).toString('base64');
    let putBody = {
      message: `Update content file: ${filePath}`,
      content: updated,
      sha: getJ.sha
    };
    let putResp = await fetch(getUrl, {
      method:'PUT',
      headers:{...githubHeaders, 'Content-Type':'application/json'},
      body: JSON.stringify(putBody)
    });
    let putJ = await putResp.json();
    if(putJ.content && putJ.content.sha){
      return res.json({ success:true, newSha: putJ.content.sha });
    } else {
      return res.json({ success:false, error: putJ.message||'Could not update file' });
    }
  } catch(e){
    return res.json({ success:false, error:e.toString() });
  }
});

/** 8) رفع صورة إلى مستودع الصور */
app.post('/api/upload-image', async (req, res) => {
  try {
    let { name, base64 } = req.body;
    if(!name || !base64) return res.json({ success:false, error:'Missing name or base64' });

    let extension = name.split('.').pop().toLowerCase();
    if(!['jpg','jpeg','png','gif','webp'].includes(extension)){
      extension = 'png';
    }
    let newFileName = Date.now() + '.' + extension;
    let filePath = `pic/${newFileName}`;

    let existSha = await getFileSha(IMAGES_REPO_NAME, filePath);
    if(existSha){
      newFileName = Date.now()+'_'+Math.floor(Math.random()*1000)+'.'+extension;
      filePath = `pic/${newFileName}`;
    }

    let urlF = githubUrl(IMAGES_REPO_NAME, filePath);
    let body = {
      message: `Upload image ${newFileName}`,
      content: base64
    };
    let resp = await fetch(urlF, {
      method:'PUT',
      headers:{...githubHeaders, 'Content-Type':'application/json'},
      body: JSON.stringify(body)
    });
    let j = await resp.json();
    if(j.content){
      let rawUrl = `https://raw.githubusercontent.com/${GITHUB_USER}/${IMAGES_REPO_NAME}/main/pic/${newFileName}`;
      return res.json({ success:true, url: rawUrl, filePath: `pic/${newFileName}` });
    } else {
      return res.json({ success:false, error:j.message||'Upload failed' });
    }
  } catch(e){
    return res.json({ success:false, error:e.toString() });
  }
});

/** 9) حذف صورة من مستودع الصور */
app.delete('/api/delete-image', async (req, res) => {
  try {
    let filePath = req.query.filePath;
    if(!filePath) return res.json({ success:false, error:'No filePath provided' });

    let sha = await getFileSha(IMAGES_REPO_NAME, filePath);
    if(!sha) return res.json({ success:false, error:'File not found or no SHA' });

    let urlF = githubUrl(IMAGES_REPO_NAME, filePath);
    let body = {
      message: `Delete image: ${filePath}`,
      sha: sha
    };
    let delResp = await fetch(urlF, {
      method:'DELETE',
      headers:{...githubHeaders, 'Content-Type':'application/json'},
      body: JSON.stringify(body)
    });
    let delJ = await delResp.json();
    if(delJ.commit){
      return res.json({ success:true });
    } else {
      return res.json({ success:false, error:delJ.message||'Could not delete image' });
    }
  } catch(e){
    return res.json({ success:false, error:e.toString() });
  }
});

/** تقديم الملفات الثابتة (admin.html) */
app.use(express.static(__dirname));

/** مسار احتياطي: أي طلب آخر -> admin.html */
app.get('*', (req,res)=>{
  res.sendFile(path.join(__dirname, 'admin.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, ()=>{
  console.log("Server listening on port", port);
});
