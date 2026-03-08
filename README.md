# 日本生活去留决策器

前端 Next.js + 后端 Flask。无登录、无数据库、单次决策展示。

## 结构
- `frontend`：复杂工作流前端
- `backend`：评分与建议接口

## 运行方式

后端：
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python app.py
```

前端：
```bash
cd frontend
npm install
npm run dev
```

可选：设置前端环境变量（默认 `http://localhost:5000`）
```bash
export NEXT_PUBLIC_API_BASE=http://localhost:5000
```

## 说明
- 前端包含分支步骤与权重配置，并在最后调用后端 `/api/evaluate`。
- 后端仅提供一次性评分与建议，不存储任何数据。

## 版权声明
© 2026 Purumomo. All rights reserved.
