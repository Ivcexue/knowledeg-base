## 介绍
项目使用 TypeScript + Express + Qdrant + Docker + 阿里云百炼 构建了一个知识图谱服务。

> 启动项目之前需要注册阿里云百炼账号，并获取API_KEY，然后修改.env文件中的DASHSCOPE_API_KEY
> .env文件 位于项目根目录下，是一个配置文件，包含了项目运行所需的环境变量。

**项目启动方法**

```shell
# 安装依赖
npm install
# 编译
npm run build
# 插入测试数据
npm run mock
# 启动服务
npm run start
```

#### Qdrant数据库安装

```
使用Docker安装Qdrant数据库
docker pull qdrant/qdrant

docker run -d -p 6333:6333 -p 8080:8080 qdrant/qdrant

参数说明：

-d：后台运行容器

-p 6333:6333：将容器的6333端口映射到主机的6333端口

-p 8080:8080：将容器的8080端口映射到主机的8080端口

qdrant/qdrant：使用最新版本的Qdrant镜像

安装完成后，可以通过http://localhost:8080 访问Qdrant的管理界面。

```