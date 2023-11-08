---
index: true
order: 1
title: 快速开始 - 创建项目
icon: /assets/icon/init.png
isOriginal: true
tag:
  - Spring
  - Spring Security
---

# 初始化项目
本文使用IntelliJ IDEA 2023.2.2，Spring Boot 3以及Spring Security6作为示例。

## 创建项目

### 1 填写项目属性

![填写项目属性](https://fs.jayczee.top:1212/img/Security6-1-1.png)
::: danger
SpringSecurity6需要SpringBoot3以上的版本。
:::

### 2 选择依赖

![选择项目依赖 (此处选择Spring Security即可,也可以先创建项目然后再在maven中引入)](https://fs.jayczee.top:1212/img/Security6-1-2.png)

### 3 完成创建
在上一步点击`create`后，需要等待maven下载依赖以及IDEA索引完成（一般都是自动的）。

![创建完成后的项目文件结构](https://fs.jayczee.top:1212/img/initDone.png)

![创建完成后的pom依赖](https://fs.jayczee.top:1212/img/initPom.png)

### 4 添加额外依赖
在`pom.xml`中添加额外依赖,没指定版本的spring系依赖会跟随SpringBoot的版本，这里使用的是SpringBoot3.0.12:
```xml
<dependencies>
<!--...dependency above    -->
    <!--        Spring Web-->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <!--        连接MySQL-->
    <dependency>
        <groupId>com.mysql</groupId>
        <artifactId>mysql-connector-j</artifactId>
        <version>8.0.33</version>
        <scope>runtime</scope>
    </dependency>
    <!--        MyBatis Plus-->
    <dependency>
        <groupId>com.baomidou</groupId>
        <artifactId>mybatis-plus-boot-starter</artifactId>
        <version>3.5.3.1</version>
    </dependency>
    <!--        Swagger增强-->
    <dependency>
        <groupId>com.github.xiaoymin</groupId>
        <artifactId>knife4j-openapi3-jakarta-spring-boot-starter</artifactId>
        <version>4.1.0</version>
    </dependency>
</dependencies>
```

### 5 添加项目配置
在`application.yml`中添加项目配置:
```yaml
# Port
server:
  port: 11212
# Data Source
spring:
    datasource:
        driver-class-name: com.mysql.cj.jdbc.Driver
        url: jdbc:mysql://192.168.10.229:3306/security_demo?useUnicode=true&characterEncoding=utf-8&useSSL=false
        username: root
        password: jhkd5960795
        hikari:
            minimum-idle: 5
            maximum-pool-size: 10
            auto-commit: true
            idle-timeout: 30000
            pool-name: DatebookHikariCP
            max-lifetime: 1800000
            connection-timeout: 30000
            connection-test-query: SELECT 1
            validation-timeout: 5000
            leak-detection-threshold: 60000
            initialization-fail-timeout: 1

# SpringDoc OpenAPI
springdoc:
    swagger-ui:
        path: /swagger-ui.html
    api-docs:
        path: /v3/api-docs
    group-configs:
        - group: 'default'
          paths-to-match: '/**'
          packages-to-scan: 'top.jayczee.securitydemo'

# Doc Enhance
knife4j:
    enable: true
    setting:
        language: zh_cn
```
### 6 测试项目
在启动类`SecurityDemoApplication`同级目录下创建controller文件夹，然后在其中创建`TestController`:
```java
package top.jayczee.securitydemo.controller;

import io.swagger.v3.oas.annotations.Operation;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class TestController {
    @Operation(summary = "Test security")
    @GetMapping("/test.json")
    public String test() {
        return "test";
    }
}
```
然后启动项目，访问`http://localhost:11212/doc.html`，可以看到如下界面: 

![测试项目后访问文档会先进入登录页面](https://fs.jayczee.top:1212/img/defaultLogin.png) 

此时返回IDEA，可以看到控制台输出了如下信息(密码每次启动都会变化): 

```text
Using generated security password: aa5307c5-70d9-4f13-b0f9-f409f3f50620

This generated password is for development use only. Your security configuration must be updated before running your application in production.
```

在Spring Security进行初始化时，会生成一个随机密码，用于测试登录。

此处使用***默认用户名***`user`和***默认密码***`aa5307c5-70d9-4f13-b0f9-f409f3f50620`登录后，可以看到如下界面: 

![登录后的文档界面](https://fs.jayczee.top:1212/img/initDoc.png)

至此，配置Spring Security之前的准备工作已经完成了。