# 截图节点展示功能 - 本地调试与使用

------

请先安装 **node.js** 与 **npm** 最新版本，安装后将代码复制带本地目录Dir下。

命名行进入 app-inspector 目录:

## 编译

```shell
app-inspector$ npm run build
```

## 运行

```shell
app-inspector$ npm run start
```
或者
```shell
app-inspector$ ./bin/app-inspector -s --verbose
```

出现如下打印信息，则启动成功：
```shell

>> inspector start at: http://localhost:port
```
 `localhost`为本地IP地址；`port`为端口号，默认5678.
 
## 截图节点数据的存放目录

截图节点数据的存放也位于本地目录Dir下。例如：

    - /Users/limeng/        （本地目录Dir）
        |_ app-inspector/    (代码目录)
        |_ G2017020903/      (数据目录: 构建编号)
            |_ 1/ 
                |_ appInspector/
                    |_ screenshot.png
                    |_ sourcenode.txt
            |_ 2/ 
                |_ appInspector/
                    |_ screenshot.png
                    |_ sourcenode.txt
        |_ G2017020904/ 
            |_ 1/ 
                |_ appInspector/
                    |_ screenshot.png
                    |_ sourcenode.txt

数据目录下存在截图节点数据后，浏览器访问URL链接展示截图节点信息：

    http://localhost:5678/构建编号/case序号

例如：

    http://localhost:5678/G2017020903/1
    http://localhost:5678/G2017020903/2
    http://localhost:5678/G2017020904/1

