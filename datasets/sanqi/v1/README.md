# 三七 / Clancy：静态完整语料快照

此目录只含离线适配数据，不自动执行 Add、Search 或模型请求。

- 1038 个原始 Add 请求，10528 条消息，49 个写入用户；原文消息的 role / sender_id / timestamp / content、Add 边界与原始顺序全部保留。
- 327 条请求级 QA，139 种 query 文本，不按文本去重。主事实 answerable + answerable_with_caveat 共316；其他有效10；原始 index 8 无效且保留 excluded 标识。
- Add 用户49、Search 用户49，交集47，并集51。index 1、7 为没有对应 Add 的证据不足题，独立空语料范围；另有2个 Add-only 用户范围。全部 profile 的 scheduler 为 profile_workers=3 / parallel_adds=3。
- 1038 次 Add 对应1037个不同的 (原user, 原session)；重复原session复用同一个新的 namespaced session，仍保留两次独立 Add 边界。新run与原user/session完全隔离。
- gt.strict.json / gt.relaxed.json 使用静态完整语料口径，原字节冻结；index 63 当前住址是 Berlin，2023年1月历史住址是 Paris。不得混用旧Search时点GT。
- 同一答案分别交给原版 strict / relaxed Judge；Reader仅接收问题和本次真实检索证据。correct=1，partial=0.5，incorrect=0，ungradable=null。
- source/add-requests.json 为原导出的请求级投影：保留原 request 全对象及对齐所需元数据，移除旧响应与账户/日志包装。source/search-requests.json 仅保留 index / request_id / user_id / query，完全移除旧 Search results 和 legacy 检索控制参数。
- 原输入文件路径、字节数和原始 SHA-256 在 source-manifest.json 的 original_files 中。所有实际快照、提示词及本说明的 SHA-256 在 files_sha256 中；manifest自身不作自引用哈希。
- stage.source_request 保存原Add作来源，实际writer仅复制原messages及非空timestamp/metadata；新运行的 mode/content_type/输出语言及 effective YAML 接管旧控制字段，async_mode固定为true。不重分块，不改变消息时间。
- 每题直接导出 excluded / evaluation_role / answer_status / protocols / source_request_id / index / original_index；runner应原样带入case state。strict和relaxed的回包分别保存。

## 汇总契约

summarize_sanqi(cases) 返回 type、expected_full_dataset_counts，以及 strict / relaxed 两个对象；每个对象各有 primary / diagnostic / excluded。
每组包含 planned / completed / graded / fullcorrect / partial / incorrect / missing / ungradable / errors / excluded / full_correct_rate / mean_score / completion_rate。
比率0–1，无分母时null。对有效组：completed=graded+ungradable，planned=completed+missing+errors。full_correct_rate=fullcorrect/graded；mean_score只计算成功评分的0/0.5/1。失败、未完成及ungradable不填0。excluded单列且不执行。
分母跟随传入选择；expected_full_dataset_counts仅声明全量316/10/1，不把部分运行伪装为全量。某一Judge失败不抹掉另一Judge已经有效的判分；支持case.judgement和case.sanqi_grades中的逐协议归一化结果（strict/relaxed直接对应normalized）。
