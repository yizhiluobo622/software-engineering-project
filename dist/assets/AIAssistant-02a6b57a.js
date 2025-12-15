import{d as k,r as u,c as y,a as s,w as c,v as m,f as S}from"./index-89733f59.js";import{d as a}from"./db-8a84ae2f.js";const f={class:"col"},D={class:"grid cols-2"},O={class:"panel col"},J={class:"panel col"},N={class:"panel col"},h=k({__name:"AIAssistant",setup(b){const d=u(""),p=u(`这里是我的课程及日程安排等，请你按下述格式进行分析与建议，并在必要时给出修改方案：

【数据占位】
在此粘贴我导出的 JSON 摘要

【格式说明】
{
  "tasks": [
    { "title": "任务标题", "dueAt": "YYYY-MM-DD", "priority": "low|mid|high", "tags": ["标签1","标签2"] }
  ],
  "courses": [
    { "name": "课程名称", "term": "学期", "tags": ["标签"], "modules": [
      { "title": "模块标题", "order": 1 }
    ]}
  ]
}

要求：
1. 如果你对我的日程安排有修改建议，可以按上面的 JSON 结构给我建议。
2. 对“tasks”中的日期请使用 YYYY-MM-DD。
3. 优先级仅允许 low、mid、high 三种。
4. 如需新增课程或模块请完整填充 courses 数组。
5. 如果你有什么生活上的建议，或者习惯的养成建议，可以顺带告诉我。
`),n=u("");function w(){window.open("https://chat.deepseek.com/","_blank")}async function A(){const r=await a.courses.toArray(),t=await a.modules.toArray(),e=await a.tasks.toArray(),i=r.map(o=>({name:o.name,term:o.term,tags:o.tags,modules:t.filter(l=>l.courseId===o.id).map(l=>({title:l.title,order:l.order}))})),v=e.map(o=>({title:o.title,dueAt:o.dueAt?new Date(o.dueAt).toISOString().slice(0,10):void 0,priority:o.priority,tags:o.tags}));d.value=JSON.stringify({tasks:v,courses:i},null,2)}async function g(){let r;try{r=JSON.parse(n.value||"{}")}catch{alert("JSON 解析失败，请检查格式");return}await a.transaction("rw",a.tasks,a.courses,a.modules,async()=>{if(Array.isArray(r.tasks)){await a.tasks.clear();const t=r.tasks.map(e=>({id:`${Math.random().toString(36).slice(2)}`,title:String(e.title||""),dueAt:e.dueAt?new Date(e.dueAt).getTime():void 0,priority:["low","mid","high"].includes(e.priority)?e.priority:"mid",tags:Array.isArray(e.tags)?e.tags:[],done:!1,createdAt:Date.now()}));await a.tasks.bulkAdd(t)}if(Array.isArray(r.courses)){await a.courses.clear(),await a.modules.clear();for(const t of r.courses){const e=`${Math.random().toString(36).slice(2)}`;if(await a.courses.add({id:e,name:String(t.name||""),term:String(t.term||""),tags:Array.isArray(t.tags)?t.tags:[],createdAt:Date.now()}),Array.isArray(t.modules))for(const i of t.modules)await a.modules.add({id:`${Math.random().toString(36).slice(2)}`,courseId:e,title:String(i.title||""),order:Number(i.order||1)})}}}),alert("导入完成，已覆盖本地数据（任务与课程/模块）")}return(r,t)=>(S(),y("div",f,[s("div",{class:"row"},[t[3]||(t[3]=s("div",{class:"h1"},"AI 助手",-1)),t[4]||(t[4]=s("span",{class:"muted"},"跳转至 DeepSeek 官网对话，并使用以下框中的内容与结果",-1)),s("button",{onClick:w},"打开 DeepSeek 官网")]),s("div",D,[s("div",O,[t[5]||(t[5]=s("div",{class:"h3"},"本地数据导出（摘要 JSON）",-1)),s("div",{class:"row"},[s("button",{onClick:A},"生成数据摘要 JSON")]),c(s("textarea",{"onUpdate:modelValue":t[0]||(t[0]=e=>d.value=e),rows:"14",placeholder:'点击“生成数据摘要 JSON”后，此处将填充 {"tasks":[...], "courses":[...]}'},null,512),[[m,d.value]])]),s("div",J,[t[6]||(t[6]=s("div",{class:"h3"},"给 DeepSeek 的提示词（预装）",-1)),t[7]||(t[7]=s("div",{class:"muted"},"提示：请将导出的数据复制到下方提示词中的占位位置",-1)),c(s("textarea",{"onUpdate:modelValue":t[1]||(t[1]=e=>p.value=e),rows:"14"},null,512),[[m,p.value]])])]),s("div",N,[t[8]||(t[8]=s("div",{class:"h3"},"导入 DeepSeek 回复（JSON）",-1)),c(s("textarea",{"onUpdate:modelValue":t[2]||(t[2]=e=>n.value=e),rows:"16",placeholder:'粘贴 AI 返回的 JSON，如 {"tasks":[...], "courses":[...]}'},null,512),[[m,n.value]]),s("div",{class:"row"},[s("button",{class:"danger",onClick:g},"一键导入（覆盖本地数据）")])])]))}});export{h as default};
