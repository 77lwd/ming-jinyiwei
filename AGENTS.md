# 项目协作约定

## GitHub 更新与版本号

- 只有游戏内容、玩法、素材或功能更新才递增版本号，并附上中文更新说明；纯文档维护不改变游戏版本号。
- 第二章阶段使用 `0.2.x`：从 `0.2.0` 起，下一次更新是 `0.2.1`，再下一次是 `0.2.2`，依次递增。
- 第三章正式进入发布内容时才升级为 `0.3.0`，后续第四章、第五章同理；新增第二章案件或修复图片不提升章节位。
- 同一批推送包含多个本地提交时只升级一次；推送失败后重试不重复升级。平时本地编辑先记入待发布记录，在准备推送时统一定版。
- 游戏内容更新推送前同步 `package.json`、`package-lock.json` 的项目版本、README 版本与更新摘要、`CHANGELOG.md`；纯文档维护不修改项目版本号。不要修改依赖版本来凑版本号。
- 更新说明必须用中文，按版本倒序保留历史，写明具体新增、优化和修复，以及对玩家的影响；不得只写“修复问题”“优化体验”。
- 提交说明、PR 或 GitHub Release 的标题与说明如用于本次发布，也应使用中文，并与该版本更新日志一致。代码标识、命令、素材名可保留原文。
- 完整规则及说明格式见 [开发工作流：GitHub 更新与版本发布](docs/development-workflow.md#github-更新与版本发布)。只有实际推送成功后才能报告“已推送”；设置这套规则本身不代表用户要求立即推送。

<!-- codebase-memory-mcp:start -->
# Codebase Knowledge Graph (codebase-memory-mcp)

This project uses codebase-memory-mcp to maintain a knowledge graph of the codebase.
ALWAYS prefer MCP graph tools over grep/glob/file-search for code discovery.

## Priority Order
1. `search_graph` — find functions, classes, routes, variables by pattern
2. `trace_path` — trace who calls a function or what it calls
3. `get_code_snippet` — read specific function/class source code
4. `query_graph` — run Cypher queries for complex patterns
5. `get_architecture` — high-level project summary

## When to fall back to grep/glob
- Searching for string literals, error messages, config values
- Searching non-code files (Dockerfiles, shell scripts, configs)
- When MCP tools return insufficient results or are unavailable

## Examples
- Find a handler: `search_graph(name_pattern=".*OrderHandler.*")`
- Who calls it: `trace_path(function_name="OrderHandler", direction="inbound")`
- Read source: `get_code_snippet(qualified_name="pkg/orders.OrderHandler")`
<!-- codebase-memory-mcp:end -->
