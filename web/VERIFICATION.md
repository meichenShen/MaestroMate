# 验证记录

## 2026-11-09：首次实现

- 功能：三个独立活动、共享播放器、预设问答、两道题、跨模块状态、可关闭动态和录音来源。
- TypeScript 检查和 Vite 生产编译已通过；时间轴边界、所有片段范围和跳转数值的三项测试通过。
- Chromium 浏览器使用测试专用合成音频验证通过：播放与暂停、进度跳转、倒退、场景同步、片段停止、题目反馈与重试、状态保留、速度与静音控制、网络错误恢复、键盘入口和减少动态偏好。
- 1440、1024、768、720、390、320px 六种宽度的三个活动无横向溢出；滚动到底部时内容未被固定播放器遮挡。
- 测试截图、输出和临时下载位于忽略的 `.tmp/qa/` 与 `.tmp/downloads/`，不会提交至 GitHub。

## 真实音频接入与发布准备

- 当前运行环境仍报告 revision 1、restricted 网络；没有可调用的重启接口。使用用户已授权的替代来源完成接入，未修改网络代理或平台限制。
- 录音改为 Kevin MacLeod 制作的圣桑《水族馆》（ISRC USUAN1900026），作者页面及署名见音频 ATTRIBUTION.md。文件元数据与作者、作品、约 2:24 的长度对应。
- 从带署名的 GitHub 音频集合下载固定提交版本；保留来源 SHA-256，压缩为 96 kbps MP3。最终文件 1,729,174 bytes，封装时长 144.039184 秒，完整解码无错误。
- 场景窗口调整为 0、34、70、106 秒；结尾比较片段为 130 秒至录音结束。ffmpeg 静音检查确认结尾约 139.7 秒后进入安静；开头与结尾片段覆盖不同结束状态。
- `npm test` 三项通过；TypeScript 与包含真实音频的生产构建通过。
- `npm run test:browser` 已在 Chromium 对真实 MP3 验证通过，`fixtureMode: false`。覆盖播放、暂停、场景跳转、片段到点停止、两道题、切换状态、六种宽度、错误恢复和键盘入口；无页面脚本错误。
- 浏览器测试等待 React 挂载后再执行首次键盘操作，避免把测试时序问题误判为键盘入口失效。

本环境未提供 Sites 脚手架／发布辅助脚本，采用标准 Vite + React + TypeScript 静态应用。`scripts/prepare-site-source.py` 是适用于当前环境的发布准备工具：从标准输入接收短期凭据，将已提交的 `web/` 树作为 Sites 源码根目录推送，核对远端 SHA，并打包 `dist/` 与托管清单。它不将凭据写入磁盘、进程参数或输出。

## 公开发布

- 地址：https://maestromate-aquarium.chirpyapple14.chatgpt.site
- 2026-11-09 首次发布，Sites 第 1 版，访问范围为 public；原生部署状态为 `succeeded`。
- GitHub 对应运行代码提交：`1fcf5ea9c6a35cd584e5432576d35537446517b0`。
- Sites 根目录源码提交：`a352fdfbba9db301c5b4fd4acf0af5d2d9e5c5d2`，内容对应上述 GitHub 提交的 `web/` 子树。
- 版本：`appgprj_6af14ade2f2c8191825208668540e338~appgver_fb14f2e991f48191a88c65633a844337`。
- 部署：`appgdep_6af162f01e508191bb5bdf536ea0394f`。
- 构建包保存成功，托管清单和静态文件一起发布；本地源码与发布包中的 MP3 SHA-256 相同。
- 浏览器功能验证针对本地实际录音版本进行；发布成功由原生 Sites 部署状态确认，未把预登记地址当成上线证据。

## 2026-11-09：英文 Smooothy 风格重设计

- 参考作者 `vallafederico/smooothy` 的真实源码及仓库预览图，固定提交 `a235a4867e21a0428b62d2340fcf8c71c6e94fdf`；采用黑白、Geist/mono、大字、精确路径描边、Lenis 缓动和无灯光 Three.js 造型。未分发商业显示字体或参考站模型；署名见 `public/credits/`。
- 实际界面、错误、可访问名称、文档标题和描述均为英文。移除纸张／玻璃／装饰手绘方向和已停用的界面文件。
- 首页三条入口、可打开的纵向节目册、两个同时展示的作品预览（The Swan 明确禁用）、功能优先的作品选择、三个活动、理念和反馈入口已接通。试听不自动播放，返回首页暂停，活动间保持同一个 audio 元素及进度。
- 首访三步指引支持关闭、跳过、完成、Escape 和再次打开；关闭后恢复键盘焦点。跳到正文不会改变活动路由或打断音乐。
- 最终 `npm run build` 通过（真实 MP3 完整性检查、TypeScript、Vite）；三个时间轴单元测试通过。
- `QA_BASE_URL=http://127.0.0.1:4173 npm run test:browser` 对生产构建、真实 MP3 完整通过：英文、入口流程、指引、纵向双作品、共享播放、暂停跳转场景同步、片段到点停止、两道题的正确／错误／重试、跨模块状态、倍速、静音、网络恢复、浏览器返回及键盘焦点。
- 1440、1024、768、720、390、320px 活动均无横向溢出；滚动到底后播放器不遮住结束内容。实际查看桌面与手机截图。
- 独立最终审查发现并修复两项 P2：跳到正文引起错误路由、按钮关闭指引丢失焦点。观察复现失败后，`tests/keyboard.mjs` 验证修复。审查还验证浏览器返回／前进保留状态、320px 活动布局和 WebGL 不可用时的静态替代图。
- 3D 屏幕外停止渲染，响应减少动态偏好并清理 GPU 对象和监听。尚未在真实手机 GPU 上做生命周期测试。Three.js 延迟加载包约 753kB（gzip 193kB），构建提示大包；未引入外部大型模型。

### 英文重设计公开发布

- 最终 Sites 第 3 版，访问范围沿用 public，部署状态 `succeeded`（2026-11-09）。
- 网址：https://maestromate-aquarium.chirpyapple14.chatgpt.site
- GitHub 运行代码提交：`85ea7ef164cc6420bd21fe72525010496e310a2b`；Sites 源码提交：`5bcff30598ab1ea56787acdae93e3df72ca11480`。
- 版本：`appgprj_6af14ade2f2c8191825208668540e338~appgver_af324f4a64f481918b7e06637bb8399c`。
- 部署：`appgdep_6af18c028e288191a8306a777dbb72c7`。
- 最后仅将浏览器主题色同步为黑色；重新构建通过，JavaScript/CSS 与完整浏览器测试的版本相同。
- 云端环境仍是 revision 1、restricted 网络，公开网址不在有效白名单内，直接 HTTP 返回 403。未绕过网络限制，未将该请求当成公网可访问证据。发布成功由 Sites 原生结果确认，已请求在用户 Codex 浏览器打开网址。
- 仅清理本项目可重新生成的 npm 缓存，释放 52.4 MiB；依赖保留供后续运行，研究、旧稿、正式素材和 Git 历史均保留。

## 2026-11-09：字体 A、现代节目册和实时三维场景

- 按已确认的方向使用 Outfit350 标题、Onest 正文，背景保持黑色，仅图案与少量强调色带有色彩。正文约18px，去除技术展示式小号大写／等宽标签。
- 首页换为渲染风格音乐厅背景和三个大幅活动入口。首次指引后出现两条主要路径，Just looking 仅作为入场弹窗下方的弱选项，主页不再并列展示；Start here 可重新选择，Guide 可再次查看指引。
- 节目册支持轻薄展开与合拢、纵向浏览，桌面可同时看到两部作品；图案留在册内、位于资料上方。Swan 保持 Coming soon，未假装接入不存在的录音。
- 水族馆使用真实 WebGL/Three.js PBR 鱼模型，音频位置、倍速、暂停和动态偏好作为渲染参数。模型来自 Khronos / Microsoft CC0 BarramundiFish；只重压纹理，几何不变，从12,488,144降为639,316 bytes（约减少95%）。来源、固定提交和校验值见 `public/models/ATTRIBUTION.md`。
- 剧院、天鹅、作曲家雕像、侦探图案和水下环境为生成的三维渲染风格图像；不是运行时三维模型。鱼群为实时三维，降级海报由其实际画面截取。作曲家雕像标注为 imagined portrait。
- 研究了 Smooothy 的真实源码、Three.js GLTFLoader / RoomEnvironment 和 MIT caustic-volume；后者仅作为水光技术参考，未将整个模拟器加入网站。
- 新增端到端契约首先在旧版失败（缺少入场选择弹窗），实现后通过。发现“关闭动态后，音频 timeupdate 仍触发装饰渲染”，通过 `tests/motion.mjs` 观察帧计数增长的失败，再修复为真正冻结；减少动态偏好也停止重复渲染，音乐仍正常播放。
- 构建与3项时间轴单元测试通过。生产构建完整浏览器验证结果及发布记录随后补充。
- 最终生产构建完整浏览器套件通过：原有入口／真实音频／答题／键盘回归、新入场层级与现代节目册、Motion off／系统减少动态冻结、加载中显卡失效降级，共6个浏览器脚本；3项时间轴单元测试通过。1440、1024、768、720、390、320px 检查无横向溢出，播放器不遮住页面结尾。
- 独立最终代码审查发现1项 P2：加载期间丢失 WebGL 上下文，后到模型回调错误地把降级状态改回 ready。`tests/context-loss.mjs` 在旧行为复现 ready/fallback 断言失败，加入 contextLost 保护后通过，随后完整套件重新通过。
- 同一1487×1058窗口将设计参考与最终节目册并排对照并实际查看，报告见 `design-qa.md`。视觉检查修正了天鹅头部裁切、鱼群大小和手机版图案焦点。后续只调整了移动端静态图像焦点，再次构建与截图复核；音频／路由代码未继续改动。
- 渲染器单独加载，包约632kB（gzip160kB），仍有构建大包提示；仅打开需要3D的页面时加载。没有进行真实手机显卡性能测试。

### 现代节目册版本公开发布

- Sites 第4版，原 public 访问范围不变，部署状态 `succeeded`。
- 网址：https://maestromate-aquarium.chirpyapple14.chatgpt.site
- GitHub 运行代码：`359adcd50083dde71f31a0e8cf6ebae7d7881390`。
- Sites 对应源码：`01117b21030273eaaaeab58b7ddea47171fb4a07`。
- 版本：`appgprj_6af14ade2f2c8191825208668540e338~appgver_eb8094360be08191abff8e04ab3ed3c0`。
- 部署：`appgdep_6af1a81f8e108191afc62b33d5b8146f`。
- 本地生产构建和浏览器验证通过；Sites 原生结果确认部署成功并已请求在用户浏览器打开。云端仍为 restricted revision1，网址不在白名单内，未声称已完成云端公网 HTTP 直连复核，也未绕过限制。
- 本轮仅清理可再下载的原始模型和可重建 npm 缓存，共释放 23.0 MiB。正式模型、字体、图像、音频、依赖、研究、旧稿和 Git 历史保留。

## 2026-11-09：三个独立房间与可选 Program

- Listen、Chat、Play 分别拥有独立路由、页面和入口。Program 是额外的整部作品路线，只有明确进入 Program 才显示三步进度和继续操作；旧活动链接按独立入口兼容。
- 聊天改为依次保留用户消息、短暂输入状态和预设回复；离开期间的回复仍会完成，返回可见。没有自由输入和真实 AI。
- 首页使用原创建模的实际三维剧院，删除上一版生成的剧院、肖像、水下环境和入口图片。鱼模型保留原始几何，去除照片纹理，文件由639,316降为129,452 bytes；降级海报重新从实际渲染截取。
- 使用 LOL Colors 的薄荷、珊瑚、淡紫和蓝色强调色；大图标错落排列，原生 SVG 路径绘制和四向进入。主页 Lenis Snap 在连续输入停止后对齐，活动页和消息线程不受主页停靠控制。
- 单元测试5/5、真实 MP3 完整性检查、TypeScript 和生产构建通过。房间/入口/真实音频/键盘/初次焦点测试通过；滚动脚本调整为等待舞台就绪并使用跨越中点的明确手势后，与动态冻结、显卡失效脚本一起通过。最终完整运行结果随后补充。
- 新增初次深链接键盘焦点回归，先观察首次 Tab 跳过正文入口的失败，再修复为只在实际页面切换后聚焦正文。音频加载失败用全新页面拦截实际 MP3 请求验证，避免把保留的已加载 audio 当成新请求。
- 独立最终审查没有 Critical/Important；验证了待回复消息跨页面、弹窗打断停靠、320px 页面边界、渲染释放。两项轻微待办：主动“显示最新消息”按钮还未对减少动态改为瞬移；320×667 首页 Program 场景会裁掉装饰边缘和底部作品署名，主要内容和按钮可用。视觉记录见 `design-qa.md`。
- 验证边界：未测试实体手机显卡/触摸、实际读屏语音或由云端直连公开网址；不将本地 Chromium 的结果描述为这些项目已验证。美术方向仍待用户观看反馈。
- 最终完整命令 `QA_BASE_URL=http://127.0.0.1:4173 npm run test:browser` 退出码0，8组脚本全部通过。滚动时序的实际原因已通过浏览器事件时间记录确认：软件渲染让两次自动化往返间隔超过180ms，被正常识别成两次手势；改为页内60ms连续事件后测试稳定，真实滚轮覆盖仍由独立入口测试保留。未为测试修改运行时停靠逻辑。

### 独立房间版本公开发布

- Sites 第5版，保留原 public 访问范围；原生部署状态 `succeeded`，时间2026-11-09T14:16:09Z。
- 地址：https://maestromate-aquarium.chirpyapple14.chatgpt.site
- GitHub 运行代码：`7af510367620d5b4906baa3fa566f16266654817`。
- Sites 源码：`460f7381d1ad75bb312e857f227d4553bc3dd80f`；发布准备工具核对远端 SHA 后打包，部署归档2,265,844 bytes。
- 版本：`appgprj_6af14ade2f2c8191825208668540e338~appgver_42374b70e9dc819192bd64273ca6db6e`。
- 部署：`appgdep_6af1d5a128588191acaf1982615cad1a`。
- 最终构建和5项单元测试再次通过；JS/CSS 哈希与完成8组浏览器验证的版本一致。Three.js 延迟包约611kB（gzip153kB），保留构建的大包提示。
- 已请求在 Codex 浏览器打开公开网址；公网发布依据 Sites 成功结果，本地生产测试与公网直连证据保持区分。未更改访问范围，未合并草稿 PR。

## 2026-11-09：以第5版为基线的桌面优先打磨

- 已批准版本保存为 `baseline/rooms-v5`，沿用独立三房间和可选 Program。以浅紫、蜜桃、明黄和浅蓝替换绿色，保留黑底和既有字体；大图标增加悬停/聚焦说明，点击区域保持稳定。
- 剧院添加原创建模的大提琴、圆号和谱架，增强桌面鼠标旋转；Program 结束页复用同一剧院。游玩区改为桌面并列叠放，在两条声音线索揭晓后出现有限时长的结束图案。
- 水族馆增加原创海底几何、光层、前后明暗和更明显的摆尾，继续共用音频时间/冻结/清理机制。前进十秒使用现有截断跳转 API；Motion on 作为默认可访问开关状态。
- 聊天窗口收窄，滚动边缘可继续带动整页；“显示最新消息”尊重减少动态。预设脚本改为第一人称演绎，增加生平、巴黎和作品来历，注明并非历史原话，资料见巴黎歌剧院和法国国家图书馆链接。
- 七项新行为契约先在基线失败7/7，实作后通过7/7。五项单元测试、TypeScript/Vite生产构建及完整九组浏览器脚本全部通过；真实 MP3、回听、题目反馈、键盘、多宽度、停靠、冻结和显卡失效回归保留。
- MP3 在 Chromium 寻址结尾时会修正 VBR 时长估算；前进跳转按界面已知上限准确截断，测试据该上限验证，而不误用寻址后才更新的估算。播放保持暂停。来源链接测试会先打开回复的来源披露。
- 一次独立最终审查未发现可行动回归，另外验证了启用 Lenis 时消息线程两端的页面滚动释放、稳定入口、键盘提示、完成动画与重试。之前的320px Program裁切和减少动态快捷滚动两项待办已处理。
- 实际查看最终桌面、鼠标旋转、游戏结束和320px节目场景截图，报告见 `design-qa.md`。未新增依赖。实体设备显卡/触摸、真实读屏语音仍未实测。

### 第6版公开发布

- Sites 第6版沿用 public 范围，原生部署状态 `succeeded`，时间2026-11-09T15:58:07Z。
- 地址：https://maestromate-aquarium.chirpyapple14.chatgpt.site
- GitHub 运行源码：`1d1a24a49c1205aee15180e564ef91fc5e5724c6`；已批准的第5版保留于远端标签 `baseline/rooms-v5`。
- Sites 根目录源码：`ccba5038e31df944abbae3ca83ceed6078a4b65d`；准备工具核对远端 SHA 后打包，归档2,280,510 bytes。
- 版本：`appgprj_6af14ade2f2c8191825208668540e338~appgver_017ef5994c748191a92e5bfdc143b27d`。
- 部署：`appgdep_6af1ed865cd081919ac3927fb085b492`。
- 发布前再次运行5项单元测试和构建，均通过；代码包哈希与完整九组浏览器验证的版本一致。原网站访问范围不变，草稿PR已更新但未合并。
- 发布由原生 Sites 成功结果确认；未声称云端公网直连或实体设备测试完成。当前会话仅清理本次本地预览进程，保留源码、依赖、研究和Git历史。


## 2026-11-10：鲜明配色、大音乐厅与单屏活动工作区

- 按用户最新色板使用亮青#45D9FD、玫红#EE2560、浅金#FFDA8E，辅助淡紫/浅蓝，黑底不变。旧绿色面板与模型默认材质均移除，实际活动与入口共用颜色变量。
- 原创三维音乐厅扩为486座、13排与两层楼座；鼠标位置覆盖360°环绕目标，可拖动、键盘方向键和Home复位。保留减少动态、触摸回退、屏幕外暂停与GPU释放。
- 海底加入原创沙地、岩礁、珊瑚、气泡和水光着色；鱼群根据绝对音频时间横向/纵深游动，带摆尾和透明物理材质。暂停、跳转、Motion off与加载失败沿用同一生命周期。降级海报从真实渲染截取。
- 三道题的概览并列，答题/揭晓/上一题/下一题留在固定舞台内，正确反馈和切题使用有限动画。聊天改为艺术家资料/话题与消息分区，保留预设问答和第一人称演绎披露。资料来源移至独立弹窗。
- 桌面活动高度减去实测播放器高度，核心操作无需文档滚动；手机保留可读纵向回退。320px完成感谢信息的横向溢出由真实音频完整回归发现并复现，修复为在上下题按钮间换行。
-11项单元测试通过，录音完整性/TypeScript/生产构建通过；新增工作区3项、升级5项和已有打磨7项浏览器契约通过。最终完整回归、独立审查及公开版本信息随后记录。
- 当前Google/Chrome“Cloud文件”提示没有足够证据定位来源，不是本应用发出的错误。交付使用直接公开HTTPS网址；不把工作区图片链接或本地预览当成网站上线。实体手机显卡/触摸、实际读屏语音未测试。

- 一次独立最终审查发现第二题揭晓后的回听误指开头。新增浏览器测试先复现“期望130秒、实际3秒”，改由每道题内容指定回听片段后，三题均通过。审查额外验证1024×768的Program三活动与141px错误播放器并存，控件仍可达、页面不需滚动。
- 一项轻微待办：信息提示在按钮仍聚焦时不能用Escape单独关闭，移开焦点或鼠标可关闭；未阻挡核心操作。未进行第二轮重复审查。
- 最终完整生产回归命令 `QA_BASE_URL=http://127.0.0.1:4173 npm run test:browser` 退出码0，11组脚本全部通过；升级契约现为6项，含三题揭晓回听，工作区3项与打磨7项均通过。实际MP3、六种宽度、网络错误恢复、键盘/焦点、滚动停靠、动态冻结和加载中上下文丢失均覆盖。
- 最终`npm test`11/11，TypeScript与Vite构建通过。Three.js延迟包618.47kB（gzip155.72kB），仍有构建大包提示；未新增依赖。最后一轮完整回归期间运行时源码和构建不变。

### 第7版公开发布

- Sites第7版已发布，保留原public访问范围；原生部署状态`succeeded`，时间2026-11-10T02:09:11.358955Z（北京时间10:09）。
- 公开网址：https://maestromate-aquarium.chirpyapple14.chatgpt.site
- GitHub运行源码：`1b5ba27c4ea931f3a521c63f83be2552aac145ed`；Sites根目录源码：`214e1cf077b6ca37570d81416248a8cac574e58f`。准备工具确认远端SHA后打包，压缩归档2,290,031 bytes。
- 版本：`appgprj_6af14ade2f2c8191825208668540e338~appgver_1c6d48b913a88191a19d94af959d4519`。
- 部署：`appgdep_6af27cbfca648191af1228bb9fb501b4`。
- 已完成完整生产回归的JS/CSS与发布归档一致；未更改访问范围、未合并草稿PR2。发布后仅补充记录，不改变运行代码。
- 公开发布依据Sites原生成功结果；未声称云端已直连验证用户的Google/Chrome页面，也未把Cloud文件提示认定为浏览器缓存。交付直接HTTPS网址，已请求在Codex浏览器打开。

## 2026-11-10：题目常驻、柔和拖动与乐团舞台

- 题目正文直接显示，揭晓后仍保留；独立题目轨道可横向滚动，有溢出箭头，数量/边界由内容数组决定。目前保留三道真实录音题，不添加占位题。
- Program结束页添加有限时长SVG烟花、Home、Restart Program、Choose another Program。显式重新开始清空题目和聊天、取消待回复计时器，并让同一播放器在0秒暂停；普通活动切换仍保留状态。
- 音乐厅悬停约25°轻微转动，按住实际模型才进入宽幅拖动；使用较慢时间缓动，松开保留视角，支持键盘/减少动态。舞台拓宽，覆盖25个弦乐、8个木管、7个铜管、2个打击乐与1个指挥位置，小型详细钢琴保留；共享实例控制绘制开销。
- 首页仅在预期停止点距离页面边缘18%视口范围内轻吸附；较远位置自由停留。标题字母从不同偏移/角度逐渐归位，保留无障碍名称和减少动态静态回退。入口说明卡片放在图标与名称下方留白，不覆盖任何图标，并修正浅底灰字对比。
- 初始5项布局/交互契约在旧版全部失败；六项新增契约已在一轮生产构建通过。相机被动转幅、四类乐器/舞台范围、近处吸附规则均有失败后通过的验证。实际检查1440px、1024px答题/悬停/乐团与390px纵向回退截图。
- 额外复现了加载失败播放器挤压短屏答案、标签页隐藏期间拖动未取消两项问题；已修复并加入回归。最终完整回归与发布信息随后记录。
- 独立最终审查发现一项重要边界：拖动期间打开指引会清空拖动状态但未保存旋转基准，关闭后悬停可能回到旧角度。新增实际指引开关回归后修正；未开启第二轮重复审查。审查无Critical或新增Minor。
- 实际指引中断回归先复现119.6°→41.5°回转，保存取消拖动时的当前基准后通过；修复后的最终`npm test`12/12、生产构建通过，完整`QA_BASE_URL=http://127.0.0.1:4173 npm run test:browser`退出码0，12组脚本全部通过。新增清晰布局契约6项、升级契约6项，含141px错误播放器与待回复重启。
- 最终完整回归期间源码和构建不变。保留真实MP3、六宽度、键盘/焦点、近处吸附与自由停留、动态冻结、加载中WebGL丢失验证。Three.js延迟包619.70kB（gzip156.08kB），仍有大包提示；无新增运行依赖。实体手机显卡/触摸与真实读屏语音未测试。

### 第8版公开发布

- Sites第8版已发布，保持public范围；原生状态`succeeded`，时间2026-11-10T03:28:52.510556Z（北京时间11:28）。
- 公开网址：https://maestromate-aquarium.chirpyapple14.chatgpt.site
- GitHub运行源码：`a5bcf89cbc0f7a86795bd89f4395c8bd4b4d7bb1`；Sites根目录源码：`5ed917407323272b7aa14f869e3b017d936276ba`。准备工具核对远端SHA后打包，压缩归档2,292,238 bytes；已验证的运行JS/CSS与发布包一致。
- 版本：`appgprj_6af14ade2f2c8191825208668540e338~appgver_5406e273a9f481919ebc6c0e119d5c8b`。
- 部署：`appgdep_6af28f6cb1608191841a2f3be981caf4`。
- 草稿PR2已更新、未合并。发布后仅补充记录，不改变运行代码；上线依据Sites原生成功结果，已请求在Codex浏览器打开直接HTTPS网址。

## 2026-11-10：答题三行布局、开口跟随与三维烟花

- 将播放/回听移动到问题右侧；卡片内部明确区分问题、选项、反馈/操作三行，底部切题在卡片外保留间距。新增1366×640和1366×600包含加载失败播放器的验证，避免只检查页面边界而漏掉卡片内越界。发现计数数字继承57.8px行高占用高度并修正。
- 悬停总幅度由约25°略增至34°；相机方向与拖动/键盘统一调整，开口随鼠标右/下移动。共享实际相机姿态的投影测试通过，保留按住模型拖动、缓动和中断后保留视角。
- 烟花改为现有音乐厅画布中的真实三维GPU粒子：四组球状散射、柔和发光、纵深与曲线拖尾，7.9秒活动时间后停止。指引/离屏暂停、减少动态保持静态音乐厅；资源由独立模块释放。参考Max van Leeuwen的MIT粒子源码，署名/许可已记录，无新运行依赖或第二个渲染器。
- 新布局与方向契约先失败再通过；空间/寿命/资源释放契约先因模块未实现失败后通过。15项单元测试、录音/TypeScript/生产构建通过；实际烟花/指引冻结/减少动态两项浏览器检查通过。最终全套与独立审查结果随后记录。
- 最终完整`QA_BASE_URL=http://127.0.0.1:4173 npm run test:browser`退出码0，14组脚本全部通过；15项单元测试和生产构建通过，最后整套回归期间运行源码/构建不变。
- 一次独立最终审查无Important/Critical或新增Minor；另行检查1024×600、1366×600的错误答案、全部三题与完成反馈，含展开的录音错误播放器，区域均分离。三维烟花实际帧已查看，减少动态、指引暂停与资源释放已覆盖。实体手机显卡/触摸和真实读屏语音未实测。
- Three.js延迟包619.72kB（gzip156.09kB），保留既有大包提示；新增烟花逻辑在较小的剧院延迟模块内，未添加运行依赖或额外画布。

### 第9版公开发布

- Sites第9版已发布，保持public访问范围；原生状态`succeeded`，时间2026-11-10T07:37:53.432394Z（北京时间15:37）。
- 公开网址：https://maestromate-aquarium.chirpyapple14.chatgpt.site
- GitHub运行源码：`7ac9ab695e133935237900150e62da8207f85bfc`；Sites根目录源码：`e700d768507f8246ab54b4bc5d51ae8d21eaf208`。准备工具核对远端SHA后打包，压缩归档2,294,308 bytes；最终完整测试的JS/CSS与发布包一致。
- 版本：`appgprj_6af14ade2f2c8191825208668540e338~appgver_071f23074dac8191856ba002d199abf5`。
- 部署：`appgdep_6af2c9ca53588191895f9424e9ec941b`。
- PR2已更新且仍为草稿，未合并。发布后仅补充记录，未改变运行代码；上线依据原生Sites成功结果，用户直接HTTPS链接与本地QA分别交付。

## 2026-11-10：站内匿名反馈

- 底部“Tell us how it felt”改为原生站内表单，内容必填、类型可选、回复邮箱选填；单独的外链明确为“Say hello on GitHub”。不要求访客账号，不建立公开GitHub issue，也不自动发送邮件。录音、三维场景与三个活动沿用第9版。
- 增加小型Worker与Sites D1 `DB`绑定；生成的Drizzle迁移在构建中复制到`dist/.openai/drizzle`，请求处理不建表/改表。公开API仅发放短期写入凭据与新增反馈，没有读取/删除接口。原生数据库工具/站点Settings供拥有者查看。
- 服务器使用参数化SQL、请求体/字段上限、短期能力、每能力/整体限流与原子条件写入；同一内容重试复用ID，冲突不覆盖旧记录。反馈和邮箱不进入日志、GitHub或浏览器存储。提交确认必须匹配服务端已存记录；失败/关闭弹窗保留内存草稿，并忽略过期响应。
- API先因模块缺失失败、入口先因只有GitHub链接失败；5项API契约现通过。浏览器真实HTTP提交由独立SQLite连接读到，重启本地Worker后仍保留1条记录。初始15组回归中原有14组通过，新增反馈组发现首页标题CSS泄漏；原生弹窗移入body portal后，最终构建的两项反馈浏览器检查通过。最后全套回归结果随后记录。
- 20项单元测试、真实录音完整性、TypeScript与生产构建通过。构建先清理本项目的可再生dist，避免旧静态输出混入Worker包；客户端为`dist/client`，Worker为`dist/server/index.js`（5267 bytes），不增加前端运行依赖。既有Three.js619.72kB延迟包提示保留。
- 一次新上下文最终审查无Critical/Important，独立重跑API与空白检查通过；其轻微构建建议（复制迁移前清空staging目录）已采纳。没有重复审查循环。实际检查桌面/390px弹窗截图，修复后的标题42px，滚动与焦点操作正常。
- 当前云端策略依然对公开站点域名返回CONNECT403；没有可调用的浏览器控制或网络策略修改工具。未绕过策略，也未将本地成功、发布成功或原生数据库建表称作线上匿名投递成功。线上匿名POST加私有记录核验仍需可用的访问路径；原生发布/数据库检查另外记录。
- 最终完整`QA_BASE_URL=http://127.0.0.1:8787 npm run test:browser`退出码0，15组脚本全部通过，运行期间构建和运行源码不变。包含真实MP3、六种宽度、短屏答题、录音错误恢复、导航/焦点、滚动、动态/上下文丢失和真实本地匿名反馈保存。最终截图1280×720、390×844无横向溢出，弹窗标题分别42px/30px。

### 第10版公开发布

- Sites第10版已发布，保持public范围；原生状态`succeeded`，时间2026-11-10T08:22:44.728203Z（北京时间16:22）。公开网址不变：https://maestromate-aquarium.chirpyapple14.chatgpt.site 。
- GitHub运行源码：`4357755ab677b55279d0dd4eb8d060e655476d8f`；Sites根目录源码：`344defc28279c3fcf4770bc121e0e5a53d411c0c`。准备工具核对远端SHA后打包2,300,632 bytes；原生接收的归档28项，内容hash`sha256:6a691c42d1c51f4a1d2ca47b287fe8b21f04e727f894fbb5a80364abb743a4a5`。
- 版本：`appgprj_6af14ade2f2c8191825208668540e338~appgver_612a08f1b7148191a8fe02af9a1cb1e2`；部署：`appgdep_6af2d44d7ef0819182c91b84a5d9b37c`。
- 发布后原生数据库overview确认`DB`、`feedback`、`feedback_sessions`，再以返回的精确名称读取`feedback`：七列正确、0条记录、无后续页，证明线上迁移和拥有者读取可用，没有把本地测试邮件/反馈上传。匿名HTTP复查仍为CONNECT403/状态000，故线上匿名投递端到端验证仍未完成。
- Codex打开浏览器与附加现有PR的RPC均返回`connection closed`，没有宣称已经替用户打开页面。交付直接HTTPS网址；PR2保持草稿，发布后仅补充文档记录，不改变运行代码。

## 2026-11-14：音乐水池、立体节目单与弹性入口

- 按用户选定的三项参考做可试玩迭代。Play新增独立`#play/pool`：五音C4/D4/E4/G4/A4，八步旋律编辑、单次回放/停止/清空、键盘A/S/D/F/G、声音与动态开关。旋律在同次访问的模块切换间保留，刷新重置；没有录音上传、永久保存或导出。Program仍保留原有三步骤和音乐侦探。
- 原创Three.js圆形水面、有限分析波纹、程序化水光与独立Web Audio合成。全部按钮为正常HTML；不依赖新HTML-in-Canvas API、外链iframe、新运行依赖或自动发声。原录音保持唯一HTML audio元素，进入水池时暂停。原始录音、Chat、音乐侦探及私有反馈接口均保留。
- 实际Web Audio经AnalyserNode测量输出，检查音符、静音、指引停止和离开时关闭Context。异步resume取消后不能发声或安排回放；被拒绝的过期resume先复现失败后修复。动态关闭、减少动态、缺失WebGL、真实WEBGL_lose_context均保留可操作控件；390px真实浏览器touch事件落入预期音符。
- 节目单保留纵向两个作品及Swan未开放状态，添加轻薄空间展开/倾斜；三个入口添加弹簧拉伸与回弹，链接/标题保持固定。独立最终审查发现两项Important、无Critical/minor：手机音符命中区重叠、节目单展开带动标题/入口。两项均新增失败用例后修正；320px旧版点C右侧实际命中D，修正后320/390/1024的ready/fallback两种模式均通过分离/命中检查；20–900ms原生动画采样确认标题/CTA位置稳定。没有重复审查。
- 修复后26项单元测试、录音完整性、TypeScript与生产构建通过；水池3D延迟包约5.49kB，Three.js保留约619.74kB的大包提示。已查看1440px和390/320px修复后截图。整站最终18组浏览器回归、发布信息随后记录；实体手机GPU与儿童学习表现未实测。
- 新增开源水族馆研究记录`docs/research/aquarium-rendering-references.md`：核对WebGLSamples默认BSD3条款、Evan Wallace原源码MIT声明、idootop Three.js版本README的MIT及署名。具体模型/纹理仍需逐项核验，未复制这些项目的代码/资产或替换沉浸聆听背景。
- 最终完整`QA_BASE_URL=http://127.0.0.1:4173 QA_DB_PATH=.tmp/music-pool/preview.sqlite npm run test:browser`退出码0，18组脚本全部通过；最后一轮运行时源码和构建不变。包含真实MP3、六宽度旧流程、匿名反馈保存，以及新增水池4项、弹性/空间3项和审查修复2项浏览器契约。单元26/26，录音完整性/TypeScript/构建通过；实体手机GPU、真实读屏和儿童学习效果未测试。

### 第11版公开发布

- Sites第11版已发布，保持public范围；原生状态`succeeded`，时间2026-11-14T12:57:08.410945Z（北京时间20:57）。公开网址：https://maestromate-aquarium.chirpyapple14.chatgpt.site ，水池入口`#play/pool`。
- GitHub运行源码：`24094d448064ea14f87944687afc222c678ccbcc`；Sites根目录源码：`ec793d4181d48c94553a7ca08a38934135c90f3a`。源准备工具核对远端SHA后打包2,309,417 bytes，原生归档30项，内容hash`sha256:f3dfceef8c04abe36549dfb910b8803ed4fbc445c6c3094d6f4782f30ac1e3cb`。
- 版本：`appgprj_6af14ade2f2c8191825208668540e338~appgver_c7fdcd1fabf88191b45b4e57cd585cb6`；部署：`appgdep_6af85a9d26b081919b333e2b6a46a80b`。
- 发布后原生数据库overview仍返回`DB`、`feedback`、`feedback_sessions`，本轮未改schema/迁移或读取真实反馈内容。匿名公开GET仍被云端代理以CONNECT403拦截，HTTP000，不把它解释为用户浏览器无法访问；上线依据原生成功结果，本地浏览器验证与线上直连复查分开报告。
- 更新PR2标题/说明并保留草稿，未合并；附加PR与打开版本11浏览器链接的RPC均返回`connection closed`，未宣称已替用户打开。发布后仅补充记录，不改变运行代码；保留源目录/Git历史，停止本轮启动的Vite/Worker预览进程。

## 2026-11-14：水池比例、简洁音符与更明显的册页/入口

- 依据用户v11截图，查明过宽水池来自整场景按容器宽高比拉伸。改为更俯视的相机与上限1.5的横向比例，水形状与44px以上HTML命中区独立管理；新增`layout.ts`统一真实渲染、HTML和无WebGL回退的投影。移除五个3D音石/环圈与逐音键盘徽章，只保留色点加字母，键位说明集中显示。
- 查明Program默认展开，用户跳过了封面效果。首访/Start with a work现在先显示可点开的轻薄封面，再进入纵向两个作品；纸页边缘与图案倾斜更明显，标题与操作位置保持固定。封面改用现有真实Aquarium渲染canvas的干净截图，不含旧poster嵌入的控件；生成脚本一并保存。
- 三个入口图案添加原创径向SVG位移场，随阻尼弹簧在指针附近局部鼓起/回弹；过滤器只作用于图案，普通HTML链接/标题固定。对照截图关闭整体transform后仍有像素变化；触屏/减少动态绕过装饰过滤。没有新运行依赖、实验浏览器API或复制展示站素材。
- 新布局/封面/局部形变用例均先观察失败后通过。自查截图修复封面双重透视的横向溢出；一次独立最终审查又发现打开后纸页同类问题，无Critical/Minor。新增宽度回归在1440px复现scrollWidth1472，单次修复移除重复父级perspective后，320/390/768/1024/1440全部通过。审查另核对投影与Three.js差异在浮点误差范围、弹簧停止/离开/减少动态重置及清理逻辑。
- 最后一次目标浏览器3/3、单元28/28、录音完整性/TypeScript/生产构建通过；最终desktop普通动态Program宽度1440/1440。已查看修正后的桌面水池/节目单、触屏水池/封面与局部形变前后截图。Three.js约619.74kB的大包提示仍存在。最终冻结构建的19组整站回归及发布结果随后记录；未实测实体手机GPU、读屏或儿童学习效果。
- 最终完整`QA_BASE_URL=http://127.0.0.1:4173 QA_DB_PATH=.tmp/refine/preview.sqlite npm run test:browser`退出0，19组脚本全部通过；运行时源码/构建全程不变。包含录音、三独立房间/Program、六宽度/短屏、键盘/滚动、上下文丢失、真实本地匿名反馈，以及Web Audio实测、池音符分离命中、Program稳定操作和新增三项可见改动回归。本地数据库与截图未上传，线上发布另行记录。

### 第12版公开发布

- Sites第12版已发布，保持public范围；原生状态`succeeded`，时间2026-11-14T14:03:03.058385Z（北京时间22:03）。公开网址不变：https://maestromate-aquarium.chirpyapple14.chatgpt.site 。交付加`?v=12`的水池`#play/pool`、节目单`#program`及入口`#explore`直达链接，避免只展示水池或旧标签页未重新加载。
- GitHub运行源码：`125656c852fef9f270e52fc69fc6423378d9ac50`；Sites根目录源码：`54d79083908d4cc42855ca97e8bf630a5ca4709b`。源准备工具核对远端SHA后打包2,349,673 bytes；原生接收归档32项，内容hash`sha256:b27829231e8ed420a1717173e522068b4463bcc92cc407383b6162414b29caba`。
- 版本：`appgprj_6af14ade2f2c8191825208668540e338~appgver_df7cd9c863748191bc7e5d08269ab6bc`；部署：`appgdep_6af86a1030b08191977b187b4602013e`。
- 发布后原生数据库overview仍返回`DB`、`feedback`、`feedback_sessions`，未读取真实反馈内容。公开GET复查仍被云端代理以CONNECT403拦截（HTTP000），不等同于用户浏览器不可访问；上线依据原生成功结果，本地浏览器验证与线上直连复核分开报告。
- PR2标题/说明已更新，保留草稿、未合并。附加现有PR与打开版本12节目单的RPC均返回`connection closed`，未宣称已替用户打开。发布后只补充文档记录，不改变运行代码；保留源目录/历史与项目内QA资料，仅停止本轮启动的Worker预览。

## 2026-11-17：零基础学习路径（Chat保留现状）

- Play新增独立`#play/learn`及Program内`#program/aquarium/learn`，三层分别为音高走向、乐句回归、改变结尾的变奏。每层明确目标/演示/问题/反馈，允许回听、重试及自由切换；第三层接纳C/D/E三个成立的结尾，不把音乐审美判断为对错。原音乐侦探与五音水池仍可进入。
- 使用现有PoolAudio产生原创练习音，不声称为《水族馆》录音或完整曲式分析。状态保存在App，在同次访问切换间保留；刷新和显式Program重启重置。Program继续入口进入学习路径，结束回顾以实际成功检查为准，绕过步骤不会显示已掌握。
- 聆听页增加可选的三条发现提示与固定录音回听/来源，观景窗边缘保持既有风格。Dialog使用唯一audio元素，切换主题/关闭时暂停并返回焦点。新资料研究区分1886作品背景、原谱/配器、乐评意象、录音制作版本和原创教学示例，未伪造演奏者访谈。水池增加可选变奏任务，明确标记替换八格的起始音；反馈提示询问理解/操作困难并提醒不填写身份信息，无schema/采集范围变动。
- Chat组件、预设问题/回复、自由输入关闭及未接AI的状态均保留，仅全站Program下一步改为新Play路径。无新依赖、账户或永久学习记录。
- 模型用例先因缺少模块失败，再通过；全体单元30/30、素材完整性/TypeScript/生产构建通过。一次独立审查发现延迟音频授权覆盖新答案：浏览器延迟resume先复现丢失答案，最新状态合并修复后通过。反馈措辞更正为低于原始G，返回Program定位到节目单。
- 新浏览器四组专项通过：错误/正确/多解创作反馈、跨路线保留与真实总结；1440×900/1366×600/390×844各层揭晓后控件布局；唯一录音回听/关闭暂停/焦点；延迟音频授权不覆盖答案。实际截图已查看。揭晓后短屏重叠先复现，精简局部短屏装饰尺寸后确认反馈留在卡内且不碰导航。整站最终20组回归及发布另记。没有实体儿童试用、实体手机GPU或真实读屏结果。
- 最终完整`QA_BASE_URL=http://127.0.0.1:4173 QA_DB_PATH=.tmp/learning/preview.sqlite npm run test:browser`退出0，20组脚本全部通过；最后运行期间运行源码和构建未变。新增学习脚本5/5，含水池任务实际加载八格/改第八音及Program返回入口。其余19组保留真实录音/Web Audio、旧三房间、六宽度、节目单/键盘/滚动/动态/上下文丢失和真实本地匿名反馈检查。没有把本地数据库上传。

### 第13版公开发布

- 原生Sites发布`succeeded`，第13版，时间2026-11-17T03:14:03.798333Z（北京时间11:14），保持public。网址：https://maestromate-aquarium.chirpyapple14.chatgpt.site ，新Play路径`?v=13#play/learn`。
- GitHub运行源码`8048b78df435076b6eee8679cd78840a19c8e026`；Sites源码`4bee7725f9f2908592b43105d7de41c31ef47f7b`。源准备工具核对远端SHA后压缩包2,355,008 bytes；原生归档32项，hash`sha256:30e948c47d6059418fd12fd305ff6dc70423824c5b333f4484e3169d7f169cca`。
- 版本`appgprj_6af14ade2f2c8191825208668540e338~appgver_58823b0c95c881918fc11622a753d4c8`；部署`appgdep_6afbc67409608191a52571d4eb0c4498`。
- 发布后overview确认DB仍有feedback/feedback_sessions，未读取真实内容。公开GET仍被环境代理CONNECT403拦截/HTTP000；上线依据原生成功结果，本地浏览器验证与生产直连复核分开说明。浏览器及附加PR的RPC返回connection closed，交付直接链接，不宣称已替用户打开。
- PR2标题/说明已更新并保留草稿，未合并。发布后提交仅含记录；保留研究、旧稿和Git历史，QA/本地数据库均留在忽略目录。本轮拥有的Worker预览停止。

## 2026-11-17：作品专属Play、12个互动与小鱼水池

- 根据用户五项反馈替换通用三题入口：Play先选作品，《水族馆》有易/中/难各4个游戏。含原曲层次/结尾比较、作曲家/年代、准确片段匹配、声部收集、创作历史排序、原谱乐器收集、变奏编辑、重复节奏、自创回归明信片和事实/想象辨别。题目/来源/规则与界面分开，未接作品不能暗中使用《水族馆》素材。
- 题面缩为标题/单句目标，以大图形、收集态、填卡、音符弹出选板与灯光节拍引导；选图立即反馈，其他任务用近处动作按钮。首次提示与成功后的Next浮现；解释/来源收进线索dialog。12题均实际操作完成，进度逐作品逐题保留；Program重启重置，回顾按真实正确结果统计。
- 水池删除实体盆底/torus外圈及shader边缘高亮，半径3.5→3.8，柔和透明边缘，解析波面法线替代三角面强反光。可点/划水面绘制旋律；小鱼接龙为3/4/5音，错误给灯光提示，不擦除已有旋律；返回自由模式继续编辑。播放可选长度仅缩短接龙尾部空拍，原八步回放保持默认。
- 单次独立审查：继承constructor的未注册作品路径会崩溃、同作品难度URL未更新。分别新增模型/浏览器失败回归后修复为无原型注册表和按级别挂载；后者按用户导航影响升级为Important，均修正，无延后项。还复现并修正Try it未保存checked、1024px反馈微重叠及接龙空尾等待。
-35项单元、录音完整性/TypeScript/构建通过；7组新浏览器契约通过，覆盖全12题、揭晓后1366×600/1024×768及320/390布局、唯一MP3/Guide/线索关闭、难度URL/历史/非法作品、小鱼接龙/旋律保留/Guide取消、延迟音频授权不能在切换后复活。截图实际查看。最终全20组回归/发布另记；Chat、AI关闭、录音文件、依赖和反馈schema均未改。
- 完整`QA_BASE_URL=http://127.0.0.1:4173 QA_DB_PATH=.tmp/workshop/preview.sqlite npm run test:browser`退出0，全20组脚本通过；运行期间运行源码/构建冻结。旧Play首页标题断言按已批准的新入口更新为“Stay in the music.”，没有删除导航行为检查。
- 此后组合操作补充发现：接龙模式下加载旧变奏起始音，仍停留idle，八格不可编辑。第8项新回归先失败`idle !== free`；起始音加载时显式调用echo.free单点修复。重建后的最终版本以35项单元、作品专项8项及原水池浏览器4项复核；其余整站代码未改，完整20组结果与这轮局部复核分开记录。
- 组合修正后的最终复核已退出0：单元35/35、作品专项8/8、原水池浏览器4/4，包含真实Web Audio输出/静音/释放、动态冻结、上下文丢失回退。复核后运行源码/构建未改。已查看作品入口、三档题面、回答后的短屏/手机与柔边水池截图；实体儿童/手机GPU尚无实测。

### 第14版公开发布

- 原生Sites发布`succeeded`，第14版，时间2026-11-17T04:02:42.710869Z（北京时间12:02），public范围不变。公开网址：https://maestromate-aquarium.chirpyapple14.chatgpt.site ，交付`?v=14#play`与`?v=14#play/pool`，带版本查询触发旧标签页重新加载。
- GitHub运行源码`66dc3e5eb7e5572d76d80957f4afee77fcca3ec6`；Sites源码`3d0de0fd096061ff7abef0074e0fe5bc0dfdeb2a`。准备工具核对远端SHA后压缩包2,365,028 bytes；原生归档32项，hash`sha256:314697661d06056e9ad0df20a422092281f00529b44f7f2f4e9d7656ddd47d5b`。
- 版本`appgprj_6af14ade2f2c8191825208668540e338~appgver_e2eae095e7e08191a93928878aa94e95`；部署`appgdep_6afbd1dba20c819190f566416a59ea0c`。
- 发布后D1 overview仍有DB/feedback/feedback_sessions，没有读取真实反馈内容。公开GET仍被代理CONNECT403拦截（HTTP000）；依据原生成功确认发布，本地浏览器检查与生产直连复核区分记录。
- PR2说明已更新，保持草稿未合并。打开页面/附加PR的RPC返回connection closed，未宣称已替用户打开。发布后仅提交记录，不改变运行代码。源文件、研究旧稿与Git历史保留，本轮Worker预览停止；临时QA数据留在忽略目录。

## 2026-11-24：Play 学习路径与离线知识层（API 暂缓）

- 保留已认可的首页、黑底和 cyan/rose/amber/lavender 配色。Play 入口改为作品探索／乐理课／创作应用，六个单元分别拆成 Learn、两次 Try、Make；原十二题工作坊不再作为主导航。旧学习链接映射到新作品单元。
- 新增可操控的音高／音量、声部、节奏和重复变化示范；声音色彩有合成对照。原谱乐器、真实录音全混音片段和原创教学声音分别标注。创作完成后可把八格草稿送入现有无描边水池。
- Chat 为十个预设问题、始终可读的问题横栏、逐条来源和本地知识架。明确显示 AI 尚未接入；无自由输入、密钥、模型调用、新后端或新增用户数据采集。资料与界面分开存储，不能声称已建成 AI 检索数据库。
- 39 项单元测试通过；真实 MP3 校验、TypeScript、生产构建通过。编译保留已有 Three.js 延迟加载大包提示（约620kB，gzip156kB），本轮未新增运行依赖。
- 新增 8 组真实 Chromium 测试通过：六单元完整学练创作、错误重试、来源焦点、主入口与旧链接、无 API 请求、进度及 Program 重置、八格草稿转入水池、录音与延迟合成中断、1366×600 的所有创作成功态操作分离，以及1024×768、390/320px基本布局。
- 新测试先在旧界面失败。补充复现并修复：Node 源文件重导出缺少扩展名；创作成功态在短屏溢出；关闭伴奏仍误计双声部任务完成；基线 hover 把彩色主按钮文字染成同色。前景／背景通过实际浏览器颜色归一化检查，不能只比较颜色字符串。
- 实际查看桌面、短屏、手机及 Chat 截图，临时截图/测试输出保存在忽略的 `.tmp/nov24/`。手机保留可读纵向结构；没有声称完成实体手机 GPU 或儿童教育效果验证。
- 旧 Detective 布局测试转到独立入口；Chat 来源计数限定来源区域，题目分类数量按新资料计算。保留鱼群记忆、水池声学/取消、反馈、首页/音乐厅等原契约，完整回归结果和发布来源随后记录。

### 最终审查与回归

- 一次独立只读审查提出4项重要问题，均在本轮修复：作品/区域/单元联合校验；Program 中 Listen/Chat 的知识入口保留 journey；创作必须有实际选音、节奏安排或完成两种音色对照，且音色/伴奏选择随草稿保留；重复与节奏示范的画面必须与音频一致。另同步补齐 Program Play 的到访标记及录音按钮的 Full mix 标注。
- 专门新增的4组回归先在旧行为失败，修复后4/4通过。两项原谱/示范声音不会混用；非法旧作品名和跨区域单元均显示不可用。两种音色必须都听完才完成该应用；仅取消或未改的空草稿不会计数。
- 修复后完整39项单元测试、MP3校验、TypeScript和生产构建再次通过。8组课程契约中7组在审查修复版本通过；剩余录音中断检查发现新增 Full mix 文案改变按钮的无障碍名称，补上稳定名称和补充描述后单独通过。4组审查回归均通过；未将旧版浏览器结果冒充最终版本的全量单次运行。
- 原20个浏览器脚本已分批覆盖并通过：前5组见 `.tmp/nov24/browser-full3.log`；refinements、rooms、entry 见 `browser-remaining.log`；后12组见 `remaining-final-cwd.log`。覆盖真实录音、键盘、首页停靠、motion/显卡失效、匿名反馈持久化、水池声学/布局/鱼群回声及节目册。保留对应构建阶段差异；审查后仅补稳定录音按钮名称，相关检查已复跑。
- 最终模板与运行依赖、音频/图像/3D素材、数据库schema和公开访问范围均沿用现有版本。GitHub/Sites发布来源在下一节记录。

### v15 公开发布

- 公开网址：https://maestromate-aquarium.chirpyapple14.chatgpt.site/#play
- 2026-11-24，Sites第15版，沿用 public，原生部署状态 `succeeded`；完成时间 `2026-11-24T10:57:32.155710Z`。
- GitHub运行代码提交：`105c652456bc9c5ba6563a5e4830b02f911f7a1b`，已核对远端 `feat/aquarium-demo` 同一SHA。
- Sites根目录源码提交：`83dbfb43716d84547dea08b37806ce59ebb346de`，由上述GitHub提交的 `web/` 子树封装。
- 保存版本：`appgprj_6af14ade2f2c8191825208668540e338~appgver_1578b6d033008191be3ea7ad9cd9520b`。
- 部署：`appgdep_6b056d9589248191aa43940fd8e70f6a`。构建包上传成功，32个条目；无环境变量/API密钥修订，`env_set_revision: 0`。
- 发布前最后一轮39项单元测试、生产构建和稳定录音按钮名称/音频中断检查通过。公开上线由原生Sites返回结果确认；没有将本地浏览器检查写成公网浏览器验收。后续仅增加本段发布记录和完成标记，不改变运行代码。

## 2026-11-25 — Grounded Qwen Chat and independent Play paths (source iteration17)

- Existing English black/cyan/rose/amber/lavender baseline retained. Six Aquarium discoveries, eight ordered general lessons, and three independent creative destinations. Three checks per learning unit: picture choices, tap-to-order and build-a-rhythm; Learn → Try → Complete without forced creation. Fixed local/browser Back, full ordered Program traversal, independent progress/drafts, finite success effects and reduced-motion state.
- Server-only Alibaba Model Studio Qwen Plus and Flash; opt-in disclosure, retained prompt rail and fictional persona, bounded retrieved notes and validated citation IDs, local privacy guidance, explicit errors/retry/prepared fallback, cancellation and visit-local transcript. Private D1 migrations store quota metadata only. 100 site-wide attempted generations/rolling24h, 20/session/hour,2.5s spacing and450 output tokens. No browser credential, stored transcript or public database-read endpoint.
- `npm test`:63/63 passing. `npm run build`:passing, local MP3 integrity and TypeScript included. Existing Three chunk warning remains (~620kB uncompressed, lazy shared renderer); no new runtime package.
- Targeted `node --test tests/curriculum-browser.mjs tests/curriculum-review.mjs tests/chat-browser.mjs`:18/18 passed. Covers42 check solutions,6-unit normal Program, unearned completion and wrong-work routes, true parent and mixed Back, isolated general progress on restart, actual tempo scheduling/draft persistence,600px desktop/mobile controls, sources/focus, reduced motion, AI opt-in/errors/sources/history/reset. Updated v15 UI tests to the explicitly revised flow; older creative evaluator remains tested as archived code.
- Two fresh scope reviews (Chat then latest Play revision) found material regressions; all reproduced and fixed. No outstanding important findings. Real Cloud business-handler calls: Plus biography and visual-origin question, Flash original instrumentation, all200 with allowed sources. Real browser→Worker→Qwen conversation on Fauré returned biography source. These are integration checks, not proof that every model response is accurate or that children learn effectively.
- User-applied direct runtime key authenticated200 against the exact Beijing workspace. Sites Secret revision1 configured; production test and final deployment provenance recorded below after publication. No secrets are part of Git/source/archive.

Final regression update: the legacy browser command passed answer layout, celebration, clarity, workspace, upgrade and refinements, then stopped on the former Program entry title in `rooms.mjs` (it expected the old fourth discovery). Updated that contract to require the first ordered work unit; rooms then passed. Remaining unchanged browser scripts are being run in the continuation batch against the same build. Do not describe the stopped single command as fully green. Native Sites saved source50560213959ce78f8dd9fd82e3d7d118ea76e752 as an unpublished version16; final publication uses the subsequent source with the corrected test expectation.
