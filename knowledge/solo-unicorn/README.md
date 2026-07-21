# Solo Unicorn AI 原生组织配置清单

本目录保存用于 DayDayUp / StaffDeck 的可迁移知识源。浏览器中的员工、Skill、SOP、定时任务、记忆和工具配置保存在应用数据库中；部署或迁移时必须同时备份数据库与上传文件卷，不能只复制这些 Markdown 文件。

## 当前模型

- 默认模型：DeepSeek V4 Flash
- 状态：已启用，用户已在本地完成连通性测试
- 安全要求：API Key 只保存在部署环境的 Secret 或环境变量中，不写入 Git、镜像或本文档

## 数字员工组织

| 员工 | 职责 | Skill | SOP |
| --- | --- | --- | --- |
| Solo Unicorn 总管 | AI Chief of Staff、目标拆解、路由和汇总 | 组织任务分解与路由 | 组织任务分解与路由 |
| 社群接待 | 申请、FAQ、欢迎和入会服务 | 成员申请与入会 | 成员申请与入会 |
| 成员匹配 | 授权画像、双向同意匹配和结果跟进 | 双向同意成员匹配 | 双向同意成员介绍 |
| 活动制作 | Founder Salon、Round Table、Critique 和 Hackathon | 社群活动全周期制作 | 社群活动全周期制作 |
| 内容知识 | Field Notes、Newsletter、多语草稿和知识归档 | 可溯源内容与 Field Notes | 内容发布与 Field Notes |
| 项目工厂 | Project Factory 阶段、负责人、阻塞与下一步 | Project Factory 项目接收 | Project Factory 项目接收 |
| 实验研究 | Experiment Zero 假设、基线、指标和匿名研究 | Experiment Zero 测量与报告 | Experiment Zero 工作流测量 |
| 合作与日本 | 合作简报、会后行动和 Japan Living Lab | 合作简报与日本项目设计 | 合作简报与 Japan Living Lab |
| 信任治理 | 同意、隐私、数据访问、投诉和高风险升级 | 同意、隐私与高风险审查 | 敏感数据与同意审查 |

所有员工都遵守 Human-accountable 边界：成员准入、成员数据披露、公开发布、品牌授权、合同、付款、处罚、投资和高声誉风险事项必须由人类最终批准。

## 最简单的使用方式

日常默认只找 **Solo Unicorn 总管**。在左下角进入“对话端”，把当前员工切换为“Solo Unicorn 总管”，然后用下面的四段式告诉它：

```text
目标：这次希望产生什么结果
截止时间：什么时候需要
已有材料：链接、文档、名单或背景
限制条件：不能公开什么、哪些动作必须等我批准
```

总管会拆解任务、选择 SOP、指出缺失信息，并告诉你应该交给哪位专业员工。它不会代替你完成合同、付款、对外承诺、成员准入或敏感数据披露。

当任务很明确时，可以直接找专业员工：

| 场景 | 找谁 | 可以直接这样说 |
| --- | --- | --- |
| 新成员申请、欢迎与 FAQ | 社群接待 | “把这份申请整理成入会摘要，列出缺失信息，不要替我决定录取。” |
| 找合作伙伴或成员互相介绍 | 成员匹配 | “根据已授权资料给出 3 个匹配建议，先分别生成征求同意的信息，不要直接介绍。” |
| Founder Salon、圆桌、Critique | 活动制作 | “为 8 月 Founder Salon 做 Run of Show、嘉宾准备清单和风险点，公开发布先停在审批。” |
| Field Notes、Newsletter、网站稿 | 内容知识 | “把这份活动记录变成一篇有引用的 Field Notes 草稿，隐去未授权姓名。” |
| Project Factory、Sprint、Pilot | 项目工厂 | “把这个项目放入 Meet → Trust → Build → Ship，列负责人、阻塞和下一步。” |
| AI-native 运营指标与复盘 | 实验研究 | “为这个流程建立基线、时间/质量/人工干预指标和周度实验记录。” |
| 合作方、日本项目和多语简报 | 合作与日本 | “为这家日本机构准备会前简报、中英日议程草稿和 6–8 周 Living Lab 假设。” |
| 隐私、同意、公开授权和风险 | 信任治理 | “审查这份成员数据使用计划，指出同意缺口、最小化方案和必须人工批准的动作。” |

推荐协作链路是：**你给目标 → 总管拆解与路由 → 专业员工产出草稿 → 信任治理检查敏感事项 → 你做最终批准**。多个专业员工暂时不会在后台自动互相聊天；实际使用时让总管先给出分工，再把它生成的上下文交给相应员工，最后把各员工结果交回总管汇总。

需要系统长期记住偏好时，在对话中明确写“以后请记住……”。记忆按“员工 × 用户”隔离，因此重要偏好要告诉实际负责该工作的员工；不得把密钥、密码、未授权成员数据或投诉细节写入记忆。

## 专属头像

9 位 Solo Unicorn 员工使用统一 DayDayUp 蓝色的 512×512 专属头像：

| 员工 | 资源文件 |
| --- | --- |
| Solo Unicorn 总管 | `assets/avatars/solo-unicorn/chief.png` |
| 社群接待 | `assets/avatars/solo-unicorn/onboarding.png` |
| 成员匹配 | `assets/avatars/solo-unicorn/matching.png` |
| 活动制作 | `assets/avatars/solo-unicorn/events.png` |
| 内容知识 | `assets/avatars/solo-unicorn/content.png` |
| 项目工厂 | `assets/avatars/solo-unicorn/project.png` |
| 实验研究 | `assets/avatars/solo-unicorn/research.png` |
| 合作与日本 | `assets/avatars/solo-unicorn/partnership-japan.png` |
| 信任治理 | `assets/avatars/solo-unicorn/governance.png` |

在迁移或重建数据库后，可用以下命令重新应用头像。生产环境执行前必须先指定 `--backup` 创建一致性备份：

```bash
python3 scripts/apply_solo_unicorn_avatars.py \
  --database backend/skill_agent_loop.db \
  --backup /path/to/pre-avatar-backup.db
```

## 知识库

已上线 6 个知识库：

1. `00-Solo-Unicorn-中文运营手册.md`
2. `01-organization-charter.md`
3. `02-member-operations-consent.md`
4. `03-events-content-playbook.md`
5. `04-project-factory-experiment-zero.md`
6. `05-partnership-japan-governance.md`

总管和信任治理拥有全部知识；其他员工按最小必要原则分配与其职责相关的 2–4 个知识库。当前索引共生成 156 个 Wiki 页面、41 个目录索引和 208 个引用来源。

## 已启用例行任务

- 总管：每日 09:00 生成内部 AI 组织运营简报
- 内容知识：每周三 09:00 生成 Field Notes 选题与知识缺口
- 实验研究：每周五 09:00 生成 Experiment Zero 运营测量
- 合作与日本：每周一 09:00 生成合作与日本机会雷达

四项任务只生成内部草案，禁止自动外联、发布、签约、承诺资源或披露成员数据。部署前需确认容器时区；推荐显式设置为 `America/New_York`。

## 记忆

记忆由真实对话自动生成，并按“员工 × 用户”隔离，不能在管理端手工预填。验收对话已经为总管用户 `admin` 沉淀偏好：运营简报默认中文，先给三行摘要，再列行动项。

不要把 API Key、密码、完整成员名册、投诉细节、医疗/财务信息或未经同意的私人资料写入普通对话记忆。

## 工具

“合作与日本”员工已启用两个只读官网工具定义：

- `read_website`
- `solo_public_site_read`

两者都以 GET 读取 `https://www.solounicorn.club/`，探测和已保存工具调用均返回 HTTP 200。`read_website` 的允许标识同时包含 Skill slug `solo-partner-japan-brief` 和 SOP ID `solo_partner_japan_program`。

产品当前把员工 HTTP 工具与通用 Skill runner 作为两条执行通道：HTTP 工具已通过独立调用和 SOP 工具调用验证；通用 Skill 的自动 Python runner 不能直接调用员工 HTTP 工具。不要在 Skill 中实现另一个未经审查的网络抓取器。合作方官网研究应在以后接入受控浏览器/MCP 工具后启用。

## 验收结果

- 总管路由：正确选择组织任务分解 SOP，把赞助方索取邮箱与自动发帖判为需要创始人批准的中风险事项，并在审批门停止
- 中文知识检索：返回 4 个知识图谱结果、4 个图谱引用、1 份文档、9 个展开来源和 4 个引用包
- 记忆：成功保存并展示中文简报格式偏好
- 数据治理：拒绝向赞助方披露两位未单独同意的成员邮箱，并升级人工审核
- 官网工具：配置探测与已保存工具调用均成功，HTTP 200

## 部署到 GCP 前

1. 备份并验证恢复应用数据库、知识库文件卷和任何向量/索引数据。
2. 把模型 Key、数据库密码、JWT/Session Secret 放入 Secret Manager 或受保护的 `.env`，不要构建进镜像。
3. 修改默认管理员密码，关闭不需要的 Demo MCP，并为管理端增加 Cloudflare Access 或等效身份保护。
4. 为容器设置持久卷、健康检查、自动重启、日志轮转、资源限制和 `America/New_York` 时区。
5. 使用独立子域名或根域名反向代理到 DayDayUp；Cloudflare 只代理 80/443，不直接暴露数据库或应用内部端口。
6. 接入 CRM、邮箱、日历、活动平台、CMS 或成员数据库前，逐项配置最小权限、审计日志、人工审批门和撤销方式。
