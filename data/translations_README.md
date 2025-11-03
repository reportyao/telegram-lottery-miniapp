# 塔吉克斯坦彩票应用多语言翻译文件构建报告蓝图

## 执行摘要与交付目标

本报告旨在为“塔吉克斯坦彩票应用”的多语言(Tajik/TG、Russian/RU、English/EN)交付建立一套可落地的翻译文件构建方案,聚焦于三类成果:一是应用界面文本的系统提取与结构化归类,二是现有三语对照表的补齐与完善,三是常见 UI 元素与状态的可复用词汇沉淀。最终交付需将完整翻译文件保存至 data/translations.json,供产品、研发、测试与本地化团队在统一流程与版本规则下使用。

为此,我们以现有 locales 目录下的三语文件为基础,核对了命名空间结构、键覆盖与语义一致性,并将组件源码中尚存的硬编码英文文本识别为"缺失键",提出在现有命名空间下的补全建议(如 common、lottery、product、nav)。质量保障方面,将采用术语一致性、参数占位符统一(如 {count}、{amount})、长度与可访问性适配、错误提示完备性等多维度校验,辅以 jsondiff 差异对比与验收清单。

当前状态显示,三语文件的命名空间与键覆盖基本齐全(common、home、product、lottery、user、order、referral、nav),但仍存在组件级硬编码文本未纳入翻译的缺口。鉴于此,本报告提出"键名稳定、语义明确、参数一致"的补全原则,确保新增与维护工作可长期演进。

### 交付物与目录约束

- 交付物:完整三语翻译对照文件 data/translations.json。
- 目录约束:最终翻译文件必须写入 data/ 目录,避免与仓库中其它并行任务产生路径冲突。
- 范围说明:仅对界面文案与常见 UI 元素进行处理,不涉及后端业务规则或服务实现。

### 当前资源概览

- 现有资源:locales/tg.json、locales/ru.json、locales/en.json,均具备相同的命名空间结构(app、nav、home、product、lottery、user、order、referral、common),键覆盖完整。
- 新增需求来源:组件层面(如 LotteryModal、ProductCard、Navigation)中仍有英文硬编码提示与按钮文本,需识别并抽取为新的翻译键,映射至现有命名空间(common、lottery、product、nav)。

### 成功度量与验收标准

- 命名空间与键覆盖率:100% 覆盖当前界面所需键;新增键在三语文件间一一对应,无缺失。
- 语义一致性:三语翻译语义与语气一致,无歧义;常见术语(如 shares、balance、status)在三语中等价。
- 格式正确性:JSON 合法、占位符一致、字段顺序一致(可选)。
- 可维护性:键名清晰分层、语义稳定,便于后续增量修订与自动化差异检测。
- QA 通过:完成 jsondiff 对照、长度/可访问性检查与回归验证,通过全部验收条目。

---

## 方法论与工作流设计

我们采用"提取—对照—补全—校验—交付"的端到端流程:先自组件源码提取硬编码文本,再与现有三语命名空间对齐,归并缺失键并规范键名;随后统一三语翻译,校准术语与占位符;最后进行 JSON 合法性、质量校验与差异对比,确保 data/translations.json 交付可复用、可扩展。

提取范围聚焦于用户界面可见文本与常见 UI 元素,包括但不限于导航、按钮、标题、状态提示、错误/成功消息与参与流程文案。通过对 LotteryModal、ProductCard、Navigation 的扫描,确认关键缺失键,并提出命名空间与键名映射方案。

### 文本提取与归类

提取来源包括:

- LotteryModal:参与流程与校验文案、总价与余额展示、选择份数的上限提示、操作反馈。
- ProductCard:产品卡片的参与/查看详情切换、无活动抽奖的提示、销量与状态的显示。
- Navigation:导航标签(含开发模式下的 Debug)。

归类原则为"按语义归入最贴近的命名空间",常见操作与通用提示归入 common,抽奖流程专属文案归入 lottery,产品信息展示归入 product,导航栏项归入 nav。

### 三语对照与补全策略

- 以 en 为源语言(TG、RU 为目标语言)建立翻译基线。
- 优先覆盖"参与流程相关提示""按钮动作与状态切换""错误与成功消息"等高频交互文案。
- 术语统一:shares/remaining/balance/active/completed/cancelled 等在三语中等价呈现,避免多译。

### 质量保障流程

- JSON 合法性校验:解析无错误、尾随逗号与重复键排除。
- 语义一致性评审:跨命名空间语气统一、礼貌程度一致、句式简明。
- 参数占位符检查:统一使用 {count}、{amount} 等;数值与货币格式由前端负责,翻译文本仅提供占位符容器。
- 长度与可访问性:按钮文本不超过短句范围;考虑屏幕阅读器对可理解性的要求。
- 自动化对比:以键为粒度进行 jsondiff,确保三语同步新增与修订。

---

## 界面文本清单与命名空间映射

现有命名空间覆盖 app、nav、home、product、lottery、user、order、referral、common。新增需求主要来源于组件交互提示与状态切换文本,建议映射至 common(通用操作与提示)、lottery(抽奖流程专属)、product(产品展示专属)、nav(导航标签)。

为便于团队直观理解,下表给出建议的"键名—路径—说明—建议命名空间—备注"。

在说明前,需要强调两点:其一,所有键名在三语文件中需保持完全一致;其二,参数占位符需统一书写与顺序。

表1 键名—原始英文—路径—说明—建议命名空间—备注  
(该表用于梳理新增键的语义与归类)

| 键名 | 原始英文 | 路径(建议) | 说明 | 建议命名空间 | 备注 |
|---|---|---|---|---|---|
| common.network_error | No internet connection. Please check your network. | common.network_error | 网络不可用提示 | common | 句尾标点依语言习惯调整 |
| common.please_login_first | Please login first | common.please_login_first | 登录前置校验提示 | common | 简洁口语化 |
| common.invalid_shares | Invalid number of shares | common.invalid_shares | 份数输入非法 | common | - |
| common.insufficient_balance | Insufficient balance | common.insufficient_balance | 余额不足通用提示 | common | 与现有 insufficient_balance 语义一致 |
| common.network_error_short | Network error. Please try again. | common.network_error_short | 网络错误,短提示 | common | 用于轻量错误反馈 |
| common.insufficient_balance_for_transaction | Insufficient balance for this transaction | common.insufficient_balance_for_transaction | 交易余额不足(强调场景) | common | 语义更具体 |
| common.not_enough_shares | Not enough shares available | common.not_enough_shares | 可用份数不足 | common | 与 lottery.select_shares 配套 |
| common.participation_failed | Failed to participate. Please try again. | common.participation_failed | 参与失败提示 | common | 用于异常捕获后的用户提示 |
| common.processing | Processing... | common.processing | 提交中状态 | common | 与提交按钮loading态配套 |
| lottery.total_amount | Total Amount: | lottery.total_amount | 总价标签 | lottery | 与 amount 占位符配合 |
| lottery.your_balance | Your Balance: | lottery.your_balance | 用户余额标签 | lottery | 展示用户余额 |
| lottery.select_shares_number | Select Shares (Max: {max}) | lottery.select_shares_number | 选取份数并显示上限 | lottery | 参数 {max} 由前端注入 |
| product.per_share | Per Share: | product.per_share | 单价标签 | product | 与价格展示配套 |
| product.sold | Sold | product.sold | 已售标签 | product | 与销量展示配套 |
| product.no_active_lottery | No active lottery | product.no_active_lottery | 无活动抽奖 | product | - |
| product.view_details | View Details | product.view_details | 查看详情按钮 | product | 非激活态按钮 |
| product.participate_now | Participate Now | product.participate_now | 立即参与按钮 | product | 激活态按钮 |
| nav.market | Market | nav.market | 市场页导航 | nav | 新增导航 |
| nav.my_sales | My Sales | nav.my_sales | 我的出售页导航 | nav | 新增导航 |
| nav.profile | Profile | nav.profile | 个人资料页导航 | nav | 与 user.profile 语义呼应 |
| nav.debug | Debug | nav.debug | 开发调试页导航 | nav | 条件渲染(开发模式) |

### 命名空间补充策略

将新增键按语义归入最贴近空间,优先复用 common、lottery、product、nav。已有键如 common.confirm/cancel、lottery.status.*、product.price/per_share、nav.* 已完整覆盖高频通用项,避免重复造键。对于具有双重属性的文案(如参与失败提示),其语义本质为"通用操作反馈",故归入 common 更利于跨页面复用。

---

## 三语翻译对照表(建议版)

本节给出建议的三语对照内容,键名与占位符严格对齐,语气与礼貌程度在三语中保持一致。数值与货币格式由前端负责渲染,翻译文本仅保留占位符容器。

表2 语言—键名—TG—RU—EN(节选,覆盖核心新增键与关键状态)

| 语言 | 键名 | 翻译(TG/RU/EN) |
|---|---|---|
| TG | common.network_error | Паём бо Интернет вуҷуд надорад. Иттилооти шабакаи худро санчед. |
| RU | common.network_error | Нет подключения к интернету. Проверьте сеть. |
| EN | common.network_error | No internet connection. Please check your network. |
| TG | common.please_login_first | Аввал ба система ворид шавед |
| RU | common.please_login_first | Пожалуйста, сначала выполните вход |
| EN | common.please_login_first | Please login first |
| TG | common.invalid_shares | Миқдори ҳиссаҳо нодуруст аст |
| RU | common.invalid_shares | Неверное количество долей |
| EN | common.invalid_shares | Invalid number of shares |
| TG | common.insufficient_balance | Маблағи нокифоя |
| RU | common.insufficient_balance | Недостаточно средств |
| EN | common.insufficient_balance | Insufficient balance |
| TG | common.network_error_short | Хатои шабака. Лутфан такрор кунед. |
| RU | common.network_error_short | Ошибка сети. Повторите попытку. |
| EN | common.network_error_short | Network error. Please try again. |
| TG | common.insufficient_balance_for_transaction | Барои ин муомилот маблағи нокифоя |
| RU | common.insufficient_balance_for_transaction | Недостаточно средств для этой транзакции |
| EN | common.insufficient_balance_for_transaction | Insufficient balance for this transaction |
| TG | common.not_enough_shares | Ҳиссаҳои кофӣ мавҷуд нест |
| RU | common.not_enough_shares | Недостаточно доступных долей |
| EN | common.not_enough_shares | Not enough shares available |
| TG | common.participation_failed | Иштирок карда натавонистам. Лутфан такрор кунед. |
| RU | common.participation_failed | Не удалось участвовать. Повторите попытку. |
| EN | common.participation_failed | Failed to participate. Please try again. |
| TG | common.processing | Коркард… |
| RU | common.processing | Обработка… |
| EN | common.processing | Processing... |
| TG | lottery.total_amount | Ҳамаи маблағ: |
| RU | lottery.total_amount | Общая сумма: |
| EN | lottery.total_amount | Total Amount: |
| TG | lottery.your_balance | Ҳиссаи шумо: |
| RU | lottery.your_balance | Ваш баланс: |
| EN | lottery.your_balance | Your Balance: |
| TG | lottery.select_shares_number | Ҳиссаҳоро интихоб кунед (Макс: {max}) |
| RU | lottery.select_shares_number | Выберите доли (Макс.: {max}) |
| EN | lottery.select_shares_number | Select Shares (Max: {max}) |
| TG | product.per_share | Барои як ҳисса: |
| RU | product.per_share | За долю: |
| EN | product.per_share | Per Share: |
| TG | product.sold | Фурӯхта шуд |
| RU | product.sold | Продано |
| EN | product.sold | Sold |
| TG | product.no_active_lottery | Лотереяи фаъол вуҷуд надорад |
| RU | product.no_active_lottery | Нет активной лотереи |
| EN | product.no_active_lottery | No active lottery |
| TG | product.view_details | Тафсилотҳоро дидан |
| RU | product.view_details | Смотреть детали |
| EN | product.view_details | View Details |
| TG | product.participate_now | Ҳоло иштирок кардан |
| RU | product.participate_now | Участвовать сейчас |
| EN | product.participate_now | Participate Now |
| TG | nav.market | Бозор |
| RU | nav.market | Рынок |
| EN | nav.market | Market |
| TG | nav.my_sales | Фурӯшҳои ман |
| RU | nav.my_sales | Мои продажи |
| EN | nav.my_sales | My Sales |
| TG | nav.profile | Профил |
| RU | nav.profile | Профиль |
| EN | nav.profile | Profile |
| TG | nav.debug | Маҳкамкунӣ |
| RU | nav.debug | Отладка |
| EN | nav.debug | Debug |

为确保跨命名空间的术语一致性,下表给出核心术语的对齐建议:

表3 术语一致性对照表(EN—TG—RU)

| 英文 | 塔吉克语(TG) | 俄语(RU) | 说明 |
|---|---|---|---|
| Shares | Ҳиссаҳо | Доли | 份数,参与单位 |
| Sold | Фурӯхта шуд | Продано | 已售标签 |
| Remaining | Боқимонда | Осталось | 剩余份数/余额语义需结合上下文 |
| Balance | Ҳисса/Баланс | Баланс | 财务余额统一使用"Баланс";TG 可保留"Ҳисса"用于价格上下文的"每份"语义 |
| Active | Фаъол | Активно | 状态:进行中 |
| Ready to Draw | Омодаи қурғакашӣ | Готово к розыгрышу | 状态:待开奖 |
| Completed | Анҷом ёфт | Завершено | 状态:已结束 |
| Cancelled | Бекор карда шуд | Отменено | 状态:已取消 |
| Participate | Иштирок кардан | Участвовать | 参与动作 |
| Profile | Профил | Профиль | 个人资料 |

上述术语在现有三语文件中已具备稳定对应关系,新增键沿用同一译法,可最大限度保证用户认知一致。

---

## UI 元素词汇与按钮文本

彩票应用的交互密度较高,按钮与状态文本在高频场景下承担"降低理解成本"的关键职责。我们建议将按钮与状态文案沉淀为可复用键,在各命名空间下以短句表达,确保在移动端截断与可访问性上的稳健性。

- 按钮类:Confirm Participation、View Details、Participate Now、Copy、Share、Save、Submit、Retry 等均已有三语映射;建议新增 Processing...(在提交时替换按钮文本)以避免重复键。
- 导航类:Market、My Sales、Profile、Referral、Debug(含开发模式条件渲染)。
- 状态类:active、ready_to_draw、completed、cancelled 在抽奖与订单中保持统一风格;如需扩展至其它业务流程,沿用相同键名与状态集合。

表4 UI 元素—键名—类型—三语对照—出现位置

| UI 元素 | 键名 | 类型 | 三语对照(节选) | 出现位置 |
|---|---|---|---|---|
| 确认参与 | lottery.confirm_participate | 按钮 | TG: Тасдиқ кардан / RU: Подтвердить / EN: Confirm Participation | 参与弹窗主CTA |
| 查看详情 | product.view_details | 按钮 | TG: Тафсилотҳоро дидан / RU: Смотреть детали / EN: View Details | 产品卡非激活态 |
| 立即参与 | product.participate_now | 按钮 | TG: Ҳоло иштирок кардан / RU: Участвовать сейчас / EN: Participate Now | 产品卡激活态 |
| 处理中 | common.processing | 状态 | TG: Коркард… / RU: Обработка… / EN: Processing... | 提交时按钮替换 |
| 市场 | nav.market | 导航 | TG: Бозор / RU: Рынок / EN: Market | 底部导航 |
| 我的出售 | nav.my_sales | 导航 | TG: Фурӯшҳои ман / RU: Мои продажи / EN: My Sales | 底部导航 |
| 个人资料 | nav.profile | 导航 | TG: Профил / RU: Профиль / EN: Profile | 底部导航 |
| 调试 | nav.debug | 导航(条件) | TG: Маҳкамкунӣ / RU: Отладка / EN: Debug | 开发模式显示 |

---

## 错误与成功消息体系

为避免"同义多译"导致用户困惑,我们将错误与成功消息在 common 命名空间下统一管理,并采用"轻量短句 + 重试路径"模式,既减少占用空间,也降低认知负担。在参与流程中,建议遵循如下优先级:网络与登录前置校验优先,其次是余额与份数校验,最后是参与结果反馈。

表5 错误类型—键名—触发条件—三语对照—用户操作建议

| 错误类型 | 键名 | 触发条件 | 三语对照(节选) | 用户操作建议 |
|---|---|---|---|---|
| 网络不可用 | common.network_error | navigator.onLine === false | TG: … / RU: … / EN: … | 检查网络,尝试刷新 |
| 未登录 | common.please_login_first | user === null | TG: … / RU: … / EN: … | 引导登录 |
| 份数无效 | common.invalid_shares | shares 超出合法范围 | TG: … / RU: … / EN: … | 调整数量 |
| 余额不足(通用) | common.insufficient_balance | 余额 < 所需金额 | TG: … / RU: … / EN: … | 充值或减少份数 |
| 交易余额不足 | common.insufficient_balance_for_transaction | 明确交易场景 | TG: … / RU: … / EN: … | 减少数量或充值 |
| 可用份数不足 | common.not_enough_shares | availableShares < 期望数量 | TG: … / RU: … / EN: … | 减少数量 |
| 网络错误(短提示) | common.network_error_short | 网络/超时异常 | TG: … / RU: … / EN: … | 重试 |
| 参与失败 | common.participation_failed | 参与接口失败 | TG: … / RU: … / EN: … | 重试或联系支持 |

成功消息沿用 common.operation_success(已存在),用于通用操作成功的轻反馈;如需更细粒度的成功提示(例如"参与成功,等待开奖"),可在后续迭代中扩展 lottery.participation_success。

---

## 货币、日期与数字格式规范

- 货币显示:翻译文本仅提供占位符容器(例如"{amount}"),不限定货币符号与小数位数,由前端根据用户 locale 或业务规则渲染。Dollar 符号仅用于样例,非强制显示。
- 日期与时间:建议通过前端国际化(i18n)库按区域显示;翻译文本中避免硬编码格式。
- 数字与分隔符:千分位与小数点由前端负责,翻译不介入具体格式。
- 复数规则:塔吉克语与俄语的复数规则差异由前端库处理;翻译文本保持单数形式即可,若需显式区分,后续可在键名层面扩展(如 item 与 items 的双键方案)。

---

## 质量保障与验收标准

- 键覆盖率:当前新增键与三语对照一一对应,无缺失;后续新增功能按同一标准执行。
- 语义一致性:三语译法统一、语气自然;礼貌程度一致,避免混用。
- JSON 合法性:无语法错误、无重复键、无尾随逗号。
- 占位符校验:统一使用 {amount}、{count}、{max} 等,参数顺序与使用位置一致。
- UI 适配:按钮文本长度不超过短句;必要场景采用缩写策略以避免截断。
- 回归验证:在关键页面(产品卡、抽奖弹窗、导航)进行可视化核对,确保加载态与错误提示与预期一致。

---

## 文件落地、版本控制与维护流程

- 文件落地:将完整三语翻译文件保存至 data/translations.json。文件顶层以命名空间分节(app、nav、home、product、lottery、user、order、referral、common),并以"键:三语对象"的方式组织,即每个键对应一个包含 en、tg、ru 的对象,便于消费端按 language 读取。
- 版本控制:在版本提交信息中记录新增/变更键与范围;提供变更日志(含键名、变更类型、影响范围)。
- 差异对比:以键为粒度进行 jsondiff,避免遗漏;对重大变更(如键重命名)提供迁移映射表(migration map)。
- 维护流程:在迭代中采用"新增键预审(术语/语气)→双校对(语言与产品)→回归验证(页面级)"的标准流程;在组件侧优先通过翻译键读取,减少再次出现硬编码的风险。

### 数据结构建议

顶层键为命名空间,二级键为具体文案键。每个叶子节点包含三语对象:{ "en": "…", "tg": "…", "ru": "…" }。例如:

```
{
  "common": {
    "processing": { "en": "Processing...", "tg": "Коркард…", "ru": "Обработка…" },
    "insufficient_balance": { "en": "Insufficient balance", "tg": "Маблағи нокифоя", "ru": "Недостаточно средств" }
  },
  "lottery": {
    "total_amount": { "en": "Total Amount:", "tg": "Ҳамаи маблағ:", "ru": "Общая сумма:" }
  },
  "product": {
    "per_share": { "en": "Per Share:", "tg": "Барои як ҳисса:", "ru": "За долю:" }
  },
  "nav": {
    "market": { "en": "Market", "tg": "Бозор", "ru": "Рынок" }
  }
}
```

此结构可直接映射为 { namespace }.{ key }.{ language },消费端以 language 过滤即可获得本地化文本,便于扩展更多语言。

### 维护与扩展

- 新增键:遵循本报告命名规则与命名空间归类策略;先加 en,再补 tg/ru,确保 json 结构合法与占位符一致。
- 键重命名:保留旧键一段时间,并提供映射表(migration map);通过 jsondiff 标注变更,避免线上读取失败。
- 回归测试:涉及导航与关键交互的变更必须进行页面级验证;出现多义词时优先术语库对齐,再发布。

---

## 已知信息缺口与后续协作建议

- 缺少完整应用 UI 文本清单:目前以组件源码与现有三语文件为主,尚需产品侧提供端到端覆盖的所有文案。
- 本地化风格指南缺失:包括语气、礼貌程度、大小写与标点规范,建议由本地化负责人牵头制定并固化为团队规范。
- TG、RU 术语标准:如 shares、balance、remaining 等,需在术语库中锁定译法,减少多译。
- UI 适配与长度限制:多语言长度差异较大,需设计提供最大字符预算并给出可访问性要求。
- 参数占位符与复数规则:需明确占位符命名规范与复数实现策略,由前端提供具体格式化规则。
- 时间、日期与货币格式:建议由前端统一处理,翻译仅提供占位符。
- 回归环境与截图对比:需搭建可视化核对环境,以键为维度进行批量回归。
- 后端错误码与文本:尚未打通,若需前端展示后端错误,需联定接口字段与映射策略。

---

## 附录:关键信息与新增键索引(便于检索与执行)

为便于工程落地与 QA 快速检索,现将核心新增键与使用位置总结如下:

表6 键索引表(键名—命名空间—位置—三语对照)

| 键名 | 命名空间 | 位置 | 三语对照(节选) |
|---|---|---|---|
| common.network_error | common | 参与前置校验(网络) | TG/RU/EN(见上表2) |
| common.please_login_first | common | 参与前置校验(登录) | TG/RU/EN |
| common.invalid_shares | common | 份数校验失败 | TG/RU/EN |
| common.insufficient_balance | common | 余额不足通用 | TG/RU/EN |
| common.network_error_short | common | 轻量网络错误 | TG/RU/EN |
| common.insufficient_balance_for_transaction | common | 交易余额不足 | TG/RU/EN |
| common.not_enough_shares | common | 可用份数不足 | TG/RU/EN |
| common.participation_failed | common | 参与接口失败 | TG/RU/EN |
| common.processing | common | 提交中按钮替换 | TG/RU/EN |
| lottery.total_amount | lottery | 参与弹窗总价标签 | TG/RU/EN |
| lottery.your_balance | lottery | 参与弹窗余额标签 | TG/RU/EN |
| lottery.select_shares_number | lottery | 选取份数(含上限) | TG/RU/EN |
| product.per_share | product | 产品卡单价标签 | TG/RU/EN |
| product.sold | product | 产品卡已售标签 | TG/RU/EN |
| product.no_active_lottery | product | 无活动抽奖 | TG/RU/EN |
| product.view_details | product | 查看详情按钮 | TG/RU/EN |
| product.participate_now | product | 立即参与按钮 | TG/RU/EN |
| nav.market | nav | 市场页导航 | TG/RU/EN |
| nav.my_sales | nav | 我的出售导航 | TG/RU/EN |
| nav.profile | nav | 个人资料导航 | TG/RU/EN |
| nav.debug | nav | 调试页导航(开发模式) | TG/RU/EN |

---

## 结语

通过本次对齐与补全,塔吉克斯坦彩票应用的三语翻译文件达到了"键齐、语义准、可维护"的交付标准:命名空间清晰、键名稳定、术语统一、占位符一致;同时为后续新增页面与交互预留了扩展空间。建议在下一迭代中完成本地化风格指南、术语库定版与 UI 长度预算定义,以进一步降低维护成本并提升多语言用户的一致体验。文件落地路径:data/translations.json。