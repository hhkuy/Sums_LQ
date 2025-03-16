<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin Panel - Manage Topics & Content</title>
  <!-- Bootstrap 5 CSS -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet" crossorigin="anonymous">
  <!-- Bootstrap Icons -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css">
  <!-- Google Fonts -->
  <link href="https://fonts.googleapis.com/css2?family=Roboto&display=swap" rel="stylesheet">
  <!-- مكتبة Marked.js لتحويل Markdown إلى HTML -->
  <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
  <!-- مكتبة Turndown.js لتحويل HTML إلى Markdown عند التحميل -->
  <script src="https://cdn.jsdelivr.net/npm/turndown/dist/turndown.js"></script>
  <style>
    body {
      background: linear-gradient(135deg, #f5f7fa, #c3cfe2);
      font-family: 'Roboto', sans-serif;
      padding: 20px 0;
    }
    .container-custom {
      max-width: 1200px;
      background-color: #fff;
      padding: 30px;
      border-radius: 15px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.1);
      margin: auto;
    }
    h1 {
      text-align: center;
      margin-bottom: 30px;
      color: #343a40;
      font-weight: 600;
    }
    .card-section {
      margin-bottom: 30px;
      border-radius: 15px;
      overflow: hidden;
    }
    .card-section .card-header {
      background-color: #343a40;
      color: #fff;
      font-size: 1.25em;
    }
    .btn-custom {
      width: 100%;
      padding: 12px;
      font-size: 1.1em;
      border-radius: 50px;
      transition: all 0.3s ease;
    }
    .btn-custom:hover {
      transform: translateY(-3px);
      box-shadow: 0 5px 15px rgba(52, 152, 219, 0.3);
    }
    /* Tree List */
    .topic-node {
      border: 1px solid #dee2e6;
      border-radius: 10px;
      padding: 15px;
      margin-bottom: 15px;
      background-color: #f8f9fa;
    }
    .topic-node .node-title {
      font-weight: bold;
      color: #495057;
    }
    .topic-node .btn-group-sm > .btn {
      margin-right: 5px;
    }
    .sub-node {
      margin-left: 20px;
      margin-top: 10px;
      border-left: 2px dashed #ccc;
      padding-left: 10px;
    }
    /* محرر الماركداون + عرض النتيجة */
    #markdown-input {
      border-radius: 15px;
      overflow: auto;
      resize: none;
      height: 300px;
      width: 100%;
      cursor: grab;
    }
    #markdown-input:active {
      cursor: grabbing;
    }
    #markdown-result {
      margin-top: 20px;
      background-color: #fff;
      padding: 20px;
      border-radius: 15px;
      border: 1px solid #ddd;
      min-height: 200px;
    }
    /* الأزرار العائمة */
    #floatManageTriggersBtn {
      position: fixed;
      width: 50px;
      height: 50px;
      background: #0d6efd;
      color: #fff;
      border: none;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      cursor: pointer;
      z-index: 999;
      top: 50%;
      right: 30px;
      transform: translateY(-140%);
      /* أخفينا الزر */
      display: none !important;
    }
    #floatManageTriggersBtn:hover {
      opacity: 0.8;
    }
    #floatToolsBtn {
      position: fixed;
      width: 50px;
      height: 50px;
      background: #dc3545;
      color: #fff;
      border: none;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      cursor: pointer;
      z-index: 999;
      top: 50%;
      right: 30px;
      transform: translateY(-50%);
      /* أخفينا الزر */
      display: none !important;
    }
    #floatToolsBtn:hover {
      opacity: 0.8;
    }
    #floatScrollBtn {
      position: fixed;
      width: 50px;
      height: 50px;
      background: #4a90e2;
      color: #fff;
      border: none;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      cursor: pointer;
      z-index: 999;
      top: 50%;
      right: 30px;
      transform: translateY(40%);
    }
    #floatScrollBtn:hover {
      opacity: 0.8;
    }

    .modal-overlay {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.5);
      display: none;
      justify-content: center;
      align-items: center;
      z-index: 9999;
    }
    .modal-box {
      background: #fff;
      border-radius: 8px;
      padding: 20px;
      max-width: 500px;
      width: 90%;
      text-align: center;
    }
    .modal-box h3 {
      margin-bottom: 20px;
      font-size: 1.1rem;
      color: #333;
    }
    .modal-buttons {
      display: flex;
      justify-content: center;
      gap: 10px;
      margin-top: 10px;
    }
    /* متفرقات */
    .upload-progress {
      margin-top: 10px;
      display: none;
    }
    .uploaded-images-list {
      margin-top: 10px;
    }
    .uploaded-images-list li {
      margin-bottom: 5px;
    }
    .alert-success {
      margin-top: 10px;
    }
    .selection-guides {
      position: absolute;
      border: 2px dashed red;
      pointer-events: none;
      display: none;
    }
    #selectionDonePrompt {
      display: none;
      margin-top: 10px;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="container-custom">
    <h1><i class="bi bi-journal-text"></i> Admin Panel - Manage Topics & Content</h1>

    <!-- Manage Topics Section -->
    <div class="card card-section">
      <div class="card-header">Manage Topics (exp_topics.json)</div>
      <div class="card-body">
        <div class="mb-3">
          <button class="btn btn-primary btn-custom" onclick="loadExpTopics()">Load exp_topics.json</button>
        </div>

        <div id="topicsTree"></div>

        <hr>

        <!-- Add New Topic/Subtopic Form -->
        <div class="row g-2 align-items-center">
          <div class="col-md-4">
            <input type="text" id="newNodeTitle" class="form-control" placeholder="Title...">
          </div>
          <div class="col-md-4">
            <select id="newNodeType" class="form-select">
              <option value="branch">Branch</option>
              <option value="content">Content</option>
            </select>
          </div>
          <div class="col-md-4">
            <button class="btn btn-success btn-custom" onclick="addNode()">Add Node</button>
          </div>
        </div>

        <!-- اختيار المكان الذي نضيفه تحته (root أم أحد الفروع) -->
        <div class="row g-2 mt-3 align-items-center">
          <div class="col-md-12">
            <label>Select where to add:</label>
            <select id="parentSelect" class="form-select"></select>
          </div>
        </div>

        <hr>
        <div class="mt-3">
          <button class="btn btn-primary btn-custom" onclick="saveExpTopics()">Save All Changes</button>
        </div>
      </div>
    </div>
    <!-- END Manage Topics Section -->

    <!-- Manage Content Section -->
    <div class="card card-section">
      <div class="card-header">Manage Content (files with dataFile)</div>
      <div class="card-body">
        <div class="mb-3">
          <select id="contentNodesSelect" class="form-select">
            <option value="">-- Select Content Node --</option>
          </select>
        </div>
        <div class="mb-3">
          <button class="btn btn-primary btn-custom" onclick="loadContentFile()">Load Content File</button>
        </div>
        <div id="contentLoadMsg"></div>

        <hr>

        <label for="markdown-input" class="form-label">Markdown Editor (drag to scroll):</label>
        <textarea class="form-control" id="markdown-input"></textarea>

        <div id="selectionDonePrompt">
          <div class="bg-light p-3 border rounded">
            <span>Finished text selection?</span>
            <button class="btn btn-sm btn-success ms-2" onclick="selectionDoneYes()">Yes</button>
            <button class="btn btn-sm btn-danger ms-2" onclick="selectionDoneNo()">No</button>
          </div>
        </div>

        <div class="row g-2 mt-2">
          <div class="col-md-12">
            <button class="btn btn-primary w-100 btn-custom" onclick="convertMarkdown()">
              <i class="bi bi-arrow-left-right"></i> Convert
            </button>
          </div>
        </div>

        <div id="markdown-result" style="direction: ltr; margin-top:20px;"></div>

        <hr>

        <div class="row g-2">
          <div class="col-md-6">
            <button class="btn btn-info btn-custom" onclick="printResult()">Print / PDF</button>
          </div>
          <div class="col-md-6">
            <button class="btn btn-success btn-custom" onclick="saveContentChanges()">Save Content</button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- زر عائم لعرض كل الـTriggers (مخفي)-->
  <button id="floatManageTriggersBtn" onclick="openManageTriggersModal()">⚒</button>
  <!-- زر عائم للأدوات المختلفة (مخفي) -->
  <button id="floatToolsBtn" onclick="handleToolsModalClick()">⚙</button>
  <!-- زر عائم للتمرير -->
  <button id="floatScrollBtn" onclick="toggleScroll()">↓</button>

  <!-- النوافذ المنبثقة -->
  <div class="modal-overlay" id="alertOverlay">
    <div class="modal-box">
      <h3 id="alertMsg"></h3>
      <div class="modal-buttons">
        <button class="btn btn-primary" id="alertOkBtn">OK</button>
      </div>
    </div>
  </div>

  <div class="modal-overlay" id="confirmOverlay">
    <div class="modal-box">
      <h3 id="confirmMsg"></h3>
      <div class="modal-buttons">
        <button class="btn btn-primary" id="confirmYesBtn">Yes</button>
        <button class="btn btn-danger" id="confirmNoBtn">No</button>
      </div>
    </div>
  </div>

  <div class="modal-overlay" id="promptOverlay">
    <div class="modal-box">
      <h3 id="promptMsg"></h3>
      <input type="text" id="promptInput" class="form-control mb-3">
      <div class="modal-buttons">
        <button class="btn btn-primary" id="promptOkBtn">OK</button>
        <button class="btn btn-secondary" id="promptCancelBtn">Cancel</button>
      </div>
    </div>
  </div>

  <!-- نافذة منبثقة لأدوات/Triggers (مخفي) -->
  <div class="modal-overlay" id="toolsOverlay">
    <div class="modal-box" id="toolsModalBox">
      <h3>Tools & Triggers</h3>
      <div class="d-grid gap-2">
        <button class="btn btn-outline-secondary" onclick="openTriggerForm('link')">Add Link</button>
        <button class="btn btn-outline-secondary" onclick="openTriggerForm('video')">Add Video</button>
        <button class="btn btn-outline-secondary" onclick="openTriggerForm('iframe')">Add iFrame</button>
        <button class="btn btn-outline-secondary" onclick="openTriggerForm('qids')">Add Q-ID(s)</button>
        <button class="btn btn-outline-secondary" onclick="openTriggerForm('text')">Add Custom Text/Tag</button>
        <button class="btn btn-outline-secondary" onclick="openImageUploader()">Upload Image(s)</button>
      </div>
      <div class="modal-buttons mt-2">
        <button class="btn btn-secondary" onclick="closeToolsModal()">Close</button>
      </div>
    </div>
  </div>

  <!-- نافذة منبثقة لإدارةTriggers (مخفي) -->
  <div class="modal-overlay" id="manageTriggersOverlay">
    <div class="modal-box" id="manageTriggersModalBox">
      <h3>Manage Inserted Triggers</h3>
      <div id="insertedTriggersList" class="mb-3" style="text-align:left; max-height:300px; overflow:auto;"></div>
      <div class="modal-buttons">
        <button class="btn btn-secondary" onclick="closeManageTriggersModal()">Close</button>
      </div>
    </div>
  </div>

  <!-- نافذة منبثقة لخطوات إضافة Trigger محدد (مخفي) -->
  <div class="modal-overlay" id="triggerFormOverlay">
    <div class="modal-box" style="text-align: left;">
      <h3 id="triggerFormTitle">Add Link</h3>
      <div id="triggerFormContent"></div>
      <div class="modal-buttons">
        <button class="btn btn-secondary" onclick="closeTriggerForm()">Cancel</button>
      </div>
    </div>
  </div>

  <!-- نافذة منبثقة لرفع الصور (مخفي) -->
  <div class="modal-overlay" id="imageUploadOverlay">
    <div class="modal-box" style="text-align: left;">
      <h3>Upload or Insert Image</h3>
      <div>
        <label class="form-label">Upload from device:</label>
        <input type="file" id="localImageFile" class="form-control" multiple>
        <button class="btn btn-success w-100 mt-2" onclick="uploadLocalImages()">Upload Selected</button>
        <div class="upload-progress" id="uploadProgress">
          <div class="progress mt-2">
            <div class="progress-bar" role="progressbar" style="width: 0%;" id="uploadProgressBar">0%</div>
          </div>
        </div>
        <hr>
        <label class="form-label">Or use image link:</label>
        <input type="text" id="imageLinkInput" class="form-control" placeholder="https://...">
        <button class="btn btn-primary w-100 mt-2" onclick="insertImageLink()">Insert Link</button>
      </div>
      <hr>
      <div>
        <h5>Uploaded Images:</h5>
        <ul class="uploaded-images-list" id="uploadedImagesList"></ul>
      </div>
      <div class="modal-buttons">
        <button class="btn btn-secondary" onclick="closeImageUploader()">Close</button>
      </div>
    </div>
  </div>

  <div class="selection-guides" id="selectionBox"></div>

  <!-- Bootstrap 5 JS Bundle -->
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js" crossorigin="anonymous"></script>

  <script>
    /**** Alerts, Confirms, Prompts ****/
    let alertOverlay = document.getElementById('alertOverlay');
    let alertMsg = document.getElementById('alertMsg');
    let alertOkBtn = document.getElementById('alertOkBtn');

    let confirmOverlay = document.getElementById('confirmOverlay');
    let confirmMsg = document.getElementById('confirmMsg');
    let confirmYesBtn = document.getElementById('confirmYesBtn');
    let confirmNoBtn = document.getElementById('confirmNoBtn');

    let promptOverlay = document.getElementById('promptOverlay');
    let promptMsg = document.getElementById('promptMsg');
    let promptInput = document.getElementById('promptInput');
    let promptOkBtn = document.getElementById('promptOkBtn');
    let promptCancelBtn = document.getElementById('promptCancelBtn');

    function customAlert(message) {
      return new Promise(resolve => {
        alertMsg.textContent = message;
        alertOverlay.style.display = 'flex';
        alertOkBtn.onclick = () => {
          alertOverlay.style.display = 'none';
          resolve();
        };
      });
    }
    function customConfirm(message) {
      return new Promise(resolve => {
        confirmMsg.textContent = message;
        confirmOverlay.style.display = 'flex';
        confirmYesBtn.onclick = () => {
          confirmOverlay.style.display = 'none';
          resolve(true);
        };
        confirmNoBtn.onclick = () => {
          confirmOverlay.style.display = 'none';
          resolve(false);
        };
      });
    }
    function customPrompt(message, defVal) {
      return new Promise(resolve => {
        promptMsg.textContent = message;
        promptInput.value = defVal || '';
        promptOverlay.style.display = 'flex';
        promptOkBtn.onclick = () => {
          let val = promptInput.value;
          promptOverlay.style.display = 'none';
          resolve(val);
        };
        promptCancelBtn.onclick = () => {
          promptOverlay.style.display = 'none';
          resolve(null);
        };
      });
    }
    window.alert = async function(msg) { await customAlert(msg); };
    window.confirm = async function(msg) { return customConfirm(msg); };
    window.prompt = async function(msg, defVal) { return customPrompt(msg, defVal); };

    /**** Drag to scroll in textarea ****/
    (function enableDragScroll(){
      const mdInput = document.getElementById('markdown-input');
      let isDown = false, startY, scrollTop;
      mdInput.addEventListener('mousedown', e => {
        isDown = true;
        startY = e.pageY - mdInput.offsetTop;
        scrollTop = mdInput.scrollTop;
      });
      mdInput.addEventListener('mouseleave', () => { isDown = false; });
      mdInput.addEventListener('mouseup', () => { isDown = false; });
      mdInput.addEventListener('mousemove', e => {
        if(!isDown) return;
        e.preventDefault();
        const y = e.pageY - mdInput.offsetTop;
        const walk = (y - startY) * 1.5; 
        mdInput.scrollTop = scrollTop - walk;
      });
    })();

    let scrollDown = true;
    function toggleScroll(){
      const btn = document.getElementById('floatScrollBtn');
      if(scrollDown){
        window.scrollTo({top: document.body.scrollHeight, behavior: 'smooth'});
        btn.textContent = '↑';
        scrollDown = false;
      } else {
        window.scrollTo({top: 0, behavior: 'smooth'});
        btn.textContent = '↓';
        scrollDown = true;
      }
    }

    /**** Managing exp_topics.json ****/
    let expTopics = null;
    let topicsSha = null;

    async function loadExpTopics(){
      try {
        const res = await fetch('/api/get-exp-topics');
        const data = await res.json();
        if(!data.success) {
          alert("Failed to load exp_topics.json: " + (data.error || ''));
          return;
        }
        expTopics = data.content;
        topicsSha = data.sha;
        renderTopicsTree();
        fillParentSelect();
        loadContentFileList();
        await alert("exp_topics.json Loaded Successfully!");
      } catch(e){
        console.error(e);
        alert("Error loading exp_topics.json");
      }
    }

    async function saveExpTopics(){
      if(!expTopics){
        alert("No data loaded yet.");
        return;
      }
      let confirmSave = await confirm("Are you sure you want to save changes to exp_topics.json?");
      if(!confirmSave) return;
      try {
        let body = {
          content: expTopics,
          sha: topicsSha
        };
        const res = await fetch('/api/save-exp-topics', {
          method: 'POST',
          headers: { 'Content-Type':'application/json' },
          body: JSON.stringify(body)
        });
        const j = await res.json();
        if(j.success){
          alert("Saved successfully!");
        } else {
          alert("Save failed: " + (j.error || ''));
        }
      } catch(e){
        console.error(e);
        alert("Error saving topics.");
      }
    }

    function renderTopicsTree(){
      const treeContainer = document.getElementById('topicsTree');
      treeContainer.innerHTML = '';
      if(!expTopics || !expTopics.topics) return;
      expTopics.topics.forEach((topic, index) => {
        const node = createNodeElement(topic, ['topics', index], 0);
        treeContainer.appendChild(node);
      });
    }

    function createNodeElement(nodeObj, path, level){
      let div = document.createElement('div');
      div.className = "topic-node";
      let label = document.createElement('div');
      label.className = "node-title mb-2";

      let nodeTitle = nodeObj.title || "Untitled";
      label.textContent = nodeTitle;

      let btnGroup = document.createElement('div');
      btnGroup.className = "btn-group-sm";

      let upBtn = document.createElement('button');
      upBtn.className = "btn btn-secondary";
      upBtn.textContent = "▲";
      upBtn.onclick = () => moveNodeUp(path);
      btnGroup.appendChild(upBtn);

      let downBtn = document.createElement('button');
      downBtn.className = "btn btn-secondary";
      downBtn.textContent = "▼";
      downBtn.onclick = () => moveNodeDown(path);
      btnGroup.appendChild(downBtn);

      let editBtn = document.createElement('button');
      editBtn.className = "btn btn-warning";
      editBtn.textContent = "Edit";
      editBtn.onclick = () => editNodeTitle(path);
      btnGroup.appendChild(editBtn);

      let delBtn = document.createElement('button');
      delBtn.className = "btn btn-danger";
      delBtn.textContent = "Delete";
      delBtn.onclick = () => deleteNode(path);
      btnGroup.appendChild(delBtn);

      label.appendChild(btnGroup);
      div.appendChild(label);

      if(nodeObj.subtopics && Array.isArray(nodeObj.subtopics)){
        nodeObj.subtopics.forEach((subtopic, i) => {
          let subDiv = document.createElement('div');
          subDiv.className = "sub-node";
          let subpath = [...path, 'subtopics', i];
          let element = createNodeElement(subtopic, subpath, level+1);
          subDiv.appendChild(element);
          div.appendChild(subDiv);
        });
      }
      return div;
    }

    function moveNodeUp(path){
      let { parentArray, indexInArray } = getParentArrayAndIndex(path);
      if(indexInArray > 0){
        let temp = parentArray[indexInArray];
        parentArray[indexInArray] = parentArray[indexInArray - 1];
        parentArray[indexInArray - 1] = temp;
        renderTopicsTree();
        fillParentSelect();
        loadContentFileList();
      }
    }
    function moveNodeDown(path){
      let { parentArray, indexInArray } = getParentArrayAndIndex(path);
      if(indexInArray < parentArray.length - 1){
        let temp = parentArray[indexInArray];
        parentArray[indexInArray] = parentArray[indexInArray + 1];
        parentArray[indexInArray + 1] = temp;
        renderTopicsTree();
        fillParentSelect();
        loadContentFileList();
      }
    }
    function getParentArrayAndIndex(path){
      let parentRef = expTopics;
      for(let i = 0; i < path.length - 1; i++){
        parentRef = parentRef[path[i]];
      }
      let indexInArray = path[path.length - 1];
      return { parentArray: parentRef, indexInArray };
    }

    async function editNodeTitle(path){
      let { parentArray, indexInArray } = getParentArrayAndIndex(path);
      let node = parentArray[indexInArray];
      let oldTitle = node.title || '';
      let newTitle = await prompt("Enter new title:", oldTitle);
      if(newTitle !== null){
        newTitle = newTitle.trim();
        if(newTitle === "") return;
        node.title = newTitle;
        if(node.dataFile){
          await renameContentFile(path, node); 
        }
        renderTopicsTree();
        fillParentSelect();
        loadContentFileList();
      }
    }

    async function deleteNode(path){
      let { parentArray, indexInArray } = getParentArrayAndIndex(path);
      let node = parentArray[indexInArray];

      if(node.dataFile){
        let confirmDel = await confirm("This is a content node. Deleting will also remove its file from GitHub. Proceed?");
        if(!confirmDel) return;
        await fetch(`/api/delete-file?filePath=${encodeURIComponent("exp_data/"+node.dataFile)}`, {
          method: 'DELETE'
        }).then(r => r.json()).then(resp => {
          if(!resp.success){
            console.warn("Could not delete file from GitHub:", resp.error);
          }
        }).catch(err=>console.error(err));
      } else {
        let confirmDel = await confirm("Delete this branch (and all sub-branches)?");
        if(!confirmDel) return;
        await deleteNestedDataFiles(node);
      }
      parentArray.splice(indexInArray, 1);
      renderTopicsTree();
      fillParentSelect();
      loadContentFileList();
    }

    async function deleteNestedDataFiles(node){
      if(!node) return;
      if(node.subtopics && Array.isArray(node.subtopics)){
        for(let st of node.subtopics){
          if(st.dataFile){
            await fetch(`/api/delete-file?filePath=${encodeURIComponent("exp_data/"+st.dataFile)}`, {
              method: 'DELETE'
            }).then(r => r.json()).then(resp => {
              if(!resp.success){
                console.warn("Could not delete file from GitHub (nested):", resp.error);
              }
            }).catch(err=>console.error(err));
          }
          if(st.subtopics){
            await deleteNestedDataFiles(st);
          }
        }
      }
    }

    async function renameContentFile(path, node){
      try {
        let oldPath = node.dataFile;
        let parentPath = path.slice(0, -1);
        let newFileName = "";

        let chainForParent = getTitlesChain(parentPath.slice(0, -1));
        let parentChain = chainForParent.map(t => t.replace(/\s+/g, '_').replace(/[^\w_\-]/g, '').toLowerCase()).join('_');
        let childPart = node.title.replace(/\s+/g, '_').replace(/[^\w_\-]/g, '').toLowerCase();
        if(parentChain){
          newFileName = parentChain + "_" + childPart + ".json";
        } else {
          newFileName = childPart + ".json";
        }

        let body = { 
          oldPath, 
          newPath: "exp_data/" + newFileName
        };
        let fullChain = getTitlesChain(path);
        if(fullChain.length > 1){
          let newTitleStr = fullChain.join(" - ");
          body.newTitle = newTitleStr;
        } else {
          body.newTitle = node.title;
        }

        let renameReq = await fetch('/api/rename-file', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
        let renameRes = await renameReq.json();
        if(!renameRes.success){
          await alert("Could not rename file: " + (renameRes.error || ''));
          return;
        }
        node.dataFile = newFileName;
      } catch(e){
        console.error(e);
        alert("Error in renameContentFile: " + e.toString());
      }
    }

    function getTitlesChain(path){
      let chain = [];
      function recurse(nodeList, currentPath){
        for(let i=0; i<nodeList.length; i++){
          let nodeObj = nodeList[i];
          let p = [...currentPath, i];
          if(JSON.stringify(p) === JSON.stringify(path)){
            chain.push(nodeObj.title);
            return true;
          }
          if(nodeObj.subtopics && nodeObj.subtopics.length>0){
            let subPath = [...currentPath, i, 'subtopics'];
            if(recurse(nodeObj.subtopics, subPath)){
              chain.unshift(nodeObj.title);
              return true;
            }
          }
        }
        return false;
      }
      function outer(){
        for(let i=0; i<expTopics.topics.length; i++){
          let nodeObj = expTopics.topics[i];
          if(JSON.stringify(['topics', i]) === JSON.stringify(path)){
            chain.push(nodeObj.title);
            return true;
          }
          if(nodeObj.subtopics && nodeObj.subtopics.length>0){
            let subPath = ['topics', i, 'subtopics'];
            if(recurse(nodeObj.subtopics, subPath)){
              chain.unshift(nodeObj.title);
              return true;
            }
          }
        }
      }
      outer();
      return chain;
    }

    function addNode(){
      if(!expTopics){
        alert("Load exp_topics.json first!");
        return;
      }
      let nodeTitle = document.getElementById('newNodeTitle').value.trim();
      if(!nodeTitle){
        alert("Please enter a title.");
        return;
      }
      let nodeType = document.getElementById('newNodeType').value;
      let parentVal = document.getElementById('parentSelect').value;
      let newObj = { title: nodeTitle };

      if(nodeType === "branch"){
        newObj.subtopics = [];
      } else {
        let fileName = generateFileNameForContent(parentVal, nodeTitle);
        let newJsonTitle = generateTitleFieldForContent(parentVal, nodeTitle);

        (async()=>{
          let createReq = await fetch('/api/add-file', {
            method: 'POST',
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify({ fileName, newJsonTitle })
          });
          let createRes = await createReq.json();
          if(createRes.success){
            newObj.dataFile = fileName;
          } else {
            alert("Could not create file for content. " + (createRes.error||''));
            return;
          }

          if(parentVal === 'root'){
            expTopics.topics.push(newObj);
          } else {
            let { parentArray, indexInArray } = getParentArrayAndIndex(JSON.parse(parentVal));
            let parentNode = parentArray[indexInArray];
            if(!parentNode.subtopics) parentNode.subtopics = [];
            parentNode.subtopics.push(newObj);
          }

          document.getElementById('newNodeTitle').value = '';
          document.getElementById('newNodeType').value = 'branch';
          renderTopicsTree();
          fillParentSelect();
          loadContentFileList();

          if(nodeType === "content" && newObj.dataFile){
            let sel = document.getElementById('contentNodesSelect');
            sel.value = newObj.dataFile;
            await loadContentFile();
          }
        })();
      }

      if(nodeType === "branch"){
        if(parentVal === 'root'){
          expTopics.topics.push(newObj);
        } else {
          let { parentArray, indexInArray } = getParentArrayAndIndex(JSON.parse(parentVal));
          let parentNode = parentArray[indexInArray];
          if(!parentNode.subtopics) parentNode.subtopics = [];
          parentNode.subtopics.push(newObj);
        }
        document.getElementById('newNodeTitle').value = '';
        document.getElementById('newNodeType').value = 'branch';
        renderTopicsTree();
        fillParentSelect();
        loadContentFileList();
      }
    }

    function generateFileNameForContent(parentVal, newTitle){
      if(parentVal === 'root'){
        let fn = newTitle.replace(/\s+/g, '_').replace(/[^\w_\-]/g, '').toLowerCase();
        return fn + ".json";
      } else {
        let realPath = JSON.parse(parentVal);
        let chainTitles = getTitlesChain(realPath);
        let parentChain = chainTitles.map(t => t.replace(/\s+/g, '_').replace(/[^\w_\-]/g, '').toLowerCase()).join('_');
        let childPart = newTitle.replace(/\s+/g, '_').replace(/[^\w_\-]/g, '').toLowerCase();
        return (parentChain ? (parentChain + "_" + childPart) : childPart) + ".json";
      }
    }

    function generateTitleFieldForContent(parentVal, newTitle){
      if(parentVal === 'root'){
        return newTitle;
      } else {
        let realPath = JSON.parse(parentVal);
        let chainTitles = getTitlesChain(realPath);
        if(chainTitles.length > 0){
          return chainTitles.join(" - ") + " - " + newTitle;
        }
        return newTitle;
      }
    }

    function fillParentSelect(){
      let sel = document.getElementById('parentSelect');
      sel.innerHTML = '';
      let optRoot = document.createElement('option');
      optRoot.value = 'root';
      optRoot.textContent = 'Root';
      sel.appendChild(optRoot);

      if(!expTopics || !expTopics.topics) return;
      expTopics.topics.forEach((topic, i) => {
        addNodePathOption(sel, topic, JSON.stringify(['topics', i]), '');
      });
    }

    function addNodePathOption(sel, node, path, prefix){
      let opt = document.createElement('option');
      opt.value = path;
      opt.textContent = prefix + node.title;
      sel.appendChild(opt);
      if(node.subtopics && Array.isArray(node.subtopics)){
        node.subtopics.forEach((sub, i) => {
          let newPath = JSON.stringify([...JSON.parse(path), 'subtopics', i]);
          addNodePathOption(sel, sub, newPath, prefix + node.title + " > ");
        });
      }
    }

    /**** Manage content files ****/
    let currentContentFile = null;
    let currentContentSha = null;
    let originalContentHtml = '';

    function collectContentNodes(nodes, prefix){
      let result = [];
      for(let i=0; i<nodes.length; i++){
        let n = nodes[i];
        let currentPrefix = prefix ? (prefix + " > " + n.title) : n.title;
        if(n.dataFile){
          result.push({ file: n.dataFile, fullPath: currentPrefix });
        }
        if(n.subtopics && n.subtopics.length>0){
          result = result.concat(collectContentNodes(n.subtopics, currentPrefix));
        }
      }
      return result;
    }
    function loadContentFileList(){
      let sel = document.getElementById('contentNodesSelect');
      sel.innerHTML = '<option value="">-- Select Content Node --</option>';
      if(!expTopics || !expTopics.topics) return;
      let all = collectContentNodes(expTopics.topics, "");
      all.forEach(obj => {
        let opt = document.createElement('option');
        opt.value = obj.file;
        opt.textContent = obj.fullPath;
        sel.appendChild(opt);
      });
    }

    async function loadContentFile(){
      let sel = document.getElementById('contentNodesSelect');
      if(!sel.value){
        alert("Please select a content node.");
        return;
      }
      currentContentFile = sel.value;
      try {
        let r = await fetch(`/api/get-content-file?filePath=${encodeURIComponent(currentContentFile)}`);
        let j = await r.json();
        if(!j.success){
          alert("Failed to load content: " + (j.error || ''));
          return;
        }
        currentContentSha = j.sha;
        let contentObj = j.content;
        if(!contentObj.content) contentObj.content = "";
        originalContentHtml = contentObj.content;

        let turndownService = new TurndownService();
        turndownService.addRule('customTriggers', {
          filter: function (node) {
            if(node.nodeName === 'VIDEO') return true;
            if(node.nodeName === 'IMG') return true;
            if(node.nodeName === 'SPAN'){
              const cls = node.className || '';
              if(
                cls.includes('video-trigger') ||
                cls.includes('iframe-trigger') ||
                cls.includes('image-trigger') ||
                cls.includes('question-trigger') ||
                cls.includes('text-trigger') ||
                cls.includes('link-trigger') ||
                cls.includes('multi-trigger')
              ){
                return true;
              }
            }
            return false;
          },
          replacement: function (content, node) {
            if(node.nodeName === 'VIDEO'){
              let src = node.getAttribute('src') || '';
              return `( v: ${src} )`;
            }
            if(node.nodeName === 'IMG'){
              let src = node.getAttribute('src') || '';
              return `( p: ${src} )`;
            }
            let cls = node.className;
            if(cls.includes('multi-trigger')){
              let dataParts = [];
              if(node.hasAttribute('data-qids')){
                dataParts.push(`q: ${node.getAttribute('data-qids')}`);
              }
              if(node.hasAttribute('data-vid-src')){
                let link = node.getAttribute('data-vid-src');
                if(link.includes('youtu')) dataParts.push(`yv: ${link}`);
                else dataParts.push(`v: ${link}`);
              }
              if(node.hasAttribute('data-img-src')){
                dataParts.push(`p: ${node.getAttribute('data-img-src')}`);
              }
              if(node.hasAttribute('data-link-href')){
                dataParts.push(`l: ${node.getAttribute('data-link-href')}`);
              }
              if(node.hasAttribute('data-iframe-src')){
                dataParts.push(`iv: ${node.getAttribute('data-iframe-src')}`);
              }
              if(node.hasAttribute('data-text-content')){
                dataParts.push(`t: ${node.getAttribute('data-text-content')}`);
              }
              let joined = dataParts.join(' / ');
              return `bu ( ${joined} )`;
            }
            else if(cls.includes('video-trigger')){
              let src = node.getAttribute('data-vid-src') || '';
              if(src.includes('youtu')) return `( yv: ${src} )`;
              return `( v: ${src} )`;
            }
            else if(cls.includes('iframe-trigger')){
              let src = node.getAttribute('data-iframe-src') || '';
              return `( iv: ${src} )`;
            }
            else if(cls.includes('image-trigger')){
              let src = node.getAttribute('data-img-src') || '';
              return `( p: ${src} )`;
            }
            else if(cls.includes('question-trigger')){
              let q = node.getAttribute('data-qids') || '';
              return `( q: ${q} )`;
            }
            else if(cls.includes('text-trigger')){
              let t = node.getAttribute('data-text-content') || '';
              return `( t: ${t} )`;
            }
            else if(cls.includes('link-trigger')){
              let l = node.getAttribute('data-link-href') || '';
              return `( l: ${l} )`;
            }
            return content;
          }
        });

        let md = turndownService.turndown(contentObj.content);
        document.getElementById('markdown-input').value = md;
        document.getElementById('markdown-result').innerHTML = contentObj.content;

        document.getElementById('contentLoadMsg').innerHTML =
          `<div class="alert alert-success">Content loaded successfully!</div>`;

        await alert("تم تحميل ملف المحتوى بنجاح، والمحتوى " + (contentObj.content ? "غير فارغ." : "فارغ."));
      } catch(e){
        console.error(e);
        alert("Error loading content file");
      }
    }

    async function saveContentChanges(){
      if(!currentContentFile){
        alert("No content file selected.");
        return;
      }
      let confirmSave = await confirm("Are you sure you want to save current content?");
      if(!confirmSave) return;
      let finalHtml = document.getElementById('markdown-result').innerHTML;
      let payload = {
        filePath: currentContentFile,
        sha: currentContentSha,
        newContent: finalHtml
      };
      try {
        let r = await fetch('/api/save-content-file', {
          method: 'POST',
          headers: {'Content-Type':'application/json'},
          body: JSON.stringify(payload)
        });
        let j = await r.json();
        if(j.success){
          alert("Content saved!");
          originalContentHtml = finalHtml;
          currentContentSha = j.newSha;
        } else {
          alert("Save failed: " + (j.error || ''));
        }
      } catch(e){
        console.error(e);
        alert("Error saving content file.");
      }
    }

    /**** Parsing triggers in Markdown -> HTML ****/
    function parseTriggersInMarkdown(mdText){
      // معالجة صيغة bu(...) للزر:
      let buRegex = /bu\s*\(\s*([^)]*)\)/g;
      mdText = mdText.replace(buRegex, (match, inner) => {
        let parts = inner.split('/').map(x => x.trim());
        let dataObj = {
          'data-qids': '',
          'data-vid-src': '',
          'data-img-src': '',
          'data-link-href': '',
          'data-iframe-src': '',
          'data-text-content': ''
        };
        parts.forEach(p => {
          let cInd = p.indexOf(':');
          if(cInd > -1){
            let key = p.slice(0, cInd).trim();
            let val = p.slice(cInd+1).trim();
            switch(key){
              case 'q': dataObj['data-qids'] = val; break;
              case 'yv': dataObj['data-vid-src'] = val; break;
              case 'v': dataObj['data-vid-src'] = val; break;
              case 'p': dataObj['data-img-src'] = val; break;
              case 'l': dataObj['data-link-href'] = val; break;
              case 'iv': dataObj['data-iframe-src'] = val; break;
              case 't': dataObj['data-text-content'] = val; break;
            }
          }
        });
        let dataString = '';
        Object.entries(dataObj).forEach(([k,v]) => {
          if(v) dataString += ` ${k}="${v}"`;
        });
        return `<span class="multi-trigger"${dataString}>bu ( ${inner} )</span>`;
      });

      // معالجة الصيغ المنفردة: ( v: ... ) , ( p: ... ), ( yv: ... ), ( q: ... ), ( iv: ... ), ( l: ... ), ( t: ... ), إلخ
      let inlineRegex = /\(\s*([^()]+)\s*\)/g;
      mdText = mdText.replace(inlineRegex, (fullMatch, inner) => {
        if(fullMatch.includes('<span') || fullMatch.includes('</span>') ||
           fullMatch.includes('<video') || fullMatch.includes('<img')){
          return fullMatch;
        }
        let splitted = inner.split('/').map(x=>x.trim());
        // لو كانت متعددة ( / ) بدون bu => multi-trigger كذلك (لكن اسم العرض يكون مجرد ( ... ))
        if(splitted.length>1){
          let mData = {
            'data-qids': '',
            'data-vid-src': '',
            'data-img-src': '',
            'data-link-href': '',
            'data-iframe-src': '',
            'data-text-content': ''
          };
          splitted.forEach(s => {
            let cInd = s.indexOf(':');
            if(cInd>-1){
              let key = s.slice(0,cInd).trim();
              let val = s.slice(cInd+1).trim();
              switch(key){
                case 'q': mData['data-qids'] = val; break;
                case 'yv': mData['data-vid-src'] = val; break;
                case 'v': mData['data-vid-src'] = val; break;
                case 'p': mData['data-img-src'] = val; break;
                case 'l': mData['data-link-href'] = val; break;
                case 'iv': mData['data-iframe-src'] = val; break;
                case 't': mData['data-text-content'] = val; break;
              }
            }
          });
          let dataString = '';
          Object.entries(mData).forEach(([k,v]) => {
            if(v) dataString += ` ${k}="${v}"`;
          });
          return `<span class="multi-trigger"${dataString}>(${inner})</span>`;
        }
        // صيغة مفردة
        let cInd = inner.indexOf(':');
        if(cInd===-1) return fullMatch;
        let key = inner.slice(0, cInd).trim();
        let val = inner.slice(cInd+1).trim();
        switch(key){
          case 'v':
            return `<video src="${val}" controls="">Video</video>`;
          case 'yv':
            return `<span class="video-trigger" data-vid-src="${val}">YouTube Video</span>`;
          case 'p':
            return `<img src="${val}" alt="Image" />`;
          case 'iv':
            return `<span class="iframe-trigger" data-iframe-src="${val}">Embed iFrame</span>`;
          case 'q':
            return `<span class="question-trigger" data-qids="${val}">Question</span>`;
          case 'l':
            return `<span class="link-trigger" data-link-href="${val}">external link</span>`;
          case 't':
            return `<span class="text-trigger" data-text-content="${val}">some text</span>`;
          default:
            return fullMatch;
        }
      });

      return mdText;
    }

    function convertMarkdown(){
      let markdownText = document.getElementById('markdown-input').value;
      let processedMD = parseTriggersInMarkdown(markdownText);
      const htmlContent = marked.parse(processedMD);
      document.getElementById('markdown-result').innerHTML = htmlContent;
      currentDirection = detectTextDirection(markdownText);
      document.getElementById('markdown-result').style.direction = currentDirection;
    }

    function detectTextDirection(text){
      let arabicCount=0, totalCount=0;
      for(let char of text){
        if(!char.match(/\s/)){
          totalCount++;
          if(char.match(/[\u0600-\u06FF]/)) arabicCount++;
        }
      }
      if(totalCount===0) return 'rtl';
      return (arabicCount / totalCount > 0.3) ? 'rtl' : 'ltr';
    }

    function printResult(){
      const resultDivContent = document.getElementById('markdown-result').innerHTML;
      const printWindow = window.open('about:blank','_blank','width=800,height=600');
      const langAttr = (currentDirection==='rtl') ? 'ar':'en';
      const styleContent = `
        @media print {
          body { -webkit-print-color-adjust: exact; }
        }
        body {
          font-family: 'Roboto', sans-serif;
          background: linear-gradient(135deg, #faf3e7, #eef7f6);
          margin: 0;
          padding: 0;
          color: #2c3e50;
        }
        #printResult { padding: 20px; }
      `;
      printWindow.document.write(`
        <html lang="${langAttr}" dir="${currentDirection}">
        <head>
          <meta charset="UTF-8" />
          <title>Print Result</title>
          <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.rtl.min.css" rel="stylesheet" crossorigin="anonymous">
          <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css">
          <style>${styleContent}</style>
        </head>
        <body>
          <div id="printResult" style="direction: ${currentDirection};">
            ${resultDivContent}
          </div>
          <script>
            window.onload = function(){ window.print(); }
          <\/script>
        </body>
        </html>
      `);
      printWindow.document.close();
    }

    /**** Hidden floating tools ****/
    let selectionInProgress = false;
    function handleToolsModalClick(){
      if(selectionInProgress){
        document.getElementById('selectionDonePrompt').style.display='block';
      } else {
        openToolsModal();
      }
    }
    function openToolsModal(){
      document.getElementById('toolsOverlay').style.display='flex';
    }
    function closeToolsModal(){
      document.getElementById('toolsOverlay').style.display='none';
    }
    function openManageTriggersModal(){
      let overlay = document.getElementById('manageTriggersOverlay');
      let container = document.getElementById('insertedTriggersList');
      container.innerHTML="Here we can list triggers found in the HTML, reorder or delete them... (Feature in progress)";
      overlay.style.display='flex';
    }
    function closeManageTriggersModal(){
      document.getElementById('manageTriggersOverlay').style.display='none';
    }

    let userSelectionRange = null;
    let currentTriggerType = null;

    function openTriggerForm(type){
      closeToolsModal();
      currentTriggerType=type;
      let overlay = document.getElementById('triggerFormOverlay');
      let titleEl = document.getElementById('triggerFormTitle');
      let contentEl = document.getElementById('triggerFormContent');
      overlay.style.display='flex';
      contentEl.innerHTML="";

      let formHtml="";
      switch(type){
        case 'link':
          titleEl.textContent="Add Link Trigger";
          formHtml=`
          <div class="mb-2">
            <label>Description (optional):</label>
            <input type="text" id="triggerDesc" class="form-control" placeholder="Write any description...">
          </div>
          <div class="mb-2">
            <button class="btn btn-sm btn-info" onclick="startSelectionMode()">Select Text Range</button>
            <small class="text-muted">Then choose position (before, after, inside)</small>
          </div>
          <div class="mb-2">
            <label>Insert Position:</label>
            <select id="triggerPosition" class="form-select">
              <option value="before">Before</option>
              <option value="after">After</option>
              <option value="inside">Inside</option>
            </select>
          </div>
          <div class="mb-2">
            <label>Link URL:</label>
            <input type="text" id="triggerLinkUrl" class="form-control" placeholder="https://...">
          </div>
          <button class="btn btn-primary w-100" onclick="applyTriggerInsertion()">تم</button>
          `;
          break;
        case 'video':
          titleEl.textContent="Add Video Trigger";
          formHtml=`
          <div class="mb-2">
            <label>Description (optional):</label>
            <input type="text" id="triggerDesc" class="form-control" placeholder="Write any description...">
          </div>
          <div class="mb-2">
            <button class="btn btn-sm btn-info" onclick="startSelectionMode()">Select Text Range</button>
            <small class="text-muted">Position: before/after/inside</small>
          </div>
          <div class="mb-2">
            <label>Insert Position:</label>
            <select id="triggerPosition" class="form-select">
              <option value="before">Before</option>
              <option value="after">After</option>
              <option value="inside">Inside</option>
            </select>
          </div>
          <div class="mb-2">
            <label>Video URL:</label>
            <input type="text" id="triggerLinkUrl" class="form-control" placeholder="https://...">
          </div>
          <button class="btn btn-primary w-100" onclick="applyTriggerInsertion()">تم</button>
          `;
          break;
        case 'iframe':
          titleEl.textContent="Add iFrame Trigger";
          formHtml=`
          <div class="mb-2">
            <label>Description (optional):</label>
            <input type="text" id="triggerDesc" class="form-control" placeholder="Write any description...">
          </div>
          <div class="mb-2">
            <button class="btn btn-sm btn-info" onclick="startSelectionMode()">Select Text Range</button>
            <small class="text-muted">Position: before/after/inside</small>
          </div>
          <div class="mb-2">
            <label>iFrame embed URL (YouTube, etc.):</label>
            <input type="text" id="triggerLinkUrl" class="form-control" placeholder="https://www.youtube.com/embed/VIDEO_ID">
          </div>
          <div class="mb-2">
            <label>Insert Position:</label>
            <select id="triggerPosition" class="form-select">
              <option value="before">Before</option>
              <option value="after">After</option>
              <option value="inside">Inside</option>
            </select>
          </div>
          <button class="btn btn-primary w-100" onclick="applyTriggerInsertion()">تم</button>
          `;
          break;
        case 'qids':
          titleEl.textContent="Add Q-ID(s)";
          formHtml=`
          <div class="mb-2">
            <label>Description (optional):</label>
            <input type="text" id="triggerDesc" class="form-control" placeholder="Write any description...">
          </div>
          <div class="mb-2">
            <button class="btn btn-sm btn-info" onclick="startSelectionMode()">Select Text Range</button>
            <small class="text-muted">Position: before/after/inside</small>
          </div>
          <div class="mb-2">
            <label>Q-IDs (separated by space):</label>
            <input type="text" id="triggerLinkUrl" class="form-control" placeholder="e.g. anat-lowe-q77 anat-lowe-q80">
          </div>
          <div class="mb-2">
            <label>Insert Position:</label>
            <select id="triggerPosition" class="form-select">
              <option value="before">Before</option>
              <option value="after">After</option>
              <option value="inside">Inside</option>
            </select>
          </div>
          <button class="btn btn-primary w-100" onclick="applyTriggerInsertion()">تم</button>
          `;
          break;
        case 'text':
          titleEl.textContent="Add Custom Text/Tag";
          formHtml=`
          <div class="mb-2">
            <label>Description (optional):</label>
            <input type="text" id="triggerDesc" class="form-control" placeholder="Write any description...">
          </div>
          <div class="mb-2">
            <button class="btn btn-sm btn-info" onclick="startSelectionMode()">Select Text Range</button>
            <small class="text-muted">Position: before/after/inside</small>
          </div>
          <div class="mb-2">
            <label>Custom HTML / text:</label>
            <textarea id="triggerLinkUrl" class="form-control"></textarea>
          </div>
          <div class="mb-2">
            <label>Insert Position:</label>
            <select id="triggerPosition" class="form-select">
              <option value="before">Before</option>
              <option value="after">After</option>
              <option value="inside">Inside</option>
            </select>
          </div>
          <button class="btn btn-primary w-100" onclick="applyTriggerInsertion()">تم</button>
          `;
          break;
      }
      contentEl.innerHTML=formHtml;
    }

    function closeTriggerForm(){
      document.getElementById('triggerFormOverlay').style.display='none';
    }
    function startSelectionMode(){
      document.getElementById('triggerFormOverlay').style.display='none';
      selectionInProgress=true;
      document.getElementById('selectionDonePrompt').style.display='block';
      alert("قم بتحديد النص في خانة الماركداون.");
    }
    function selectionDoneYes(){
      document.getElementById('selectionDonePrompt').style.display='none';
      let ta=document.getElementById('markdown-input');
      let start=ta.selectionStart; 
      let end=ta.selectionEnd;
      userSelectionRange={start,end};
      selectionInProgress=false;
      document.getElementById('triggerFormOverlay').style.display='flex';
    }
    function selectionDoneNo(){
      document.getElementById('selectionDonePrompt').style.display='none';
      selectionInProgress=true;
    }

    function applyTriggerInsertion(){
      if(!userSelectionRange){
        alert("No selection range set. Please select text range first.");
        return;
      }
      let desc=document.getElementById('triggerDesc')? document.getElementById('triggerDesc').value:"";
      let pos=document.getElementById('triggerPosition')? document.getElementById('triggerPosition').value:"before";
      let valEl=document.getElementById('triggerLinkUrl');
      let val= valEl ? (valEl.value||""):"";

      let ta=document.getElementById('markdown-input');
      let textVal=ta.value;
      let beforeText=textVal.slice(0,userSelectionRange.start);
      let selectedText=textVal.slice(userSelectionRange.start,userSelectionRange.end);
      let afterText=textVal.slice(userSelectionRange.end);
      let finalInsert="";

      switch(currentTriggerType){
        case 'link':
          let linkInner= desc ? (selectedText||desc) : "LinkHere";
          if(!val) val="#";
          finalInsert=`[${linkInner}](${val})`;
          break;
        case 'video':
          let vidDesc=desc||"Video";
          finalInsert=`\n<video src="${val}" controls>${vidDesc}</video>\n`;
          break;
        case 'iframe':
          let ifDesc=desc||"iFrame desc";
          finalInsert=`\n<div>\n<h4>${ifDesc}</h4>\n<iframe src="${val}" width="560" height="315" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>\n</div>\n`;
          break;
        case 'qids':
          let qdesc= desc ? (selectedText||desc):"Question Trigger";
          let splitted=val.split(/\s+/).join(", ");
          finalInsert=`<span class="question-trigger" data-qids="${splitted}">${qdesc}</span>`;
          break;
        case 'text':
          finalInsert= val;
          break;
      }

      let replaced="";
      if(pos==="before"){
        replaced= beforeText+ finalInsert+ selectedText+ afterText;
      } else if(pos==="after"){
        replaced= beforeText+ selectedText+ finalInsert+ afterText;
      } else {
        replaced= beforeText+ selectedText + finalInsert+ afterText;
      }
      ta.value=replaced;
      convertMarkdown();
      userSelectionRange=null;
      closeTriggerForm();
    }

    /**** Image uploading ****/
    function openImageUploader(){
      closeToolsModal();
      document.getElementById('imageUploadOverlay').style.display='flex';
      document.getElementById('localImageFile').value="";
      document.getElementById('uploadProgress').style.display='none';
      document.getElementById('uploadProgressBar').style.width='0%';
      document.getElementById('uploadProgressBar').textContent='0%';
      document.getElementById('imageLinkInput').value="";
      document.getElementById('uploadedImagesList').innerHTML="";
    }
    function closeImageUploader(){
      document.getElementById('imageUploadOverlay').style.display='none';
    }
    function insertImageLink(){
      let linkVal=document.getElementById('imageLinkInput').value.trim();
      if(!linkVal) return;
      let mdInput=document.getElementById('markdown-input');
      mdInput.value+=`\n![Image](${linkVal})\n`;
      convertMarkdown();
      alert("تم إضافة رابط الصورة!");
    }
    async function uploadLocalImages(){
      let files=document.getElementById('localImageFile').files;
      if(!files||files.length===0)return;
      let ul=document.getElementById('uploadedImagesList');
      document.getElementById('uploadProgress').style.display='block';
      for(let i=0;i<files.length;i++){
        let f=files[i];
        let reader=new FileReader();
        reader.onload= async function(e){
          let base64Data=e.target.result.split(',')[1];
          let body={ name:f.name, base64:base64Data };
          document.getElementById('uploadProgressBar').style.width='50%';
          document.getElementById('uploadProgressBar').textContent='Uploading... (50%)';
          let r=await fetch('/api/upload-image',{
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify(body)
          });
          let j=await r.json();
          if(j.success){
            document.getElementById('uploadProgressBar').style.width='100%';
            document.getElementById('uploadProgressBar').textContent='100%';
            let li=document.createElement('li');
            li.innerHTML=`Uploaded: <a href="${j.url}" target="_blank">${j.url}</a> 
              <button class="btn btn-sm btn-danger ms-2" onclick="deleteImage('${j.filePath}', this)">Delete</button>
              <button class="btn btn-sm btn-info ms-2" onclick="insertThisImageLink('${j.url}')">Insert</button>`;
            ul.appendChild(li);
          } else {
            let li=document.createElement('li');
            li.innerHTML=`Error uploading ${f.name}: ${j.error||'unknown error'}`;
            ul.appendChild(li);
          }
        };
        reader.readAsDataURL(f);
      }
    }
    function insertThisImageLink(url){
      let mdInput=document.getElementById('markdown-input');
      mdInput.value+=`\n![Image](${url})\n`;
      convertMarkdown();
      alert("تم إدراج الصورة في الماركداون!");
    }
    async function deleteImage(filePath,btnRef){
      let conf=await confirm("Are you sure you want to delete this image from GitHub?");
      if(!conf)return;
      let r=await fetch(`/api/delete-image?filePath=${encodeURIComponent(filePath)}`,{
        method:'DELETE'
      });
      let j=await r.json();
      if(j.success){
        alert("Image deleted!");
        btnRef.parentElement.remove();
      } else {
        alert("Failed to delete image: "+(j.error||''));
      }
    }
  </script>
</body>
</html>
